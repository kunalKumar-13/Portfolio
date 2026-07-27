/* Kunal Kumar — portfolio. Vanilla JS, no dependencies. */
(() => {
'use strict';
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;

/* reveal on scroll */
function reveal(){
  const els = $$('.rv');
  if (RM || !('IntersectionObserver' in window)){ els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
  }), { threshold:.1, rootMargin:'0px 0px -6% 0px' });
  els.forEach(e => io.observe(e));
}

/* nav: background on scroll + active section */
function nav(){
  const n = $('nav'); if (!n) return;
  const links = $$('.nlinks a');
  const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  let raf = 0;
  const upd = () => {
    n.classList.toggle('stuck', scrollY > 20);
    const mid = scrollY + innerHeight * 0.35;
    let cur = null;
    for (const s of secs){ if (s.offsetTop <= mid) cur = s; }
    links.forEach(a => a.classList.toggle('on', cur && a.getAttribute('href') === '#' + cur.id));
  };
  addEventListener('scroll', () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; upd(); }); }, { passive:true });
  upd();
}

/* count-ups */
function counters(){
  const run = scope => $$('[data-count]', scope).forEach(el => {
    if (el.dataset.done) return; el.dataset.done = '1';
    const to = +el.getAttribute('data-count');
    if (RM){ el.textContent = to; return; }
    const t0 = performance.now();
    const go = () => { const p = Math.min(1,(performance.now()-t0)/800);
      el.textContent = Math.round(to*(1-Math.pow(1-p,3))); if (p<1) requestAnimationFrame(go); };
    go();
  });
  if (!('IntersectionObserver' in window)){ run(document); return; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){ run(e.target); io.unobserve(e.target); }
  }), { threshold:.3 });
  $$('.pfacts, .hs').forEach(e => io.observe(e));
}

/* local time */
function clock(){
  const el = $('[data-clock]'); if (!el) return;
  const f = new Intl.DateTimeFormat('en-GB',{ timeZone:'Asia/Kolkata', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
  const t = () => { el.textContent = f.format(new Date()) + ' IST'; };
  t(); setInterval(t, 1000);
}

/* live GitHub contributions */
function heat(){
  const grid = $('[data-hm-grid]'); if (!grid) return;
  const read = $('[data-hm-read]'), stats = $('[data-hm-stats]');
  const down = () => { $$('.n', stats).forEach(e => e.textContent = '—');
    grid.parentElement.innerHTML =
    '<div class="hdown">The live contribution feed is unreachable right now — the commits are real, the fetch was not. <a href="https://github.com/kunalKumar-13" target="_blank" rel="noopener">See the graph on GitHub ↗</a></div>'; };
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
        cells.forEach((c,ix) => setTimeout(() => c.classList.remove('hid'), 40 + ((ix/7)|0)*13)); }, { threshold:.15 });
      io.observe(grid);
    }
  };
  try { const c = JSON.parse(sessionStorage.getItem('kk_heat')||'null');
    if (c && c.d && Date.now()-c.ts < 36e5){ render(c.d); return; } } catch(e){}
  if (!('fetch' in window)) return down();
  const ctrl = ('AbortController' in window) ? new AbortController() : null;
  const to = ctrl ? setTimeout(() => ctrl.abort(), 7000) : null;
  fetch('https://github-contributions-api.jogruber.de/v4/kunalKumar-13?y=last', ctrl?{signal:ctrl.signal}:{})
    .then(r => r.ok ? r.json() : Promise.reject(new Error('bad response')))
    .then(d => { if (to) clearTimeout(to);
      if (!d || !Array.isArray(d.contributions) || !d.contributions.length) return down();
      try { sessionStorage.setItem('kk_heat', JSON.stringify({ ts:Date.now(), d })); } catch(e){}
      render(d); })
    .catch(err => { if (to) clearTimeout(to); console.warn('contributions:', err && err.message); down(); });
}

/* copy email */
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

/* returning visitor */
function returning(){
  let n = 0;
  try { n = parseInt(localStorage.getItem('kk_visits')||'0',10)||0; localStorage.setItem('kk_visits', String(n+1)); } catch(e){}
  if (n > 0){ const s = $('[data-signoff]'); if (s) s.textContent = 'Welcome back · Bengaluru'; }
}

const boot = () => { reveal(); nav(); counters(); clock(); heat(); mail(); returning(); };
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
