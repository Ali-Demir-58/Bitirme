// Finansal Analiz Platformu - Main JavaScript

// =========================
// GLOBAL STATE
// =========================
let charts = {};
let volatilityTableInitialized = false;

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', function () {
    initializeAnimations();
    initializeChartsSafely();
    initializeInteractions();

    loadExcelMarketData();
    setInterval(loadExcelMarketData, 5000);
});

// =========================
// SAFE HELPERS
// =========================
function getEl(id) {
    return document.getElementById(id);
}

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
    const el = getEl(id);
    if (!el) return;

    el.textContent = formatNumber(value, digits);
}

function setChange(id, value) {
    const el = getEl(id);
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
    const el = getEl(id);
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
// ANIMATIONS
// =========================
function initializeAnimations() {
    if (typeof anime === 'undefined') return;

    if (document.querySelector('.hero-bg h1')) {
        anime({
            targets: '.hero-bg h1',
            translateY: [50, 0],
            opacity: [0, 1],
            duration: 1000,
            easing: 'easeOutExpo',
            delay: 300
        });
    }

    if (document.querySelector('.hero-bg p')) {
        anime({
            targets: '.hero-bg p',
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutExpo',
            delay: 500
        });
    }

    if (document.querySelector('.hero-bg button')) {
        anime({
            targets: '.hero-bg button',
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutExpo',
            delay: 700
        });
    }

    if (document.querySelector('.data-card')) {
        anime({
            targets: '.data-card',
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutExpo',
            delay: anime.stagger(80, { start: 900 })
        });
    }
}

// =========================
// CHARTS - SAFE INIT
// =========================
function initializeChartsSafely() {
    if (typeof echarts === 'undefined') return;

    initializeMiniChart('bist-mini-chart', '#10b981');
    initializeMiniChart('usd-mini-chart', '#ef4444');
    initializeMiniChart('gold-mini-chart', '#f59e0b');
    initializeMiniChart('portfolio-mini-chart', '#3b82f6');
    initializeMainChart();
}

function initializeMiniChart(containerId, color) {
    const container = getEl(containerId);
    if (!container || typeof echarts === 'undefined') return;

    const chart = echarts.init(container);

    chart.setOption({
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
                    colorStops: [
                        { offset: 0, color: color + '40' },
                        { offset: 1, color: color + '10' }
                    ]
                }
            }
        }]
    });

    charts[containerId] = chart;
}

function initializeMainChart() {
    const container = getEl('main-chart');
    if (!container || typeof echarts === 'undefined') return;

    const chart = echarts.init(container);

    chart.setOption({
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
            data: generateTimeData(30)
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: 'BIST 100',
                type: 'line',
                smooth: true,
                data: generateRandomData(30, 8000, 9000)
            },
            {
                name: 'USD/TL',
                type: 'line',
                smooth: true,
                data: generateRandomData(30, 34, 36)
            },
            {
                name: 'Altın',
                type: 'line',
                smooth: true,
                data: generateRandomData(30, 2800, 2900)
            },
            {
                name: 'Portföy',
                type: 'line',
                smooth: true,
                data: generateRandomData(30, 120000, 130000)
            }
        ]
    });

    charts['main-chart'] = chart;
}

function generateTimeData(count) {
    const data = [];
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push(time.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        }));
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

// =========================
// API DATA LOADER
// =========================
async function loadExcelMarketData() {
    try {
        const res = await fetch('/api/market-data');

        if (!res.ok) {
            throw new Error(`API hatası: ${res.status}`);
        }

        const data = await res.json();

        const bist = Array.isArray(data.bist100) ? data.bist100[0] : null;
        const usd = data.dollar || null;
        const eur = data.euro || null;
        const gold = data.gold || null;
        const sp = Array.isArray(data.sp500)
            ? data.sp500.find(item => String(item.name || '').toUpperCase().includes('S&P'))
            : null;

        // Ticker
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
            setTickerChange('sp-change', normalizeSpChange(sp.change));
        }

        // Cards
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
            setChange('sp-card-change', normalizeSpChange(sp.change));
        }

        // Volatility table
        if (Array.isArray(data.stocks) && !volatilityTableInitialized) {
            renderVolatilityTable(data.stocks);
            volatilityTableInitialized = true;
        }

    } catch (err) {
        console.error('Veri alınamadı:', err);
    }
}

function normalizeSpChange(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return null;
    }

    const num = Number(value);

    // Excel'den bazen 0.23 yerine 23 gibi gelebiliyor.
    // Büyük değerlerde normalize ediyoruz.
    return Math.abs(num) > 20 ? num / 100 : num;
}

// =========================
// VOLATILITY TABLE
// =========================
function calculateVolatility(stock) {
    if (!stock.high || !stock.low || !stock.last) return 0;
    return ((Number(stock.high) - Number(stock.low)) / Number(stock.last)) * 100;
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
    const tbody = getEl('volatility-table');
    const tableElement = getEl('volatility-table-main');

    if (!tbody || !tableElement) return;

    if (window.jQuery && $.fn.DataTable && $.fn.DataTable.isDataTable('#volatility-table-main')) {
        $('#volatility-table-main').DataTable().destroy();
    }

    tbody.innerHTML = '';

    const sorted = stocks
        .map(stock => {
            const volatility = calculateVolatility(stock);
            const riskScore = calculateRisk(stock);

            return {
                ...stock,
                volatility,
                riskScore
            };
        })
        .sort((a, b) => a.riskScore - b.riskScore);

    sorted.forEach(stock => {
        const risk = getRiskLevel(stock.riskScore);
        const change = Number(stock.change ?? 0);

        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50';

        row.innerHTML = `
            <td class="py-2 px-2 font-semibold whitespace-nowrap">
                ${stock.symbol ?? '--'} ${stock.name ?? ''}
            </td>
            <td class="py-2 px-2 whitespace-nowrap">${formatNumber(stock.last, 2)}</td>
            <td class="py-2 px-2 whitespace-nowrap ${change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500'}">
                ${change > 0 ? '+' : ''}${formatNumber(change, 2)}
            </td>
            <td class="py-2 px-2 whitespace-nowrap">${formatNumber(stock.volatility, 2)}%</td>
            <td class="py-2 px-2 whitespace-nowrap ${risk.color} font-semibold">${risk.text}</td>
        `;

        tbody.appendChild(row);
    });

    if (window.jQuery && $.fn.DataTable) {
        $('#volatility-table-main').DataTable({
            pageLength: 10,
            order: [[3, 'asc']],
            destroy: true,
            autoWidth: false,
            scrollX: true,
            language: {
                search: 'Ara:',
                lengthMenu: 'Göster _MENU_ kayıt',
                info: '_TOTAL_ kayıttan _START_ - _END_ arası',
                paginate: {
                    previous: 'Önceki',
                    next: 'Sonraki'
                },
                zeroRecords: 'Eşleşen kayıt bulunamadı'
            }
        });
    }
}

// =========================
// INTERACTIONS
// =========================
function initializeInteractions() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
}

function handleScroll() {
    const navbar = document.querySelector('nav');
    if (!navbar) return;

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
        if (chart && typeof chart.resize === 'function') {
            chart.resize();
        }
    });

    if (window.jQuery && $.fn.DataTable && $.fn.DataTable.isDataTable('#volatility-table-main')) {
        $('#volatility-table-main').DataTable().columns.adjust();
    }
}

// =========================
// PAGE BUTTONS
// =========================
function startAnalysis() {
    if (typeof anime !== 'undefined') {
        anime({
            targets: 'button',
            scale: [1, 0.95, 1],
            duration: 200,
            easing: 'easeInOutQuad',
            complete: function () {
                window.location.href = 'analysis.html';
            }
        });
    } else {
        window.location.href = 'analysis.html';
    }
}

function scrollToMarkets() {
    const marketsSection = getEl('markets');

    if (marketsSection) {
        marketsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function startSimulation() {
    window.location.href = 'analysis.html#simulation';
}

// =========================
// RISK TEST MODAL
// =========================
const riskQuestions = [
    {
        question: '1. Yatırım yaparken temel önceliğiniz hangisidir?',
        answers: [
            { text: 'Anaparamı her ne olursa olsun korumak.', score: 1 },
            { text: 'Enflasyonun biraz üzerinde, düşük riskli getiri sağlamak.', score: 2 },
            { text: 'Orta vadede sermaye büyümesi ve düzenli gelir elde etmek.', score: 3 },
            { text: 'Yüksek risk alarak maksimum sermaye artışı sağlamak.', score: 4 }
        ]
    },
    {
        question: '2. 100.000 TL yatırımınız bir ay içinde 80.000 TL’ye düşerse ne yaparsınız?',
        answers: [
            { text: 'Daha fazla kaybetmemek için tüm yatırımı satarım.', score: 1 },
            { text: 'Endişelenirim ve bir kısmını güvenli varlıklara kaydırırım.', score: 2 },
            { text: 'Piyasanın düzelmesini beklerim.', score: 3 },
            { text: 'Fiyatlar düştüğü için ek alım yaparım.', score: 4 }
        ]
    },
    {
        question: '3. Bu yatırımı hangi zaman dilimi için planlıyorsunuz?',
        answers: [
            { text: '1 yıldan az.', score: 1 },
            { text: '1 - 3 yıl arası.', score: 2 },
            { text: '3 - 7 yıl arası.', score: 3 },
            { text: '10 yıl ve üzeri.', score: 4 }
        ]
    },
    {
        question: '4. Acil durumda kenarda ne kadar nakitiniz var?',
        answers: [
            { text: 'Hiç yok.', score: 1 },
            { text: '1 - 2 aylık giderim kadar.', score: 2 },
            { text: '3 - 6 aylık giderim kadar.', score: 3 },
            { text: '1 yıldan fazla yetecek nakitim var.', score: 4 }
        ]
    },
    {
        question: '5. Aşağıdaki senaryolardan hangisi size daha uygun?',
        answers: [
            { text: '%5 kesin kazanç / %0 kayıp ihtimali.', score: 1 },
            { text: '%12 beklenen kazanç / %5 olası kayıp.', score: 2 },
            { text: '%25 beklenen kazanç / %15 olası kayıp.', score: 3 },
            { text: '%50 beklenen kazanç / %35 olası kayıp.', score: 4 }
        ]
    },
    {
        question: '6. Finansal piyasalar hakkındaki bilginizi nasıl tanımlarsınız?',
        answers: [
            { text: 'Hiç bilgim yok.', score: 1 },
            { text: 'Temel kavramları biliyorum.', score: 2 },
            { text: 'Piyasa mekanizmalarını ve riskleri iyi anlıyorum.', score: 3 },
            { text: 'Profesyonel düzeyde bilgim ve tecrübem var.', score: 4 }
        ]
    },
    {
        question: '7. Aylık geliriniz ne kadar düzenli?',
        answers: [
            { text: 'Çok değişken.', score: 1 },
            { text: 'Sabit ama ucu ucuna yetiyor.', score: 2 },
            { text: 'Sabit ve her ay tasarruf yapabiliyorum.', score: 3 },
            { text: 'Yüksek ve birden fazla gelir kanalım var.', score: 4 }
        ]
    },
    {
        question: '8. Yatırım tutarı toplam birikiminizin ne kadarını oluşturuyor?',
        answers: [
            { text: 'Neredeyse tamamını.', score: 1 },
            { text: 'Yarısından fazlasını.', score: 2 },
            { text: 'Makul bir kısmını.', score: 3 },
            { text: 'Çok küçük bir kısmını.', score: 4 }
        ]
    },
    {
        question: '9. Enflasyon ortamında alım gücünüzün düşmesi sizi ne kadar rahatsız eder?',
        answers: [
            { text: 'Hiç rahatsız etmez, param azalmasın yeter.', score: 1 },
            { text: 'Biraz rahatsız eder ama risk almaktan iyidir.', score: 2 },
            { text: 'Rahatsız eder, makul risk alırım.', score: 3 },
            { text: 'Çok rahatsız eder, agresif getiri ararım.', score: 4 }
        ]
    },
    {
        question: '10. Geçmiş yatırım kararlarınızda en çok hangisini yaşadınız?',
        answers: [
            { text: 'Kaybetme korkusuyla erken satış yaptım.', score: 1 },
            { text: 'Genelde istikrarlı ürünleri seçtim.', score: 2 },
            { text: 'Bazen riskli işlemlere girdim.', score: 3 },
            { text: 'Büyük riskler aldım; bazen çok kazandım, bazen kaybettim.', score: 4 }
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
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-5 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-start gap-4 mb-6">
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
    if (!modalContent) return;

    modalContent.innerHTML = `
        <div class="flex justify-between items-start gap-4 mb-6">
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

// =========================
// GLOBAL EXPORTS
// =========================
window.startAnalysis = startAnalysis;
window.scrollToMarkets = scrollToMarkets;
window.startRiskTest = startRiskTest;
window.startSimulation = startSimulation;
window.closeRiskTest = closeRiskTest;
window.calculateRiskTestResult = calculateRiskTestResult;