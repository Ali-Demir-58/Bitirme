// Finansal Analiz Platformu - Main JavaScript

// Global Variables
let marketData = {
    bist100: { value: 8847.32, change: 2.34 },
    usdtry: { value: 34.85, change: -0.12 },
    eurtry: { value: 36.92, change: -0.08 },
    gold: { value: 2847.50, change: 1.45 }
};

let charts = {};

// ⚠️ GERÇEK UYGULAMA İÇİN KENDİ ALPHA VANTAGE ANAHTARINIZI BURAYA GİRİN!
// Şimdilik test amaçlı 'DEMO' anahtarı kullanılacaktır.
const ALPHA_VANTAGE_KEY = 'DEMO';

// Initialize Application
document.addEventListener('DOMContentLoaded', function () {
    initializeAnimations();
    initializeCharts();
    startDataUpdates();
    initializeInteractions();
});

// Animation Initialization
function initializeAnimations() {
    // Hero text animation
    anime({
        targets: '.hero-bg h1',
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutExpo',
        delay: 500
    });

    anime({
        targets: '.hero-bg p',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutExpo',
        delay: 800
    });

    anime({
        targets: '.hero-bg button',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutExpo',
        delay: 1200
    });

    // Data cards animation
    anime({
        targets: '.data-card',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutExpo',
        delay: anime.stagger(100, { start: 1500 })
    });
}

// Chart Initialization
function initializeCharts() {
    // Mini Charts
    initializeMiniChart('bist-mini-chart', '#10b981');
    initializeMiniChart('usd-mini-chart', '#ef4444');
    initializeMiniChart('gold-mini-chart', '#f59e0b');
    initializeMiniChart('portfolio-mini-chart', '#3b82f6');

    // Main Chart
    initializeMainChart();
}

function initializeMiniChart(containerId, color) {
    const chart = echarts.init(document.getElementById(containerId));

    const option = {
        grid: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        },
        xAxis: {
            type: 'category',
            show: false,
            data: generateTimeData(24)
        },
        yAxis: {
            type: 'value',
            show: false
        },
        series: [{
            data: generateRandomData(24, 50, 150),
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: {
                color: color,
                width: 2
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: color + '40'
                    }, {
                        offset: 1, color: color + '10'
                    }]
                }
            }
        }]
    };

    chart.setOption(option);
    charts[containerId] = chart;
}

function initializeMainChart() {
    const chart = echarts.init(document.getElementById('main-chart'));

    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e5e7eb',
            textStyle: {
                color: '#374151'
            }
        },
        legend: {
            data: ['BIST 100', 'USD/TL', 'Altın', 'Portföy'],
            bottom: 0,
            textStyle: {
                color: '#6b7280'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: generateTimeData(30),
            axisLine: {
                lineStyle: {
                    color: '#e5e7eb'
                }
            },
            axisLabel: {
                color: '#6b7280'
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#e5e7eb'
                }
            },
            axisLabel: {
                color: '#6b7280'
            },
            splitLine: {
                lineStyle: {
                    color: '#f3f4f6'
                }
            }
        },
        series: [
            {
                name: 'BIST 100',
                type: 'line',
                smooth: true,
                data: generateRandomData(30, 8000, 9000),
                lineStyle: {
                    color: '#10b981',
                    width: 3
                },
                itemStyle: {
                    color: '#10b981'
                }
            },
            {
                name: 'USD/TL',
                type: 'line',
                smooth: true,
                data: generateRandomData(30, 34, 36),
                lineStyle: {
                    color: '#ef4444',
                    width: 3
                },
                itemStyle: {
                    color: '#ef4444'
                }
            },
            {
                name: 'Altın',
                type: 'line',
                smooth: true,
                data: generateRandomData(30, 2800, 2900),
                lineStyle: {
                    color: '#f59e0b',
                    width: 3
                },
                itemStyle: {
                    color: '#f59e0b'
                }
            },
            {
                name: 'Portföy',
                type: 'line',
                smooth: true,
                data: generateRandomData(30, 120000, 130000),
                lineStyle: {
                    color: '#3b82f6',
                    width: 3
                },
                itemStyle: {
                    color: '#3b82f6'
                }
            }
        ]
    };

    chart.setOption(option);
    charts['main-chart'] = chart;
}

// Data Generation Functions
function generateTimeData(count) {
    const data = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push(time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    }
    return data;
}

function generateRandomData(count, min, max) {
    const data = [];
    let current = (min + max) / 2;

    for (let i = 0; i < count; i++) {
        const change = (Math.random() - 0.5) * (max - min) * 0.1;
        current = Math.max(min, Math.min(max, current + change));
        data.push(Math.round(current * 100) / 100);
    }

    return data;
}

// Data Update Functions
// function startDataUpdates() {
//     setInterval(updateMarketData, 5000); // Update every 5 seconds
//     setInterval(updateCharts, 10000); // Update charts every 10 seconds
// }

// 🎯 GÜNCELLENMİŞ FONKSİYON: ALPHA VANTAGE ENTEGRASYONU İÇİN ASENKRON YAPILDI
async function updateMarketData() {
    // 1. USD/TL (Forex) Verisini Alpha Vantage'dan Çek
    const USDTRY_URL = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=TRY&apikey=${ALPHA_VANTAGE_KEY}`;

    try {
        const response = await fetch(USDTRY_URL);
        const data = await response.json();

        if (data['Realtime Currency Exchange Rate']) {
            const exchangeRateData = data['Realtime Currency Exchange Rate'];
            const newPrice = parseFloat(exchangeRateData['5. Exchange Rate']);
            const previousPrice = marketData.usdtry.value;

            // Yüzde değişimini hesapla: (Yeni Fiyat - Eski Fiyat) / Eski Fiyat * 100
            const changePercent = ((newPrice - previousPrice) / previousPrice) * 100;

            // Global veriyi güncelle
            marketData.usdtry.value = newPrice;
            marketData.usdtry.change = changePercent;
        } else {
            // API Kotası dolduğunda veya hata oluştuğunda konsola bilgi yaz
            console.warn("USD/TL API'dan alınamadı veya kota doldu. Simülasyona devam ediliyor:", data);

            // Hata durumunda diğer simülasyonları çalıştırmaya devam edebiliriz
            marketData.usdtry.value += (Math.random() - 0.5) * 0.2;
            marketData.usdtry.change += (Math.random() - 0.5) * 0.1;
        }

    } catch (error) {
        console.error("Alpha Vantage USD/TRY verisi çekilirken ağ hatası:", error);

        // Ağ hatası durumunda simülasyona devam et
        marketData.usdtry.value += (Math.random() - 0.5) * 0.2;
        marketData.usdtry.change += (Math.random() - 0.5) * 0.1;
    }


    // 2. BIST 100 ve Altın İçin Simülasyon Devam Ediyor
    // Bu veriler için başka bir API entegrasyonu (muhtemelen ücretli/başka bir API) gereklidir.
    marketData.bist100.value += (Math.random() - 0.5) * 50;
    marketData.bist100.change += (Math.random() - 0.5) * 0.5;

    marketData.gold.value += (Math.random() - 0.5) * 30;
    marketData.gold.change += (Math.random() - 0.5) * 0.3;

    // Ekranı güncelle
    updateMarketDisplay();
}

function updateMarketDisplay() {
    // Update ticker
    document.getElementById('bist-value').textContent = marketData.bist100.value.toFixed(2);
    document.getElementById('bist-change').textContent = `+${marketData.bist100.change.toFixed(2)}%`;

    document.getElementById('usd-value').textContent = marketData.usdtry.value.toFixed(2);
    document.getElementById('usd-change').textContent = `${marketData.usdtry.change >= 0 ? '+' : ''}${marketData.usdtry.change.toFixed(2)}%`;

    // Update cards
    document.getElementById('bist-card-value').textContent = marketData.bist100.value.toFixed(2);
    document.getElementById('bist-card-change').textContent = `+${(marketData.bist100.value * marketData.bist100.change / 100).toFixed(2)} (${marketData.bist100.change.toFixed(2)}%)`;

    document.getElementById('usd-card-value').textContent = marketData.usdtry.value.toFixed(2);

    // USD/TL Change hesaplaması, `marketData.usdtry.change` değerini kullanacak şekilde güncellendi
    const usdChangeAmount = (marketData.usdtry.value * marketData.usdtry.change / 100);
    document.getElementById('usd-card-change').textContent =
        `${usdChangeAmount.toFixed(2)} (${marketData.usdtry.change.toFixed(2)}%)`;

    document.getElementById('gold-card-value').textContent = marketData.gold.value.toFixed(2);
    document.getElementById('gold-card-change').textContent = `+${(marketData.gold.value * marketData.gold.change / 100).toFixed(2)} (${marketData.gold.change.toFixed(2)}%)`;
}

function updateCharts() {
    // Update mini charts with new data
    Object.keys(charts).forEach(key => {
        if (key !== 'main-chart') {
            const chart = charts[key];
            const option = chart.getOption();
            const newData = generateRandomData(24, 50, 150);
            option.series[0].data = newData;
            chart.setOption(option);
        }
    });
}

// Interaction Functions
function initializeInteractions() {
    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effects
    window.addEventListener('scroll', handleScroll);

    // Resize charts on window resize
    window.addEventListener('resize', handleResize);
}

function handleScroll() {
    const navbar = document.querySelector('nav');
    if (window.scrollY > 100) {
        navbar.classList.add('bg-white/95');
        navbar.classList.remove('bg-white/90');
    } else {
        navbar.classList.add('bg-white/90');
        navbar.classList.remove('bg-white/95');
    }
}

function handleResize() {
    Object.values(charts).forEach(chart => {
        chart.resize();
    });
}

// Button Click Functions
function startAnalysis() {
    // Show loading animation
    anime({
        targets: 'button',
        scale: [1, 0.95, 1],
        duration: 200,
        easing: 'easeInOutQuad',
        complete: function () {
            // Redirect to analysis page
            window.location.href = 'analysis.html';
        }
    });
}

function scrollToMarkets() {
    const marketsSection = document.getElementById('markets');
    if (marketsSection) {
        marketsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function startRiskTest() {
    // Create modal for risk test
    showRiskTestModal();
}

function startSimulation() {
    // Redirect to simulation page
    window.location.href = 'analysis.html#simulation';
}

// Modal Functions
function showRiskTestModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Risk Profili Testi</h2>
                <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div id="risk-test-content">
                ${generateRiskTestQuestions()}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Animate modal
    anime({
        targets: modal.querySelector('div'),
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutExpo'
    });
}

function generateRiskTestQuestions() {
    const questions = [
        {
            question: "Yatırım yapma süreniz ne kadar?",
            options: [
                "3 yıldan az",
                "3-6 yıl arası",
                "6-10 yıl arası",
                "10 yıldan fazla"
            ]
        },
        {
            question: "Finansal yatırım bilginiz nasıl?",
            options: [
                "Hiç yok",
                "Çok az",
                "Makul düzeyde",
                "Oldukça bilgiliyim"
            ]
        },
        {
            question: "100.000 TL'niz olsa hangi yatırımı tercih edersiniz?",
            options: [
                "%3 kazanç garanti",
                "%10 kazanç veya %3 kayıp",
                "%25 kazanç veya %10 kayıp",
                "%50 kazanç veya %20 kayıp"
            ]
        }
    ];

    let html = '<form id="risk-test-form">';

    questions.forEach((q, index) => {
        html += `
            <div class="mb-8">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">${index + 1}. ${q.question}</h3>
                <div class="space-y-2">
                    ${q.options.map((option, optIndex) => `
                        <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name="q${index}" value="${optIndex}" class="mr-3">
                            <span class="text-gray-700">${option}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    });

    html += `
        <div class="flex space-x-4">
            <button type="button" onclick="calculateRiskProfile()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
                Sonuçları Gör
            </button>
            <button type="button" onclick="closeModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition-all">
                İptal
            </button>
        </div>
    </form>`;

    return html;
}

function calculateRiskProfile() {
    const form = document.getElementById('risk-test-form');
    const formData = new FormData(form);
    let totalScore = 0;

    for (let [key, value] of formData.entries()) {
        totalScore += parseInt(value);
    }

    let profile = '';
    let description = '';
    let allocation = '';

    if (totalScore <= 4) {
        profile = 'Korumacı (Temkinli)';
        description = 'Düşük risk toleransına sahip, istikrarlı getiriyi tercih eden yatırımcı profili.';
        allocation = 'Vadeli Mevduat: %60, DİBS: %25, Altın: %10, Hisse: %5';
    } else if (totalScore <= 8) {
        profile = 'Ilımlı (Dengeli)';
        description = 'Orta risk toleransına sahip, dengeli getiri-risk profili arayan yatırımcı.';
        allocation = 'Hisse: %40, Vadeli Mevduat: %30, Altın: %20, DİBS: %10';
    } else {
        profile = 'Cesur (Atak)';
        description = 'Yüksek risk toleransına sahip, maksimum getiri hedefleyen yatırımcı profili.';
        allocation = 'Hisse: %70, Altın: %15, Vadeli Mevduat: %10, DİBS: %5';
    }

    showRiskResults(profile, description, allocation, totalScore);
}

function showRiskResults(profile, description, allocation, score) {
    const content = document.getElementById('risk-test-content');
    content.innerHTML = `
        <div class="text-center mb-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Risk Profiliniz</h3>
            <div class="text-3xl font-bold text-blue-600 mb-4">${profile}</div>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-6 mb-6">
            <h4 class="font-semibold text-gray-900 mb-2">Profil Açıklaması</h4>
            <p class="text-gray-700">${description}</p>
        </div>
        
        <div class="bg-yellow-50 rounded-lg p-6 mb-6">
            <h4 class="font-semibold text-gray-900 mb-2">Önerilen Portföy Dağılımı</h4>
            <p class="text-gray-700">${allocation}</p>
        </div>
        
        <div class="flex space-x-4">
            <button onclick="closeModal()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
                Tamam
            </button>
            <button onclick="showRiskTestModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition-all">
                Testi Tekrarla
            </button>
        </div>
    `;
}

function closeModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        anime({
            targets: modal.querySelector('div'),
            scale: [1, 0.8],
            opacity: [1, 0],
            duration: 200,
            easing: 'easeInExpo',
            complete: function () {
                modal.remove();
            }
        });
    }
}

// Utility Functions
function formatCurrency(amount, currency = 'TL') {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency === 'TL' ? 'TRY' : currency
    }).format(amount);
}

function formatPercentage(value) {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

// Export functions for global access
window.startAnalysis = startAnalysis;
window.scrollToMarkets = scrollToMarkets;
window.startRiskTest = startRiskTest;
window.startSimulation = startSimulation;
window.closeModal = closeModal;
window.calculateRiskProfile = calculateRiskProfile;


function formatNumber(value, digits = 2) {
    if (value === null || value === undefined || Number.isNaN(value)) return '--';
    return Number(value).toLocaleString('tr-TR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    });
}

function setValue(id, value, digits = 2) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = formatNumber(value, digits);
}

function setChange(id, value, suffix = '') {
    const el = document.getElementById(id);
    if (!el) return;

    if (value === null || value === undefined || Number.isNaN(value)) {
        el.textContent = '...';
        el.className = 'text-gray-400';
        return;
    }

    const num = Number(value);
    const sign = num > 0 ? '+' : '';
    el.textContent = `${sign}${formatNumber(num, 2)}${suffix}`;

    if (num > 0) {
        el.className = 'text-green-400';
    } else if (num < 0) {
        el.className = 'text-red-400';
    } else {
        el.className = 'text-gray-400';
    }
}

async function loadExcelMarketData() {
    try {
        const res = await fetch('/api/market-data');
        const data = await res.json();

        console.log('API DATA:', data);

        // BIST100 sheet: ilk satır XU100
        const bist = Array.isArray(data.bist100) ? data.bist100[0] : null;

        // Dolar / Euro / Altın
        const usd = data.dollar || null;
        const eur = data.euro || null;
        const gold = data.gold || null;

        // S&P sheet: S&P 500 satırını bul
        const sp = Array.isArray(data.sp500)
            ? data.sp500.find(item => String(item.name || '').toUpperCase().includes('S&P 500'))
            : null;

        if (bist) {
            setValue('bist-value', bist.value, 2);
            setChange('bist-change', bist.change);
        }

        if (usd) {
            setValue('usd-value', usd['ALIŞ'], 4);
            setChange('usd-change', usd['FARK']);
        }

        if (eur) {
            setValue('eur-value', eur['ALIŞ'], 4);
            setChange('eur-change', eur['FARK']);
        }

        if (gold) {
            setValue('gold-value', gold['ALIŞ'], 2);
            setChange('gold-change', gold['FARK']);
        }

        if (sp) {
            setValue('sp-value', sp.value, 2);
            setChange('sp-change', sp.change);
        }

    } catch (err) {
        console.error('Veri alınamadı:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadExcelMarketData();
    setInterval(loadExcelMarketData, 5000);
});


function formatNumber(value, digits = 2) {
    if (value === null || value === undefined || Number.isNaN(value)) return '--';
    return Number(value).toLocaleString('tr-TR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    });
}

function setValue(id, value, digits = 2) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = formatNumber(value, digits);
}

function setChange(id, value) {
    const el = document.getElementById(id);
    if (!el) return;

    if (value === null || value === undefined || Number.isNaN(value)) {
        el.textContent = '...';
        el.className = 'text-gray-400';
        return;
    }

    const num = Number(value);
    const sign = num > 0 ? '+' : '';

    el.textContent = `${sign}${formatNumber(num, 2)}`;

    if (num > 0) {
        el.className = 'text-green-500';
    } else if (num < 0) {
        el.className = 'text-red-500';
    } else {
        el.className = 'text-gray-400';
    }
}

async function loadExcelMarketData() {
    try {
        const res = await fetch('/api/market-data');
        const data = await res.json();

        console.log('DATA:', data);

        const bist = data.bist100?.[0];
        const usd = data.dollar;
        const eur = data.euro;
        const gold = data.gold;
        const sp = data.sp500?.find(x =>
            String(x.name || '').toUpperCase().includes('S&P')
        );

        // ----------------
        // BIST
        // ----------------
        if (bist) {
            setValue('bist-value', bist.value);
            setValue('bist-card-value', bist.value);

            setChange('bist-change', bist.change);
            setChange('bist-card-change', bist.change);
        }

        // ----------------
        // USD
        // ----------------
        if (usd) {
            setValue('usd-value', usd['ALIŞ'], 4);
            setValue('usd-card-value', usd['ALIŞ'], 4);

            setChange('usd-change', usd['FARK']);
            setChange('usd-card-change', usd['FARK']);
        }

        // ----------------
        // EUR
        // ----------------
        if (eur) {
            setValue('eur-value', eur['ALIŞ'], 4);
        }

        // ----------------
        // GOLD
        // ----------------
        if (gold) {
            setValue('gold-value', gold['ALIŞ']);
            setValue('gold-card-value', gold['ALIŞ']);

            setChange('gold-change', gold['FARK']);
            setChange('gold-card-change', gold['FARK']);
        }

        // ----------------
        // S&P (ÖZEL)
        // ----------------
        if (sp) {
            setValue('sp-value', sp.value);
            setValue('sp-card-value', sp.value);

            // 💥 BURASI ÖNEMLİ
            const normalized = sp.change / 100;

            setChange('sp-change', normalized);
            setChange('sp-card-change', normalized);
        }

    } catch (err) {
        console.error('Veri alınamadı:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadExcelMarketData();
    setInterval(loadExcelMarketData, 5000);
});


// =========================
// FORMAT HELPERS
// =========================
function formatNumber(value, digits = 2) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '--';
    }

    return Number(value).toLocaleString('tr-TR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    });
}

function setValue(id, value, digits = 2) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = formatNumber(value, digits);
}

function setChange(id, value) {
    const el = document.getElementById(id);
    if (!el) return;

    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        el.textContent = '...';
        el.className = 'text-sm text-gray-500 font-medium';
        return;
    }

    const num = Number(value);
    const sign = num > 0 ? '+' : '';

    el.textContent = `${sign}${formatNumber(num, 2)}`;

    if (num > 0) {
        el.className = 'text-sm text-green-600 font-medium';
    } else if (num < 0) {
        el.className = 'text-sm text-red-600 font-medium';
    } else {
        el.className = 'text-sm text-gray-500 font-medium';
    }
}

function setTickerChange(id, value) {
    const el = document.getElementById(id);
    if (!el) return;

    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        el.textContent = '...';
        el.className = 'text-gray-400';
        return;
    }

    const num = Number(value);
    const sign = num > 0 ? '+' : '';

    el.textContent = `${sign}${formatNumber(num, 2)}`;

    if (num > 0) {
        el.className = 'text-green-400';
    } else if (num < 0) {
        el.className = 'text-red-400';
    } else {
        el.className = 'text-gray-400';
    }
}

// =========================
// VOLATILITY TABLE
// =========================
function calculateVolatility(stock) {
    if (!stock.high || !stock.low || !stock.last) return 0;
    return ((stock.high - stock.low) / stock.last) * 100;
}

function calculateRisk(stock) {
    const vol = calculateVolatility(stock);
    const change = Math.abs(Number(stock.change || 0));
    return vol + change;
}

function getRiskLevel(score) {
    if (score < 2) return { text: 'Çok Düşük', color: 'text-green-600' };
    if (score < 4) return { text: 'Düşük', color: 'text-green-500' };
    if (score < 6) return { text: 'Orta', color: 'text-yellow-500' };
    return { text: 'Yüksek', color: 'text-red-500' };
}

function renderVolatilityTable(stocks) {
    const table = document.getElementById('volatility-table');
    if (!table) return;

    // DataTables daha önce başlatıldıysa kapat
    if (window.jQuery && $.fn.DataTable.isDataTable('#volatility-table-main')) {
        $('#volatility-table-main').DataTable().destroy();
    }

    table.innerHTML = '';

    const sorted = stocks
        .map(stock => {
            const vol = calculateVolatility(stock);
            const riskScore = calculateRisk(stock);

            return {
                ...stock,
                volatility: vol,
                riskScore
            };
        })
        .sort((a, b) => a.riskScore - b.riskScore); // slice yok, tüm hisseler gelsin

    sorted.forEach(stock => {
        const risk = getRiskLevel(stock.riskScore);
        const change = Number(stock.change ?? 0);

        const row = document.createElement('tr');
        row.className = 'border-b';

        row.innerHTML = `
            <td class="py-2 font-semibold">${stock.symbol ?? '--'} ${stock.name ?? ''}</td>
            <td>${formatNumber(stock.last)}</td>
            <td class="${change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500'}">
                ${change > 0 ? '+' : ''}${formatNumber(change)}
            </td>
            <td>${stock.volatility.toFixed(2)}%</td>
            <td class="${risk.color} font-semibold">${risk.text}</td>
        `;

        table.appendChild(row);
    });

    // DataTables yüklüyse aktif et
    if (window.jQuery && $.fn.DataTable) {
        $('#volatility-table-main').DataTable({
            pageLength: 10,
            order: [[3, 'asc']],
            destroy: true,
            language: {
                search: "Ara:",
                lengthMenu: "Göster _MENU_ kayıt",
                info: "_TOTAL_ kayıttan _START_ - _END_ arası",
                paginate: {
                    previous: "Önceki",
                    next: "Sonraki"
                },
                zeroRecords: "Eşleşen kayıt bulunamadı"
            }
        });
    }
}

// =========================
// RISK PROFILE
// =========================
const riskQuestions = [
    {
        question: "1. Yatırım yaparken temel önceliğiniz hangisidir?",
        answers: [
            { text: "Anaparamı her ne olursa olsun korumak.", score: 1 },
            { text: "Enflasyonun biraz üzerinde, düşük riskli bir getiri sağlamak.", score: 2 },
            { text: "Orta vadede sermaye büyümesi ve düzenli gelir elde etmek.", score: 3 },
            { text: "Yüksek risk alarak maksimum sermaye artışı sağlamak.", score: 4 }
        ]
    },
    {
        question: "2. 100.000 TL’lik yatırımınızın bir ay içinde 80.000 TL’ye düştüğünü görseniz tepkiniz ne olurdu?",
        answers: [
            { text: "Daha fazla kaybetmemek için tüm yatırımı satarım.", score: 1 },
            { text: "Endişelenirim ve bir kısmını daha güvenli varlıklara kaydırırım.", score: 2 },
            { text: "Piyasanın düzelmesini beklerim, herhangi bir işlem yapmam.", score: 3 },
            { text: "Fiyatlar düştüğü için bunu fırsat bilip ekleme yaparım.", score: 4 }
        ]
    },
    {
        question: "3. Bu yatırımı hangi zaman dilimi için planlıyorsunuz?",
        answers: [
            { text: "1 yıldan az.", score: 1 },
            { text: "1 - 3 yıl arası.", score: 2 },
            { text: "3 - 7 yıl arası.", score: 3 },
            { text: "10 yıl ve üzeri.", score: 4 }
        ]
    },
    {
        question: "4. Acil bir durumda kenarda ne kadar süre yetecek nakitiniz var?",
        answers: [
            { text: "Hiç yok, yatırımlarıma güveniyorum.", score: 1 },
            { text: "1 - 2 aylık giderim kadar.", score: 2 },
            { text: "3 - 6 aylık giderim kadar.", score: 3 },
            { text: "1 yıldan fazla yetecek nakitim var.", score: 4 }
        ]
    },
    {
        question: "5. Aşağıdaki senaryolardan hangisi size daha uygun?",
        answers: [
            { text: "%5 kesin kazanç / %0 kayıp ihtimali.", score: 1 },
            { text: "%12 beklenen kazanç / %5 olası kayıp.", score: 2 },
            { text: "%25 beklenen kazanç / %15 olası kayıp.", score: 3 },
            { text: "%50 beklenen kazanç / %35 olası kayıp.", score: 4 }
        ]
    },
    {
        question: "6. Finansal piyasalar hakkındaki bilginizi nasıl tanımlarsınız?",
        answers: [
            { text: "Hiç bilgim yok, başkalarının tavsiyesine uyarım.", score: 1 },
            { text: "Temel kavramları biliyorum.", score: 2 },
            { text: "Piyasa mekanizmalarını ve riskleri iyi anlıyorum.", score: 3 },
            { text: "Profesyonel düzeyde bilgim ve tecrübem var.", score: 4 }
        ]
    },
    {
        question: "7. Aylık geliriniz ne kadar düzenli ve stabil?",
        answers: [
            { text: "Çok değişken, her ay ne kazanacağımı bilmiyorum.", score: 1 },
            { text: "Sabit ama ucu ucuna yetiyor.", score: 2 },
            { text: "Sabit ve her ay tasarruf yapabiliyorum.", score: 3 },
            { text: "Yüksek ve birden fazla kanaldan gelirim var.", score: 4 }
        ]
    },
    {
        question: "8. Yatırım yaptığınız tutar, toplam birikiminizin ne kadarını oluşturuyor?",
        answers: [
            { text: "Neredeyse tamamını (%80+).", score: 1 },
            { text: "Yarısından fazlasını (%50 - %80).", score: 2 },
            { text: "Makul bir kısmını (%25 - %50).", score: 3 },
            { text: "Çok küçük bir kısmını (%25'ten az).", score: 4 }
        ]
    },
    {
        question: "9. Enflasyon ortamında alım gücünüzün düşmesi sizi ne kadar rahatsız eder?",
        answers: [
            { text: "Hiç rahatsız etmez, param azalmasın yeter.", score: 1 },
            { text: "Biraz rahatsız eder ama risk almaktan iyidir.", score: 2 },
            { text: "Rahatsız eder, enflasyonu geçmek için makul risk alırım.", score: 3 },
            { text: "Çok rahatsız eder, agresif şekilde enflasyon üstü getiri ararım.", score: 4 }
        ]
    },
    {
        question: "10. Geçmişteki yatırım kararlarınızda en çok hangisini yaşadınız?",
        answers: [
            { text: "Kaybetme korkusuyla çok erken satış yaptım.", score: 1 },
            { text: "Genelde orta yollu, istikrarlı ürünleri seçtim.", score: 2 },
            { text: "Fırsatları kaçırmamak için bazen çok riskli işlemlere girdim.", score: 3 },
            { text: "Büyük riskler aldım; bazen çok kazandım, bazen çok kaybettim.", score: 4 }
        ]
    }
];

function startRiskTest() {
    const questionsHTML = riskQuestions.map((q, qIndex) => `
        <div class="mb-6">
            <h4 class="font-bold text-gray-900 mb-3">${q.question}</h4>
            <div class="space-y-2">
                ${q.answers.map((a, aIndex) => `
                    <label class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                        <input type="radio" name="risk-question-${qIndex}" value="${a.score}" class="mt-1">
                        <span class="text-gray-700">${String.fromCharCode(65 + aIndex)}) ${a.text}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Yatırımcı Risk Profili Testi</h2>
                <button onclick="closeRiskTest()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            ${questionsHTML}

            <button onclick="calculateRiskTestResult()"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">
                Sonucu Hesapla
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeRiskTest() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) modal.remove();
}

function calculateRiskTestResult() {
    let totalScore = 0;

    for (let i = 0; i < riskQuestions.length; i++) {
        const selected = document.querySelector(`input[name="risk-question-${i}"]:checked`);

        if (!selected) {
            alert(`${i + 1}. soruyu cevaplamadınız.`);
            return;
        }

        totalScore += Number(selected.value);
    }

    const result = getRiskProfileResult(totalScore);
    showRiskResult(result, totalScore);
}

function getRiskProfileResult(score) {
    if (score <= 17) {
        return {
            title: 'Koruyucu Profil',
            color: 'text-green-600',
            description: 'Önceliğiniz sermayeyi korumak. Ani piyasa dalgalanmalarında rahatsız olabilirsiniz.',
            allocation: {
                'Nakit / Mevduat': 40,
                'Tahvil / Fon': 30,
                'Altın': 15,
                'Döviz': 10,
                'Hisse Senedi': 5
            }
        };
    }

    if (score <= 25) {
        return {
            title: 'Dengeli Profil',
            color: 'text-blue-600',
            description: 'Risk ve getiri arasında denge arıyorsunuz. Makul dalgalanmalara toleransınız var.',
            allocation: {
                'Hisse Senedi': 30,
                'Tahvil / Fon': 25,
                'Altın': 20,
                'Döviz': 15,
                'Nakit / Mevduat': 10
            }
        };
    }

    if (score <= 33) {
        return {
            title: 'Büyüme Odaklı Profil',
            color: 'text-yellow-600',
            description: 'Sermaye büyümesini önemsiyorsunuz. Orta-yüksek riskli varlıklara açıksınız.',
            allocation: {
                'Hisse Senedi': 50,
                'Tahvil / Fon': 15,
                'Altın': 15,
                'Döviz': 10,
                'Nakit / Mevduat': 10
            }
        };
    }

    return {
        title: 'Agresif Profil',
        color: 'text-red-600',
        description: 'Yüksek getiri hedefiyle yüksek dalgalanmayı kabul edebiliyorsunuz.',
        allocation: {
            'Hisse Senedi': 65,
            'Kripto / Yüksek Risk': 10,
            'Altın': 10,
            'Döviz': 10,
            'Nakit / Mevduat': 5
        }
    };
}

function showRiskResult(result, score) {
    const allocationHTML = Object.entries(result.allocation).map(([name, value]) => `
        <div class="mb-3">
            <div class="flex justify-between text-sm mb-1">
                <span>${name}</span>
                <span class="font-bold">%${value}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full" style="width:${value}%"></div>
            </div>
        </div>
    `).join('');

    const modalContent = document.querySelector('.fixed.inset-0 > div');

    modalContent.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Risk Profili Sonucunuz</h2>
            <button onclick="closeRiskTest()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <div class="p-6 bg-gray-50 rounded-xl mb-6">
            <div class="text-sm text-gray-500 mb-1">Toplam Skor</div>
            <div class="text-3xl font-bold text-gray-900">${score} / 40</div>
        </div>

        <div class="p-6 bg-white border rounded-xl mb-6">
            <h3 class="text-2xl font-bold ${result.color} mb-3">${result.title}</h3>
            <p class="text-gray-600">${result.description}</p>
        </div>

        <div class="p-6 bg-white border rounded-xl">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Örnek Varlık Dağılımı</h3>
            ${allocationHTML}
        </div>

        <button onclick="closeRiskTest()"
            class="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">
            Kapat
        </button>
    `;
}

window.startRiskTest = startRiskTest;
window.closeRiskTest = closeRiskTest;
window.calculateRiskTestResult = calculateRiskTestResult;

// =========================
// MAIN DATA LOADER
// =========================
async function loadExcelMarketData() {
    try {
        const res = await fetch('/api/market-data');
        const data = await res.json();

        console.log('API DATA:', data);

        const bist = data.bist100?.[0] || null;
        const usd = data.dollar || null;
        const eur = data.euro || null;
        const gold = data.gold || null;
        const sp = data.sp500?.find(item =>
            String(item.name || '').toUpperCase().includes('S&P')
        ) || null;

        // =========================
        // TICKER
        // =========================
        if (bist) {
            setValue('bist-value', bist.value, 2);
            setTickerChange('bist-change', bist.change);
        }

        if (usd) {
            setValue('usd-value', usd['ALIŞ'], 4);
            setTickerChange('usd-change', usd['FARK']);
        }

        if (eur) {
            setValue('eur-value', eur['ALIŞ'], 4);
            setTickerChange('eur-change', eur['FARK']);
        }

        if (gold) {
            setValue('gold-value', gold['ALIŞ'], 2);
            setTickerChange('gold-change', gold['FARK']);
        }

        if (sp) {
            setValue('sp-value', sp.value, 2);
            setTickerChange('sp-change', Number(sp.change) / 100);
        }

        // =========================
        // DASHBOARD CARDS
        // =========================
        if (bist) {
            setValue('bist-card-value', bist.value, 2);
            setChange('bist-card-change', bist.change);
        }

        if (usd) {
            setValue('usd-card-value', usd['ALIŞ'], 4);
            setChange('usd-card-change', usd['FARK']);
        }

        if (gold) {
            setValue('gold-card-value', gold['ALIŞ'], 2);
            setChange('gold-card-change', gold['FARK']);
        }

        if (sp) {
            setValue('sp-card-value', sp.value, 2);
            setChange('sp-card-change', Number(sp.change) / 100);
        }

        // =========================
        // VOLATILITY TABLE
        // =========================
        if (data.stocks && Array.isArray(data.stocks) && !window.volatilityTableInitialized) {
            renderVolatilityTable(data.stocks);
            window.volatilityTableInitialized = true;
        }

    } catch (err) {
        console.error('Veri alınamadı:', err);
    }
}

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', () => {
    loadExcelMarketData();
    setInterval(loadExcelMarketData, 5000);
});