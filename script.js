const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch=matchMedia('(pointer: coarse)').matches;
const loader=document.querySelector('#loader');
const loaderBar=loader?.querySelector('.loader-line i');

requestAnimationFrame(()=>loaderBar?.classList.add('is-loaded'));
window.setTimeout(()=>loader?.classList.add('is-done'),prefersReduced?180:900);

const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('#primary-nav');
const closeMenu=()=>{menu?.setAttribute('aria-expanded','false');document.body.classList.remove('nav-open');nav?.setAttribute('aria-hidden','true')};
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));document.body.classList.toggle('nav-open',!open);nav?.setAttribute('aria-hidden',String(open))});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});

const mount=document.querySelector('#scene');
if(mount){
 const canvas=document.createElement('canvas');
 canvas.className='star-canvas';
 mount.append(canvas);
 const ctx=canvas.getContext('2d',{alpha:false});
 let w=0,h=0,dpr=1,last=0,visible=true;
 let pointer={x:0,y:0};
 const stars=[],meteors=[];
 const makeStars=()=>{
   stars.length=0;
   const count=isTouch?260:Math.min(1200,Math.max(520,Math.floor(innerWidth*innerHeight/1450)));
   for(let i=0;i<count;i++)stars.push({
     x:Math.random(),y:Math.random(),z:.12+Math.random()*.88,
     r:.22+Math.random()*1.25,a:.2+Math.random()*.72,
     phase:Math.random()*Math.PI*2,twinkle:.35+Math.random()*1.8,
     drift:(Math.random()-.5)*.000018
   });
 };
 const meteor=()=>{
   if(prefersReduced||isTouch||meteors.length>1||Math.random()>.0012)return;
   meteors.push({x:Math.random()*w*.9,y:Math.random()*h*.35,v:8+Math.random()*7,life:0,max:55+Math.random()*45});
 };
 const frame=time=>{
   requestAnimationFrame(frame);
   if(!visible||time-last<(isTouch?45:28))return;
   last=time;ctx.fillStyle='#02030a';ctx.fillRect(0,0,w,h);
      const px=pointer.x*12,py=pointer.y*8;
   for(const s of stars){
     s.x=(s.x+s.drift)%1;if(s.x<0)s.x=1;
     const x=s.x*w+px*s.z,y=s.y*h+py*s.z;
     const tw=prefersReduced?1:.78+.22*Math.sin(time*.001*s.twinkle+s.phase);
     const alpha=s.a*tw*(.45+.55*s.z);
     ctx.beginPath();ctx.fillStyle='rgba(218,228,255,'+alpha+')';ctx.arc(x,y,s.r*(.55+.75*s.z),0,Math.PI*2);ctx.fill();
     if(s.z>.78&&!prefersReduced){ctx.beginPath();ctx.fillStyle='rgba(255,255,255,'+(alpha*.12)+')';ctx.arc(x,y,s.r*3,0,Math.PI*2);ctx.fill();}
   }
   meteor();
   for(let i=meteors.length-1;i>=0;i--){
     const m=meteors[i];m.life++;m.x+=m.v;m.y+=m.v*.55;
     const fade=Math.max(0,1-m.life/m.max);
     const grad=ctx.createLinearGradient(m.x-100,m.y-55,m.x,m.y);
     grad.addColorStop(0,'rgba(205,221,255,0)');grad.addColorStop(1,'rgba(220,232,255,'+Math.max(0,fade*.65)+')');
     ctx.strokeStyle=grad;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(m.x-100,m.y-55);ctx.lineTo(m.x,m.y);ctx.stroke();
     if(m.life>m.max||m.x>w+120||m.y>h+80)meteors.splice(i,1);
   }
 };
 addEventListener('resize',resize,{passive:true});
 addEventListener('pointermove',e=>{pointer.x=e.clientX/innerWidth-.5;pointer.y=e.clientY/innerHeight-.5},{passive:true});
 document.addEventListener('visibilitychange',()=>visible=!document.hidden);
 resize();requestAnimationFrame(frame);
}

if(!prefersReduced&&!isTouch){
 document.querySelectorAll('.glass-card,.glass-panel').forEach(card=>{
   card.addEventListener('pointermove',e=>{
     const r=card.getBoundingClientRect();
     card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');
     card.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');
   },{passive:true});
 });
}

if('IntersectionObserver'in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -8% 0px'});
 document.querySelectorAll('.section-head,.about-grid,.section-intro,.projects,.capabilities,.timeline,.education-line,.highlights,.contact-grid').forEach(el=>{el.classList.add('reveal');if(prefersReduced)el.classList.add('is-visible');else observer.observe(el)});
 const links=[...document.querySelectorAll('#primary-nav a')];
 const sections=[...document.querySelectorAll('main section[id]')];
 const active=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)links.forEach(l=>l.classList.toggle('is-active',l.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-38% 0px -52% 0px'});
 sections.forEach(s=>active.observe(s));
}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
 const target=document.querySelector(a.getAttribute('href'));if(!target)return;e.preventDefault();target.scrollIntoView({behavior:prefersReduced?'auto':'smooth',block:'start'});
}));
addEventListener('scroll',()=>document.body.classList.toggle('has-scrolled',scrollY>24),{passive:true});

const schema={'@context':'https://schema.org','@type':'Person',name:'Rishabh Jain',url:'https://rishabh12005.me/',email:'mailto:2r10j5@gmail.com',sameAs:['https://github.com/RISHABH12005','https://www.linkedin.com/in/rishabh12005','https://www.youtube.com/@RISHABH12005']};
const schemaScript=document.createElement('script');schemaScript.type='application/ld+json';schemaScript.textContent=JSON.stringify(schema);document.head.appendChild(schemaScript);


/* Copy protection */
(()=>{
  const blocked=(e)=>{e.preventDefault();e.stopPropagation();return false};
  document.addEventListener('contextmenu',blocked,{capture:true});
  document.addEventListener('selectstart',blocked,{capture:true});
  document.addEventListener('dragstart',blocked,{capture:true});
  document.addEventListener('copy',blocked,{capture:true});
  document.addEventListener('cut',blocked,{capture:true});
  document.addEventListener('keydown',e=>{
    const key=e.key.toLowerCase();
    if((e.ctrlKey||e.metaKey)&&['c','x','a','u','s','p'].includes(key))blocked(e);
    if(e.key==='F12'||(e.ctrlKey&&e.shiftKey&&['i','j','c'].includes(key)))blocked(e);
  },{capture:true});
})();
