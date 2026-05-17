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
let marketFunds = [];
let marketGoldPrice = null;

let portfolioData = {
    totalValue: 0,
    monthlyReturn: 0,
    riskScore: 0,
    diversification: 0,
    holdings: []
};


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

        marketStocks = Array.isArray(data.stocks)
            ? data.stocks
            : [];

        marketFunds = Array.isArray(data.funds)
            ? data.funds
            : [];

        marketGoldPrice = data.gold?.['ALIŞ']
            ? Number(data.gold['ALIŞ'])
            : null;

    } catch (err) {
        console.error('Piyasa verisi alınamadı:', err);

        marketStocks = [];
        marketFunds = [];
        marketGoldPrice = null;
    }
}


// =========================
// HELPERS
// =========================
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

    return marketStocks.find(item =>
        normalizeSymbol(item.symbol) === cleanSymbol
    );
}

function findMarketFund(symbol) {
    const cleanSymbol = normalizeSymbol(symbol);

    return marketFunds.find(item =>
        normalizeSymbol(item.code) === cleanSymbol
    );
}


// =========================
// PORTFOLIO PRICE REFRESH
// =========================
function refreshPortfolioPrices() {

    portfolioData.holdings.forEach(holding => {

        // ALTIN
        if (isGoldSymbol(holding.symbol)) {

            if (marketGoldPrice) {
                holding.symbol = 'GOLD';
                holding.name = 'Gram Altın';
                holding.currentPrice = marketGoldPrice;
            }

            return;
        }

        // FON
        if (holding.assetType === 'fund') {

            const marketFund = findMarketFund(holding.symbol);

            if (marketFund && marketFund.price) {

                holding.currentPrice = Number(marketFund.price);

                holding.name =
                    marketFund.name ||
                    holding.name;
            }

            return;
        }

        // HİSSE
        const marketStock = findMarketStock(holding.symbol);

        if (marketStock && marketStock.last) {

            holding.symbol =
                normalizeSymbol(marketStock.symbol);

            holding.currentPrice =
                Number(marketStock.last);

            holding.name =
                marketStock.name ||
                holding.name;
        }

    });

}


// =========================
// ADD INVESTMENT
// =========================
function addInvestment() {

    const stockOptions = marketStocks.map(stock => `
        <option value="${stock.symbol}">
            ${stock.symbol} - ${stock.name}
        </option>
    `).join('');

    const fundOptions = marketFunds.map(fund => `
        <option value="${fund.code}">
            ${fund.code} - ${fund.name}
        </option>
    `).join('');

    const modal = createModal('Yeni Yatırım Ekle', `

        <form id="investment-form">

            <div class="space-y-4">

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Varlık Türü
                    </label>

                    <select id="asset-type"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        onchange="handleAssetTypeChange()">

                        <option value="stock">Hisse Senedi</option>
                        <option value="gold">Altın</option>
                        <option value="fund">Yatırım Fonu</option>

                    </select>
                </div>


                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Sembol / Kod
                    </label>

                    <input
                        list="asset-symbol-list"
                        type="text"
                        id="asset-symbol"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Kod giriniz"
                    >

                    <datalist id="asset-symbol-list">
                        ${stockOptions}
                        ${fundOptions}
                        <option value="GOLD">GOLD - Gram Altın</option>
                    </datalist>

                </div>


                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Miktar
                    </label>

                    <input
                        type="number"
                        id="asset-amount"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Adet"
                    >
                </div>


                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Alış Fiyatı (₺)
                    </label>

                    <input
                        type="number"
                        step="0.01"
                        id="asset-price"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="0.00"
                    >
                </div>

            </div>


            <div class="flex gap-4 mt-6">

                <button type="button"
                    onclick="saveInvestment()"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">

                    Kaydet

                </button>

                <button type="button"
                    onclick="closeModal()"
                    class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg">

                    İptal

                </button>

            </div>

        </form>
    `);

    document.body.appendChild(modal);
}


// =========================
// SAVE INVESTMENT
// =========================
async function saveInvestment() {

    await loadMarketDataForAnalysis();

    const assetType =
        document.getElementById('asset-type').value;

    const symbolInput =
        document.getElementById('asset-symbol').value;

    const amount =
        parseFloat(document.getElementById('asset-amount').value);

    const price =
        parseFloat(document.getElementById('asset-price').value);

    const symbol = normalizeSymbol(symbolInput);

    if (!symbol || !amount || !price) {
        alert('Lütfen tüm alanları doldurun.');
        return;
    }

    let assetName = symbol;
    let finalSymbol = symbol;

    // ALTIN
    if (assetType === 'gold') {

        finalSymbol = 'GOLD';
        assetName = 'Gram Altın';

    }

    // FON
    else if (assetType === 'fund') {

        const marketFund = findMarketFund(symbol);

        assetName =
            marketFund?.name ||
            symbol;

    }

    // HİSSE
    else {

        const marketStock = findMarketStock(symbol);

        assetName =
            marketStock?.name ||
            symbol;

    }


    const { error } = await supabaseClient
        .from('portfolios')
        .insert({

            user_id: analysisUser.id,

            symbol: finalSymbol,

            name: assetName,

            asset_type: assetType,

            amount: amount,

            buy_price: price

        });


    if (error) {

        console.error(error);

        showNotification(
            'Yatırım kaydedilemedi.',
            'error'
        );

        return;
    }


    await loadUserPortfolio();

    refreshPortfolioPrices();

    updateHoldingsTable();

    updatePortfolioDisplay();

    initializePortfolioCharts();

    closeModal();

    showNotification(
        'Yatırım başarıyla kaydedildi.',
        'success'
    );

}
