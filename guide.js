// Finansal Analiz Platformu - Guide JavaScript

// Global Variables
let currentQuestionIndex = 0;
let quizScore = 0;
let userAnswers = [];
let quizStarted = false;

// Quiz Questions
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
        question: "2024 yılında Türkiye'de enflasyon karşısında reel getiri sağlayan tek yatırım aracı hangisidir?",
        options: [
            "BIST 100",
            "Dolar",
            "Altın",
            "Mevduat faizi"
        ],
        correct: 2,
        explanation: "2024 yılında sadece altın yatırımcısına %12,11 oranında reel getiri sağladı."
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
        explanation: "Risk toleransı, bir yatırımcının mali kayıplara karşı dayanabilme gücüdür."
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
        explanation: "Çeşitlendirme, yatırımları farklı varlıklara yayarak toplam riski azaltma stratejisidir."
    },
    {
        question: "BIST 100 endeksi nedir?",
        options: [
                            "Türkiye'deki 100 en büyük şirketin hisse senetlerinden oluşan endeks",
            "İstanbul'daki 100 bankanın performans endeksi",
            "Döviz kurlarını gösteren endeks",
            "Tahvil piyasasını gösteren endeks"
        ],
        correct: 0,
        explanation: "BIST 100, Borsa İstanbul'da işlem gören en büyük 100 şirketin hisse senetlerinden oluşan endekstir."
    },
    {
        question: "Yüksek enflasyon dönemlerinde hangi yatırım araçları tercih edilmelidir?",
        options: [
            "Sadece döviz",
            "Sadece mevduat",
            "Enflasyona endeksli araçlar ve emtialar",
            "Sadece hisse senetleri"
        ],
        correct: 2,
        explanation: "Enflasyon dönemlerinde enflasyona endeksli tahviller, altın gibi emtialar ve hisse senetleri tercih edilmelidir."
    },
    {
        question: "Dolar maliyet ortalaması stratejisi nedir?",
        options: [
            "Döviz alım-satımı yaparak kar elde etme",
            "Düzenli aralıklarla sabit tutarda yatırım yapma",
            "Sadece dolar bazlı yatırım yapma",
            "Piyasa düşüşlerini bekleyerek yatırım yapma"
        ],
        correct: 1,
        explanation: "Dolar maliyet ortalaması, belirli aralıklarla sabit tutarlarda yatırım yaparak ortalama alım maliyetini düşürme stratejisidir."
    },
    {
        question: "2024 yılı itibarıyla Türkiye'de yatırımcı sayısı kaç milyon civarındadır?",
        options: [
            "3 milyon",
            "5 milyon",
            "7 milyon",
            "10 milyon"
        ],
        correct: 2,
        explanation: "2024 yılı itibarıyla Türkiye'de yaklaşık 7,1 milyon yatırımcı bulunmaktadır."
    },
    {
        question: "Sharpe oranı neyi gösterir?",
        options: [
            "Yatırımın toplam getirisini",
            "Risk-getiri performansını",
            "Piyasa değerini",
            "İşlem hacmini"
        ],
        correct: 1,
        explanation: "Sharpe oranı, bir yatırımın risk-getiri performansını ölçer. Risk birimine karşılık elde edilen getiriyi gösterir."
    },
    {
        question: "Türk yatırımcılarının tasarruflarını en çok hangi araçta değerlendirdiği görülmektedir?",
        options: [
            "Hisse senetleri",
            "Vadeli mevduat",
            "Altın",
            "Döviz"
        ],
        correct: 1,
        explanation: "Araştırmalar göstermektedir ki Türk yatırımcılar tasarruflarının en büyük kısmını vadeli mevduatta değerlendirmektedir."
    }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeInteractions();
});

// Animation Functions
function initializeAnimations() {
    // Animate guide cards on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                anime({
                    targets: entry.target,
                    translateY: [30, 0],
                    opacity: [0, 1],
                    duration: 600,
                    easing: 'easeOutExpo',
                    delay: 100
                });
            }
        });
    });

    document.querySelectorAll('.guide-card').forEach(card => {
        observer.observe(card);
    });
}

// Accordion Functions
function toggleAccordion(sectionId) {
    const content = document.getElementById(sectionId + '-content');
    const icon = document.getElementById(sectionId + '-icon');
    
    if (content.classList.contains('active')) {
        content.classList.remove('active');
        icon.style.transform = 'rotate(0deg)';
    } else {
        // Close all other accordions
        document.querySelectorAll('.accordion-content').forEach(acc => {
            acc.classList.remove('active');
        });
        document.querySelectorAll('[id$="-icon"]').forEach(ic => {
            ic.style.transform = 'rotate(0deg)';
        });
        
        // Open current accordion
        content.classList.add('active');
        icon.style.transform = 'rotate(180deg)';
    }
}

// Quiz Functions
function startQuiz() {
    if (!quizStarted) {
        quizStarted = true;
        currentQuestionIndex = 0;
        quizScore = 0;
        userAnswers = [];
        
        document.getElementById('quiz-start').classList.add('hidden');
        document.getElementById('quiz-questions').classList.remove('hidden');
        
        loadQuestion();
    } else {
        restartQuiz();
    }
}

function loadQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    const questionContent = document.getElementById('question-content');
    
    questionContent.innerHTML = `
        <div class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">${question.question}</h4>
            <div class="space-y-3">
                ${question.options.map((option, index) => `
                    <label class="quiz-option flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="quiz-answer" value="${index}" class="mr-3">
                        <span class="text-gray-700">${option}</span>
                    </label>
                `).join('')}
            </div>
        </div>
        <div id="explanation" class="hidden p-4 bg-blue-50 rounded-lg">
            <p class="text-blue-800 text-sm">${question.explanation}</p>
        </div>
    `;
    
    // Update question counter
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    
    // Update button states
    document.getElementById('prev-btn').disabled = currentQuestionIndex === 0;
    document.getElementById('next-btn').textContent = currentQuestionIndex === quizQuestions.length - 1 ? 'Testi Bitir' : 'Sonraki';
    
    // Add event listeners to options
    document.querySelectorAll('input[name="quiz-answer"]').forEach(input => {
        input.addEventListener('change', function() {
            const selectedOption = this.closest('.quiz-option');
            document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
            selectedOption.classList.add('selected');
            
            // Show explanation
            document.getElementById('explanation').classList.remove('hidden');
            
            // Store answer
            userAnswers[currentQuestionIndex] = parseInt(this.value);
        });
    });
    
    // If user already answered this question, restore selection
    if (userAnswers[currentQuestionIndex] !== undefined) {
        const correspondingInput = document.querySelector(`input[value="${userAnswers[currentQuestionIndex]}"]`);
        if (correspondingInput) {
            correspondingInput.checked = true;
            correspondingInput.closest('.quiz-option').classList.add('selected');
            document.getElementById('explanation').classList.remove('hidden');
        }
    }
}

function nextQuestion() {
    // Check if user answered the current question
    if (userAnswers[currentQuestionIndex] === undefined) {
        alert('Lütfen bir cevap seçin.');
        return;
    }
    
    // Check if it's the last question
    if (currentQuestionIndex === quizQuestions.length - 1) {
        finishQuiz();
    } else {
        currentQuestionIndex++;
        loadQuestion();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

function finishQuiz() {
    // Calculate score
    quizScore = 0;
    userAnswers.forEach((answer, index) => {
        if (answer === quizQuestions[index].correct) {
            quizScore++;
        }
    });
    
    // Show results
    document.getElementById('quiz-questions').classList.add('hidden');
    document.getElementById('quiz-results').classList.remove('hidden');
    
    // Update score display
    document.getElementById('final-score').textContent = `${quizScore}/${quizQuestions.length}`;
    
    // Update result message and emoji based on score
    const percentage = (quizScore / quizQuestions.length) * 100;
    let message, emoji;
    
    if (percentage >= 80) {
        message = "Mükemmel! Finansal okuryazarlık seviyeniz çok yüksek.";
        emoji = "🏆";
    } else if (percentage >= 60) {
        message = "Tebrikler! Finansal bilginiz oldukça iyi seviyede.";
        emoji = "🎉";
    } else if (percentage >= 40) {
        message = "İyi bir başlangıç! Biraz daha çalışmanız gerekiyor.";
        emoji = "📚";
    } else {
        message = "Finansal okuryazarlığınızı geliştirmeniz gerekiyor.";
        emoji = "💪";
    }
    
    document.getElementById('result-message').textContent = message;
    document.getElementById('result-emoji').textContent = emoji;
    
    // Animate results
    anime({
        targets: '#quiz-results > *',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutExpo',
        delay: anime.stagger(100)
    });
}

function restartQuiz() {
    // Reset quiz state
    currentQuestionIndex = 0;
    quizScore = 0;
    userAnswers = [];
    quizStarted = false;
    
    // Hide results and show start screen
    document.getElementById('quiz-results').classList.add('hidden');
    document.getElementById('quiz-questions').classList.add('hidden');
    document.getElementById('quiz-start').classList.remove('hidden');
    
    // Reset button states
    document.getElementById('prev-btn').disabled = true;
    document.getElementById('next-btn').textContent = 'Sonraki';
}

function shareResults() {
    const score = quizScore;
    const total = quizQuestions.length;
    const percentage = Math.round((score / total) * 100);
    
    const shareText = `Finansal Bilgi Testi sonucum: ${score}/${total} (${percentage}%) - Finansal Analiz Platformu'nda bilginizi test edin!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Finansal Bilgi Testi Sonucum',
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(shareText + ' ' + window.location.href).then(() => {
            showNotification('Sonuç kopyalandı! Yapıştırarak paylaşabilirsiniz.', 'success');
        });
    }
}

// Utility Functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function scrollToContent() {
    document.getElementById('basics').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    notification.className = `fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    anime({
        targets: notification,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutExpo'
    });
    
    setTimeout(() => {
        anime({
            targets: notification,
            translateX: [0, 300],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInExpo',
            complete: () => notification.remove()
        });
    }, 3000);
}

// Interaction Functions
function initializeInteractions() {
    // Smooth scrolling for navigation buttons
    document.querySelectorAll('button[onclick^="scrollToSection"]').forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            scrollToSection(sectionId);
        });
    });
    
    // Add hover effects to guide cards
    document.querySelectorAll('.guide-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                scale: 1.02,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
        
        card.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                scale: 1,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
    });
    
    // Add click effects to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            anime({
                targets: this,
                scale: [1, 0.95, 1],
                duration: 150,
                easing: 'easeInOutQuad'
            });
        });
    });
}

// Keyboard Navigation
document.addEventListener('keydown', function(e) {
    if (quizStarted && !document.getElementById('quiz-results').classList.contains('hidden')) {
        if (e.key === 'Enter') {
            if (currentQuestionIndex < quizQuestions.length - 1) {
                nextQuestion();
            } else {
                finishQuiz();
            }
        }
        
        if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
            previousQuestion();
        }
        
        if (e.key === 'ArrowRight' && currentQuestionIndex < quizQuestions.length - 1) {
            nextQuestion();
        }
        
        // Number keys for answer selection
        if (e.key >= '1' && e.key <= '4') {
            const optionIndex = parseInt(e.key) - 1;
            const optionInputs = document.querySelectorAll('input[name="quiz-answer"]');
            if (optionInputs[optionIndex]) {
                optionInputs[optionIndex].click();
            }
        }
    }
});

// Export functions for global access
window.toggleAccordion = toggleAccordion;
window.startQuiz = startQuiz;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.restartQuiz = restartQuiz;
window.shareResults = shareResults;
window.scrollToSection = scrollToSection;
window.scrollToContent = scrollToContent;