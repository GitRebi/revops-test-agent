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
- `utils.js` — Helper functions (formatting, validation, parsing)

## How to use

1. Connect your HubSpot instance via MCP in Claude
2. Run `agent.js` with your deal data
3. Get back a scored diagnostic report

## Example output
