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

function avg(numbers) {
  if (!numbers.length) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function daysBetween(startDate, endDate) {
  const ms = new Date(endDate) - new Date(startDate);
  return ms / (1000 * 60 * 60 * 24);
}

module.exports = { formatCurrency, formatPercent, avg, daysBetween };
