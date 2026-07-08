/* ================================================================
   KUNAL.SYS v2.0 — kernel
   zero dependencies. one class. everything guarded.
   ================================================================ */
(function(){
'use strict';

class Kernel{
  constructor(){
    this.RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches;
    this.$  = (s)=>document.querySelector(s);
    this.$$ = (s)=>Array.from(document.querySelectorAll(s));
    this.snd=false; try{ this.snd = localStorage.getItem('kk_snd')==='1'; }catch(e){}
    this.visits=0; try{ this.visits=parseInt(localStorage.getItem('kk_visits')||'0',10)||0; localStorage.setItem('kk_visits',String(this.visits+1)); }catch(e){}
    this.returning = this.visits>0;

    this.clocks();
    this.boot();
    this.typewriter();
    this.sectors();
    this.memgrid();
    this.crosshair();
    this.banks();
    this.logPanel();
    this.guest();
    this.palette();
    this.colophon();
    this.mail();
    this.party();
    this.toast();
    this.soundToggle();
    this.titleFlip();
    this.memory();
  }

  /* -- audio ----------------------------------------------------- */
  beep(f,d,v){
    if(!this.snd) return;
    try{
      if(!this._ac) this._ac=new (window.AudioContext||window.webkitAudioContext)();
      if(this._ac.state==='suspended') this._ac.resume();
      const o=this._ac.createOscillator(), g=this._ac.createGain(), n=this._ac.currentTime;
      o.type='square'; o.frequency.value=f;
      g.gain.setValueAtTime(0,n); g.gain.linearRampToValueAtTime(v||.04,n+.008); g.gain.exponentialRampToValueAtTime(.0001,n+(d||.09));
      o.connect(g); g.connect(this._ac.destination); o.start(n); o.stop(n+(d||.09)+.02);
    }catch(e){}
  }
  soundToggle(){
    const b=this.$('[data-sound]'); if(!b) return;
    const paint=()=>{ b.textContent='SND: '+(this.snd?'ON':'OFF'); b.style.color=this.snd?'var(--amber)':''; b.style.borderColor=this.snd?'var(--amber)':''; };
    paint();
    b.addEventListener('click',()=>{ this.snd=!this.snd; try{ localStorage.setItem('kk_snd',this.snd?'1':'0'); }catch(e){} if(this.snd) this.beep(880,.09,.05); paint(); });
  }

  /* -- clocks ---------------------------------------------------- */
  clocks(){
    let fmt=null; try{ fmt=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}); }catch(e){}
    const hud=this.$('[data-hud-clock]'), spec=this.$('[data-spec-clock]');
    const tick=()=>{ const t=fmt?fmt.format(new Date()):new Date().toLocaleTimeString(); if(hud) hud.textContent='BLR '+t; if(spec) spec.textContent=t+' IST · bengaluru'; };
    tick(); setInterval(tick,1000);
    const ll=this.$('[data-lastlogin]');
    if(ll){ try{ ll.textContent='LAST LOGIN: '+new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase()+' · BENGALURU, IN'; }catch(e){} }
  }

  /* -- boot sequence ---------------------------------------------- */
  boot(){
    const el=this.$('#boot'), pre=this.$('[data-boot-pre]'); if(!el||!pre) return;
    let seen=false; try{ seen=sessionStorage.getItem('kk_boot')==='1'; }catch(e){}
    if(this.RM||seen){ el.remove(); return; }
    el.hidden=false; document.documentElement.style.overflow='hidden';
    const L=[
      'KUNAL.SYS v2.0 — memory core',
      'bios: bricolage retired · phosphor online',
      'mount /banks .............. <i class="ok">3 OK</i>',
      'mount /life.log ........... <i class="ok">8 LINES</i>',
      'identity .................. <i class="ok">VERIFIED</i>',
      this.returning?'visitor .................. <i class="ok">RECOGNIZED — WELCOME BACK</i>':'visitor .................. <i class="ok">NEW — HELLO</i>',
      'boot complete. <i class="ok">READY_</i>'
    ];
    let i=0; const done=()=>{ try{ sessionStorage.setItem('kk_boot','1'); }catch(e){} el.style.transition='opacity .28s steps(3)'; el.style.opacity='0'; document.documentElement.style.overflow=''; setTimeout(()=>el.remove(),320); };
    const step=()=>{ if(!el.isConnected) return; if(i>=L.length){ setTimeout(done,340); return; } pre.innerHTML+=(i?'\n':'')+L[i]; this.beep(220+i*40,.03,.02); i++; setTimeout(step, i===L.length?260:110+Math.random()*90); };
    step();
    this.$('[data-boot-skip]').addEventListener('click',done);
  }

  /* -- typewriter -------------------------------------------------- */
  typewriter(){
    const el=this.$('[data-tw]'); if(!el) return;
    const words=['remembering.','talking about.','coming back to.'];
    if(this.RM){ el.textContent=words[0]; return; }
    let wi=0;
    const type=(w,ci,dir)=>{ 
      el.textContent=w.slice(0,ci);
      if(dir>0 && ci===w.length){ setTimeout(()=>type(w,ci,-1),2300); return; }
      if(dir<0 && ci===0){ wi=(wi+1)%words.length; setTimeout(()=>type(words[wi],0,1),240); return; }
      setTimeout(()=>type(w,ci+dir,dir), dir>0?58:26);
    };
    setTimeout(()=>type(words[0],words[0].length,-1),3600);
  }

  /* -- sector HUD + mem% + nav state ------------------------------- */
  sectors(){
    const lab=this.$('[data-hud-sector]'), mem=this.$('[data-hud-mem]');
    const secs=this.$$('.sector'); const nav=this.$$('.nav .links a');
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver((es)=>{ es.forEach(e=>{ if(!e.isIntersecting) return;
        const s=e.target, a=s.getAttribute('data-sector'), n=s.getAttribute('data-name');
        if(lab) lab.textContent='SECTOR '+a+' // '+n;
        nav.forEach(x=>x.classList.toggle('on', x.getAttribute('href')==='#'+s.id));
      });},{threshold:.4});
      secs.forEach(s=>io.observe(s));
    }
    let raf=0;
    addEventListener('scroll',()=>{ if(raf) return; raf=requestAnimationFrame(()=>{ raf=0;
      const max=document.documentElement.scrollHeight-innerHeight;
      const p=max>0?Math.min(100,Math.max(0,Math.round(scrollY/max*100))):0;
      if(mem) mem.textContent='MEM '+String(p).padStart(3,'0')+'%';
      clearTimeout(this._dt); this._dt=setTimeout(()=>{ try{ localStorage.setItem('kk_depth',String(p)); }catch(e){} },400);
    });},{passive:true});
  }

  /* -- phosphor memory grid (hero canvas) --------------------------- */
  memgrid(){
    const cv=this.$('#memgrid'); if(!cv) return;
    let ctx=null; try{ ctx=cv.getContext('2d'); }catch(e){}
    if(!ctx){ cv.remove(); return; }
    const CELL=26; let W=0,H=0,cols=0,rows=0,heat=null;
    const size=()=>{ const r=cv.parentElement.getBoundingClientRect(); W=cv.width=Math.max(300,r.width|0); H=cv.height=Math.max(300,r.height|0); cols=Math.ceil(W/CELL); rows=Math.ceil(H/CELL); heat=new Float32Array(cols*rows); };
    size(); addEventListener('resize',size);
    let mx=-1,my=-1;
    if(!this.TOUCH) cv.parentElement.addEventListener('mousemove',(e)=>{ const r=cv.getBoundingClientRect(); mx=e.clientX-r.left; my=e.clientY-r.top; });
    let vis=true; if('IntersectionObserver' in window) new IntersectionObserver(es=>{vis=es[0].isIntersecting;}).observe(cv);
    let t=0,last=0;
    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      const sweep=(t*0.35)%(cols+30)-15; /* ambient scan column */
      for(let y=0;y<rows;y++) for(let x=0;x<cols;x++){
        const i=y*cols+x; let h=heat[i];
        const d=Math.abs(x-sweep); if(d<6) h=Math.max(h,(1-d/6)*.22);
        if(mx>=0){ const dx=x*CELL+CELL/2-mx, dy=y*CELL+CELL/2-my; const dist=Math.hypot(dx,dy); if(dist<70) heat[i]=Math.min(1,heat[i]+(1-dist/70)*.5); }
        if(h>.012){ ctx.fillStyle='rgba(255,176,0,'+(h*.55).toFixed(3)+')'; const s=h>.5?4:3; ctx.fillRect(x*CELL+CELL/2-s/2, y*CELL+CELL/2-s/2, s, s); }
        heat[i]*=.945;
      }
    };
    if(this.RM){ t=40; draw(); return; }
    const loop=(ts)=>{ if(vis && !document.hidden && ts-last>33){ last=ts; t+=.5; draw(); } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  /* -- crosshair --------------------------------------------------- */
  crosshair(){
    if(this.TOUCH||this.RM) return;
    const x=this.$('.xh-x'), y=this.$('.xh-y'), tag=this.$('.xh-tag'); if(!x) return;
    let shown=false;
    addEventListener('mousemove',(e)=>{
      if(!shown){ shown=true; x.style.opacity=y.style.opacity=tag.style.opacity='1'; }
      x.style.top=e.clientY+'px'; y.style.left=e.clientX+'px';
      tag.style.left=e.clientX+'px'; tag.style.top=e.clientY+'px';
      tag.textContent='x:'+String(e.clientX).padStart(4,'0')+' y:'+String(e.clientY).padStart(4,'0');
    });
    document.documentElement.addEventListener('mouseleave',()=>{ shown=false; x.style.opacity=y.style.opacity=tag.style.opacity='0'; });
  }

  /* -- memory banks (accordion) ------------------------------------ */
  banks(){
    this.$$('[data-bank]').forEach(b=>{
      const h=b.querySelector('.bank-h'), t=b.querySelector('.tgl');
      h.addEventListener('click',()=>{
        const open=b.classList.toggle('open');
        h.setAttribute('aria-expanded',open?'true':'false');
        t.textContent=open?'−':'+';
        this.beep(open?520:340,.05,.03);
      });
    });
    /* legacy deep links (#case-recall etc.) still resolve */
    const map={'#case-recall':0,'#case-triage':1,'#case-watershed':2};
    if(location.hash in map){
      const banks=this.$$('[data-bank]'); const b=banks[map[location.hash]];
      if(b){ setTimeout(()=>{ b.querySelector('.bank-h').click(); if(!b.classList.contains('open')) b.querySelector('.bank-h').click(); b.scrollIntoView({block:'center'}); }, this.RM?300:2600); }
    }
  }

  /* -- log --------------------------------------------------------- */
  logPanel(){
    const box=this.$('[data-log-lines]'); if(!box) return;
    const lines=Array.from(box.children);
    if(this.RM||!('IntersectionObserver' in window)) return;
    lines.forEach(l=>{ l.style.opacity='0'; l.style.transform='translateX(-6px)'; l.style.transition='opacity .22s steps(3), transform .22s steps(3)'; });
    const io=new IntersectionObserver((es)=>{ if(!es[0].isIntersecting) return; io.disconnect();
      lines.forEach((l,i)=>setTimeout(()=>{ l.style.opacity='1'; l.style.transform='none'; this.beep(300+i*30,.02,.015); }, 120+i*95));
    },{threshold:.2});
    io.observe(box);
  }

  /* -- guest: leave a mark ------------------------------------------ */
  guest(){
    const g=this.$('[data-guest]'); if(!g) return;
    let saved=null; try{ saved=JSON.parse(localStorage.getItem('kk_guest')||'null'); }catch(e){}
    const CTA=()=>{
      g.innerHTML='<button class="gbtn"><span class="ts">[ you  ]</span><span class="m" style="color:var(--dark)">▪</span><span class="glab">leave a mark → <span style="font-size:10px;color:var(--dark)">(stays on this device)</span></span></button>';
      g.querySelector('.gbtn').addEventListener('click',FORM);
    };
    const FORM=()=>{
      g.innerHTML='<div class="gbtn" style="cursor:text"><span class="ts">[ you  ]</span><span class="m">▪</span><span><input maxlength="48" aria-label="sign the log" placeholder="a name, a note, a hello…"> <span style="font-size:10px;color:var(--dark);letter-spacing:.1em">ENTER ↵ / ESC</span></span></div>';
      const inp=g.querySelector('input'); setTimeout(()=>inp.focus({preventScroll:true}),30);
      inp.addEventListener('keydown',(e)=>{
        if(e.key==='Escape'){ saved?SHOW(saved):CTA(); return; }
        if(e.key!=='Enter') return;
        const t=(inp.value||'').trim().slice(0,48); if(!t) return;
        const gv={t, m:new Date().toISOString().slice(0,7)};
        try{ localStorage.setItem('kk_guest',JSON.stringify(gv)); }catch(e2){}
        saved=gv; this.beep(660,.09,.05); SHOW(gv);
      });
    };
    const SHOW=(gv)=>{
      g.innerHTML='<div class="gbtn" style="cursor:default"><span class="ts">['+gv.m+']</span><span class="m">▪</span><span style="color:var(--dim)">"<span data-gt></span>" — <span style="color:var(--amber)">remembered.</span> <button class="fg">FORGET</button></span></div>';
      g.querySelector('[data-gt]').textContent=gv.t;
      g.querySelector('.fg').addEventListener('click',()=>{ try{ localStorage.removeItem('kk_guest'); }catch(e2){} saved=null; CTA(); });
    };
    this.signLog=()=>{ if(!saved) FORM(); };
    saved&&saved.t?SHOW(saved):CTA();
  }

  /* -- command palette ---------------------------------------------- */
  palette(){
    const acts=[
      ['go','0x02 — memory banks',()=>this.jump('#work')],
      ['go','0x03 — runtime',()=>this.jump('#runtime')],
      ['go','0x04 — life.log',()=>this.jump('#log')],
      ['go','0x05 — modules',()=>this.jump('#modules')],
      ['go','0x06 — transmit',()=>this.jump('#contact')],
      ['go','top of core',()=>this.jump('#hero')],
      ['do','copy email',()=>{ this.copyMail(); }],
      ['do','open resume.pdf',()=>window.open('kunal-kumar-resume.pdf','_blank','noopener')],
      ['do','open github',()=>window.open('https://github.com/kunalKumar-13','_blank','noopener')],
      ['do','open linkedin',()=>window.open('https://linkedin.com/in/sainkunal','_blank','noopener')],
      ['do','sign the log',()=>{ this.jump('#log'); setTimeout(()=>this.signLog&&this.signLog(),700); }],
      ['sys','colophon — how this is built',()=>this.openColo()],
      ['sys','sudo party',()=>this.glitch()],
      ['sys','toggle sound',()=>{ const b=this.$('[data-sound]'); if(b) b.click(); }]
    ];
    const ov=document.createElement('div'); ov.className='ov';
    ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-label','command palette');
    const box=document.createElement('div'); box.className='panelbox';
    const inp=document.createElement('input'); inp.placeholder='> run command…'; inp.setAttribute('aria-label','command');
    const list=document.createElement('div'); list.className='plist';
    box.append(inp,list); ov.append(box); document.body.append(ov);
    let rows=[],sel=0,open=false,prev=null;
    const fuzzy=(q,s)=>{ q=q.toLowerCase(); s=s.toLowerCase(); let i=0; for(const c of q){ i=s.indexOf(c,i); if(i<0) return false; i++; } return true; };
    const paint=()=>rows.forEach((r,i)=>r.classList.toggle('sel',i===sel));
    const render=()=>{
      const q=inp.value.trim(); list.innerHTML=''; rows=[]; let lg='';
      acts.filter(a=>!q||fuzzy(q,a[0]+' '+a[1])).forEach(a=>{
        if(a[0]!==lg){ lg=a[0]; const h=document.createElement('div'); h.className='pgroup'; h.textContent=a[0]; list.append(h); }
        const r=document.createElement('button'); r.className='prowi'; r.setAttribute('role','option');
        r.innerHTML='<span style="color:var(--amber)">▪</span> '+a[1]+'<span class="pk">RUN ↵</span>';
        r.addEventListener('mouseenter',()=>{ sel=rows.indexOf(r); paint(); });
        r.addEventListener('click',()=>run(rows.indexOf(r)));
        r._a=a; list.append(r); rows.push(r);
      });
      sel=0; paint();
    };
    const run=(i)=>{ const r=rows[i]; if(!r) return; close(); setTimeout(()=>{ try{ r._a[2](); }catch(e){} },120); };
    const openFn=()=>{ if(open) return; open=true; prev=document.activeElement; ov.classList.add('on'); inp.value=''; render(); document.documentElement.style.overflow='hidden'; setTimeout(()=>inp.focus(),30); this.beep(700,.05,.03); };
    const close=()=>{ if(!open) return; open=false; ov.classList.remove('on'); document.documentElement.style.overflow=''; if(prev&&prev.focus){ try{ prev.focus({preventScroll:true}); }catch(e){} } };
    this.openPalette=openFn;
    ov.addEventListener('click',e=>{ if(e.target===ov) close(); });
    inp.addEventListener('input',render);
    inp.addEventListener('keydown',(e)=>{
      if(e.key==='ArrowDown'){ e.preventDefault(); sel=Math.min(sel+1,rows.length-1); paint(); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); sel=Math.max(sel-1,0); paint(); }
      else if(e.key==='Enter'){ e.preventDefault(); run(sel); }
      else if(e.key==='Escape'){ e.preventDefault(); close(); }
      else if(e.key==='Tab'){ e.preventDefault(); }
    });
    addEventListener('keydown',(e)=>{
      if((e.metaKey||e.ctrlKey)&&(e.key==='k'||e.key==='K')){ e.preventDefault(); open?close():openFn(); }
      else if(e.key==='/'&&!open&&!/input|textarea/i.test((document.activeElement||{}).tagName||'')){ e.preventDefault(); openFn(); }
    });
    const c=this.$('[data-cmdk]'); if(c) c.addEventListener('click',openFn);
  }
  jump(sel){ const t=this.$(sel); if(t) t.scrollIntoView({behavior:this.RM?'auto':'smooth',block:'start'}); }

  /* -- colophon ------------------------------------------------------ */
  colophon(){
    const ov=document.createElement('div'); ov.className='ov';
    ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-label','colophon');
    ov.innerHTML='<div class="colobox"><button class="xclose">ESC ✕</button>'
      +'<div style="font-size:11px;letter-spacing:.2em;color:var(--amber)">[ COLOPHON — KUNAL.SYS v2.0 ]</div>'
      +'<h2>How this is built</h2>'
      +'<div class="cl"><span class="k">philosophy</span><span class="v">a site that remembers should also explain itself. <b>no framework, no build step, zero dependencies</b> — one HTML file, one class.</span></div>'
      +'<div class="cl"><span class="k">engine</span><span class="v">vanilla JS + CSS. stepped easings, typewriters and one phosphor-grid canvas — IntersectionObserver-gated, paused off-screen.</span></div>'
      +'<div class="cl"><span class="k">type</span><span class="v"><b>Anton</b> for the shouting · <b>JetBrains Mono</b> for everything true.</span></div>'
      +'<div class="cl"><span class="k">memory</span><span class="v">it counts your visits, greets you back, keeps your scroll depth, and holds anything you sign into the log. all local — <b>nothing leaves this device.</b></span></div>'
      +'<div class="cl"><span class="k">field guide</span><span class="v">⌘K or <b>/</b> — command palette · <b>K K</b> — system fault · the log takes signatures · boot runs once per session.</span></div>'
      +'<div class="cl"><span class="k">a11y</span><span class="v">reduced-motion gets a fully static core · 44px targets · dialog focus management · prints as a clean one-pager.</span></div>'
      +'<div class="cl"><span class="k">source</span><span class="v"><a href="https://github.com/kunalKumar-13/Portfolio" target="_blank" rel="noopener" style="color:var(--amber)">github.com/kunalKumar-13/Portfolio ↗</a></span></div>'
      +'</div>';
    document.body.append(ov);
    let open=false,prev=null;
    const openFn=()=>{ if(open) return; open=true; prev=document.activeElement; ov.classList.add('on'); document.documentElement.style.overflow='hidden'; setTimeout(()=>ov.querySelector('.xclose').focus(),30); };
    const close=()=>{ if(!open) return; open=false; ov.classList.remove('on'); document.documentElement.style.overflow=''; if(prev&&prev.focus){ try{ prev.focus({preventScroll:true}); }catch(e){} } };
    this.openColo=openFn;
    ov.querySelector('.xclose').addEventListener('click',close);
    ov.addEventListener('click',e=>{ if(e.target===ov) close(); });
    addEventListener('keydown',e=>{ if(open&&e.key==='Escape'){ e.preventDefault(); close(); } });
    const b=this.$('[data-colophon]'); if(b) b.addEventListener('click',openFn);
  }

  /* -- mail copy ------------------------------------------------------ */
  mail(){
    const b=this.$('[data-mail]'), h=this.$('[data-mail-hint]'); if(!b) return;
    let last=0;
    b.addEventListener('click',()=>{
      const now=Date.now();
      if(now-last<3000){ last=0; location.href='mailto:kunalsain0324@gmail.com'; return; }
      last=now; this.copyMail();
      setTimeout(()=>{ last=0; if(h) h.textContent='CLICK TO COPY · CLICK AGAIN TO OPEN MAIL'; },3000);
    });
  }
  copyMail(){
    try{ if(navigator.clipboard) navigator.clipboard.writeText('kunalsain0324@gmail.com'); }catch(e){}
    const h=this.$('[data-mail-hint]'); if(h) h.textContent='COPIED ✓ — CLICK AGAIN TO OPEN MAIL APP';
    this.beep(587,.1,.05);
  }

  /* -- party: SYSTEM FAULT glitch -------------------------------------- */
  party(){
    if(this.RM) return;
    let lastK=0;
    addEventListener('keydown',(e)=>{
      if((e.key||'').toLowerCase()!=='k'||e.metaKey||e.ctrlKey) return;
      if(/input|textarea/i.test((document.activeElement||{}).tagName||'')) return;
      const now=Date.now();
      if(now-lastK<600){ lastK=0; this.glitch(); } else lastK=now;
    });
  }
  glitch(){
    if(this.RM) return;
    document.documentElement.classList.add('glitching');
    const sec=this.$('[data-hud-sector]'); const old=sec?sec.textContent:'';
    if(sec){ sec.textContent='!! SYSTEM FAULT — JK, PARTY !!'; sec.style.color='var(--red)'; }
    this.beep(150,.2,.06); setTimeout(()=>this.beep(920,.12,.05),140);
    const colors=['#FFB000','#59F0FF','#FF5252','#E8E4D8'];
    for(let i=0;i<30;i++){
      const p=document.createElement('div'); p.className='confetti';
      p.style.background=colors[i%4]; p.style.left=(10+Math.random()*80)+'vw'; p.style.top='-2vh';
      document.body.append(p);
      const fall=p.animate([
        {transform:'translateY(0) rotate(0deg)',opacity:1},
        {transform:'translateY('+(60+Math.random()*45)+'vh) rotate('+(Math.random()*540-270)+'deg)',opacity:0}
      ],{duration:900+Math.random()*900,easing:'steps(12)',fill:'forwards'});
      fall.onfinish=()=>p.remove();
    }
    setTimeout(()=>{ document.documentElement.classList.remove('glitching'); if(sec){ sec.textContent=old; sec.style.color=''; } },1400);
  }

  /* -- continuity toast -------------------------------------------------- */
  toast(){
    if(!this.returning) return;
    let d=0; try{ d=parseInt(localStorage.getItem('kk_depth')||'0',10)||0; }catch(e){}
    try{ if(sessionStorage.getItem('kk_resumed')) return; }catch(e){}
    if(d<18||d>96) return;
    setTimeout(()=>{
      try{ sessionStorage.setItem('kk_resumed','1'); }catch(e){}
      const b=document.createElement('button'); b.className='toast';
      b.textContent='[ RESTORE SESSION → '+d+'% ]';
      document.body.append(b);
      const gone=()=>{ if(b.isConnected) b.remove(); };
      b.addEventListener('click',()=>{ const max=document.documentElement.scrollHeight-innerHeight; scrollTo({top:Math.round(max*d/100),behavior:this.RM?'auto':'smooth'}); gone(); });
      setTimeout(gone,9000);
    }, this.RM?900:3400);
  }

  /* -- misc memory -------------------------------------------------------- */
  memory(){
    if(this.returning){
      const g=this.$('[data-greet]'); if(g) g.textContent='  # welcome back';
      const s=this.$('[data-signoff]'); if(s) s.textContent='YOU MADE IT BACK — THANKS';
    }
  }
  titleFlip(){
    const t=document.title;
    document.addEventListener('visibilitychange',()=>{ document.title=document.hidden?'— still running · KUNAL.SYS':t; });
  }
}

const boot=()=>new Kernel();
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
