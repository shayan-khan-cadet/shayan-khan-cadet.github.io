/* ============================================================
   AUDIO UNLOCK (Browsers block audio until user interaction)
   ============================================================ */
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let audioUnlocked = false;

function unlockAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new AudioContext();
        } catch (e) { return; }
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    if (!audioUnlocked) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        gain.gain.value = 0.0001;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.01);
        audioUnlocked = true;
    }
}

document.addEventListener('click', unlockAudio, { once: false });
document.addEventListener('keydown', unlockAudio, { once: false });
document.addEventListener('touchstart', unlockAudio, { once: false });

function playSound(type) {
    unlockAudio();
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;

        if (type === 'click') {
            osc.frequency.value = 800;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'success') {
            osc.frequency.value = 1200;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'open') {
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.linearRampToValueAtTime(900, now + 0.15);
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        }
    } catch (e) { /* silent */ }
}

/* ============================================================
   THEME TOGGLE
   ============================================================ */
const themeToggle = document.getElementById('themeToggle');
const htmlEl = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'dark';
htmlEl.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

themeToggle.addEventListener('click', () => {
    playSound('click');
    const current = htmlEl.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', next);
    themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('theme', next);
});

/* ============================================================
   TYPING EFFECT
   ============================================================ */
const taglineEl = document.getElementById('typingTagline');
const taglineText = 'Junior Penetration Tester · Bug Hunter · Security Researcher';
let taglineIndex = 0;

function typeTagline() {
    if (taglineIndex < taglineText.length) {
        taglineEl.innerHTML = taglineText.substring(0, taglineIndex + 1) + '<span class="typing-cursor"></span>';
        taglineIndex++;
        setTimeout(typeTagline, 50);
    } else {
        taglineEl.innerHTML = taglineText + '<span class="typing-cursor"></span>';
    }
}
setTimeout(typeTagline, 500);

/* ============================================================
   VISITOR COUNTER
   ============================================================ */
async function loadVisitorCount() {
    const countEl = document.getElementById('visitorCount');
    try {
        const response = await fetch('https://shayankhan.goatcounter.com/counter/TOTAL.json');
        const data = await response.json();
        if (data && data.count) {
            countEl.textContent = parseInt(data.count).toLocaleString();
        } else {
            countEl.textContent = '1';
        }
    } catch (e) {
        let local = parseInt(localStorage.getItem('visitCount') || '0');
        local++;
        localStorage.setItem('visitCount', local);
        countEl.textContent = local;
    }
}
loadVisitorCount();

/* ============================================================
   SKILL POPUP
   ============================================================ */
const skillData = {
    burp: { icon: '🕷️', title: 'Burp Suite', desc: 'Industry-standard web vulnerability scanner and interception proxy.', experience: 'Used daily for all web app testing. Found 15+ critical vulnerabilities using it.' },
    nmap: { icon: '🌐', title: 'Nmap', desc: 'Network mapping and port scanning tool.', experience: 'Used for reconnaissance to map networks and find exposed services.' },
    metasploit: { icon: '💀', title: 'Metasploit', desc: 'Penetration testing framework for exploit development.', experience: 'Used for post-exploitation and validating critical vulnerabilities.' },
    sqlmap: { icon: '🗄️', title: 'SQLmap', desc: 'Automatic SQL injection and database takeover tool.', experience: 'Automated exploitation after manually confirming SQLi.' },
    owasp: { icon: '🛡️', title: 'OWASP Top 10', desc: 'The standard awareness document for web application security.', experience: 'In-depth knowledge of all OWASP Top 10 vulnerabilities.' },
    api: { icon: '🔌', title: 'API Testing', desc: 'Security testing of REST, GraphQL, and SOAP APIs.', experience: 'Found IDOR, Mass Assignment, BOLA, and Rate Limiting issues.' },
    python: { icon: '🐍', title: 'Python Scripting', desc: 'Automating security tasks and building tools.', experience: 'Built scripts for subdomain enum, fuzzing, and JWT analysis.' },
    linux: { icon: '🐧', title: 'Linux / Kali', desc: 'Proficiency with Linux systems and Kali.', experience: 'Using Linux for 3+ years and Kali for all pentesting work.' },
    social: { icon: '🎭', title: 'Social Engineering', desc: 'Phishing, pretexting, and vishing.', experience: 'Conducted phishing simulations and awareness sessions.' },
    report: { icon: '📝', title: 'Report Writing', desc: 'Clear, actionable security reports.', experience: 'Written 10+ reports with executive summaries and CVSS scoring.' },
    recon: { icon: '🔍', title: 'Reconnaissance', desc: 'Information gathering before attacks.', experience: 'Use Sublist3r, Amass, Shodan. Found many forgotten subdomains.' },
    logic: { icon: '⚙️', title: 'Business Logic Testing', desc: 'Testing flaws in business rules.', experience: 'My specialty! Found price manipulation, race conditions, and more.' }
};

const popup = document.getElementById('skillPopup');
const popupClose = document.getElementById('closePopup');
const popupIcon = document.getElementById('popupIcon');
const popupTitle = document.getElementById('popupTitle');
const popupDesc = document.getElementById('popupDesc');
const popupExperience = document.getElementById('popupExperience');

document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('click', function() {
        playSound('click');
        const data = skillData[this.dataset.skill];
        if (data) {
            popupIcon.textContent = data.icon;
            popupTitle.textContent = data.title;
            popupDesc.textContent = data.desc;
            popupExperience.textContent = data.experience;
            popup.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    });
});

function closePopup() {
    popup.classList.remove('open');
    document.body.style.overflow = '';
}

popupClose.addEventListener('click', () => { playSound('click'); closePopup(); });
popup.addEventListener('click', function(e) { if (e.target === this) closePopup(); });

/* ============================================================
   ACHIEVEMENT WALL
   ============================================================ */
const wall = document.getElementById('achievementWall');
const openBtn = document.getElementById('openWallBtn');
const closeBtn = document.getElementById('closeWallBtn');

openBtn.addEventListener('click', () => {
    playSound('open');
    wall.classList.add('open');
    document.body.style.overflow = 'hidden';
});

function closeWall() {
    wall.classList.remove('open');
    document.body.style.overflow = '';
}

closeBtn.addEventListener('click', () => { playSound('click'); closeWall(); });
wall.addEventListener('click', function(e) { if (e.target === wall) closeWall(); });

/* ============================================================
   TESTIMONIAL SLIDER
   ============================================================ */
const slider = document.getElementById('testimonialSlider');
const slides = document.querySelectorAll('.testimonial-slide');
const prevBtn = document.getElementById('prevSlide');
const nextBtn = document.getElementById('nextSlide');
const dotsContainer = document.getElementById('sliderDots');
let currentSlide = 0;

slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => { playSound('click'); goToSlide(i); });
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.slider-dot');

function goToSlide(index) {
    currentSlide = index;
    slider.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
}

prevBtn.addEventListener('click', () => {
    playSound('click');
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(currentSlide);
});

nextBtn.addEventListener('click', () => {
    playSound('click');
    currentSlide = (currentSlide + 1) % slides.length;
    goToSlide(currentSlide);
});

setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    goToSlide(currentSlide);
}, 6000);

/* ============================================================
   INTERACTIVE TERMINAL
   ============================================================ */
const termInput = document.getElementById('termInput');
const termOutputWrapper = document.getElementById('termOutputWrapper');
const terminalBody = document.getElementById('terminalBody');

const commands = {
    help: () => [
        '<span class="term-highlight">Available commands:</span>',
        '  <span class="term-gold">whoami</span>       — About Shayan',
        '  <span class="term-gold">skills</span>       — List technical skills',
        '  <span class="term-gold">achievements</span> — Show disclosures',
        '  <span class="term-gold">experience</span>   — Career highlights',
        '  <span class="term-gold">contact</span>      — Contact info',
        '  <span class="term-gold">cv</span>           — Download CV',
        '  <span class="term-gold">clear</span>        — Clear terminal',
        '  <span class="term-gold">help</span>         — Show this message'
    ],
    whoami: () => [
        '<span class="term-success">Shayan Khan</span> — Junior Penetration Tester',
        'Bug Hunter · Security Researcher',
        'Location: Takht Bhai, Mardan, Pakistan',
        'Currently: BS CS Student at AWKUM'
    ],
    skills: () => [
        '<span class="term-highlight">Technical Skills:</span>',
        '  🕷️  Burp Suite        🌐 Nmap',
        '  💀 Metasploit        🗄️ SQLmap',
        '  🛡️  OWASP Top 10     🔌 API Testing',
        '  🐍 Python Scripting  🐧 Linux / Kali',
        '  🎭 Social Engineering 📝 Report Writing',
        '  🔍 Reconnaissance    ⚙️ Business Logic'
    ],
    achievements: () => [
        '<span class="term-highlight">Security Disclosures:</span>',
        '  ✔ <span class="term-gold">Wisdmlabs</span> — Race Condition (CWE-362)',
        '  ✔ <span class="term-gold">Taskplanet</span> — 7+ Critical Vulnerabilities',
        '  ✔ <span class="term-gold">Walee</span> — Price Manipulation Flaw',
        '  ✔ <span class="term-gold">Vajraglobal</span> — S3 Bucket Misconfiguration',
        '',
        '  ★ <span class="term-success">Exfiltra</span> — Selected as Jr. Security Engineer'
    ],
    experience: () => [
        '<span class="term-highlight">Career Highlights:</span>',
        '  ★ Selected as Junior Security Engineer at Exfiltra (2025)',
        '    → Beat BS CS graduates with only FSc background',
        '    → Offered 70,000 PKR/month — declined for studies',
        '  • Vulnerability Disclosure Researcher (2024 – Present)',
        '  • Independent Security Researcher (2023 – Present)'
    ],
    contact: () => [
        '<span class="term-highlight">Contact Info:</span>',
        '  📧 Email:     shayankhan.vop@gmail.com',
        '  🐙 GitHub:    github.com/shayan-khan-cadet',
        '  📞 Phone:     +923236828840'
    ],
    cv: () => {
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = 'Shayan_Khan_CV.pdf';
            link.download = 'Shayan_Khan_CV.pdf';
            link.click();
        }, 500);
        return ['<span class="term-success">✓ Downloading CV...</span>'];
    },
    clear: () => {
        termOutputWrapper.innerHTML = '';
        termInput.focus();
        return [];
    }
};

termInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const cmd = this.value.trim().toLowerCase();
        this.value = '';

        const cmdLine = document.createElement('div');
        cmdLine.className = 'term-line';
        cmdLine.innerHTML = `<span class="term-prompt">$</span> <span class="term-command">${cmd}</span>`;
        termOutputWrapper.appendChild(cmdLine);

        if (cmd) {
            if (commands[cmd]) {
                playSound('success');
                const output = commands[cmd]();
                output.forEach(line => {
                    const outLine = document.createElement('div');
                    outLine.className = 'term-line term-output';
                    outLine.innerHTML = line;
                    termOutputWrapper.appendChild(outLine);
                });
            } else {
                playSound('click');
                const errLine = document.createElement('div');
                errLine.className = 'term-line term-error';
                errLine.innerHTML = `command not found: ${cmd}. Type <span class="term-highlight">help</span> for available commands.`;
                termOutputWrapper.appendChild(errLine);
            }
        }

        const blank = document.createElement('div');
        blank.className = 'term-line';
        blank.innerHTML = '&nbsp;';
        termOutputWrapper.appendChild(blank);

        terminalBody.scrollTop = terminalBody.scrollHeight;
        termInput.focus();
    }
});

terminalBody.addEventListener('click', () => termInput.focus());

/* ============================================================
   SKILL BARS ANIMATION
   ============================================================ */
const skillBars = document.querySelectorAll('.skill-bar-fill');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const width = entry.target.dataset.width;
            entry.target.style.width = width + '%';
        }
    });
}, { threshold: 0.3 });

skillBars.forEach(bar => observer.observe(bar));

/* ============================================================
   ESC KEY
   ============================================================ */
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (popup.classList.contains('open')) closePopup();
        if (wall.classList.contains('open')) closeWall();
    }
});

/* ============================================================
   CV BUTTON SOUND
   ============================================================ */
document.getElementById('cvBtn').addEventListener('click', () => playSound('success'));
