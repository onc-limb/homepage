/* Shared shell: header, footer, theme toggle, particle background.
   Auto-mounts when included; pages just need <body data-page="...">.
*/
(function () {
  // ---------- Theme ----------
  const THEME_KEY = "onclimb-theme";
  function getTheme() {
    return localStorage.getItem(THEME_KEY) || "dark";
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(THEME_KEY, t);
    document.dispatchEvent(new CustomEvent("themechange", { detail: t }));
  }
  applyTheme(getTheme());

  // ---------- Fonts ----------
  if (!document.querySelector('link[data-shared-fonts]')) {
    const pre1 = document.createElement('link');
    pre1.rel = 'preconnect'; pre1.href = 'https://fonts.googleapis.com';
    pre1.setAttribute('data-shared-fonts', '1');
    const pre2 = document.createElement('link');
    pre2.rel = 'preconnect'; pre2.href = 'https://fonts.gstatic.com'; pre2.crossOrigin = 'anonymous';
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Noto+Sans+JP:wght@400;500;700&family=Space+Grotesk:wght@500;600;700&display=swap';
    document.head.appendChild(pre1);
    document.head.appendChild(pre2);
    document.head.appendChild(fonts);
  }

  // ---------- Nav definition ----------
  const BASE = document.body.dataset.base || '';
  const NAV = [
    { href: BASE + 'top.html',       label: 'Home',      key: 'top' },
    { href: BASE + 'profile.html',   label: 'Profile',   key: 'profile' },
    { href: BASE + 'skill.html',     label: 'Skills',    key: 'skill' },
    { href: BASE + 'portfolio.html', label: 'Portfolio', key: 'portfolio' },
    { href: BASE + 'news.html',      label: 'News',      key: 'news' },
    { href: BASE + 'book.html',      label: 'Books',     key: 'book' },
  ];

  // ---------- Header ----------
  function renderHeader() {
    const page = document.body.dataset.page || '';
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <div class="site-header__inner">
        <a href="${BASE}top.html" class="site-brand" aria-label="onclimb home">
          <span class="site-brand__mark" aria-hidden="true">
            <span class="site-brand__mark-inner"></span>
          </span>
          <span class="site-brand__name">onclimb</span>
          <span class="site-brand__slash">/</span>
          <span class="site-brand__page">${page || 'home'}</span>
        </a>
        <nav class="site-nav" aria-label="primary">
          ${NAV.map(n => `
            <a href="${n.href}" class="site-nav__link${n.key === page ? ' is-active' : ''}">
              <span>${n.label}</span>
            </a>
          `).join('')}
        </nav>
        <div class="site-header__actions">
          <button class="theme-toggle" type="button" aria-label="toggle theme">
            <svg class="theme-toggle__sun" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
            <svg class="theme-toggle__moon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
          </button>
          <button class="nav-toggle" type="button" aria-label="open menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <div class="site-mobilenav" aria-hidden="true">
        ${NAV.map(n => `<a href="${n.href}" class="${n.key === page ? 'is-active' : ''}">${n.label}</a>`).join('')}
      </div>
    `;
    document.body.prepend(header);

    header.querySelector('.theme-toggle').addEventListener('click', () => {
      applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });
    const navToggle = header.querySelector('.nav-toggle');
    const mobile = header.querySelector('.site-mobilenav');
    navToggle.addEventListener('click', () => {
      const open = header.classList.toggle('is-open');
      mobile.setAttribute('aria-hidden', String(!open));
    });
  }

  // ---------- Footer ----------
  function renderFooter() {
    const f = document.createElement('footer');
    f.className = 'site-footer';
    f.innerHTML = `
      <div class="container site-footer__inner">
        <div class="site-footer__col">
          <div class="site-footer__brand">onclimb</div>
          <p class="site-footer__tag">Fullstack engineer / architect — Tokyo</p>
        </div>
        <div class="site-footer__col">
          <div class="site-footer__heading">Sitemap</div>
          ${NAV.map(n => `<a href="${n.href}">${n.label}</a>`).join('')}
        </div>
        <div class="site-footer__col">
          <div class="site-footer__heading">Find me</div>
          <a href="#" target="_blank" rel="noopener">GitHub ↗</a>
          <a href="#" target="_blank" rel="noopener">Zenn ↗</a>
          <a href="#" target="_blank" rel="noopener">X / Twitter ↗</a>
        </div>
        <div class="site-footer__col site-footer__col--mono">
          <div class="site-footer__heading">// status</div>
          <div class="dim font-mono">build &nbsp;<span class="strong">v2.0.0-prototype</span></div>
          <div class="dim font-mono">node &nbsp;<span class="strong" id="footer-time"></span></div>
          <div class="dim font-mono">© 2026 onclimb</div>
        </div>
      </div>
    `;
    document.body.appendChild(f);
    function tick() {
      const d = new Date();
      const z = (n) => String(n).padStart(2, '0');
      const t = `${d.getUTCHours()}:${z(d.getUTCMinutes())}:${z(d.getUTCSeconds())} UTC`;
      const el = document.getElementById('footer-time');
      if (el) el.textContent = t;
    }
    tick(); setInterval(tick, 1000);
  }

  // ---------- Particle background ----------
  function mountParticles() {
    if (document.body.dataset.noBg === '1') return;
    const canvas = document.createElement('canvas');
    canvas.className = 'site-bg-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let mouse = { x: -9999, y: -9999, active: false };
    let theme = getTheme();

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.floor((w * h) / 14000);
      particles = Array.from({ length: target }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        z: Math.random() * 0.7 + 0.3,
      }));
    }
    window.addEventListener('resize', resize);
    document.addEventListener('themechange', (e) => { theme = e.detail; });
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
    });
    window.addEventListener('mouseleave', () => { mouse.active = false; });

    function frame() {
      const accent = theme === 'light' ? [47, 107, 224] : [123, 164, 245];
      const alphaBase = theme === 'light' ? 0.45 : 0.7;
      ctx.clearRect(0, 0, w, h);
      // Grid pulse near mouse
      if (mouse.active) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 280);
        grad.addColorStop(0, `rgba(${accent[0]},${accent[1]},${accent[2]},${theme === 'light' ? 0.10 : 0.18})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
      // Particles
      for (const p of particles) {
        // Mouse attraction
        if (mouse.active) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y;
          const d2 = dx*dx + dy*dy;
          if (d2 < 200*200) {
            const f = (1 - Math.sqrt(d2)/200) * 0.06;
            p.vx += (dx / Math.sqrt(d2 + 1)) * f;
            p.vy += (dy / Math.sqrt(d2 + 1)) * f;
          }
        }
        p.vx *= 0.96; p.vy *= 0.96;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.fillStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${alphaBase * p.z * 0.35})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.z * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      // Connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = dx*dx + dy*dy;
          if (d < 110*110) {
            const o = (1 - Math.sqrt(d)/110) * 0.18 * alphaBase;
            ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${o})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(frame);
    }
    resize();
    requestAnimationFrame(frame);
  }

  // ---------- Reveal-on-scroll ----------
  function setupReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length || !('IntersectionObserver' in window)) {
      els.forEach(e => e.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = `${(entry.target.dataset.revealDelay || 0)}ms`;
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  }

  // ---------- Boot ----------
  function boot() {
    mountParticles();
    renderHeader();
    renderFooter();
    setupReveal();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
