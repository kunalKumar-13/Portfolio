/* The Record — Kunal Kumar. Vanilla JS, no dependencies.
   Nothing here gates content: with JS off the paper is fully readable and flat. */
(() => {
'use strict';
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const GH = 'kunalKumar-13';

/* ── the fold ───────────────────────────────────────────────
   CSS default is flat. We opt IN to folding, then release each panel as it
   approaches. Transform + opacity only, so this can never move layout.     */
function fold(){
  const panels = $$('.fold');
  if (!panels.length) return;
  if (RM || !('IntersectionObserver' in window)) return;   // leave the paper flat
  document.documentElement.classList.add('jsfold');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('open');
    io.unobserve(e.target);
  }), { threshold: .08, rootMargin: '0px 0px -5% 0px' });
  panels.forEach(p => io.observe(p));
  /* Safety net: anything still shut after 6s opens anyway, so a missed
     observer callback can never leave a story unreadable. */
  setTimeout(() => panels.forEach(p => p.classList.add('open')), 6000);
}

/* ── the clock, in the folio and the conditions box ─────────── */
function clock(){
  const els = $$('[data-clock]');
  if (!els.length) return;
  const f = new Intl.DateTimeFormat('en-GB', { timeZone:'Asia/Kolkata',
    hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
  const tick = () => { const t = f.format(new Date()) + ' IST';
    els.forEach(e => { e.textContent = t; }); };
  tick(); setInterval(tick, 1000);
}

/* ── which page are we on ───────────────────────────────────── */
function sections(){
  const links = $$('.bar nav a');
  if (!links.length) return;
  const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  let raf = 0;
  const upd = () => {
    const mid = scrollY + innerHeight * .3;
    let cur = null;
    for (const s of secs) if (s.offsetTop <= mid) cur = s;
    links.forEach(a => a.classList.toggle('on', !!cur && a.getAttribute('href') === '#' + cur.id));
  };
  addEventListener('scroll', () => { if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; upd(); }); }, { passive:true });
  upd();
}

/* ── market report: live GitHub contributions ───────────────── */
function market(){
  const grid = $('[data-hm-grid]'); if (!grid) return;
  const read = $('[data-hm-read]'), stats = $('[data-hm-stats]');
  const down = () => {
    $$('td[data-hm-total],td[data-hm-cur],td[data-hm-max],td[data-hm-busy]')
      .forEach(e => { e.textContent = 'n/a'; });
    grid.parentElement.innerHTML = '<p class="hdown">The contributions feed is unreachable at ' +
      'the time of going to press. The commits are real; the fetch was not. ' +
      '<a href="https://github.com/' + GH + '" target="_blank" rel="noopener">See the record on GitHub</a></p>';
  };
  const day = iso => { try {
      return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day:'numeric', month:'short' });
    } catch(e){ return iso; } };

  const render = d => {
    const cs = d.contributions;
    grid.innerHTML = '';
    const frag = document.createDocumentFragment();
    const first = new Date(cs[0].date + 'T00:00:00');
    for (let i = 0; i < first.getDay(); i++){
      const e = document.createElement('i'); e.className = 'hc'; e.style.visibility = 'hidden'; frag.appendChild(e);
    }
    let max = 0, run = 0, busy = cs[0];
    cs.forEach(c => {
      if (c.count > 0){ run++; if (run > max) max = run; } else run = 0;
      if (c.count > busy.count) busy = c;
      const e = document.createElement('i');
      e.className = 'hc' + (c.level ? ' l' + Math.min(4, c.level) : '');
      e.title = c.date + ' — ' + c.count + ' contribution' + (c.count === 1 ? '' : 's');
      e.dataset.d = c.date; e.dataset.c = c.count;
      frag.appendChild(e);
    });
    let i = cs.length - 1, cur = 0;
    if (cs[i] && cs[i].count === 0) i--;
    while (i >= 0 && cs[i].count > 0){ cur++; i--; }
    grid.appendChild(frag);

    const total = (d.total && d.total.lastYear) || cs.reduce((a, c) => a + c.count, 0);
    grid.setAttribute('aria-label',
      'GitHub contribution chart — ' + total + ' contributions in the last twelve months');
    $('[data-hm-cur]').textContent  = cur + (cur === 1 ? ' day' : ' days');
    $('[data-hm-max]').textContent  = max + (max === 1 ? ' day' : ' days');
    $('[data-hm-busy]').textContent = busy.count > 0 ? day(busy.date) : 'n/a';

    const tEl = $('[data-hm-total]');
    if (RM) tEl.textContent = total;
    else { const t0 = performance.now(); const go = () => {
        const p = Math.min(1, (performance.now() - t0) / 900);
        tEl.textContent = Math.round(total * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(go); }; go(); }

    if (FINE && read){
      grid.addEventListener('mouseover', e => { const c = e.target.dataset && e.target.dataset.d;
        if (c) read.textContent = day(c) + ' — ' + e.target.dataset.c + ' commits'; });
      grid.addEventListener('mouseleave', () => { read.textContent = ''; });
    }
    if (!RM && 'IntersectionObserver' in window){
      const cells = Array.from(grid.children);
      cells.forEach(c => c.classList.add('hid'));
      const io = new IntersectionObserver(es => { if (!es[0].isIntersecting) return;
        io.disconnect();
        cells.forEach((c, ix) => setTimeout(() => c.classList.remove('hid'), 40 + ((ix / 7) | 0) * 12));
      }, { threshold:.12 });
      io.observe(grid);
    }
  };

  try { const c = JSON.parse(sessionStorage.getItem('kk_heat') || 'null');
    if (c && c.d && Date.now() - c.ts < 36e5){ render(c.d); return; } } catch(e){}
  if (!('fetch' in window)) return down();
  const ctrl = ('AbortController' in window) ? new AbortController() : null;
  const to = ctrl ? setTimeout(() => ctrl.abort(), 7000) : null;
  fetch('https://github-contributions-api.jogruber.de/v4/' + GH + '?y=last', ctrl ? { signal:ctrl.signal } : {})
    .then(r => r.ok ? r.json() : Promise.reject(new Error('bad response')))
    .then(d => { if (to) clearTimeout(to);
      if (!d || !Array.isArray(d.contributions) || !d.contributions.length) return down();
      try { sessionStorage.setItem('kk_heat', JSON.stringify({ ts:Date.now(), d })); } catch(e){}
      render(d); })
    .catch(err => { if (to) clearTimeout(to); console.warn('contributions:', err && err.message); down(); });
}

/* ── classified: copy the address ───────────────────────────── */
const EMAIL = 'kunalsain0324@gmail.com';
let lastMail = 0;
function copyMail(){
  const hint = $('[data-mail-hint]');
  const now = Date.now();
  if (now - lastMail < 3000){ location.href = 'mailto:' + EMAIL; lastMail = 0; return; }
  lastMail = now;
  try { navigator.clipboard && navigator.clipboard.writeText(EMAIL); } catch(e){}
  if (hint){ hint.textContent = 'Copied — click again to open mail';
    setTimeout(() => { hint.textContent = 'Click to copy · click again to open mail'; }, 3200); }
}
function mail(){ const b = $('[data-mail]'); if (b) b.addEventListener('click', copyMail); }

/* ── letters to the editor ──────────────────────────────────── */
let signLetter = () => {};
function letters(){
  const row = $('[data-guest]'); if (!row) return;
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem('kk_guest') || 'null'); } catch(e){}

  const printed = g => {
    row.innerHTML = '';
    const p = document.createElement('p');
    p.innerHTML = '<b>' + esc(g.name) + '</b>, ' + esc(g.where || 'somewhere') +
      ' — read this issue on ' + esc(g.when) + '.';
    const f = document.createElement('button');
    f.className = 'fg'; f.type = 'button'; f.textContent = 'Withdraw the letter';
    f.addEventListener('click', () => { try { localStorage.removeItem('kk_guest'); } catch(e){} cta(); });
    row.appendChild(p); row.appendChild(f);
  };
  const cta = () => {
    row.innerHTML = '';
    const b = document.createElement('button');
    b.className = 'gb'; b.type = 'button'; b.setAttribute('data-gcta','');
    b.textContent = 'Write to the editor — your name, kept on this device only.';
    b.addEventListener('click', () => {
      row.innerHTML = '';
      const i = document.createElement('input');
      i.placeholder = 'Your name, and where you are reading'; i.setAttribute('aria-label','Your name');
      i.maxLength = 60;
      const send = () => {
        const v = i.value.trim(); if (!v) return cta();
        const g = { name:v.split(',')[0].trim().slice(0,40),
          where:(v.split(',')[1] || '').trim().slice(0,40),
          when:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) };
        try { localStorage.setItem('kk_guest', JSON.stringify(g)); } catch(e){}
        printed(g);
      };
      i.addEventListener('keydown', e => { if (e.key === 'Enter') send(); if (e.key === 'Escape') cta(); });
      i.addEventListener('blur', send);
      row.appendChild(i); i.focus();
    });
    row.appendChild(b);
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  saved && saved.name ? printed(saved) : cta();
  signLetter = () => { const c = $('[data-gcta]', row); if (c) c.click(); };
}

/* ── search the paper ───────────────────────────────────────── */
function palette(){
  const ov = $('[data-pal-ov]'), input = $('[data-pal-in]'), list = $('[data-pal-list]');
  if (!ov) return;
  let opener = null, sel = 0, shown = [];
  const go = h => { const t = $(h); if (t) t.scrollIntoView({ behavior: RM ? 'auto':'smooth', block:'start' }); };
  const CMDS = [
    ['Page', 'Front page', '', () => go('#page-one')],
    ['Story', 'Recall — the memory engine', '1', () => go('#recall')],
    ['Story', 'Aegis — moderation, audited', '2', () => go('#aegis')],
    ['Story', 'PDFChat — grounded answers', '3', () => go('#pdfchat')],
    ['Story', 'Code-Guardian — security review', '4', () => go('#guardian')],
    ['Page', 'Briefs & corrections', '', () => go('#briefs')],
    ['Page', 'Appointments', '', () => go('#appointments')],
    ['Page', 'Market report', '', () => go('#market')],
    ['Page', 'Classified', '', () => go('#classified')],
    ['Do', 'Copy the email address', '', () => copyMail()],
    ['Do', 'Write to the editor', 'G', () => { go('#classified'); setTimeout(signLetter, 700); }],
    ['Do', 'Open the résumé', '', () => window.open('kunal-kumar-resume.pdf','_blank','noopener')],
    ['Do', 'Open GitHub', '', () => window.open('https://github.com/' + GH,'_blank','noopener')],
    ['Do', 'Open LinkedIn', '', () => window.open('https://linkedin.com/in/sainkunal','_blank','noopener')],
    ['Do', 'Print this issue', 'P', () => window.print()],
  ];
  const paint = () => {
    const q = input.value.trim().toLowerCase();
    shown = CMDS.filter(c => !q || (c[0] + ' ' + c[1]).toLowerCase().includes(q));
    if (sel >= shown.length) sel = 0;
    list.innerHTML = '';
    shown.forEach((c, i) => {
      const d = document.createElement('div');
      d.className = 'it' + (i === sel ? ' sel' : '');
      d.innerHTML = '<span>' + c[0] + ' — ' + c[1] + '</span><span class="k">' + (c[2] || '') + '</span>';
      d.addEventListener('click', () => { close(); c[3](); });
      list.appendChild(d);
    });
  };
  const open = () => { opener = document.activeElement; ov.classList.add('on');
    input.value = ''; sel = 0; paint(); input.focus(); };
  const close = () => { ov.classList.remove('on'); if (opener && opener.focus) opener.focus(); };
  input.addEventListener('input', paint);
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); ov.classList.contains('on') ? close() : open(); return; }
    if (!ov.classList.contains('on')) return;
    if (e.key === 'Escape'){ close(); return; }
    if (e.key === 'ArrowDown'){ e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); paint(); }
    if (e.key === 'ArrowUp'){ e.preventDefault(); sel = Math.max(0, sel - 1); paint(); }
    if (e.key === 'Enter'){ e.preventDefault(); const c = shown[sel]; if (c){ close(); c[3](); } }
  });
  const btn = $('[data-cmdk]'); if (btn) btn.addEventListener('click', open);
}

/* ── keyboard ───────────────────────────────────────────────── */
function keys(){
  const jump = { '1':'#recall', '2':'#aegis', '3':'#pdfchat', '4':'#guardian' };
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (document.querySelector('.ov.on')) return;
    const k = e.key.toLowerCase();
    if (jump[k]){ const t = $(jump[k]); if (t) t.scrollIntoView({ behavior: RM ? 'auto':'smooth', block:'start' }); }
    else if (k === 'g'){ const t = $('#classified');
      if (t) t.scrollIntoView({ behavior: RM ? 'auto':'smooth', block:'start' });
      setTimeout(signLetter, 700); }
    else if (k === 'p'){ e.preventDefault(); window.print(); }
  });
  const pb = $('[data-print]'); if (pb) pb.addEventListener('click', () => window.print());
}

/* ── the returning reader ───────────────────────────────────── */
function returning(){
  let n = 0;
  try { n = parseInt(localStorage.getItem('kk_visits') || '0', 10) || 0;
    localStorage.setItem('kk_visits', String(n + 1)); } catch(e){}
  if (n > 0){ const s = $('[data-signoff]'); if (s) s.textContent = '— 30 — Welcome back —'; }
}

const boot = () => { fold(); clock(); sections(); market(); mail(); letters(); palette(); keys(); returning(); };
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
