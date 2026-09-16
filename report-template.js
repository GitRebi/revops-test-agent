// Renders the diagnostic report as a standalone, styleable HTML dashboard.

function renderReportHtml(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RevOps Diagnostic</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
  :root {
    color-scheme: light;
    --page: #F7F7F5;
    --surface: #FFFFFF;
    --surface-alt: #FBFBFA;
    --ink: #0B0B0B;
    --ink-2: #52514E;
    --ink-muted: #898781;
    --border: rgba(11,11,11,0.10);
    --grid: #E1E0D9;
    --axis: #C3C2B7;
    --accent: #2A78D6;
    --good: #0CA30C;
    --warning: #FAB219;
    --warning-ink: #7A5300;
    --serious: #EC835A;
    --serious-ink: #8A3D1D;
    --critical: #D03B3B;
    --delta-good: #006300;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      color-scheme: dark;
      --page: #0D0D0D;
      --surface: #171614;
      --surface-alt: #1B1A17;
      --ink: #FFFFFF;
      --ink-2: #C3C2B7;
      --ink-muted: #898781;
      --border: rgba(255,255,255,0.10);
      --grid: #2C2C2A;
      --axis: #383835;
      --accent: #3987E5;
      --good: #0CA30C;
      --warning: #FAB219;
      --warning-ink: #FAB219;
      --serious: #EC835A;
      --serious-ink: #EC835A;
      --critical: #D03B3B;
      --delta-good: #0CA30C;
    }
  }
  :root[data-theme="dark"] {
    color-scheme: dark;
    --page: #0D0D0D;
    --surface: #171614;
    --surface-alt: #1B1A17;
    --ink: #FFFFFF;
    --ink-2: #C3C2B7;
    --ink-muted: #898781;
    --border: rgba(255,255,255,0.10);
    --grid: #2C2C2A;
    --axis: #383835;
    --accent: #3987E5;
    --good: #0CA30C;
    --warning: #FAB219;
    --warning-ink: #FAB219;
    --serious: #EC835A;
    --serious-ink: #EC835A;
    --critical: #D03B3B;
    --delta-good: #0CA30C;
  }

  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body {
    background: var(--page);
    color: var(--ink);
    font-family: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
    padding: 40px 20px 64px;
  }
  .wrap { max-width: 880px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; }

  .mono { font-family: "IBM Plex Mono", ui-monospace, "SF Mono", monospace; }
  .eyebrow {
    font-family: "IBM Plex Mono", monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--ink-muted);
  }
  h1 {
    font-size: clamp(28px, 4vw, 38px);
    font-weight: 700;
    letter-spacing: -0.01em;
    margin: 6px 0 0;
    text-wrap: balance;
  }
  h2 {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-2);
    margin: 0;
  }
  .lede {
    font-size: 15px;
    color: var(--ink-2);
    max-width: 60ch;
    line-height: 1.55;
    margin: 10px 0 0;
  }
  .lede b { color: var(--ink); font-weight: 600; }

  header { display: flex; flex-direction: column; gap: 4px; }
  .headline-row { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .source-note { font-size: 12px; color: var(--ink-muted); white-space: nowrap; }

  .key {
    display: flex; flex-wrap: wrap; gap: 18px;
    padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px;
    background: var(--surface-alt);
    font-size: 12.5px; color: var(--ink-2);
  }
  .key-item { display: flex; align-items: center; gap: 7px; white-space: nowrap; }
  .key-swatch { width: 14px; height: 8px; border-radius: 4px; background: var(--accent); flex: none; }
  .key-tick { width: 2px; height: 12px; background: var(--axis); flex: none; }
  .key-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }

  section { display: flex; flex-direction: column; gap: 14px; }
  .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 22px;
  }

  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; }
  .kpi {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 18px 20px 20px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .kpi-value { font-size: 30px; font-weight: 600; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }
  .kpi-target { font-size: 12.5px; color: var(--ink-muted); }
  .kpi-target b { color: var(--ink-2); font-weight: 500; }

  .track { position: relative; height: 10px; border-radius: 5px; background: var(--grid); }
  .fill { position: absolute; top: 0; left: 0; height: 100%; border-radius: 5px; background: var(--accent); transition: width 0.5s ease; }
  .tick { position: absolute; top: -3px; width: 2px; height: 16px; background: var(--axis); transform: translateX(-1px); }
  @media (prefers-reduced-motion: reduce) { .fill { transition: none; } }

  .bar-row {
    display: grid;
    grid-template-columns: 168px 1fr auto;
    align-items: center;
    column-gap: 18px;
    row-gap: 6px;
    padding: 10px 4px;
    border-top: 1px solid var(--grid);
    outline-offset: 4px;
  }
  .bar-row:first-child { border-top: none; }
  .bar-row:focus-visible { outline: 2px solid var(--accent); border-radius: 6px; }
  .bar-row .row-label { font-size: 13.5px; font-weight: 500; color: var(--ink); }
  .bar-row .row-meta { display: flex; align-items: baseline; gap: 8px; justify-content: flex-end; white-space: nowrap; }
  .row-actual { font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .row-target { font-size: 12px; color: var(--ink-muted); }

  @media (max-width: 560px) {
    .bar-row { grid-template-columns: 1fr; }
    .bar-row .row-meta { justify-content: space-between; }
  }

  .chip {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11.5px; font-weight: 600;
    padding: 3px 9px 3px 7px; border-radius: 100px;
    white-space: nowrap;
  }
  .chip .dot { width: 7px; height: 7px; border-radius: 50%; flex: none; }
  .chip.good { color: var(--good); background: color-mix(in oklab, var(--good) 14%, transparent); }
  .chip.good .dot { background: var(--good); }
  .chip.warning { color: var(--warning-ink); background: color-mix(in oklab, var(--warning) 22%, transparent); }
  .chip.warning .dot { background: var(--warning); }
  .chip.serious { color: var(--serious-ink); background: color-mix(in oklab, var(--serious) 20%, transparent); }
  .chip.serious .dot { background: var(--serious); }
  .chip.critical { color: var(--critical); background: color-mix(in oklab, var(--critical) 16%, transparent); }
  .chip.critical .dot { background: var(--critical); }

  .lever-list { display: flex; flex-direction: column; gap: 12px; }
  .lever {
    display: grid;
    grid-template-columns: 34px 1fr auto;
    column-gap: 16px;
    row-gap: 8px;
    align-items: start;
    padding: 16px 18px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
  }
  .lever-rank {
    font-family: "IBM Plex Mono", monospace;
    font-size: 15px; font-weight: 600; color: var(--ink-muted);
    line-height: 1.6;
  }
  .lever-title { font-size: 15px; font-weight: 600; }
  .lever-reco { font-size: 13px; color: var(--ink-2); margin-top: 3px; line-height: 1.5; }
  .lever-value { font-size: 18px; font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
  .lever-value .up { color: var(--delta-good); }
  .lever-value .unit { font-size: 11.5px; font-weight: 500; color: var(--ink-muted); }
  .lever-track { grid-column: 2 / 4; }

  @media (max-width: 560px) {
    .lever { grid-template-columns: 24px 1fr; }
    .lever-value { text-align: left; grid-column: 2; }
    .lever-track { grid-column: 1 / 3; }
  }

  details.table-view {
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    padding: 4px 0;
  }
  details.table-view summary {
    cursor: pointer;
    padding: 14px 20px;
    font-size: 13px;
    font-weight: 600;
    color: var(--ink-2);
    list-style: none;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  details.table-view summary::-webkit-details-marker { display: none; }
  details.table-view summary::before { content: "+"; font-family: "IBM Plex Mono", monospace; color: var(--ink-muted); }
  details.table-view[open] summary::before { content: "\\2212"; }
  .table-scroll { overflow-x: auto; padding: 0 20px 18px; }
  table { border-collapse: collapse; width: 100%; min-width: 480px; font-size: 13px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--grid); white-space: nowrap; }
  th { font-family: "IBM Plex Mono", monospace; font-size: 10.5px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-muted); font-weight: 500; }
  td.num { font-variant-numeric: tabular-nums; text-align: right; }
  th.num { text-align: right; }

  footer { font-size: 12px; color: var(--ink-muted); border-top: 1px solid var(--grid); padding-top: 16px; }

  #tooltip {
    position: fixed;
    pointer-events: none;
    background: var(--ink);
    color: var(--page);
    font-family: "IBM Plex Mono", monospace;
    font-size: 12px;
    padding: 7px 10px;
    border-radius: 6px;
    line-height: 1.5;
    opacity: 0;
    transform: translate(-50%, -100%);
    transition: opacity 0.12s ease;
    z-index: 10;
    white-space: nowrap;
  }
  @media (prefers-reduced-motion: reduce) { #tooltip { transition: none; } }
  #tooltip.visible { opacity: 1; }
</style>
</head>
<body>

<div class="wrap">
  <header>
    <div class="headline-row">
      <div>
        <div class="eyebrow">RevOps Diagnostic &middot; ${escapeHtml(data.benchmarkLabel)} Benchmark</div>
        <h1>Pipeline Diagnostic</h1>
      </div>
      <div class="source-note mono" id="source-note"></div>
    </div>
    <p class="lede" id="lede"></p>
  </header>

  <div class="key" id="key">
    <div class="key-item"><span class="key-swatch"></span>Actual performance</div>
    <div class="key-item"><span class="key-tick"></span>Benchmark target</div>
    <div class="key-item"><span class="key-dot" style="background:var(--good)"></span>On target</div>
    <div class="key-item"><span class="key-dot" style="background:var(--warning)"></span>Watch</div>
    <div class="key-item"><span class="key-dot" style="background:var(--serious)"></span>Serious gap</div>
    <div class="key-item"><span class="key-dot" style="background:var(--critical)"></span>Critical gap</div>
  </div>

  <section>
    <h2>Pipeline Metrics</h2>
    <div class="kpi-grid" id="kpi-grid"></div>
  </section>

  <section>
    <h2>Win Rate by Stage</h2>
    <div class="panel" id="funnel-panel"></div>
  </section>

  <section>
    <h2>Top Revenue Levers</h2>
    <div class="lever-list" id="lever-list"></div>
  </section>

  <details class="table-view">
    <summary>View full data table</summary>
    <div class="table-scroll" id="table-scroll"></div>
  </details>

  <footer id="footer"></footer>
</div>

<div id="tooltip" role="tooltip"></div>

<script>
  const REPORT = ${JSON.stringify(data)};

  const fmt = {
    pct: v => (v * 100).toFixed(1) + "%",
    days: v => Math.round(v) + " days",
    usd: v => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)
  };

  function ratioToBenchmark(actual, benchmark, higherIsBetter) {
    return higherIsBetter ? actual / benchmark : benchmark / actual;
  }

  function severity(ratio) {
    if (ratio >= 0.95) return { key: "good", label: "On Target" };
    if (ratio >= 0.80) return { key: "warning", label: "Watch" };
    if (ratio >= 0.60) return { key: "serious", label: "Serious Gap" };
    return { key: "critical", label: "Critical Gap" };
  }

  function chip(sev) {
    return \`<span class="chip \${sev.key}"><span class="dot"></span>\${sev.label}</span>\`;
  }

  function barTrack(actual, benchmark, scaleMax) {
    const actualPct = Math.min(100, (actual / scaleMax) * 100);
    const benchPct = Math.min(100, (benchmark / scaleMax) * 100);
    return \`<div class="track"><div class="fill" style="width:\${actualPct}%"></div><div class="tick" style="left:\${benchPct}%"></div></div>\`;
  }

  const tooltip = document.getElementById("tooltip");
  function attachTooltip(el, text) {
    el.addEventListener("mouseenter", e => showTip(text, e.clientX, e.clientY));
    el.addEventListener("mousemove", e => showTip(text, e.clientX, e.clientY));
    el.addEventListener("mouseleave", hideTip);
    el.addEventListener("focus", () => showTip(text, null, null, el));
    el.addEventListener("blur", hideTip);
  }
  function showTip(text, x, y, el) {
    tooltip.textContent = text;
    if (el) {
      const r = el.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top;
    }
    tooltip.style.left = x + "px";
    tooltip.style.top = (y - 10) + "px";
    tooltip.classList.add("visible");
  }
  function hideTip() { tooltip.classList.remove("visible"); }

  const closed = REPORT.dealCount - REPORT.openDealCount;
  document.getElementById("source-note").textContent = \`\${REPORT.dealCount} deals \\u00B7 \${REPORT.openDealCount} open\`;

  const allGapItems = [
    ...Object.values(REPORT.metrics).map(m => ({ ...m })),
    ...REPORT.stages.map(s => ({ actual: s.actual, benchmark: s.benchmark, higherIsBetter: true }))
  ];
  const gapCount = allGapItems.filter(m => ratioToBenchmark(m.actual, m.benchmark, m.higherIsBetter) < 0.95).length;
  const worst = REPORT.stages.reduce((a, b) => (ratioToBenchmark(a.actual, a.benchmark, true) < ratioToBenchmark(b.actual, b.benchmark, true) ? a : b));
  const worstRatio = ratioToBenchmark(worst.actual, worst.benchmark, true);
  document.getElementById("lede").innerHTML =
    \`<b>\${gapCount} of \${allGapItems.length} metrics</b> are running below the \${REPORT.benchmarkLabel} benchmark. \` +
    \`The steepest drop is at <b>\${worst.label}</b>, converting at just \${(worstRatio * 100).toFixed(0)}% of the benchmark rate.\`;

  const kpiGrid = document.getElementById("kpi-grid");
  Object.entries(REPORT.metrics).forEach(([key, m]) => {
    const ratio = ratioToBenchmark(m.actual, m.benchmark, m.higherIsBetter);
    const sev = severity(ratio);
    const scaleMax = Math.max(m.actual, m.benchmark) * 1.15;
    const el = document.createElement("div");
    el.className = "kpi";
    el.tabIndex = 0;
    el.innerHTML = \`
      <div class="eyebrow">\${m.label}</div>
      <div class="kpi-value mono">\${fmt[m.format](m.actual)}</div>
      \${barTrack(m.actual, m.benchmark, scaleMax)}
      <div class="kpi-target">Target <b>\${fmt[m.format](m.benchmark)}</b></div>
      \${chip(sev)}
    \`;
    attachTooltip(el, \`\${m.label}: \${fmt[m.format](m.actual)} \\u00B7 target \${fmt[m.format](m.benchmark)} (\${sev.label})\`);
    kpiGrid.appendChild(el);
  });

  const funnelPanel = document.getElementById("funnel-panel");
  const funnelScale = Math.max(...REPORT.stages.map(s => Math.max(s.actual, s.benchmark))) * 1.15;
  REPORT.stages.forEach(s => {
    const ratio = ratioToBenchmark(s.actual, s.benchmark, true);
    const sev = severity(ratio);
    const row = document.createElement("div");
    row.className = "bar-row";
    row.tabIndex = 0;
    row.innerHTML = \`
      <div class="row-label">\${s.label}</div>
      \${barTrack(s.actual, s.benchmark, funnelScale)}
      <div class="row-meta">
        <span class="row-actual mono">\${fmt.pct(s.actual)}</span>
        <span class="row-target">vs \${fmt.pct(s.benchmark)}</span>
        \${chip(sev)}
      </div>
    \`;
    attachTooltip(row, \`\${s.label} win rate: \${fmt.pct(s.actual)} \\u00B7 benchmark \${fmt.pct(s.benchmark)} (\${sev.label})\`);
    funnelPanel.appendChild(row);
  });

  const leverList = document.getElementById("lever-list");
  const leverMax = Math.max(...REPORT.levers.map(l => l.annualImpact)) * 1.1;
  REPORT.levers.forEach((l, i) => {
    const pct = (l.annualImpact / leverMax) * 100;
    const el = document.createElement("div");
    el.className = "lever";
    el.tabIndex = 0;
    el.innerHTML = \`
      <div class="lever-rank mono">0\${i + 1}</div>
      <div>
        <div class="lever-title">\${l.label}</div>
        <div class="lever-reco">\${l.recommendation}</div>
      </div>
      <div class="lever-value mono"><span class="up">+</span>\${fmt.usd(l.annualImpact)}<div class="unit">per year</div></div>
      <div class="lever-track"><div class="track"><div class="fill" style="width:\${pct}%"></div></div></div>
    \`;
    attachTooltip(el, \`\${l.label}: +\${fmt.usd(l.annualImpact)}/yr projected uplift\`);
    leverList.appendChild(el);
  });

  const tableScroll = document.getElementById("table-scroll");
  let rows = "";
  Object.values(REPORT.metrics).forEach(m => {
    const sev = severity(ratioToBenchmark(m.actual, m.benchmark, m.higherIsBetter));
    rows += \`<tr><td>\${m.label}</td><td class="num">\${fmt[m.format](m.actual)}</td><td class="num">\${fmt[m.format](m.benchmark)}</td><td>\${sev.label}</td></tr>\`;
  });
  REPORT.stages.forEach(s => {
    const sev = severity(ratioToBenchmark(s.actual, s.benchmark, true));
    rows += \`<tr><td>\${s.label} win rate</td><td class="num">\${fmt.pct(s.actual)}</td><td class="num">\${fmt.pct(s.benchmark)}</td><td>\${sev.label}</td></tr>\`;
  });
  tableScroll.innerHTML = \`
    <table>
      <thead><tr><th>Metric</th><th class="num">Actual</th><th class="num">Benchmark</th><th>Status</th></tr></thead>
      <tbody>\${rows}</tbody>
    </table>
  \`;

  document.getElementById("footer").textContent =
    \`Generated from \${REPORT.dealCount} deals (\${closed} closed, \${REPORT.openDealCount} open) against the \${REPORT.benchmarkLabel} benchmark set. Revenue-lever estimates use the sales velocity model (opportunities \\u00D7 win rate \\u00D7 deal size \\u00F7 cycle length), holding other metrics constant.\`;
</script>
</body>
</html>
`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

module.exports = { renderReportHtml };
