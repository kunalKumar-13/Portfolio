class Site {
  constructor(root){ this.rootEl = root; this.props = {}; this.componentDidMount(); }


  componentDidMount(){
    this.dead=false; this.vel = 0; this.rafs = [];
    this.RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches;
    this.applyPack();
    this.setGreeting();
    this.setupTitle();
    this.startClock();
    this.waitFor(() => window.gsap && window.ScrollTrigger && window.Lenis, () => this.init(), 200);
  }
  componentWillUnmount(){ this.dead = true; (this.rafs||[]).forEach(id=>cancelAnimationFrame(id)); if(this.lenis) this.lenis.destroy(); if(window.ScrollTrigger) ScrollTrigger.getAll().forEach(t=>t.kill()); clearInterval(this._clk); clearInterval(this._slotIv); clearInterval(this._wd); clearInterval(this._phaseIv); clearInterval(this._bentoClk); if(this._pipeTween) this._pipeTween.kill(); (this._roleIvs||[]).forEach(iv=>clearInterval(iv)); if(this._r3dTick&&window.gsap) window.gsap.ticker.remove(this._r3dTick); if(this._renderer){ try{ this._renderer.dispose(); }catch(e){} } }

  waitFor(cond, cb, tries){ if(this.dead) return; if(cond()){ cb(); return; } if(tries<=0){ this.fallback(); return; } setTimeout(()=>this.waitFor(cond,cb,tries-1), 90); }
  q(sel){ const r=this.rootEl; return r? Array.from(r.querySelectorAll(sel)) : []; }
  one(sel){ const r=this.rootEl; return r? r.querySelector(sel) : null; }

  fallback(){ const p=this.one('[data-preloader]'); if(p) p.style.display='none'; }

  buildChips(){
    const data = {
      '#2438FF': ['Python','TypeScript','C++','SQL'],
      '#7A2BF5': ['Reinforcement Learning','GRPO','Semantic Search','Prompt Defense','Memory Systems'],
      '#0CAF9B': ['LlamaIndex','TRL','FastAPI','Qt','React'],
      '#FFAA00': ['Docker','Linux daemons','BM25','Vector DBs']
    };
    this.q('[data-chips]').forEach(box=>{
      const c = box.getAttribute('data-chips');
      (data[c]||[]).forEach(t=>{
        const el=document.createElement('span');
        el.textContent=t;
        el.style.cssText="font-family:'JetBrains Mono',monospace;font-size:12px;padding:9px 13px;border-radius:999px;border:1px solid rgba(251,250,247,.16);color:#FBFAF7;cursor:default;transition:transform .35s cubic-bezier(.76,0,.24,1),background .35s ease,border-color .35s ease,color .35s ease;";
        if(!this.TOUCH){
          el.addEventListener('mouseenter',()=>{ el.style.transform='translateY(-4px)'; el.style.background=c; el.style.borderColor=c; el.style.color= c==='#FFAA00'?'#0D0D12':'#FBFAF7'; });
          el.addEventListener('mouseleave',()=>{ el.style.transform='translateY(0)'; el.style.background='transparent'; el.style.borderColor='rgba(251,250,247,.16)'; el.style.color='#FBFAF7'; });
        }
        box.appendChild(el);
      });
    });
  }

  startClock(){
    const fmt = new Intl.DateTimeFormat('en-GB',{ timeZone:'Asia/Kolkata', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
    const tick=()=>{ const t=fmt.format(new Date()); const n=this.one('[data-nav-clock]'); const f=this.one('[data-foot-clock]'); if(n) n.textContent='BLR — '+t; if(f) f.textContent='bengaluru — '+t+' ist'+(this._phaseName?' · '+this._phaseName:''); };
    tick(); this._clk=setInterval(tick,1000);
  }

  init(){
    const gsap=window.gsap, ST=window.ScrollTrigger; gsap.registerPlugin(ST);
    this.gsap=gsap; this.ST=ST;

    // Lenis smooth scroll
    this.velBus=0; this.velAbs=0; this._velTarget=0;
    if(!this.RM){
      const lenis=new Lenis({ lerp:0.085, wheelMultiplier:1, smoothWheel:true });
      this.lenis=lenis;
      lenis.on('scroll', (e)=>{ this.vel = e.velocity || 0; this._velTarget=Math.max(-1,Math.min(1,(e.velocity||0)/38)); ST.update(); });
    }
    gsap.ticker.lagSmoothing(0);
    // master loop: drive lenis + gsap + webgl from one rAF (gsap's internal ticker can stall in embedded contexts; updateRoot is time-based so double-driving is harmless)
    const de=document.documentElement;
    const master=(t)=>{
      if(this.dead) return;
      try{ if(this.lenis) this.lenis.raf(t); }catch(err){}
      try{ gsap.updateRoot(t/1000); }catch(err){}
      // A.1 velocity bus: one smoothed source, relaxes to 0 within ~500ms of stopping
      this._velTarget*=0.86;
      this.velBus += (this._velTarget-this.velBus)*0.12;
      if(Math.abs(this.velBus)<0.0008) this.velBus=0;
      this.velAbs=Math.abs(this.velBus);
      de.style.setProperty('--vel', this.velBus.toFixed(4));
      de.style.setProperty('--velabs', this.velAbs.toFixed(4));
      try{ (this._fx||[]).forEach(f=>f(t)); }catch(err){}
      requestAnimationFrame(master);
    };
    requestAnimationFrame(master);
    // anchor smooth scroll
    this.q('a[href^="#"]').forEach(a=>a.addEventListener('click',(e)=>{ const id=a.getAttribute('href'); if(!id||id.length<2||a.hasAttribute('data-top')){ if(id==='#') e.preventDefault(); return; } const t=this.one(id) || document.querySelector(id); if(t){ e.preventDefault(); if(this.lenis) this.lenis.scrollTo(t,{offset:-104}); else window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-90,behavior:'smooth'}); } }));

    this.setupSlot();
    this.setupProgress();
    this.setupFooterReveal();
    this.setupNav();
    if(this.RM){ this.staticReveal(); this.fallback(); }
    else { this.preloader(); }
    this.setupHeroParallax();
    this.setupRibbons();
    this.setupManifesto();
    this.setupStats();
    this.setupCards();
    this.setupHueDrift();
    this.setupCardIds();
    this.setupLog();
    this.setupLogTooltips();
    this.setupPipeline();
    this.setupRules();
    this.setupTicker();
    this.setupBento();
    this.setupShowcase();
    this.setupStory();
    this.setupHoverLang();
    this.setupReveal();
    this.setupAskHow();
    if(!this.TOUCH){ this.setupCursor(); this.setupMagnetics(); this.setupTilt(); this.setupExpHover(); this.setupCardFX(); }
    else { this.setupExpHover(); }
    this.setupScramble();
    this.setupCopyEmail();
    this.setupBackToTop();
    this.setupAurora();
    this.setupSims();
    this.setupPhase();
    this.setupPalette();
    this.setupCharge();
    this.setupVelSkew();
    this.setupSound();
    this.setupWeeks();
    this.setupMaskWipes();
    this.setupCardPunctuation();
    this.setupParty();
    ST.refresh();
  }

  staticReveal(){ const g=this.gsap; this.q('[data-hero-el],[data-hero-content]').forEach(e=>g.set(e,{opacity:1,y:0})); }

  // 1. Preloader
  preloader(){
    const g=this.gsap; const panel=this.one('[data-preloader]'); const track=this.one('[data-pre-track]'); const count=this.one('[data-pre-count]');
    if(!panel){ return; }
    if(this.lenis) this.lenis.stop();
    const lineH = track.children[0].getBoundingClientRect().height;
    const tl=g.timeline({ onComplete:()=>{ if(this.lenis) this.lenis.start(); this.heroEntrance(); } });
    const counter={v:0};
    tl.to(counter,{ v:100, duration:2.2, ease:'none', onUpdate:()=>{ count.textContent=String(Math.round(counter.v)).padStart(3,'0'); } },0);
    for(let i=1;i<track.children.length;i++){
      tl.to(track,{ y:-lineH*i, duration:.5, ease:'cubic-bezier(.76,0,.24,1)' }, .1 + i*0.42);
    }
    tl.to(panel,{ yPercent:-100, duration:.9, ease:'expo.inOut' }, '+=0.35');
    tl.set(panel,{ display:'none' });
  }

  // 2. Hero entrance
  heroEntrance(){
    const g=this.gsap;
    // split chars
    this.q('[data-hero-h1] [data-split]').forEach(el=>{
      const text=el.textContent; el.textContent='';
      el.style.display = el.tagName==='SPAN' && el.parentElement.style.display==='block' ? el.style.display : el.style.display;
      [...text].forEach(ch=>{
        const wrap=document.createElement('span'); wrap.style.cssText='display:inline-block;overflow:hidden;vertical-align:bottom;';
        const inner=document.createElement('span'); inner.style.cssText='display:inline-block;will-change:transform;'; inner.textContent= ch===' '? '\u00A0':ch;
        wrap.appendChild(inner); el.appendChild(wrap);
      });
    });
    const chars=this.q('[data-hero-h1] [data-split] span span');
    g.set(chars,{ yPercent:115, rotate:6 });
    const slot=this.one('[data-slot]'); g.set(slot,{ opacity:0, y:20 });
    const els=this.q('[data-hero-el]'); g.set(els,{ opacity:0, y:24 });
    const giant=this.one('[data-giant-name]'); g.set(giant,{ opacity:0, yPercent:18 });

    const tl=g.timeline();
    tl.to(chars,{ yPercent:0, rotate:0, duration:1.05, ease:'expo.out', stagger:0.016 })
      .to(slot,{ opacity:1, y:0, duration:.7, ease:'expo.out' },'-=0.7')
      .to(els,{ opacity:1, y:0, duration:.9, ease:'expo.out', stagger:0.08 },'-=0.6')
      .to(giant,{ opacity:1, yPercent:0, duration:1.2, ease:'expo.out' },'-=0.8');
    // E.5 — load hands off into the charge effect as one settling ripple, after the char-rise
    if(!this.RM){ tl.eventCallback('onComplete',()=>{ this._velTarget=0.9; }); }
    this.startSlot();
  }

  // 3. Slot verb
  setupSlot(){
    this.slotTrack=this.one('[data-slot-track]'); this.slotClip=this.one('[data-slot]');
    const measure=()=>{ if(!this.slotTrack||!this.slotTrack.children.length) return; const h=this.slotTrack.children[0].getBoundingClientRect().height; this.slotLineH=h; this.slotClip.style.height=h+'px'; };
    measure(); this._slotMeasure=measure;
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>{ measure(); });
    window.addEventListener('resize',measure);
    if(this.slotClip && !this.RM){
      this.slotClip.style.cursor='pointer';
      this.slotClip.addEventListener('click',()=>{
        if(!this.gsap) return;
        this.advanceSlot(true);
        if(this._slotIv){ clearInterval(this._slotIv); this._slotIv=setInterval(()=>this.advanceSlot(false),2500); }
      });
    }
  }
  advanceSlot(springy){
    const g=this.gsap; if(!g||!this.slotTrack||!this.slotLineH) return;
    const n=this.slotTrack.children.length-1;
    this.slotI=(this.slotI||0)+1;
    g.to(this.slotTrack,{ y:-this.slotLineH*this.slotI, duration:springy?.55:.7, ease:springy?'back.out(1.6)':'cubic-bezier(.76,0,.24,1)', overwrite:true, onComplete:()=>{ if(this.slotI>=n){ this.slotI=0; g.set(this.slotTrack,{ y:0 }); } } });
    if(springy){
      const w=this.slotTrack.children[Math.min(this.slotI,n)];
      const dot=w && w.querySelector('[data-dot]');
      if(dot){ g.fromTo(dot,{ scale:1 },{ scale:1.55, duration:.13, yoyo:true, repeat:1, ease:'power2.out' }); }
    }
  }
  startSlot(){
    if(this.RM || !this.slotTrack) return;
    this.slotI=0;
    this._slotIv=setInterval(()=>this.advanceSlot(false),2500);
  }

  // 4. Hero / giant name parallax
  setupHeroParallax(){
    if(this.RM) return; const g=this.gsap, ST=this.ST;
    const hero=this.q('section')[0]; const content=this.one('[data-hero-content]'); const giant=this.one('[data-giant-name]');
    g.to(content,{ yPercent:-12, opacity:.3, ease:'none', scrollTrigger:{ trigger:hero, start:'top top', end:'bottom top', scrub:true } });
    g.to(giant,{ yPercent:22, ease:'none', scrollTrigger:{ trigger:hero, start:'top top', end:'bottom top', scrub:true } });
  }

  // 5. Custom cursor
  setupCursor(){
    const dot=this.one('[data-cursor-dot]'), ring=this.one('[data-cursor-ring]'), label=this.one('[data-cursor-label]');
    if(!dot) return; const g=this.gsap;
    // park off-screen and stay invisible until the pointer actually moves (no dark dot stranded at 0,0)
    g.set([dot,ring],{ x:-100, y:-100, opacity:0 });
    this._ring=ring; this._ringLabel=label;
    const rx=g.quickTo(ring,'x',{duration:.35,ease:'power3'}), ry=g.quickTo(ring,'y',{duration:.35,ease:'power3'});
    const dx=g.quickTo(dot,'x',{duration:.05}), dy=g.quickTo(dot,'y',{duration:.05});
    let shown=false;
    window.addEventListener('mousemove',e=>{ if(!shown){ shown=true; g.set([dot,ring],{ x:e.clientX, y:e.clientY }); g.to([dot,ring],{ opacity:1, duration:.25 }); } rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); });
    window.addEventListener('mouseleave',()=>{ g.to([dot,ring],{ opacity:0, duration:.25 }); shown=false; });
    const grow=()=>g.to(ring,{ scale:1.7, duration:.3 }), shrink=()=>g.to(ring,{ scale:1, duration:.3 });
    this.q('a,button,[data-magnetic]').forEach(el=>{ el.addEventListener('mouseenter',grow); el.addEventListener('mouseleave',shrink); });
    this.q('[data-card]').forEach(card=>{
      card.addEventListener('mouseenter',()=>{ label.textContent='explore'; g.to(ring,{ scale:2.4, duration:.3, background:'#0D0D12', borderColor:'#0D0D12' }); label.style.opacity=1; });
      card.addEventListener('mouseleave',()=>{ g.to(ring,{ scale:1, duration:.3, background:'rgba(0,0,0,0)', borderColor:'#0D0D12' }); label.style.opacity=0; });
    });
    if(this.slotClip){
      this.slotClip.addEventListener('mouseenter',()=>{ label.textContent='roll'; g.to(ring,{ scale:2.1, duration:.3, background:'#0D0D12', borderColor:'#0D0D12' }); label.style.opacity=1; });
      this.slotClip.addEventListener('mouseleave',()=>{ g.to(ring,{ scale:1, duration:.3, background:'rgba(0,0,0,0)', borderColor:'#0D0D12' }); label.style.opacity=0; });
    }
  }

  // 6. Velocity ribbons
  setupRibbons(){
    if(this.RM) return; const g=this.gsap;
    this.q('[data-ribbon]').forEach(rib=>{
      const track=rib.querySelector('[data-ribbon-track]');
      const original=track.children[0];
      for(let i=0;i<3;i++){ track.appendChild(original.cloneNode(true)); }
      const dir = track.getAttribute('data-dir')==='-1' ? -1 : 1;
      let half = original.getBoundingClientRect().width;
      const remeasure=()=>{ half=original.getBoundingClientRect().width; };
      window.addEventListener('resize',remeasure);
      if(document.fonts&&document.fonts.ready) document.fonts.ready.then(remeasure);
      let x = 0; const base = (rib.getAttribute('data-ribbon')==='2'? 95:75) * dir;
      let lt = 0, mult = 1, multT = 1;
      rib.addEventListener('mouseenter',()=>{ multT=.3; });
      rib.addEventListener('mouseleave',()=>{ multT=1; });
      track.addEventListener('mouseover',(e)=>{ const s=e.target.closest('[data-mq]'); if(s) s.style.color=s.getAttribute('data-mq'); });
      track.addEventListener('mouseout',(e)=>{ const s=e.target.closest('[data-mq]'); if(s) s.style.color=s.hasAttribute('data-stroke')?'transparent':''; });
      const loop=(t)=>{
        if(this.dead) return;
        const dt = lt? Math.min(0.05,(t-lt)/1000) : 0.016; lt=t;
        const v = (this.velBus||0)*38;
        mult += (multT-mult)*0.08;
        const speed = (base + dir*Math.abs(v)*14) * mult;
        x -= speed*dt;
        if(half>0){ if(x<=-half) x+=half; if(x>=0) x-=half; }
        const skew = Math.max(-7,Math.min(7, -v*0.9));
        track.style.transform = 'translate3d('+x+'px,0,0) skewX('+skew+'deg)';
        this.rafs.push(requestAnimationFrame(loop));
      };
      this.rafs.push(requestAnimationFrame(loop));
    });
  }

  // 7. Manifesto scroll-fill
  setupManifesto(){
    const g=this.gsap, ST=this.ST; const p=this.one('[data-manifesto]'); if(!p) return;
    const units=[];
    const walk=(node)=>{
      [...node.childNodes].forEach(n=>{
        if(n.nodeType===3){
          const words=n.textContent.split(/(\s+)/);
          const frag=document.createDocumentFragment();
          words.forEach(w=>{ if(w.trim()===''){ frag.appendChild(document.createTextNode(w)); } else { const s=document.createElement('span'); s.textContent=w; s.style.display='inline-block'; frag.appendChild(s); units.push(s); } });
          node.replaceChild(frag,n);
        } else if(n.nodeType===1){ n.style.display='inline-block'; units.push(n); }
      });
    };
    walk(p);
    if(this.RM){ units.forEach(u=>u.style.opacity=1); return; }
    units.forEach(u=>u.style.opacity=0.13);
    g.to(units,{ opacity:1, ease:'none', stagger:{ each:0.4 }, scrollTrigger:{ trigger:p, start:'top 78%', end:'bottom 55%', scrub:0.6 } });
  }

  // 8. Stats
  setupStats(){
    const g=this.gsap, ST=this.ST;
    this.q('[data-stats] [data-count]').forEach((el,i)=>{
      const to=parseInt(el.getAttribute('data-to'),10), suf=el.getAttribute('data-suffix')||'';
      const pre = suf.startsWith('/') ? '' : '';
      const tick=el.parentElement.querySelector('[data-tick]');
      ST.create({ trigger:el, start:'top 85%', once:true, onEnter:()=>{
        if(this.RM){ el.textContent=to+suf; if(tick) tick.style.transform='scaleY(1)'; return; }
        if(tick) g.to(tick,{ scaleY:1, duration:.8, ease:'expo.out' });
        const o={v:0}; g.to(o,{ v:to, duration:1.6, ease:'expo.out', onUpdate:()=>{ el.textContent=Math.round(o.v)+suf; } });
      }});
    });
  }

  // 9. Stacking cards
  setupCards(){
    if(this.RM) return; const g=this.gsap, ST=this.ST;
    const cards=this.q('[data-card]');
    cards.forEach((card,i)=>{
      const inner=card.firstElementChild;
      if(i<cards.length-1){
        const next=cards[i+1];
        g.to(inner,{ scale:.94, filter:'brightness(.965)', ease:'none', transformOrigin:'top center', scrollTrigger:{ trigger:next, start:'top bottom', end:'top top+=120', scrub:true } });
      }
      const ghost=card.querySelector('[data-ghost]');
      if(ghost){ card.addEventListener('mousemove',(e)=>{ const r=card.getBoundingClientRect(); const dx=(e.clientX-r.left-r.width/2)/r.width; g.to(ghost,{ x:dx*30, y:(e.clientY-r.top-r.height/2)/r.height*20, duration:.6 }); }); card.addEventListener('mouseleave',()=>g.to(ghost,{x:0,y:0,duration:.8})); }
    });
  }

  // 10. Experience hover
  setupExpHover(){
    const g=this.gsap;
    this.q('[data-exp-row]').forEach(row=>{
      const bar=row.querySelector('[data-exp-bar]');
      row.addEventListener('mouseenter',()=>{ if(!this.TOUCH){ row.style.transform='translateX(14px)'; row.style.background='#FBFAF7'; } bar.style.transform='scaleY(1)'; });
      row.addEventListener('mouseleave',()=>{ row.style.transform='translateX(0)'; row.style.background='transparent'; bar.style.transform='scaleY(0)'; });
    });
  }

  // 12. Honors tilt
  setupTilt(){
    const g=this.gsap;
    this.q('[data-tilt]').forEach(card=>{
      card.addEventListener('mousemove',(e)=>{ const r=card.getBoundingClientRect(); const px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5; g.to(card,{ rotationY:px*9, rotationX:-py*9, transformPerspective:800, duration:.4, ease:'power2.out' }); });
      card.addEventListener('mouseleave',()=>{ g.to(card,{ rotationX:0, rotationY:0, duration:.7, ease:'elastic.out(1,.5)' }); });
    });
  }

  // v10 STEP 4.3 — gentle per-zone paper tint, driven off the same accents (one color story)
  setupHueDrift(){
    const g=this.gsap, ST=this.ST; const main=this.one('[data-main]'); if(!main||this.RM) return;
    const tint=(hex,amt)=>{ const n=parseInt(hex.slice(1),16), r=n>>16,gn=(n>>8)&255,b=n&255; const mix=(c)=>Math.round(c*amt+251*(1-amt)); return 'rgb('+mix(r)+','+mix(gn)+','+mix(b)+')'; };
    this.q('section[data-accent]').forEach(s=>{
      const acc=s.getAttribute('data-accent'); if(s.getAttribute('data-screen-label')==='Hero') return;
      const to=tint(acc,0.045);
      ST.create({ trigger:s, start:'top 62%', end:'bottom 38%',
        onEnter:()=>g.to(main,{ backgroundColor:to, duration:.7, overwrite:'auto' }),
        onEnterBack:()=>g.to(main,{ backgroundColor:to, duration:.7, overwrite:'auto' }),
        onLeave:()=>g.to(main,{ backgroundColor:'#FBFAF7', duration:.7, overwrite:'auto' }),
        onLeaveBack:()=>g.to(main,{ backgroundColor:'#FBFAF7', duration:.7, overwrite:'auto' }) });
    });
  }

  // 14. Footer reveal
  setupFooterReveal(){
    const g=this.gsap, ST=this.ST; const main=this.one('[data-main]'); const footer=this.one('[data-footer]'); const giant=this.one('[data-foot-giant]'); const headline=this.one('[data-foot-headline]');
    const apply=()=>{
      const fh=footer.getBoundingClientRect().height;
      if(this.RM || window.innerWidth<=520 || fh > window.innerHeight*0.96){
        main.style.marginBottom='0'; footer.style.position='relative'; footer.style.zIndex='1';
        if(main.nextElementSibling!==footer) main.after(footer); // #1: footer follows the hero in normal flow (mobile / reduced-motion / short viewports)
        return;
      }
      footer.style.position='fixed';
      main.style.marginBottom=fh+'px';
      main.style.borderBottomLeftRadius='22px'; main.style.borderBottomRightRadius='22px';
      main.style.boxShadow='0 26px 64px rgba(13,13,18,.11)';
      if(this.ST){ ST.create({ trigger:main, start:'bottom bottom', end:'bottom top', scrub:true, onUpdate:(self)=>{ if(giant) giant.style.transform='translateY('+(1-self.progress)*40+'%)'; } }); }
    };
    apply(); window.addEventListener('resize',()=>{ if(this.ST) ST.refresh(); });
    // headline per-letter roll on hover
    if(headline && !this.TOUCH){
      const txt=headline.textContent; headline.textContent='';
      [...txt].forEach(ch=>{ const w=document.createElement('span'); w.style.cssText='display:inline-block;overflow:hidden;vertical-align:bottom;'; const inner=document.createElement('span'); inner.style.cssText='display:inline-block;transition:transform .4s cubic-bezier(.76,0,.24,1);'; inner.textContent= ch===' '?'\u00A0':ch; w.appendChild(inner); headline.appendChild(w); });
      const inners=headline.querySelectorAll('span span');
      headline.addEventListener('mouseenter',()=>{ inners.forEach((s,i)=>setTimeout(()=>{ s.style.transform='translateY(-100%)'; setTimeout(()=>{ s.style.transition='none'; s.style.transform='translateY(100%)'; requestAnimationFrame(()=>{ s.style.transition='transform .4s cubic-bezier(.76,0,.24,1)'; s.style.transform='translateY(0)'; }); },220); }, i*14)); });
    }
  }

  // 16. Nav hide/show
  setupNav(){
    const nav=this.one('[data-nav]'); if(!nav) return; let last=0;
    const handler=(y)=>{ if(y>500 && y>last){ nav.style.transform='translateX(-50%) translateY(-150%)'; } else { nav.style.transform='translateX(-50%) translateY(0)'; } last=y; };
    nav.style.transition='transform .5s cubic-bezier(.76,0,.24,1),background .35s ease';
    if(this.lenis){ this.lenis.on('scroll',(e)=>handler(e.scroll)); }
    else { window.addEventListener('scroll',()=>handler(window.scrollY)); }
    const cta=nav.querySelector('[data-cta]');
    if(cta){ cta.addEventListener('mouseenter',()=>cta.style.background='#2438FF'); cta.addEventListener('mouseleave',()=>cta.style.background='#0D0D12'); }
  }

  // 17. Magnetics (+v3 1.4: rotate toward cursor, squish on press)
  setupMagnetics(){
    const g=this.gsap;
    this.q('[data-magnetic]').forEach(el=>{
      const xTo=g.quickTo(el,'x',{duration:.4,ease:'power3'}), yTo=g.quickTo(el,'y',{duration:.4,ease:'power3'});
      const rTo=g.quickTo(el,'rotation',{duration:.4,ease:'power3'});
      el.addEventListener('mousemove',(e)=>{ const r=el.getBoundingClientRect(); const dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2); xTo(dx*0.25); yTo(dy*0.35); rTo(Math.max(-3,Math.min(3,dx/r.width*6))); });
      el.addEventListener('mouseleave',()=>{ xTo(0); yTo(0); rTo(0); });
      el.addEventListener('mousedown',()=>{ g.to(el,{ scale:.95, duration:.15, ease:'power2.out' }); });
      el.addEventListener('mouseup',()=>{ g.to(el,{ scale:1, duration:.7, ease:'elastic.out(1.2,.45)' }); });
    });
  }

  // v3 1.5 — scroll progress hairline
  // v10 STEP 4 — the through-line: one spine carrying each zone's accent + a recurring marker
  setupProgress(){
    const bar=this.one('[data-progress]'); if(!bar) return;
    bar.style.background='#2438FF';
    bar.style.transition='background-color .6s cubic-bezier(.76,0,.24,1)';
    const secs=this.q('section[data-accent]');
    // recurring motif: a small accent diamond before each section's eyebrow
    secs.forEach(s=>{
      const eb=s.querySelector('[data-scramble], [data-eyebrow]');
      if(eb && !eb.querySelector('[data-marker]')){
        const m=document.createElement('span'); m.setAttribute('data-marker','');
        m.style.cssText='display:inline-block;width:6px;height:6px;border-radius:1.5px;background:'+s.getAttribute('data-accent')+';margin-right:9px;vertical-align:middle;transform:rotate(45deg);';
        eb.insertBefore(m, eb.firstChild);
      }
    });
    const hexToRgb=(h)=>{ const n=parseInt(h.slice(1),16); return [n>>16,(n>>8)&255,n&255]; };
    let curRGB=hexToRgb('#2438FF'), tgt='#2438FF';
    const main=this.one('[data-main]');
    const upd=(y)=>{
      const max=document.documentElement.scrollHeight-window.innerHeight;
      bar.style.transform='scaleX('+(max>0?Math.min(1,Math.max(0,y/max)):0)+')';
      // which zone owns the viewport centre
      const mid=y+window.innerHeight*0.5; let best=secs[0];
      for(const s of secs){ const top=s.offsetTop, bot=top+s.offsetHeight; if(mid>=top && mid<bot){ best=s; break; } if(mid>=bot) best=s; }
      let acc=best?best.getAttribute('data-accent'):'#2438FF';
      // D.3 — inside Work, let the active project card own the spine colour
      if(best && best.getAttribute('data-screen-label')==='Work'){ for(const c of this.q('[data-card]')){ const r=c.getBoundingClientRect(); if(r.top<=window.innerHeight*0.5 && r.bottom>=window.innerHeight*0.5){ acc=c.getAttribute('data-accent')||acc; } } }
      if(acc!==tgt){ tgt=acc; bar.style.background=acc; if(this._marknow) this._marknow(acc); }
    };
    if(this.lenis) this.lenis.on('scroll',(e)=>upd(e.scroll));
    else window.addEventListener('scroll',()=>upd(window.scrollY),{passive:true});
    upd(window.scrollY||0);
  }

  // v3 1.6 — scramble-in mono labels (once per load)
  setupScramble(){
    const ST=this.ST; const CH='█▓▒░<>/*\\';
    if(!ST) return;
    this.q('[data-scramble]').forEach(el=>{
      if(this.RM) return;
      const orig=el.textContent;
      ST.create({ trigger:el, start:'top 88%', once:true, onEnter:()=>{
        const t0=performance.now(); const D=500;
        const tick=()=>{
          if(this.dead) return;
          const p=Math.min(1,(performance.now()-t0)/D); const n=Math.floor(orig.length*p);
          let s=orig.slice(0,n);
          for(let i=n;i<orig.length;i++){ s+= orig[i]===' '?' ':CH[Math.floor(Math.random()*CH.length)]; }
          el.textContent=s;
          if(p<1) requestAnimationFrame(tick); else el.textContent=orig;
        };
        tick();
      }});
    });
    const nav=this.one('[data-nav-clock]');
    if(nav && !this.RM){
      const t0=performance.now();
      const tick=()=>{ if(this.dead) return; const p=Math.min(1,(performance.now()-t0)/500); const n=Math.floor(3*p); let pre='BLR'.slice(0,n); for(let i=n;i<3;i++) pre+=CH[Math.floor(Math.random()*CH.length)]; nav.textContent=pre+nav.textContent.slice(3); if(p<1) requestAnimationFrame(tick); };
      tick();
    }
  }

  // v3 1.3 — email copy with feedback
  setupCopyEmail(){
    const link=this.one('a[href^="mailto:"]'); if(!link) return; const g=this.gsap;
    const hint=this.one('[data-copy-hint]');
    let last=0;
    link.addEventListener('click',(e)=>{
      const now=Date.now();
      if(now-last<3000){ last=0; return; }
      e.preventDefault(); last=now;
      try{ if(navigator.clipboard) navigator.clipboard.writeText('kunalsain0324@gmail.com'); }catch(err){}
      if(g && !this.RM){ g.fromTo(link,{ scale:.96 },{ scale:1, duration:.6, ease:'elastic.out(1,.4)', transformOrigin:'left center' }); }
      if(this._ringLabel && this._ring && g){
        this._ringLabel.textContent='copied ✓'; this._ringLabel.style.opacity=1;
        g.to(this._ring,{ scale:2.2, background:'#0D0D12', borderColor:'#FBFAF7', duration:.25 });
        setTimeout(()=>{ if(this._ringLabel) this._ringLabel.style.opacity=0; if(g&&this._ring) g.to(this._ring,{ scale:1, background:'rgba(0,0,0,0)', borderColor:'#0D0D12', duration:.3 }); },1200);
      }
      if(hint){ hint.style.opacity=1; setTimeout(()=>{ hint.style.opacity=0; },3000); }
      this.burst(e.clientX,e.clientY);
      if(this.beep) this.beep(587,0.5,0.06);
      setTimeout(()=>{ last=0; },3100);
    });
  }
  burst(x,y){
    if(this.RM || !this.gsap) return; const g=this.gsap;
    const colors=['#2438FF','#7A2BF5','#0CAF9B','#FFAA00'];
    for(let i=0;i<8;i++){
      const p=document.createElement('div');
      p.style.cssText='position:fixed;left:'+x+'px;top:'+y+'px;width:8px;height:8px;z-index:10005;pointer-events:none;background:'+colors[i%4]+';transform:rotate(45deg);';
      document.body.appendChild(p);
      const a=(i/8)*Math.PI*2 + Math.random()*.5;
      const d=40+Math.random()*55;
      g.to(p,{ x:Math.cos(a)*d, y:Math.sin(a)*d-22, rotation:'+=200', opacity:0, scale:.35, duration:.6, ease:'power2.out', onComplete:()=>p.remove() });
    }
  }

  // v3 1.10 — back to top
  setupBackToTop(){
    const btn=this.one('[data-top]'); if(!btn) return;
    btn.addEventListener('click',(e)=>{ e.preventDefault(); if(this.lenis) this.lenis.scrollTo(0,{ duration:2, easing:(t)=>1-Math.pow(1-t,4) }); else window.scrollTo({ top:0, behavior:'smooth' }); });
  }

  // v3 1.1 — card 3D depth + glare
  setupCardFX(){
    if(this.RM) return; const g=this.gsap;
    this.q('[data-card]').forEach(card=>{
      const inner=card.firstElementChild; if(!inner) return;
      card.style.perspective='1400px';
      const glare=inner.querySelector('[data-glare]');
      const left=inner.querySelector(':scope > div:not([data-glare])');
      const layers=[];
      const h3=inner.querySelector('h3'); if(h3) layers.push({ el:h3, d:40 });
      const stat=inner.querySelector('[data-plate] > div:last-child'); if(stat) layers.push({ el:stat, d:60 });
      if(left && left.children[3]) layers.push({ el:left.children[3], d:20 });
      card.addEventListener('mousemove',(e)=>{
        const r=card.getBoundingClientRect();
        const px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
        g.to(inner,{ rotationY:px*4, rotationX:-py*4, transformPerspective:1400, duration:.5, ease:'power2.out' });
        layers.forEach(L=>g.to(L.el,{ x:px*L.d*.5, y:py*L.d*.5, duration:.5, ease:'power2.out' }));
        if(glare){ glare.style.opacity=1; glare.style.background='radial-gradient(340px circle at '+(e.clientX-r.left)+'px '+(e.clientY-r.top)+'px, rgba(255,255,255,.10), transparent 62%)'; }
      });
      card.addEventListener('mouseleave',()=>{
        g.to(inner,{ rotationX:0, rotationY:0, duration:.8, ease:'elastic.out(1,.5)' });
        layers.forEach(L=>g.to(L.el,{ x:0, y:0, duration:.8, ease:'elastic.out(1,.5)' }));
        if(glare) glare.style.opacity=0;
      });
    });
  }

  // v7 E — the living aurora (5 canvas blobs, phase-aware, blooms toward cursor)
  setupAurora(){
    const holder=this.one('[data-hero-aurora]'); if(!holder) return;
    const cv=document.createElement('canvas');
    cv.setAttribute('data-aurora-canvas','');
    cv.style.cssText='position:absolute;inset:-8%;width:116%;height:116%;display:block;filter:blur(54px);opacity:.6;';
    let ctx=null;
    try{ ctx=cv.getContext('2d'); }catch(e){}
    if(!ctx) return; // canvas-fail -> paper stays as the static fallback
    holder.appendChild(cv);
    const RW=180, RH=110; cv.width=RW; cv.height=RH;
    const seeds=[0,1,2,3,4].map(()=>({ sx:Math.random()*7, sy:Math.random()*7, fx:.10+Math.random()*.09, fy:.08+Math.random()*.09, r:.32+Math.random()*.15, bloom:0 }));
    let mx=.5, my=.42;
    if(!this.TOUCH) window.addEventListener('mousemove',(e)=>{ const r=holder.getBoundingClientRect(); if(r.bottom<0||r.top>window.innerHeight) return; mx=(e.clientX-r.left)/Math.max(1,r.width); my=(e.clientY-r.top)/Math.max(1,r.height); });
    let vis=true; if('IntersectionObserver' in window) new IntersectionObserver(en=>{ vis=en[0].isIntersecting; }).observe(holder);
    const rgba=(h,a)=>{ const n=parseInt(h.slice(1),16); return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'; };
    const draw=(T)=>{
      ctx.clearRect(0,0,RW,RH);
      const cols=this._phaseAurora||['#2438FF','#7A2BF5','#0CAF9B','#FFAA00','#FBFAF7'];
      let nearest=0, nd=9;
      const pos=seeds.map((s)=>{ const x=.5+.42*Math.sin(s.sx+T*s.fx*6.28), y=.5+.4*Math.cos(s.sy+T*s.fy*6.28); const d=Math.hypot(x-mx,y-my); if(d<nd){ nd=d; nearest=seeds.indexOf(s); } return { x, y }; });
      seeds.forEach((s,i)=>{ const tg=(i===nearest&&!this.TOUCH)?1:0; s.bloom+=(tg-s.bloom)*.06; });
      seeds.forEach((s,i)=>{
        let x=pos[i].x+(mx-pos[i].x)*.16*s.bloom, y=pos[i].y+(my-pos[i].y)*.16*s.bloom;
        const rad=s.r*(1+.14*s.bloom)*RW;
        const gr=ctx.createRadialGradient(x*RW,y*RH,2,x*RW,y*RH,rad);
        gr.addColorStop(0,rgba(cols[i%cols.length],.5+.12*s.bloom));
        gr.addColorStop(1,rgba(cols[i%cols.length],0));
        ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(x*RW,y*RH,rad,0,6.3); ctx.fill();
      });
    };
    if(this.RM){ draw(.35); return; }
    let lt=0, T=Math.random()*4;
    this._fx=this._fx||[];
    this._fx.push((t)=>{ if(!vis||document.hidden) return; if(t-lt<33) return; T+=Math.min(.05,(t-lt)/1000)||.016; lt=t; draw(T); });
    draw(T);
  }

  // v3 Tier 3 — party mode (press K twice)
  setupParty(){
    if(this.RM) return;
    let lastK=0;
    window.addEventListener('keydown',(e)=>{
      if(this.dead) return;
      if((e.key||'').toLowerCase()!=='k') return;
      const now=Date.now();
      if(now-lastK<600){ lastK=0; this.party(); } else lastK=now;
    });
  }
  party(){
    const g=this.gsap; if(!g) return;
    const giant=this.one('[data-giant-name]');
    const colors=['#2438FF','#7A2BF5','#0CAF9B','#FFAA00','#FF4D5E'];
    let r= giant? giant.getBoundingClientRect() : null;
    if(!r || r.bottom<0 || r.top>window.innerHeight){ r={ left:window.innerWidth*.15, top:window.innerHeight*.45, width:window.innerWidth*.7, height:80 }; }
    for(let i=0;i<36;i++){
      const p=document.createElement('div'); const sz=6+Math.random()*8;
      p.style.cssText='position:fixed;z-index:10004;pointer-events:none;width:'+sz+'px;height:'+sz+'px;background:'+colors[i%5]+';transform:rotate(45deg);left:'+(r.left+Math.random()*r.width)+'px;top:'+(r.top+Math.random()*Math.max(40,r.height*.5))+'px;';
      document.body.appendChild(p);
      g.to(p,{ x:(Math.random()-.5)*320, y:-(120+Math.random()*220), rotation:'+='+Math.round(Math.random()*360), duration:.7, ease:'power2.out' });
      g.to(p,{ y:'+='+(300+Math.random()*220), opacity:0, duration:1.3, delay:.7, ease:'power1.in', onComplete:()=>p.remove() });
    }
    const logo=this.one('nav a[href="#top"]');
    if(logo){ logo.style.display='inline-block'; g.fromTo(logo,{ rotation:0 },{ rotation:360, duration:1, ease:'expo.inOut' }); }
  }

  // v3 Tier 3 — dynamic tab title
  setupTitle(){
    this._title=document.title || 'Kunal Kumar';
    document.addEventListener('visibilitychange',()=>{ if(this.dead) return; document.title = document.hidden ? '← still here. — Kunal' : this._title; });
  }

  // v4 — THE LOG (tail -f streaming)
  setupLog(){
    const panel=this.one('[data-log]'); if(!panel) return;
    const g=this.gsap;
    const lines=this.q('[data-log-line]');
    const cursor=this.one('[data-log-cursor]');
    if(cursor && !this.RM) cursor.style.animation='kk-blink 1s steps(1) infinite';
    if(this.RM){ lines.forEach(l=>{ l.style.opacity=1; }); this.armIdle(); return; }
    const now=lines[lines.length-1];
    const body=lines.slice(0,-1);
    g.set(lines,{ opacity:0, y:8 });
    let fired=false;
    const run=()=>{
      if(fired) return; fired=true;
      g.to(body,{ opacity:1, y:0, duration:.5, ease:'expo.out', stagger:0.09 });
      const delay=body.length*0.09 + 1.2;
      g.to(now,{ opacity:1, y:0, duration:.65, ease:'expo.out', delay });
      g.delayedCall(delay+0.4, ()=>this.armIdle());
    };
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver((en)=>{ if(en[0].isIntersecting){ run(); io.disconnect(); } },{ threshold:0.15 });
      io.observe(panel);
    } else { run(); }
  }
  armIdle(){
    if(this.RM || this.dead) return;
    try{ if(sessionStorage.getItem('kk_idle')) return; }catch(e){}
    let t; const reset=()=>{ clearTimeout(t); t=setTimeout(()=>this.idleLine(),30000); };
    ['mousemove','scroll','keydown','touchstart','wheel'].forEach(ev=>window.addEventListener(ev,reset,{passive:true}));
    reset();
  }
  idleLine(){
    if(this.dead) return;
    try{ if(sessionStorage.getItem('kk_idle')) return; sessionStorage.setItem('kk_idle','1'); }catch(e){}
    const box=this.one('[data-log-lines]'); const now=this.one('[data-log-now]'); if(!box||!now) return;
    const line=document.createElement('div');
    line.setAttribute('style', now.getAttribute('style'));
    line.innerHTML='<span style="color:rgba(251,250,247,.38);flex:none;width:72px;">[ now  ]</span><span style="width:6px;height:6px;border-radius:50%;background:#FFAA00;flex:none;align-self:center;"></span><span>still here? i like you already</span>';
    line.style.opacity='0'; box.appendChild(line);
    if(this.gsap) this.gsap.fromTo(line,{ opacity:0, y:8 },{ opacity:1, y:0, duration:.6, ease:'expo.out' }); else line.style.opacity='1';
  }

  // v4 — HOW I BUILD pipeline (traveling pulse)
  setupPipeline(){
    const pipe=this.one('[data-pipeline]'); if(!pipe) return;
    const g=this.gsap;
    const line=pipe.querySelector('[data-pipe-line]');
    const pulse=pipe.querySelector('[data-pulse]');
    const grid=pipe.querySelector('[data-pipe-grid]');
    const stages=Array.from(pipe.querySelectorAll('[data-stage]'));
    const titles=Array.from(pipe.querySelectorAll('[data-stage-title]'));
    const layout=()=>{
      const vert=window.innerWidth<760;
      if(vert){ grid.style.gridTemplateColumns='1fr'; grid.style.gap='clamp(26px,6vw,40px)'; line.style.cssText='position:absolute;left:4px;top:6px;bottom:6px;width:1.5px;background:rgba(251,250,247,.16);'; }
      else { grid.style.gridTemplateColumns='repeat(4,1fr)'; grid.style.gap='clamp(18px,3vw,40px)'; line.style.cssText='position:absolute;left:6%;right:6%;top:6px;height:1.5px;background:rgba(251,250,247,.16);'; }
      line.appendChild(pulse);
      return vert;
    };
    let vert=layout();
    window.addEventListener('resize',()=>{ vert=layout(); });
    titles.forEach(t=>{ t.style.opacity='.6'; });
    if(this.RM){ if(pulse) pulse.style.display='none'; titles.forEach(t=>t.style.opacity='1'); return; }
    const setProg=(p)=>{
      if(vert){ pulse.style.top=(p*100)+'%'; pulse.style.left='50%'; }
      else { pulse.style.left=(p*100)+'%'; pulse.style.top='50%'; }
      titles.forEach((t,i)=>{ const c=(i+0.5)/titles.length; const near=Math.max(0,1-Math.abs(p-c)*titles.length); t.style.opacity=String(0.55+0.45*near); const dot=t.querySelector('[data-stage-dot]'); if(dot) dot.style.boxShadow= near>0.5? '0 0 12px 2px '+dot.style.background : 'none'; });
    };
    const o={ p:0 };
    this._pipeTween=g.to(o,{ p:1, duration:6, ease:'none', repeat:-1, repeatDelay:0.3, onUpdate:()=>setProg(o.p) });
    if(!this.TOUCH){
      stages.forEach((st,i)=>{
        st.addEventListener('mouseenter',()=>{ this._pipeTween.pause(); st.style.transform='translateY(-2px)'; stages.forEach((s,j)=>{ s.style.opacity= j===i? '1':'.4'; }); const tt=st.querySelector('[data-stage-title]'); if(tt) tt.style.opacity='1'; const tl=st.querySelector('[data-stage-tools]'); if(tl) tl.style.color='rgba(251,250,247,.92)'; });
        st.addEventListener('mouseleave',()=>{ this._pipeTween.resume(); st.style.transform='translateY(0)'; stages.forEach(s=>{ s.style.opacity='1'; }); const tl=st.querySelector('[data-stage-tools]'); if(tl) tl.style.color='rgba(251,250,247,.5)'; });
      });
    }
  }

  // v7 C — living plates: one tiny engine, three scenes
  setupSims(){
    this._fx=this._fx||[];
    const sims=[]; const ACC={ recall:'#2438FF', triage:'#7A2BF5', watershed:'#0CAF9B' };
    this.q('canvas[data-sim]').forEach(cv=>{
      let ctx=null; try{ ctx=cv.getContext('2d'); }catch(e){}
      if(!ctx) return;
      const s={ kind:cv.getAttribute('data-sim'), cv, ctx, t:Math.random()*5, sp:1, tg:1, dt:.016, vis:false, lt:0, acc:ACC[cv.getAttribute('data-sim')], P:null };
      const size=()=>{ const r=cv.getBoundingClientRect(); const w=Math.max(60,Math.min(560,r.width|0)), h=Math.max(60,Math.min(420,r.height|0)); if(cv.width!==w||cv.height!==h){ cv.width=w; cv.height=h; s.P=null; } };
      size(); window.addEventListener('resize',size);
      if('IntersectionObserver' in window) new IntersectionObserver(en=>{ s.vis=en[0].isIntersecting; if(s.vis&&!cv.width) size(); }).observe(cv); else s.vis=true;
      const plate=cv.parentElement;
      if(!this.TOUCH && plate){
        plate.addEventListener('mouseenter',()=>{ s.tg=1.6; if(this._ringLabel) this._ringLabel.textContent='sim'; });
        plate.addEventListener('mouseleave',()=>{ s.tg=1; if(this._ringLabel) this._ringLabel.textContent='explore'; });
      }
      sims.push(s);
    });
    if(!sims.length) return;
    const draw=(s)=>{
      const ctx=s.ctx, w=s.cv.width, h=s.cv.height, t=s.t, acc=s.acc;
      ctx.clearRect(0,0,w,h);
      if(s.kind==='recall'){
        if(!s.P){ s.P=[]; const cols=8, rows=5, gw=w*.64, gh=h*.5, ox=(w-gw)/2, oy=(h-gh)/2; for(let i=0;i<40;i++){ const c=i%cols, r=(i/cols)|0; s.P.push({ hx:ox+c*(gw/(cols-1)), hy:oy+r*(gh/(rows-1)), a:Math.random()*6.28, b:Math.random()*6.28, f1:.25+Math.random()*.3, f2:.2+Math.random()*.3, amp:.16+Math.random()*.2 }); } }
        const ph=t%10; let A=0; if(ph>6&&ph<7) A=ph-6; else if(ph>=7&&ph<9.2) A=1; else if(ph>=9.2) A=1-(ph-9.2)/.8; A=A<0?0:A>1?1:A; const E=A*A*(3-2*A);
        s.P.forEach((p,i)=>{ const dx=Math.sin(p.a+t*p.f1)*w*p.amp, dy=Math.cos(p.b+t*p.f2)*h*p.amp; const x=p.hx+dx*(1-E), y=p.hy+dy*(1-E); ctx.globalAlpha=.5+.4*E; ctx.fillStyle= i%7===0? 'rgba(13,13,18,.6)' : acc; ctx.fillRect(x-4.5,y-3,9,6); });
        ctx.globalAlpha=1;
      } else if(s.kind==='triage'){
        if(!s.P){ s.P=[]; for(let i=0;i<64;i++) s.P.push({ x:Math.random()*w, y0:.15+Math.random()*.7, ln:i%5, v:.55+Math.random()*.5, sd:Math.random()*6.28 }); }
        const gate=w*.52;
        ctx.strokeStyle='rgba(13,13,18,.18)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(gate,h*.1); ctx.lineTo(gate,h*.9); ctx.stroke();
        s.P.forEach(p=>{
          p.x+=p.v*(w/8)*s.dt*3; if(p.x>w+8){ p.x=-8; p.y0=.15+Math.random()*.7; }
          let y; if(p.x<gate){ y=h*p.y0+Math.sin(p.sd+t*2.2+p.x*.04)*h*.13; }
          else { const f=Math.min(1,(p.x-gate)/(w*.2)); const laneY=h*(.2+p.ln*.15); const yn=h*p.y0+Math.sin(p.sd+t*2.2+gate*.04)*h*.13; y=yn+(laneY-yn)*(f*f*(3-2*f)); }
          ctx.globalAlpha= p.x<gate? .55 : .9; ctx.fillStyle= p.x<gate? 'rgba(13,13,18,.5)' : acc;
          ctx.beginPath(); ctx.arc(p.x,y,2.1,0,6.3); ctx.fill();
        });
        ctx.globalAlpha=1;
      } else {
        const total=h*.56, top0=(h-total)/2, N=28;
        let w1=.33+.17*Math.sin(t*.5), w2=.33+.17*Math.sin(t*.37+2.1), w3=1-w1-w2;
        if(w3<.12){ const d=.12-w3; w3=.12; w1-=d/2; w2-=d/2; }
        const fr=[w1,w2,w3], alph=[.6,.42,.3]; let yTop=top0;
        for(let b=0;b<3;b++){
          const bh=total*fr[b];
          ctx.fillStyle=acc; ctx.globalAlpha=alph[b]; ctx.beginPath();
          for(let i=0;i<=N;i++){ const x=i/N*w, yy=yTop+Math.sin(x*.025+t*1.1+b*1.7)*3; i===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy); }
          for(let i=N;i>=0;i--){ const x=i/N*w, yy=yTop+bh+Math.sin(x*.025+t*1.1+(b+1)*1.7)*3; ctx.lineTo(x,yy); }
          ctx.closePath(); ctx.fill();
          ctx.globalAlpha=alph[b]*.5; ctx.fillStyle='#FBFAF7';
          const off=(t*24*(b+1))%(w/3);
          for(let k=0;k<3;k++){ const sx=(k*(w/3)+off)%w; ctx.fillRect(sx,yTop+bh*.45,26,1.5); }
          yTop+=bh;
        }
        ctx.globalAlpha=1;
      }
    };
    if(this.RM){ sims.forEach(s=>{ s.t=3.2; draw(s); }); return; }
    this._fx.push((t)=>{
      sims.forEach(s=>{
        if(!s.vis||document.hidden) return;
        if(t-s.lt<33) return;
        const dt=Math.min(.05,(t-s.lt)/1000)||.016; s.lt=t;
        s.sp+=(s.tg-s.sp)*.08; s.dt=dt*s.sp; s.t+=s.dt;
        draw(s);
      });
    });
    sims.forEach(s=>draw(s));
  }

  // v7 D — the day cycle (the site lives in Bengaluru time)
  PHASES(){ return {
    dawn:{ paper:'#FDFBF4', aurora:['#FFAA00','#FF4D5E','#7A2BF5','#2438FF','#FBFAF7'], icon:'◖' },
    day:{ paper:'#FBFAF7', aurora:['#2438FF','#7A2BF5','#0CAF9B','#FFAA00','#FBFAF7'], icon:'☀' },
    dusk:{ paper:'#FAF8FA', aurora:['#7A2BF5','#2438FF','#FF4D5E','#0CAF9B','#FBFAF7'], icon:'◗' },
    night:{ paper:'#FBFAF7', aurora:['#2438FF','#7A2BF5','#0CAF9B','#FFAA00','#FBFAF7'], icon:'☾' }
  }; }
  phaseFor(h){ return (h>=5&&h<11)?'dawn':(h>=11&&h<17)?'day':(h>=17&&h<22)?'dusk':'night'; }
  setupPhase(){
    let mode='auto';
    try{
      const url=new URLSearchParams(location.search).get('phase');
      if(url && (url==='auto'||this.PHASES()[url])) mode=url;
      else { const sv=JSON.parse(localStorage.getItem('kk_phase')||'null'); if(sv && sv.v && sv.v!=='auto' && (Date.now()-sv.ts)<86400000) mode=sv.v; }
    }catch(e){}
    this._phaseMode=mode;
    this.applyPhase();
    const dial=this.one('[data-phase-dial]');
    if(dial) dial.addEventListener('click',()=>{
      const order=['auto','dawn','day','dusk','night'];
      this._phaseMode=order[(order.indexOf(this._phaseMode)+1)%order.length];
      try{ localStorage.setItem('kk_phase',JSON.stringify({ v:this._phaseMode, ts:Date.now() })); }catch(e){}
      this.applyPhase();
    });
    this._phaseIv=setInterval(()=>{ if(this.dead) return; if(this._phaseMode==='auto') this.applyPhase(); },60000);
  }
  cyclePhase(){ const d=this.one('[data-phase-dial]'); if(d) d.click(); }
  applyPhase(){
    const mode=this._phaseMode||'auto';
    let h=12; try{ h=parseInt(new Intl.DateTimeFormat('en-GB',{ timeZone:'Asia/Kolkata', hour:'2-digit', hour12:false }).format(new Date()),10); }catch(e){}
    const name= mode==='auto'? this.phaseFor(h) : (this.PHASES()[mode]? mode : 'day');
    if(name===this._phaseName) { this._syncDial(mode,name); return; }
    this._phaseName=name;
    const T=this.PHASES()[name];
    this._phaseAurora=T.aurora;
    this._syncDial(mode,name);
    const de=document.documentElement;
    const grain=this.one('[data-grain]');
    const counter=[this.one('[data-aurora-canvas]'), this.one('[data-story-canvas]')].concat(this.q('canvas[data-sim]'));
    if(name==='night'){
      de.style.filter='invert(1) hue-rotate(180deg)';
      de.style.background='#FBFAF7';
      if(grain){ grain.style.opacity='.3'; grain.style.filter='invert(1) hue-rotate(180deg)'; }
      counter.forEach(c=>{ if(c) c.style.filter=(c.hasAttribute('data-aurora-canvas')?'blur(54px) ':'')+'invert(1) hue-rotate(180deg)'; });
      this.nightLine(true);
    } else {
      de.style.filter='';
      de.style.background=T.paper;
      if(grain){ grain.style.opacity='.45'; grain.style.filter=''; }
      counter.forEach(c=>{ if(c) c.style.filter= c.hasAttribute('data-aurora-canvas')?'blur(54px)':''; });
      this.nightLine(false);
      const main=this.one('[data-main]');
      if(main){ if(this.gsap&&!this.RM) this.gsap.to(main,{ backgroundColor:T.paper, duration:.8 }); else main.style.backgroundColor=T.paper; }
    }
  }
  _syncDial(mode,name){ const d=this.one('[data-phase-dial]'); if(!d) return; d.textContent= mode==='auto'? this.PHASES()[name].icon : this.PHASES()[name].icon; d.title='phase: '+name+(mode==='auto'?' (auto — click to set)':' (manual — click to cycle, ends at auto)'); }
  nightLine(on){
    const box=this.one('[data-log-lines]'); if(!box) return;
    let l=box.querySelector('[data-night-line]');
    if(on && !l){
      const now=box.querySelector('[data-log-now]'); if(!now) return;
      l=document.createElement('div'); l.setAttribute('data-night-line','');
      l.setAttribute('style',now.getAttribute('style')); l.style.opacity='1'; l.style.transform='none';
      l.innerHTML='<span style="color:rgba(251,250,247,.38);flex:none;width:72px;">[ now  ]</span><span style="width:6px;height:6px;border-radius:50%;background:#FFAA00;flex:none;align-self:center;"></span><span>night shift.</span>';
      box.appendChild(l);
    } else if(!on && l) l.remove();
  }

  // v7 F — kunal.cmd (the ⌘k command palette)
  setupPalette(){
    const acts=[
      ['go','hero','#2438FF',()=>this.goAnchor('#top')],
      ['go','work','#2438FF',()=>this.goAnchor('#work')],
      ['go','log','#2438FF',()=>this.goAnchor('#log')],
      ['go','how i build','#2438FF',()=>this.goAnchor('#stack')],
      ['go','elsewhere','#2438FF',()=>this.goAnchor('#elsewhere')],
      ['go','contact','#2438FF',()=>this.goAnchor('#contact')],
      ['do','copy email','#0CAF9B',()=>{ try{ if(navigator.clipboard) navigator.clipboard.writeText('kunalsain0324@gmail.com'); }catch(e){} this.burst(window.innerWidth/2,window.innerHeight*.4); }],
      ['do','download résumé','#0CAF9B',()=>window.open('kunal-kumar-resume.pdf','_blank')],
      ['do','open github','#0CAF9B',()=>window.open('https://github.com/kunalKumar-13','_blank')],
      ['do','open linkedin','#0CAF9B',()=>window.open('https://linkedin.com/in/sainkunal','_blank')],
      ['play','cycle phase ☀ ☾','#FFAA00',()=>this.cyclePhase()],
      ['play','spin the verb','#FFAA00',()=>this.advanceSlot(true)],
      ['play','party mode','#FFAA00',()=>this.party()]
    ];
    const sheet=this.TOUCH;
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;z-index:10010;background:rgba(13,13,18,.34);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:none;opacity:0;';
    const panel=document.createElement('div');
    panel.style.cssText='position:absolute;'+(sheet?'left:0;right:0;bottom:0;border-radius:22px 22px 0 0;':'left:50%;top:16vh;transform:translateX(-50%);width:min(92vw,560px);border-radius:22px;')+'background:#FBFAF7;border:1px solid rgba(13,13,18,.14);box-shadow:0 26px 64px rgba(13,13,18,.11);overflow:hidden;';
    const inp=document.createElement('input');
    inp.placeholder='type a command…'; inp.setAttribute('aria-label','command');
    inp.style.cssText="width:100%;box-sizing:border-box;padding:17px 20px;border:none;outline:none;background:transparent;font-family:'JetBrains Mono',monospace;font-size:14px;color:#0D0D12;border-bottom:1px solid rgba(13,13,18,.12);";
    const list=document.createElement('div');
    list.style.cssText='max-height:46vh;overflow-y:auto;padding:8px;';
    panel.appendChild(inp); panel.appendChild(list); ov.appendChild(panel); document.body.appendChild(ov);
    let rows=[], sel=0, open=false;
    const fuzzy=(q,str)=>{ q=q.toLowerCase(); str=str.toLowerCase(); let i=0; for(const ch of q){ i=str.indexOf(ch,i); if(i<0) return false; i++; } return true; };
    const paint=()=>{ rows.forEach((r,i)=>{ r.style.background= i===sel? 'rgba(13,13,18,.06)':'transparent'; }); const r=rows[sel]; if(r) list.scrollTop=Math.max(0,r.offsetTop-150); };
    const render=()=>{
      const qv=inp.value.trim();
      const vis=acts.filter(a=>!qv||fuzzy(qv,a[0]+' '+a[1]));
      list.innerHTML=''; rows=[]; let lastG='';
      vis.forEach(a=>{
        if(a[0]!==lastG){ lastG=a[0]; const gh=document.createElement('div'); gh.textContent=a[0]; gh.style.cssText="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;color:#9a9aa3;padding:10px 14px 4px;"; list.appendChild(gh); }
        const row=document.createElement('div'); row.setAttribute('role','option');
        row.style.cssText="display:flex;align-items:center;gap:11px;padding:11px 14px;border-radius:12px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:13px;color:#0D0D12;transition:background .2s ease;";
        const dot=document.createElement('span'); dot.style.cssText='width:7px;height:7px;border-radius:50%;background:'+a[2]+';flex:none;';
        row.appendChild(dot); row.appendChild(document.createTextNode(a[1]));
        row.addEventListener('mouseenter',()=>{ sel=rows.indexOf(row); paint(); });
        row.addEventListener('click',()=>run(rows.indexOf(row)));
        row._act=a; list.appendChild(row); rows.push(row);
      });
      sel=0; paint();
    };
    const run=(i)=>{ const r=rows[i]; if(!r) return; close(); setTimeout(()=>{ try{ r._act[3](); }catch(e){} },140); };
    const openFn=()=>{
      if(open) return; open=true;
      ov.style.display='block'; inp.value=''; render();
      if(this.lenis) this.lenis.stop(); document.body.style.overflow='hidden';
      const g=this.gsap;
      if(g&&!this.RM){ g.fromTo(ov,{ opacity:0 },{ opacity:1, duration:.25, ease:'expo.out' }); g.fromTo(panel, sheet?{ y:46 }:{ y:14, scale:.985 },{ y:0, scale:1, duration:.25, ease:'expo.out' }); }
      else ov.style.opacity=1;
      setTimeout(()=>inp.focus(),40);
    };
    const close=()=>{
      if(!open) return; open=false;
      const fin=()=>{ ov.style.display='none'; };
      const g=this.gsap;
      if(g&&!this.RM) g.to(ov,{ opacity:0, duration:.2, ease:'expo.in', onComplete:fin }); else { ov.style.opacity=0; fin(); }
      if(this.lenis) this.lenis.start(); document.body.style.overflow='';
    };
    this.openPalette=openFn;
    ov.addEventListener('click',(e)=>{ if(e.target===ov) close(); });
    inp.addEventListener('input',render);
    inp.addEventListener('keydown',(e)=>{
      if(e.key==='ArrowDown'){ e.preventDefault(); sel=Math.min(sel+1,rows.length-1); paint(); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); sel=Math.max(sel-1,0); paint(); }
      else if(e.key==='Enter'){ e.preventDefault(); run(sel); }
      else if(e.key==='Escape'){ e.preventDefault(); close(); }
      else if(e.key==='Tab'){ e.preventDefault(); }
    });
    window.addEventListener('keydown',(e)=>{ if((e.metaKey||e.ctrlKey)&&(e.key==='k'||e.key==='K')){ e.preventDefault(); open? close() : openFn(); } });
    const chip=this.one('[data-cmdk]');
    if(chip){
      chip.addEventListener('click',openFn);
      try{ if(!localStorage.getItem('kk_cmd_seen')){ localStorage.setItem('kk_cmd_seen','1'); setTimeout(()=>{ if(this.gsap&&!this.RM&&!this.dead) this.gsap.fromTo(chip,{ scale:1 },{ scale:1.16, duration:.3, yoyo:true, repeat:3, ease:'sine.inOut' }); },3000); } }catch(e){}
    }
    const logo=this.one('nav a[href="#top"]');
    if(logo && this.TOUCH){ let tmr; logo.addEventListener('touchstart',()=>{ tmr=setTimeout(openFn,550); },{ passive:true }); logo.addEventListener('touchend',()=>clearTimeout(tmr)); }
  }
  goAnchor(sel){ const t=this.one(sel)||document.querySelector(sel); if(!t) return; if(this.lenis) this.lenis.scrollTo(t,{ offset:-104 }); else window.scrollTo({ top:t.getBoundingClientRect().top+window.scrollY-104, behavior:'smooth' }); }

  // v9 2.5 — "ask me how" opens the palette to the build/play story
  setupAskHow(){ const b=this.one('[data-ask-how]'); if(b) b.addEventListener('click',()=>{ if(this.openPalette) this.openPalette(); }); }

  // v5 — card ids (kept: deep-linkable projects)
  setupCardIds(){ const ids=['proj-recall','proj-triage','proj-watershed']; const acc=['#2438FF','#7A2BF5','#0CAF9B']; this.q('[data-card]').forEach((c,i)=>{ if(ids[i]) c.id=ids[i]; if(acc[i]) c.setAttribute('data-accent',acc[i]); }); }

  // v5 C — line choreography (draw-in rules)
  setupRules(){
    const mk=(parent,pos,color)=>{ const s=document.createElement('span'); s.setAttribute('data-rule',''); s.style.cssText='position:absolute;left:0;'+pos+';width:100%;height:1px;background:'+color+';transform:scaleX(0);transform-origin:left center;display:block;pointer-events:none;z-index:0;'; if(getComputedStyle(parent).position==='static') parent.style.position='relative'; parent.appendChild(s); return s; };
    const rules=[];
    this.q('[data-ribbon]').forEach(r=>{ r.style.borderTop='none'; r.style.borderBottom='none'; rules.push(mk(r,'top:0','rgba(13,13,18,.1)')); rules.push(mk(r,'bottom:0','rgba(13,13,18,.1)')); });
    const xl=this.one('[data-exp-list]'); if(xl){ xl.style.borderTop='none'; rules.push(mk(xl,'top:0','rgba(13,13,18,.14)')); }
    this.q('[data-exp-row]').forEach(row=>{ row.style.borderBottom='none'; rules.push(mk(row,'bottom:0','rgba(13,13,18,.14)')); });
    const tick=this.rootEl.querySelector('[data-hero-el] span[style*="width:24px"]'); if(tick){ tick.style.transform='scaleX(0)'; tick.style.transformOrigin='left center'; rules.push(tick); }
    if(this.RM){ rules.forEach(r=>r.style.transform='scaleX(1)'); return; }
    const g=this.gsap;
    if('IntersectionObserver' in window){
      const seen=new Set();
      const io=new IntersectionObserver((ents)=>{ ents.filter(e=>e.isIntersecting && !seen.has(e.target)).forEach((e,i)=>{ seen.add(e.target); g.to(e.target,{ scaleX:1, duration:.9, ease:'expo.out', delay:i*0.08 }); io.unobserve(e.target); }); },{ threshold:0.6 });
      rules.forEach(r=>io.observe(r));
    } else rules.forEach(r=>g.set(r,{scaleX:1}));
  }

  // v6 A — clean Log + hover commit tooltips (the one v5 survivor)
  setupLogTooltips(){
    const box=this.one('[data-log-lines]'), panel=this.one('[data-log]'); if(!box||!panel) return;
    if(this.TOUCH) return;
    const lines=this.q('[data-log-line]');
    const COMMITS=['a1c0de · feat(community): join hack club · +3 events','b2f4a7 · chore(events): kept the wifi and the pizza coming','c3e9d2 · feat(ai): into a fellowship i care about','d4a1b8 · tag: apple-dev-init · cosmetic, still proud','e5f7c3 · fix(triage): stopped it guessing','f6b2a9 · perf(watershed): ran till alliances formed','a7c4e1 · tag: hpair-harvard · passport stamped','b8d3f5 · feat(ostrius): ship auth end to end · 0 regressions','c9e2a6 · merge(ai): joined emergent · fast-forward','d0f1b4 · feat(community): became lead · signed off','a5b1c8 · feat(relations): took over externals · handshakes++','eeeeee · HEAD -> main · reading you, live'];
    const tip=document.createElement('div'); tip.style.cssText='position:absolute;z-index:30;pointer-events:none;font-family:JetBrains Mono,monospace;font-size:11px;color:#0D0D12;background:#FBFAF7;border:1px solid #0D0D12;border-radius:12px;padding:6px 9px;white-space:nowrap;opacity:0;transition:opacity .18s ease;transform:translate(0,-118%);'; panel.appendChild(tip);
    lines.forEach((l,i)=>{ const txt=COMMITS[i]; if(!txt) return; l.addEventListener('mouseenter',()=>{ tip.textContent=txt; const r=l.getBoundingClientRect(), pr=panel.getBoundingClientRect(); tip.style.left=(r.left-pr.left+60)+'px'; tip.style.top=(r.top-pr.top+8)+'px'; tip.style.opacity=1; }); l.addEventListener('mouseleave',()=>{ tip.style.opacity=0; }); });
  }

  // v10 STEP 3.2 — the one reveal primitive (y:24, .8s, expo.out) for sections that lacked one
  setupReveal(){
    if(this.RM || !this.ST){ this.q('[data-pos]').forEach(e=>e.style.opacity=1); return; }
    const g=this.gsap;
    [['[data-pos]', this.one('[data-screen-label="Roles"]')], ['[data-exp-row]', this.one('[data-screen-label="Experience"]')]].forEach(([sel,scope])=>{
      if(!scope) return; const els=Array.from(scope.querySelectorAll(sel)); if(!els.length) return;
      g.set(els,{ opacity:0, y:24 });
      this.ST.create({ trigger:scope, start:'top 80%', once:true, onEnter:()=>g.to(els,{ opacity:1, y:0, duration:.8, ease:'expo.out', stagger:0.08 }) });
    });
  }

  // v9 P3.3 — one hover language for every tile/card/row across all modules
  setupHoverLang(){
    if(this.TOUCH) return;
    this.q('[data-tile], [data-pos], [data-show-card]').forEach(el=>{
      const key=el.querySelector('[data-key]');
      el.addEventListener('mouseenter',()=>{ el.style.transform='translateY(-6px)'; el.style.boxShadow='0 26px 64px rgba(13,13,18,.11)'; const a=el.getAttribute('data-accent'); if(a) el.style.borderColor=a; if(key) key.style.transform='scaleY(1)'; });
      el.addEventListener('mouseleave',()=>{ el.style.transform='translateY(0)'; el.style.boxShadow='0 12px 32px rgba(13,13,18,.07)'; el.style.borderColor='rgba(13,13,18,.12)'; if(key) key.style.transform='scaleY(0)'; });
    });
  }

  // v9 2.1 — bento behaviours (clock, github, learning, stagger reveal)
  setupBento(){
    const grid=this.one('[data-bento]'); if(!grid) return;
    const g=this.gsap, ST=this.ST;
    // clock tile (shares the IST formatter cadence)
    const cl=this.one('[data-bento-clock]'); const st=this.one('[data-bento-status]');
    if(cl){ const fmt=new Intl.DateTimeFormat('en-GB',{ timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false }); const f2=new Intl.DateTimeFormat('en-GB',{ timeZone:'Asia/Kolkata',hour:'2-digit',hour12:false }); const tk=()=>{ if(this.dead) return; cl.textContent=fmt.format(new Date()); if(st){ const h=parseInt(f2.format(new Date()),10); st.textContent=(h>=1&&h<7)?'almost certainly asleep':(h>=22||h<1)?'probably still shipping':'probably shipping'; } }; tk(); this._bentoClk=setInterval(tk,1000); }
    // github live stat (client fetch, graceful fallback)
    this.fetchGithub();
    // stagger reveal
    const tiles=this.q('[data-tile]');
    if(this.RM){ tiles.forEach(t=>{ t.style.opacity=1; }); return; }
    if(ST){ g.set(tiles,{ opacity:0, y:26 }); ST.create({ trigger:grid, start:'top 78%', once:true, onEnter:()=>{ g.to(tiles,{ opacity:1, y:0, duration:.7, ease:'expo.out', stagger:0.07 }); } }); }
  }
  fetchGithub(){
    const num=this.one('[data-gh-num]'), label=this.one('[data-gh-label]'); if(!num) return;
    const fallback=()=>{ num.textContent='oss'; if(label) label.textContent='open source club · scaler'; };
    if(!('fetch' in window)){ fallback(); return; }
    const ctrl = ('AbortController' in window)? new AbortController():null;
    const to = ctrl? setTimeout(()=>ctrl.abort(),4000):null;
    fetch('https://api.github.com/users/kunalKumar-13/events/public?per_page=100', ctrl?{signal:ctrl.signal}:{})
      .then(r=>r.ok?r.json():Promise.reject())
      .then(ev=>{ if(to) clearTimeout(to); const wk=Date.now()-2592e6; let c=0; (ev||[]).forEach(e=>{ if(e.type==='PushEvent' && new Date(e.created_at).getTime()>wk){ c+=(e.payload&&e.payload.commits?e.payload.commits.length:1); } }); if(c>0){ num.textContent=c; if(label) label.textContent='commit'+(c===1?'':'s')+' this month'; } else { num.textContent='@kunal'; if(label) label.textContent='shipping in private'; } })
      .catch(()=>fallback());
  }

  // v9 2.3 — horizontal showcase (drag + arrow keys + snap)
  setupShowcase(){
    const rail=this.one('[data-show-rail]'); if(!rail) return;
    let down=false, sx=0, sl=0, moved=false;
    rail.addEventListener('pointerdown',(e)=>{ down=true; moved=false; sx=e.clientX; sl=rail.scrollLeft; rail.style.cursor='grabbing'; rail.setPointerCapture&&rail.setPointerCapture(e.pointerId); });
    rail.addEventListener('pointermove',(e)=>{ if(!down) return; const dx=e.clientX-sx; if(Math.abs(dx)>3) moved=true; rail.scrollLeft=sl-dx; });
    const up=()=>{ down=false; rail.style.cursor='grab'; }; rail.addEventListener('pointerup',up); rail.addEventListener('pointerleave',up);
    rail.addEventListener('click',(e)=>{ if(moved){ e.preventDefault(); e.stopPropagation(); } },true);
    const step=()=>{ const c=rail.querySelector('[data-show-card]'); return c? c.getBoundingClientRect().width+18 : 280; };
    rail.addEventListener('keydown',(e)=>{ if(e.key==='ArrowRight'){ e.preventDefault(); rail.scrollBy({left:step(),behavior:'smooth'}); } else if(e.key==='ArrowLeft'){ e.preventDefault(); rail.scrollBy({left:-step(),behavior:'smooth'}); } });
    // wheel → horizontal when hovering the rail
    rail.addEventListener('wheel',(e)=>{ if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){ rail.scrollLeft+=e.deltaY; e.preventDefault(); } },{passive:false});
  }

  // v9 2.2 — pinned scroll story (Recall.me), canvas scrubbed by progress
  setupStory(){
    const sec=this.one('[data-story]'); if(!sec) return;
    const pin=this.one('[data-story-pin]'); const cv=this.one('[data-story-canvas]');
    const caps=Array.from(sec.querySelectorAll('[data-cap]')); const dots=Array.from(sec.querySelectorAll('[data-story-dots] span'));
    const g=this.gsap, ST=this.ST;
    let ctx=null; try{ ctx=cv&&cv.getContext('2d'); }catch(e){}
    let P=null;
    const size=()=>{ if(!cv) return; const r=cv.getBoundingClientRect(); const w=Math.max(60,r.width|0), h=Math.max(60,r.height|0); if(cv.width!==w||cv.height!==h){ cv.width=w; cv.height=h; P=null; } };
    const build=(w,h)=>{ P=[]; const cols=8, rows=5, gw=w*.6, gh=h*.52, ox=(w-gw)/2, oy=(h-gh)/2; for(let i=0;i<40;i++){ const c=i%cols, r=(i/cols)|0; P.push({ hx:ox+c*(gw/(cols-1)), hy:oy+r*(gh/(rows-1)), a:Math.random()*6.28, b:Math.random()*6.28, f1:.5+Math.random()*.7, f2:.5+Math.random()*.7, amp:.18+Math.random()*.22 }); } };
    const render=(prog)=>{
      if(!ctx) return; size(); const w=cv.width, h=cv.height; if(!P||!P.length) build(w,h);
      ctx.clearRect(0,0,w,h);
      // assembled fraction: stays scattered through first half, snaps home in the last third
      let A=(prog-0.5)/0.45; A=A<0?0:A>1?1:A; const E=A*A*(3-2*A);
      const tt=(performance.now()*0.0006);
      for(let i=0;i<P.length;i++){ const p=P[i]; const dx=Math.sin(p.a+tt*p.f1)*w*p.amp, dy=Math.cos(p.b+tt*p.f2)*h*p.amp; const x=p.hx+dx*(1-E), y=p.hy+dy*(1-E); ctx.globalAlpha=.45+.5*E; ctx.fillStyle= i%7===0?'rgba(13,13,18,.55)':'#2438FF'; ctx.fillRect(x-5,y-3.2,10,6.4); }
      ctx.globalAlpha=1;
    };
    this._storyProg=0;
    const setCap=(prog)=>{ let idx=Math.min(caps.length-1,Math.floor(prog*caps.length)); caps.forEach((c,i)=>{ if(g) g.to(c,{ opacity:i===idx?1:0, duration:.3, overwrite:true }); else c.style.opacity=i===idx?1:0; }); dots.forEach((d,i)=>d.style.background=i===idx?'#2438FF':'rgba(13,13,18,.14)'); };
    size(); window.addEventListener('resize',size);
    if(this.RM || !ST){
      if(pin){ pin.style.height='auto'; pin.style.padding='clamp(60px,10vh,120px) clamp(20px,5vw,80px)'; }
      caps.forEach(c=>{ c.style.position='relative'; c.style.opacity=1; c.style.marginBottom='10px'; });
      render(1); return;
    }
    let vis=false;
    ST.create({ trigger:sec, start:'top top', end:'+=130%', pin:pin, pinSpacing:true, anticipatePin:1, scrub:true, invalidateOnRefresh:true, onEnter:()=>vis=true, onLeave:()=>vis=false, onEnterBack:()=>vis=true, onLeaveBack:()=>vis=false,
      onUpdate:(self)=>{ this._storyProg=self.progress; setCap(self.progress); render(self.progress); } });
    // gentle life while pinned (drift wobble continues even when not scrubbing)
    this._fx=this._fx||[]; let lt=0;
    this._fx.push((t)=>{ if(!vis||document.hidden) return; if(t-lt<33) return; lt=t; render(this._storyProg); });
    render(0); setCap(0);
  }

  // v9 2.4 — the currently ticker (slot mechanic, one item swapping)
  setupTicker(){
    const clip=this.one('[data-ticker-clip]'), track=this.one('[data-ticker-track]'); if(!clip||!track) return;
    this._roleIvs=this._roleIvs||[];
    if(this.RM){ clip.style.height='auto'; for(let i=track.children.length-1;i>0;i--) track.children[i].style.display='none'; return; }
    const measure=()=>{ const h=track.children[0].getBoundingClientRect().height; if(h) clip.style.height=h+'px'; return h; };
    let lh=measure(); if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>{ lh=measure(); });
    let i=0; const n=track.children.length-1;
    const iv=setInterval(()=>{ if(this.dead||!this.gsap) return; i++; this.gsap.to(track,{ y:-lh*i, duration:.6, ease:'cubic-bezier(.76,0,.24,1)', onComplete:()=>{ if(i>=n){ i=0; this.gsap.set(track,{ y:0 }); } } }); },3000);
    this._roleIvs.push(iv);
  }

  // v8 A.2 — the charge effect (velocity-driven wave + RGB split, DOM text stays real)
  setupCharge(){
    if(this.RM || this.TOUCH) return;
    const h1=this.one('[data-hero-h1]'); const giant=this.one('[data-giant-name]');
    if(!h1) return;
    const giantSolid = giant ? giant.querySelector('span') : null;
    let chars=[];
    const collect=()=>{ chars=this.q('[data-hero-h1] [data-split] span span'); };
    collect();
    this._fx=this._fx||[];
    const CEIL=7; // px ceiling — text always readable
    this._fx.push((t)=>{
      const vb=this.velBus||0, va=this.velAbs||0;
      if(va<0.001 && this._chargeRest) return;
      this._chargeRest = va<0.001;
      if(!chars.length) collect(); // self-heal: heroEntrance splits chars after the preloader
      const dx=(vb*CEIL).toFixed(2);
      // RGB channel split — cobalt one way, coral the other (real text sits crisp on top)
      const ts = va>0.002 ? (dx+'px 0 rgba(36,56,255,.6), '+(-dx)+'px 0 rgba(255,77,94,.6)') : 'none';
      h1.style.textShadow=ts;
      // gentle vertical wave across characters, amplitude scales with velocity
      const amp=va*CEIL*0.9, tt=t*0.006;
      for(let i=0;i<chars.length;i++){ chars[i].style.transform='translateY('+(Math.sin(i*0.45+tt)*amp).toFixed(2)+'px)'; }
      if(giant){ giant.style.transform='skewY('+(vb*-1.6).toFixed(3)+'deg)'; if(giantSolid) giantSolid.style.textShadow=ts; }
    });
  }

  // v8 A.3 — velocity-reactive headings (CSS only, on the bus)
  setupVelSkew(){
    if(this.RM) return;
    const els=this.q('[data-vel-skew], [data-manifesto], [data-screen-label] h2');
    const heads=this.q('h2').filter(h=>!h.closest('[data-hero-h1]'));
    const all=Array.from(new Set(heads.concat(this.q('[data-vel-skew]'))));
    if(!all.length) return;
    this._fx=this._fx||[];
    this._fx.push(()=>{
      const vb=this.velBus||0;
      if(this.velAbs<0.001 && this._skewRest) return; this._skewRest=this.velAbs<0.001;
      const sk=(vb*5).toFixed(2), sy=(1+this.velAbs*0.035).toFixed(4);
      for(let i=0;i<all.length;i++){ all[i].style.transform='skewY('+sk+'deg) scaleY('+sy+')'; }
    });
  }

  // v8 E.4 — sound (off by default, WebAudio, persisted)
  setupSound(){
    const btn=this.one('[data-sound]'); if(!btn) return;
    let on=false; try{ on=localStorage.getItem('kk_sound')==='1'; }catch(e){}
    this._sound=on; const paint=()=>{ btn.textContent='♪ sound: '+(this._sound?'on':'off'); btn.style.color=this._sound?'#0CAF9B':'#6b6b78'; }; paint();
    const ensure=()=>{ if(!this._ac){ try{ this._ac=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(this._ac&&this._ac.state==='suspended') this._ac.resume(); };
    this.beep=(freq,dur,vol)=>{ if(!this._sound||!this._ac) return; try{ const o=this._ac.createOscillator(), g=this._ac.createGain(); o.type='sine'; o.frequency.value=freq; const n=this._ac.currentTime; g.gain.setValueAtTime(0,n); g.gain.linearRampToValueAtTime(vol||0.05,n+0.01); g.gain.exponentialRampToValueAtTime(0.0001,n+(dur||0.12)); o.connect(g); g.connect(this._ac.destination); o.start(n); o.stop(n+(dur||0.12)+0.02); }catch(e){} };
    btn.addEventListener('click',()=>{ this._sound=!this._sound; try{ localStorage.setItem('kk_sound',this._sound?'1':'0'); }catch(e){} if(this._sound){ ensure(); this.beep(523,0.12,0.05); } paint(); });
    // soft tick on section-enter
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver((ents)=>{ ents.forEach(e=>{ if(e.isIntersecting && this._sound){ this.beep(420,0.08,0.03); } }); },{ threshold:0.5 });
      this.q('section[data-screen-label]').forEach(s=>io.observe(s));
    }
  }

  // v8 D.1 — honest, computed tenure
  setupWeeks(){
    const el=this.one('[data-weeks]'); if(!el) return;
    const start=new Date('2026-06-01T00:00:00+05:30');
    const wk=Math.max(1,Math.round((Date.now()-start.getTime())/6048e5));
    el.textContent='started jun 2026 · '+wk+' week'+(wk===1?'':'s')+' in';
  }

  // v8 C — SVG/clip mask wipes on the three biggest moments only
  setupMaskWipes(){
    if(this.RM) return; const g=this.gsap, ST=this.ST;
    const wipe=(node,delay)=>{ if(!node) return; node.style.clipPath='inset(0 100% 0 0)'; node.style.webkitClipPath='inset(0 100% 0 0)'; g.to(node,{ duration:1.0, ease:'expo.out', delay:delay||0, clipPath:'inset(0 0% 0 0)', webkitClipPath:'inset(0 0% 0 0)' }); };
    // (hero keeps its loved char-rise + settling ripple — mask wipes stay rare)
    // log panel
    const log=this.one('[data-log]');
    if(log && ST) ST.create({ trigger:log, start:'top 80%', once:true, onEnter:()=>wipe(log,0) });
    // footer reveal
    const fh=this.one('[data-foot-headline]');
    if(fh && ST) ST.create({ trigger:this.one('[data-footer]'), start:'top 60%', once:true, onEnter:()=>wipe(fh,0.1) });
  }

  // v8 B — subtle Flip-style punctuation as each card reaches front
  setupCardPunctuation(){
    if(this.RM || !this.ST) return; const g=this.gsap;
    this.q('[data-card]').forEach(card=>{
      const plate=card.querySelector('[data-plate]'); const title=card.querySelector('h3');
      const glyph=card.querySelector('canvas[data-sim]');
      this.ST.create({ trigger:card, start:'top 64%', end:'bottom 40%',
        onEnter:()=>{ if(title) g.fromTo(title,{ y:10, opacity:.6 },{ y:0, opacity:1, duration:.6, ease:'expo.out' }); if(glyph) g.fromTo(glyph,{ scale:.96 },{ scale:1, duration:.7, ease:'expo.out' }); if(plate){ g.fromTo(plate,{ filter:'brightness(1.04)' },{ filter:'brightness(1)', duration:.6 }); } },
        onEnterBack:()=>{ if(title) g.fromTo(title,{ y:-8, opacity:.7 },{ y:0, opacity:1, duration:.5, ease:'expo.out' }); }
      });
    });
  }

  // v3 1.8 — time-aware greeting (Bengaluru)
  setGreeting(){
    const el=this.one('[data-greet]'); if(!el) return;
    let h=12;
    try{ h=parseInt(new Intl.DateTimeFormat('en-GB',{ timeZone:'Asia/Kolkata', hour:'2-digit', hour12:false }).format(new Date()),10); }catch(e){}
    el.textContent = (h>=5&&h<12)?'good morning':(h>=12&&h<17)?'good afternoon':(h>=17&&h<22)?'good evening':"it's late in bengaluru — still shipping";
  }

  // v3 copy pack — heroVariants (single source of truth)
  getPacks(){
    const C={ cobalt:'#2438FF', violet:'#7A2BF5', teal:'#0CAF9B', amber:'#FFAA00', coral:'#FF4D5E' };
    return {
      'worth-remembering':{ l1:'Building software', l2:'worth\u00A0', l3:'', slots:[{t:'remembering',c:C.cobalt,dot:true},{t:'talking about',c:C.violet,dot:true},{t:'coming back to',c:C.teal,dot:true}], sub:null },
      'feels-alive':{ l1:'I build software', l2:'that feels\u00A0', l3:'', slots:[{t:'alive',c:C.coral,dot:true},{t:'inevitable',c:C.cobalt,dot:true},{t:'effortless',c:C.teal,dot:true}], sub:null },
      'design-build-ship':{ l1:'I\u00A0', l2:'', l3:'\u00A0intelligent software.', slots:[{t:'design',c:C.violet,dot:false},{t:'build',c:C.cobalt,dot:false},{t:'ship',c:C.teal,dot:false},{t:'obsess over',c:C.coral,dot:false}], sub:'From ambitious idea to deployed system — frontend, backend, and the AI in between.' },
      'engineer-by-training':{ l1:'Engineer by training,', l2:'', l3:'\u00A0by nature.', slots:[{t:'builder',c:C.cobalt,dot:false},{t:'storyteller',c:C.violet,dot:false},{t:'perfectionist',c:C.teal,dot:false}], sub:null },
      'original':{ l1:'I build AI systems', l2:'that\u00A0', l3:'', slots:[{t:'remember',c:C.cobalt,dot:true},{t:'reason',c:C.violet,dot:true},{t:'negotiate',c:C.teal,dot:true}], sub:null }
    };
  }
  applyPack(){
    const key=this.props.heroPack ?? 'worth-remembering';
    if(key==='worth-remembering' && !this._packApplied){ this._packApplied=key; return; }
    const packs=this.getPacks();
    const p=packs[key] || packs['worth-remembering'];
    this._packApplied=key;
    const l1=this.one('[data-l1]'), l2=this.one('[data-l2]'), l3=this.one('[data-l3]');
    if(l1){ l1.textContent=p.l1; l1.style.display=p.l1?'block':'none'; }
    if(l2) l2.textContent=p.l2;
    if(l3) l3.textContent=p.l3;
    const track=this.one('[data-slot-track]');
    if(track){
      track.innerHTML='';
      const mk=(s)=>{ const d=document.createElement('span'); d.style.cssText='display:block;white-space:nowrap;color:'+s.c+';'; d.textContent=s.t; if(s.dot){ const dot=document.createElement('span'); dot.setAttribute('data-dot',''); dot.style.cssText='display:inline-block;color:#FF4D5E;'; dot.textContent='.'; d.appendChild(dot); } return d; };
      p.slots.forEach(s=>track.appendChild(mk(s)));
      track.appendChild(mk(p.slots[0]));
      if(this._slotMeasure) this._slotMeasure();
      this.slotI=0; if(this.gsap) this.gsap.set(track,{ y:0 });
    }
    if(p.sub){ const sub=this.one('[data-hero-sub]'); if(sub) sub.textContent=p.sub+''; }
    const pre=this.one('[data-pre-track]');
    if(pre){ const ws=pre.querySelectorAll('[data-pre-w]'); for(let i=0;i<Math.min(3,p.slots.length,ws.length);i++){ ws[i].textContent=p.slots[i].t; ws[i].style.color=p.slots[i].c; } }
    this.q('[data-ribbon="2"] [data-mq]').forEach((el,i)=>{
      const k=i%4; const s= k<3? p.slots[Math.min(k,p.slots.length-1)] : null;
      el.textContent=(s? s.t : 'ship')+'.';
      el.setAttribute('data-mq', s? s.c : '#FFAA00');
    });
  }
  componentDidUpdate(prevProps){
    if(prevProps && prevProps.heroPack!==this.props.heroPack && this.rootEl){ this.applyPack(); }
  }
}

/* boot — mount the component once the DOM (and the #kk-root markup) is ready */
(function(){
  function boot(){ var el = document.getElementById('kk-root'); if(el) new Site(el); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
