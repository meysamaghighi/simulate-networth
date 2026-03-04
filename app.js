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
let otherLoans = []; // Array of { id, name, balance, payment, rate }

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
  document.getElementById('csn2-fields').classList.toggle('hidden', n === 1);

  // Update earner titles based on language
  const earner1Title = document.getElementById('earner1-title');
  const csn1Title = document.getElementById('csn1-title');
  if (n === 2) {
    earner1Title.textContent = t('earner1Label');
    earner1Title.setAttribute('data-i18n', 'earner1Label');
    csn1Title.textContent = t('earner1CSN');
    csn1Title.setAttribute('data-i18n', 'earner1CSN');
  } else {
    earner1Title.textContent = t('yourDetails');
    earner1Title.setAttribute('data-i18n', 'yourDetails');
    csn1Title.textContent = t('yourCSN');
    csn1Title.setAttribute('data-i18n', 'yourCSN');
  }

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

// --- Loan projection ---
function projectLoan(balance, monthlyPayment, annualRate, maxYears) {
  const yearlyBalances = [];
  let payoffYear = null;
  let totalInterest = 0;

  for (let y = 0; y < maxYears; y++) {
    if (balance <= 0) {
      yearlyBalances.push(0);
      continue;
    }
    const interest = balance * annualRate;
    totalInterest += interest;
    balance = balance + interest - monthlyPayment * 12;
    if (balance <= 0) {
      balance = 0;
      if (payoffYear === null) payoffYear = y + 1;
    }
    yearlyBalances.push(balance);
  }

  return { yearlyBalances, payoffYear, totalInterest };
}

// --- Dynamic other loans management ---
let loanIdCounter = 0;

function addLoan(name, balance, payment, rate) {
  const id = loanIdCounter++;
  const loan = {
    id,
    name: name || (currentLang === 'sv' ? 'Billån' : 'Car loan'),
    balance: balance !== undefined ? balance : 150000,
    payment: payment !== undefined ? payment : 3000,
    rate: rate !== undefined ? rate : 7
  };
  otherLoans.push(loan);
  renderOtherLoans();
  scheduleCalculation();
}

function removeLoan(id) {
  otherLoans = otherLoans.filter(l => l.id !== id);
  renderOtherLoans();
  scheduleCalculation();
}

function renderOtherLoans() {
  const container = document.getElementById('otherLoansContainer');
  container.innerHTML = otherLoans.map(loan => `
    <div class="loan-entry" data-loan-id="${loan.id}">
      <div class="loan-entry-header">
        <input type="text" class="loan-name-input" value="${loan.name}" data-field="name" data-loan-id="${loan.id}">
        <button class="remove-loan-btn" onclick="removeLoan(${loan.id})" title="${t('removeLoanTitle')}">&times;</button>
      </div>
      <div class="fields-grid">
        <div class="field">
          <label>${t('remainingBalance')}</label>
          <div class="input-wrap">
            <input type="text" inputmode="numeric" class="loan-field" data-field="balance" data-loan-id="${loan.id}" value="${formatNumber(loan.balance)}" data-raw="${loan.balance}">
            <span class="unit">kr</span>
          </div>
        </div>
        <div class="field">
          <label>${t('monthlyPayment')}</label>
          <div class="input-wrap">
            <input type="text" inputmode="numeric" class="loan-field" data-field="payment" data-loan-id="${loan.id}" value="${formatNumber(loan.payment)}" data-raw="${loan.payment}">
            <span class="unit">kr</span>
          </div>
        </div>
        <div class="field">
          <label>${t('interestRate')}</label>
          <div class="input-wrap">
            <input type="number" class="loan-field" data-field="rate" data-loan-id="${loan.id}" value="${loan.rate}" step="0.1" min="0" max="30">
            <span class="unit">%</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Attach listeners to new inputs
  container.querySelectorAll('.loan-field').forEach(el => {
    if (el.getAttribute('inputmode') === 'numeric') {
      setupFormattedInput(el);
    }
    el.addEventListener('input', () => {
      syncLoanField(el);
      scheduleCalculation();
    });
  });
  container.querySelectorAll('.loan-name-input').forEach(el => {
    el.addEventListener('input', () => {
      syncLoanField(el);
      scheduleCalculation();
    });
  });
}

function syncLoanField(el) {
  const id = parseInt(el.dataset.loanId);
  const field = el.dataset.field;
  const loan = otherLoans.find(l => l.id === id);
  if (!loan) return;

  if (field === 'name') {
    loan.name = el.value;
  } else if (field === 'rate') {
    loan.rate = parseFloat(el.value) || 0;
  } else {
    loan[field] = parseFloat(el.dataset.raw) || 0;
  }
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

  // Options
  const reinvestAmort = document.getElementById('reinvestAmortization').checked;

  // Per-earner calculation
  function calcEarner(idx, getExtraMonthly) {
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

      // Extra monthly from redirected amortization (split between earners)
      const extraMonthly = getExtraMonthly(y);

      // Grow investments: compound (net of ISK tax) + monthly contributions + redirect
      investments = investments * (1 + netInvestReturn) + (monthlyInvest + extraMonthly) * 12;

      // Salary grows
      currentMonthlyIncome *= (1 + salaryGrowth);

      yearlyData.push({ retirement, investments });
    }

    return { retirement, investments, years, yearlyData };
  }

  // --- Housing projection first (to find debt-free year) ---
  const age1 = val('age1');
  const age2 = earnerCount === 2 ? val('age2') : 0;
  const prelimMaxYears = Math.max(
    Math.max(0, targetAge - age1),
    earnerCount === 2 ? Math.max(0, targetAge - age2) : 0
  );

  let projHouseValue = houseValue;
  let projMortgage = mortgageRemaining;
  let totalInterestPaid = 0;
  let totalRanteavdrag = 0;
  let mortgageFreeYear = null;
  let mortgageFreeAge = null;

  const housingYearlyData = [];

  for (let y = 0; y < prelimMaxYears; y++) {
    const yearlyInterest = projMortgage * mortgageRate;
    totalInterestPaid += yearlyInterest;
    totalRanteavdrag += calculateRanteavdrag(yearlyInterest);

    projHouseValue *= (1 + houseAppreciation);
    projMortgage = Math.max(0, projMortgage - monthlyAmort * 12);

    if (mortgageFreeYear === null && projMortgage === 0) {
      mortgageFreeYear = y + 1;
      mortgageFreeAge = age1 + y + 1;
    }

    housingYearlyData.push({
      equity: projHouseValue - projMortgage,
      houseValue: projHouseValue,
      mortgage: projMortgage
    });
  }

  // --- Loan projections ---
  const csnLoans = [];
  for (let i = 1; i <= earnerCount; i++) {
    const balance = val('csnBalance' + i);
    const payment = val('csnPayment' + i);
    const rate = pct('csnRate' + i);
    if (balance > 0) {
      const proj = projectLoan(balance, payment, rate, prelimMaxYears);
      csnLoans.push({ earner: i, ...proj, name: 'CSN' });
    }
  }

  const otherLoanProjections = otherLoans.filter(l => l.balance > 0).map(loan => {
    const proj = projectLoan(loan.balance, loan.payment, loan.rate / 100, prelimMaxYears);
    return { name: loan.name, ...proj, startBalance: loan.balance };
  });

  const allLoans = [...csnLoans, ...otherLoanProjections];
  const yearlyTotalDebt = [];
  for (let y = 0; y < prelimMaxYears; y++) {
    let total = 0;
    for (const loan of allLoans) {
      total += loan.yearlyBalances[y] || 0;
    }
    yearlyTotalDebt.push(total);
  }
  const startingTotalDebt = allLoans.reduce((sum, l) => {
    return sum + (l.startBalance !== undefined ? l.startBalance : val('csnBalance' + l.earner));
  }, 0);

  // --- Earner calculations (with amortization redirect) ---
  const earnerDivisor = earnerCount;
  function getRedirectedMonthly(yearIndex) {
    if (!reinvestAmort) return 0;
    if (mortgageFreeYear === null) return 0;
    if (yearIndex >= mortgageFreeYear) return monthlyAmort / earnerDivisor;
    return 0;
  }

  const e1 = calcEarner(1, getRedirectedMonthly);
  const e2 = earnerCount === 2
    ? calcEarner(2, getRedirectedMonthly)
    : { retirement: 0, investments: 0, years: 0, yearlyData: [] };

  const maxYears = prelimMaxYears;

  const finalEquity = projHouseValue - projMortgage;

  // Totals
  const totalRetirement = e1.retirement + e2.retirement;
  const totalInvestments = e1.investments + e2.investments;
  const finalDebt = yearlyTotalDebt.length > 0 ? yearlyTotalDebt[yearlyTotalDebt.length - 1] : 0;
  const totalNominal = totalRetirement + totalInvestments + finalEquity - finalDebt;

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
    milestones.push(t('mortgagePaidOff').replace('{age}', mortgageFreeAge));
    if (earnerCount === 2) {
      const debtFreeAge2 = age2 + mortgageFreeYear;
      if (debtFreeAge2 <= targetAge) {
        milestones.push(t('mortgagePaidOffEarner2').replace('{age}', debtFreeAge2));
      }
    }
    if (reinvestAmort) {
      milestones.push(t('redirectedToInvestments').replace('{amount}', fmtShort(monthlyAmort)));
    }
  }

  // Find net worth milestones
  const baseAge = val('age1');
  function getNetWorthAtYear(y) {
    if (y === 0) {
      return val('retirement1') + (earnerCount === 2 ? val('retirement2') : 0) +
        val('currentInvestments1') + (earnerCount === 2 ? val('currentInvestments2') : 0) +
        houseValue - mortgageRemaining - startingTotalDebt;
    }
    const p = (e1.yearlyData[y-1]?.retirement || 0) + (e2.yearlyData[y-1]?.retirement || 0);
    const inv = (e1.yearlyData[y-1]?.investments || 0) + (e2.yearlyData[y-1]?.investments || 0);
    const eq = housingYearlyData[y-1]?.equity || 0;
    const debt = yearlyTotalDebt[y-1] || 0;
    return p + inv + eq - debt;
  }

  for (let y = 0; y <= maxYears; y++) {
    if (getNetWorthAtYear(y) >= 5000000) {
      milestones.push(t('netWorthMilestone').replace('{amount}', '5 Mkr').replace('{age}', baseAge + y));
      break;
    }
  }
  for (let y = 0; y <= maxYears; y++) {
    if (getNetWorthAtYear(y) >= 10000000) {
      milestones.push(t('netWorthMilestone').replace('{amount}', '10 Mkr').replace('{age}', baseAge + y));
      break;
    }
  }

  // Loan payoff milestones
  for (const loan of csnLoans) {
    if (loan.payoffYear !== null) {
      const payoffAge = val('age' + loan.earner) + loan.payoffYear;
      if (payoffAge <= targetAge) {
        if (earnerCount === 2) {
          milestones.push(t('csnPaidOffEarner').replace('{age}', payoffAge).replace('{earner}', loan.earner));
        } else {
          milestones.push(t('csnPaidOff').replace('{age}', payoffAge));
        }
      }
    }
  }
  for (const loan of otherLoanProjections) {
    if (loan.payoffYear !== null) {
      const payoffAge = age1 + loan.payoffYear;
      if (payoffAge <= targetAge) {
        milestones.push(t('loanPaidOff').replace('{name}', loan.name).replace('{age}', payoffAge));
      }
    }
  }

  if (totalRanteavdrag > 0) {
    milestones.push(t('totalTaxRelief').replace('{amount}', fmtShort(totalRanteavdrag)));
  }

  milestonesEl.innerHTML = milestones.map(m =>
    `<div class="milestone"><span class="dot"></span>${m}</div>`
  ).join('');

  // --- Breakdown ---
  const grid = document.getElementById('breakdownGrid');
  const items = [];

  if (earnerCount === 2) {
    items.push(
      { label: t('earner1Pension'), value: e1.retirement },
      { label: t('earner2Pension'), value: e2.retirement },
      { label: t('earner1Investments'), value: e1.investments },
      { label: t('earner2Investments'), value: e2.investments },
    );
  }
  items.push(
    { label: t('totalPension'), value: totalRetirement },
    { label: t('totalInvestments'), value: totalInvestments },
    { label: t('homeEquity'), value: finalEquity },
  );
  if (startingTotalDebt > 0) {
    items.push({ label: t('remainingDebts'), value: -finalDebt });
  }
  items.push(
    { label: t('combinedNetWorth'), value: totalNominal, highlight: true },
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
    { label: t('totalInterestPaid'), value: fmt(totalInterestPaid) },
    { label: t('totalRanteavdrag'), value: fmt(totalRanteavdrag) },
    { label: t('netInterestCost'), value: fmt(totalInterestPaid - totalRanteavdrag) },
    { label: t('effectiveRate'), value: (effectiveRate * 100).toFixed(2) + '%' },
  ].map(item => `
    <div class="breakdown-item">
      <div class="bi-label">${item.label}</div>
      <div class="bi-value">${item.value}</div>
    </div>
  `).join('');

  // --- Loan Summary ---
  const loanSummarySection = document.getElementById('loanSummarySection');
  if (allLoans.length > 0) {
    loanSummarySection.classList.remove('hidden');
    const loanGrid = document.getElementById('loanSummary');
    const loanItems = [];
    for (const loan of csnLoans) {
      const earnerLabel = earnerCount === 2 ? ` (${t('earner1Label').replace('1', loan.earner)})` : '';
      const payoffAge = loan.payoffYear !== null ? val('age' + loan.earner) + loan.payoffYear : t('notWithinProjection');
      loanItems.push({ label: `CSN${earnerLabel} ${t('paidOffAtAge')}`, value: String(payoffAge) });
      loanItems.push({ label: `CSN${earnerLabel} ${t('totalInterest')}`, value: fmt(loan.totalInterest) });
    }
    for (const loan of otherLoanProjections) {
      const payoffAge = loan.payoffYear !== null ? age1 + loan.payoffYear : t('notWithinProjection');
      loanItems.push({ label: `${loan.name} ${t('paidOffAtAge')}`, value: String(payoffAge) });
      loanItems.push({ label: `${loan.name} ${t('totalInterest')}`, value: fmt(loan.totalInterest) });
    }
    loanGrid.innerHTML = loanItems.map(item => `
      <div class="breakdown-item">
        <div class="bi-label">${item.label}</div>
        <div class="bi-value">${item.value}</div>
      </div>
    `).join('');
  } else {
    loanSummarySection.classList.add('hidden');
  }

  // --- Chart ---
  buildChart(e1, e2, housingYearlyData, yearlyTotalDebt, startingTotalDebt, maxYears, mortgageFreeAge);
}

function buildChart(e1, e2, housingData, yearlyDebt, startDebt, maxYears, debtFreeAge) {
  const ctx = document.getElementById('chart').getContext('2d');
  if (chartInstance) chartInstance.destroy();

  const labels = [];
  const pensionData = [];
  const investData = [];
  const equityData = [];
  const debtData = [];
  const totalData = [];
  const baseAge = val('age1');
  const startingHouseValue = val('houseValue');
  const startingMortgage = val('mortgageRemaining');
  const hasDebt = startDebt > 0;

  for (let y = 0; y <= maxYears; y++) {
    labels.push(baseAge + y);
    const debt = y === 0 ? startDebt : (yearlyDebt[y-1] || 0);
    if (y === 0) {
      const p = val('retirement1') + (earnerCount === 2 ? val('retirement2') : 0);
      const inv = val('currentInvestments1') + (earnerCount === 2 ? val('currentInvestments2') : 0);
      const eq = startingHouseValue - startingMortgage;
      pensionData.push(p); investData.push(inv); equityData.push(eq);
      if (hasDebt) debtData.push(debt);
      totalData.push(p + inv + eq - debt);
    } else {
      const p = (e1.yearlyData[y-1]?.retirement || 0) + (e2.yearlyData[y-1]?.retirement || 0);
      const inv = (e1.yearlyData[y-1]?.investments || 0) + (e2.yearlyData[y-1]?.investments || 0);
      const eq = housingData[y-1]?.equity || 0;
      pensionData.push(p); investData.push(inv); equityData.push(eq);
      if (hasDebt) debtData.push(debt);
      totalData.push(p + inv + eq - debt);
    }
  }

  // Annotation for debt-free vertical line
  const annotations = {};
  if (debtFreeAge && debtFreeAge >= baseAge && debtFreeAge <= baseAge + maxYears) {
    const debtFreeIndex = debtFreeAge - baseAge;
    annotations.debtFreeLine = {
      type: 'line',
      xMin: debtFreeIndex,
      xMax: debtFreeIndex,
      borderColor: '#16a34a',
      borderWidth: 2,
      borderDash: [6, 4],
      label: {
        display: true,
        content: t('mortgagePaidOffChart').replace('{age}', debtFreeAge),
        position: 'start',
        backgroundColor: '#16a34a',
        color: '#fff',
        font: { size: 11, family: 'Inter', weight: '500' },
        padding: { top: 4, bottom: 4, left: 8, right: 8 },
        borderRadius: 4,
      }
    };
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('chartTotalLabel'),
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
          label: t('chartPensionLabel'),
          data: pensionData,
          borderColor: '#1a56db',
          borderWidth: 1.5,
          borderDash: [4, 4],
          tension: 0.3,
          pointRadius: 0,
          pointHitRadius: 10,
        },
        {
          label: t('chartInvestmentsLabel'),
          data: investData,
          borderColor: '#9333ea',
          borderWidth: 1.5,
          borderDash: [4, 4],
          tension: 0.3,
          pointRadius: 0,
          pointHitRadius: 10,
        },
        {
          label: t('chartEquityLabel'),
          data: equityData,
          borderColor: '#ea580c',
          borderWidth: 1.5,
          borderDash: [4, 4],
          tension: 0.3,
          pointRadius: 0,
          pointHitRadius: 10,
        },
        ...(hasDebt ? [{
          label: t('chartDebtLabel'),
          data: debtData,
          borderColor: '#dc2626',
          borderWidth: 1.5,
          borderDash: [4, 4],
          tension: 0.3,
          pointRadius: 0,
          pointHitRadius: 10,
        }] : []),
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        annotation: { annotations },
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, padding: 16, font: { size: 12, family: 'Inter' } }
        },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + fmt(ctx.parsed.y),
            title: items => t('chartTooltipAge') + ' ' + items[0].label
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: t('chartXAxis'), font: { size: 12, family: 'Inter' } },
          grid: { display: false },
          ticks: {
            font: { size: 11 },
            callback: function(val, index) {
              return index % 5 === 0 ? this.getLabelForValue(val) : '';
            }
          }
        },
        y: {
          title: { display: true, text: t('chartYAxis'), font: { size: 12, family: 'Inter' } },
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
const STORAGE_KEY = 'swe-networth-v2';

const ALL_INPUTS = [
  'targetAge', 'age1', 'income1', 'retirement1', 'extraInvest1', 'currentInvestments1',
  'age2', 'income2', 'retirement2', 'extraInvest2', 'currentInvestments2',
  'houseValue', 'mortgageRemaining', 'mortgageRate', 'amortization', 'houseAppreciation',
  'csnBalance1', 'csnPayment1', 'csnRate1', 'csnBalance2', 'csnPayment2', 'csnRate2',
  'pensionReturn', 'investmentReturn', 'salaryGrowth', 'inflation'
];

function saveToLocalStorage() {
  const data = { earnerCount };
  ALL_INPUTS.forEach(id => {
    const el = document.getElementById(id);
    data[id] = el.dataset.raw !== undefined ? el.dataset.raw : el.value;
  });
  data.reinvestAmortization = document.getElementById('reinvestAmortization').checked;
  data.otherLoans = otherLoans.map(l => ({ name: l.name, balance: l.balance, payment: l.payment, rate: l.rate }));
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}

function loadFromLocalStorage() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    // Fallback to v1 data
    if (!raw) raw = localStorage.getItem('swe-networth-v1');
    if (!raw) return false;
    const data = JSON.parse(raw);

    ALL_INPUTS.forEach(id => {
      if (data[id] === undefined) return;
      const el = document.getElementById(id);
      if (!el) return;
      if (el.dataset.raw !== undefined) {
        el.dataset.raw = data[id];
        const num = parseInt(data[id], 10);
        el.value = isNaN(num) ? '' : formatNumber(num);
      } else {
        el.value = data[id];
      }
    });

    if (data.reinvestAmortization !== undefined) {
      document.getElementById('reinvestAmortization').checked = data.reinvestAmortization;
    }
    if (data.otherLoans && Array.isArray(data.otherLoans)) {
      otherLoans = [];
      loanIdCounter = 0;
      data.otherLoans.forEach(l => {
        addLoan(l.name, l.balance, l.payment, l.rate);
      });
    }
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
  // Initialize language
  initLanguage();
  applyTranslations();

  // Setup formatted inputs
  document.querySelectorAll('input[inputmode="numeric"]').forEach(setupFormattedInput);

  // Attach auto-calculate to all inputs
  document.querySelectorAll('input').forEach(el => {
    el.addEventListener('input', scheduleCalculation);
    if (el.type === 'checkbox') {
      el.addEventListener('change', scheduleCalculation);
    }
  });

  // Load saved state
  loadFromLocalStorage();
  updateEquity();

  // Initial calculation
  calculate();
});
