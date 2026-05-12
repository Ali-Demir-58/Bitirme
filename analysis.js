// Finansal Analiz Platformu - Analysis JavaScript with Supabase Persistence

// =========================
// GLOBAL STATE
// =========================
let currentTab = 'portfolio';
let portfolioChart = null;
let simulationChart = null;
let riskChart = null;
let expenseChart = null;
let userRiskProfile = null;

let analysisUser = null;
let marketStocks = [];
let marketGoldPrice = null;

let portfolioData = {
    totalValue: 0,
    monthlyReturn: 0,
    riskScore: 0,
    diversification: 0,
    holdings: []
};

let budgetData = {
    income: 25000,
    expenses: []
};

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', async function () {
    analysisUser = await getLoggedInUser();

    if (!analysisUser) {
        window.location.href = 'login.html';
        return;
    }

    await loadMarketDataForAnalysis();
    await loadUserFinancialData();
    await loadUserRiskProfile();
    renderRiskProfileCard();
    applyRiskProfileToRiskInputs();

    refreshPortfolioPrices();

    initializeCharts();
    initializeInteractions();

    updateHoldingsTable();
    updatePortfolioDisplay();
    updateBudgetDashboard(false);

    openTabFromHash();

    setTimeout(resizeAllCharts, 250);
});

// =========================
// AUTH
// =========================
async function getLoggedInUser() {
    if (typeof supabaseClient === 'undefined') {
        console.error('Supabase client bulunamadı.');
        return null;
    }

    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error('Session okunamadı:', error);
        return null;
    }

    return data.session?.user || null;
}

// =========================
// SAFE HELPERS
// =========================
function getEl(id) {
    return document.getElementById(id);
}

function safeText(id, value) {
    const el = getEl(id);
    if (el) el.textContent = value;
}

function formatTL(value, digits = 0) {
    return `₺${Number(value || 0).toLocaleString('tr-TR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    })}`;
}

function formatNumber(value, digits = 2) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '--';

    return Number(value).toLocaleString('tr-TR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    });
}

function resizeAllCharts() {
    [portfolioChart, simulationChart, riskChart, expenseChart].forEach(chart => {
        if (chart && typeof chart.resize === 'function') {
            chart.resize();
        }
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');

    const bgColor =
        type === 'success'
            ? 'bg-green-500'
            : type === 'error'
                ? 'bg-red-500'
                : 'bg-blue-500';

    notification.className =
        `fixed top-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`;

    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// =========================
// SUPABASE USER DATA
// =========================
async function loadUserFinancialData() {
    await Promise.all([
        loadUserPortfolio(),
        loadUserExpenses(),
        loadUserSettings()
    ]);
}

async function loadUserPortfolio() {
    const { data, error } = await supabaseClient
        .from('portfolios')
        .select('id, symbol, name, amount, buy_price, created_at')
        .eq('user_id', analysisUser.id)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Portföy verisi alınamadı:', error);
        portfolioData.holdings = [];
        return;
    }

    portfolioData.holdings = (data || []).map(item => ({
        id: item.id,
        symbol: item.symbol,
        name: item.name || item.symbol,
        amount: Number(item.amount),
        buyPrice: Number(item.buy_price),
        currentPrice: Number(item.buy_price)
    }));
}

async function loadUserExpenses() {
    const { data, error } = await supabaseClient
        .from('expenses')
        .select('id, category, description, amount, created_at')
        .eq('user_id', analysisUser.id)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Gider verisi alınamadı:', error);
        budgetData.expenses = [];
        return;
    }

    budgetData.expenses = (data || []).map(item => ({
        id: item.id,
        category: item.category,
        description: item.description || item.category,
        amount: Number(item.amount)
    }));
}

async function loadUserSettings() {
    const { data, error } = await supabaseClient
        .from('user_settings')
        .select('monthly_income')
        .eq('user_id', analysisUser.id)
        .maybeSingle();

    if (error) {
        console.error('Kullanıcı ayarları alınamadı:', error);
        return;
    }

    if (!data) {
        const { error: insertError } = await supabaseClient
            .from('user_settings')
            .insert({
                user_id: analysisUser.id,
                monthly_income: 25000
            });

        if (insertError) {
            console.error('Varsayılan kullanıcı ayarı oluşturulamadı:', insertError);
        }

        budgetData.income = 25000;
    } else {
        budgetData.income = Number(data.monthly_income || 25000);
    }

    const incomeInput = getEl('monthly-income-input');
    if (incomeInput) {
        incomeInput.value = budgetData.income;
    }
}

async function saveMonthlyIncomeToSupabase() {
    if (!analysisUser) return;

    const { error } = await supabaseClient
        .from('user_settings')
        .upsert({
            user_id: analysisUser.id,
            monthly_income: budgetData.income,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        });

    if (error) {
        console.error('Gelir bilgisi kaydedilemedi:', error);
        showNotification('Gelir bilgisi kaydedilemedi.', 'error');
        return;
    }

    showNotification('Gelir bilgisi kaydedildi.', 'success');
}

// =========================
// MARKET DATA
// =========================
async function loadMarketDataForAnalysis() {
    try {
        const res = await fetch('/api/market-data');

        if (!res.ok) {
            throw new Error(`API hatası: ${res.status}`);
        }

        const data = await res.json();

        marketStocks = Array.isArray(data.stocks) ? data.stocks : [];
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
    return marketStocks.find(item => normalizeSymbol(item.symbol) === cleanSymbol);
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

    const selectedContent = getEl(`content-${tabName}`);
    if (!selectedContent) return;

    selectedContent.classList.remove('hidden');

    document.querySelectorAll('[id^="tab-"]').forEach(button => {
        button.classList.remove('active');
        button.classList.add('bg-gray-100', 'text-gray-700');
    });

    const activeTab = getEl(`tab-${tabName}`);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.classList.remove('bg-gray-100', 'text-gray-700');
    }

    currentTab = tabName;

    if (history.pushState) {
        history.replaceState(null, '', `#${tabName}`);
    }

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

        resizeAllCharts();
    }, 200);
}

function openTabFromHash() {
    const hash = window.location.hash.replace('#', '').trim();

    const allowedTabs = ['portfolio', 'simulation', 'risk', 'budget'];

    if (allowedTabs.includes(hash)) {
        switchTab(hash);
    }
}

// =========================
// CHARTS
// =========================
function initializeCharts() {
    initializePortfolioCharts();
}

function initializePortfolioCharts() {
    const chartDom = getEl('portfolio-pie-chart');
    if (!chartDom || typeof echarts === 'undefined') return;

    if (portfolioChart) {
        portfolioChart.dispose();
    }

    const pieChart = echarts.init(chartDom);

    const pieData = portfolioData.holdings.map(holding => ({
        value: holding.amount * holding.currentPrice,
        name: holding.symbol
    }));

    const displayData = pieData.length
        ? pieData
        : [{ value: 1, name: 'Veri Yok' }];

    pieChart.setOption({
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                if (params.name === 'Veri Yok') return 'Henüz yatırım eklenmedi.';
                return `${params.name}: ${formatTL(params.value, 2)} (${params.percent}%)`;
            }
        },
        legend: {
            orient: window.innerWidth < 768 ? 'horizontal' : 'vertical',
            left: window.innerWidth < 768 ? 'center' : 'left',
            bottom: window.innerWidth < 768 ? 0 : undefined,
            textStyle: {
                color: '#6b7280'
            }
        },
        series: [{
            name: 'Portföy',
            type: 'pie',
            radius: window.innerWidth < 768 ? ['35%', '62%'] : ['40%', '70%'],
            center: window.innerWidth < 768 ? ['50%', '45%'] : ['55%', '50%'],
            avoidLabelOverlap: true,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: {
                show: false
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 16,
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: displayData
        }]
    });

    portfolioChart = pieChart;
}

function initializeSimulationChart() {
    if (simulationChart) {
        simulationChart.resize();
    }
}

function initializeRiskChart() {
    const chartDom = getEl('risk-allocation-chart');
    if (!chartDom) return;

    calculateRiskProfile();
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
                ((Number(marketStock.high) - Number(marketStock.low)) / Number(marketStock.last)) * 100;

            const dailyMovement = Math.abs(Number(marketStock.change || 0));

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

    safeText('total-value', formatTL(totalValue, 2));
    safeText('total-change', `${totalProfitPercent >= 0 ? '+' : ''}${totalProfitPercent.toFixed(2)}%`);
    safeText('monthly-return', `${totalProfit >= 0 ? '+' : ''}${formatTL(totalProfit, 2)}`);
    safeText('risk-score', metrics.riskScore.toFixed(1));
    safeText('diversification', `${metrics.diversification.toFixed(0)}%`);

    const riskLabel = document.querySelector('#risk-score')?.nextElementSibling?.nextElementSibling;
    if (riskLabel) {
        riskLabel.textContent = risk.text;
        riskLabel.className = `text-sm font-medium ${risk.color}`;
    }

    const divLabel = document.querySelector('#diversification')?.nextElementSibling?.nextElementSibling;
    if (divLabel) {
        divLabel.textContent = diversification.text;
        divLabel.className = `text-sm font-medium ${diversification.color}`;
    }
}

function updateHoldingsTable() {
    const tbody = getEl('holdings-table');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!portfolioData.holdings.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="py-6 px-4 text-center text-gray-500">
                    Henüz yatırım eklenmedi.
                </td>
            </tr>
        `;
        return;
    }

    portfolioData.holdings.forEach(holding => {
        const currentValue = holding.amount * holding.currentPrice;
        const buyValue = holding.amount * holding.buyPrice;

        const profit = currentValue - buyValue;
        const profitPercent = buyValue > 0 ? (profit / buyValue * 100).toFixed(2) : '0.00';

        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100 hover:bg-gray-50';

        row.innerHTML = `
            <td class="py-3 px-4 whitespace-nowrap">
                <div class="flex items-center">
                    <span class="font-medium text-gray-900">${holding.symbol}</span>
                    <span class="ml-2 text-sm text-gray-500">${holding.name}</span>
                </div>
            </td>
            <td class="text-right py-3 px-4 whitespace-nowrap">${holding.amount}</td>
            <td class="text-right py-3 px-4 whitespace-nowrap">${formatTL(holding.buyPrice, 2)}</td>
            <td class="text-right py-3 px-4 whitespace-nowrap">${formatTL(holding.currentPrice, 2)}</td>
            <td class="text-right py-3 px-4 font-medium whitespace-nowrap">${formatTL(currentValue, 2)}</td>
            <td class="text-right py-3 px-4 ${profit >= 0 ? 'text-green-600' : 'text-red-600'} font-medium whitespace-nowrap">
                ${profit >= 0 ? '+' : ''}${formatTL(profit, 2)}
                (${profit >= 0 ? '+' : ''}${profitPercent}%)
            </td>
            <td class="text-center py-3 px-4 whitespace-nowrap">
                <button onclick="sellInvestment('${holding.id}')" class="text-red-600 hover:text-red-800 font-medium">Sat</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// =========================
// ADD / SELL INVESTMENT - SUPABASE
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

            <div class="flex flex-col sm:flex-row gap-4 mt-6">
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
    const type = getEl('asset-type')?.value;
    const symbolInput = getEl('asset-symbol');

    if (!symbolInput) return;

    if (type === 'gold') {
        symbolInput.value = 'GOLD';
    } else if (symbolInput.value === 'GOLD' || symbolInput.value === 'ALTIN') {
        symbolInput.value = '';
    }
}

async function saveInvestment() {
    await loadMarketDataForAnalysis();

    const symbolInput = getEl('asset-symbol')?.value || '';
    const symbol = normalizeSymbol(symbolInput);

    const amount = parseFloat(getEl('asset-amount')?.value);
    const price = parseFloat(getEl('asset-price')?.value);

    if (!symbol || !amount || !price) {
        alert('Lütfen tüm alanları doldurun.');
        return;
    }

    let assetName = symbol;
    let finalSymbol = symbol;

    if (isGoldSymbol(symbol)) {
        finalSymbol = 'GOLD';
        assetName = 'Gram Altın';
    } else {
        const marketStock = findMarketStock(symbol);
        assetName = marketStock?.name || symbol;
    }

    const { error } = await supabaseClient
        .from('portfolios')
        .insert({
            user_id: analysisUser.id,
            symbol: finalSymbol,
            name: assetName,
            amount: amount,
            buy_price: price
        });

    if (error) {
        console.error('Yatırım kaydedilemedi:', error);
        showNotification('Yatırım kaydedilemedi.', 'error');
        return;
    }

    await loadUserPortfolio();
    refreshPortfolioPrices();

    updateHoldingsTable();
    updatePortfolioDisplay();
    initializePortfolioCharts();

    closeModal();
    showNotification('Yatırım başarıyla kaydedildi.', 'success');
}

async function sellInvestment(holdingId) {
    const holding = portfolioData.holdings.find(h => h.id === holdingId);

    if (!holding) return;

    const input = prompt(`${holding.symbol} için kaç adet satmak istiyorsunuz?\nMevcut adet: ${holding.amount}`);

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
        const { error } = await supabaseClient
            .from('portfolios')
            .delete()
            .eq('id', holding.id)
            .eq('user_id', analysisUser.id);

        if (error) {
            console.error('Yatırım silinemedi:', error);
            showNotification('Yatırım silinemedi.', 'error');
            return;
        }
    } else {
        const newAmount = holding.amount - sellAmount;

        const { error } = await supabaseClient
            .from('portfolios')
            .update({ amount: newAmount })
            .eq('id', holding.id)
            .eq('user_id', analysisUser.id);

        if (error) {
            console.error('Yatırım güncellenemedi:', error);
            showNotification('Yatırım güncellenemedi.', 'error');
            return;
        }
    }

    await loadUserPortfolio();
    refreshPortfolioPrices();

    updateHoldingsTable();
    updatePortfolioDisplay();
    initializePortfolioCharts();

    showNotification('Satış bilgisi kaydedildi.', 'success');
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

function runSimulation() {
    const initialAmount = parseFloat(getEl('simulation-amount')?.value);
    const years = parseInt(getEl('simulation-period')?.value);
    const risk = getEl('simulation-risk')?.value;
    const simulationCount = parseInt(getEl('simulation-count')?.value);

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
    const lossProbability = (losses.filter(loss => loss > 0).length / losses.length) * 100;

    const var95 = percentile(losses, 95);
    const worstLosses = losses.filter(loss => loss >= var95);

    const cvar95 = worstLosses.length > 0
        ? worstLosses.reduce((sum, loss) => sum + loss, 0) / worstLosses.length
        : var95;

    getEl('simulation-results')?.classList.remove('hidden');

    safeText('best-scenario', formatTL(p95));
    safeText('likely-scenario', formatTL(median));
    safeText('worst-scenario', formatTL(p5));

    safeText('loss-probability', `%${lossProbability.toFixed(1)}`);
    safeText('expected-final-value', formatTL(expected));
    safeText('simulation-var', formatTL(var95));
    safeText('simulation-cvar', formatTL(cvar95));

    const minReturn = ((p5 - initialAmount) / initialAmount) * 100;
    const maxReturn = ((p95 - initialAmount) / initialAmount) * 100;

    safeText('min-return', `${minReturn.toFixed(1)}%`);
    safeText('max-return', `${maxReturn >= 0 ? '+' : ''}${maxReturn.toFixed(1)}%`);

    updateSimulationChart(pathsForChart, years);

    setTimeout(resizeAllCharts, 200);
}

function updateSimulationChart(paths, years) {
    const chartDom = getEl('simulation-chart');
    if (!chartDom || typeof echarts === 'undefined') return;

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
            bottom: '5%',
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
    if (getEl('simulation-amount')) getEl('simulation-amount').value = '100000';
    if (getEl('simulation-period')) getEl('simulation-period').value = '5';
    if (getEl('simulation-risk')) getEl('simulation-risk').value = 'balanced';
    if (getEl('simulation-count')) getEl('simulation-count').value = '5000';

    getEl('simulation-results')?.classList.add('hidden');

    [
        'best-scenario',
        'likely-scenario',
        'worst-scenario',
        'loss-probability',
        'expected-final-value',
        'simulation-var',
        'simulation-cvar',
        'min-return',
        'max-return'
    ].forEach(id => safeText(id, '--'));

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
    const warning = getEl('risk-total-warning');

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

    safeText('allocation-risk-score', `${riskScore.toFixed(1)} / 10`);

    const labelEl = getEl('allocation-risk-label');
    if (labelEl) {
        labelEl.textContent = riskLabel.text;
        labelEl.className = `text-sm font-semibold mt-1 ${riskLabel.color}`;
    }

    const divEl = getEl('allocation-diversification');
    if (divEl) {
        divEl.textContent = diversification.text;
        divEl.className = `text-lg font-bold mt-1 ${diversification.color}`;
    }

    safeText('allocation-main-risk', `${mainRisk.name} (%${mainRisk.value})`);

    const suggestionList = getEl('allocation-suggestions');
    if (suggestionList) {
        suggestionList.innerHTML = suggestions.map(item => `<li>${item}</li>`).join('');
    }

    updateRiskAllocationChart(allocations);
}

function getInputValue(id) {
    return parseFloat(getEl(id)?.value || 0);
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
    const chartDom = getEl('risk-allocation-chart');
    if (!chartDom || typeof echarts === 'undefined') return;

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
            orient: window.innerWidth < 768 ? 'horizontal' : 'vertical',
            left: window.innerWidth < 768 ? 'center' : 'left',
            bottom: window.innerWidth < 768 ? 0 : undefined
        },
        series: [{
            name: 'Varlık Dağılımı',
            type: 'pie',
            radius: window.innerWidth < 768 ? ['35%', '62%'] : ['40%', '70%'],
            center: window.innerWidth < 768 ? ['50%', '45%'] : ['55%', '50%'],
            data
        }]
    });

    riskChart = chart;
}

// =========================
// BUDGET - SUPABASE
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

            <div class="flex flex-col sm:flex-row gap-4 mt-6">
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

async function saveExpense() {
    const category = getEl('expense-category')?.value;
    const description = getEl('expense-description')?.value || category;
    const amount = parseFloat(getEl('expense-amount')?.value);

    if (!amount || amount <= 0) {
        alert('Lütfen geçerli gider tutarı girin.');
        return;
    }

    const { error } = await supabaseClient
        .from('expenses')
        .insert({
            user_id: analysisUser.id,
            category,
            description,
            amount
        });

    if (error) {
        console.error('Gider kaydedilemedi:', error);
        showNotification('Gider kaydedilemedi.', 'error');
        return;
    }

    await loadUserExpenses();

    closeModal();
    updateBudgetDashboard(false);
    showNotification('Gider başarıyla kaydedildi.', 'success');
}

async function updateBudgetDashboard(shouldSaveIncome = true) {
    const incomeInput = getEl('monthly-income-input');

    if (incomeInput) {
        budgetData.income = parseFloat(incomeInput.value) || 0;
    }

    const totalExpense = budgetData.expenses.reduce((sum, item) => sum + item.amount, 0);
    const saving = budgetData.income - totalExpense;
    const savingRate = budgetData.income > 0 ? (saving / budgetData.income) * 100 : 0;

    safeText('monthly-income', formatTL(budgetData.income));
    safeText('monthly-expense', formatTL(totalExpense));

    const savingEl = getEl('monthly-saving');
    if (savingEl) {
        savingEl.textContent = formatTL(saving);
        savingEl.className = saving >= 0
            ? 'text-3xl font-bold text-blue-600 break-words'
            : 'text-3xl font-bold text-red-600 break-words';
    }

    safeText('saving-rate', `%${savingRate.toFixed(1)} oranında`);

    updateExpenseChart();
    updateBudgetList();

    if (shouldSaveIncome) {
        await saveMonthlyIncomeToSupabase();
    }
}

function updateBudgetList() {
    const container = getEl('budget-list');
    if (!container) return;

    container.innerHTML = '';

    if (!budgetData.expenses.length) {
        container.innerHTML = `
            <div class="p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
                Henüz gider eklenmedi.
            </div>
        `;
        return;
    }

    budgetData.expenses.forEach((item, index) => {
        const incomeRate = budgetData.income > 0
            ? (item.amount / budgetData.income) * 100
            : 0;

        const div = document.createElement('div');
        div.className = 'flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-blue-50 rounded-lg';

        div.innerHTML = `
            <div>
                <div class="font-medium text-gray-900">${item.category}</div>
                <div class="text-sm text-gray-500">${item.description}</div>
                <div class="text-xs text-blue-600 mt-1">
                    Gelirin %${incomeRate.toFixed(1)}'i
                </div>
            </div>

            <div class="flex items-center justify-between sm:justify-end gap-4">
                <div class="text-blue-600 font-bold whitespace-nowrap">
                    ${formatTL(item.amount)}
                </div>

                <button onclick="removeExpense('${item.id}')"
                    class="text-red-500 hover:text-red-700 font-bold text-lg">
                    ✕
                </button>
            </div>
        `;

        container.appendChild(div);
    });
}

async function removeExpense(expenseId) {
    const confirmDelete = confirm('Bu gideri silmek istediğine emin misin?');
    if (!confirmDelete) return;

    const { error } = await supabaseClient
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .eq('user_id', analysisUser.id);

    if (error) {
        console.error('Gider silinemedi:', error);
        showNotification('Gider silinemedi.', 'error');
        return;
    }

    await loadUserExpenses();

    updateBudgetDashboard(false);
    showNotification('Gider silindi.', 'success');
}

function updateExpenseChart() {
    const chartDom = getEl('expense-chart');
    if (!chartDom || typeof echarts === 'undefined') return;

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

    const displayData = chartData.length
        ? chartData
        : [{ name: 'Veri Yok', value: 1 }];

    chart.setOption({
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                if (params.name === 'Veri Yok') return 'Henüz gider eklenmedi.';
                return `${params.name}: ${formatTL(params.value)} (${params.percent}%)`;
            }
        },
        legend: {
            orient: window.innerWidth < 768 ? 'horizontal' : 'vertical',
            left: window.innerWidth < 768 ? 'center' : 'left',
            bottom: window.innerWidth < 768 ? 0 : undefined
        },
        series: [{
            name: 'Giderler',
            type: 'pie',
            radius: window.innerWidth < 768 ? ['35%', '62%'] : ['40%', '70%'],
            center: window.innerWidth < 768 ? ['50%', '45%'] : ['55%', '50%'],
            data: displayData
        }]
    });

    expenseChart = chart;
}

// =========================
// MODAL
// =========================
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

    modal.innerHTML = `
        <div class="bg-white rounded-xl p-5 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-start gap-4 mb-6">
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

// =========================
// INTERACTIONS
// =========================
function initializeInteractions() {
    window.addEventListener('resize', resizeAllCharts);
    window.addEventListener('hashchange', openTabFromHash);
}

// =========================
// USER RISK PROFILE
// =========================

async function loadUserRiskProfile() {
    if (!analysisUser) return;

    const { data, error } = await supabaseClient
        .from('risk_profiles')
        .select('score, profile_type, description, allocation, updated_at, created_at')
        .eq('user_id', analysisUser.id)
        .maybeSingle();

    if (error) {
        console.error('Risk profili alınamadı:', error);
        userRiskProfile = null;
        return;
    }

    if (!data) {
        window.location.href = 'risk-test.html';
        return;
    }

    userRiskProfile = data;
}

function renderRiskProfileCard() {
    if (!userRiskProfile) return;

    const profileType = userRiskProfile.profile_type || 'Profil Bulunamadı';
    const description = userRiskProfile.description || 'Risk profili açıklaması bulunamadı.';
    const score = userRiskProfile.score ?? '--';
    const allocation = userRiskProfile.allocation || {};
    const updatedAt = userRiskProfile.updated_at || userRiskProfile.created_at;

    const emoji = getRiskProfileEmoji(profileType);

    safeText('risk-profile-emoji', emoji);
    safeText('risk-profile-type', profileType);
    safeText('risk-profile-description', description);
    safeText('risk-profile-score', `${score} / 40`);
    safeText('risk-profile-date', formatRiskProfileDate(updatedAt));

    renderRiskProfileAllocation(allocation);
}

function getRiskProfileEmoji(profileType) {
    const text = String(profileType || '').toLowerCase();

    if (text.includes('korumacı')) return '🛡️';
    if (text.includes('dengeli')) return '⚖️';
    if (text.includes('atak')) return '🚀';

    return '📊';
}

function formatRiskProfileDate(dateValue) {
    if (!dateValue) return '--';

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return '--';

    return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function renderRiskProfileAllocation(allocation) {
    const container = document.getElementById('risk-profile-allocation');

    if (!container) return;

    const entries = Object.entries(allocation || {});

    if (!entries.length) {
        container.innerHTML = `
            <div class="text-sm text-gray-500">
                Önerilen dağılım bilgisi bulunamadı.
            </div>
        `;
        return;
    }

    container.innerHTML = entries.map(([asset, percent]) => `
        <div>
            <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium text-gray-700">${asset}</span>
                <span class="text-sm font-bold text-blue-600">%${percent}</span>
            </div>

            <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${Number(percent) || 0}%;"></div>
            </div>
        </div>
    `).join('');
}

function applyRiskProfileToRiskInputs() {
    if (!userRiskProfile || !userRiskProfile.allocation) return;

    const mappedAllocation = mapRiskProfileAllocationToInputs(userRiskProfile.allocation);

    Object.entries(mappedAllocation).forEach(([inputId, value]) => {
        const input = document.getElementById(inputId);

        if (input) {
            input.value = value;
        }
    });

    if (typeof calculateRiskProfile === 'function') {
        calculateRiskProfile();
    }
}

function mapRiskProfileAllocationToInputs(allocation) {
    const result = {
        'risk-stock': 0,
        'risk-gold': 0,
        'risk-fx': 0,
        'risk-cash': 0,
        'risk-bond': 0,
        'risk-crypto': 0
    };

    Object.entries(allocation).forEach(([asset, value]) => {
        const key = String(asset).toLowerCase();
        const percent = Number(value) || 0;

        if (key.includes('hisse')) {
            result['risk-stock'] += percent;
        } else if (key.includes('altın')) {
            result['risk-gold'] += percent;
        } else if (key.includes('döviz')) {
            result['risk-fx'] += percent;
        } else if (key.includes('nakit') || key.includes('mevduat')) {
            result['risk-cash'] += percent;
        } else if (key.includes('tahvil') || key.includes('fon') || key.includes('dibs')) {
            result['risk-bond'] += percent;
        } else if (key.includes('kripto') || key.includes('yüksek')) {
            result['risk-crypto'] += percent;
        }
    });

    return result;
}

// =========================
// GLOBAL EXPORTS
// =========================
window.switchTab = switchTab;

window.addInvestment = addInvestment;
window.saveInvestment = saveInvestment;
window.sellInvestment = sellInvestment;
window.handleAssetTypeChange = handleAssetTypeChange;

window.runSimulation = runSimulation;
window.resetSimulation = resetSimulation;

window.calculateRiskProfile = calculateRiskProfile;

window.addExpense = addExpense;
window.saveExpense = saveExpense;
window.updateBudgetDashboard = updateBudgetDashboard;
window.removeExpense = removeExpense;

window.closeModal = closeModal;