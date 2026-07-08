/* ============================================================
   Portfolio — script.js
   ============================================================ */

// ── Dark Mode Toggle ─────────────────────────────────────────
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon   = document.getElementById('theme-icon');

themeToggle.onclick = () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.classList.replace('bx-moon', 'bx-sun');
    } else {
        themeIcon.classList.replace('bx-sun', 'bx-moon');
    }
};

// ── Mobile Navbar ─────────────────────────────────────────────
const menuToggle = document.querySelector('.menu-toggle');
const menuIcon   = document.querySelector('#menu-icon');
const navbar     = document.querySelector('.navbar');

menuToggle.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

// ── Scroll Active Nav Links + Hero Exit + Section Animations ──────

const heroSection   = document.getElementById('hero');
const aboutSection  = document.getElementById('about');
const heroSlideEls  = document.querySelectorAll('.hero-content .slide-in');
const heroImg       = document.querySelector('.hero-img');
const sections      = document.querySelectorAll('section');
const navLinks      = document.querySelectorAll('header nav a');

let heroExited = false;

// ── Helper: restart a CSS animation by toggling the class ─────────
function triggerAnimation(el, cls) {
    el.classList.remove(cls);
    // Force reflow so browser resets the animation
    void el.offsetWidth;
    el.classList.add(cls);
}

// ── Hero entrance: fires on page load AND when scrolling back up ──
const heroObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Small delay so browser has painted before animation kicks in
                requestAnimationFrame(() => {
                    heroSlideEls.forEach(el => triggerAnimation(el, 'animate-in'));
                    if (heroImg) triggerAnimation(heroImg, 'animate-in');
                });
                heroSection.classList.remove('hero-exit');
                heroExited = false;
            }
        });
    },
    { threshold: 0.05 }  // fires almost immediately on page load
);
heroObserver.observe(heroSection);

// ── About section entrance animations ────────────────────────
const aboutObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        aboutSection.classList.add("show");
      }
    });
  },
  {
    threshold: 0.3,
  }
);

if (aboutSection) {
  aboutObserver.observe(aboutSection);
}

// ── 3D Tilt + Parallax on About Visual Card ───────────────────
const aboutCard = document.getElementById('about-visual-card');
const avcImg = document.getElementById('avc-img');

if (aboutCard) {
    const MAX_TILT = 15;     // max degrees rotation
    const MAX_MOVE = 15;     // max px translation
    
    aboutCard.addEventListener('mousemove', (e) => {
        const rect = aboutCard.getBoundingClientRect();
        // Normalise between -0.5 and 0.5
        const nx = (e.clientX - rect.left) / rect.width  - 0.5;
        const ny = (e.clientY - rect.top)  / rect.height - 0.5;

        const rotY = nx * MAX_TILT;
        const rotX = -ny * MAX_TILT;
        
        // Move the card slightly in the direction of the cursor for a tilt and move effect
        const moveX = nx * MAX_MOVE;
        const moveY = ny * MAX_MOVE;

        // Apply tilt and translation movement
        aboutCard.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translate3d(${moveX}px, ${moveY}px, 20px) scale3d(1.04, 1.04, 1.04)`;
        
        if (avcImg) {
            // Parallax shift for the image inside
            avcImg.style.transform = `translateZ(70px) translate(${-nx * 12}px, ${-ny * 12}px) scale(1.05)`;
        }
    });

    aboutCard.addEventListener('mouseleave', () => {
        // Reset transforms so CSS float animation continues smoothly
        aboutCard.style.transform = '';
        if (avcImg) {
            avcImg.style.transform = '';
        }
    });
}


// ── Scroll: active nav + hero exit ───────────────────────────

window.onscroll = () => {
    // Active nav links
    sections.forEach(sec => {
        const top    = window.scrollY;
        const offset = sec.offsetTop - 150;
        const height = sec.offsetHeight;
        const id     = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`header nav a[href*=${id}]`);
            if (activeLink) activeLink.classList.add('active');
        }
    });
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');

    // Hero exit: slides upward when About section scrolls into view
    if (heroSection && aboutSection) {
        const aboutTop = aboutSection.getBoundingClientRect().top;

        if (aboutTop < window.innerHeight * 0.65 && !heroExited) {
            heroExited = true;
            heroSection.classList.add('hero-exit');
        }
        if (aboutTop > window.innerHeight * 0.85 && heroExited) {
            heroExited = false;
            heroSection.classList.remove('hero-exit');
            heroSection.style.opacity   = '1';
            heroSection.style.transform = 'none';
        }
    }
};

// ── Typewriter Effect ─────────────────────────────────────────
const initTypewriter = () => {
    const text = 'Building smart & beautiful web experiences';
    const el   = document.getElementById('typewriter');
    if (!el) return;

    setTimeout(() => {
        let i = 0;
        const type = () => {
            if (i < text.length) {
                el.textContent += text.charAt(i++);
                setTimeout(type, 50);
            }
        };
        type();
    }, 1500);
};

// ── 3D Animated Lines Background ─────────────────────────────
/*
   Nodes drift through 3D space (x, y, z).
   Each node is projected onto 2D with perspective.
   Lines are drawn between nodes that are close enough in 3D.
   Every line carries its own independent opacity oscillator so
   it appears/disappears smoothly and continuously.
*/
const init3DLines = () => {
    const canvas = document.getElementById('hero-lines-canvas');
    if (!canvas) return;

    const ctx  = canvas.getContext('2d');
    const hero = document.getElementById('hero');

    // ── Resize handler ──────────────────────────────────────
    let W, H;
    const resize = () => {
        const rect = hero.getBoundingClientRect();
        W = canvas.width  = rect.width;
        H = canvas.height = rect.height;
    };
    resize();
    window.addEventListener('resize', () => { resize(); redistributeNodes(); });

    // ── Read current theme palette colours ───────────────────
    const getColors = () => {
        const s   = getComputedStyle(document.body);
        const c1  = s.getPropertyValue('--line-color-1').trim() || '255,182,193';
        const c2  = s.getPropertyValue('--line-color-2').trim() || '177,156,217';
        const c3  = s.getPropertyValue('--line-color-3').trim() || '173,216,230';
        return [c1, c2, c3];
    };

    // ── Node constructor ─────────────────────────────────────
    const DEPTH      = 800;   // Z range: 0 … DEPTH
    const FOV        = 500;   // perspective focal length
    const MAX_DIST_3D = 200;  // max 3D distance to draw a line
    const NODE_COUNT = 55;

    class Node3D {
        constructor(randomY = true) {
            this.reset(randomY);
        }
        reset(randomY = true) {
            this.x  = (Math.random() - 0.5) * W * 1.4;
            this.y  = randomY
                ? (Math.random() - 0.5) * H * 1.4
                : (Math.random() > 0.5 ? 1 : -1) * H * 0.7;
            this.z  = Math.random() * DEPTH;

            // Slow drift velocities
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.25;
            this.vz = (Math.random() - 0.5) * 0.6;

            // Own opacity oscillator — each node phase is independent
            this.opPhase = Math.random() * Math.PI * 2;
            this.opSpeed = 0.004 + Math.random() * 0.008;
            this.opMin   = 0.04;
            this.opMax   = 0.55 + Math.random() * 0.35;

            // Colour index (0,1,2)
            this.colorIdx = Math.floor(Math.random() * 3);
        }

        // Project 3D → 2D with perspective
        project() {
            const scale = FOV / (FOV + this.z);
            return {
                sx:    this.x * scale + W / 2,
                sy:    this.y * scale + H / 2,
                scale: scale
            };
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.z += this.vz;
            this.opPhase += this.opSpeed;

            // Wrap Z
            if (this.z > DEPTH) this.z = 0;
            if (this.z < 0)     this.z = DEPTH;

            // Wrap X / Y with margin
            const mx = W * 0.75;
            const my = H * 0.75;
            if (this.x >  mx) this.x = -mx;
            if (this.x < -mx) this.x =  mx;
            if (this.y >  my) this.y = -my;
            if (this.y < -my) this.y =  my;
        }

        // Current opacity [0…1] driven by sine oscillator
        get opacity() {
            const t = (Math.sin(this.opPhase) + 1) / 2; // 0…1
            return this.opMin + t * (this.opMax - this.opMin);
        }
    }

    // ── Spawn nodes ──────────────────────────────────────────
    let nodes = [];
    const redistributeNodes = () => {
        nodes = Array.from({ length: NODE_COUNT }, () => new Node3D(true));
    };
    redistributeNodes();

    // ── Mouse subtle parallax ────────────────────────────────
    let mouseX = 0, mouseY = 0;
    hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        mouseX = (e.clientX - r.left - W / 2) / W;   // -0.5 … 0.5
        mouseY = (e.clientY - r.top  - H / 2) / H;
    });

    // ── Main render loop ─────────────────────────────────────
    const render = () => {
        requestAnimationFrame(render);
        ctx.clearRect(0, 0, W, H);

        const colors = getColors();

        // Subtle parallax offset for the whole scene
        const pxOff = mouseX * 18;
        const pyOff = mouseY * 12;

        // Update all nodes
        for (const n of nodes) n.update();

        // Draw edges between close-enough nodes
        for (let i = 0; i < nodes.length; i++) {
            const a  = nodes[i];
            const pa = a.project();

            for (let j = i + 1; j < nodes.length; j++) {
                const b = nodes[j];

                // 3D distance
                const dx  = a.x - b.x;
                const dy  = a.y - b.y;
                const dz  = a.z - b.z;
                const d3d = Math.sqrt(dx*dx + dy*dy + dz*dz);

                if (d3d > MAX_DIST_3D) continue;

                const pb = b.project();

                // Blend opacity of both endpoints + distance falloff
                const distFactor = 1 - d3d / MAX_DIST_3D;
                const alpha = a.opacity * b.opacity * distFactor * 0.85;

                if (alpha < 0.005) continue;

                // Pick a colour — use the average of both node colours
                const cIdx = (a.colorIdx + b.colorIdx) >> 1;
                const rgb  = colors[cIdx % colors.length];

                // Line width proportional to average depth scale
                const avgScale = (pa.scale + pb.scale) * 0.5;
                const lw = avgScale * 1.6;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(pa.sx + pxOff, pa.sy + pyOff);
                ctx.lineTo(pb.sx + pxOff, pb.sy + pyOff);
                ctx.strokeStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
                ctx.lineWidth   = lw;
                ctx.lineCap     = 'round';
                ctx.stroke();
                ctx.restore();
            }

            // Draw node dot
            const dotAlpha = a.opacity * 0.8;
            const dotR     = pa.scale * 2.2;
            const rgb      = colors[a.colorIdx % colors.length];

            ctx.save();
            ctx.beginPath();
            ctx.arc(pa.sx + pxOff, pa.sy + pyOff, dotR, 0, Math.PI * 2);

            // Radial gradient for a glowing dot
            const grad = ctx.createRadialGradient(
                pa.sx + pxOff, pa.sy + pyOff, 0,
                pa.sx + pxOff, pa.sy + pyOff, dotR * 2.5
            );
            grad.addColorStop(0,   `rgba(${rgb},${dotAlpha})`);
            grad.addColorStop(0.5, `rgba(${rgb},${(dotAlpha * 0.4).toFixed(3)})`);
            grad.addColorStop(1,   `rgba(${rgb},0)`);
            ctx.fillStyle = grad;
            ctx.arc(pa.sx + pxOff, pa.sy + pyOff, dotR * 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    };

    render();
};

/* ── Bootstrap ─────────────────────────────────────────────────
   initSkillFlow must run AFTER DOM is ready so elements exist.
   ──────────────────────────────────────────────────────────── */

// ── Skill Flow Section Animation ─────────────────────────────
const initSkillFlow = () => {
    const section  = document.getElementById('skills');
    if (!section) return;

    // ── 1. Build heading spans (letter-by-letter) ─────────────
    const headingEl  = document.getElementById('sf-heading');
    const headingText = 'My Tech Stack ✨';

    // Words that should get the gradient "colored" class
    const coloredWords = new Set(['Tech', 'Stack']);

    if (headingEl) {
        headingEl.innerHTML = '';
        const words = headingText.split(' ');
        words.forEach((word, wi) => {
            // Each character in this word
            [...word].forEach(ch => {
                const span = document.createElement('span');
                span.className = 'sf-letter' + (coloredWords.has(word) ? ' colored' : '');
                span.textContent = ch;
                headingEl.appendChild(span);
            });
            // Space between words (except after last)
            if (wi < words.length - 1) {
                const sp = document.createElement('span');
                sp.className = 'sf-space';
                sp.textContent = ' ';
                headingEl.appendChild(sp);
            }
        });
    }

    // ── 2. Build bottom tagline word spans ────────────────────
    const taglineEl   = document.getElementById('sf-tagline');
    const taglineText = 'Building UI. Writing logic. Managing data. Solving problems. Deploying projects.';
    // Accent words (the verbs)
    const accentWords = new Set(['Building', 'Writing', 'Managing', 'Solving', 'Deploying']);

    if (taglineEl) {
        taglineEl.innerHTML = '';
        taglineText.split(' ').forEach(word => {
            const span = document.createElement('span');
            const baseWord = word.replace(/\.$/, '');
            span.className = 'sf-word' + (accentWords.has(baseWord) ? ' sf-word-accent' : '');
            span.textContent = word;
            taglineEl.appendChild(span);
            // Space span
            const sp = document.createElement('span');
            sp.className = 'sf-word';
            sp.textContent = ' ';
            taglineEl.appendChild(sp);
        });
    }

    // ── 3. Guard — only animate once ─────────────────────────
    let sfAnimated = false;

    // ── 4. Main sequence ─────────────────────────────────────
    const runSkillFlowSequence = () => {
        if (sfAnimated) return;
        sfAnimated = true;

        // Step 0 — Show section blobs (soft background)
        const blobs = section.querySelectorAll('.sf-blob');
        blobs.forEach(b => b.classList.add('sf-blob-visible'));

        // Step 1 — Letter-by-letter heading reveal
        const letters = section.querySelectorAll('.sf-letter');
        const LETTER_DELAY = 55; // ms between letters
        letters.forEach((letter, i) => {
            setTimeout(() => letter.classList.add('visible'), i * LETTER_DELAY);
        });

        const headingDuration = letters.length * LETTER_DELAY + 300;

        // Step 2 — Fade in subtitle after heading completes
        setTimeout(() => {
            const sub = document.getElementById('sf-subtitle');
            if (sub) sub.classList.add('sf-visible');
        }, headingDuration);

        // Step 3 — Pop skill cards from centre, staggered
        const cardsStart = headingDuration + 400;
        const cards = section.querySelectorAll('.sf-card');
        const CARD_STAGGER = 80;
        cards.forEach((card, i) => {
            setTimeout(() => {
                card.classList.add('sf-card-visible');
                // Start float animation after reveal transition completes (~450ms)
                setTimeout(() => card.classList.add('sf-card-float'), 450);
            }, cardsStart + i * CARD_STAGGER);
        });

        // Step 4 — Word-by-word tagline after all cards
        const taglineStart = cardsStart + cards.length * CARD_STAGGER + 400;
        const words = section.querySelectorAll('.sf-word');
        const WORD_STAGGER = 130;
        words.forEach((word, i) => {
            setTimeout(() => word.classList.add('visible'), taglineStart + i * WORD_STAGGER);
        });
    };

    // ── 6. IntersectionObserver ──────────────────────────────
    const sfObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runSkillFlowSequence();
                    sfObserver.disconnect(); // run once
                }
            });
        },
        { threshold: 0.15 }
    );
    sfObserver.observe(section);
};

// ── Bootstrap ─────────────────────────────────────────────────
const boot = () => {
    initTypewriter();
    init3DLines();
    initSkillFlow();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
