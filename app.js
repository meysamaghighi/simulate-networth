// --- State ---
let earnerCount = 1;
let chartInstance = null;

// --- Helpers ---
function fmt(n) {
  return Math.round(n).toLocaleString('sv-SE') + ' kr';
}

function val(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}

function pct(id) {
  return (parseFloat(document.getElementById(id).value) || 0) / 100;
}

// --- Earner toggle ---
function setEarners(n) {
  earnerCount = n;
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.value) === n);
  });
  document.getElementById('earner2-card').classList.toggle('hidden', n === 1);
  document.getElementById('earner1-title').textContent = n === 2 ? 'Earner 1' : 'Your Details';
  updateEquity();
}

// --- Live equity display ---
function updateEquity() {
  const value = val('houseValue');
  const loan = val('mortgageRemaining');
  const equity = value - loan;
  document.getElementById('equityDisplay').textContent = fmt(equity);
  document.getElementById('equityDisplay').style.color = equity >= 0 ? 'var(--accent)' : '#dc2626';
}

document.getElementById('houseValue').addEventListener('input', updateEquity);
document.getElementById('mortgageRemaining').addEventListener('input', updateEquity);
updateEquity();

// --- Calculation engine ---
function calculate() {
  const targetAge = val('targetAge');
  const pensionReturn = pct('pensionReturn');
  const investReturn = pct('investmentReturn');
  const salaryGrowth = pct('salaryGrowth');
  const inflation = pct('inflation');
  const houseAppreciation = pct('houseAppreciation');
  const mortgageRate = pct('mortgageRate');

  // Housing
  let houseValue = val('houseValue');
  let mortgageRemaining = val('mortgageRemaining');
  const monthlyAmort = val('amortization');

  // Swedish pension contribution rates (approximate)
  // Allmän pension: 18.5% of pensionsgrundande inkomst (capped at ~$600k SEK/year)
  // Tjänstepension (ITP1): ~4.5% up to 7.5 IBB, ~30% above
  // We simplify: ~7% total monthly contribution to pension funds
  const PENSION_CONTRIBUTION_RATE = 0.07;

  // Per-earner calculation
  function calcEarner(idx) {
    const age = val('age' + idx);
    const income = val('income' + idx);
    let retirement = val('retirement' + idx);
    const monthlyInvest = val('extraInvest' + idx);
    let investments = val('currentInvestments' + idx);

    const years = Math.max(0, targetAge - age);
    let currentIncome = income;

    const yearlyData = [];

    for (let y = 0; y < years; y++) {
      // Monthly pension contribution from salary
      const monthlyPensionContrib = currentIncome * PENSION_CONTRIBUTION_RATE;

      // Grow retirement: annual return + 12 months of contributions
      retirement = retirement * (1 + pensionReturn) + monthlyPensionContrib * 12;

      // Grow investments: annual return + 12 months of extra investing
      investments = investments * (1 + investReturn) + monthlyInvest * 12;

      // Salary grows
      currentIncome *= (1 + salaryGrowth);

      yearlyData.push({
        retirement: retirement,
        investments: investments
      });
    }

    return { retirement, investments, years, yearlyData };
  }

  // Calculate earners
  const e1 = calcEarner(1);
  const e2 = earnerCount === 2 ? calcEarner(2) : { retirement: 0, investments: 0, years: 0, yearlyData: [] };

  // Housing projection over max years
  const maxYears = Math.max(e1.years, earnerCount === 2 ? e2.years : 0);
  let projectedHouseValue = houseValue;
  let projectedMortgage = mortgageRemaining;

  const housingYearlyData = [];

  for (let y = 0; y < maxYears; y++) {
    projectedHouseValue *= (1 + houseAppreciation);
    projectedMortgage = Math.max(0, projectedMortgage - monthlyAmort * 12);
    housingYearlyData.push({
      equity: projectedHouseValue - projectedMortgage,
      houseValue: projectedHouseValue,
      mortgage: projectedMortgage
    });
  }

  const finalEquity = projectedHouseValue - projectedMortgage;

  // Mortgage interest cost (total over period, for info)
  // Simplified: average outstanding * rate * years
  const avgMortgage = (mortgageRemaining + projectedMortgage) / 2;
  const totalInterestCost = avgMortgage * mortgageRate * maxYears;
  // Swedish tax deduction on interest: 30%
  const interestAfterDeduction = totalInterestCost * 0.7;

  // Totals
  const totalRetirement = e1.retirement + e2.retirement;
  const totalInvestments = e1.investments + e2.investments;
  const totalNominal = totalRetirement + totalInvestments + finalEquity;

  // Inflation-adjusted
  const deflator = Math.pow(1 + inflation, maxYears);
  const totalReal = totalNominal / deflator;

  // --- Display results ---
  document.getElementById('results').classList.remove('hidden');
  document.getElementById('totalNetWorth').textContent = fmt(totalNominal);
  document.getElementById('totalNetWorthReal').textContent = fmt(totalReal);
  document.getElementById('resultAge').textContent = targetAge;

  // Breakdown
  const grid = document.getElementById('breakdownGrid');
  const items = [
    { label: 'Total Pension Savings', value: totalRetirement, highlight: false },
    { label: 'Investment Portfolio', value: totalInvestments, highlight: false },
    { label: 'Home Equity', value: finalEquity, highlight: false },
    { label: 'Combined Net Worth', value: totalNominal, highlight: true },
  ];

  if (earnerCount === 2) {
    items.splice(0, 0,
      { label: 'Earner 1 Pension', value: e1.retirement, highlight: false },
      { label: 'Earner 2 Pension', value: e2.retirement, highlight: false },
      { label: 'Earner 1 Investments', value: e1.investments, highlight: false },
      { label: 'Earner 2 Investments', value: e2.investments, highlight: false },
    );
    // Remove the combined rows
    items.splice(4, 2);
    items.push(
      { label: 'Total Pension', value: totalRetirement, highlight: false },
      { label: 'Total Investments', value: totalInvestments, highlight: false },
      { label: 'Home Equity', value: finalEquity, highlight: false },
      { label: 'Combined Net Worth', value: totalNominal, highlight: true },
    );
  }

  grid.innerHTML = items.map(item => `
    <div class="breakdown-item ${item.highlight ? 'highlight' : ''}">
      <div class="bi-label">${item.label}</div>
      <div class="bi-value">${fmt(item.value)}</div>
    </div>
  `).join('');

  // --- Chart ---
  buildChart(e1, e2, housingYearlyData, maxYears, targetAge);

  // Scroll to results
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildChart(e1, e2, housingData, maxYears, targetAge) {
  const ctx = document.getElementById('chart').getContext('2d');

  if (chartInstance) chartInstance.destroy();

  const labels = [];
  const pensionData = [];
  const investData = [];
  const equityData = [];
  const totalData = [];

  const baseAge = val('age1');

  for (let y = 0; y <= maxYears; y++) {
    labels.push(baseAge + y);

    if (y === 0) {
      const p = val('retirement1') + (earnerCount === 2 ? val('retirement2') : 0);
      const inv = val('currentInvestments1') + (earnerCount === 2 ? val('currentInvestments2') : 0);
      const eq = val('houseValue') - val('mortgageRemaining');
      pensionData.push(p);
      investData.push(inv);
      equityData.push(eq);
      totalData.push(p + inv + eq);
    } else {
      const p = (e1.yearlyData[y-1]?.retirement || 0) + (e2.yearlyData[y-1]?.retirement || 0);
      const inv = (e1.yearlyData[y-1]?.investments || 0) + (e2.yearlyData[y-1]?.investments || 0);
      const eq = housingData[y-1]?.equity || 0;
      pensionData.push(p);
      investData.push(inv);
      equityData.push(eq);
      totalData.push(p + inv + eq);
    }
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Net Worth',
          data: totalData,
          borderColor: '#0e9f6e',
          backgroundColor: 'rgba(14, 159, 110, 0.08)',
          fill: true,
          borderWidth: 2.5,
          tension: 0.3,
          pointRadius: 0,
          pointHitRadius: 10,
        },
        {
          label: 'Pension',
          data: pensionData,
          borderColor: '#1a56db',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [4, 4],
          tension: 0.3,
          pointRadius: 0,
          pointHitRadius: 10,
        },
        {
          label: 'Investments',
          data: investData,
          borderColor: '#9333ea',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [4, 4],
          tension: 0.3,
          pointRadius: 0,
          pointHitRadius: 10,
        },
        {
          label: 'Home Equity',
          data: equityData,
          borderColor: '#ea580c',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [4, 4],
          tension: 0.3,
          pointRadius: 0,
          pointHitRadius: 10,
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 16,
            font: { size: 12, family: 'Inter' }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + fmt(context.parsed.y);
            },
            title: function(items) {
              return 'Age ' + items[0].label;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Age', font: { size: 12, family: 'Inter' } },
          grid: { display: false },
          ticks: {
            font: { size: 11 },
            callback: function(val, index) {
              const label = this.getLabelForValue(val);
              return index % 5 === 0 ? label : '';
            }
          }
        },
        y: {
          title: { display: true, text: 'SEK', font: { size: 12, family: 'Inter' } },
          grid: { color: '#f3f4f6' },
          ticks: {
            font: { size: 11 },
            callback: function(value) {
              if (value >= 1000000) return (value / 1000000).toFixed(1) + ' M';
              if (value >= 1000) return (value / 1000).toFixed(0) + ' k';
              return value;
            }
          }
        }
      }
    }
  });
}
