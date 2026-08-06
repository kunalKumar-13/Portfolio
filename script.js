/* ══════════════════════════════════════════════════════════════
   KUNAL KUMAR — ISSUE Ø1 / 記憶
   One page, one script. No framework, no build step.
   ══════════════════════════════════════════════════════════════ */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

class Issue {
  constructor(){
    this.dead = false;
    this.commit = null;
    this.clocks();
    this.barcode();
    this.folio();
    this.works();
    this.workPlates();
    this.heatmap();
    this.guest();
    this.brainTerm();
    this.counters();
    this.palette();
    this.mail();
    this.reveal();
    this.keys();
    this.returning();
    const pb = $('[data-print]'); if (pb) pb.addEventListener('click', () => window.print());
  }

  /* ── clocks ─────────────────────────────────────────────── */
  clocks(){
    const a = $('[data-mast-clock]'), b = $('[data-spec-clock]');
    const f = new Intl.DateTimeFormat('en-GB',{ timeZone:'Asia/Kolkata', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
    const tick = () => {
      if (this.dead) return;
      const t = f.format(new Date());
      if (a) a.textContent = 'BENGALURU · ' + t.slice(0,5);
      if (b) b.textContent = t + ' IST';
    };
    tick(); setInterval(tick, 1000);
  }

  /* ── real Code128-B barcode ─────────────────────────────── */
  barcode(){
    const cv = $('#barcode'); if (!cv) return;
    const T = ('212222222122222221121223121322131222122213122312132212221213221312231212112232122132122231113222123122123221223211221132'+
               '221231213212223112312131311222321122321221312212322112322211212123212321232121111323131123131321112313132113132311211313'+
               '231113231311112133112331132131113123113321133121313121211331231131213113213311213131311123311321331121312113312311332111'+
               '314111221411431111111224111422121124121421141122141221112214112412122114122411142112142211241211221114413111241112134111'+
               '111242121142121241114212124112124211411212421112421211212141214121412121111143111341131141114113114311411113411311113141'+
               '114131311141411131211412211214211232').match(/.{6}/g).concat(['2331112']);
    const txt = 'KUNALKUMAR13';
    const codes = [104];
    let sum = 104;
    [...txt].forEach((ch,i) => { const v = ch.charCodeAt(0) - 32; codes.push(v); sum += v * (i+1); });
    codes.push(sum % 103, 106);
    const widths = [];
    codes.forEach(c => [...T[c]].forEach(w => widths.push(+w)));
    const unit = 1, total = widths.reduce((a,b)=>a+b,0) * unit;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = total * dpr; cv.height = 44 * dpr;
    cv.style.width = Math.min(200, total) + 'px';
    const c = cv.getContext('2d'); c.scale(dpr,dpr);
    c.fillStyle = '#F4F2EC'; c.fillRect(0,0,total,44);
    c.fillStyle = '#14141C';
    let x = 0, bar = true;
    widths.forEach(w => { if (bar) c.fillRect(x, 0, w*unit, 44); x += w*unit; bar = !bar; });
  }

  /* ── folio · running head · colour bar · nav ────────────── */
  folio(){
    const fN = $('[data-folio]'), fName = $('[data-folio-name]'), rh = $('[data-rh]');
    const bars = $$('.cbar i'), links = $$('.navlinks a');
    const secs = $$('section.spread');
    if (!secs.length) return;
    let cur = null;
    const set = (s) => {
      const n = s.getAttribute('data-spread'), name = s.getAttribute('data-name'), jp = s.getAttribute('data-jp');
      if (fN) fN.textContent = n;
      if (fName) fName.textContent = name;
      if (rh) rh.textContent = jp + ' / ' + name + ' — BENGALURU';
      bars.forEach((b,i) => b.classList.toggle('on', i === (+n) % bars.length));
      const id = '#' + s.id;
      links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === id));
    };
    /* deterministic: whichever spread owns the viewport centre */
    const pick = () => {
      const mid = window.scrollY + innerHeight/2;
      let best = secs[0];
      for (const s of secs){
        const top = s.offsetTop, bot = top + s.offsetHeight;
        if (mid >= top && mid < bot){ best = s; break; }
        if (mid >= bot) best = s;
      }
      if (best !== cur){ cur = best; set(best); }
    };
    let raf = 0;
    const onScroll = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; pick(); }); };
    addEventListener('scroll', onScroll, { passive:true });
    addEventListener('resize', onScroll, { passive:true });
    pick();
  }

  /* ── works ──────────────────────────────────────────────── */
  works(){
    /* The plates stack vertically now — jumping to one is just a scroll. */
    const projs = $$('.proj');
    this.showWork = (n) => {
      const t = projs[Math.min(projs.length, Math.max(1, +n)) - 1];
      if (t) t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block:'start' });
    };
  }

  /* ── work plates ────────────────────────────────────────── */
  workPlates(){
    /* warm the images on idle so nothing pops in late */
    const warm = () => $$('.p-shot img').forEach(i => { const im = new Image(); im.src = i.getAttribute('src'); });
    'requestIdleCallback' in window ? requestIdleCallback(warm, { timeout:2500 }) : setTimeout(warm, 1800);
    /* touch: first tap reveals full colour, second opens the site */
    if (TOUCH) $$('.p-shot').forEach(a => a.addEventListener('click', ev => {
      if (!a.classList.contains('dev')){ ev.preventDefault(); a.classList.add('dev'); }
    }));
  }

  /* ── counters ───────────────────────────────────────────── */
  counters(){
    this.runCounters = (scope) => {
      $$('[data-count]', scope || document).forEach(el => {
        if (el.dataset.done) return;
        const to = +el.getAttribute('data-count');
        if (RM){ el.textContent = to; el.dataset.done = '1'; return; }
        el.dataset.done = '1';
        const t0 = performance.now(), D = 900;
        const tk = () => {
          const p = Math.min(1, (performance.now()-t0)/D);
          el.textContent = Math.round(to * (1 - Math.pow(1-p, 3)));
          if (p < 1) requestAnimationFrame(tk);
        };
        tk();
      });
    };
    if (!('IntersectionObserver' in window)){ this.runCounters(); return; }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting){ this.runCounters(e.target); io.unobserve(e.target); }
    }), { threshold:.3 });
    $$('.p-figs, .heat-s').forEach(f => io.observe(f));
  }

  /* ── commit map ─────────────────────────────────────────── */
  heatmap(){
    const grid = $('[data-hm-grid]'); if (!grid) return;
    const read = $('[data-hm-read]'), stats = $('[data-hm-stats]');
    const down = () => {
      grid.parentElement.innerHTML = '<div class="heat-down"><b>◆ LINK DOWN</b> — the live contribution feed is unreachable right now. the commits are real; the fetch was not. <a href="https://github.com/kunalKumar-13" target="_blank" rel="noopener">view the graph on github ↗</a></div>';
    };
    const fmtDay = iso => { try { return new Date(iso+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short'}).toLowerCase(); } catch(e){ return iso; } };
    const render = (d) => {
      const cs = d.contributions;
      this.commit = cs.map(c => c.count);
      grid.innerHTML = '';
      const frag = document.createDocumentFragment();
      const first = new Date(cs[0].date + 'T00:00:00');
      for (let i=0;i<first.getDay();i++){ const e = document.createElement('i'); e.className='hc'; e.style.visibility='hidden'; frag.appendChild(e); }
      let maxs=0, run=0, busy=cs[0];
      cs.forEach(c => {
        if (c.count>0){ run++; if (run>maxs) maxs=run; } else run=0;
        if (c.count>busy.count) busy=c;
        const e = document.createElement('i');
        e.className = 'hc' + (c.level ? ' l'+Math.min(4,c.level) : '');
        e.title = c.date + ' — ' + c.count + ' contribution' + (c.count===1?'':'s');
        e.setAttribute('data-d', c.date); e.setAttribute('data-c', c.count);
        frag.appendChild(e);
      });
      let i = cs.length-1, cur = 0;
      if (cs[i] && cs[i].count === 0) i--;
      while (i>=0 && cs[i].count>0){ cur++; i--; }
      grid.appendChild(frag);
      const total = (d.total && d.total.lastYear) || cs.reduce((a,c)=>a+c.count,0);
      grid.setAttribute('aria-label', `GitHub contribution heatmap — ${total} contributions in the last year`);
      const tEl = $('[data-hm-total]');
      $('[data-hm-cur]').textContent = cur;
      $('[data-hm-max]').textContent = maxs;
      $('[data-hm-busy]').textContent = busy.count>0 ? fmtDay(busy.date) : '—';
      stats.hidden = false;
      if (RM){ tEl.textContent = total; }
      else { const t0 = performance.now(), D = 950; const tk = () => { const p = Math.min(1,(performance.now()-t0)/D); tEl.textContent = Math.round(total*(1-Math.pow(1-p,3))); if (p<1) requestAnimationFrame(tk); }; tk(); }
      if (!TOUCH){
        grid.addEventListener('mouseover', e => { const d2 = e.target.getAttribute && e.target.getAttribute('data-d'); if (d2) read.textContent = d2 + ' — ' + e.target.getAttribute('data-c') + ' COMMITS'; });
        grid.addEventListener('mouseleave', () => { read.textContent = ''; });
      }
      if (!RM && 'IntersectionObserver' in window){
        const cells = Array.from(grid.children); cells.forEach(c => c.classList.add('hid'));
        const io = new IntersectionObserver(es => {
          if (!es[0].isIntersecting) return; io.disconnect();
          cells.forEach((c,idx) => setTimeout(() => c.classList.remove('hid'), 50 + ((idx/7)|0)*15));
        }, { threshold:.15 });
        io.observe(grid);
      }
    };
    try { const c = JSON.parse(sessionStorage.getItem('kk_heat')||'null'); if (c && c.d && Date.now()-c.ts < 36e5){ render(c.d); return; } } catch(e){}
    if (!('fetch' in window)){ down(); return; }
    const ctrl = ('AbortController' in window) ? new AbortController() : null;
    const to = ctrl ? setTimeout(() => ctrl.abort(), 7000) : null;
    fetch('https://github-contributions-api.jogruber.de/v4/kunalKumar-13?y=last', ctrl?{signal:ctrl.signal}:{})
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        if (to) clearTimeout(to);
        if (!d || !Array.isArray(d.contributions) || !d.contributions.length){ down(); return; }
        try { sessionStorage.setItem('kk_heat', JSON.stringify({ ts:Date.now(), d })); } catch(e){}
        render(d);
      })
      .catch((err) => { if (to) clearTimeout(to); if (err) console.warn('commit map:', err && err.message || err); down(); });
  }

  /* ── sign the log ───────────────────────────────────────── */
  guest(){
    const row = $('[data-guest]'); if (!row) return;
    let saved = null; try { saved = JSON.parse(localStorage.getItem('kk_guest')||'null'); } catch(e){}
    const savedView = (g) => {
      row.innerHTML = '<div class="ll"><span class="ts">['+g.m+']</span><span class="m">▪</span><span class="tx">“<b data-gt></b>” — remembered. <button class="fg" data-forget>forget</button></span></div>';
      $('[data-gt]', row).textContent = g.t;
      $('[data-forget]', row).addEventListener('click', () => { try{ localStorage.removeItem('kk_guest'); }catch(e){} cta(); });
    };
    const form = () => {
      row.innerHTML = '<div class="gb"><span class="ts">[ you ]</span><span class="m">▪</span><span><input data-gi maxlength="48" placeholder="a name, a note, a hello…" aria-label="sign the log"> <span class="fg">enter ↵</span></span></div>';
      const inp = $('[data-gi]', row);
      setTimeout(() => inp.focus({ preventScroll:true }), 40);
      inp.addEventListener('keydown', e => {
        if (e.key === 'Escape') return cta();
        if (e.key !== 'Enter') return;
        const t = (inp.value||'').trim().slice(0,48); if (!t) return;
        const g = { t, m: new Date().toISOString().slice(0,7) };
        try { localStorage.setItem('kk_guest', JSON.stringify(g)); } catch(e){}
        savedView(g);
      });
    };
    const cta = () => {
      row.innerHTML = '<button class="gb" data-gcta><span class="ts gl">[ you ]</span><span class="m">▪</span><span>leave a mark → <span class="fg">stays on this device</span></span></button>';
      $('[data-gcta]', row).addEventListener('click', form);
    };
    this.signLog = () => { const c = $('[data-gcta]', row); if (c) c.click(); };
    saved && saved.t ? savedView(saved) : cta();
  }

  /* ── second-brain terminal ──────────────────────────────── */
  brainTerm(){
    const box = $('[data-bterm]'); if (!box) return;
    const script = [
      ['$ brain "shipped the dither engine"', 'captured → inbox · sorted → projects/portfolio'],
      ['$ brain pulse', 'weather 28°C · github 2 repos synced · leetcode +3 · calendar 2 events'],
      ['$ brain today', 'ONE THING → finish MATS round-2 notes'],
      ['$ brain streak', 'journal 14d · workout 6d · reading 21d — verified, never invented'],
    ];
    if (RM){
      box.innerHTML = script.map(l => `<div><span class="q">${l[0]}</span></div><div class="o">${l[1]}</div>`).join('');
      return;
    }
    let li = 0, ci = 0, phase = 0, out = [];
    const draw = () => {
      box.innerHTML = out.map(l => l.q
        ? `<div><span class="q">${l.text}</span>${l.cur?'<span class="hl">▌</span>':''}</div>`
        : `<div class="o">${l.text}</div>`).join('');
    };
    const step = () => {
      if (this.dead) return;
      const cur = script[li];
      if (phase === 0){
        if (ci === 0) out.push({ q:true, text:'', cur:true });
        ci++;
        out[out.length-1].text = cur[0].slice(0, ci);
        draw();
        if (ci >= cur[0].length){ phase = 1; setTimeout(step, 340); } else setTimeout(step, 34);
      } else if (phase === 1){
        out[out.length-1].cur = false;
        out.push({ q:false, text: cur[1] });
        draw(); phase = 0; ci = 0; li++;
        if (li >= script.length){
          setTimeout(() => { out = []; li = 0; draw(); setTimeout(step, 500); }, 2600);
        } else setTimeout(step, 620);
      }
    };
    let started = false;
    if ('IntersectionObserver' in window){
      new IntersectionObserver(e => { if (e[0].isIntersecting && !started){ started = true; step(); } }, { threshold:.25 }).observe(box);
    } else step();
  }

  /* ── command palette ────────────────────────────────────── */
  palette(){
    const ov = $('[data-pal-ov]'), inp = $('[data-pal-in]'), list = $('[data-pal-list]');
    if (!ov) return;
    const go = (sel) => { const t = $(sel); t && t.scrollIntoView({ behavior: RM?'auto':'smooth', block:'start' }); };
    const acts = [
      ['go','cover — 表紙','',()=>go('#cover')],
      ['go','profile — 識別','',()=>go('#profile')],
      ['go','works — 作品','',()=>go('#works')],
      ['go','runtime — 経歴','',()=>go('#runtime')],
      ['go','second brain — 第二の脳','',()=>go('#brain')],
      ['go','life.log — 記録','',()=>go('#log')],
      ['go','colophon — 奥付','',()=>go('#colo')],
      ['plate','recall — memory engine','1',()=>this.showWork(1)],
      ['plate','aegis — moderation','2',()=>this.showWork(2)],
      ['plate','pdfchat — grounded agent','3',()=>this.showWork(3)],
      ['plate','code-guardian — security review','4',()=>this.showWork(4)],
      ['do','copy email','',()=>this.copyMail()],
      ['do','sign the log','G',()=>{ go('#log'); setTimeout(()=>this.signLog(), 700); }],
      ['do','open résumé','',()=>window.open('kunal-kumar-resume.pdf','_blank','noopener')],
      ['do','open github','',()=>window.open('https://github.com/kunalKumar-13','_blank','noopener')],
      ['do','open linkedin','',()=>window.open('https://linkedin.com/in/sainkunal','_blank','noopener')],
      ['do','print this issue','',()=>window.print()],
    ];
    let rows = [], sel = 0, open = false, prev = null;
    const fuzzy = (q,s) => { q=q.toLowerCase(); s=s.toLowerCase(); let i=0; for (const c of q){ i = s.indexOf(c,i); if (i<0) return false; i++; } return true; };
    const paint = () => rows.forEach((r,i) => r.classList.toggle('sel', i===sel));
    const render = () => {
      const q = inp.value.trim();
      const vis = acts.filter(a => !q || fuzzy(q, a[0]+' '+a[1]));
      list.innerHTML = ''; rows = []; let g = '';
      vis.forEach(a => {
        if (a[0] !== g){ g = a[0]; const h = document.createElement('div'); h.className='g'; h.textContent = g; list.appendChild(h); }
        const b = document.createElement('button');
        b.className = 'it'; b.type = 'button';
        b.innerHTML = '<span class="d"></span>';
        b.appendChild(document.createTextNode(a[1]));
        if (a[2]){ const k = document.createElement('span'); k.className='kb'; k.textContent = a[2]; b.appendChild(k); }
        b.addEventListener('click', () => { const f = a[3]; close(); setTimeout(f, 120); });
        b.addEventListener('mouseenter', () => { sel = rows.indexOf(b); paint(); });
        b._run = a[3];
        list.appendChild(b); rows.push(b);
      });
      sel = 0; paint();
    };
    const openFn = () => {
      if (open) return; open = true; prev = document.activeElement;
      ov.classList.add('on'); inp.value = ''; render();
      document.documentElement.style.overflow = 'hidden';
      setTimeout(() => inp.focus(), 30);
    };
    const close = () => {
      if (!open) return; open = false;
      ov.classList.remove('on');
      document.documentElement.style.overflow = '';
      if (prev && prev.focus) try { prev.focus({ preventScroll:true }); } catch(e){}
    };
    this.openPalette = openFn;
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    inp.addEventListener('input', render);
    inp.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown'){ e.preventDefault(); sel = Math.min(sel+1, rows.length-1); paint(); rows[sel] && rows[sel].scrollIntoView({block:'nearest'}); }
      else if (e.key === 'ArrowUp'){ e.preventDefault(); sel = Math.max(sel-1, 0); paint(); rows[sel] && rows[sel].scrollIntoView({block:'nearest'}); }
      else if (e.key === 'Enter'){ e.preventDefault(); const r = rows[sel]; if (r){ const f = r._run; close(); setTimeout(f, 120); } }
      else if (e.key === 'Escape'){ e.preventDefault(); close(); }
      else if (e.key === 'Tab'){ e.preventDefault(); }
    });
    window.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')){ e.preventDefault(); open ? close() : openFn(); }
    });
    const btn = $('[data-cmdk]'); if (btn) btn.addEventListener('click', openFn);
  }

  /* ── copy email ─────────────────────────────────────────── */
  mail(){
    const b = $('[data-mail]'), hint = $('[data-mail-hint]'); if (!b) return;
    const EMAIL = 'kunalsain0324@gmail.com';
    let last = 0;
    this.copyMail = () => {
      try { navigator.clipboard && navigator.clipboard.writeText(EMAIL); } catch(e){}
      if (hint){ hint.textContent = 'COPIED ✓ — CLICK AGAIN TO OPEN MAIL'; hint.style.color = 'var(--mag)'; }
      this.toast('EMAIL COPIED ✓');
    };
    b.addEventListener('click', () => {
      const now = Date.now();
      if (now - last < 3000){ location.href = 'mailto:' + EMAIL; last = 0; return; }
      last = now; this.copyMail();
      setTimeout(() => { if (hint){ hint.textContent = 'click to copy · click again to open mail'; hint.style.color = ''; } }, 3200);
    });
  }
  toast(msg){
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  /* ── reveal on scroll ───────────────────────────────────── */
  reveal(){
    if (RM || !('IntersectionObserver' in window)) return;
    const els = $$('.shead, .cov > div, .two > div, .proj, .tblwrap, .heat, .log, .mods, .sayhi, .colo');
    els.forEach(e => { e.style.opacity = '0'; e.style.transform = 'translateY(14px)'; e.style.transition = 'opacity .6s cubic-bezier(.2,.7,.3,1), transform .6s cubic-bezier(.2,.7,.3,1)'; });
    const io = new IntersectionObserver(es => es.forEach((e,i) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none'; }, i*55);
      io.unobserve(el);
    }), { threshold:.08, rootMargin:'0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  }

  /* ── keyboard ───────────────────────────────────────────── */
  keys(){
    window.addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const k = e.key.toLowerCase();
      if (k >= '1' && k <= '4'){ this.showWork(k); }   // showWork scrolls to that project
      else if (k === 'g'){ $('#log').scrollIntoView({ behavior: RM?'auto':'smooth', block:'start' }); setTimeout(() => this.signLog(), 700); }
    });
  }

  /* ── returning reader ───────────────────────────────────── */
  returning(){
    let n = 0;
    try { n = parseInt(localStorage.getItem('kk_visits')||'0',10)||0; localStorage.setItem('kk_visits', String(n+1)); } catch(e){}
    if (n > 0){
      const s = $('[data-signoff]'); if (s) s.textContent = 'YOU CAME BACK — THANK YOU';
      const m = $('[data-mast-clock]');
      if (m) setTimeout(() => { const o = m.textContent; m.textContent = 'WELCOME BACK'; setTimeout(() => { m.textContent = o; }, 4200); }, RM?600:1900);
    }
  }
}

const boot = () => { window.__issue = new Issue(); };
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
