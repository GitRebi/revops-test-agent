// Utility functions for RevOps Diagnostic Agent

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format percentage
function formatPercent(decimal) {
  return (decimal * 100).toFixed(1) + '%';
}

// Calculate win rate by stage
function getStageWinRate(deals, stage) {
  const inStage = deals.filter(d => d.stage === stage);
