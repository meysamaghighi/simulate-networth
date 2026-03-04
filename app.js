// =============================================================================
// Swedish Family Net Worth Calculator
// =============================================================================

// --- Constants ---
const IBB = 80600;              // Inkomstbasbelopp 2026 (estimated)
const ALLMAN_CAP = 8.07 * IBB;  // ~650 442 kr/year
const ITP_THRESHOLD = 7.5 * IBB; // ~604 500 kr/year
const ALLMAN_RATE = 0.185;       // 18.5% of salary (capped)
const ITP_LOW = 0.045;           // 4.5% below threshold
const ITP_HIGH = 0.30;           // 30% above threshold
const ISK_TAX_RATE = 0.00888;   // ~0.888% effective ISK tax (30% × (govt bond ~1.96% + 1%))
const RANTEAVDRAG_THRESHOLD = 100000; // 100k SEK/year
const RANTEAVDRAG_LOW = 0.30;   // 30% on first 100k interest
const RANTEAVDRAG_HIGH = 0.21;  // 21% above 100k

// --- State ---
let earnerCount = 1;
let chartInstance = null;
let debounceTimer = null;

// --- Helpers ---
function fmt(n) {
  return Math.round(n).toLocaleString('sv-SE') + ' kr';
}

function fmtShort(n) {
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + ' Mkr';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(0) + ' tkr';
  return Math.round(n) + ' kr';
}

function formatNumber(n) {
  return Math.round(n).toLocaleString('sv-SE');
}

// Read value from a formatted text input or plain number input
function val(id) {
  const el = document.getElementById(id);
  if (el.dataset.raw !== undefined) {
    return parseFloat(el.dataset.raw) || 0;
  }
  return parseFloat(el.value) || 0;
}

function pct(id) {
  return (parseFloat(document.getElementById(id).value) || 0) / 100;
}

// --- Formatted number inputs ---
function setupFormattedInput(el) {
  el.addEventListener('input', () => {
    const cursorPos = el.selectionStart;
    const oldLen = el.value.length;
    // Strip non-digit and non-minus
    const raw = el.value.replace(/[^\d-]/g, '').replace(/(?!^)-/g, '');
    const num = parseInt(raw, 10);
    el.dataset.raw = isNaN(num) ? '0' : String(num);
    el.value = isNaN(num) ? '' : formatNumber(num);
    // Adjust cursor position for added/removed spaces
    const newLen = el.value.length;
    const diff = newLen - oldLen;
    el.setSelectionRange(cursorPos + diff, cursorPos + diff);
  });

  // On focus, keep formatted
  el.addEventListener('focus', () => {
    el.select();
  });
}

// --- Earner toggle ---
function setEarners(n) {
  earnerCount = n;
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.value) === n);
  });
  document.getElementById('earner2-card').classList.toggle('hidden', n === 1);
  document.getElementById('earner1-title').textContent = n === 2 ? 'Earner 1' : 'Your Details';
  saveToLocalStorage();
  scheduleCalculation();
}

// --- Live equity display ---
function updateEquity() {
  const value = val('houseValue');
  const loan = val('mortgageRemaining');
  const equity = value - loan;
  document.getElementById('equityDisplay').textContent = fmt(equity);
  document.getElementById('equityDisplay').style.color = equity >= 0 ? 'var(--accent)' : '#dc2626';
}

// --- Swedish pension contribution calculation ---
function yearlyPensionContribution(annualGrossSalary) {
  // Allmän pension: 18.5% capped at 8.07 × IBB
  const allmanBase = Math.min(annualGrossSalary, ALLMAN_CAP);
  const allmanContrib = allmanBase * ALLMAN_RATE;

  // Tjänstepension (ITP1): 4.5% up to 7.5 IBB, 30% above
  let tjansteContrib;
  if (annualGrossSalary <= ITP_THRESHOLD) {
    tjansteContrib = annualGrossSalary * ITP_LOW;
  } else {
    tjansteContrib = ITP_THRESHOLD * ITP_LOW + (annualGrossSalary - ITP_THRESHOLD) * ITP_HIGH;
  }

  return allmanContrib + tjansteContrib;
}

// --- Ränteavdrag (mortgage interest tax deduction) ---
function calculateRanteavdrag(yearlyInterest) {
  if (yearlyInterest <= RANTEAVDRAG_THRESHOLD) {
    return yearlyInterest * RANTEAVDRAG_LOW;
  }
  return RANTEAVDRAG_THRESHOLD * RANTEAVDRAG_LOW +
    (yearlyInterest - RANTEAVDRAG_THRESHOLD) * RANTEAVDRAG_HIGH;
}

// --- Calculation engine ---
function calculate() {
  const targetAge = val('targetAge');
  const pensionReturn = pct('pensionReturn');
  const grossInvestReturn = pct('investmentReturn');
  const netInvestReturn = grossInvestReturn - ISK_TAX_RATE; // Deduct ISK tax
  const salaryGrowth = pct('salaryGrowth');
  const inflation = pct('inflation');
  const houseAppreciation = pct('houseAppreciation');
  const mortgageRate = pct('mortgageRate');

  // Housing
  let houseValue = val('houseValue');
  let mortgageRemaining = val('mortgageRemaining');
  const monthlyAmort = val('amortization');

  // Per-earner calculation
  function calcEarner(idx) {
    const age = val('age' + idx);
    const monthlyIncome = val('income' + idx);
    let retirement = val('retirement' + idx);
    const monthlyInvest = val('extraInvest' + idx);
    let investments = val('currentInvestments' + idx);

    const years = Math.max(0, targetAge - age);
    let currentMonthlyIncome = monthlyIncome;

    const yearlyData = [];

    for (let y = 0; y < years; y++) {
      const annualSalary = currentMonthlyIncome * 12;

      // Pension contribution (allmän + tjänste)
      const pensionContrib = yearlyPensionContribution(annualSalary);

      // Grow retirement: compound + contributions
      retirement = retirement * (1 + pensionReturn) + pensionContrib;

      // Grow investments: compound (net of ISK tax) + monthly contributions
      investments = investments * (1 + netInvestReturn) + monthlyInvest * 12;

      // Salary grows
      currentMonthlyIncome *= (1 + salaryGrowth);

      yearlyData.push({ retirement, investments });
    }

    return { retirement, investments, years, yearlyData };
  }

  const e1 = calcEarner(1);
  const e2 = earnerCount === 2
    ? calcEarner(2)
    : { retirement: 0, investments: 0, years: 0, yearlyData: [] };

  // Housing projection
  const maxYears = Math.max(e1.years, earnerCount === 2 ? e2.years : 0);
  let projHouseValue = houseValue;
  let projMortgage = mortgageRemaining;
  let totalInterestPaid = 0;
  let totalRanteavdrag = 0;
  let mortgageFreeAge = null;

  const housingYearlyData = [];

  for (let y = 0; y < maxYears; y++) {
    // Interest for this year (on remaining mortgage)
    const yearlyInterest = projMortgage * mortgageRate;
    totalInterestPaid += yearlyInterest;
    totalRanteavdrag += calculateRanteavdrag(yearlyInterest);

    projHouseValue *= (1 + houseAppreciation);
    projMortgage = Math.max(0, projMortgage - monthlyAmort * 12);

    if (mortgageFreeAge === null && projMortgage === 0) {
      mortgageFreeAge = val('age1') + y + 1;
    }

    housingYearlyData.push({
      equity: projHouseValue - projMortgage,
      houseValue: projHouseValue,
      mortgage: projMortgage
    });
  }

  const finalEquity = projHouseValue - projMortgage;

  // Totals
  const totalRetirement = e1.retirement + e2.retirement;
  const totalInvestments = e1.investments + e2.investments;
  const totalNominal = totalRetirement + totalInvestments + finalEquity;

  // Inflation-adjusted
  const deflator = Math.pow(1 + inflation, maxYears);
  const totalReal = totalNominal / deflator;

  // --- Display results ---
  const resultsEl = document.getElementById('results');
  resultsEl.classList.remove('hidden');
  document.getElementById('totalNetWorth').textContent = fmt(totalNominal);
  document.getElementById('totalNetWorthReal').textContent = fmt(totalReal);
  document.getElementById('resultAge').textContent = targetAge;

  // --- Milestones ---
  const milestonesEl = document.getElementById('milestones');
  const milestones = [];

  if (mortgageFreeAge && mortgageFreeAge <= targetAge) {
    milestones.push(`Mortgage-free by age ${mortgageFreeAge}`);
  }

  // Find first million milestone
  const baseAge = val('age1');
  for (let y = 0; y <= maxYears; y++) {
    let total;
    if (y === 0) {
      total = val('retirement1') + (earnerCount === 2 ? val('retirement2') : 0) +
        val('currentInvestments1') + (earnerCount === 2 ? val('currentInvestments2') : 0) +
        houseValue - mortgageRemaining;
    } else {
      const p = (e1.yearlyData[y-1]?.retirement || 0) + (e2.yearlyData[y-1]?.retirement || 0);
      const inv = (e1.yearlyData[y-1]?.investments || 0) + (e2.yearlyData[y-1]?.investments || 0);
      const eq = housingYearlyData[y-1]?.equity || 0;
      total = p + inv + eq;
    }
    if (total >= 5000000) {
      milestones.push(`5 Mkr net worth at age ${baseAge + y}`);
      break;
    }
  }
  for (let y = 0; y <= maxYears; y++) {
    let total;
    if (y === 0) {
      total = val('retirement1') + (earnerCount === 2 ? val('retirement2') : 0) +
        val('currentInvestments1') + (earnerCount === 2 ? val('currentInvestments2') : 0) +
        houseValue - mortgageRemaining;
    } else {
      const p = (e1.yearlyData[y-1]?.retirement || 0) + (e2.yearlyData[y-1]?.retirement || 0);
      const inv = (e1.yearlyData[y-1]?.investments || 0) + (e2.yearlyData[y-1]?.investments || 0);
      const eq = housingYearlyData[y-1]?.equity || 0;
      total = p + inv + eq;
    }
    if (total >= 10000000) {
      milestones.push(`10 Mkr net worth at age ${baseAge + y}`);
      break;
    }
  }

  if (totalRanteavdrag > 0) {
    milestones.push(`${fmtShort(totalRanteavdrag)} total tax relief on interest`);
  }

  milestonesEl.innerHTML = milestones.map(m =>
    `<div class="milestone"><span class="dot"></span>${m}</div>`
  ).join('');

  // --- Breakdown ---
  const grid = document.getElementById('breakdownGrid');
  const items = [];

  if (earnerCount === 2) {
    items.push(
      { label: 'Earner 1 Pension', value: e1.retirement },
      { label: 'Earner 2 Pension', value: e2.retirement },
      { label: 'Earner 1 Investments', value: e1.investments },
      { label: 'Earner 2 Investments', value: e2.investments },
    );
  }
  items.push(
    { label: 'Total Pension', value: totalRetirement },
    { label: 'Total Investments', value: totalInvestments },
    { label: 'Home Equity', value: finalEquity },
    { label: 'Combined Net Worth', value: totalNominal, highlight: true },
  );

  grid.innerHTML = items.map(item => `
    <div class="breakdown-item ${item.highlight ? 'highlight' : ''}">
      <div class="bi-label">${item.label}</div>
      <div class="bi-value">${fmt(item.value)}</div>
    </div>
  `).join('');

  // --- Mortgage summary ---
  const mortgageGrid = document.getElementById('mortgageSummary');
  const effectiveRate = mortgageRate * (1 - RANTEAVDRAG_LOW);
  mortgageGrid.innerHTML = [
    { label: 'Total interest paid', value: fmt(totalInterestPaid) },
    { label: 'Total ränteavdrag (tax relief)', value: fmt(totalRanteavdrag) },
    { label: 'Net interest cost', value: fmt(totalInterestPaid - totalRanteavdrag) },
    { label: 'Effective interest rate (after deduction)', value: (effectiveRate * 100).toFixed(2) + '%' },
  ].map(item => `
    <div class="breakdown-item">
      <div class="bi-label">${item.label}</div>
      <div class="bi-value">${item.value}</div>
    </div>
  `).join('');

  // --- Chart ---
  buildChart(e1, e2, housingYearlyData, maxYears);
}

function buildChart(e1, e2, housingData, maxYears) {
  const ctx = document.getElementById('chart').getContext('2d');
  if (chartInstance) chartInstance.destroy();

  const labels = [];
  const pensionData = [];
  const investData = [];
  const equityData = [];
  const totalData = [];
  const baseAge = val('age1');
  const startingHouseValue = val('houseValue');
  const startingMortgage = val('mortgageRemaining');

  for (let y = 0; y <= maxYears; y++) {
    labels.push(baseAge + y);
    if (y === 0) {
      const p = val('retirement1') + (earnerCount === 2 ? val('retirement2') : 0);
      const inv = val('currentInvestments1') + (earnerCount === 2 ? val('currentInvestments2') : 0);
      const eq = startingHouseValue - startingMortgage;
      pensionData.push(p); investData.push(inv); equityData.push(eq);
      totalData.push(p + inv + eq);
    } else {
      const p = (e1.yearlyData[y-1]?.retirement || 0) + (e2.yearlyData[y-1]?.retirement || 0);
      const inv = (e1.yearlyData[y-1]?.investments || 0) + (e2.yearlyData[y-1]?.investments || 0);
      const eq = housingData[y-1]?.equity || 0;
      pensionData.push(p); investData.push(inv); equityData.push(eq);
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
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, padding: 16, font: { size: 12, family: 'Inter' } }
        },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + fmt(ctx.parsed.y),
            title: items => 'Age ' + items[0].label
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
              return index % 5 === 0 ? this.getLabelForValue(val) : '';
            }
          }
        },
        y: {
          title: { display: true, text: 'SEK', font: { size: 12, family: 'Inter' } },
          grid: { color: '#f3f4f6' },
          ticks: {
            font: { size: 11 },
            callback: v => {
              if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + ' M';
              if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(0) + ' k';
              return v;
            }
          }
        }
      }
    }
  });
}

// --- Auto-calculate with debounce ---
function scheduleCalculation() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    updateEquity();
    calculate();
    saveToLocalStorage();
  }, 300);
}

// --- localStorage ---
const STORAGE_KEY = 'swe-networth-v1';

const ALL_INPUTS = [
  'targetAge', 'age1', 'income1', 'retirement1', 'extraInvest1', 'currentInvestments1',
  'age2', 'income2', 'retirement2', 'extraInvest2', 'currentInvestments2',
  'houseValue', 'mortgageRemaining', 'mortgageRate', 'amortization', 'houseAppreciation',
  'pensionReturn', 'investmentReturn', 'salaryGrowth', 'inflation'
];

function saveToLocalStorage() {
  const data = { earnerCount };
  ALL_INPUTS.forEach(id => {
    const el = document.getElementById(id);
    data[id] = el.dataset.raw !== undefined ? el.dataset.raw : el.value;
  });
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);

    ALL_INPUTS.forEach(id => {
      if (data[id] === undefined) return;
      const el = document.getElementById(id);
      if (el.dataset.raw !== undefined) {
        el.dataset.raw = data[id];
        const num = parseInt(data[id], 10);
        el.value = isNaN(num) ? '' : formatNumber(num);
      } else {
        el.value = data[id];
      }
    });

    if (data.earnerCount) {
      setEarners(data.earnerCount);
    }
    return true;
  } catch (e) {
    return false;
  }
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  // Setup formatted inputs
  document.querySelectorAll('input[inputmode="numeric"]').forEach(setupFormattedInput);

  // Attach auto-calculate to all inputs
  document.querySelectorAll('input').forEach(el => {
    el.addEventListener('input', scheduleCalculation);
  });

  // Load saved state
  loadFromLocalStorage();
  updateEquity();

  // Initial calculation
  calculate();
});
