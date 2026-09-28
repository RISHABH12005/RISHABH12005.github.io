const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch=matchMedia('(pointer: coarse)').matches;
const loader=document.querySelector('#loader');
const loaderBar=loader?.querySelector('.loader-glass i b');
requestAnimationFrame(()=>loaderBar?.classList.add('is-loaded'));
const finishLoader=()=>loader?.classList.add('is-done');
setTimeout(finishLoader,prefersReduced?180:900);
window.addEventListener('load',finishLoader,{once:true});

const menu=document.querySelector('.mobile-glass-root .menu-toggle');
const nav=document.querySelector('#primary-nav');
const mobileNavLinks=[...document.querySelectorAll('.mobile-glass-link')];
const closeMenu=()=>{
  menu?.setAttribute('aria-expanded','false');
  menu?.setAttribute('aria-label','Open navigation');
  document.body.classList.remove('nav-open');
  nav?.setAttribute('aria-hidden','true');
  document.querySelector('.mobile-glass-root')?.setAttribute('aria-hidden','true');
};
menu?.addEventListener('click',()=>{
  const open=menu.getAttribute('aria-expanded')==='true';
  menu.setAttribute('aria-expanded',String(!open));
  menu.setAttribute('aria-label',open?'Open navigation':'Close navigation');
  document.body.classList.toggle('nav-open',!open);
  nav?.setAttribute('aria-hidden',String(open));
  document.querySelector('.mobile-glass-root')?.setAttribute('aria-hidden',String(open));
});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
mobileNavLinks.forEach(a=>a.addEventListener('click',closeMenu));
/* Sliding glass navigation */
(()=>{
  const nav=document.querySelector('#primary-nav');
  const slider=nav?.querySelector('.nav-slider');
  const links=[...(nav?.querySelectorAll('a')||[])];
  if(!nav||!slider||!links.length)return;
  const move=(link)=>{
    if(!link||matchMedia('(max-width:760px)').matches)return;
    const nr=nav.getBoundingClientRect(),r=link.getBoundingClientRect();
    nav.style.setProperty('--slider-left',(r.left-nr.left)+'px');
    nav.style.setProperty('--slider-top',(r.top-nr.top)+'px');
    nav.style.setProperty('--slider-width',r.width+'px');
    nav.style.setProperty('--slider-height',r.height+'px');
  };
  const active=()=>move(links.find(x=>x.classList.contains('is-active'))||links[0]);
  links.forEach(link=>{
    link.addEventListener('mouseenter',()=>move(link));
    link.addEventListener('focus',()=>move(link));
    link.addEventListener('click',()=>move(link));
  });
  nav.addEventListener('mouseleave',active);
  addEventListener('resize',active,{passive:true});
  requestAnimationFrame(active);
})();

document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});

const mount=document.querySelector('#scene');
if(mount){
 const canvas=document.createElement('canvas');canvas.className='star-canvas';mount.append(canvas);
 const ctx=canvas.getContext('2d',{alpha:true});let w=0,h=0,dpr=1,last=0,visible=true,pointer={x:0,y:0};const stars=[],meteors=[];
 const resize=()=>{dpr=Math.min(devicePixelRatio||1,1.8);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);stars.length=0;const count=isTouch?240:Math.min(1150,Math.max(520,Math.floor(w*h/1500)));for(let i=0;i<count;i++)stars.push({x:Math.random(),y:Math.random(),z:.12+Math.random()*.88,r:.2+Math.random()*1.15,a:.18+Math.random()*.7,phase:Math.random()*6.28,tw:.4+Math.random()*1.8,dr:(Math.random()-.5)*.00002})};
 const meteor=()=>{if(prefersReduced||isTouch||meteors.length>1||Math.random()>.001)return;meteors.push({x:Math.random()*w*.85,y:Math.random()*h*.35,v:7+Math.random()*7,life:0,max:55+Math.random()*45})};
 const frame=t=>{requestAnimationFrame(frame);if(!visible||t-last<(isTouch?45:28))return;last=t;ctx.clearRect(0,0,w,h);const px=pointer.x*11,py=pointer.y*8;for(const s of stars){s.x=(s.x+s.dr)%1;if(s.x<0)s.x=1;const x=s.x*w+px*s.z,y=s.y*h+py*s.z,tw=prefersReduced?1:.78+.22*Math.sin(t*.001*s.tw+s.phase),a=s.a*tw*(.45+.55*s.z);ctx.beginPath();ctx.fillStyle='rgba(218,228,255,'+a+')';ctx.arc(x,y,s.r*(.55+.75*s.z),0,Math.PI*2);ctx.fill();if(s.z>.78&&!prefersReduced){ctx.beginPath();ctx.fillStyle='rgba(255,255,255,'+(a*.11)+')';ctx.arc(x,y,s.r*3,0,Math.PI*2);ctx.fill()}}meteor();for(let i=meteors.length-1;i>=0;i--){const m=meteors[i];m.life++;m.x+=m.v;m.y+=m.v*.55;const f=Math.max(0,1-m.life/m.max),g=ctx.createLinearGradient(m.x-100,m.y-55,m.x,m.y);g.addColorStop(0,'rgba(205,221,255,0)');g.addColorStop(1,'rgba(220,232,255,'+(f*.65)+')');ctx.strokeStyle=g;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(m.x-100,m.y-55);ctx.lineTo(m.x,m.y);ctx.stroke();if(m.life>m.max||m.x>w+120||m.y>h+80)meteors.splice(i,1)}};
 addEventListener('resize',resize,{passive:true});addEventListener('pointermove',e=>{pointer.x=e.clientX/innerWidth-.5;pointer.y=e.clientY/innerHeight-.5},{passive:true});document.addEventListener('visibilitychange',()=>visible=!document.hidden);resize();requestAnimationFrame(frame);
}
if(!prefersReduced&&!isTouch)document.querySelectorAll('.glass-card,.glass-panel').forEach(card=>card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');card.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%')},{passive:true}));
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -8% 0px'});document.querySelectorAll('.section-kicker,.section-title,.education-grid,.experience-grid,.project-grid,.achievement-shell,.leadership-shell,.skills-grid,.video-lab-grid,.certificate-grid,.contact-shell').forEach(el=>{el.classList.add('reveal');if(prefersReduced)el.classList.add('is-visible');else observer.observe(el)});const links=[...document.querySelectorAll('#primary-nav a,.mobile-glass-link')],sections=[...document.querySelectorAll('main section[id]')];const active=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)links.forEach(l=>l.classList.toggle('is-active',l.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-38% 0px -52% 0px'});sections.forEach(s=>active.observe(s))}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=document.querySelector(a.getAttribute('href'));if(!target)return;e.preventDefault();target.scrollIntoView({behavior:prefersReduced?'auto':'smooth',block:'start'})}));
addEventListener('scroll',()=>document.body.classList.toggle('has-scrolled',scrollY>24),{passive:true});

const schema={'@context':'https://schema.org','@type':'Person',name:'Rishabh Jain',url:'https://rishabh12005.me/',email:'mailto:2r10j5@gmail.com',sameAs:['https://github.com/RISHABH12005','https://www.linkedin.com/in/rishabh12005','https://www.youtube.com/@RISHABH12005']};const schemaScript=document.createElement('script');schemaScript.type='application/ld+json';schemaScript.textContent=JSON.stringify(schema);document.head.appendChild(schemaScript);

/* Advanced command center, project intelligence and public GitHub telemetry */
(()=>{
const hud=document.querySelector('#command-hud'),trigger=document.querySelector('#command-trigger'),input=document.querySelector('#command-input'),results=document.querySelector('#command-results');
const modal=document.querySelector('#project-modal'),modalContent=document.querySelector('#modal-content');
const toast=document.querySelector('#hud-toast');
const projects={
bharat:{k:'EDGE AI · RASPBERRY PI',t:'Bharat AI-SoC',d:'Offline Hindi voice assistant built for ARM edge deployment. Streaming Vosk ASR feeds a hybrid intent layer, state manager and offline eSpeak-NG TTS.',blocks:[['Pipeline','Microphone → Vosk ASR → NLP → State Manager → Action Layer → TTS'],['Engineering','Streaming inference, TF-IDF cosine fallback, wake-word activation and ARM-friendly execution']],url:'https://github.com/RISHABH12005/Bharat-AI-SoC',demo:['https://youtu.be/U36KKQYhnZU']},
ids:{k:'IOT · SECURITY',t:'Intrusion Detection System',d:'ESP32-C5 security platform combining RFID identity, Wi-Fi client monitoring, MQTT events and Telegram control.',blocks:[['Detection','RC522 UID mapping, unknown-card alerts, replay detection and blocking logic'],['Network','Station + access-point mode, MQTT topics for scans, alerts and connected clients']],url:'https://github.com/RISHABH12005/Minor-II',demo:['https://youtu.be/7MgyB5kLQ8M']},
robot:{k:'ROBOTICS · MINOR I',t:'Industrial Inspection Robot',d:'Robotic inspection and maintenance platform designed for industrial environments, anomaly detection and reporting.',blocks:[['Mission','Autonomous or semi-autonomous navigation with inspection and maintenance tasks'],['Documentation','Project report, SRS, presentations and robot test references are maintained in GitHub']],url:'https://github.com/RISHABH12005/Minor-I',demo:['https://youtu.be/C9t8dvpeLmY']},
lms:{k:'IOT · ROBOTICS',t:'Livestock Monitoring System',d:'Raspberry Pi prototype combining environmental sensing, camera monitoring, obstacle detection and motorized automation.',blocks:[['Hardware','Raspberry Pi 4B, Sense HAT, BrickPi, 5MP camera, ultrasonic sensors and speed motors'],['Software','FastAPI, WebSockets, OpenCV, Picamera2 and remote monitoring/control']],url:'https://github.com/RISHABH12005/LMS',demo:['https://youtu.be/3OHgyslehkU','https://youtu.be/zO6NGybyWHo','https://youtu.be/kuSZj3ih_E0','https://youtu.be/LwxY2EQF_1k']},
drone:{k:'DRONE · EMBEDDED SYSTEMS',t:'AI Driven Surveillance Drone',d:'Major project focused on aerial surveillance using a flight-controller and companion-computing architecture.',blocks:[['System','Pixhawk flight control, Raspberry Pi companion computing and telemetry'],['Engineering','MAVLink-based communication, mission execution and real-time monitoring']],url:'https://github.com/RISHABH12005/Major-I'}
};
const navItems=[['01','Education','#education','SECTION'],['02','Experience','#experience','SECTION'],['03','Projects','#projects','SECTION'],['04','Achievements','#achievements','SECTION'],['05','Leadership','#leadership','SECTION'],['06','Skills','#skills','SECTION'],['07','Certificates','#certificates','SECTION'],['08','Contact','#contact','SECTION'],['⌘','GitHub','https://github.com/RISHABH12005','EXTERNAL'],['↗','LinkedIn','https://www.linkedin.com/in/rishabh12005','EXTERNAL']];
function openHud(){hud?.classList.add('open');hud?.setAttribute('aria-hidden','false');if(input){input.value='';render('');setTimeout(()=>input.focus(),30)}}
function closeHud(){hud?.classList.remove('open');hud?.setAttribute('aria-hidden','true')}
function render(q=''){if(!results)return;const term=q.toLowerCase();const list=navItems.filter(x=>(x[1]+' '+x[3]).toLowerCase().includes(term));results.innerHTML=list.map(x=>'<button class="command-item" data-target="'+x[2]+'"><b>'+x[0]+'</b><span><strong>'+x[1]+'</strong><small>'+x[3]+'</small></span><em>↗</em></button>').join('')||'<div class="command-item"><b>—</b><span><strong>No result</strong><small>Try “projects”, “achievements”, “skills” or “contact”.</small></span></div>';results.querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>{const target=b.dataset.target;closeHud();if(target.startsWith('#'))document.querySelector(target)?.scrollIntoView({behavior:prefersReduced?'auto':'smooth'});else window.open(target,'_blank','noopener')})}
trigger?.addEventListener('click',openHud);input?.addEventListener('input',e=>render(e.target.value));document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openHud()}if(e.key==='Escape'){closeHud();closeProject()}});
document.querySelectorAll('[data-command-close]').forEach(x=>x.addEventListener('click',closeHud));
function openProject(key){const p=projects[key];if(!p||!modalContent)return;modalContent.innerHTML='<span class="modal-kicker">'+p.k+'</span><h2 class="modal-title">'+p.t+'</h2><p class="modal-copy">'+p.d+'</p><div class="modal-layout">'+p.blocks.map(b=>'<div class="modal-block"><strong>'+b[0]+'</strong><p>'+b[1]+'</p></div>').join('')+'</div><div class="modal-actions"><a href="'+p.url+'" target="_blank" rel="noopener noreferrer">VIEW GITHUB ↗</a>'+(p.demo||[]).map((d,i)=>'<a href="'+d+'" target="_blank" rel="noopener noreferrer">WATCH DEMO '+(i+1)+' ↗</a>').join('')+'</div>';modal.classList.add('open');modal.setAttribute('aria-hidden','false')}
function closeProject(){modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true')}document.querySelectorAll('.project-open').forEach(b=>b.addEventListener('click',()=>openProject(b.dataset.project)));document.querySelectorAll('[data-project-close]').forEach(x=>x.addEventListener('click',closeProject));
function showToast(t){if(!toast)return;toast.textContent=t;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),2200)}
const sync=document.querySelector('#github-sync');
if(sync) sync.textContent='AVAILABLE';
render('');
})();


/* ========================================================================
   REAL YBOUANE LIQUID GLASS
   Four tuned material families:
   - Frosted Panel: broad structural surfaces
   - Dark Glass: dark information shells
   - Button Mode: interactive controls
   - Dome Bevel: magnifier treatment for the achievement marker
   Each LiquidGlass root contains only direct-child glass elements, matching
   the library's rendering model.
========================================================================= */
(async()=>{
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=window.matchMedia('(max-width:760px)').matches;
  const instances=[];

  const frosted={
    blurAmount:.22, refraction:.78, chromAberration:.045,
    edgeHighlight:.13, specular:.18, fresnel:1.05, distortion:.008,
    opacity:.93, saturation:.05, tintStrength:.018, brightness:.015,
    shadowOpacity:.28, shadowSpread:12, shadowOffsetY:2,
    floating:false, button:false, bevelMode:0
  };
  const dark={
    blurAmount:.27, refraction:.82, chromAberration:.05,
    edgeHighlight:.16, specular:.22, fresnel:1.18, distortion:.01,
    opacity:.91, saturation:.02, tintStrength:.028, brightness:-.06,
    shadowOpacity:.38, shadowSpread:16, shadowOffsetY:3,
    floating:false, button:false, bevelMode:0
  };
  const control={
    blurAmount:.16, refraction:.74, chromAberration:.035,
    edgeHighlight:.14, specular:.2, fresnel:1.08, distortion:.006,
    opacity:.96, saturation:.04, tintStrength:.02, brightness:.025,
    shadowOpacity:.25, shadowSpread:9, shadowOffsetY:2,
    floating:false, button:true, bevelMode:0
  };
  const dome={
    blurAmount:.08, refraction:1.12, chromAberration:.065,
    edgeHighlight:.22, specular:.3, fresnel:1.3, distortion:.012,
    opacity:.98, saturation:.08, tintStrength:.025, brightness:.02,
    shadowOpacity:.32, shadowSpread:12, shadowOffsetY:2,
    floating:false, button:false, bevelMode:1,
    cornerRadius:50, zRadius:50
  };

  const setConfig=(el,cfg,extra={})=>{
    el.dataset.config=JSON.stringify({...cfg,...extra});
  };

  try{
    const {LiquidGlass}=await import('https://cdn.jsdelivr.net/npm/@ybouane/liquidglass/dist/index.js');

    const initRoot=async(root,elements,defaults)=>{
      if(!root||!elements.length)return;
      if(getComputedStyle(root).position==='static')root.style.position='relative';
      const clean=[...new Set(elements)].filter(el=>el.parentElement===root);
      if(!clean.length)return;
      const instance=await LiquidGlass.init({
        root,
        glassElements:clean,
        defaults
      });
      instances.push(instance);
    };

    /* Structural glass: one renderer per immediate parent avoids invalid
       nested-glass relationships and avoids opening dozens of WebGL contexts. */
    const structural=[
      ['.glass-panel',frosted],
      ['.glass-card',frosted]
    ];

    for(const [selector,cfg] of structural){
      const groups=new Map();
      document.querySelectorAll(selector).forEach(el=>{
        if(el.closest('#mobile-glass-root'))return;
        const root=el.parentElement;
        if(!root)return;
        if(!groups.has(root))groups.set(root,[]);
        groups.get(root).push(el);
        setConfig(el,cfg);
      });
      for(const [root,elements] of groups){
        await initRoot(root,elements,{...frosted});
      }
    }

    /* Re-tune selected information shells as Dark Glass. */
    const darkSelectors='.achievement-shell,.leadership-shell,.contact-shell,.project-modal-card';
    const darkGroups=new Map();
    document.querySelectorAll(darkSelectors).forEach(el=>{
      if(el.closest('#mobile-glass-root'))return;
      const root=el.parentElement;
      if(!root)return;
      setConfig(el,dark);
      if(!darkGroups.has(root))darkGroups.set(root,[]);
      darkGroups.get(root).push(el);
    });
    for(const [root,elements] of darkGroups){
      await initRoot(root,elements,{...dark});
    }

    /* Button mode: interactive actions get their own small roots so they
       remain valid direct children and preserve hover/press shader state. */
    const buttons=[...document.querySelectorAll('.glass-button')];
    const buttonGroups=new Map();
    buttons.forEach(el=>{
      if(el.closest('#mobile-glass-root'))return;
      const root=el.parentElement;
      if(!root)return;
      setConfig(el,control);
      if(!buttonGroups.has(root))buttonGroups.set(root,[]);
      buttonGroups.get(root).push(el);
    });
    for(const [root,elements] of buttonGroups){
      await initRoot(root,elements,{...control});
    }

    /* Dome / magnifier: the achievement index becomes a small optical lens. */
    const orbit=document.querySelector('.achievement-orbit');
    if(orbit){
      const root=orbit.parentElement;
      setConfig(orbit,dome,{cornerRadius:Math.min(50,Math.max(24,orbit.offsetHeight/2)),zRadius:Math.min(50,Math.max(24,orbit.offsetHeight/2))});
      await initRoot(root,[orbit],{...dome});
      orbit.classList.add('liquid-dome');
    }

    /* Mobile menu is one compact WebGL root. The scene is a sibling child,
       so the renderer can sample it; the root itself remains uncaptured. */
    const mobileRoot=document.querySelector('#mobile-glass-root');
    const mobileScene=mobileRoot?.querySelector('.mobile-glass-scene');
    const mobileButton=mobileRoot?.querySelector('.menu-toggle');
    const mobileLinks=[...(mobileRoot?.querySelectorAll('.mobile-glass-link')||[])];
    if(mobileRoot&&mobileScene&&mobileButton&&mobileLinks.length){
      mobileRoot.classList.add('mobile-webgl-root');
      mobileScene.style.opacity='1';
      setConfig(mobileButton,{...control,cornerRadius:15,zRadius:15});
      mobileLinks.forEach(link=>setConfig(link,{...control,cornerRadius:16,zRadius:16}));
      await initRoot(mobileRoot,[mobileButton,...mobileLinks],{...control});
    }

    window.__liquidGlassInstances=instances;
    document.documentElement.classList.add('liquid-glass-ready');
    document.documentElement.classList.remove('liquid-glass-fallback');

    if(!reduce){
      const pointer={x:0,y:0};
      let raf=0;
      addEventListener('pointermove',e=>{
        pointer.x=e.clientX/innerWidth-.5;
        pointer.y=e.clientY/innerHeight-.5;
        if(raf)return;
        raf=requestAnimationFrame(()=>{
          document.documentElement.style.setProperty('--glass-pointer-x',pointer.x.toFixed(3));
          document.documentElement.style.setProperty('--glass-pointer-y',pointer.y.toFixed(3));
          raf=0;
        });
      },{passive:true});
    }
  }catch(error){
    console.warn('LiquidGlass WebGL enhancement unavailable; CSS fallback retained.',error);
    document.documentElement.classList.add('liquid-glass-fallback');
  }
})();
