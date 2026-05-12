// Finansal Analiz Platformu - Guide JavaScript

// =========================
// GLOBAL STATE
// =========================
let currentQuestionIndex = 0;
let quizScore = 0;
let userAnswers = [];
let quizStarted = false;

// =========================
// QUIZ QUESTIONS
// =========================
const quizQuestions = [
    {
        question: "Bileşik faiz nedir?",
        options: [
            "Sadece anapara üzerinden hesaplanan faiz",
            "Faizin de faize eklendiği faiz hesaplama yöntemi",
            "Devlet tarafından belirlenen faiz oranı",
            "Bankalar arası faiz oranı"
        ],
        correct: 1,
        explanation: "Bileşik faiz, faizin anaparaya eklenerek bir sonraki dönemde bu toplam tutar üzerinden faiz hesaplanmasıdır."
    },
    {
        question: "Risk toleransı nedir?",
        options: [
            "Yatırım yapılacak minimum tutar",
            "Bir yatırımcının risk almaya hazır olduğu düzey",
            "Yatırımın vade süresi",
            "Faiz oranının değişme hızı"
        ],
        correct: 1,
        explanation: "Risk toleransı, bir yatırımcının mali kayıplara ve dalgalanmalara karşı dayanabilme düzeyidir."
    },
    {
        question: "Portföy çeşitlendirmenin temel amacı nedir?",
        options: [
            "Maksimum getiri elde etmek",
            "Riski azaltmak",
            "İşlem maliyetlerini düşürmek",
            "Vergi avantajı sağlamak"
        ],
        correct: 1,
        explanation: "Çeşitlendirme, yatırımları farklı varlıklara yayarak toplam portföy riskini azaltmayı amaçlar."
    },
    {
        question: "BIST 100 endeksi nedir?",
        options: [
            "Türkiye'deki seçili büyük şirketlerin hisse senetlerinden oluşan endeks",
            "İstanbul'daki 100 bankanın performans endeksi",
            "Döviz kurlarını gösteren endeks",
            "Tahvil piyasasını gösteren endeks"
        ],
        correct: 0,
        explanation: "BIST 100, Borsa İstanbul'da işlem gören ve belirli kriterlere göre seçilen 100 paydan oluşan önemli bir endekstir."
    },
    {
        question: "Düzenli aralıklarla sabit tutarda yatırım yapma stratejisi nasıl adlandırılır?",
        options: [
            "Kaldıraçlı işlem",
            "Dolar maliyet ortalaması",
            "Açığa satış",
            "Teknik analiz"
        ],
        correct: 1,
        explanation: "Dolar maliyet ortalaması, belirli aralıklarla sabit tutarda yatırım yaparak ortalama maliyeti dengelemeyi amaçlar."
    },
    {
        question: "Enflasyon yatırım kararlarında neden önemlidir?",
        options: [
            "Sadece döviz fiyatlarını etkilediği için",
            "Paranın satın alma gücünü etkilediği için",
            "Sadece hisse senetlerini etkilediği için",
            "Yatırım riskini tamamen ortadan kaldırdığı için"
        ],
        correct: 1,
        explanation: "Enflasyon, paranın satın alma gücünü azaltır. Bu nedenle nominal getiri kadar reel getiri de önemlidir."
    },
    {
        question: "Sharpe oranı genel olarak neyi ölçer?",
        options: [
            "Yatırımın toplam işlem hacmini",
            "Risk başına elde edilen getiriyi",
            "Şirketin piyasa değerini",
            "Döviz kurunun değişim hızını"
        ],
        correct: 1,
        explanation: "Sharpe oranı, bir yatırımın aldığı riske kıyasla ne kadar getiri sağladığını değerlendirmek için kullanılır."
    },
    {
        question: "Likidite ne anlama gelir?",
        options: [
            "Bir varlığın kolayca nakde çevrilebilmesi",
            "Bir yatırımın hiç risk taşımaması",
            "Sadece nakit para tutmak",
            "Yüksek faiz getirisi"
        ],
        correct: 0,
        explanation: "Likidite, bir varlığın değer kaybı yaşamadan veya az kayıpla hızlıca nakde çevrilebilme özelliğidir."
    },
    {
        question: "Uzun vadeli yatırımda en önemli avantajlardan biri hangisidir?",
        options: [
            "Her gün işlem yapma zorunluluğu",
            "Bileşik getiriden faydalanma",
            "Risksiz kazanç garantisi",
            "Vergi ödememe"
        ],
        correct: 1,
        explanation: "Uzun vadede bileşik getiri etkisi daha belirgin hale gelir ve yatırım büyümesine katkı sağlayabilir."
    },
    {
        question: "Yatırım tavsiyesi ile bilgilendirme arasındaki fark nedir?",
        options: [
            "İkisi tamamen aynıdır",
            "Bilgilendirme genel bilgi verir, yatırım tavsiyesi kişiye özel yönlendirme içerir",
            "Bilgilendirme sadece bankalar tarafından yapılır",
            "Yatırım tavsiyesi hiçbir zaman risk içermez"
        ],
        correct: 1,
        explanation: "Bilgilendirme genel eğitim amaçlıdır; yatırım tavsiyesi ise kişinin finansal durumuna ve hedeflerine göre özel yönlendirme içerir."
    }
];

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', function () {
    initializeAnimations();
    initializeInteractions();

    if (window.location.hash === '#quiz') {
        scrollToSection('quiz');
    }
});

// =========================
// SAFE HELPERS
// =========================
function getEl(id) {
    return document.getElementById(id);
}

function safeAnime(config) {
    if (typeof anime === 'undefined') return;
    anime(config);
}

function isMobileScreen() {
    return window.innerWidth < 768;
}

// =========================
// ANIMATIONS
// =========================
function initializeAnimations() {
    if (typeof anime === 'undefined') return;

    const cards = document.querySelectorAll('.guide-card');
    if (!cards.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            anime({
                targets: entry.target,
                translateY: [20, 0],
                opacity: [0, 1],
                duration: 500,
                easing: 'easeOutExpo'
            });

            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.15
    });

    cards.forEach(card => observer.observe(card));
}

// =========================
// ACCORDION
// =========================
function toggleAccordion(sectionId) {
    const content = getEl(`${sectionId}-content`);
    const icon = getEl(`${sectionId}-icon`);

    if (!content) return;

    const isActive = content.classList.contains('active');

    document.querySelectorAll('.accordion-content').forEach(acc => {
        acc.classList.remove('active');
    });

    document.querySelectorAll('[id$="-icon"]').forEach(ic => {
        ic.style.transform = 'rotate(0deg)';
    });

    if (!isActive) {
        content.classList.add('active');

        if (icon) {
            icon.style.transform = 'rotate(180deg)';
        }

        if (isMobileScreen()) {
            setTimeout(() => {
                content.parentElement?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 120);
        }
    }
}

// =========================
// QUIZ
// =========================
function startQuiz() {
    quizStarted = true;
    currentQuestionIndex = 0;
    quizScore = 0;
    userAnswers = [];

    getEl('quiz-start')?.classList.add('hidden');
    getEl('quiz-results')?.classList.add('hidden');
    getEl('quiz-questions')?.classList.remove('hidden');

    loadQuestion();

    setTimeout(() => {
        getEl('quiz-container')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

function loadQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    const questionContent = getEl('question-content');

    if (!question || !questionContent) return;

    questionContent.innerHTML = `
        <div class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">${question.question}</h4>

            <div class="space-y-3">
                ${question.options.map((option, index) => `
                    <label class="quiz-option flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="quiz-answer" value="${index}" class="mt-1 shrink-0">
                        <span class="text-gray-700">${option}</span>
                    </label>
                `).join('')}
            </div>
        </div>

        <div id="explanation" class="hidden p-4 bg-blue-50 rounded-lg">
            <p class="text-blue-800 text-sm">${question.explanation}</p>
        </div>
    `;

    safeSetText('current-question', currentQuestionIndex + 1);
    safeSetText('quiz-score', quizScore);

    const prevBtn = getEl('prev-btn');
    const nextBtn = getEl('next-btn');

    if (prevBtn) {
        prevBtn.disabled = currentQuestionIndex === 0;
    }

    if (nextBtn) {
        nextBtn.textContent =
            currentQuestionIndex === quizQuestions.length - 1
                ? 'Testi Bitir'
                : 'Sonraki';
    }

    document.querySelectorAll('input[name="quiz-answer"]').forEach(input => {
        input.addEventListener('change', function () {
            const selectedValue = parseInt(this.value);

            userAnswers[currentQuestionIndex] = selectedValue;

            document.querySelectorAll('.quiz-option').forEach(opt => {
                opt.classList.remove('selected', 'correct', 'incorrect');
            });

            const selectedOption = this.closest('.quiz-option');
            if (selectedOption) {
                selectedOption.classList.add('selected');
            }

            const explanation = getEl('explanation');
            if (explanation) {
                explanation.classList.remove('hidden');
            }
        });
    });

    restoreSelectedAnswer();
}

function safeSetText(id, value) {
    const el = getEl(id);
    if (el) el.textContent = value;
}

function restoreSelectedAnswer() {
    const previousAnswer = userAnswers[currentQuestionIndex];

    if (previousAnswer === undefined) return;

    const input = document.querySelector(`input[name="quiz-answer"][value="${previousAnswer}"]`);

    if (!input) return;

    input.checked = true;

    const option = input.closest('.quiz-option');
    if (option) {
        option.classList.add('selected');
    }

    getEl('explanation')?.classList.remove('hidden');
}

function nextQuestion() {
    if (userAnswers[currentQuestionIndex] === undefined) {
        alert('Lütfen bir cevap seçin.');
        return;
    }

    if (currentQuestionIndex === quizQuestions.length - 1) {
        finishQuiz();
        return;
    }

    currentQuestionIndex++;
    loadQuestion();

    if (isMobileScreen()) {
        getEl('quiz-container')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function previousQuestion() {
    if (currentQuestionIndex <= 0) return;

    currentQuestionIndex--;
    loadQuestion();

    if (isMobileScreen()) {
        getEl('quiz-container')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function finishQuiz() {
    quizScore = 0;

    userAnswers.forEach((answer, index) => {
        if (answer === quizQuestions[index].correct) {
            quizScore++;
        }
    });

    getEl('quiz-questions')?.classList.add('hidden');
    getEl('quiz-results')?.classList.remove('hidden');

    safeSetText('final-score', `${quizScore}/${quizQuestions.length}`);

    const percentage = (quizScore / quizQuestions.length) * 100;

    let message = '';
    let emoji = '';

    if (percentage >= 80) {
        message = "Mükemmel! Finansal okuryazarlık seviyeniz çok yüksek.";
        emoji = "🏆";
    } else if (percentage >= 60) {
        message = "Tebrikler! Finansal bilginiz iyi seviyede.";
        emoji = "🎉";
    } else if (percentage >= 40) {
        message = "İyi bir başlangıç. Temel kavramları biraz daha pekiştirmeniz faydalı olur.";
        emoji = "📚";
    } else {
        message = "Finansal okuryazarlığınızı geliştirmeniz gerekiyor. Rehberdeki temel kavramları tekrar inceleyebilirsiniz.";
        emoji = "💪";
    }

    safeSetText('result-message', message);
    safeSetText('result-emoji', emoji);

    safeAnime({
        targets: '#quiz-results > *',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutExpo',
        delay: anime.stagger(80)
    });

    getEl('quiz-container')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function restartQuiz() {
    quizStarted = false;
    currentQuestionIndex = 0;
    quizScore = 0;
    userAnswers = [];

    getEl('quiz-results')?.classList.add('hidden');
    getEl('quiz-questions')?.classList.add('hidden');
    getEl('quiz-start')?.classList.remove('hidden');

    const prevBtn = getEl('prev-btn');
    const nextBtn = getEl('next-btn');

    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.textContent = 'Sonraki';

    getEl('quiz-container')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function shareResults() {
    const score = quizScore;
    const total = quizQuestions.length;
    const percentage = Math.round((score / total) * 100);

    const shareText =
        `Finansal Bilgi Testi sonucum: ${score}/${total} (${percentage}%). Finansal Analiz Platformu'nda bilginizi test edin.`;

    if (navigator.share) {
        navigator.share({
            title: 'Finansal Bilgi Testi Sonucum',
            text: shareText,
            url: window.location.href
        }).catch(() => {
            copyShareText(shareText);
        });
    } else {
        copyShareText(shareText);
    }
}

function copyShareText(text) {
    const fullText = `${text} ${window.location.href}`;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(fullText).then(() => {
            showNotification('Sonuç kopyalandı. Yapıştırarak paylaşabilirsiniz.', 'success');
        }).catch(() => {
            showNotification('Kopyalama desteklenmiyor.', 'error');
        });
    } else {
        showNotification('Bu tarayıcıda paylaşım desteklenmiyor.', 'error');
    }
}

// =========================
// SCROLL HELPERS
// =========================
function scrollToSection(sectionId) {
    const section = getEl(sectionId);

    if (!section) return;

    section.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function scrollToContent() {
    scrollToSection('basics');
}

// =========================
// NOTIFICATION
// =========================
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

    safeAnime({
        targets: notification,
        translateY: [-10, 0],
        opacity: [0, 1],
        duration: 250,
        easing: 'easeOutExpo'
    });

    setTimeout(() => {
        if (typeof anime !== 'undefined') {
            anime({
                targets: notification,
                translateY: [0, -10],
                opacity: [1, 0],
                duration: 250,
                easing: 'easeInExpo',
                complete: () => notification.remove()
            });
        } else {
            notification.remove();
        }
    }, 3000);
}

// =========================
// INTERACTIONS
// =========================
function initializeInteractions() {
    // Mobilde hover-scale animasyonu sorun çıkarabildiği için sadece desktop’ta çalıştırıyoruz.
    if (!isMobileScreen() && typeof anime !== 'undefined') {
        document.querySelectorAll('.guide-card').forEach(card => {
            card.addEventListener('mouseenter', function () {
                anime({
                    targets: this,
                    scale: 1.01,
                    duration: 180,
                    easing: 'easeOutQuad'
                });
            });

            card.addEventListener('mouseleave', function () {
                anime({
                    targets: this,
                    scale: 1,
                    duration: 180,
                    easing: 'easeOutQuad'
                });
            });
        });
    }

    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function () {
            safeAnime({
                targets: this,
                scale: [1, 0.98, 1],
                duration: 120,
                easing: 'easeInOutQuad'
            });
        });
    });
}

// =========================
// KEYBOARD NAVIGATION
// =========================
document.addEventListener('keydown', function (e) {
    const questionsPanel = getEl('quiz-questions');
    const resultsPanel = getEl('quiz-results');

    const quizQuestionsVisible =
        quizStarted &&
        questionsPanel &&
        !questionsPanel.classList.contains('hidden') &&
        resultsPanel &&
        resultsPanel.classList.contains('hidden');

    if (!quizQuestionsVisible) return;

    if (e.key === 'Enter') {
        nextQuestion();
    }

    if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        previousQuestion();
    }

    if (e.key === 'ArrowRight') {
        nextQuestion();
    }

    if (e.key >= '1' && e.key <= '4') {
        const optionIndex = parseInt(e.key) - 1;
        const optionInputs = document.querySelectorAll('input[name="quiz-answer"]');

        if (optionInputs[optionIndex]) {
            optionInputs[optionIndex].click();
        }
    }
});

// =========================
// GLOBAL EXPORTS
// =========================
window.toggleAccordion = toggleAccordion;

window.startQuiz = startQuiz;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.restartQuiz = restartQuiz;
window.shareResults = shareResults;

window.scrollToSection = scrollToSection;
window.scrollToContent = scrollToContent;