const bgMusic = document.getElementById('bg-music');
const specialStar = document.getElementById('special-star');
const canvas = document.getElementById('sky-canvas');
const ctx = canvas.getContext('2d');
const birthdayCake = document.getElementById('birthday-cake');
const layersBox = document.getElementById('layers-box');
const virtualKnife = document.getElementById('virtual-knife');
const sideGiftTracker = document.getElementById('side-gift-tracker');

let stars = [];
let candleBlown = false;
let cakeCut = false;
const speakerBtn = document.getElementById('speaker-btn');
let isPlaying = false;

speakerBtn.addEventListener('click', () => {
    if (!isPlaying) {
        bgMusic.play()
            .then(() => {
                speakerBtn.innerText = "🔊";
                isPlaying = true;
            })
            .catch(err => console.log("Playback failed:", err));
    } else {
        bgMusic.pause();
        speakerBtn.innerText = "🔇";
        isPlaying = false;
    }
});

// Update your existing goToScreen2 function to sync with the button
function goToScreen2() {
    // Attempt autoplay, but if it fails, the user can still use the button
    bgMusic.play().then(() => {
        speakerBtn.innerText = "🔊";
        isPlaying = true;
    }).catch(() => {
        console.log("Autoplay blocked, user must click speaker icon.");
    });
    
    switchScreen('screen1', 'screen2');
    initScreen2FX();
}
document.addEventListener("DOMContentLoaded", () => {
    initStars();
    animateStars();

    // Start Journey Link
    const startExperience = (e) => {
        e.preventDefault();
        goToScreen2();
    };
    specialStar.addEventListener('click', startExperience);
    specialStar.addEventListener('touchstart', startExperience);

    // Knife Position Follower Engine
    const updateKnifePosition = (x, y) => {
        if (document.getElementById('screen2').classList.contains('active') && candleBlown && !cakeCut) {
            virtualKnife.style.display = 'block';
            virtualKnife.style.left = x + 'px';
            virtualKnife.style.top = y + 'px';
        }
    };

    window.addEventListener('mousemove', (e) => updateKnifePosition(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        updateKnifePosition(touch.clientX, touch.clientY);
    }, { passive: true });

    // Blow Out Candles Trigger
    const candleArea = document.getElementById('candles-click-area');
    const handleCandleBlow = (e) => {
        e.preventDefault();
        extinguishAllCandles();
    };
    if (candleArea) {
        candleArea.addEventListener('click', handleCandleBlow);
        candleArea.addEventListener('touchstart', handleCandleBlow);
    }

    // Cake Slash Trigger
    const handleCakeCut = (e) => {
        e.preventDefault();
        if (!candleBlown || cakeCut) return;
        triggerCakeCutAction();
    };
    birthdayCake.addEventListener('click', handleCakeCut);
    birthdayCake.addEventListener('touchstart', handleCakeCut);

    // Mystery Gift Box Unwrapping Actions
    layersBox.addEventListener('click', (e) => { e.preventDefault(); unwrapLayer(); });
    layersBox.addEventListener('touchstart', (e) => { e.preventDefault(); unwrapLayer(); });

    // Quiz Option Click Listeners
    document.getElementById('opt0').addEventListener('click', () => submitAnswer(0));
    document.getElementById('opt1').addEventListener('click', () => submitAnswer(1));
});

function switchScreen(hideId, showId) {
    document.getElementById(hideId).classList.remove('active');
    document.getElementById(showId).classList.add('active');
}

function initStars() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8;
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5 + 0.5,
            alpha: Math.random(),
            speed: Math.random() * 0.02 + 0.005
        });
    }
}

function animateStars() {
    if (!document.getElementById('screen1').classList.contains('active')) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) star.speed = -star.speed;
        ctx.globalAlpha = Math.abs(star.alpha);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2.5);
        ctx.fill();
    });
    requestAnimationFrame(animateStars);
}

function goToScreen2() {
    bgMusic.play().catch(() => console.log("Audio activation awaiting manual user focus shift"));
    switchScreen('screen1', 'screen2');
    initScreen2FX();
}

function initScreen2FX() {
    setInterval(() => {
        if (!document.getElementById('screen2').classList.contains('active')) return;
        let b = document.createElement('div');
        b.className = 'balloon';
        b.style.left = Math.random() * 80 + 'vw';
        b.style.background = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a855f7'][Math.floor(Math.random() * 4)];
        document.getElementById('screen2').appendChild(b);
        setTimeout(() => b.remove(), 6000);
    }, 300);
}

function extinguishAllCandles() {
    if (candleBlown) return;
    candleBlown = true;
    document.querySelectorAll('.flame').forEach(f => f.classList.add('blown'));
    document.getElementById('interaction-hint').innerText = "Perfect! Now tap on the cake to make your cut!";
}

function triggerCakeCutAction() {
    if (cakeCut) return;
    cakeCut = true;

    // Animate knife cutting slash movement
    virtualKnife.classList.add('knife-slashing');
    birthdayCake.classList.add('cut');

    // Drop away candle bodies smoothly
    document.querySelectorAll('.candle').forEach(c => c.classList.add('vanished'));

    // Wait for animation, then show the Sweet Message Card
    setTimeout(() => {
        virtualKnife.style.display = 'none';
        document.getElementById('message-overlay').style.display = 'flex';
    }, 600);
}

// Function triggered by the "Continue" button on the Message Card
function proceedToQuiz() {
    document.getElementById('message-overlay').style.display = 'none';
    switchScreen('screen2', 'screen3');
    loadQuestion();
}

/* --- QUIZ DATA --- */
const quizData = [
    { q: "Do you remember the exact date we met?", a: ["January 4th", "June 4th"], correct: 1 },
    { q: "What was the vibe of our first time hanging out?", a: ["Sharing traumas", "gossiping about random things"], correct: 0 },
    { q: "What was the funniest oops moment we had?", a: ["talking in class", "Laughing at silly things"], correct: 1 },
    { q: "The first thing we ever ate or drink together?", a: ["Lassi", "Chaat"], correct: 0 },
    { q: "The first person we gossiped about ?", a: ["My Family", "A specific person"], correct: 1 },
    { q: "The first time I got annoyed with you?", a: ["Misunderstanding", "Lack of communication"], correct: 1 },
    { q: "The first time we spoke on the phone/video call?", a: ["within 1 min", "more than 1 hrs"], correct: 0 },
    { q: "The very first deep secret I told you", a: ["My self", "My family"], correct: 1 },
    { q: "The most vulnerable moment you remember me having?", a: ["Stressing over studies", "Cried about life"], correct: 1 },
    { q: "The first serious conversation we had?", a: ["1 year ago", "recently within 6 months"], correct: 0 }
];

let currentQIndex = 0;
let score = 0;

function loadQuestion() {
    if (currentQIndex < quizData.length) {
        const currentData = quizData[currentQIndex];
        document.getElementById('q-text').innerText = currentData.q;
        document.getElementById('opt0').innerText = currentData.a[0];
        document.getElementById('opt1').innerText = currentData.a[1];
        document.getElementById('opt0').className = 'option-btn';
        document.getElementById('opt1').className = 'option-btn';
    } else {
        switchScreen('screen3', 'screen4');
        evaluateGradePerformance();
    }
}

function submitAnswer(chosenIndex) {
    const btn0 = document.getElementById('opt0');
    if (btn0.classList.contains('correct') || btn0.classList.contains('incorrect')) return;
    const currentData = quizData[currentQIndex];
    const selectedBtn = document.getElementById(`opt${chosenIndex}`);
    if (chosenIndex === currentData.correct) {
        selectedBtn.classList.add('correct');
        score++;
    } else {
        selectedBtn.classList.add('incorrect');
        document.getElementById(`opt${currentData.correct}`).classList.add('correct');
    }
    document.getElementById('score-display').innerText = `Score: ${score} / 10`;
    currentQIndex++;
    setTimeout(loadQuestion, 1200);
}

function evaluateGradePerformance() {
    let gradeMsg = score >= 8 ? "Sach me yaad hai ya bas tukka mara hai?" : (score >= 5 ? "Koyi na sab ko thodi na sab yaad rehta hai" : "Just chill pill yaar koyi baat nahi");
    document.getElementById('final-grade-display').innerHTML = `Final Score: ${score}/10 <br><span style='color:#ec4899;'>${gradeMsg}</span>`;
    setupPolaroidDeck();
}

/* --- POLAROID ARCHITECTURE --- */
const localPhotos = [
    { src: "pic02.png", caption: "I hope you find the peace I could no longer give you" },
    { src: "pic01.png", caption: "I’ll always have a soft spot for the people you used to be" },
    { src: "pic03.png", caption: "My heart is finally learning how to stop knocking on your door." },
    { src: "pic7.jpg", caption: "I am letting you go, not because I have to, but because I finally want to." },
    { src: "pic04.png", caption: "Some doors close not with a bang, but with a quiet irreversible click" },
    { src: "pic5.jpg", caption: "I keep finding things I want to tell you, only to remember that my voice has become background noise you’ve learned to tune out" }
];

function setupPolaroidDeck() {
    const deck = document.getElementById('polaroid-deck');
    deck.innerHTML = "";
    localPhotos.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'polaroid-card';
        card.innerHTML = `<img src="${item.src}" alt="Memory"><div class="polaroid-caption">${item.caption}</div>`;
        deck.appendChild(card);
    });
}

/* --- GIFT WRAPPING CONTROLS --- */
let layersLeft = 6;
const funnyMessages = ["Aur ek baar try karo kya pata kuchh nikal jaye 😁", "Ahannn fir se try karo bad luck 😉", "Are are karo aur ek baar karo😅", "Nahi mila? Koi baat nahi try again 😋", "ho gaya! Abhi bas ek last baar try kar do 😎", "BOOM! hahah yahan kuchh nahi hai aage jao bahut kuchh hai 😆"];
const layerColors = ["#bfa0e8", "#84b5ff", "#d87ebd", "#87cdbf", "#e08a8a", "#63be92", "#cec3c6"];

function unwrapLayer() {
    layersBox.classList.remove('unwrap-rip-action');
    void layersBox.offsetWidth;
    layersBox.classList.add('unwrap-rip-action');
    if (layersLeft > 1) {
        layersLeft--;
        layersBox.style.backgroundColor = layerColors[layersLeft % layerColors.length];
        sideGiftTracker.innerText = funnyMessages[6 - layersLeft - 1];
    } else {
        document.getElementById('box-section').style.display = 'none';
        const deck = document.getElementById('polaroid-deck');
        deck.style.display = 'block';
        document.querySelectorAll('.polaroid-card').forEach((card, idx) => {
            card.style.transform = `rotate(${(idx - 1) * 4}deg)`;
            card.addEventListener('click', () => {
                card.style.transform = 'translateY(-150%) rotate(-25deg)';
                card.style.opacity = '0';
                setTimeout(() => card.remove(), 550);
            });
        });
    }
}
