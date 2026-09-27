import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const loader=document.querySelector('#loader'),bar=loader?.querySelector('i');

function intro(){
 if(!window.anime){loader?.remove();return}
 window.anime({targets:bar,scaleX:1,duration:800,easing:'easeInOutQuart',complete:()=>window.anime({targets:loader,opacity:0,duration:320,complete:()=>loader.remove()})});
 window.anime({targets:'.hero h1 span',translateY:[65,0],opacity:[0,1],delay:window.anime.stagger(110,{start:220}),duration:1000,easing:'easeOutExpo'});
}
function loadAnime(){
 const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/animejs@4.0.2/dist/bundles/anime.umd.min.js';s.onload=intro;s.onerror=()=>loader?.remove();document.head.appendChild(s);
}
loadAnime();

document.querySelectorAll('.project').forEach(card=>{
 card.addEventListener('mousemove',e=>{
  if(prefersReduced)return;
  const r=card.getBoundingClientRect(),x=e.clientX/r.width-r.left/r.width-.5,y=e.clientY/r.height-r.top/r.height-.5;
  card.style.transform='perspective(1000px) rotateX('+(-y*3)+'deg) rotateY('+(x*4)+'deg) translateY(-5px)';
 });
 card.addEventListener('mouseleave',()=>card.style.transform='');
});

const mount=document.querySelector('#hero-3d');
if(mount&&!prefersReduced){
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(42,1,.1,100);
 camera.position.set(0,0,6.8);
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(mount.clientWidth,mount.clientHeight);mount.appendChild(renderer.domElement);

 const group=new THREE.Group();scene.add(group);
 const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.18,2),new THREE.MeshPhysicalMaterial({color:0x111522,metalness:.75,roughness:.2,wireframe:false,transparent:true,opacity:.96}));
 group.add(core);
 const wire=new THREE.Mesh(new THREE.IcosahedronGeometry(1.28,2),new THREE.MeshBasicMaterial({color:0x746cff,wireframe:true,transparent:true,opacity:.5}));
 group.add(wire);
 const ring1=new THREE.Mesh(new THREE.TorusGeometry(1.75,.018,12,180),new THREE.MeshBasicMaterial({color:0xd7ff3f,transparent:true,opacity:.8}));
 ring1.rotation.x=1.05;group.add(ring1);
 const ring2=ring1.clone();ring2.material=ring1.material.clone();ring2.material.opacity=.35;ring2.rotation.x=-.6;ring2.rotation.y=.55;group.add(ring2);
 const dotGeo=new THREE.SphereGeometry(.055,12,12),dotMat=new THREE.MeshBasicMaterial({color:0xd7ff3f});
 for(let i=0;i<10;i++){const d=new THREE.Mesh(dotGeo,dotMat);const a=i/10*Math.PI*2;d.position.set(Math.cos(a)*2.05,Math.sin(a)*2.05,.1*Math.sin(i));group.add(d)}
 const light=new THREE.PointLight(0x746cff,8,8);light.position.set(2,2,3);scene.add(light);
 const fill=new THREE.PointLight(0xd7ff3f,4,7);fill.position.set(-3,-1,2);scene.add(fill);
 let tx=0,ty=0;addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*.55;ty=(e.clientY/innerHeight-.5)*.32});
 function resize(){const w=mount.clientWidth,h=mount.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)}
 addEventListener('resize',resize);
 function loop(){requestAnimationFrame(loop);group.rotation.y+=.002;group.rotation.x+=.0007;group.rotation.y+=(tx-group.rotation.y)*.003;group.rotation.x+=(ty-group.rotation.x)*.003;wire.rotation.y-=.001;ring1.rotation.z+=.006;ring2.rotation.z-=.004;renderer.render(scene,camera)}
 loop();
}

const dots=document.querySelector('.motion-dots');
if(dots){
 for(let i=0;i<12;i++){const d=document.createElement('i');d.style.left=(50+Math.cos(i/12*Math.PI*2)*42)+'%';d.style.top=(50+Math.sin(i/12*Math.PI*2)*42)+'%';dots.appendChild(d)}
 const animateDots=()=>{
  if(prefersReduced)return;
  if(window.anime)window.anime({targets:'.motion-dots i',translateY:()=>[-10,10][Math.floor(Math.random()*2)],translateX:()=>[-8,8][Math.floor(Math.random()*2)],scale:[.7,1.4],opacity:[.35,1],duration:900,delay:window.anime.stagger(70),direction:'alternate',loop:true,easing:'easeInOutSine'});
  else setTimeout(animateDots,300);
 };
 setTimeout(animateDots,900);
}