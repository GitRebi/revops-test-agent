# RevOps Diagnostic Agent

AI-powered revenue operations diagnostic tool. Connects to HubSpot, analyzes pipeline health, surfaces top 3 revenue levers.

## What it does

1. **Fetches deal data** from your HubSpot instance
2. **Calculates key metrics**: conversion rate, sales cycle, ACV, stage-by-stage performance
3. **Compares to B2B fintech benchmarks** (18% conversion, 105-day cycle, $400K ACV)
4. **Identifies gaps** where your pipeline underperforms
5. **Ranks 3 levers** by revenue impact (e.g., compress sales cycle = $X uplift)
6. **Outputs scored report** with findings and recommendations

## Interview use case

"I built an agent that automates the RevOps diagnostic I performed manually at Bridgit. You give it a HubSpot instance, it runs a 5-minute funnel analysis and surfaces exactly which bottleneck to fix first. I use it to scope engagements faster for my Rebivo consulting clients."

## Files

- `benchmarks.json` — B2B fintech benchmarks (conversion, cycle, ACV, stage thresholds)
- `agent.js` — Core diagnostic logic (metric calculation, gap analysis, lever ranking)
- `utils.js` — Helper functions (formatting, date math)
- `sample-deals.json` — Sample deal data for a test run without a live HubSpot connection

## Deal data format

Each deal is a JSON object:

```json
{
  "id": "D-1",
  "name": "Acme Deal",
  "outcome": "won",           // "won" | "lost" | "open"
  "stage": "negotiation",     // current/final stage
  "stages_reached": ["lead", "qualified_opportunity", "proposal", "due_diligence", "negotiation"],
  "amount": 420000,
  "created_date": "2025-10-15",
  "closed_date": "2026-03-14" // null while outcome is "open"
}
```

## How to use

1. Connect your HubSpot instance via MCP in Claude and export deals into this shape (or pull them programmatically and map to it)
2. Run `node agent.js path/to/deals.json` — or `node agent.js` with no argument to run against the bundled `sample-deals.json`
3. Get back a scored diagnostic report printed to the console

## Example output

```
=== RevOps Diagnostic Report ===

Pipeline Metrics
  Deals analyzed:     27 (7 open)
  Conversion rate:    15.0%
  Sales cycle:        138 days
  Avg deal size:      $323,333

Gaps vs. Benchmark
  Overall Conversion Rate: 15.0% vs. 18.0% benchmark
  Sales Cycle Length: 138 days vs. 105 days benchmark
  Average Contract Value: $323,333 vs. $400,000 benchmark
  Lead Win Rate: 15.0% vs. 25.0% benchmark
  Qualified Opportunity Win Rate: 20.0% vs. 40.0% benchmark
  Proposal Win Rate: 30.0% vs. 65.0% benchmark
  Due Diligence Win Rate: 50.0% vs. 75.0% benchmark
  Negotiation Win Rate: 75.0% vs. 90.0% benchmark

Top Revenue Levers
  1. Compress Sales Cycle — $1,096,885/yr uplift
     Cut sales cycle from 138 to 105 days
  2. Increase Average Contract Value — $819,271/yr uplift
     Raise average deal size from $323,333 to $400,000
  3. Improve Conversion Rate — $691,037/yr uplift
     Lift conversion rate from 15.0% to the 18.0% benchmark
```
