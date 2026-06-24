/* ===== PORTFOLIO JAVASCRIPT ===== */

// ===== PARTICLE SYSTEM =====
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.particles = [];
        const count = Math.min(80, Math.floor(window.innerWidth / 20));
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                color: this.getRandomColor()
            });
        }
    }

    getRandomColor() {
        const colors = [
            'rgba(129, 140, 248,',  // indigo
            'rgba(34, 211, 238,',   // cyan
            'rgba(167, 139, 250,',  // violet
            'rgba(52, 211, 153,',   // emerald
            'rgba(251, 113, 133,',  // rose
            'rgba(251, 191, 36,',   // amber
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, i) => {
            p.x += p.speedX;
            p.y += p.speedY;

            // Wrap around
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color + p.opacity + ')';
            this.ctx.fill();

            // Connect nearby particles
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = p.color + (0.08 * (1 - dist / 150)) + ')';
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }

            // Mouse interaction
            const mdx = p.x - this.mouse.x;
            const mdy = p.y - this.mouse.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < 200) {
                const force = (200 - mDist) / 200;
                p.x += (mdx / mDist) * force * 0.8;
                p.y += (mdy / mDist) * force * 0.8;
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ===== CUSTOM CURSOR SYSTEM =====
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const cursorTrailCanvas = document.getElementById('cursorTrailCanvas');
const cursorGlow = document.getElementById('cursorGlow');

let mouseX = 0, mouseY = 0;
let dotX = 0, dotY = 0;
let ringX = 0, ringY = 0;
let glowX = 0, glowY = 0;
let currentGlowX = 0, currentGlowY = 0;

// Trail system
const trailCtx = cursorTrailCanvas ? cursorTrailCanvas.getContext('2d') : null;
const trailPoints = [];
const maxTrailPoints = 35;
let trailHue = 0;

function resizeTrailCanvas() {
    if (cursorTrailCanvas) {
        cursorTrailCanvas.width = window.innerWidth;
        cursorTrailCanvas.height = window.innerHeight;
    }
}
resizeTrailCanvas();
window.addEventListener('resize', resizeTrailCanvas);

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glowX = e.clientX;
    glowY = e.clientY;

    // Store trail points
    trailPoints.push({
        x: e.clientX,
        y: e.clientY,
        life: 1.0,
        hue: trailHue
    });
    if (trailPoints.length > maxTrailPoints) {
        trailPoints.shift();
    }
    trailHue = (trailHue + 1.5) % 360;
});

// Smooth cursor animation loop
function animateCursor() {
    // Dot follows mouse very closely
    dotX += (mouseX - dotX) * 0.25;
    dotY += (mouseY - dotY) * 0.25;

    // Ring follows with more lag for a floaty feel
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;

    // Background glow follows very slowly
    currentGlowX += (glowX - currentGlowX) * 0.08;
    currentGlowY += (glowY - currentGlowY) * 0.08;

    if (cursorDot) {
        cursorDot.style.left = dotX + 'px';
        cursorDot.style.top = dotY + 'px';
    }
    if (cursorRing) {
        cursorRing.style.left = (ringX + 10) + 'px';
        cursorRing.style.top = (ringY + 10) + 'px';
    }
    if (cursorGlow) {
        cursorGlow.style.left = currentGlowX + 'px';
        cursorGlow.style.top = currentGlowY + 'px';
    }

    // Draw aurora trail
    if (trailCtx) {
        trailCtx.clearRect(0, 0, cursorTrailCanvas.width, cursorTrailCanvas.height);

        if (trailPoints.length > 2) {
            // Decay life
            for (let i = trailPoints.length - 1; i >= 0; i--) {
                trailPoints[i].life -= 0.025;
                if (trailPoints[i].life <= 0) {
                    trailPoints.splice(i, 1);
                }
            }

            // Draw the trail as a gradient line
            if (trailPoints.length > 2) {
                for (let i = 1; i < trailPoints.length; i++) {
                    const p1 = trailPoints[i - 1];
                    const p2 = trailPoints[i];
                    const progress = i / trailPoints.length;

                    trailCtx.beginPath();
                    trailCtx.moveTo(p1.x, p1.y);
                    trailCtx.lineTo(p2.x, p2.y);

                    const alpha = p2.life * progress * 0.6;
                    const width = progress * 3;
                    trailCtx.strokeStyle = `hsla(${p2.hue}, 80%, 65%, ${alpha})`;
                    trailCtx.lineWidth = width;
                    trailCtx.lineCap = 'round';
                    trailCtx.stroke();
                }

                // Draw a glowing tip at the latest point
                const lastPt = trailPoints[trailPoints.length - 1];
                if (lastPt) {
                    const grd = trailCtx.createRadialGradient(lastPt.x, lastPt.y, 0, lastPt.x, lastPt.y, 15);
                    grd.addColorStop(0, `hsla(${lastPt.hue}, 90%, 70%, 0.4)`);
                    grd.addColorStop(1, `hsla(${lastPt.hue}, 90%, 70%, 0)`);
                    trailCtx.fillStyle = grd;
                    trailCtx.beginPath();
                    trailCtx.arc(lastPt.x, lastPt.y, 15, 0, Math.PI * 2);
                    trailCtx.fill();
                }
            }
        }
    }

    requestAnimationFrame(animateCursor);
}
animateCursor();

// ===== CURSOR HOVER DETECTION =====
const interactiveSelectors = 'a, button, input, textarea, select, .btn, .nav-link, .social-link, .project-card, .cert-card, .leadership-card, .blog-card, .blog-read-more, .nav-toggle, .back-to-top, .tool-tag, .pro-skill-card, .about-card, .contact-info-card, .floating-card, [onclick]';

document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelectors)) {
        cursorDot?.classList.add('hovering');
        cursorRing?.classList.add('hovering');
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelectors)) {
        cursorDot?.classList.remove('hovering');
        cursorRing?.classList.remove('hovering');
    }
});

// ===== CLICK BURST ANIMATION =====
const burstColors = [
    '#818cf8', '#22d3ee', '#f472b6', '#34d399', '#fbbf24',
    '#a78bfa', '#fb923c', '#60a5fa', '#fb7185', '#38bdf8'
];

function createClickBurst(x, y) {
    const container = document.createElement('div');
    container.className = 'click-burst';
    container.style.left = '0px';
    container.style.top = '0px';

    // Pick a random color palette for this burst
    const color1 = burstColors[Math.floor(Math.random() * burstColors.length)];
    const color2 = burstColors[Math.floor(Math.random() * burstColors.length)];

    // Create particles
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'click-burst-particle';
        const angle = (Math.PI * 2 / particleCount) * i + (Math.random() - 0.5) * 0.5;
        const distance = 40 + Math.random() * 50;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const size = 3 + Math.random() * 4;
        const color = burstColors[Math.floor(Math.random() * burstColors.length)];

        particle.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            box-shadow: 0 0 6px ${color}, 0 0 12px ${color}40;
            --tx: ${tx}px;
            --ty: ${ty}px;
            animation-duration: ${0.5 + Math.random() * 0.3}s;
        `;
        container.appendChild(particle);
    }

    // Create expanding ring
    const ring = document.createElement('div');
    ring.className = 'click-burst-ring';
    ring.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        border-color: ${color1};
        box-shadow: 0 0 10px ${color1}60;
    `;
    container.appendChild(ring);

    // Create second ring (delayed, larger)
    const ring2 = document.createElement('div');
    ring2.className = 'click-burst-ring-2';
    ring2.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        border-color: ${color2};
        box-shadow: 0 0 8px ${color2}40;
    `;
    container.appendChild(ring2);

    // Create sparkles
    const sparkleCount = 8;
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'click-burst-sparkle';
        const angle = (Math.PI * 2 / sparkleCount) * i;
        const dist = 20 + Math.random() * 35;
        const sx = Math.cos(angle) * dist;
        const sy = Math.sin(angle) * dist;
        const sColor = burstColors[Math.floor(Math.random() * burstColors.length)];

        sparkle.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            background: ${sColor};
            box-shadow: 0 0 4px ${sColor};
            --sx: ${sx}px;
            --sy: ${sy}px;
            animation-delay: ${Math.random() * 0.15}s;
        `;
        container.appendChild(sparkle);
    }

    document.body.appendChild(container);

    // Cursor click state
    cursorDot?.classList.add('clicking');
    cursorRing?.classList.add('clicking');
    setTimeout(() => {
        cursorDot?.classList.remove('clicking');
        cursorRing?.classList.remove('clicking');
    }, 200);

    // Clean up
    setTimeout(() => container.remove(), 1000);
}

// Attach click burst to entire document
document.addEventListener('click', (e) => {
    createClickBurst(e.clientX, e.clientY);
});

// ===== TEXT SCRAMBLE EFFECT =====
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 20);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="scramble-char">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const allNavLinks = document.querySelectorAll('.nav-link');

// Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Active nav link
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    allNavLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Mobile Toggle
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close menu on link click
allNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Stagger animation
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 100);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el);
});

// ===== SKILL BAR ANIMATION =====
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const fills = entry.target.querySelectorAll('.skill-bar-fill');
            fills.forEach((fill, idx) => {
                const width = fill.getAttribute('data-width');
                setTimeout(() => {
                    fill.style.width = width + '%';
                    fill.classList.add('animated');
                }, idx * 150);
            });
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-bars').forEach((el) => {
    skillObserver.observe(el);
});

// ===== COUNTER ANIMATION =====
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.stat-number');
            counters.forEach((counter) => {
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;

                const updateCounter = () => {
                    current += step;
                    if (current >= target) {
                        counter.textContent = target;
                    } else {
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    }
                };
                updateCounter();
            });
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.hero-stats').forEach((el) => {
    counterObserver.observe(el);
});

// ===== BACK TO TOP =====
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitBtn.classList.add('loading');

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    fetch("https://formsubmit.co/ajax/asp2022141@as.rjt.ac.lk", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email,
            subject: subject,
            message: message
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        submitBtn.classList.remove('loading');
        showNotification('Message sent successfully! Please check your inbox for an activation email from FormSubmit on your first submission. 🎉', 'success');
        contactForm.reset();
    })
    .catch(error => {
        submitBtn.classList.remove('loading');
        showNotification('Failed to send message. Please try again later. ❌', 'error');
        console.error('Error submitting form:', error);
    });
});

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        background: type === 'success'
            ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.9), rgba(16, 185, 129, 0.9))'
            : 'linear-gradient(135deg, rgba(251, 113, 133, 0.9), rgba(244, 63, 94, 0.9))',
        color: 'white',
        fontSize: '0.9rem',
        fontWeight: '600',
        zIndex: '10000',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        transform: 'translateX(120%)',
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontFamily: 'Inter, sans-serif',
        border: '1px solid rgba(255, 255, 255, 0.2)'
    });

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// ===== SMOOTH REVEAL FOR CARDS =====
function addHoverEffects() {
    // Project cards tilt effect
    document.querySelectorAll('.project-card, .cert-card, .leadership-card, .blog-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // Magnetic effect for buttons
    document.querySelectorAll('.btn-primary, .btn-outline').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

// ===== RIPPLE EFFECT ON BUTTONS =====
document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();

        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            width: 0;
            height: 0;
            left: ${e.clientX - rect.left}px;
            top: ${e.clientY - rect.top}px;
            transform: translate(-50%, -50%);
            animation: ripple-effect 0.6s ease-out forwards;
            pointer-events: none;
        `;

        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple keyframe
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple-effect {
        to {
            width: 300px;
            height: 300px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// ===== PARALLAX EFFECT ON HERO ORBS =====
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const orbs = document.querySelectorAll('.orb');

    orbs.forEach((orb, i) => {
        const speed = (i + 1) * 0.15;
        orb.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ===== SCROLL SHAPES BACKGROUND ANIMATION =====
class ScrollShapesSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.shapes = [];
        this.lastScrollY = 0;
        this.scrollVelocity = 0;
        this.hue = 0;
        this.frameCount = 0;

        this.colors = [
            { r: 129, g: 140, b: 248 },  // indigo
            { r: 34,  g: 211, b: 238 },  // cyan
            { r: 167, g: 139, b: 250 },  // violet
            { r: 52,  g: 211, b: 153 },  // emerald
            { r: 251, g: 113, b: 133 },  // rose
            { r: 251, g: 191, b: 36  },  // amber
            { r: 244, g: 114, b: 182 },  // pink
            { r: 96,  g: 165, b: 250 },  // blue
            { r: 56,  g: 189, b: 248 },  // sky
        ];

        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('scroll', () => this.onScroll());
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    onScroll() {
        const currentScroll = window.scrollY;
        this.scrollVelocity = Math.abs(currentScroll - this.lastScrollY);
        this.lastScrollY = currentScroll;

        // Spawn shapes based on scroll speed
        const shapesToSpawn = Math.min(Math.floor(this.scrollVelocity / 8), 4);
        for (let i = 0; i < shapesToSpawn; i++) {
            this.spawnShape();
        }
    }

    spawnShape() {
        if (this.shapes.length > 60) return; // performance cap

        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const shapeTypes = ['triangle', 'hexagon', 'diamond', 'circle', 'ring', 'cross', 'star'];

        this.shapes.push({
            x: Math.random() * this.canvas.width,
            y: this.canvas.height + 20,
            size: 6 + Math.random() * 18,
            speedY: -(1.2 + Math.random() * 2.5),
            speedX: (Math.random() - 0.5) * 1.2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.03,
            opacity: 0,
            maxOpacity: 0.15 + Math.random() * 0.25,
            fadeIn: true,
            life: 1.0,
            color: color,
            type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
            wobbleOffset: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.01 + Math.random() * 0.02,
            wobbleAmount: 0.3 + Math.random() * 0.8
        });
    }

    drawShape(ctx, shape) {
        const { x, y, size, rotation, type, color, opacity } = shape;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.globalAlpha = opacity;

        const r = color.r, g = color.g, b = color.b;

        switch (type) {
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(0, -size);
                ctx.lineTo(size * 0.866, size * 0.5);
                ctx.lineTo(-size * 0.866, size * 0.5);
                ctx.closePath();
                ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                break;

            case 'hexagon':
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i - Math.PI / 6;
                    const hx = Math.cos(angle) * size;
                    const hy = Math.sin(angle) * size;
                    if (i === 0) ctx.moveTo(hx, hy);
                    else ctx.lineTo(hx, hy);
                }
                ctx.closePath();
                ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
                ctx.lineWidth = 1.2;
                ctx.stroke();
                break;

            case 'diamond':
                ctx.beginPath();
                ctx.moveTo(0, -size);
                ctx.lineTo(size * 0.6, 0);
                ctx.lineTo(0, size);
                ctx.lineTo(-size * 0.6, 0);
                ctx.closePath();
                ctx.fillStyle = `rgba(${r},${g},${b},${opacity * 0.4})`;
                ctx.fill();
                ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
                break;

            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r},${g},${b},${opacity * 0.3})`;
                ctx.fill();
                break;

            case 'ring':
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                break;

            case 'cross':
                ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-size * 0.5, 0);
                ctx.lineTo(size * 0.5, 0);
                ctx.moveTo(0, -size * 0.5);
                ctx.lineTo(0, size * 0.5);
                ctx.stroke();
                break;

            case 'star':
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const outerAngle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                    const innerAngle = outerAngle + Math.PI / 5;
                    const ox = Math.cos(outerAngle) * size;
                    const oy = Math.sin(outerAngle) * size;
                    const ix = Math.cos(innerAngle) * size * 0.4;
                    const iy = Math.sin(innerAngle) * size * 0.4;
                    if (i === 0) ctx.moveTo(ox, oy);
                    else ctx.lineTo(ox, oy);
                    ctx.lineTo(ix, iy);
                }
                ctx.closePath();
                ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
                break;
        }

        ctx.restore();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.frameCount++;

        // Also spawn shapes slowly even without scrolling for ambient effect
        if (this.frameCount % 90 === 0 && this.shapes.length < 20) {
            this.spawnShape();
        }

        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const s = this.shapes[i];

            // Wobble horizontally
            s.wobbleOffset += s.wobbleSpeed;
            s.x += s.speedX + Math.sin(s.wobbleOffset) * s.wobbleAmount;
            s.y += s.speedY;
            s.rotation += s.rotationSpeed;

            // Fade in
            if (s.fadeIn) {
                s.opacity += 0.008;
                if (s.opacity >= s.maxOpacity) {
                    s.opacity = s.maxOpacity;
                    s.fadeIn = false;
                }
            }

            // Decay life as shape rises
            s.life -= 0.002;
            if (s.y < -50 || s.life <= 0) {
                s.opacity -= 0.01;
            }

            // Remove dead shapes
            if (s.opacity <= 0 || s.y < -100) {
                this.shapes.splice(i, 1);
                continue;
            }

            this.drawShape(this.ctx, s);
        }

        requestAnimationFrame(() => this.animate());
    }
}

// ===== TEXT SCRAMBLE ON HOVER (Nav Logo) =====
const navLogo = document.querySelector('.nav-logo');
if (navLogo) {
    const logoFirst = navLogo.querySelector('.logo-first');
    const logoLast = navLogo.querySelector('.logo-last');
    
    if (logoFirst && logoLast) {
        const fxFirst = new TextScramble(logoFirst);
        const fxLast = new TextScramble(logoLast);
        
        let isScrambling = false;
        
        navLogo.addEventListener('mouseenter', () => {
            if (isScrambling) return;
            isScrambling = true;
            Promise.all([
                fxFirst.setText('Thathsara'),
                fxLast.setText('Nilnayana')
            ]).then(() => {
                isScrambling = false;
            });
        });
    }
}

// ===== SMOOTH SECTION TRANSITIONS =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
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

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    // Init particles
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        new ParticleSystem(canvas);
    }

    // Init typewriter
    const typewriterEl = document.getElementById('typewriter');
    const cursorEl = document.querySelector('.typewriter-cursor');
    if (typewriterEl && cursorEl) {
        const fx = new TextScramble(typewriterEl);
        fx.setText('Applied Physical Sciences Undergraduate').then(() => {
            cursorEl.classList.add('stop-blinking');
        });
        
        typewriterEl.addEventListener('mouseenter', () => {
            cursorEl.classList.remove('stop-blinking');
            fx.setText('Applied Physical Sciences Undergraduate').then(() => {
                cursorEl.classList.add('stop-blinking');
            });
        });
    }

    // Init hover effects
    addHoverEffects();

    // Init blog modal
    initBlogModal();

    // Init scroll shapes
    const scrollShapesCanvas = document.getElementById('scrollShapesCanvas');
    if (scrollShapesCanvas) {
        new ScrollShapesSystem(scrollShapesCanvas);
    }

    // Preloader fade
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
});

// ===== DYNAMIC GRADIENT ON SECTION BACKGROUNDS =====
const gradientSections = document.querySelectorAll('.section');
window.addEventListener('scroll', () => {
    gradientSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible) {
            const progress = 1 - (rect.top / window.innerHeight);
            section.style.setProperty('--scroll-progress', progress);
        }
    });
});

// ===== BLOG MODAL SYSTEM =====
const blogDetails = {
    cs: {
        category: 'Computer Science',
        title: 'The Power of Computer Science: Building the Foundation for Modern Technology',
        date: 'June 19, 2026',
        readTime: '3 min read',
        content: [
            "Computer Science forms the core of my academic journey at Rajarata University of Sri Lanka. Through courses spanning from foundational concepts to advanced applications, I've developed comprehensive expertise in software development and system design.",
            "My studies include Principles of Programme Design and Computer Programming, which established strong coding fundamentals. I've deepened this knowledge through Object-Oriented Programming and Data Structures and Algorithms, essential for writing efficient and scalable software.",
            "I've gained practical experience in Web Design and Database Management Systems, enabling me to develop full-stack applications. My understanding of system architecture has been strengthened through Digital Logic Design, Systems Analysis and Design, and Software Engineering—all critical for designing robust systems.",
            "Additionally, I've studied Information Security to ensure secure application development, and completed a Research Project applying these concepts to real-world problems."
        ],
        skills: ['Object-Oriented Programming', 'Full-Stack Web Development', 'Database Design', 'System Architecture', 'Software Engineering', 'Cybersecurity', 'Problem-Solving'],
        tags: ['Programming', 'Software Development', 'Web Design', 'Database Management', 'System Design'],
        accentColor: '#818cf8'
    },
    math: {
        category: 'Mathematics',
        title: 'Mathematics: The Language of Problem-Solving and Computational Thinking',
        date: 'June 18, 2026',
        readTime: '3 min read',
        content: [
            "Mathematics is the backbone of analytical and computational thinking, and my coursework at Rajarata University reflects a comprehensive journey through applied and theoretical mathematics.",
            "I started with Introduction to MATLAB, bridging theory and practical computation. My foundation in pure mathematics came through Real Analysis I & II and Algebra I, providing rigorous understanding of mathematical structures and proofs.",
            "To solve real-world problems, I studied Differential Equations I & II, crucial for modeling physical systems and computational simulations. Linear Algebra equipped me with tools for data analysis and machine learning applications, while Numerical Analysis I taught me to solve complex mathematical problems computationally.",
            "I've applied these skills in Operations Research I & II, learning optimization techniques essential for business and engineering decisions. Graph Theory enhanced my understanding of network problems and algorithms, while Introduction to MATLAB enabled me to implement mathematical solutions computationally."
        ],
        skills: ['Mathematical Modeling', 'Linear Algebra', 'Computational Methods', 'Data Analysis', 'Optimization', 'Algorithm Design', 'Problem-Solving'],
        tags: ['Mathematics', 'Data Analysis', 'Optimization', 'Computational Methods', 'MATLAB', 'Algorithms'],
        accentColor: '#a78bfa'
    },
    stats: {
        category: 'Statistics',
        title: 'Statistics: Turning Data Into Insights for Data-Driven Decision Making',
        date: 'June 15, 2026',
        readTime: '3 min read',
        content: [
            "Statistics is the art and science of extracting meaningful insights from data, a critical skill in today's data-driven world. My statistical studies at Rajarata University have prepared me to analyze, interpret, and present data effectively.",
            "I began with Introduction to Statistics and Introduction to Probability, building foundational understanding of statistical concepts and probability theory. Probability Theory and Regression Analysis equipped me with tools to model relationships and predict outcomes from data.",
            "My practical skills were developed through Introduction to R/Python Statistical Language, enabling me to implement statistical analyses computationally. I've gained expertise in experimental design through Design and Analysis of Experiments, understanding how to collect and analyze data systematically.",
            "Advanced topics like Applied Nonparametric Statistics and Statistical Learning prepared me for modern data science challenges where traditional assumptions may not hold. These courses directly apply to machine learning and data prediction projects."
        ],
        skills: ['Data Analysis', 'Statistical Modeling', 'Probability Theory', 'Regression Analysis', 'Hypothesis Testing', 'Python/R Programming', 'Data Visualization', 'Machine Learning Fundamentals'],
        tags: ['Statistics', 'Data Science', 'Data Analysis', 'Python', 'Machine Learning', 'Probability', 'Experimental Design'],
        accentColor: '#22d3ee'
    }
};

function initBlogModal() {
    const modal = document.getElementById('blogModal');
    const closeBtn = document.getElementById('blogModalClose');
    const overlay = document.getElementById('blogModalOverlay');
    const readMoreBtns = document.querySelectorAll('.blog-read-more');

    if (!modal) return;

    const modalCategory = document.getElementById('blogModalCategory');
    const modalTitle = document.getElementById('blogModalTitle');
    const modalDate = document.getElementById('blogModalDate');
    const modalReadTime = document.getElementById('blogModalReadTime');
    const modalBody = document.getElementById('blogModalBody');
    const modalSkills = document.getElementById('blogModalSkills');
    const modalTags = document.getElementById('blogModalTags');
    const modalContent = modal.querySelector('.blog-modal-content');
    const modalMeta = modal.querySelector('.blog-modal-meta');
    const modalFooterSections = modal.querySelectorAll('.blog-modal-section');

    // Color palettes for modal particles
    const particleColors = [
        '#818cf8', '#22d3ee', '#f472b6', '#34d399', '#fbbf24',
        '#a78bfa', '#fb923c', '#60a5fa'
    ];

    function spawnModalParticles(accentColor) {
        const header = modal.querySelector('.blog-modal-header');
        if (!header) return;

        // Remove old particles
        header.querySelectorAll('.blog-modal-particle').forEach(p => p.remove());

        const count = 15;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'blog-modal-particle';
            const size = 3 + Math.random() * 5;
            const px = (Math.random() - 0.5) * 200;
            const py = -30 - Math.random() * 60;
            const color = Math.random() > 0.5 ? accentColor : particleColors[Math.floor(Math.random() * particleColors.length)];
            const delay = Math.random() * 0.5;
            const duration = 1.2 + Math.random() * 0.8;

            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                box-shadow: 0 0 ${size * 2}px ${color}80;
                left: ${30 + Math.random() * 60}%;
                bottom: ${10 + Math.random() * 30}%;
                --px: ${px}px;
                --py: ${py}px;
                animation: modal-particle-float ${duration}s ease-out ${delay}s forwards;
            `;
            header.appendChild(particle);
        }
    }

    function resetAnimationClasses() {
        // Reset all animated elements
        modalCategory.classList.remove('animate-in');
        modalTitle.classList.remove('animate-in');
        if (modalMeta) modalMeta.classList.remove('animate-in');

        modalBody.querySelectorAll('p').forEach(p => p.classList.remove('animate-in'));

        modalFooterSections.forEach(s => s.classList.remove('animate-in'));

        modalSkills.querySelectorAll('span').forEach(s => s.classList.remove('animate-in'));
        modalTags.querySelectorAll('span').forEach(s => s.classList.remove('animate-in'));
    }

    function animateModalContent(data) {
        let delay = 250; // Start after modal container finishes entrance
        const step = 100; // Delay between each element

        // 1. Category badge - slides from left
        setTimeout(() => modalCategory.classList.add('animate-in'), delay);
        delay += step;

        // 2. Title - scales up
        setTimeout(() => modalTitle.classList.add('animate-in'), delay);
        delay += step + 50;

        // 3. Meta info
        if (modalMeta) {
            setTimeout(() => modalMeta.classList.add('animate-in'), delay);
        }
        delay += step;

        // 4. Spawn header particles
        setTimeout(() => spawnModalParticles(data.accentColor || '#818cf8'), delay);

        // 5. Body paragraphs - cascade one by one
        const paragraphs = modalBody.querySelectorAll('p');
        paragraphs.forEach((p, i) => {
            setTimeout(() => p.classList.add('animate-in'), delay + (i * (step + 30)));
        });
        delay += paragraphs.length * (step + 30);

        // 6. Footer sections
        modalFooterSections.forEach((section, i) => {
            setTimeout(() => section.classList.add('animate-in'), delay + (i * step));
        });
        delay += modalFooterSections.length * step;

        // 7. Skill chips pop in one by one
        const skillSpans = modalSkills.querySelectorAll('span');
        skillSpans.forEach((span, i) => {
            setTimeout(() => span.classList.add('animate-in'), delay + (i * 60));
        });

        // 8. Tag chips pop in one by one (slight offset from skills)
        const tagSpans = modalTags.querySelectorAll('span');
        tagSpans.forEach((span, i) => {
            setTimeout(() => span.classList.add('animate-in'), delay + 100 + (i * 60));
        });
    }

    function openModal(blogId) {
        const data = blogDetails[blogId];
        if (!data) return;

        // Reset animations
        resetAnimationClasses();
        modal.classList.remove('closing');

        // Populate text content
        modalCategory.textContent = data.category;
        modalTitle.textContent = data.title;
        modalDate.textContent = data.date;
        modalReadTime.textContent = data.readTime;

        // Populate body paragraphs
        modalBody.innerHTML = data.content.map(p => `<p>${p}</p>`).join('');

        // Populate skills tags
        modalSkills.innerHTML = data.skills.map(s => `<span>${s}</span>`).join('');

        // Populate tag elements
        modalTags.innerHTML = data.tags.map(t => `<span>#${t}</span>`).join('');

        // Scroll modal content to top
        if (modalContent) modalContent.scrollTop = 0;

        // Show modal and disable body scroll
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Trigger staggered animations
        requestAnimationFrame(() => {
            animateModalContent(data);
        });
    }

    function closeModal() {
        // Add closing animation class
        modal.classList.add('closing');

        // Wait for closing animation to finish, then actually hide
        setTimeout(() => {
            modal.classList.remove('active');
            modal.classList.remove('closing');
            document.body.style.overflow = '';
            resetAnimationClasses();
        }, 450);
    }

    // Event listeners
    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const blogId = btn.getAttribute('data-blog-id');
            if (blogId) {
                openModal(blogId);
            }
        });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Close on ESC key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}
