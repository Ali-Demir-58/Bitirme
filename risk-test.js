// Finansal Analiz Platformu - Risk Profile Test JavaScript

// =========================
// GLOBAL STATE
// =========================
let riskUser = null;
let currentRiskQuestionIndex = 0;
let riskAnswers = [];

// =========================
// RISK TEST QUESTIONS
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

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', async function () {
    await initializeRiskTestPage();
});

// =========================
// PAGE INIT
// =========================
async function initializeRiskTestPage() {
    riskUser = await getRiskTestUser();

    if (!riskUser) {
        window.location.href = 'login.html';
        return;
    }

    const totalQuestionsEl = document.getElementById('total-questions');
    if (totalQuestionsEl) {
        totalQuestionsEl.textContent = riskQuestions.length;
    }

    document.getElementById('loading-box')?.classList.add('hidden');
    document.getElementById('test-box')?.classList.remove('hidden');

    currentRiskQuestionIndex = 0;
    riskAnswers = [];

    loadRiskQuestion();
}

async function getRiskTestUser() {
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
// QUESTION RENDER
// =========================
function loadRiskQuestion() {
    const question = riskQuestions[currentRiskQuestionIndex];
    const questionArea = document.getElementById('question-area');

    if (!question || !questionArea) return;

    questionArea.innerHTML = `
        <div>
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                ${question.question}
            </h3>

            <div class="space-y-3">
                ${question.answers.map((answer, index) => `
                    <label class="risk-option flex items-start gap-3 p-4 rounded-lg cursor-pointer">
                        <input 
                            type="radio" 
                            name="risk-answer" 
                            value="${index}" 
                            class="mt-1 shrink-0"
                            ${riskAnswers[currentRiskQuestionIndex]?.answerIndex === index ? 'checked' : ''}
                        >
                        <span class="text-gray-700">${answer.text}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;

    document.querySelectorAll('input[name="risk-answer"]').forEach(input => {
        input.addEventListener('change', function () {
            const selectedIndex = parseInt(this.value);
            const selectedAnswer = question.answers[selectedIndex];

            riskAnswers[currentRiskQuestionIndex] = {
                answerIndex: selectedIndex,
                score: selectedAnswer.score,
                text: selectedAnswer.text
            };

            document.querySelectorAll('.risk-option').forEach(option => {
                option.classList.remove('selected');
            });

            this.closest('.risk-option')?.classList.add('selected');
        });
    });

    restoreSelectedRiskOption();
    updateRiskProgress();
    updateRiskButtons();
}

function restoreSelectedRiskOption() {
    const selectedAnswer = riskAnswers[currentRiskQuestionIndex];

    if (!selectedAnswer) return;

    const selectedInput = document.querySelector(`input[name="risk-answer"][value="${selectedAnswer.answerIndex}"]`);

    if (!selectedInput) return;

    selectedInput.checked = true;
    selectedInput.closest('.risk-option')?.classList.add('selected');
}

function updateRiskProgress() {
    const currentQuestionEl = document.getElementById('current-question');
    const progressBar = document.getElementById('progress-bar');

    if (currentQuestionEl) {
        currentQuestionEl.textContent = currentRiskQuestionIndex + 1;
    }

    if (progressBar) {
        const progressPercent = ((currentRiskQuestionIndex + 1) / riskQuestions.length) * 100;
        progressBar.style.width = `${progressPercent}%`;
    }
}

function updateRiskButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) {
        prevBtn.disabled = currentRiskQuestionIndex === 0;
    }

    if (nextBtn) {
        nextBtn.textContent =
            currentRiskQuestionIndex === riskQuestions.length - 1
                ? 'Sonucu Kaydet'
                : 'Sonraki';
    }
}

// =========================
// QUESTION NAVIGATION
// =========================
function nextRiskQuestion() {
    if (!riskAnswers[currentRiskQuestionIndex]) {
        alert('Lütfen bir cevap seçin.');
        return;
    }

    if (currentRiskQuestionIndex === riskQuestions.length - 1) {
        finishRiskTest();
        return;
    }

    currentRiskQuestionIndex++;
    loadRiskQuestion();
    scrollToRiskTestTop();
}

function previousRiskQuestion() {
    if (currentRiskQuestionIndex <= 0) return;

    currentRiskQuestionIndex--;
    loadRiskQuestion();
    scrollToRiskTestTop();
}

function scrollToRiskTestTop() {
    const testBox = document.getElementById('test-box');
    if (!testBox) return;

    const nav = document.querySelector('nav');
    const offset = nav ? nav.offsetHeight + 20 : 90;

    const top = testBox.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
        top,
        behavior: 'smooth'
    });
}

// =========================
// RESULT CALCULATION
// =========================
async function finishRiskTest() {
    const totalScore = riskAnswers.reduce((sum, answer) => {
        return sum + Number(answer?.score || 0);
    }, 0);

    const result = getRiskProfileResult(totalScore);

    const saved = await saveRiskProfile(result, totalScore);

    if (!saved) return;

    showRiskResult(result, totalScore);
}

function getRiskProfileResult(totalScore) {
    if (totalScore <= 18) {
        return {
            profileType: 'Korumacı Profil',
            emoji: '🛡️',
            description: 'Riskten kaçınan, anaparasını korumayı ve daha istikrarlı getirileri önceleyen yatırımcı profilidir. Bu profil için düşük dalgalanmalı ve likiditesi yüksek varlıklar daha uygundur.',
            allocation: {
                'Nakit / Mevduat': 45,
                'Tahvil / Fon': 30,
                'Altın': 15,
                'Hisse Senedi': 10,
                'Döviz': 0,
                'Kripto / Yüksek Risk': 0
            }
        };
    }

    if (totalScore <= 30) {
        return {
            profileType: 'Dengeli Profil',
            emoji: '⚖️',
            description: 'Risk ve getiri arasında denge kurmaya çalışan, kontrollü biçimde büyüme hedefleyen yatırımcı profilidir. Bu profil için farklı varlık sınıflarına yayılmış dengeli bir portföy daha uygundur.',
            allocation: {
                'Hisse Senedi': 35,
                'Tahvil / Fon': 25,
                'Altın': 20,
                'Nakit / Mevduat': 10,
                'Döviz': 10,
                'Kripto / Yüksek Risk': 0
            }
        };
    }

    return {
        profileType: 'Atak Profil',
        emoji: '🚀',
        description: 'Yüksek getiri hedefiyle daha fazla dalgalanmayı ve kayıp riskini tolere edebilen yatırımcı profilidir. Bu profil için büyüme odaklı varlıklar ağırlık kazanabilir.',
        allocation: {
            'Hisse Senedi': 55,
            'Tahvil / Fon': 10,
            'Altın': 15,
            'Nakit / Mevduat': 5,
            'Döviz': 10,
            'Kripto / Yüksek Risk': 5
        }
    };
}

// =========================
// SUPABASE SAVE
// =========================
async function saveRiskProfile(result, totalScore) {
    if (!riskUser) return false;

    const { error } = await supabaseClient
        .from('risk_profiles')
        .upsert({
            user_id: riskUser.id,
            score: totalScore,
            profile_type: result.profileType,
            description: result.description,
            allocation: result.allocation,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        });

    if (error) {
        console.error('Risk profili kaydedilemedi:', error);
        alert('Risk profili kaydedilemedi. Lütfen tekrar deneyin.');
        return false;
    }

    return true;
}

// =========================
// RESULT UI
// =========================
function showRiskResult(result, totalScore) {
    document.getElementById('test-box')?.classList.add('hidden');
    document.getElementById('result-box')?.classList.remove('hidden');

    setText('result-emoji', result.emoji);
    setText('profile-type', result.profileType);
    setText('profile-description', result.description);
    setText('profile-score', `${totalScore} / 40`);

    renderAllocationList(result.allocation);

    const resultBox = document.getElementById('result-box');
    if (resultBox) {
        const nav = document.querySelector('nav');
        const offset = nav ? nav.offsetHeight + 20 : 90;
        const top = resultBox.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
            top,
            behavior: 'smooth'
        });
    }
}

function renderAllocationList(allocation) {
    const container = document.getElementById('allocation-list');
    if (!container) return;

    container.innerHTML = '';

    Object.entries(allocation).forEach(([asset, percent]) => {
        const row = document.createElement('div');

        row.innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <span class="font-medium text-gray-700">${asset}</span>
                <span class="font-bold text-blue-600">%${percent}</span>
            </div>

            <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="bg-blue-600 h-3 rounded-full" style="width: ${percent}%;"></div>
            </div>
        `;

        container.appendChild(row);
    });
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// =========================
// RESET
// =========================
function restartRiskTest() {
    currentRiskQuestionIndex = 0;
    riskAnswers = [];

    document.getElementById('result-box')?.classList.add('hidden');
    document.getElementById('test-box')?.classList.remove('hidden');

    loadRiskQuestion();
    scrollToRiskTestTop();
}

// =========================
// GLOBAL EXPORTS
// =========================
window.nextRiskQuestion = nextRiskQuestion;
window.previousRiskQuestion = previousRiskQuestion;
window.restartRiskTest = restartRiskTest;