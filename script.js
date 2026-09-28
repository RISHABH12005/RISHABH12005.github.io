const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch=matchMedia('(pointer: coarse)').matches;
const loader=document.querySelector('#loader');
const loaderBar=loader?.querySelector('.loader-glass i b');
requestAnimationFrame(()=>loaderBar?.classList.add('is-loaded'));
setTimeout(()=>loader?.classList.add('is-done'),prefersReduced?180:850);

const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('#primary-nav');
const closeMenu=()=>{menu?.setAttribute('aria-expanded','false');document.body.classList.remove('nav-open');nav?.setAttribute('aria-hidden','true')};
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));document.body.classList.toggle('nav-open',!open);nav?.setAttribute('aria-hidden',String(open))});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
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
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -8% 0px'});document.querySelectorAll('.section-kicker,.section-title,.education-grid,.experience-grid,.project-grid,.achievement-shell,.leadership-shell,.skills-grid,.video-lab-grid,.certificate-grid,.contact-shell').forEach(el=>{el.classList.add('reveal');if(prefersReduced)el.classList.add('is-visible');else observer.observe(el)});const links=[...document.querySelectorAll('#primary-nav a')],sections=[...document.querySelectorAll('main section[id]')];const active=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)links.forEach(l=>l.classList.toggle('is-active',l.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-38% 0px -52% 0px'});sections.forEach(s=>active.observe(s))}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=document.querySelector(a.getAttribute('href'));if(!target)return;e.preventDefault();target.scrollIntoView({behavior:prefersReduced?'auto':'smooth',block:'start'})}));
addEventListener('scroll',()=>document.body.classList.toggle('has-scrolled',scrollY>24),{passive:true});

const schema={'@context':'https://schema.org','@type':'Person',name:'Rishabh Jain',url:'https://rishabh12005.me/',email:'mailto:2r10j5@gmail.com',sameAs:['https://github.com/RISHABH12005','https://www.linkedin.com/in/rishabh12005','https://www.youtube.com/@RISHABH12005']};const schemaScript=document.createElement('script');schemaScript.type='application/ld+json';schemaScript.textContent=JSON.stringify(schema);document.head.appendChild(schemaScript);

/* Copy protection */
(()=>{const blocked=e=>{e.preventDefault();e.stopPropagation();return false};['contextmenu','selectstart','dragstart','copy','cut'].forEach(t=>document.addEventListener(t,blocked,{capture:true}));document.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if((e.ctrlKey||e.metaKey)&&['c','x','a','u','s','p'].includes(k))blocked(e);if(e.key==='F12'||(e.ctrlKey&&e.shiftKey&&['i','j','c'].includes(k)))blocked(e)},{capture:true})})();

/* Advanced command center, project intelligence and public GitHub telemetry */
(()=>{
const hud=document.querySelector('#command-hud'),trigger=document.querySelector('#command-trigger'),input=document.querySelector('#command-input'),results=document.querySelector('#command-results');
const modal=document.querySelector('#project-modal'),modalContent=document.querySelector('#modal-content');
const toast=document.querySelector('#hud-toast');
const projects={
bharat:{k:'EDGE AI · RASPBERRY PI',t:'Bharat AI-SoC',d:'Offline Hindi voice assistant built for ARM edge deployment. Streaming Vosk ASR feeds a hybrid intent layer, state manager and offline eSpeak-NG TTS.',blocks:[['Pipeline','Microphone → Vosk ASR → NLP → State Manager → Action Layer → TTS'],['Engineering','Streaming inference, TF-IDF cosine fallback, wake-word activation and ARM-friendly execution']],url:'https://github.com/RISHABH12005/Bharat-AI-SoC'},
ids:{k:'IOT · SECURITY',t:'Intrusion Detection System',d:'ESP32-C5 security platform combining RFID identity, Wi-Fi client monitoring, MQTT events and Telegram control.',blocks:[['Detection','RC522 UID mapping, unknown-card alerts, replay detection and blocking logic'],['Network','Station + access-point mode, MQTT topics for scans, alerts and connected clients']],url:'https://github.com/RISHABH12005/Minor-II'},
robot:{k:'ROBOTICS · MINOR I',t:'Industrial Inspection Robot',d:'Robotic inspection and maintenance platform designed for industrial environments, anomaly detection and reporting.',blocks:[['Mission','Autonomous or semi-autonomous navigation with inspection and maintenance tasks'],['Documentation','Project report, SRS, presentations and robot test references are maintained in GitHub']],url:'https://github.com/RISHABH12005/Minor-I'},
lms:{k:'IOT · ROBOTICS',t:'Livestock Monitoring System',d:'Raspberry Pi prototype combining environmental sensing, camera monitoring, obstacle detection and motorized automation.',blocks:[['Hardware','Raspberry Pi 4B, Sense HAT, BrickPi, 5MP camera, ultrasonic sensors and speed motors'],['Software','FastAPI, WebSockets, OpenCV, Picamera2 and remote monitoring/control']],url:'https://github.com/RISHABH12005/LMS'},
drone:{k:'DRONE · EMBEDDED SYSTEMS',t:'AI Driven Surveillance Drone',d:'Major project focused on aerial surveillance using a flight-controller and companion-computing architecture.',blocks:[['System','Pixhawk flight control, Raspberry Pi companion computing and telemetry'],['Engineering','MAVLink-based communication, mission execution and real-time monitoring']],url:'https://github.com/RISHABH12005/Major-I'}
};
const navItems=[['01','Education','#education','SECTION'],['02','Experience','#experience','SECTION'],['03','Projects','#projects','SECTION'],['04','Achievements','#achievements','SECTION'],['05','Video Lab','#videos','SECTION'],['06','Leadership','#leadership','SECTION'],['07','Skills','#skills','SECTION'],['08','Certificates','#certificates','SECTION'],['09','Contact','#contact','SECTION'],['⌘','GitHub','https://github.com/RISHABH12005','EXTERNAL'],['↗','LinkedIn','https://www.linkedin.com/in/rishabh12005','EXTERNAL']];
function openHud(){hud?.classList.add('open');hud?.setAttribute('aria-hidden','false');if(input){input.value='';render('');setTimeout(()=>input.focus(),30)}}
function closeHud(){hud?.classList.remove('open');hud?.setAttribute('aria-hidden','true')}
function render(q=''){if(!results)return;const term=q.toLowerCase();const list=navItems.filter(x=>(x[1]+' '+x[3]).toLowerCase().includes(term));results.innerHTML=list.map(x=>'<button class="command-item" data-target="'+x[2]+'"><b>'+x[0]+'</b><span><strong>'+x[1]+'</strong><small>'+x[3]+'</small></span><em>↗</em></button>').join('')||'<div class="command-item"><b>—</b><span><strong>No result</strong><small>Try “projects”, “achievements”, “skills” or “contact”.</small></span></div>';results.querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>{const target=b.dataset.target;closeHud();if(target.startsWith('#'))document.querySelector(target)?.scrollIntoView({behavior:prefersReduced?'auto':'smooth'});else window.open(target,'_blank','noopener')})}
trigger?.addEventListener('click',openHud);input?.addEventListener('input',e=>render(e.target.value));document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openHud()}if(e.key==='Escape'){closeHud();closeProject()}});
document.querySelectorAll('[data-command-close]').forEach(x=>x.addEventListener('click',closeHud));
function openProject(key){const p=projects[key];if(!p||!modalContent)return;modalContent.innerHTML='<span class="modal-kicker">'+p.k+'</span><h2 class="modal-title">'+p.t+'</h2><p class="modal-copy">'+p.d+'</p><div class="modal-layout">'+p.blocks.map(b=>'<div class="modal-block"><strong>'+b[0]+'</strong><p>'+b[1]+'</p></div>').join('')+'</div><div class="modal-actions"><a href="'+p.url+'" target="_blank" rel="noopener noreferrer">VIEW GITHUB ↗</a>'+(p.demo?'<a href="'+p.demo+'" target="_blank" rel="noopener noreferrer">WATCH DEMO ↗</a>':'')+'</div>';modal.classList.add('open');modal.setAttribute('aria-hidden','false')}
function closeProject(){modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true')}document.querySelectorAll('.project-open').forEach(b=>b.addEventListener('click',()=>openProject(b.dataset.project)));document.querySelectorAll('[data-project-close]').forEach(x=>x.addEventListener('click',closeProject));
function showToast(t){if(!toast)return;toast.textContent=t;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),2200)}
const sync=document.querySelector('#github-sync');fetch('https://api.github.com/users/RISHABH12005').then(r=>r.ok?r.json():Promise.reject()).then(u=>{document.querySelector('#follower-count').textContent=u.followers;sync.textContent='CONNECTED'}).catch(()=>{sync.textContent='OFFLINE'});
fetch('https://api.github.com/users/RISHABH12005/repos?per_page=100').then(r=>r.ok?r.json():Promise.reject()).then(rs=>{document.querySelector('#repo-count').textContent=rs.length;document.querySelector('#star-count').textContent=rs.reduce((n,r)=>n+r.stargazers_count,0)}).catch(()=>{document.querySelector('#repo-count').textContent='—';document.querySelector('#star-count').textContent='—'});
render('');
})();


/* CSS-only liquid glass: the space canvas stays visible behind every surface. */
document.documentElement.classList.add('liquid-glass-fallback');
