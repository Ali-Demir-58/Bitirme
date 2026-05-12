// Finansal Analiz Platformu - Risk Profile Test JavaScript

// =========================
// GLOBAL STATE
// =========================
let riskUser = null;
let currentRiskQuestionIndex = 0;
let riskAnswers = [];

// =========================
// RISK TEST QUESTIONS
// index.html/main.js içindeki risk testi sorularıyla aynı tutuldu.
// =========================
const riskQuestions = [
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
                ${currentRiskQuestionIndex + 1}. ${question.question}
            </h3>

            <div class="space-y-3">
                ${question.options.map((option, index) => `
                    <label class="risk-option flex items-start gap-3 p-4 rounded-lg cursor-pointer">
                        <input 
                            type="radio" 
                            name="risk-answer" 
                            value="${index}" 
                            class="mt-1 shrink-0"
                            ${riskAnswers[currentRiskQuestionIndex] === index ? 'checked' : ''}
                        >
                        <span class="text-gray-700">${option}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;

    document.querySelectorAll('input[name="risk-answer"]').forEach(input => {
        input.addEventListener('change', function () {
            const selectedValue = parseInt(this.value);
            riskAnswers[currentRiskQuestionIndex] = selectedValue;

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

    if (selectedAnswer === undefined) return;

    const selectedInput = document.querySelector(`input[name="risk-answer"][value="${selectedAnswer}"]`);

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
    if (riskAnswers[currentRiskQuestionIndex] === undefined) {
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
    const totalScore = riskAnswers.reduce((sum, answer) => sum + Number(answer || 0), 0);
    const result = getRiskProfileResult(totalScore);

    await saveRiskProfile(result, totalScore);
    showRiskResult(result, totalScore);
}

function getRiskProfileResult(totalScore) {
    if (totalScore <= 4) {
        return {
            profileType: 'Korumacı (Temkinli)',
            emoji: '🛡️',
            description: 'Düşük risk toleransına sahip, istikrarlı getiriyi tercih eden yatırımcı profili.',
            allocationText: 'Vadeli Mevduat: %60, DİBS: %25, Altın: %10, Hisse: %5',
            allocation: {
                'Vadeli Mevduat': 60,
                'DİBS': 25,
                'Altın': 10,
                'Hisse': 5
            }
        };
    }

    if (totalScore <= 8) {
        return {
            profileType: 'Ilımlı (Dengeli)',
            emoji: '⚖️',
            description: 'Orta risk toleransına sahip, dengeli getiri-risk profili arayan yatırımcı.',
            allocationText: 'Hisse: %40, Vadeli Mevduat: %30, Altın: %20, DİBS: %10',
            allocation: {
                'Hisse': 40,
                'Vadeli Mevduat': 30,
                'Altın': 20,
                'DİBS': 10
            }
        };
    }

    return {
        profileType: 'Cesur (Atak)',
        emoji: '🚀',
        description: 'Yüksek risk toleransına sahip, maksimum getiri hedefleyen yatırımcı profili.',
        allocationText: 'Hisse: %70, Altın: %15, Vadeli Mevduat: %10, DİBS: %5',
        allocation: {
            'Hisse': 70,
            'Altın': 15,
            'Vadeli Mevduat': 10,
            'DİBS': 5
        }
    };
}

// =========================
// SUPABASE SAVE
// =========================
async function saveRiskProfile(result, totalScore) {
    if (!riskUser) return;

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
        return;
    }
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
    setText('profile-score', `${totalScore} / 9`);

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