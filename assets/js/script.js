const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch=matchMedia('(pointer: coarse)').matches;
const loader=document.querySelector('#loader');
const loaderBar=loader?.querySelector('.loader-glass i b');

loaderBar?.classList.add('is-started');

/* The loader is tied to the actual LiquidGlass bootstrap instead of an
   arbitrary timer. A hard timeout prevents a broken CDN/WebGL environment
   from trapping the page behind the loader forever. */
let loaderFinished=false;
const loaderTimeout=setTimeout(()=>{
  if(!loaderFinished)finishLoader('fallback');
},1200);

function finishLoader(mode='ready'){
  if(loaderFinished)return;
  loaderFinished=true;
  clearTimeout(loaderTimeout);
  document.documentElement.classList.remove('liquid-glass-loading');
  document.documentElement.classList.toggle('liquid-glass-ready',mode==='ready');
  document.documentElement.classList.toggle('liquid-glass-fallback',mode!=='ready');
  loaderBar?.classList.remove('is-started');
  loaderBar?.classList.add('is-loaded');
  requestAnimationFrame(()=>loader?.classList.add('is-done'));
}

/* Show the CSS glass immediately. WebGL LiquidGlass is an enhancement, not a
   render-blocking dependency. This removes the blank-page/box latency while
   the CDN module and WebGL contexts initialize in the background. */
finishLoader('fallback');

const menu=document.querySelector('.mobile-glass-root .menu-toggle');
const nav=document.querySelector('#primary-nav');
const mobileNavLinks=[...document.querySelectorAll('.mobile-glass-link')];
const closeMenu=()=>{
  menu?.setAttribute('aria-expanded','false');
  menu?.setAttribute('aria-label','Open navigation');
  document.body.classList.remove('nav-open');
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('touch-action');
  nav?.setAttribute('aria-hidden','true');
  document.querySelector('.mobile-glass-root')?.setAttribute('aria-hidden','true');
};
menu?.addEventListener('click',()=>{
  const open=menu.getAttribute('aria-expanded')==='true';
  menu.setAttribute('aria-expanded',String(!open));
  menu.setAttribute('aria-label',open?'Open navigation':'Close navigation');
  const nextOpen=!open;
  document.body.classList.toggle('nav-open',nextOpen);
  if(nextOpen){
    document.body.style.overflow='hidden';
    document.body.style.touchAction='none';
  }else{
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('touch-action');
  }
  nav?.setAttribute('aria-hidden',String(open));
  document.querySelector('.mobile-glass-root')?.setAttribute('aria-hidden',String(open));
});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
mobileNavLinks.forEach(a=>a.addEventListener('click',()=>{
  if(matchMedia('(max-width:760px)').matches) closeMenu();
}));
document.querySelector('.mobile-nav-backdrop')?.addEventListener('click',closeMenu);
addEventListener('keydown',e=>{
  if(e.key==='Escape' && matchMedia('(max-width:760px)').matches) closeMenu();
});
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
 const canvas=document.createElement('canvas');
 canvas.className='star-canvas';
 mount.append(canvas);
 const ctx=canvas.getContext('2d',{alpha:true});
 let w=0,h=0,dpr=1,last=0,visible=true;
 const pointer={x:0,y:0}, stars=[],dust=[],meteors=[],nebula=[];
 const rand=(a,b)=>a+Math.random()*(b-a);

 const resize=()=>{
   dpr=Math.min(devicePixelRatio||1,1.6);
   w=innerWidth;h=innerHeight;
   canvas.width=w*dpr;canvas.height=h*dpr;
   ctx.setTransform(dpr,0,0,dpr,0,0);
   stars.length=0;dust.length=0;nebula.length=0;
   const area=w*h;
   const starCount=isTouch?180:Math.min(1050,Math.max(480,Math.floor(area/1700)));
   const dustCount=isTouch?70:Math.min(260,Math.max(90,Math.floor(area/8500)));

   for(let i=0;i<starCount;i++){
     stars.push({
       x:Math.random(),y:Math.random(),z:rand(.08,1),
       r:rand(.18,1.05),a:rand(.2,.8),phase:rand(0,Math.PI*2),
       tw:rand(.35,1.7),dr:rand(-.000004,.000004)
     });
   }
   for(let i=0;i<dustCount;i++){
     dust.push({
       x:Math.random(),y:Math.random(),z:rand(.15,.75),
       r:rand(.25,1.5),a:rand(.018,.075),phase:rand(0,6.28)
     });
   }

   /* Sparse nebula clouds. Each cloud is drawn with a radial gradient,
      producing depth without a heavy image or external asset. */
   for(let i=0;i<7;i++){
     nebula.push({
       x:rand(-.1,1.1),y:rand(.05,1.05),
       rx:rand(.12,.34),ry:rand(.08,.24),
       hue:i%2?'violet':'blue',phase:rand(0,6.28)
     });
   }
 };

 const spawnMeteor=()=>{
   if(prefersReduced||meteors.length>1||Math.random()>.0015)return;
   meteors.push({
     x:rand(w*.05,w*.72),y:rand(h*.02,h*.38),
     vx:rand(7,12),vy:rand(3.8,6.8),
     life:0,max:rand(45,90)
   });
 };

 const drawNebula=(t)=>{
   ctx.save();
   ctx.globalCompositeOperation='screen';
   for(const n of nebula){
     const drift=Math.sin(t*.000035+n.phase)*.018;
     const x=(n.x+drift)*w+pointer.x*18;
     const y=(n.y+Math.cos(t*.000028+n.phase)*.012)*h+pointer.y*12;
     const rx=n.rx*w,ry=n.ry*h;
     const g=ctx.createRadialGradient(x,y,0,x,y,Math.max(rx,ry));
     if(n.hue==='violet'){
       g.addColorStop(0,'rgba(108,82,255,.055)');
       g.addColorStop(.35,'rgba(72,58,180,.025)');
       g.addColorStop(1,'rgba(20,15,55,0)');
     }else{
       g.addColorStop(0,'rgba(76,120,255,.055)');
       g.addColorStop(.38,'rgba(48,74,180,.025)');
       g.addColorStop(1,'rgba(12,20,55,0)');
     }
     ctx.fillStyle=g;
     ctx.fillRect(x-rx*1.4,y-ry*1.4,rx*2.8,ry*2.8);
   }
   ctx.restore();
 };

 const drawMilkyWay=(t)=>{
   /* A very low-opacity diagonal galactic dust lane gives the field a
      natural astronomical structure instead of a flat star wallpaper. */
   ctx.save();
   ctx.translate(w*.5,h*.5);
   ctx.rotate(-.29+pointer.x*.015);
   const g=ctx.createLinearGradient(-w*.75,0,w*.75,0);
   g.addColorStop(0,'rgba(110,125,180,0)');
   g.addColorStop(.25,'rgba(105,120,175,.018)');
   g.addColorStop(.5,'rgba(215,225,255,.04)');
   g.addColorStop(.75,'rgba(105,120,175,.018)');
   g.addColorStop(1,'rgba(110,125,180,0)');
   ctx.fillStyle=g;
   ctx.filter='blur(22px)';
   ctx.fillRect(-w*.85,-h*.06,w*1.7,h*.12);
   ctx.restore();
 };

 const drawStars=(t)=>{
   for(const s of stars){
     s.x+=s.dr*s.z;
     if(s.x>1.05)s.x=-.05;
     if(s.x<-.05)s.x=1.05;
     const px=pointer.x*(7+18*s.z);
     const py=pointer.y*(5+14*s.z);
     const x=s.x*w+px,y=s.y*h+py;
     const tw=prefersReduced?1:.72+.28*Math.sin(t*.001*s.tw+s.phase);
     const a=s.a*tw*(.3+.7*s.z);
     const radius=s.r*(.45+.9*s.z);
     ctx.beginPath();
     ctx.fillStyle='rgba(220,229,255,'+a+')';
     ctx.arc(x,y,radius,0,Math.PI*2);
     ctx.fill();
     if(s.z>.78&&radius>0.65&&!prefersReduced){
       const glow=ctx.createRadialGradient(x,y,0,x,y,radius*4);
       glow.addColorStop(0,'rgba(240,245,255,'+(a*.16)+')');
       glow.addColorStop(1,'rgba(240,245,255,0)');
       ctx.fillStyle=glow;
       ctx.beginPath();ctx.arc(x,y,radius*4,0,Math.PI*2);ctx.fill();
     }
   }
 };

 const drawDust=(t)=>{
   ctx.save();
   ctx.globalCompositeOperation='screen';
   for(const d of dust){
     const x=d.x*w+pointer.x*(10+d.z*18);
     const y=d.y*h+pointer.y*(8+d.z*12)+Math.sin(t*.00012+d.phase)*2*d.z;
     ctx.beginPath();
     ctx.fillStyle='rgba(150,166,205,'+d.a+')';
     ctx.arc(x,y,d.r*(.7+d.z),0,Math.PI*2);
     ctx.fill();
   }
   ctx.restore();
 };

 const drawMeteors=()=>{
   for(let i=meteors.length-1;i>=0;i--){
     const m=meteors[i];
     m.life++;m.x+=m.vx;m.y+=m.vy;
     const f=Math.max(0,1-m.life/m.max);
     const g=ctx.createLinearGradient(m.x-110,m.y-60,m.x,m.y);
     g.addColorStop(0,'rgba(205,221,255,0)');
     g.addColorStop(.72,'rgba(220,232,255,'+(f*.22)+')');
     g.addColorStop(1,'rgba(255,255,255,'+(f*.75)+')');
     ctx.strokeStyle=g;ctx.lineWidth=1.2;
     ctx.beginPath();ctx.moveTo(m.x-110,m.y-60);ctx.lineTo(m.x,m.y);ctx.stroke();
     if(m.life>m.max||m.x>w+120||m.y>h+80)meteors.splice(i,1);
   }
 };

 const frame=t=>{
   requestAnimationFrame(frame);
   if(!visible||t-last<(isTouch?42:26))return;
   last=t;
   ctx.clearRect(0,0,w,h);
   drawNebula(t);
   drawMilkyWay(t);
   drawDust(t);
   drawStars(t);
   spawnMeteor();
   drawMeteors();
 };
 addEventListener('resize',resize,{passive:true});
 addEventListener('pointermove',e=>{
   pointer.x=e.clientX/innerWidth-.5;
   pointer.y=e.clientY/innerHeight-.5;
   document.documentElement.style.setProperty('--bg-parallax-x',(pointer.x*12).toFixed(2)+'px');
   document.documentElement.style.setProperty('--bg-parallax-y',(pointer.y*8).toFixed(2)+'px');
 },{passive:true});
 addEventListener('scroll',()=>{
   if(prefersReduced)return;
   const depth=Math.min(scrollY/Math.max(document.body.scrollHeight-innerHeight,1),1);
   document.documentElement.style.setProperty('--bg-scroll-depth',depth.toFixed(4));
 },{passive:true});
 document.addEventListener('visibilitychange',()=>visible=!document.hidden);
 resize();requestAnimationFrame(frame);
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
   Frosted Panel + Dark Glass + Button Mode + Dome Bevel/Magnifier.
   One LiquidGlass instance is created per immediate parent root so glass
   elements remain direct children and WebGL contexts stay bounded.
========================================================================= */
(async()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const instances=[];
  /* Final materials are applied BEFORE init so the first WebGL frame already
     uses the final optical settings. No post-load mutation or visual jump. */
  const frosted={
    blurAmount:.20,refraction:.68,chromAberration:.020,edgeHighlight:.085,
    specular:.085,fresnel:.86,distortion:.0025,opacity:.42,saturation:.00,
    tintStrength:.009,brightness:-.24,shadowOpacity:.40,shadowSpread:14,
    shadowOffsetY:3,floating:false,button:false,bevelMode:0
  };
  const dark={
    blurAmount:.22,refraction:.70,chromAberration:.018,edgeHighlight:.075,
    specular:.075,fresnel:.82,distortion:.002,opacity:.46,saturation:-.01,
    tintStrength:.010,brightness:-.30,shadowOpacity:.48,shadowSpread:18,
    shadowOffsetY:4,floating:false,button:false,bevelMode:0
  };
  const control={
    blurAmount:.16,refraction:.76,chromAberration:.018,edgeHighlight:.11,
    specular:.13,fresnel:.94,distortion:.003,opacity:.58,saturation:.015,
    tintStrength:.012,brightness:-.16,shadowOpacity:.34,shadowSpread:10,
    shadowOffsetY:2,floating:false,button:true,bevelMode:0
  };
  const contact={
    blurAmount:.15,refraction:.62,chromAberration:.012,edgeHighlight:.055,
    specular:.05,fresnel:.72,distortion:.001,opacity:.50,saturation:-.02,
    tintStrength:.006,brightness:-.26,shadowOpacity:.16,shadowSpread:5,
    shadowOffsetY:2,floating:false,button:false,bevelMode:0,cornerRadius:34,zRadius:18
  };
  const dome={
    blurAmount:.10,refraction:1.12,chromAberration:.018,edgeHighlight:.16,
    specular:.20,fresnel:1.10,distortion:.003,opacity:.70,saturation:.015,
    tintStrength:.012,brightness:-.08,shadowOpacity:.34,shadowSpread:10,
    shadowOffsetY:2,floating:false,button:false,bevelMode:1
  };

  try{
    /* Let first paint, layout and interaction settle before creating WebGL
       contexts. The page is already usable through the CSS glass fallback. */
    await new Promise(resolve=>{
      const run=()=>requestAnimationFrame(()=>requestAnimationFrame(resolve));
      if('requestIdleCallback' in window) requestIdleCallback(run,{timeout:900});
      else setTimeout(run,350);
    });
    const {LiquidGlass}=await import('https://cdn.jsdelivr.net/npm/@ybouane/liquidglass/dist/index.js');
    const groups=new Map();

    const add=(el,cfg)=>{
      if(!el||el.closest('#mobile-glass-root'))return;
      const root=el.parentElement;
      if(!root)return;
      if(!groups.has(root))groups.set(root,[]);
      groups.get(root).push({el,cfg});
      el.dataset.config=JSON.stringify(cfg);
    };

    document.querySelectorAll('.glass-panel,.glass-card').forEach(el=>{
      const darkMode=el.matches('.education-shell,.achievement-shell,.leadership-shell,.contact-shell,.command-panel,.project-modal-card');
      add(el,el.matches('.contact-shell')?contact:(darkMode?dark:frosted));
    });

    document.querySelectorAll('.glass-button,.glass-control').forEach(el=>{
      add(el,control);
    });

    const orbit=document.querySelector('.achievement-orbit');
    if(orbit){
      const radius=Math.min(50,Math.max(24,orbit.offsetHeight/2||32));
      add(orbit,{...dome,cornerRadius:radius,zRadius:radius});
      orbit.classList.add('liquid-dome');
    }

    /* Initialize independent glass roots concurrently. The previous
       sequential await made every mobile box wait for the box before it,
       producing visible cascading latency. */
    await Promise.all([...groups].map(async([root,items])=>{
      if(getComputedStyle(root).position==='static')root.style.position='relative';
      const elements=[...new Set(items.map(x=>x.el))];
      const instance=await LiquidGlass.init({
        root,
        glassElements:elements,
        defaults:{...frosted}
      });
      instances.push(instance);
    }));

    /* Mobile navigation deliberately stays CSS-rendered.
       A page-sized WebGL root is not used here because mobile browsers can
       resize its backing canvas independently from the visual viewport. */
    const mobileRoot=document.querySelector('#mobile-glass-root');
    if(mobileRoot) mobileRoot.classList.add('mobile-css-glass');

    window.__liquidGlassInstances=instances;
    document.documentElement.classList.remove('liquid-glass-fallback');
    document.documentElement.classList.add('liquid-glass-ready');
    document.documentElement.classList.remove('liquid-glass-fallback');
    document.documentElement.classList.add('liquid-glass-ready');

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
