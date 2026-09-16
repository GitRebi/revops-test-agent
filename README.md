# RevOps Diagnostic Agent

AI-powered revenue operations diagnostic tool. Connects to HubSpot, analyzes pipeline health, surfaces top 3 revenue levers.

## What it does

1. **Fetches deal data** from your HubSpot instance
2. **Calculates key metrics**: conversion rate, sales cycle, ACV, stage-by-stage performance
3. **Compares to B2B fintech benchmarks** (18% conversion, 105-day cycle, $400K ACV)
4. **Identifies gaps** where your pipeline underperforms
5. **Ranks 3 levers** by revenue impact (e.g., compress sales cycle = $X uplift)
6. **Renders a visual dashboard** (HTML file) with the metrics, funnel, and ranked levers

## Interview use case

"I built an agent that automates the RevOps diagnostic I performed manually at Bridgit. You give it a HubSpot instance, it runs a 5-minute funnel analysis and surfaces exactly which bottleneck to fix first. I use it to scope engagements faster for my Rebivo consulting clients."

## Files

- `benchmarks.json` — B2B fintech benchmarks (conversion, cycle, ACV, stage thresholds)
- `agent.js` — Core diagnostic logic (metric calculation, gap analysis, lever ranking)
- `utils.js` — Helper functions (formatting, date math)
- `report-template.js` — Renders the diagnostic as a standalone HTML dashboard
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
3. Open the generated `report.html` (or pass a third argument to write it elsewhere: `node agent.js path/to/deals.json path/to/report.html`)

## Output

Every run renders a self-contained HTML dashboard (`report.html` by default) — no server or build step needed, just open it in a browser. It includes:

- **Pipeline Metrics** — conversion rate, sales cycle, and ACV as KPI tiles with a benchmark bar and severity chip
- **Win Rate by Stage** — a funnel view showing where deals fall off, stage by stage
- **Top Revenue Levers** — the 3 ranked levers with proportional bars sized by dollar impact
- A collapsible full data table, and light/dark mode support

The console also prints a one-line summary of the top lever and where the report was saved.
