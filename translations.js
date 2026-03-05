// =============================================================================
// Translations — Swedish Family Net Worth Calculator
// =============================================================================

const translations = {
  en: {
    // Page meta
    pageTitle: 'Swedish Family Net Worth Calculator',
    metaDescription: 'Project your family\'s net worth at retirement. Built for Sweden with accurate pension, ISK, and mortgage models.',
    ogTitle: 'Swedish Family Net Worth Calculator',
    ogDescription: 'Project your family\'s combined net worth at retirement. Accurate Swedish pension, ISK tax, and ränteavdrag models.',

    // Header
    title: 'Family Net Worth Calculator',
    subtitle: 'Projection tool for families living in Sweden',

    // Family setup
    familySetup: 'Family Setup',
    numEarners: 'Number of income earners',
    targetAgeLabel: 'Target age for projection',
    targetAgeUnit: 'years',
    targetAgeHint: 'Swedish retirement age is 67',

    // Earner details
    yourDetails: 'Your Details',
    earner1Label: 'Earner 1',
    partnerDetails: 'Partner\'s Details',
    ageLabel: 'Age',
    ageUnit: 'years',
    monthlyGrossIncome: 'Monthly gross income',
    currentRetirement: 'Current retirement savings',
    retirementHint: 'Check your total at <a href="https://www.minpension.se" target="_blank">minpension.se</a>',
    monthlyExtraInvestment: 'Monthly extra investment',
    investmentHintAvanza: 'E.g. Avanza Zero (Swedish index, ~0% fee)',
    currentInvestmentPortfolio: 'Current investment portfolio',
    investmentPortfolioHint: 'Stocks, funds, ISK etc.',

    // Housing
    housing: 'Housing',
    propertyValue: 'Property market value',
    mortgageRemaining: 'Mortgage remaining',
    currentEquity: 'Current home equity',
    equityHint: 'Equity = Property value &minus; Mortgage remaining',
    mortgageRate: 'Mortgage interest rate',
    mortgageRateHint: 'Typical Swedish rate in 2026: ~3&ndash;4%',
    monthlyAmortization: 'Monthly amortization',
    amortizationHint: 'Amortization rules: 2% if LTV&gt;70%, 1% if 50&ndash;70%',
    annualAppreciation: 'Annual property appreciation',
    appreciationHint: 'Historical Swedish average: ~2&ndash;3%/year',
    reinvestAmortization: 'After mortgage is paid off, redirect amortization into investments',
    reinvestHint: 'If unchecked, freed-up amortization is treated as spending.',

    // CSN
    studentLoans: 'Student Loans (CSN)',
    yourCSN: 'Your CSN Loan',
    earner1CSN: 'Earner 1 CSN Loan',
    partnerCSN: 'Partner\'s CSN Loan',
    remainingBalance: 'Remaining balance',
    monthlyPayment: 'Monthly payment',
    interestRate: 'Interest rate',
    csnRateHint: 'CSN rate 2025: 0.6%',

    // Other loans
    otherLoans: 'Other Loans',
    otherLoansHint: 'Car loans, personal loans, consumer credit, etc.',
    addLoan: '+ Add a loan',
    removeLoanTitle: 'Remove loan',

    // Assumptions
    growthAssumptions: 'Growth Assumptions',
    pensionReturn: 'Pension fund annual return',
    investmentReturn: 'Investment annual return (gross)',
    investmentReturnHint: 'Swedish index avg ~8&ndash;10%. ISK tax deducted automatically.',
    salaryGrowth: 'Annual salary growth',
    inflationLabel: 'Inflation (for real values)',

    // Results
    projectedNetWorth: 'Projected Family Net Worth',
    atAge: 'at age',
    nominal: '(nominal)',
    inTodaysMoney: 'in today\'s money (inflation-adjusted)',

    // Breakdown
    breakdown: 'Breakdown',
    earner1Pension: 'Earner 1 Pension',
    earner2Pension: 'Earner 2 Pension',
    earner1Investments: 'Earner 1 Investments',
    earner2Investments: 'Earner 2 Investments',
    totalPension: 'Total Pension',
    totalInvestments: 'Total Investments',
    homeEquity: 'Home Equity',
    remainingDebts: 'Remaining Debts',
    combinedNetWorth: 'Combined Net Worth',

    // Mortgage summary
    mortgageSummary: 'Mortgage Summary',
    totalInterestPaid: 'Total interest paid',
    totalRanteavdrag: 'Total ränteavdrag (tax relief)',
    netInterestCost: 'Net interest cost',
    effectiveRate: 'Effective interest rate (after deduction)',

    // Loan summary
    loanSummary: 'Loan Summary',
    paidOffAtAge: 'paid off at age',
    totalInterest: 'total interest',
    notWithinProjection: 'Not within projection',

    // Chart
    chartTitle: 'Net Worth Over Time',
    chartTotalLabel: 'Total Net Worth',
    chartPensionLabel: 'Pension',
    chartInvestmentsLabel: 'Investments',
    chartEquityLabel: 'Home Equity',
    chartDebtLabel: 'Outstanding Debts',
    chartXAxis: 'Age (Earner 1)',
    chartYAxis: 'SEK',
    chartTooltipAge: 'Age',

    // Milestones
    mortgagePaidOff: 'Mortgage paid off at age {age}',
    mortgagePaidOffEarner2: 'Mortgage paid off at age {age} (Earner 2\'s age)',
    redirectedToInvestments: '{amount}/mo redirected to investments after debt-free',
    netWorthMilestone: '{amount} net worth at age {age}',
    csnPaidOff: 'CSN paid off at age {age}',
    csnPaidOffEarner: 'CSN paid off at age {age} (Earner {earner})',
    loanPaidOff: '{name} paid off at age {age}',
    totalTaxRelief: '{amount} total tax relief on interest',
    mortgagePaidOffChart: 'Mortgage paid off ({age})',

    // Disclaimer
    disclaimer: '<strong>Disclaimer:</strong> This is a simplified projection tool. Actual outcomes depend on market performance, legislative changes, and personal circumstances. Pension calculations are approximate&mdash;check <a href="https://www.minpension.se" target="_blank">minpension.se</a> for your real pension forecast. Consult a financial advisor for personalized advice.',

    // How it works
    howItWorks: 'How the Calculations Work',
    pensionContribTitle: 'Pension Contributions',
    pensionContribBody: `<p>Sweden has a multi-pillar pension system. We model two components that grow as invested capital:</p>
      <div class="formula-box">
        <strong>Allmän pension (public)</strong><br>
        18.5% of gross salary, capped at 8.07 &times; IBB (~651 000 kr/year in 2026).<br>
        Split into inkomstpension (16%) and premiepension (2.5%).<br>
        We apply the pension fund return rate to the full amount since minpension.se reports it as total capital.
      </div>
      <div class="formula-box">
        <strong>Tjänstepension (occupational, ITP1)</strong><br>
        4.5% of salary up to 7.5 &times; IBB (~604 500 kr/year).<br>
        30% on salary above that threshold.<br>
        Grows at the pension fund return rate.
      </div>
      <p>Your starting value from minpension.se already includes all accumulated pension capital. We add yearly contributions on top and compound at your chosen return rate.</p>`,

    iskTaxTitle: 'ISK Tax (Schablonbeskattning)',
    iskTaxBody: `<p>Investments held in an ISK (Investeringssparkonto) are taxed on a deemed return, not on actual gains.</p>
      <div class="formula-box">
        <strong>Effective ISK tax rate &asymp; 0.888%/year</strong><br>
        Calculated as: 30% &times; (government bond rate + 1 percentage point).<br>
        For 2026, we use the government bond rate ~1.96%, giving 30% &times; 2.96% &asymp; 0.888%.
      </div>
      <p>This is deducted from your gross investment return each year. For example, 8% gross return becomes ~7.1% net return in an ISK.</p>`,

    mortgageDeductionTitle: 'Mortgage Interest Deduction (Ränteavdrag)',
    mortgageDeductionBody: `<p>Sweden allows tax deductions on mortgage interest payments:</p>
      <div class="formula-box">
        <strong>30% deduction</strong> on the first 100 000 kr of interest per year.<br>
        <strong>21% deduction</strong> on interest above 100 000 kr/year.
      </div>
      <p>This effectively reduces your mortgage cost. The yearly tax savings are shown in the mortgage summary. For a 3 000 000 kr loan at 3.2%, annual interest is ~96 000 kr, giving you ~28 800 kr back in tax relief.</p>`,

    housingProjectionTitle: 'Housing Projection',
    housingProjectionBody: `<p>Home equity is calculated as property value minus remaining mortgage.</p>
      <div class="formula-box">
        Each year:<br>
        &bull; Property value grows at the appreciation rate (default 2%).<br>
        &bull; Mortgage decreases by 12 &times; monthly amortization.<br>
        &bull; Mortgage cannot go below zero.
      </div>
      <p>Swedish amortization requirements: 2% of the loan per year if LTV &gt; 70%, 1% if LTV is 50&ndash;70%. We don't enforce this&mdash;you set your own amortization amount.</p>
      <p><strong>Note:</strong> If you sell, capital gains tax is 22% of profit (vinstskatt). This is not deducted from the projection but is worth keeping in mind.</p>`,

    loansExplanationTitle: 'Student &amp; Consumer Loans',
    loansExplanationBody: `<p>CSN student loans and other consumer debts (car loans, personal loans) are projected using simple annual amortization:</p>
      <div class="formula-box">
        Each year: <em>balance</em> = <em>balance</em> &times; (1 + <em>interest rate</em>) &minus; 12 &times; <em>monthly payment</em><br><br>
        The balance is clamped to zero (cannot go negative).
      </div>
      <p>Outstanding loan balances are <strong>subtracted</strong> from your net worth each year. When a loan is fully paid off, a milestone is shown with the payoff age.</p>
      <div class="formula-box">
        <strong>CSN loans</strong> in Sweden have very low interest rates (~0.6% in 2025). Monthly payments are set by CSN based on income, but you can enter your own amount.<br><br>
        <strong>Consumer loans</strong> (car, personal) typically have higher rates (5&ndash;15%). These are entered manually.
      </div>`,

    investmentGrowthTitle: 'Investment Growth',
    investmentGrowthBody: `<p>Your non-pension investments (ISK, funds, stocks) are projected using compound growth with monthly contributions.</p>
      <div class="formula-box">
        Each year: <em>balance</em> = <em>balance</em> &times; (1 + <em>net return</em>) + 12 &times; <em>monthly investment</em><br><br>
        Where <em>net return</em> = gross return &minus; ISK tax rate.<br>
        Default: 8.0% &minus; 0.888% = <strong>7.11% net</strong>.
      </div>
      <p>The default 8% gross return reflects the long-term average of the Swedish stock market (OMXS30). Actual returns vary greatly year to year.</p>`,

    inflationTitle: 'Inflation Adjustment',
    inflationBody: `<p>The "today's money" figure divides the nominal net worth by the cumulative inflation factor:</p>
      <div class="formula-box">
        <em>Real value</em> = <em>Nominal value</em> &divide; (1 + <em>inflation</em>)<sup><em>years</em></sup>
      </div>
      <p>Default inflation is 2%, matching the Riksbank's target. With 2% inflation over 32 years, 1 kr today equals about 1.88 kr in nominal terms&mdash;so a future 10 MSEK is worth roughly 5.3 MSEK in today's purchasing power.</p>`,

    assumptionsTitle: 'Key Assumptions &amp; Limitations',
    assumptionsBody: `<ul>
        <li><strong>IBB (Inkomstbasbelopp) 2026:</strong> estimated at 80 600 kr.</li>
        <li><strong>Salary growth is uniform</strong>&mdash;no promotions, career breaks, or parental leave modeled.</li>
        <li><strong>Returns are constant</strong>&mdash;real markets are volatile. Sequence-of-returns risk is not captured.</li>
        <li><strong>Pension is modeled as capital</strong>, not monthly payouts. Actual pension income depends on annuity rates and life expectancy at withdrawal.</li>
        <li><strong>Loan payoff</strong> uses simple amortization&mdash;actual CSN repayment schedules may vary with income-based adjustments.</li>
        <li><strong>Tjänstepension assumes ITP1</strong> (born 1979 or later, private sector). Public sector and ITP2 differ.</li>
        <li><strong>Housing capital gains tax (22%)</strong> is not deducted from projected equity.</li>
        <li><strong>All inputs are in 2026 SEK.</strong> Future values are nominal unless stated otherwise.</li>
      </ul>`,

    // Footer
    footer: 'Built for families in Sweden &middot; All data stays in your browser &middot; 100% client-side',

    // Affiliate
    affiliateHeading: 'Ready to start investing?',
    affiliateText: 'Open a free ISK account and start building your wealth today.',
    affiliateAvanza: 'Open Avanza account',
    affiliateNordnet: 'Open Nordnet account',

    // Units (used in JS)
    krUnit: 'kr',
    pctUnit: '%',
  },

  sv: {
    // Page meta
    pageTitle: 'Svensk familjens nettoförmögenhetsberäknare',
    metaDescription: 'Beräkna familjens nettoförmögenhet vid pension. Byggd för Sverige med korrekta pensions-, ISK- och bolånemodeller.',
    ogTitle: 'Svensk familjens nettoförmögenhetsberäknare',
    ogDescription: 'Beräkna familjens sammanlagda nettoförmögenhet vid pension. Korrekta svenska pensions-, ISK- och ränteavdragsmodeller.',

    // Header
    title: 'Familjens nettoförmögenhet',
    subtitle: 'Beräkningsverktyg för familjer i Sverige',

    // Family setup
    familySetup: 'Familjens upplägg',
    numEarners: 'Antal inkomsttagare',
    targetAgeLabel: 'Målålder för beräkning',
    targetAgeUnit: 'år',
    targetAgeHint: 'Svensk pensionsålder är 67',

    // Earner details
    yourDetails: 'Dina uppgifter',
    earner1Label: 'Person 1',
    partnerDetails: 'Partners uppgifter',
    ageLabel: 'Ålder',
    ageUnit: 'år',
    monthlyGrossIncome: 'Månadsinkomst (brutto)',
    currentRetirement: 'Nuvarande pensionssparande',
    retirementHint: 'Kolla ditt totala belopp på <a href="https://www.minpension.se" target="_blank">minpension.se</a>',
    monthlyExtraInvestment: 'Månatligt extrainvestering',
    investmentHintAvanza: 'T.ex. Avanza Zero (svenskt index, ~0% avgift)',
    currentInvestmentPortfolio: 'Nuvarande investeringsportfölj',
    investmentPortfolioHint: 'Aktier, fonder, ISK etc.',

    // Housing
    housing: 'Boende',
    propertyValue: 'Fastighetens marknadsvärde',
    mortgageRemaining: 'Kvarvarande bolån',
    currentEquity: 'Nuvarande bostadseget kapital',
    equityHint: 'Eget kapital = Fastighetsvärde &minus; Kvarvarande bolån',
    mortgageRate: 'Bolåneränta',
    mortgageRateHint: 'Typisk svensk ränta 2026: ~3&ndash;4%',
    monthlyAmortization: 'Månatlig amortering',
    amortizationHint: 'Amorteringskrav: 2% vid belåningsgrad&gt;70%, 1% vid 50&ndash;70%',
    annualAppreciation: 'Årlig värdestegring',
    appreciationHint: 'Historiskt svenskt snitt: ~2&ndash;3%/år',
    reinvestAmortization: 'Efter bolånet är avbetalat, omdirigera amorteringen till investeringar',
    reinvestHint: 'Om avmarkerad behandlas frigjord amortering som utgifter.',

    // CSN
    studentLoans: 'Studielån (CSN)',
    yourCSN: 'Ditt CSN-lån',
    earner1CSN: 'Person 1 CSN-lån',
    partnerCSN: 'Partners CSN-lån',
    remainingBalance: 'Kvarvarande saldo',
    monthlyPayment: 'Månatlig betalning',
    interestRate: 'Ränta',
    csnRateHint: 'CSN-ränta 2025: 0,6%',

    // Other loans
    otherLoans: 'Övriga lån',
    otherLoansHint: 'Billån, privatlån, konsumtionslån etc.',
    addLoan: '+ Lägg till ett lån',
    removeLoanTitle: 'Ta bort lån',

    // Assumptions
    growthAssumptions: 'Tillväxtantaganden',
    pensionReturn: 'Pensionsfond årlig avkastning',
    investmentReturn: 'Investeringsavkastning (brutto)',
    investmentReturnHint: 'Svenskt index snitt ~8&ndash;10%. ISK-skatt dras av automatiskt.',
    salaryGrowth: 'Årlig löneökning',
    inflationLabel: 'Inflation (för realvärden)',

    // Results
    projectedNetWorth: 'Beräknad familjens nettoförmögenhet',
    atAge: 'vid ålder',
    nominal: '(nominellt)',
    inTodaysMoney: 'i dagens pengar (inflationsjusterat)',

    // Breakdown
    breakdown: 'Fördelning',
    earner1Pension: 'Person 1 Pension',
    earner2Pension: 'Person 2 Pension',
    earner1Investments: 'Person 1 Investeringar',
    earner2Investments: 'Person 2 Investeringar',
    totalPension: 'Total pension',
    totalInvestments: 'Totala investeringar',
    homeEquity: 'Bostadseget kapital',
    remainingDebts: 'Kvarvarande skulder',
    combinedNetWorth: 'Sammanlagd nettoförmögenhet',

    // Mortgage summary
    mortgageSummary: 'Bolånesammanfattning',
    totalInterestPaid: 'Total betald ränta',
    totalRanteavdrag: 'Totalt ränteavdrag (skattelättnad)',
    netInterestCost: 'Netto räntekostnad',
    effectiveRate: 'Effektiv ränta (efter avdrag)',

    // Loan summary
    loanSummary: 'Lånesammanfattning',
    paidOffAtAge: 'avbetalat vid ålder',
    totalInterest: 'total ränta',
    notWithinProjection: 'Inte inom beräkningsperioden',

    // Chart
    chartTitle: 'Nettoförmögenhet över tid',
    chartTotalLabel: 'Total nettoförmögenhet',
    chartPensionLabel: 'Pension',
    chartInvestmentsLabel: 'Investeringar',
    chartEquityLabel: 'Bostadseget kapital',
    chartDebtLabel: 'Utestående skulder',
    chartXAxis: 'Ålder (Person 1)',
    chartYAxis: 'SEK',
    chartTooltipAge: 'Ålder',

    // Milestones
    mortgagePaidOff: 'Bolånet avbetalat vid ålder {age}',
    mortgagePaidOffEarner2: 'Bolånet avbetalat vid ålder {age} (Person 2)',
    redirectedToInvestments: '{amount}/mån omdirigeras till investeringar efter skuldfrihet',
    netWorthMilestone: '{amount} nettoförmögenhet vid ålder {age}',
    csnPaidOff: 'CSN avbetalat vid ålder {age}',
    csnPaidOffEarner: 'CSN avbetalat vid ålder {age} (Person {earner})',
    loanPaidOff: '{name} avbetalat vid ålder {age}',
    totalTaxRelief: '{amount} total skattelättnad på ränta',
    mortgagePaidOffChart: 'Bolån avbetalat ({age})',

    // Disclaimer
    disclaimer: '<strong>Observera:</strong> Detta är ett förenklat beräkningsverktyg. Faktiska utfall beror på marknadsutveckling, lagändringar och personliga omständigheter. Pensionsberäkningarna är ungefärliga&mdash;kolla <a href="https://www.minpension.se" target="_blank">minpension.se</a> för din riktiga pensionsprognos. Rådgör med en finansiell rådgivare för personlig rådgivning.',

    // How it works
    howItWorks: 'Så fungerar beräkningarna',
    pensionContribTitle: 'Pensionsavsättningar',
    pensionContribBody: `<p>Sverige har ett flerpelarpensionssystem. Vi modellerar två komponenter som växer som investerat kapital:</p>
      <div class="formula-box">
        <strong>Allmän pension</strong><br>
        18,5% av bruttolön, taket vid 8,07 &times; IBB (~651 000 kr/år 2026).<br>
        Delas i inkomstpension (16%) och premiepension (2,5%).<br>
        Vi tillämpar pensionsfondens avkastning på hela beloppet eftersom minpension.se rapporterar det som totalt kapital.
      </div>
      <div class="formula-box">
        <strong>Tjänstepension (ITP1)</strong><br>
        4,5% av lön upp till 7,5 &times; IBB (~604 500 kr/år).<br>
        30% på lön över den gränsen.<br>
        Växer med pensionsfondens avkastning.
      </div>
      <p>Ditt startvärde från minpension.se inkluderar redan allt ackumulerat pensionskapital. Vi lägger till årliga avsättningar och ränta-på-ränta med din valda avkastning.</p>`,

    iskTaxTitle: 'ISK-skatt (Schablonbeskattning)',
    iskTaxBody: `<p>Investeringar på ett ISK (Investeringssparkonto) beskattas på en schablonintäkt, inte på faktiska vinster.</p>
      <div class="formula-box">
        <strong>Effektiv ISK-skattesats &asymp; 0,888%/år</strong><br>
        Beräknas som: 30% &times; (statslåneränta + 1 procentenhet).<br>
        För 2026 använder vi statslåneräntan ~1,96%, vilket ger 30% &times; 2,96% &asymp; 0,888%.
      </div>
      <p>Detta dras av från din bruttoinvesteringsavkastning varje år. Till exempel ger 8% bruttoavkastning ~7,1% nettoavkastning i ett ISK.</p>`,

    mortgageDeductionTitle: 'Ränteavdrag',
    mortgageDeductionBody: `<p>Sverige tillåter skatteavdrag på bolåneräntor:</p>
      <div class="formula-box">
        <strong>30% avdrag</strong> på de första 100 000 kr ränta per år.<br>
        <strong>21% avdrag</strong> på ränta över 100 000 kr/år.
      </div>
      <p>Detta minskar effektivt din bolånekostnad. Den årliga skattebesparingen visas i bolånesammanfattningen. För ett lån på 3 000 000 kr med 3,2% ränta blir årlig ränta ~96 000 kr, vilket ger dig ~28 800 kr tillbaka i skattelättnad.</p>`,

    housingProjectionTitle: 'Bostadsprojektion',
    housingProjectionBody: `<p>Eget kapital i bostaden beräknas som fastighetsvärde minus kvarvarande bolån.</p>
      <div class="formula-box">
        Varje år:<br>
        &bull; Fastighetsvärdet växer med värdestegringstakten (standard 2%).<br>
        &bull; Bolånet minskar med 12 &times; månatlig amortering.<br>
        &bull; Bolånet kan inte gå under noll.
      </div>
      <p>Svenska amorteringskrav: 2% av lånet per år vid belåningsgrad &gt; 70%, 1% vid 50&ndash;70%. Vi tvingar inte detta&mdash;du anger din egen amortering.</p>
      <p><strong>Observera:</strong> Vid försäljning är reavinstskatten 22% av vinsten. Detta dras inte av i beräkningen men är värt att ha i åtanke.</p>`,

    loansExplanationTitle: 'Studie- &amp; konsumtionslån',
    loansExplanationBody: `<p>CSN-studielån och andra konsumtionsskulder (billån, privatlån) beräknas med enkel årlig amortering:</p>
      <div class="formula-box">
        Varje år: <em>saldo</em> = <em>saldo</em> &times; (1 + <em>ränta</em>) &minus; 12 &times; <em>månatlig betalning</em><br><br>
        Saldot kan inte bli negativt.
      </div>
      <p>Utestående lånesaldon <strong>subtraheras</strong> från din nettoförmögenhet varje år. När ett lån är helt avbetalat visas en milstolpe med åldern.</p>
      <div class="formula-box">
        <strong>CSN-lån</strong> i Sverige har mycket låga räntor (~0,6% 2025). Månatliga betalningar sätts av CSN baserat på inkomst, men du kan ange ditt eget belopp.<br><br>
        <strong>Konsumtionslån</strong> (bil, privat) har vanligtvis högre räntor (5&ndash;15%). Dessa anges manuellt.
      </div>`,

    investmentGrowthTitle: 'Investeringstillväxt',
    investmentGrowthBody: `<p>Dina icke-pensionsinvesteringar (ISK, fonder, aktier) beräknas med ränta-på-ränta och månatliga insättningar.</p>
      <div class="formula-box">
        Varje år: <em>saldo</em> = <em>saldo</em> &times; (1 + <em>nettoavkastning</em>) + 12 &times; <em>månatlig investering</em><br><br>
        Där <em>nettoavkastning</em> = bruttoavkastning &minus; ISK-skattesats.<br>
        Standard: 8,0% &minus; 0,888% = <strong>7,11% netto</strong>.
      </div>
      <p>Standardavkastningen på 8% speglar det långsiktiga snittet för den svenska aktiemarknaden (OMXS30). Faktisk avkastning varierar kraftigt från år till år.</p>`,

    inflationTitle: 'Inflationsjustering',
    inflationBody: `<p>Värdet "i dagens pengar" dividerar den nominella nettoförmögenheten med den kumulativa inflationsfaktorn:</p>
      <div class="formula-box">
        <em>Realvärde</em> = <em>Nominellt värde</em> &divide; (1 + <em>inflation</em>)<sup><em>år</em></sup>
      </div>
      <p>Standardinflation är 2%, i linje med Riksbankens mål. Med 2% inflation över 32 år motsvarar 1 kr idag ungefär 1,88 kr nominellt&mdash;så framtida 10 Mkr är värt ungefär 5,3 Mkr i dagens köpkraft.</p>`,

    assumptionsTitle: 'Viktiga antaganden &amp; begränsningar',
    assumptionsBody: `<ul>
        <li><strong>IBB (Inkomstbasbelopp) 2026:</strong> uppskattat till 80 600 kr.</li>
        <li><strong>Löneökning är konstant</strong>&mdash;inga befordringar, karriäruppehåll eller föräldraledighet modelleras.</li>
        <li><strong>Avkastning är konstant</strong>&mdash;verkliga marknader är volatila. Sekvensrisk fångas inte.</li>
        <li><strong>Pension modelleras som kapital</strong>, inte månatliga utbetalningar. Faktisk pensionsinkomst beror på annuitetsfaktorer och förväntad livslängd vid uttag.</li>
        <li><strong>Låneavbetalning</strong> använder enkel amortering&mdash;faktiska CSN-återbetalningsscheman kan variera med inkomstbaserade justeringar.</li>
        <li><strong>Tjänstepension antar ITP1</strong> (född 1979 eller senare, privat sektor). Offentlig sektor och ITP2 skiljer sig.</li>
        <li><strong>Reavinstskatt på bostad (22%)</strong> dras inte av från beräknat eget kapital.</li>
        <li><strong>Alla belopp är i 2026 SEK.</strong> Framtida värden är nominella om inte annat anges.</li>
      </ul>`,

    // Footer
    footer: 'Byggt för familjer i Sverige &middot; All data stannar i din webbläsare &middot; 100% klientsida',

    // Affiliate
    affiliateHeading: 'Redo att börja investera?',
    affiliateText: 'Öppna ett kostnadsfritt ISK-konto och börja bygga din förmögenhet idag.',
    affiliateAvanza: 'Öppna Avanza-konto',
    affiliateNordnet: 'Öppna Nordnet-konto',

    // Units
    krUnit: 'kr',
    pctUnit: '%',
  }
};

// --- Language detection and t() function ---
let currentLang = 'sv'; // default

function getBasePath() {
  // GitHub Pages: /simulate-networth/  Vercel: /
  const host = window.location.hostname;
  if (host.includes('github.io')) return '/simulate-networth/';
  return '/';
}

function detectLanguage() {
  const path = window.location.pathname;
  const base = getBasePath();
  const relative = path.startsWith(base) ? path.slice(base.length) : path.slice(1);
  if (relative.startsWith('en')) return 'en';
  if (relative.startsWith('sv')) return 'sv';
  // Check localStorage fallback
  const stored = localStorage.getItem('swe-networth-lang');
  if (stored && translations[stored]) return stored;
  return 'sv'; // default to Swedish
}

function t(key) {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

function initLanguage() {
  currentLang = detectLanguage();
  document.documentElement.lang = currentLang;
}

function switchLanguage(lang) {
  localStorage.setItem('swe-networth-lang', lang);
  const base = getBasePath();
  // On GitHub Pages (no server rewrites), stay on same page and re-apply translations
  if (base !== '/') {
    currentLang = lang;
    document.documentElement.lang = lang;
    applyTranslations();
    if (typeof calculate === 'function') calculate();
    return;
  }
  window.location.href = '/' + lang + '/';
}

function applyTranslations() {
  // Apply data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = t(key);
    if (value) {
      // Check if the translation contains HTML
      if (value.includes('<') && value.includes('>')) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    }
  });

  // Apply data-i18n-placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const value = t(key);
    if (value) el.placeholder = value;
  });

  // Apply data-i18n-title attributes
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const value = t(key);
    if (value) el.title = value;
  });

  // Update page title
  document.title = t('pageTitle');

  // Update meta tags
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = t('metaDescription');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = t('ogTitle');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.content = t('ogDescription');

  // Update language switcher active state
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}
