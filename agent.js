// RevOps Diagnostic Agent — core diagnostic logic

const fs = require('fs');
const path = require('path');
const benchmarksData = require('./benchmarks.json');
const { formatCurrency, formatPercent, avg, daysBetween } = require('./utils');

const STAGE_ORDER = ['lead', 'qualified_opportunity', 'proposal', 'due_diligence', 'negotiation'];

// Calculate win rate by stage: among closed deals that reached this stage,
// what fraction ended up won. Open deals are excluded since their outcome
// isn't known yet.
function getStageWinRate(deals, stage) {
  const reached = deals.filter(d => d.outcome !== 'open' && d.stages_reached.includes(stage));
  const reachedAndWon = reached.filter(d => d.outcome === 'won');
  return reached.length ? reachedAndWon.length / reached.length : 0;
}

function calculateMetrics(deals) {
  const closed = deals.filter(d => d.outcome !== 'open');
  const won = deals.filter(d => d.outcome === 'won');

  const conversionRate = closed.length ? won.length / closed.length : 0;
  const salesCycleDays = won.length
    ? avg(won.map(d => daysBetween(d.created_date, d.closed_date)))
    : 0;
  const avgDealSize = won.length ? avg(won.map(d => d.amount)) : 0;

  const stageWinRates = {};
  for (const stage of STAGE_ORDER) {
    stageWinRates[stage] = getStageWinRate(deals, stage);
  }

  return {
    dealCount: deals.length,
    openDealCount: deals.filter(d => d.outcome === 'open').length,
    conversionRate,
    salesCycleDays,
    avgDealSize,
    stageWinRates
  };
}

// Compare calculated metrics to a benchmark set, returning only the gaps
// where the pipeline underperforms.
function compareToBenchmarks(metrics, benchmark) {
  const gaps = [];

  if (metrics.conversionRate < benchmark.conversion_rate) {
    gaps.push({
      type: 'conversion_rate',
      label: 'Overall Conversion Rate',
      actual: metrics.conversionRate,
      benchmark: benchmark.conversion_rate
    });
  }

  if (metrics.salesCycleDays > benchmark.sales_cycle_days) {
    gaps.push({
      type: 'sales_cycle_days',
      label: 'Sales Cycle Length',
      actual: metrics.salesCycleDays,
      benchmark: benchmark.sales_cycle_days
    });
  }

  if (metrics.avgDealSize < benchmark.avg_deal_size) {
    gaps.push({
      type: 'avg_deal_size',
      label: 'Average Contract Value',
      actual: metrics.avgDealSize,
      benchmark: benchmark.avg_deal_size
    });
  }

  for (const stage of STAGE_ORDER) {
    const actual = metrics.stageWinRates[stage];
    const stageBenchmark = benchmark.stage_benchmarks[stage];
    if (actual < stageBenchmark) {
      gaps.push({
        type: `stage:${stage}`,
        label: `${benchmark.stage_names[stage]} Win Rate`,
        actual,
        benchmark: stageBenchmark
      });
    }
  }

  return gaps;
}

// Sales velocity: how much revenue the pipeline produces per day.
// velocity = (opportunities * win rate * avg deal size) / sales cycle length
function salesVelocity(opportunityCount, winRate, avgDealSize, cycleDays) {
  return cycleDays ? (opportunityCount * winRate * avgDealSize) / cycleDays : 0;
}

// Rank the 3 top-line revenue levers (conversion rate, sales cycle,
// average deal size) by the annual revenue uplift from closing each gap
// to benchmark, holding the other two metrics constant.
function rankLevers(metrics, benchmark) {
  const { dealCount, conversionRate, salesCycleDays, avgDealSize } = metrics;
  const baseline = salesVelocity(dealCount, conversionRate, avgDealSize, salesCycleDays);

  const candidates = [
    {
      type: 'conversion_rate',
      label: 'Improve Conversion Rate',
      recommendation: `Lift conversion rate from ${formatPercent(conversionRate)} to the ${formatPercent(benchmark.conversion_rate)} benchmark`,
      velocity: salesVelocity(dealCount, benchmark.conversion_rate, avgDealSize, salesCycleDays)
    },
    {
      type: 'sales_cycle_days',
      label: 'Compress Sales Cycle',
      recommendation: `Cut sales cycle from ${Math.round(salesCycleDays)} to ${benchmark.sales_cycle_days} days`,
      velocity: salesVelocity(dealCount, conversionRate, avgDealSize, benchmark.sales_cycle_days)
    },
    {
      type: 'avg_deal_size',
      label: 'Increase Average Contract Value',
      recommendation: `Raise average deal size from ${formatCurrency(avgDealSize)} to ${formatCurrency(benchmark.avg_deal_size)}`,
      velocity: salesVelocity(dealCount, conversionRate, benchmark.avg_deal_size, salesCycleDays)
    }
  ];

  return candidates
    .map(c => ({ ...c, annualImpact: (c.velocity - baseline) * 365 }))
    .filter(c => c.annualImpact > 0)
    .sort((a, b) => b.annualImpact - a.annualImpact);
}

function generateReport(deals, benchmarkKey = 'b2b_fintech') {
  const benchmark = benchmarksData[benchmarkKey];
  if (!benchmark) {
    throw new Error(`Unknown benchmark set: ${benchmarkKey}`);
  }

  const metrics = calculateMetrics(deals);
  const gaps = compareToBenchmarks(metrics, benchmark);
  const levers = rankLevers(metrics, benchmark).slice(0, 3);

  return { metrics, gaps, levers };
}

function printReport({ metrics, gaps, levers }) {
  console.log('=== RevOps Diagnostic Report ===\n');

  console.log('Pipeline Metrics');
  console.log(`  Deals analyzed:     ${metrics.dealCount} (${metrics.openDealCount} open)`);
  console.log(`  Conversion rate:    ${formatPercent(metrics.conversionRate)}`);
  console.log(`  Sales cycle:        ${Math.round(metrics.salesCycleDays)} days`);
  console.log(`  Avg deal size:      ${formatCurrency(metrics.avgDealSize)}`);

  console.log('\nGaps vs. Benchmark');
  if (!gaps.length) {
    console.log('  None — pipeline is at or above benchmark on every metric.');
  } else {
    for (const gap of gaps) {
      const format = gap.type === 'sales_cycle_days'
        ? v => `${Math.round(v)} days`
        : gap.type === 'avg_deal_size'
          ? formatCurrency
          : formatPercent;
      console.log(`  ${gap.label}: ${format(gap.actual)} vs. ${format(gap.benchmark)} benchmark`);
    }
  }

  console.log('\nTop Revenue Levers');
  if (!levers.length) {
    console.log('  None — no lever produces a positive revenue uplift.');
  } else {
    levers.forEach((lever, i) => {
      console.log(`  ${i + 1}. ${lever.label} — ${formatCurrency(lever.annualImpact)}/yr uplift`);
      console.log(`     ${lever.recommendation}`);
    });
  }
}

function main() {
  const dealsPath = process.argv[2] || path.join(__dirname, 'sample-deals.json');
  const deals = JSON.parse(fs.readFileSync(dealsPath, 'utf8'));
  printReport(generateReport(deals));
}

if (require.main === module) {
  main();
}

module.exports = { calculateMetrics, compareToBenchmarks, rankLevers, generateReport, getStageWinRate };
