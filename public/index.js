document.addEventListener('DOMContentLoaded', () => {
    const ambientbg = document.getElementById('ambient-bg');
    const glowoverlay = document.getElementById('glow-overlay');
    const embercontainer = document.getElementById('ember-container');
    const form = document.getElementById('sj-form');
    const addressinput = document.getElementById('sj-address');
    const iframe = document.getElementById('sj-frame');
    const landing = document.getElementById('landing-screen');
    const backbtn = document.getElementById('back-btn');
    const homebtn = document.getElementById('home-btn');
    const centerdock = document.getElementById('center-search-dock');
    const navdock = document.getElementById('nav-search-dock');

    let mousex = -1000;
    let mousey = -1000;
    const ashparticles = [];
    const maxparticles = 9;

    // live custom backend cluster pointing to your operational railway bare server
    const fallbacks = [
        "https://railway.app"
    ];

    window.addEventListener('mousemove', (e) => {
        mousex = e.clientX;
        mousey = e.clientY;
        glowoverlay.style.setProperty('--mouse-x', `${mousex}px`);
        glowoverlay.style.setProperty('--mouse-y', `${mousey}px`);
    });

    class ashparticle {
        constructor() {
            this.el = document.createElement('div');
            this.el.classList.add('ember');
            
            this.baseSize = Math.random() * 15 + 10;
            this.size = this.baseSize;
            this.x = Math.random() * window.innerWidth;
            this.startHeight = window.innerHeight + Math.random() * 50;
            this.y = this.startHeight;
            
            this.speedy = -(Math.random() * 0.35 + 0.2); 
            this.angle = Math.random() * 360;
            this.rotationspeed = (Math.random() * 2 - 1) * 0.12; 
            this.wobblefactor = Math.random() * 0.01;
            this.opacity = 1;

            this.el.style.width = `${this.size}px`;
            this.el.style.height = `${this.size}px`;
            embercontainer.appendChild(this.el);
        }

        update() {
            this.y += this.speedy;
            this.x += Math.sin(this.y * this.wobblefactor) * 0.2;
            this.angle += this.rotationspeed;

            const heightTraveled = this.startHeight - this.y;
            const lifeProgress = Math.min(heightTraveled / this.startHeight, 1);

            this.size = this.baseSize * (1 - lifeProgress);
            this.opacity = 1 - lifeProgress;

            const dx = this.x + (this.size / 2) - mousex;
            const dy = this.y + (this.size / 2) - mousey;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const pushradius = 160;

            if (distance < pushradius) {
                const force = (pushradius - distance) / pushradius;
                const pushx = (dx / distance) * force * 5;
                const pushy = (dy / distance) * force * 5;
                
                this.x += pushx;
                this.y += pushy;
                this.angle += pushx * 0.8;
            }

            if (this.y < -50 || this.size <= 1 || this.x < -100 || this.x > window.innerWidth + 100) {
                this.x = Math.random() * window.innerWidth;
                this.startHeight = window.innerHeight + 20;
                this.y = this.startHeight;
                this.baseSize = Math.random() * 15 + 10;
                this.size = this.baseSize;
                this.opacity = 1;
            }

            this.el.style.opacity = this.opacity;
            this.el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${this.angle}deg) scale(${this.size / this.baseSize})`;
        }
    }

    for (let i = 0; i < maxparticles; i++) {
        ashparticles.push(new ashparticle());
    }

    function animationtick() {
        if (ambientbg.style.opacity !== '0') {
            for (let i = 0; i < ashparticles.length; i++) {
                ashparticles[i].update();
            }
            requestAnimationFrame(animationtick);
        }
    }
    requestAnimationFrame(animationtick);

    // fallback query processor
    async function getworkingfallback(targeturl) {
        if (typeof __scramjet__ !== 'undefined') {
            return __scramjet__.encodeUrl(targeturl);
        }

        for (const base of fallbacks) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 1500);
                
                // test query link online check
                const res = await fetch(base, { method: 'HEAD', signal: controller.signal });
                clearTimeout(timeout);
                
                if (res.ok || res.status === 400 || res.status === 404) {
                    return base + encodeURIComponent(targeturl);
                }
            } catch (err) {
                console.warn(`routing cluster down: ${base}`);
            }
        }
        
        return "https://herokuapp.com" + encodeURIComponent(targeturl);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let inputval = addressinput.value.trim();
        if (!inputval) return;

        let targeturl = inputval;
        if (!/^https?:\/\//i.test(inputval)) {
            if (inputval.includes('.') && !inputval.includes(' ')) {
                targeturl = 'https://' + inputval;
            } else {
                targeturl = 'https://google.com' + encodeURIComponent(inputval);
            }
        }

        try {
            const proxiedurl = await getworkingfallback(targeturl);
            
            ambientbg.style.opacity = '0';
            setTimeout(() => { ambientbg.style.display = 'none'; }, 500);

            navdock.appendChild(form);
            landing.classList.add('hidden');
            iframe.classList.remove('hidden');
            iframe.src = proxiedurl;
        } catch (err) {
            const errEl = document.getElementById('sj-error');
            const errCodeEl = document.getElementById('sj-error-code');
            if(errEl) errEl.innerText = "routing failure";
            if(errCodeEl) errCodeEl.innerText = err.stack || err;
        }
    });

    backbtn.addEventListener('click', () => {
        try {
            if (iframe.contentWindow && iframe.contentWindow.history.length > 1) {
                iframe.contentWindow.history.back();
            }
        } catch (err) {
            console.warn("cross-origin boundaries blocked frame history access.");
        }
    });

    homebtn.addEventListener('click', () => {
        iframe.src = 'about:blank';
        iframe.classList.add('hidden');
        landing.classList.remove('hidden');
        addressinput.value = '';
        
        centerdock.appendChild(form);
        ambientbg.style.display = 'block';
        setTimeout(() => { ambientbg.style.opacity = '1'; }, 10);
        requestAnimationFrame(animationtick);
    });
});
