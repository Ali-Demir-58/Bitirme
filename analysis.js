// Finansal Analiz Platformu - Analysis JavaScript

let currentTab = 'portfolio';
let portfolioChart, simulationChart, riskChart, expenseChart;

let marketStocks = [];
let marketGoldPrice = null;

let portfolioData = {
    totalValue: 0,
    monthlyReturn: 0,
    riskScore: 6.2,
    diversification: 85,
    holdings: [
        { symbol: 'TUPRS', name: 'Tüpraş', amount: 200, buyPrice: 312.50, currentPrice: 312.50 },
        { symbol: 'GOLD', name: 'Gram Altın', amount: 20, buyPrice: 2756, currentPrice: 2756 }
    ]
};

let budgetData = {
    income: 25000,

    ratios: {
        'Konut': 0.35,
        'Gıda': 0.20,
        'Ulaşım': 0.10,
        'Eğlence': 0.10,
        'Eğitim': 0.10,
        'Sağlık': 0.05,
        'Diğer': 0.10
    },

    expenses: [
        { category: 'Konut', description: 'Ev kira ve faturaları', amount: 8500 },
        { category: 'Gıda', description: 'Market ve restoran', amount: 4200 },
        { category: 'Ulaşım', description: 'Araç ve toplu taşıma', amount: 1800 },
        { category: 'Eğlence', description: 'Sinema, tiyatro, vs.', amount: 1200 },
        { category: 'Diğer', description: 'Giyim, sağlık, vs.', amount: 3050 }
    ]
};

// =========================
// INIT
// =========================

document.addEventListener('DOMContentLoaded', async function () {
    await loadMarketDataForAnalysis();
    refreshPortfolioPrices();

    initializeCharts();
    initializeInteractions();
    updateHoldingsTable();
    updatePortfolioDisplay();
    updateBudgetDashboard();
});

// =========================
// MARKET DATA
// =========================

async function loadMarketDataForAnalysis() {
    try {
        const res = await fetch('http://localhost:3000/api/market-data');
        const data = await res.json();

        marketStocks = data.stocks || [];
        marketGoldPrice = data.gold?.['ALIŞ'] ? Number(data.gold['ALIŞ']) : null;
    } catch (err) {
        console.error('Piyasa verisi alınamadı:', err);
        marketStocks = [];
        marketGoldPrice = null;
    }
}

function normalizeSymbol(symbol) {
    return String(symbol || '')
        .toUpperCase()
        .trim()
        .split(' ')[0];
}

function isGoldSymbol(symbol) {
    const s = normalizeSymbol(symbol);
    return s === 'GOLD' || s === 'ALTIN' || s === 'GRAM';
}

function findMarketStock(symbol) {
    const cleanSymbol = normalizeSymbol(symbol);

    return marketStocks.find(
        item => normalizeSymbol(item.symbol) === cleanSymbol
    );
}

function refreshPortfolioPrices() {
    portfolioData.holdings.forEach(holding => {
        if (isGoldSymbol(holding.symbol)) {
            if (marketGoldPrice) {
                holding.symbol = 'GOLD';
                holding.name = 'Gram Altın';
                holding.currentPrice = marketGoldPrice;
            }
            return;
        }

        const marketStock = findMarketStock(holding.symbol);

        if (marketStock && marketStock.last) {
            holding.symbol = normalizeSymbol(marketStock.symbol);
            holding.currentPrice = Number(marketStock.last);
            holding.name = marketStock.name || holding.name;
        }
    });
}

// =========================
// TAB MANAGEMENT
// =========================

function switchTab(tabName) {
    document.querySelectorAll('[id^="content-"]').forEach(section => {
        section.classList.add('hidden');
    });

    document.getElementById(`content-${tabName}`).classList.remove('hidden');

    document.querySelectorAll('[id^="tab-"]').forEach(button => {
        button.classList.remove('active');
        button.classList.add('bg-gray-100', 'text-gray-700');
    });

    const activeTab = document.getElementById(`tab-${tabName}`);
    activeTab.classList.add('active');
    activeTab.classList.remove('bg-gray-100', 'text-gray-700');

    currentTab = tabName;

    setTimeout(() => {
        if (tabName === 'portfolio') {
            initializePortfolioCharts();
        } else if (tabName === 'simulation') {
            initializeSimulationChart();
        } else if (tabName === 'risk') {
            initializeRiskChart();
        } else if (tabName === 'budget') {
            initializeExpenseChart();
        }
    }, 100);
}

// =========================
// CHARTS
// =========================

function initializeCharts() {
    initializePortfolioCharts();
}

function initializePortfolioCharts() {
    const chartDom = document.getElementById('portfolio-pie-chart');
    if (!chartDom) return;

    if (portfolioChart) {
        portfolioChart.dispose();
    }

    const pieChart = echarts.init(chartDom);

    const pieData = portfolioData.holdings.map(holding => ({
        value: holding.amount * holding.currentPrice,
        name: holding.symbol
    }));

    const pieOption = {
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                return `${params.name}: ₺${Number(params.value).toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })} (${params.percent}%)`;
            }
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: {
                color: '#6b7280'
            }
        },
        series: [{
            name: 'Portföy',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '18',
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: pieData
        }]
    };

    pieChart.setOption(pieOption);
    portfolioChart = pieChart;
}

function initializeSimulationChart() {
    // Simülasyon grafiği artık runSimulation() çalışınca oluşuyor.
}

function initializeRiskChart() {
    if (riskChart) {
        riskChart.dispose();
    }

    const chartDom = document.getElementById('risk-allocation-chart');
    if (chartDom) {
        calculateRiskProfile();
    }
}

function initializeExpenseChart() {
    updateExpenseChart();
}

// =========================
// PORTFOLIO DISPLAY
// =========================

function calculatePortfolioMetrics() {
    const totalValue = portfolioData.holdings.reduce((sum, h) => {
        return sum + h.amount * h.currentPrice;
    }, 0);

    if (totalValue === 0) {
        return { riskScore: 0, diversification: 0 };
    }

    let hhi = 0;
    let weightedVolatility = 0;
    let weightedMovement = 0;

    portfolioData.holdings.forEach(holding => {
        const value = holding.amount * holding.currentPrice;
        const weight = value / totalValue;

        hhi += weight * weight;

        if (isGoldSymbol(holding.symbol)) {
            weightedVolatility += weight * 2;
            weightedMovement += weight * 1;
            return;
        }

        const marketStock = findMarketStock(holding.symbol);

        if (marketStock && marketStock.high && marketStock.low && marketStock.last) {
            const intradayVolatility =
                ((marketStock.high - marketStock.low) / marketStock.last) * 100;

            const dailyMovement = Math.abs(Number(marketStock.change || 0)) * 100;

            weightedVolatility += weight * intradayVolatility;
            weightedMovement += weight * dailyMovement;
        } else {
            weightedVolatility += weight * 3;
            weightedMovement += weight * 1;
        }
    });

    const concentrationRisk = hhi * 5;
    const volatilityRisk = Math.min(weightedVolatility, 5);
    const movementRisk = Math.min(weightedMovement, 3);

    const riskScore = Math.min(10, concentrationRisk + volatilityRisk + movementRisk);
    const diversification = Math.max(0, Math.min(100, (1 - hhi) * 100));

    return { riskScore, diversification };
}

function getRiskLabel(score) {
    if (score < 3) return { text: 'Düşük Risk', color: 'text-green-600' };
    if (score < 6) return { text: 'Orta Risk', color: 'text-yellow-600' };
    return { text: 'Yüksek Risk', color: 'text-red-600' };
}

function getDiversificationLabel(value) {
    if (value >= 70) return { text: 'İyi', color: 'text-green-600' };
    if (value >= 40) return { text: 'Orta', color: 'text-yellow-600' };
    return { text: 'Zayıf', color: 'text-red-600' };
}

function updatePortfolioDisplay() {
    const totalValue = portfolioData.holdings.reduce((sum, h) => {
        return sum + h.amount * h.currentPrice;
    }, 0);

    const totalBuyValue = portfolioData.holdings.reduce((sum, h) => {
        return sum + h.amount * h.buyPrice;
    }, 0);

    const totalProfit = totalValue - totalBuyValue;
    const totalProfitPercent = totalBuyValue > 0 ? (totalProfit / totalBuyValue) * 100 : 0;

    const metrics = calculatePortfolioMetrics();
    const risk = getRiskLabel(metrics.riskScore);
    const diversification = getDiversificationLabel(metrics.diversification);

    portfolioData.totalValue = totalValue;
    portfolioData.monthlyReturn = totalProfit;
    portfolioData.riskScore = metrics.riskScore;
    portfolioData.diversification = metrics.diversification;

    document.getElementById('total-value').textContent =
        `₺${totalValue.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    document.getElementById('total-change').textContent =
        `${totalProfitPercent >= 0 ? '+' : ''}${totalProfitPercent.toFixed(2)}%`;

    document.getElementById('monthly-return').textContent =
        `${totalProfit >= 0 ? '+' : ''}₺${totalProfit.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    document.getElementById('risk-score').textContent = metrics.riskScore.toFixed(1);
    document.getElementById('diversification').textContent = `${metrics.diversification.toFixed(0)}%`;

    const riskLabel = document.querySelector('#risk-score')?.nextElementSibling?.nextElementSibling;
    if (riskLabel) {
        riskLabel.textContent = risk.text;
        riskLabel.className = `text-xs ${risk.color}`;
    }

    const divLabel = document.querySelector('#diversification')?.nextElementSibling?.nextElementSibling;
    if (divLabel) {
        divLabel.textContent = diversification.text;
        divLabel.className = `text-xs ${diversification.color}`;
    }
}

function updateHoldingsTable() {
    const tbody = document.getElementById('holdings-table');
    if (!tbody) return;

    tbody.innerHTML = '';

    portfolioData.holdings.forEach(holding => {
        const currentValue = holding.amount * holding.currentPrice;
        const buyValue = holding.amount * holding.buyPrice;

        const profit = currentValue - buyValue;
        const profitPercent = buyValue > 0 ? (profit / buyValue * 100).toFixed(2) : '0.00';

        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100 hover:bg-gray-50';

        row.innerHTML = `
            <td class="py-3 px-4">
                <div class="flex items-center">
                    <span class="font-medium text-gray-900">${holding.symbol}</span>
                    <span class="ml-2 text-sm text-gray-500">${holding.name}</span>
                </div>
            </td>
            <td class="text-right py-3 px-4">${holding.amount}</td>
            <td class="text-right py-3 px-4">₺${Number(holding.buyPrice).toFixed(2)}</td>
            <td class="text-right py-3 px-4">₺${Number(holding.currentPrice).toFixed(2)}</td>
            <td class="text-right py-3 px-4 font-medium">
                ₺${currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td class="text-right py-3 px-4 ${profit >= 0 ? 'text-green-600' : 'text-red-600'} font-medium">
                ${profit >= 0 ? '+' : ''}₺${profit.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}
                (${profit >= 0 ? '+' : ''}${profitPercent}%)
            </td>
            <td class="text-center py-3 px-4">
                <button onclick="sellInvestment('${holding.symbol}')" class="text-red-600 hover:text-red-800 font-medium">Sat</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// =========================
// ADD / SELL INVESTMENT
// =========================

function addInvestment() {
    const stockOptions = marketStocks.map(stock => `
        <option value="${stock.symbol} ${stock.name}">${stock.symbol} - ${stock.name}</option>
    `).join('');

    const modal = createModal('Yeni Yatırım Ekle', `
        <form id="investment-form">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Varlık Türü</label>
                    <select id="asset-type" class="w-full px-4 py-2 border border-gray-300 rounded-lg" onchange="handleAssetTypeChange()">
                        <option value="stock">Hisse Senedi</option>
                        <option value="gold">Altın</option>
                        <option value="fx">Döviz</option>
                        <option value="fund">Yatırım Fonu</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Sembol/Kod</label>
                    <input list="stock-symbol-list" type="text" id="asset-symbol" placeholder="Örn: TUPRS veya GOLD" class="w-full px-4 py-2 border border-gray-300 rounded-lg">

                    <datalist id="stock-symbol-list">
                        ${stockOptions}
                        <option value="GOLD">GOLD - Gram Altın</option>
                        <option value="ALTIN">ALTIN - Gram Altın</option>
                    </datalist>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Miktar</label>
                    <input type="number" id="asset-amount" placeholder="Adet" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Alış Fiyatı (₺)</label>
                    <input type="number" id="asset-price" step="0.01" placeholder="0.00" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                </div>
            </div>

            <div class="flex space-x-4 mt-6">
                <button type="button" onclick="saveInvestment()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">
                    Kaydet
                </button>
                <button type="button" onclick="closeModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg">
                    İptal
                </button>
            </div>
        </form>
    `);

    document.body.appendChild(modal);
}

function handleAssetTypeChange() {
    const type = document.getElementById('asset-type')?.value;
    const symbolInput = document.getElementById('asset-symbol');

    if (!symbolInput) return;

    if (type === 'gold') {
        symbolInput.value = 'GOLD';
    } else if (symbolInput.value === 'GOLD' || symbolInput.value === 'ALTIN') {
        symbolInput.value = '';
    }
}

async function saveInvestment() {
    await loadMarketDataForAnalysis();

    const symbolInput = document.getElementById('asset-symbol').value;
    const symbol = normalizeSymbol(symbolInput);

    const amount = parseFloat(document.getElementById('asset-amount').value);
    const price = parseFloat(document.getElementById('asset-price').value);

    if (!symbol || !amount || !price) {
        alert('Lütfen tüm alanları doldurun.');
        return;
    }

    let currentPrice = price;
    let assetName = symbol;
    let finalSymbol = symbol;

    if (isGoldSymbol(symbol)) {
        finalSymbol = 'GOLD';
        currentPrice = marketGoldPrice || price;
        assetName = 'Gram Altın';
    } else {
        const marketStock = findMarketStock(symbol);
        currentPrice = marketStock?.last ? Number(marketStock.last) : price;
        assetName = marketStock?.name || symbol;
    }

    const newInvestment = {
        symbol: finalSymbol,
        name: assetName,
        amount: amount,
        buyPrice: price,
        currentPrice: currentPrice
    };

    portfolioData.holdings.push(newInvestment);

    refreshPortfolioPrices();
    updateHoldingsTable();
    updatePortfolioDisplay();
    initializePortfolioCharts();

    closeModal();
    showNotification('Yatırım başarıyla eklendi!', 'success');
}

function sellInvestment(symbol) {
    const holding = portfolioData.holdings.find(h => h.symbol === symbol);

    if (!holding) return;

    const input = prompt(
        `${symbol} için kaç adet satmak istiyorsunuz?\nMevcut adet: ${holding.amount}`
    );

    if (input === null) return;

    const sellAmount = parseFloat(input);

    if (isNaN(sellAmount) || sellAmount <= 0) {
        alert('Geçerli bir sayı girin.');
        return;
    }

    if (sellAmount > holding.amount) {
        alert('Elinizde bu kadar adet yok.');
        return;
    }

    if (sellAmount === holding.amount) {
        portfolioData.holdings = portfolioData.holdings.filter(h => h !== holding);
    } else {
        holding.amount -= sellAmount;
    }

    updateHoldingsTable();
    updatePortfolioDisplay();
    initializePortfolioCharts();

    showNotification('Satış başarılı!', 'success');
}

// =========================
// SIMULATION
// =========================

function getRiskParams(risk) {
    const profiles = {
        very_conservative: { mu: 0.08, sigma: 0.06 },
        conservative: { mu: 0.12, sigma: 0.10 },
        balanced: { mu: 0.18, sigma: 0.20 },
        growth: { mu: 0.25, sigma: 0.32 },
        aggressive: { mu: 0.32, sigma: 0.45 }
    };

    return profiles[risk] || profiles.balanced;
}

function randomNormal() {
    let u = 0;
    let v = 0;

    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();

    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function percentile(arr, p) {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) return sorted[lower];

    return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function formatTL(value) {
    return `₺${Number(value).toLocaleString('tr-TR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })}`;
}

function runSimulation() {
    const initialAmount = parseFloat(document.getElementById('simulation-amount').value);
    const years = parseInt(document.getElementById('simulation-period').value);
    const risk = document.getElementById('simulation-risk').value;
    const simulationCount = parseInt(document.getElementById('simulation-count').value);

    if (!initialAmount || initialAmount <= 0) {
        alert('Lütfen geçerli bir başlangıç tutarı girin.');
        return;
    }

    const { mu, sigma } = getRiskParams(risk);

    const stepsPerYear = 12;
    const totalSteps = years * stepsPerYear;
    const dt = 1 / stepsPerYear;

    const finalValues = [];
    const pathsForChart = [];

    for (let i = 0; i < simulationCount; i++) {
        let value = initialAmount;
        const path = [value];

        for (let step = 1; step <= totalSteps; step++) {
            const z = randomNormal();

            value = value * Math.exp(
                (mu - 0.5 * sigma * sigma) * dt +
                sigma * Math.sqrt(dt) * z
            );

            if (step % stepsPerYear === 0) {
                path.push(value);
            }
        }

        finalValues.push(value);

        if (i < 40) {
            pathsForChart.push(path);
        }
    }

    const p5 = percentile(finalValues, 5);
    const median = percentile(finalValues, 50);
    const p95 = percentile(finalValues, 95);
    const expected = finalValues.reduce((sum, x) => sum + x, 0) / finalValues.length;

    const losses = finalValues.map(value => Math.max(0, initialAmount - value));

    const lossProbability =
        (losses.filter(loss => loss > 0).length / losses.length) * 100;

    const var95 = percentile(losses, 95);
    const worstLosses = losses.filter(loss => loss >= var95);

    const cvar95 = worstLosses.length > 0
        ? worstLosses.reduce((sum, loss) => sum + loss, 0) / worstLosses.length
        : var95;

    document.getElementById('simulation-results').classList.remove('hidden');

    document.getElementById('best-scenario').textContent = formatTL(p95);
    document.getElementById('likely-scenario').textContent = formatTL(median);
    document.getElementById('worst-scenario').textContent = formatTL(p5);

    document.getElementById('loss-probability').textContent = `%${lossProbability.toFixed(1)}`;
    document.getElementById('expected-final-value').textContent = formatTL(expected);
    document.getElementById('simulation-var').textContent = formatTL(var95);
    document.getElementById('simulation-cvar').textContent = formatTL(cvar95);

    const minReturn = ((p5 - initialAmount) / initialAmount) * 100;
    const maxReturn = ((p95 - initialAmount) / initialAmount) * 100;

    document.getElementById('min-return').textContent = `${minReturn.toFixed(1)}%`;
    document.getElementById('max-return').textContent = `${maxReturn >= 0 ? '+' : ''}${maxReturn.toFixed(1)}%`;

    updateSimulationChart(pathsForChart, years);
}

function updateSimulationChart(paths, years) {
    const chartDom = document.getElementById('simulation-chart');
    if (!chartDom) return;

    if (simulationChart) {
        simulationChart.dispose();
    }

    const chart = echarts.init(chartDom);

    const yearLabels = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i <= years; i++) {
        yearLabels.push(String(currentYear + i));
    }

    const series = paths.map((path, index) => ({
        name: `Simülasyon ${index + 1}`,
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: {
            width: 1,
            opacity: 0.25
        },
        data: path.map(x => Math.round(x))
    }));

    chart.setOption({
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                const year = params[0]?.axisValue || '';
                const shown = params.slice(0, 5);

                let html = `<strong>${year}</strong><br>`;

                shown.forEach(p => {
                    html += `${p.marker} ${p.seriesName}: ${formatTL(p.value)}<br>`;
                });

                if (params.length > 5) {
                    html += `<span style="color:#999">+${params.length - 5} simülasyon daha</span>`;
                }

                return html;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: yearLabels
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: value => `₺${Number(value).toLocaleString('tr-TR')}`
            }
        },
        series
    });

    simulationChart = chart;
}

function resetSimulation() {
    document.getElementById('simulation-amount').value = '100000';
    document.getElementById('simulation-period').value = '5';
    document.getElementById('simulation-risk').value = 'balanced';
    document.getElementById('simulation-count').value = '5000';

    document.getElementById('simulation-results').classList.add('hidden');

    document.getElementById('best-scenario').textContent = '--';
    document.getElementById('likely-scenario').textContent = '--';
    document.getElementById('worst-scenario').textContent = '--';
    document.getElementById('loss-probability').textContent = '--';
    document.getElementById('expected-final-value').textContent = '--';
    document.getElementById('simulation-var').textContent = '--';
    document.getElementById('simulation-cvar').textContent = '--';
    document.getElementById('min-return').textContent = '--';
    document.getElementById('max-return').textContent = '--';

    if (simulationChart) {
        simulationChart.dispose();
        simulationChart = null;
    }
}

// =========================
// RISK
// =========================

function calculateRiskProfile() {
    const allocations = [
        { key: 'stock', name: 'Hisse Senedi', value: getInputValue('risk-stock'), risk: 7 },
        { key: 'gold', name: 'Altın', value: getInputValue('risk-gold'), risk: 4 },
        { key: 'fx', name: 'Döviz', value: getInputValue('risk-fx'), risk: 3 },
        { key: 'cash', name: 'Nakit / Mevduat', value: getInputValue('risk-cash'), risk: 1 },
        { key: 'bond', name: 'Tahvil / Fon', value: getInputValue('risk-bond'), risk: 4 },
        { key: 'crypto', name: 'Kripto / Yüksek Risk', value: getInputValue('risk-crypto'), risk: 10 }
    ];

    const total = allocations.reduce((sum, item) => sum + item.value, 0);
    const warning = document.getElementById('risk-total-warning');

    if (warning && Math.round(total) !== 100) {
        warning.classList.remove('hidden');
        warning.className = 'text-sm mt-3 text-red-600 font-semibold';
        warning.textContent = `Toplam dağılım %100 olmalı. Şu an: %${total}`;
        return;
    }

    if (warning) warning.classList.add('hidden');

    const riskScore = allocations.reduce((sum, item) => {
        return sum + (item.value * item.risk);
    }, 0) / 100;

    const activeClasses = allocations.filter(item => item.value > 0).length;
    const maxAllocation = Math.max(...allocations.map(item => item.value));

    const mainRisk = allocations
        .map(item => ({
            ...item,
            contribution: item.value * item.risk
        }))
        .sort((a, b) => b.contribution - a.contribution)[0];

    const riskLabel = getAllocationRiskLabel(riskScore);
    const diversification = getAllocationDiversification(activeClasses, maxAllocation);
    const suggestions = generateAllocationSuggestions(allocations, riskScore, maxAllocation, mainRisk);

    const scoreEl = document.getElementById('allocation-risk-score');
    const labelEl = document.getElementById('allocation-risk-label');
    const divEl = document.getElementById('allocation-diversification');
    const mainEl = document.getElementById('allocation-main-risk');
    const suggestionList = document.getElementById('allocation-suggestions');

    if (scoreEl) scoreEl.textContent = `${riskScore.toFixed(1)} / 10`;

    if (labelEl) {
        labelEl.textContent = riskLabel.text;
        labelEl.className = `text-sm font-semibold mt-1 ${riskLabel.color}`;
    }

    if (divEl) {
        divEl.textContent = diversification.text;
        divEl.className = `text-lg font-bold mt-1 ${diversification.color}`;
    }

    if (mainEl) mainEl.textContent = `${mainRisk.name} (%${mainRisk.value})`;

    if (suggestionList) {
        suggestionList.innerHTML = suggestions.map(item => `<li>${item}</li>`).join('');
    }

    updateRiskAllocationChart(allocations);
}

function getInputValue(id) {
    return parseFloat(document.getElementById(id)?.value || 0);
}

function getAllocationRiskLabel(score) {
    if (score < 3) return { text: 'Düşük Risk', color: 'text-green-600' };
    if (score < 5.5) return { text: 'Orta Risk', color: 'text-yellow-600' };
    if (score < 7.5) return { text: 'Yüksek Risk', color: 'text-orange-600' };
    return { text: 'Çok Yüksek Risk', color: 'text-red-600' };
}

function getAllocationDiversification(activeClasses, maxAllocation) {
    if (activeClasses >= 4 && maxAllocation <= 40) {
        return { text: 'İyi çeşitlendirilmiş', color: 'text-green-600' };
    }

    if (activeClasses >= 3 && maxAllocation <= 60) {
        return { text: 'Orta düzey çeşitlendirilmiş', color: 'text-yellow-600' };
    }

    return { text: 'Zayıf çeşitlendirilmiş', color: 'text-red-600' };
}

function generateAllocationSuggestions(allocations, riskScore, maxAllocation, mainRisk) {
    const suggestions = [];

    if (riskScore >= 7.5) {
        suggestions.push('Portföyünüz yüksek riskli varlıklara fazla ağırlık veriyor.');
    } else if (riskScore >= 5.5) {
        suggestions.push('Portföyünüz büyüme odaklı ancak dalgalanmalara açık.');
    } else if (riskScore >= 3) {
        suggestions.push('Portföyünüz dengeli bir risk profiline yakın görünüyor.');
    } else {
        suggestions.push('Portföyünüz korumacı bir yapıya sahip.');
    }

    if (maxAllocation > 60) {
        suggestions.push('Tek bir varlık sınıfı portföyün büyük bölümünü oluşturuyor; çeşitlendirme artırılabilir.');
    }

    if (mainRisk.key === 'crypto') {
        suggestions.push('En yüksek risk katkısı kripto/yüksek riskli varlıklardan geliyor.');
    }

    if (mainRisk.key === 'stock') {
        suggestions.push('Hisse senedi ağırlığı portföy riskini belirgin şekilde etkiliyor.');
    }

    const cash = allocations.find(x => x.key === 'cash')?.value || 0;
    if (cash < 5) {
        suggestions.push('Likidite için küçük bir nakit/mevduat payı eklemek riski dengeleyebilir.');
    }

    const gold = allocations.find(x => x.key === 'gold')?.value || 0;
    const fx = allocations.find(x => x.key === 'fx')?.value || 0;
    if (gold + fx > 50) {
        suggestions.push('Altın ve döviz ağırlığı yüksek; kur ve emtia hareketlerine duyarlılık artabilir.');
    }

    return suggestions;
}

function updateRiskAllocationChart(allocations) {
    const chartDom = document.getElementById('risk-allocation-chart');
    if (!chartDom) return;

    if (riskChart) {
        riskChart.dispose();
    }

    const chart = echarts.init(chartDom);

    const data = allocations
        .filter(item => item.value > 0)
        .map(item => ({
            name: item.name,
            value: item.value
        }));

    chart.setOption({
        tooltip: {
            trigger: 'item',
            formatter: '{b}: %{c}'
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series: [{
            name: 'Varlık Dağılımı',
            type: 'pie',
            radius: ['40%', '70%'],
            data
        }]
    });

    riskChart = chart;
}

// =========================
// BUDGET
// =========================

function addExpense() {
    const modal = createModal('Yeni Gider Ekle', `
        <form>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                    <select id="expense-category" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                        <option value="Konut">Konut</option>
                        <option value="Gıda">Gıda</option>
                        <option value="Ulaşım">Ulaşım</option>
                        <option value="Eğlence">Eğlence</option>
                        <option value="Eğitim">Eğitim</option>
                        <option value="Sağlık">Sağlık</option>
                        <option value="Diğer">Diğer</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                    <input type="text" id="expense-description" placeholder="Örn: Market alışverişi" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Gider Tutarı (₺)</label>
                    <input type="number" id="expense-amount" placeholder="0" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                </div>
            </div>

            <div class="flex space-x-4 mt-6">
                <button type="button" onclick="saveExpense()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">
                    Kaydet
                </button>
                <button type="button" onclick="closeModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg">
                    İptal
                </button>
            </div>
        </form>
    `);

    document.body.appendChild(modal);
}

function saveExpense() {
    const category = document.getElementById('expense-category').value;
    const description = document.getElementById('expense-description').value || category;
    const amount = parseFloat(document.getElementById('expense-amount').value);

    if (!amount || amount <= 0) {
        alert('Lütfen geçerli gider tutarı girin.');
        return;
    }

    budgetData.expenses.push({ category, description, amount });

    closeModal();
    updateBudgetDashboard();
    showNotification('Gider başarıyla eklendi!', 'success');
}

function updateBudgetDashboard() {
    const incomeInput = document.getElementById('monthly-income-input');

    if (incomeInput) {
        budgetData.income = parseFloat(incomeInput.value) || 0;
    }

    const totalExpense = budgetData.expenses.reduce((sum, item) => sum + item.amount, 0);
    const saving = budgetData.income - totalExpense;
    const savingRate = budgetData.income > 0 ? (saving / budgetData.income) * 100 : 0;

    const incomeEl = document.getElementById('monthly-income');
    const expenseEl = document.getElementById('monthly-expense');
    const savingEl = document.getElementById('monthly-saving');
    const savingRateEl = document.getElementById('saving-rate');

    if (incomeEl) incomeEl.textContent = `₺${budgetData.income.toLocaleString('tr-TR')}`;
    if (expenseEl) expenseEl.textContent = `₺${totalExpense.toLocaleString('tr-TR')}`;

    if (savingEl) {
        savingEl.textContent = `₺${saving.toLocaleString('tr-TR')}`;
        savingEl.className = saving >= 0
            ? 'text-3xl font-bold text-blue-600'
            : 'text-3xl font-bold text-red-600';
    }

    if (savingRateEl) savingRateEl.textContent = `%${savingRate.toFixed(1)} oranında`;

    updateExpenseChart();
    updateBudgetList();
}

function updateBudgetList() {
    const container = document.getElementById('budget-list');
    if (!container) return;

    container.innerHTML = '';

    budgetData.expenses.forEach((item, index) => {
        const incomeRate = budgetData.income > 0
            ? (item.amount / budgetData.income) * 100
            : 0;

        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-4 bg-blue-50 rounded-lg';

        div.innerHTML = `
            <div>
                <div class="font-medium text-gray-900">${item.category}</div>
                <div class="text-sm text-gray-500">${item.description}</div>
                <div class="text-xs text-blue-600 mt-1">
                    Gelirin %${incomeRate.toFixed(1)}'i
                </div>
            </div>

            <div class="flex items-center space-x-4">
                <div class="text-blue-600 font-bold">
                    ₺${item.amount.toLocaleString('tr-TR')}
                </div>

                <button onclick="removeExpense(${index})"
                    class="text-red-500 hover:text-red-700 font-bold text-lg">
                    ✕
                </button>
            </div>
        `;

        container.appendChild(div);
    });
}

function removeExpense(index) {
    const confirmDelete = confirm("Bu gideri silmek istediğine emin misin?");
    if (!confirmDelete) return;

    budgetData.expenses.splice(index, 1);

    updateBudgetDashboard();
    showNotification('Gider silindi', 'success');
}

function updateExpenseChart() {
    const chartDom = document.getElementById('expense-chart');
    if (!chartDom) return;

    if (expenseChart) {
        expenseChart.dispose();
    }

    const chart = echarts.init(chartDom);

    const grouped = {};

    budgetData.expenses.forEach(item => {
        grouped[item.category] = (grouped[item.category] || 0) + item.amount;
    });

    const chartData = Object.entries(grouped).map(([name, value]) => ({
        name,
        value
    }));

    chart.setOption({
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                return `${params.name}: ₺${Number(params.value).toLocaleString('tr-TR')} (${params.percent}%)`;
            }
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series: [{
            name: 'Giderler',
            type: 'pie',
            radius: ['40%', '70%'],
            data: chartData
        }]
    });

    expenseChart = chart;
}

// =========================
// HELPERS
// =========================

function generateYearlyData(years) {
    const data = [];
    const now = new Date();

    for (let i = 0; i <= years; i++) {
        data.push((now.getFullYear() + i).toString());
    }

    return data;
}

function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">${title}</h2>
                <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            ${content}
        </div>
    `;
    return modal;
}

function closeModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) modal.remove();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

    notification.className = `fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function initializeInteractions() {
    window.addEventListener('resize', function () {
        [portfolioChart, simulationChart, riskChart, expenseChart].forEach(chart => {
            if (chart) chart.resize();
        });
    });
}

// =========================
// GLOBAL EXPORTS
// =========================

window.switchTab = switchTab;
window.addInvestment = addInvestment;
window.saveInvestment = saveInvestment;
window.sellInvestment = sellInvestment;
window.runSimulation = runSimulation;
window.resetSimulation = resetSimulation;
window.addExpense = addExpense;
window.saveExpense = saveExpense;
window.updateBudgetDashboard = updateBudgetDashboard;
window.closeModal = closeModal;
window.handleAssetTypeChange = handleAssetTypeChange;
window.calculateRiskProfile = calculateRiskProfile;
window.removeExpense = removeExpense;