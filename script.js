/* Kunal Kumar — portfolio. Vanilla JS, no dependencies. */
(() => {
'use strict';
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const clamp = (v,a,b) => v<a?a:v>b?b:v;

/* ── the name: spring entrance + letters that react to the cursor ───── */
function name(){
  const rows = $$('.name .row');
  if (!rows.length) return;
  const letters = [];
  rows.forEach((row, ri) => {
    const word = row.getAttribute('data-word') || '';
    row.textContent = '';
    [...word].forEach((c, i) => {
      const el = document.createElement('span');
      el.className = 'ch'; el.textContent = c; el.setAttribute('aria-hidden','true');
      row.appendChild(el);
      letters.push({ el, y: RM?0:120, vy:0, r: RM?0:9, vr:0, delay: (ri*5 + i) * 42, ty:0, tr:0 });
    });
    if (row.getAttribute('data-dot')){
      const d = document.createElement('span');
      d.className = 'ch dot'; d.textContent = '.'; d.setAttribute('aria-hidden','true');
      row.appendChild(d);
      letters.push({ el:d, y: RM?0:120, vy:0, r:0, vr:0, delay:(ri*5+5)*42, ty:0, tr:0, isDot:true });
    }
  });
  if (RM){ letters.forEach(l => l.el.style.transform = 'none'); return; }

  let mx = -9999, my = -9999, t0 = performance.now(), running = true;
  if (FINE) addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive:true });
  addEventListener('mouseleave', () => { mx = my = -9999; }, { passive:true });
  // a playful nudge: click the name and every letter hops
  const hero = $('.name');
  hero.addEventListener('click', () => letters.forEach((l,i) => setTimeout(() => { l.vy -= 26; l.vr += (Math.random()-.5)*7; }, i*32)));
  if ('IntersectionObserver' in window)
    new IntersectionObserver(e => { running = e[0].isIntersecting; }).observe(hero);

  const tick = () => {
    requestAnimationFrame(tick);
    if (!running || document.hidden) return;
    const now = performance.now() - t0;
    for (const l of letters){
      if (now < l.delay) continue;
      let ty = 0, tr = 0;
      if (FINE && mx > -9000){
        const b = l.el.getBoundingClientRect();
        const dx = (b.left + b.width/2) - mx, dy = (b.top + b.height/2) - my;
        const d = Math.hypot(dx, dy);
        const inf = Math.exp(-(d*d)/(190*190));          // gaussian falloff
        ty = -16 * inf;                                   // lift toward the cursor
        tr = clamp(-dx/b.width, -1, 1) * 5 * inf;         // tilt away from it
      }
      l.ty = ty; l.tr = tr;
      l.vy += (l.ty - l.y) * 0.16; l.vy *= 0.76; l.y += l.vy;   // spring
      l.vr += (l.tr - l.r) * 0.14; l.vr *= 0.78; l.r += l.vr;
      if (Math.abs(l.y) < .02 && Math.abs(l.vy) < .02 && Math.abs(l.r) < .02){ l.y = 0; l.r = 0; }
      l.el.style.transform = `translate3d(0,${l.y.toFixed(2)}%,0) rotate(${l.r.toFixed(2)}deg)`;
    }
  };
  requestAnimationFrame(tick);
}

/* ── reveal on scroll ───────────────────────────────────────────────── */
function reveal(){
  const els = $$('.rv');
  if (RM || !('IntersectionObserver' in window)){ els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.style.transitionDelay = (e.target.dataset.d || 0) + 'ms';
    e.target.classList.add('in'); io.unobserve(e.target);
  }), { threshold:.12, rootMargin:'0px 0px -6% 0px' });
  els.forEach(e => io.observe(e));
}

/* ── nav ────────────────────────────────────────────────────────────── */
function nav(){
  const n = $('nav'); if (!n) return;
  const on = () => n.classList.toggle('stuck', scrollY > 24);
  addEventListener('scroll', on, { passive:true }); on();
}

/* ── local time ─────────────────────────────────────────────────────── */
function clock(){
  const el = $('[data-clock]'); if (!el) return;
  const f = new Intl.DateTimeFormat('en-GB',{ timeZone:'Asia/Kolkata', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
  const t = () => { el.textContent = f.format(new Date()) + ' IST'; };
  t(); setInterval(t, 1000);
}

/* ── commit map (live) ──────────────────────────────────────────────── */
function heat(){
  const grid = $('[data-hm-grid]'); if (!grid) return;
  const read = $('[data-hm-read]'), stats = $('[data-hm-stats]');
  const down = () => { grid.parentElement.innerHTML =
    '<div class="hdown"><b>Feed unavailable</b> — the commits are real; the fetch was not. <a href="https://github.com/kunalKumar-13" target="_blank" rel="noopener">See the graph on GitHub ↗</a></div>'; };
  const day = iso => { try { return new Date(iso+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'}); } catch(e){ return iso; } };
  const render = d => {
    const cs = d.contributions;
    grid.innerHTML = '';
    const frag = document.createDocumentFragment();
    const first = new Date(cs[0].date + 'T00:00:00');
    for (let i=0;i<first.getDay();i++){ const e = document.createElement('i'); e.className='hc'; e.style.visibility='hidden'; frag.appendChild(e); }
    let max=0, run=0, busy=cs[0];
    cs.forEach(c => {
      if (c.count>0){ run++; if (run>max) max=run; } else run=0;
      if (c.count>busy.count) busy=c;
      const e = document.createElement('i');
      e.className = 'hc' + (c.level ? ' l'+Math.min(4,c.level) : '');
      e.title = `${c.date} — ${c.count} contribution${c.count===1?'':'s'}`;
      e.dataset.d = c.date; e.dataset.c = c.count;
      frag.appendChild(e);
    });
    let i = cs.length-1, cur = 0;
    if (cs[i] && cs[i].count === 0) i--;
    while (i>=0 && cs[i].count>0){ cur++; i--; }
    grid.appendChild(frag);
    const total = (d.total && d.total.lastYear) || cs.reduce((a,c)=>a+c.count,0);
    grid.setAttribute('aria-label', `GitHub contribution heatmap — ${total} contributions in the last year`);
    $('[data-hm-cur]').textContent = cur;
    $('[data-hm-max]').textContent = max;
    $('[data-hm-busy]').textContent = busy.count > 0 ? day(busy.date) : '—';
    stats.hidden = false;
    const tEl = $('[data-hm-total]');
    if (RM) tEl.textContent = total;
    else { const s = performance.now(); const go = () => { const p = Math.min(1,(performance.now()-s)/900);
      tEl.textContent = Math.round(total*(1-Math.pow(1-p,3))); if (p<1) requestAnimationFrame(go); }; go(); }
    if (FINE){
      grid.addEventListener('mouseover', e => { const c = e.target.dataset && e.target.dataset.d;
        if (c) read.textContent = `${day(c)} — ${e.target.dataset.c} commits`; });
      grid.addEventListener('mouseleave', () => read.textContent = '');
    }
    if (!RM && 'IntersectionObserver' in window){
      const cells = Array.from(grid.children); cells.forEach(c => c.classList.add('hid'));
      const io = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; io.disconnect();
        cells.forEach((c,ix) => setTimeout(() => c.classList.remove('hid'), 40 + ((ix/7)|0)*14)); }, { threshold:.15 });
      io.observe(grid);
    }
  };
  try { const c = JSON.parse(sessionStorage.getItem('kk_heat')||'null');
    if (c && c.d && Date.now()-c.ts < 36e5){ render(c.d); return; } } catch(e){}
  if (!('fetch' in window)) return down();
  const ctrl = ('AbortController' in window) ? new AbortController() : null;
  const to = ctrl ? setTimeout(() => ctrl.abort(), 7000) : null;
  fetch('https://github-contributions-api.jogruber.de/v4/kunalKumar-13?y=last', ctrl?{signal:ctrl.signal}:{})
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(d => { if (to) clearTimeout(to);
      if (!d || !Array.isArray(d.contributions) || !d.contributions.length) return down();
      try { sessionStorage.setItem('kk_heat', JSON.stringify({ ts:Date.now(), d })); } catch(e){}
      render(d); })
    .catch(() => { if (to) clearTimeout(to); down(); });
}

/* ── copy email ─────────────────────────────────────────────────────── */
function mail(){
  const b = $('[data-mail]'), hint = $('[data-mail-hint]'); if (!b) return;
  const E = 'kunalsain0324@gmail.com'; let last = 0;
  b.addEventListener('click', () => {
    const now = Date.now();
    if (now - last < 3000){ location.href = 'mailto:' + E; last = 0; return; }
    last = now;
    try { navigator.clipboard && navigator.clipboard.writeText(E); } catch(e){}
    if (hint){ hint.textContent = 'Copied ✓ — click again to open mail'; hint.style.color = 'var(--acc)'; }
    setTimeout(() => { if (hint){ hint.textContent = 'Click to copy · click again to open mail'; hint.style.color = ''; } }, 3200);
  });
}

/* ── returning reader ───────────────────────────────────────────────── */
function returning(){
  let n = 0;
  try { n = parseInt(localStorage.getItem('kk_visits')||'0',10)||0; localStorage.setItem('kk_visits', String(n+1)); } catch(e){}
  if (n > 0){ const s = $('[data-signoff]'); if (s) s.textContent = 'Welcome back — Bengaluru, India'; }
}

const boot = () => { name(); reveal(); nav(); clock(); heat(); mail(); returning(); };
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
