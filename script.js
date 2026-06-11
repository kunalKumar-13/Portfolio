/* Kunal Kumar — "Continuity Ribbon" portfolio
   Ported from the Claude Design prototype (Kunal Kumar.dc.html).
   Stack: GSAP + ScrollTrigger + Lenis (CDN), vanilla JS. */

(function () {
  'use strict';

  class Site {
    constructor(root) {
      this.rootEl = root;
      this.dead = false;
      this.vel = 0;
      this.rafs = [];
      this.heroPack = 'worth-remembering'; // one-line swap: see getPacks()
      this.RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches;
      this.buildChips();
      this.applyPack();
      this.setGreeting();
      this.startClock();
      this.waitFor(() => window.gsap && window.ScrollTrigger && window.Lenis, () => this.init(), 60);
    }

    waitFor(cond, cb, tries) {
      if (cond()) { cb(); return; }
      if (tries <= 0) { this.fallback(); return; }
      setTimeout(() => this.waitFor(cond, cb, tries - 1), 90);
    }
    q(sel) { return Array.from(this.rootEl.querySelectorAll(sel)); }
    one(sel) { return this.rootEl.querySelector(sel); }

    fallback() { const p = this.one('[data-preloader]'); if (p) p.style.display = 'none'; }

    buildChips() {
      const data = {
        '#2438FF': ['Python', 'TypeScript', 'C++', 'SQL'],
        '#7A2BF5': ['Reinforcement Learning', 'GRPO', 'Semantic Search', 'Prompt Defense', 'Memory Systems'],
        '#0CAF9B': ['LlamaIndex', 'TRL', 'FastAPI', 'Qt', 'React'],
        '#FFAA00': ['Docker', 'Linux daemons', 'BM25', 'Vector DBs']
      };
      this.q('[data-chips]').forEach(box => {
        const c = box.getAttribute('data-chips');
        (data[c] || []).forEach(t => {
          const el = document.createElement('span');
          el.textContent = t;
          el.style.cssText = "font-family:'JetBrains Mono',monospace;font-size:12px;padding:9px 13px;border-radius:999px;border:1px solid rgba(251,250,247,.16);color:#FBFAF7;cursor:default;transition:transform .35s cubic-bezier(.76,0,.24,1),background .35s ease,border-color .35s ease,color .35s ease;";
          if (!this.TOUCH) {
            el.addEventListener('mouseenter', () => { el.style.transform = 'translateY(-4px)'; el.style.background = c; el.style.borderColor = c; el.style.color = c === '#FFAA00' ? '#0D0D12' : '#FBFAF7'; });
            el.addEventListener('mouseleave', () => { el.style.transform = 'translateY(0)'; el.style.background = 'transparent'; el.style.borderColor = 'rgba(251,250,247,.16)'; el.style.color = '#FBFAF7'; });
          }
          box.appendChild(el);
        });
      });
    }

    startClock() {
      const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const tick = () => {
        const t = fmt.format(new Date());
        const n = this.one('[data-nav-clock]'); const f = this.one('[data-foot-clock]');
        if (n) n.textContent = 'BLR — ' + t;
        if (f) f.textContent = 'Bengaluru — ' + t + ' IST';
      };
      tick(); this._clk = setInterval(tick, 1000);
    }

    init() {
      const gsap = window.gsap, ST = window.ScrollTrigger;
      gsap.registerPlugin(ST);
      this.gsap = gsap; this.ST = ST;

      // Lenis smooth scroll
      if (!this.RM) {
        const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
        this.lenis = lenis;
        lenis.on('scroll', (e) => { this.vel = e.velocity || 0; ST.update(); });
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      }
      // anchor smooth scroll
      this.q('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const t = this.one(id) || document.querySelector(id);
        if (t) {
          e.preventDefault();
          if (this.lenis) this.lenis.scrollTo(t, { offset: -90 });
          else t.scrollIntoView({ behavior: 'smooth' });
        }
      }));

      this.setupSlot();
      this.setupProgress();
      this.setupFooterReveal();
      this.setupNav();
      if (this.RM) { this.staticReveal(); this.fallback(); }
      else { this.preloader(); }
      this.setupHeroParallax();
      this.setupRibbons();
      this.setupManifesto();
      this.setupStats();
      this.setupCards();
      this.setupHueDrift();
      if (!this.TOUCH) { this.setupCursor(); this.setupMagnetics(); this.setupTilt(); this.setupExpHover(); this.setupCardFX(); }
      else { this.setupExpHover(); }
      this.setupScramble();
      this.setupCopyEmail();
      ST.refresh();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ST.refresh());
    }

    staticReveal() { const g = this.gsap; this.q('[data-hero-el],[data-hero-content]').forEach(e => g.set(e, { opacity: 1, y: 0 })); }

    // 1. Preloader
    preloader() {
      const g = this.gsap;
      const panel = this.one('[data-preloader]'); const track = this.one('[data-pre-track]'); const count = this.one('[data-pre-count]');
      if (!panel) { return; }
      if (this.lenis) this.lenis.stop();
      const lineH = track.children[0].getBoundingClientRect().height;
      const tl = g.timeline({ onComplete: () => { if (this.lenis) this.lenis.start(); this.heroEntrance(); } });
      const counter = { v: 0 };
      tl.to(counter, { v: 100, duration: 2.2, ease: 'none', onUpdate: () => { count.textContent = String(Math.round(counter.v)).padStart(3, '0'); } }, 0);
      for (let i = 1; i < track.children.length; i++) {
        tl.to(track, { y: -lineH * i, duration: .5, ease: 'cubic-bezier(.76,0,.24,1)' }, .1 + i * 0.42);
      }
      tl.to(panel, { yPercent: -100, duration: .9, ease: 'expo.inOut' }, '+=0.35');
      tl.set(panel, { display: 'none' });
    }

    // 2. Hero entrance
    heroEntrance() {
      const g = this.gsap;
      // split chars
      this.q('[data-hero-h1] [data-split]').forEach(el => {
        const text = el.textContent; el.textContent = '';
        [...text].forEach(ch => {
          const wrap = document.createElement('span'); wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;';
          const inner = document.createElement('span'); inner.style.cssText = 'display:inline-block;will-change:transform;'; inner.textContent = ch === ' ' ? ' ' : ch;
          wrap.appendChild(inner); el.appendChild(wrap);
        });
      });
      const chars = this.q('[data-hero-h1] [data-split] span span');
      g.set(chars, { yPercent: 115, rotate: 6 });
      const slot = this.one('[data-slot]'); g.set(slot, { opacity: 0, y: 20 });
      const els = this.q('[data-hero-el]'); g.set(els, { opacity: 0, y: 24 });
      const giant = this.one('[data-giant-name]'); g.set(giant, { opacity: 0, yPercent: 18 });

      const tl = g.timeline();
      tl.to(chars, { yPercent: 0, rotate: 0, duration: 1.05, ease: 'expo.out', stagger: 0.016 })
        .to(slot, { opacity: 1, y: 0, duration: .7, ease: 'expo.out' }, '-=0.7')
        .to(els, { opacity: 1, y: 0, duration: .9, ease: 'expo.out', stagger: 0.08 }, '-=0.6')
        .to(giant, { opacity: 1, yPercent: 0, duration: 1.2, ease: 'expo.out' }, '-=0.8');
      this.startSlot();
    }

    // 3. Slot verb
    setupSlot() {
      this.slotTrack = this.one('[data-slot-track]'); this.slotClip = this.one('[data-slot]');
      const measure = () => { if (!this.slotTrack || !this.slotTrack.children.length) return; const h = this.slotTrack.children[0].getBoundingClientRect().height; this.slotLineH = h; this.slotClip.style.height = h + 'px'; };
      measure(); this._slotMeasure = measure;
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); });
      window.addEventListener('resize', measure);
      if (this.slotClip && !this.RM) {
        this.slotClip.style.cursor = 'pointer';
        this.slotClip.addEventListener('click', () => {
          if (!this.gsap) return;
          this.advanceSlot(true);
          if (this._slotIv) { clearInterval(this._slotIv); this._slotIv = setInterval(() => this.advanceSlot(false), 2500); }
        });
      }
    }
    advanceSlot(springy) {
      const g = this.gsap; if (!g || !this.slotTrack || !this.slotLineH) return;
      const n = this.slotTrack.children.length - 1;
      this.slotI = (this.slotI || 0) + 1;
      g.to(this.slotTrack, { y: -this.slotLineH * this.slotI, duration: springy ? .55 : .7, ease: springy ? 'back.out(1.6)' : 'cubic-bezier(.76,0,.24,1)', overwrite: true, onComplete: () => { if (this.slotI >= n) { this.slotI = 0; g.set(this.slotTrack, { y: 0 }); } } });
      if (springy) {
        const w = this.slotTrack.children[Math.min(this.slotI, n)];
        const dot = w && w.querySelector('[data-dot]');
        if (dot) { g.fromTo(dot, { scale: 1 }, { scale: 1.55, duration: .13, yoyo: true, repeat: 1, ease: 'power2.out' }); }
      }
    }
    startSlot() {
      if (this.RM || !this.slotTrack) return;
      this.slotI = 0;
      this._slotIv = setInterval(() => this.advanceSlot(false), 2500);
    }

    // 4. Hero / giant name parallax
    setupHeroParallax() {
      if (this.RM) return; const g = this.gsap;
      const hero = this.q('section')[0]; const content = this.one('[data-hero-content]'); const giant = this.one('[data-giant-name]');
      g.to(content, { yPercent: -12, opacity: .3, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      g.to(giant, { yPercent: 22, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }

    // 5. Custom cursor
    setupCursor() {
      const dot = this.one('[data-cursor-dot]'), ring = this.one('[data-cursor-ring]'), label = this.one('[data-cursor-label]');
      if (!dot) return; const g = this.gsap;
      g.set([dot, ring], { opacity: 1 });
      this._ring = ring; this._ringLabel = label;
      const rx = g.quickTo(ring, 'x', { duration: .35, ease: 'power3' }), ry = g.quickTo(ring, 'y', { duration: .35, ease: 'power3' });
      const dx = g.quickTo(dot, 'x', { duration: .05 }), dy = g.quickTo(dot, 'y', { duration: .05 });
      window.addEventListener('mousemove', e => { rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); });
      const grow = () => g.to(ring, { scale: 1.7, duration: .3 }), shrink = () => g.to(ring, { scale: 1, duration: .3 });
      this.q('a,button,[data-magnetic]').forEach(el => { el.addEventListener('mouseenter', grow); el.addEventListener('mouseleave', shrink); });
      this.q('[data-card]').forEach(card => {
        card.addEventListener('mouseenter', () => { label.textContent = 'EXPLORE'; g.to(ring, { scale: 2.4, duration: .3, background: '#0D0D12', borderColor: '#0D0D12' }); label.style.opacity = 1; });
        card.addEventListener('mouseleave', () => { g.to(ring, { scale: 1, duration: .3, background: 'rgba(0,0,0,0)', borderColor: '#0D0D12' }); label.style.opacity = 0; });
      });
      if (this.slotClip) {
        this.slotClip.addEventListener('mouseenter', () => { label.textContent = 'ROLL'; g.to(ring, { scale: 2.1, duration: .3, background: '#0D0D12', borderColor: '#0D0D12' }); label.style.opacity = 1; });
        this.slotClip.addEventListener('mouseleave', () => { g.to(ring, { scale: 1, duration: .3, background: 'rgba(0,0,0,0)', borderColor: '#0D0D12' }); label.style.opacity = 0; });
      }
    }

    // 6. Velocity ribbons
    setupRibbons() {
      if (this.RM) return;
      this.q('[data-ribbon]').forEach(rib => {
        const track = rib.querySelector('[data-ribbon-track]');
        const original = track.children[0];
        for (let i = 0; i < 3; i++) { track.appendChild(original.cloneNode(true)); }
        const dir = track.getAttribute('data-dir') === '-1' ? -1 : 1;
        let half = original.getBoundingClientRect().width;
        const remeasure = () => { half = original.getBoundingClientRect().width; };
        window.addEventListener('resize', remeasure);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
        let x = 0; const base = (rib.getAttribute('data-ribbon') === '2' ? 95 : 75) * dir;
        let lt = 0, mult = 1, multT = 1;
        rib.addEventListener('mouseenter', () => { multT = .3; });
        rib.addEventListener('mouseleave', () => { multT = 1; });
        track.addEventListener('mouseover', (e) => { const s = e.target.closest('[data-mq]'); if (s) s.style.color = s.getAttribute('data-mq'); });
        track.addEventListener('mouseout', (e) => { const s = e.target.closest('[data-mq]'); if (s) s.style.color = s.hasAttribute('data-stroke') ? 'transparent' : ''; });
        const loop = (t) => {
          if (this.dead) return;
          const dt = lt ? Math.min(0.05, (t - lt) / 1000) : 0.016; lt = t;
          const v = this.vel || 0;
          mult += (multT - mult) * 0.08;
          const speed = (base + dir * Math.abs(v) * 14) * mult;
          x -= speed * dt;
          if (half > 0) { if (x <= -half) x += half; if (x >= 0) x -= half; }
          const skew = Math.max(-7, Math.min(7, -v * 0.9));
          track.style.transform = 'translate3d(' + x + 'px,0,0) skewX(' + skew + 'deg)';
          this.rafs.push(requestAnimationFrame(loop));
        };
        this.rafs.push(requestAnimationFrame(loop));
      });
    }

    // 7. Manifesto scroll-fill
    setupManifesto() {
      const g = this.gsap; const p = this.one('[data-manifesto]'); if (!p) return;
      const units = [];
      const walk = (node) => {
        [...node.childNodes].forEach(n => {
          if (n.nodeType === 3) {
            const words = n.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            words.forEach(w => {
              if (w.trim() === '') { frag.appendChild(document.createTextNode(w)); }
              else { const s = document.createElement('span'); s.textContent = w; s.style.display = 'inline-block'; frag.appendChild(s); units.push(s); }
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1) { n.style.display = 'inline-block'; units.push(n); }
        });
      };
      walk(p);
      if (this.RM) { units.forEach(u => u.style.opacity = 1); return; }
      units.forEach(u => u.style.opacity = 0.13);
      g.to(units, { opacity: 1, ease: 'none', stagger: { each: 0.4 }, scrollTrigger: { trigger: p, start: 'top 78%', end: 'bottom 55%', scrub: 0.6 } });
    }

    // 8. Stats
    setupStats() {
      const g = this.gsap, ST = this.ST;
      this.q('[data-stats] [data-count]').forEach((el) => {
        const to = parseInt(el.getAttribute('data-to'), 10), suf = el.getAttribute('data-suffix') || '';
        const tick = el.parentElement.querySelector('[data-tick]');
        ST.create({
          trigger: el, start: 'top 85%', once: true, onEnter: () => {
            if (this.RM) { el.textContent = to + suf; if (tick) tick.style.transform = 'scaleY(1)'; return; }
            if (tick) g.to(tick, { scaleY: 1, duration: .8, ease: 'expo.out' });
            const o = { v: 0 }; g.to(o, { v: to, duration: 1.6, ease: 'expo.out', onUpdate: () => { el.textContent = Math.round(o.v) + suf; } });
          }
        });
      });
    }

    // 9. Stacking cards
    setupCards() {
      if (this.RM) return; const g = this.gsap;
      const cards = this.q('[data-card]');
      cards.forEach((card, i) => {
        const inner = card.firstElementChild;
        if (i < cards.length - 1) {
          const next = cards[i + 1];
          g.to(inner, { scale: .94, filter: 'brightness(.965)', ease: 'none', transformOrigin: 'top center', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top+=120', scrub: true } });
        }
        const ghost = card.querySelector('[data-ghost]');
        if (ghost) {
          card.addEventListener('mousemove', (e) => { const r = card.getBoundingClientRect(); const dx = (e.clientX - r.left - r.width / 2) / r.width; g.to(ghost, { x: dx * 30, y: (e.clientY - r.top - r.height / 2) / r.height * 20, duration: .6 }); });
          card.addEventListener('mouseleave', () => g.to(ghost, { x: 0, y: 0, duration: .8 }));
        }
      });
    }

    // 10. Experience hover
    setupExpHover() {
      this.q('[data-exp-row]').forEach(row => {
        const bar = row.querySelector('[data-exp-bar]');
        row.addEventListener('mouseenter', () => { if (!this.TOUCH) { row.style.transform = 'translateX(14px)'; row.style.background = '#FBFAF7'; } bar.style.transform = 'scaleY(1)'; });
        row.addEventListener('mouseleave', () => { row.style.transform = 'translateX(0)'; row.style.background = 'transparent'; bar.style.transform = 'scaleY(0)'; });
      });
    }

    // 12. Honors tilt
    setupTilt() {
      const g = this.gsap;
      this.q('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', (e) => { const r = card.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; g.to(card, { rotationY: px * 9, rotationX: -py * 9, transformPerspective: 800, duration: .4, ease: 'power2.out' }); });
        card.addEventListener('mouseleave', () => { g.to(card, { rotationX: 0, rotationY: 0, duration: .7, ease: 'elastic.out(1,.5)' }); });
      });
    }

    // 13. Background hue drift
    setupHueDrift() {
      const g = this.gsap, ST = this.ST; const main = this.one('[data-main]');
      const work = this.one('#work');
      if (work) ST.create({ trigger: work, start: 'top 60%', end: 'bottom 40%', onEnter: () => g.to(main, { backgroundColor: '#F7F8FF', duration: .8 }), onLeave: () => g.to(main, { backgroundColor: '#FBFAF7', duration: .8 }), onEnterBack: () => g.to(main, { backgroundColor: '#F7F8FF', duration: .8 }), onLeaveBack: () => g.to(main, { backgroundColor: '#FBFAF7', duration: .8 }) });
      const island = this.one('[data-island]'); const honorsSection = island ? island.closest('section').nextElementSibling : null;
      if (honorsSection) ST.create({ trigger: honorsSection, start: 'top 60%', onEnter: () => g.to(main, { backgroundColor: '#FDF8EF', duration: .8 }), onLeaveBack: () => g.to(main, { backgroundColor: '#FBFAF7', duration: .8 }) });
    }

    // 14. Footer reveal
    setupFooterReveal() {
      const ST = this.ST; const main = this.one('[data-main]'); const footer = this.one('[data-footer]'); const giant = this.one('[data-foot-giant]'); const headline = this.one('[data-foot-headline]');
      const apply = () => {
        const fh = footer.getBoundingClientRect().height;
        if (this.RM || window.innerWidth <= 520 || fh > window.innerHeight * 0.96) {
          main.style.marginBottom = '0'; footer.style.position = 'relative'; footer.style.zIndex = '1';
          return;
        }
        footer.style.position = 'fixed';
        main.style.marginBottom = fh + 'px';
        main.style.borderBottomLeftRadius = '26px'; main.style.borderBottomRightRadius = '26px';
        main.style.boxShadow = '0 40px 80px rgba(13,13,18,.18)';
        if (this.ST) { ST.create({ trigger: main, start: 'bottom bottom', end: 'bottom top', scrub: true, onUpdate: (self) => { if (giant) giant.style.transform = 'translateY(' + (1 - self.progress) * 40 + '%)'; } }); }
      };
      apply();
      window.addEventListener('resize', () => { if (this.ST) this.ST.refresh(); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => {
        if (footer.style.position === 'fixed') { main.style.marginBottom = footer.getBoundingClientRect().height + 'px'; if (this.ST) this.ST.refresh(); }
      });
      // headline per-letter roll on hover
      if (headline && !this.TOUCH) {
        const txt = headline.textContent; headline.textContent = '';
        [...txt].forEach(ch => { const w = document.createElement('span'); w.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;'; const inner = document.createElement('span'); inner.style.cssText = 'display:inline-block;transition:transform .4s cubic-bezier(.76,0,.24,1);'; inner.textContent = ch === ' ' ? ' ' : ch; w.appendChild(inner); headline.appendChild(w); });
        const inners = headline.querySelectorAll('span span');
        headline.addEventListener('mouseenter', () => { inners.forEach((s, i) => setTimeout(() => { s.style.transform = 'translateY(-100%)'; setTimeout(() => { s.style.transition = 'none'; s.style.transform = 'translateY(100%)'; requestAnimationFrame(() => { s.style.transition = 'transform .4s cubic-bezier(.76,0,.24,1)'; s.style.transform = 'translateY(0)'; }); }, 220); }, i * 14)); });
      }
    }

    // 16. Nav hide/show
    setupNav() {
      const nav = this.one('[data-nav]'); if (!nav) return; let last = 0;
      const handler = (y) => { if (y > 500 && y > last) { nav.style.transform = 'translateX(-50%) translateY(-150%)'; } else { nav.style.transform = 'translateX(-50%) translateY(0)'; } last = y; };
      nav.style.transition = 'transform .5s cubic-bezier(.76,0,.24,1),background .35s ease';
      if (this.lenis) { this.lenis.on('scroll', (e) => handler(e.scroll)); }
      else { window.addEventListener('scroll', () => handler(window.scrollY)); }
      const cta = nav.querySelector('[data-cta]');
      if (cta) { cta.addEventListener('mouseenter', () => cta.style.background = '#2438FF'); cta.addEventListener('mouseleave', () => cta.style.background = '#0D0D12'); }
    }

    // v3 1.6 — scramble-in mono labels (once per load)
    setupScramble() {
      const ST = this.ST; const CH = '█▓▒░<>/*\\';
      if (!ST) return;
      this.q('[data-scramble]').forEach(el => {
        if (this.RM) return;
        const orig = el.textContent;
        ST.create({
          trigger: el, start: 'top 88%', once: true, onEnter: () => {
            const t0 = performance.now(); const D = 500;
            const tick = () => {
              if (this.dead) return;
              const p = Math.min(1, (performance.now() - t0) / D); const n = Math.floor(orig.length * p);
              let s = orig.slice(0, n);
              for (let i = n; i < orig.length; i++) { s += orig[i] === ' ' ? ' ' : CH[Math.floor(Math.random() * CH.length)]; }
              el.textContent = s;
              if (p < 1) requestAnimationFrame(tick); else el.textContent = orig;
            };
            tick();
          }
        });
      });
      const nav = this.one('[data-nav-clock]');
      if (nav && !this.RM) {
        const t0 = performance.now();
        const tick = () => { if (this.dead) return; const p = Math.min(1, (performance.now() - t0) / 500); const n = Math.floor(3 * p); let pre = 'BLR'.slice(0, n); for (let i = n; i < 3; i++) pre += CH[Math.floor(Math.random() * CH.length)]; nav.textContent = pre + nav.textContent.slice(3); if (p < 1) requestAnimationFrame(tick); };
        tick();
      }
    }

    // v3 1.5 — scroll progress hairline
    setupProgress() {
      const bar = this.one('[data-progress]'); if (!bar) return;
      const upd = (y) => { const max = document.documentElement.scrollHeight - window.innerHeight; bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, Math.max(0, y / max)) : 0) + ')'; };
      if (this.lenis) this.lenis.on('scroll', (e) => upd(e.scroll));
      else window.addEventListener('scroll', () => upd(window.scrollY), { passive: true });
      upd(window.scrollY || 0);
    }

    // v3 1.3 — email copy with feedback
    setupCopyEmail() {
      const link = this.one('a[href^="mailto:"]'); if (!link) return; const g = this.gsap;
      const hint = this.one('[data-copy-hint]');
      let last = 0;
      link.addEventListener('click', (e) => {
        const now = Date.now();
        if (now - last < 3000) { last = 0; return; }
        e.preventDefault(); last = now;
        try { if (navigator.clipboard) navigator.clipboard.writeText('kunalsain0324@gmail.com'); } catch (err) { }
        if (g && !this.RM) { g.fromTo(link, { scale: .96 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.4)', transformOrigin: 'left center' }); }
        if (this._ringLabel && this._ring && g) {
          this._ringLabel.textContent = 'COPIED ✓'; this._ringLabel.style.opacity = 1;
          g.to(this._ring, { scale: 2.2, background: '#0D0D12', borderColor: '#FBFAF7', duration: .25 });
          setTimeout(() => { if (this._ringLabel) this._ringLabel.style.opacity = 0; if (g && this._ring) g.to(this._ring, { scale: 1, background: 'rgba(0,0,0,0)', borderColor: '#0D0D12', duration: .3 }); }, 1200);
        }
        if (hint) { hint.style.opacity = 1; setTimeout(() => { hint.style.opacity = 0; }, 3000); }
        this.burst(e.clientX, e.clientY);
        setTimeout(() => { last = 0; }, 3100);
      });
    }
    burst(x, y) {
      if (this.RM || !this.gsap) return; const g = this.gsap;
      const colors = ['#2438FF', '#7A2BF5', '#0CAF9B', '#FFAA00'];
      for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;width:8px;height:8px;z-index:10005;pointer-events:none;background:' + colors[i % 4] + ';transform:rotate(45deg);';
        document.body.appendChild(p);
        const a = (i / 8) * Math.PI * 2 + Math.random() * .5;
        const d = 40 + Math.random() * 55;
        g.to(p, { x: Math.cos(a) * d, y: Math.sin(a) * d - 22, rotation: '+=200', opacity: 0, scale: .35, duration: .6, ease: 'power2.out', onComplete: () => p.remove() });
      }
    }

    // v3 1.1 — card 3D depth + glare
    setupCardFX() {
      if (this.RM) return; const g = this.gsap;
      this.q('[data-card]').forEach(card => {
        const inner = card.firstElementChild; if (!inner) return;
        card.style.perspective = '1400px';
        const glare = inner.querySelector('[data-glare]');
        const left = inner.querySelector(':scope > div:not([data-glare])');
        const layers = [];
        const h3 = inner.querySelector('h3'); if (h3) layers.push({ el: h3, d: 40 });
        const stat = inner.querySelector('[data-plate] > div:last-child'); if (stat) layers.push({ el: stat, d: 60 });
        if (left && left.children[3]) layers.push({ el: left.children[3], d: 20 });
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
          g.to(inner, { rotationY: px * 4, rotationX: -py * 4, transformPerspective: 1400, duration: .5, ease: 'power2.out' });
          layers.forEach(L => g.to(L.el, { x: px * L.d * .5, y: py * L.d * .5, duration: .5, ease: 'power2.out' }));
          if (glare) { glare.style.opacity = 1; glare.style.background = 'radial-gradient(340px circle at ' + (e.clientX - r.left) + 'px ' + (e.clientY - r.top) + 'px, rgba(255,255,255,.10), transparent 62%)'; }
        });
        card.addEventListener('mouseleave', () => {
          g.to(inner, { rotationX: 0, rotationY: 0, duration: .8, ease: 'elastic.out(1,.5)' });
          layers.forEach(L => g.to(L.el, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.5)' }));
          if (glare) glare.style.opacity = 0;
        });
      });
    }

    // v3 1.8 — time-aware greeting (Bengaluru)
    setGreeting() {
      const el = this.one('[data-greet]'); if (!el) return;
      let h = 12;
      try { h = parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }).format(new Date()), 10); } catch (e) { }
      el.textContent = (h >= 5 && h < 12) ? 'Good morning' : (h >= 12 && h < 17) ? 'Good afternoon' : (h >= 17 && h < 22) ? 'Good evening' : "It's late in Bengaluru — still shipping";
    }

    // v3 copy pack — heroVariants (single source of truth)
    getPacks() {
      const C = { cobalt: '#2438FF', violet: '#7A2BF5', teal: '#0CAF9B', amber: '#FFAA00', coral: '#FF4D5E' };
      return {
        'worth-remembering': { l1: 'Building software', l2: 'worth ', l3: '', slots: [{ t: 'remembering', c: C.cobalt, dot: true }, { t: 'talking about', c: C.violet, dot: true }, { t: 'coming back to', c: C.teal, dot: true }], sub: null },
        'feels-alive': { l1: 'I build software', l2: 'that feels ', l3: '', slots: [{ t: 'alive', c: C.coral, dot: true }, { t: 'inevitable', c: C.cobalt, dot: true }, { t: 'effortless', c: C.teal, dot: true }], sub: null },
        'design-build-ship': { l1: 'I ', l2: '', l3: ' intelligent software.', slots: [{ t: 'design', c: C.violet, dot: false }, { t: 'build', c: C.cobalt, dot: false }, { t: 'ship', c: C.teal, dot: false }, { t: 'obsess over', c: C.coral, dot: false }], sub: 'From ambitious idea to deployed system — frontend, backend, and the AI in between.' },
        'engineer-by-training': { l1: 'Engineer by training,', l2: '', l3: ' by nature.', slots: [{ t: 'builder', c: C.cobalt, dot: false }, { t: 'storyteller', c: C.violet, dot: false }, { t: 'perfectionist', c: C.teal, dot: false }], sub: null },
        'original': { l1: 'I build AI systems', l2: 'that ', l3: '', slots: [{ t: 'remember', c: C.cobalt, dot: true }, { t: 'reason', c: C.violet, dot: true }, { t: 'negotiate', c: C.teal, dot: true }], sub: null }
      };
    }
    applyPack() {
      const key = this.heroPack ?? 'worth-remembering';
      if (key === 'worth-remembering' && !this._packApplied) { this._packApplied = key; return; }
      const packs = this.getPacks();
      const p = packs[key] || packs['worth-remembering'];
      this._packApplied = key;
      const l1 = this.one('[data-l1]'), l2 = this.one('[data-l2]'), l3 = this.one('[data-l3]');
      if (l1) { l1.textContent = p.l1; l1.style.display = p.l1 ? 'block' : 'none'; }
      if (l2) l2.textContent = p.l2;
      if (l3) l3.textContent = p.l3;
      const track = this.one('[data-slot-track]');
      if (track) {
        track.innerHTML = '';
        const mk = (s) => { const d = document.createElement('span'); d.style.cssText = 'display:block;white-space:nowrap;color:' + s.c + ';'; d.textContent = s.t; if (s.dot) { const dot = document.createElement('span'); dot.setAttribute('data-dot', ''); dot.style.cssText = 'display:inline-block;color:#FF4D5E;'; dot.textContent = '.'; d.appendChild(dot); } return d; };
        p.slots.forEach(s => track.appendChild(mk(s)));
        track.appendChild(mk(p.slots[0]));
        if (this._slotMeasure) this._slotMeasure();
        this.slotI = 0; if (this.gsap) this.gsap.set(track, { y: 0 });
      }
      if (p.sub) { const sub = this.one('[data-hero-sub]'); if (sub) sub.textContent = p.sub + ' Recent proof: a memory engine for unfinished work, a support agent that passes 132/132 tests, and 100k episodes of machines learning to negotiate.'; }
      const pre = this.one('[data-pre-track]');
      if (pre) { const ws = pre.querySelectorAll('[data-pre-w]'); for (let i = 0; i < Math.min(3, p.slots.length, ws.length); i++) { ws[i].textContent = p.slots[i].t; ws[i].style.color = p.slots[i].c; } }
      this.q('[data-ribbon="2"] [data-mq]').forEach((el, i) => {
        const k = i % 4; const s = k < 3 ? p.slots[Math.min(k, p.slots.length - 1)] : null;
        el.textContent = (s ? s.t : 'ship') + '.';
        el.setAttribute('data-mq', s ? s.c : '#FFAA00');
      });
    }

    // 17. Magnetics (+v3 1.4: rotate toward cursor, squish on press)
    setupMagnetics() {
      const g = this.gsap;
      this.q('[data-magnetic]').forEach(el => {
        const xTo = g.quickTo(el, 'x', { duration: .4, ease: 'power3' }), yTo = g.quickTo(el, 'y', { duration: .4, ease: 'power3' });
        const rTo = g.quickTo(el, 'rotation', { duration: .4, ease: 'power3' });
        el.addEventListener('mousemove', (e) => { const r = el.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); xTo(dx * 0.25); yTo(dy * 0.35); rTo(Math.max(-3, Math.min(3, dx / r.width * 6))); });
        el.addEventListener('mouseleave', () => { xTo(0); yTo(0); rTo(0); });
        el.addEventListener('mousedown', () => { g.to(el, { scale: .95, duration: .15, ease: 'power2.out' }); });
        el.addEventListener('mouseup', () => { g.to(el, { scale: 1, duration: .7, ease: 'elastic.out(1.2,.45)' }); });
      });
    }
  }

  const boot = () => { new Site(document.getElementById('kk-root')); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
