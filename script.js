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
 import('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js').then(({GLTFLoader})=>{
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(32,1,.1,100);
  camera.position.set(0,0,7.2);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setSize(mount.clientWidth,mount.clientHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  const world=new THREE.Group();
  world.rotation.z=-0.48;
  world.rotation.x=0.08;
  scene.add(world);

  const ambient=new THREE.AmbientLight(0xffffff,1.7);
  scene.add(ambient);
  const key=new THREE.DirectionalLight(0xffffff,2.2);
  key.position.set(3,4,6);scene.add(key);

  const loader3d=new GLTFLoader();
  loader3d.load(
   'https://animejs.com/assets/models/module-engine-01.glb',
   gltf=>{
    const model=gltf.scene;
    const lineMat=new THREE.LineBasicMaterial({color:0x77736d,transparent:true,opacity:.82});
    const fillMat=new THREE.MeshBasicMaterial({color:0xe8e3dc,transparent:true,opacity:.12,side:THREE.DoubleSide});
    const lineGroup=new THREE.Group();

    model.traverse(obj=>{
      if(!obj.isMesh||!obj.geometry)return;
      const fill=obj.clone();
      fill.material=fillMat;
      lineGroup.add(fill);

      const edges=new THREE.EdgesGeometry(obj.geometry,18);
      const lines=new THREE.LineSegments(edges,lineMat);
      lines.position.copy(obj.position);
      lines.rotation.copy(obj.rotation);
      lines.scale.copy(obj.scale);
      lineGroup.add(lines);
    });

    world.add(lineGroup);
    const box=new THREE.Box3().setFromObject(lineGroup);
    const size=box.getSize(new THREE.Vector3());
    const center=box.getCenter(new THREE.Vector3());
    lineGroup.position.sub(center);
    const scale=4.8/Math.max(size.x,size.y,size.z);
    lineGroup.scale.setScalar(scale);
   },
   undefined,
   ()=>fallbackCore()
  );

  function fallbackCore(){
   const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.15,2),new THREE.MeshBasicMaterial({color:0x151923,wireframe:true,transparent:true,opacity:.7}));
   world.add(core);
  }

  let tx=0,ty=0;
  addEventListener('pointermove',e=>{
   tx=(e.clientX/innerWidth-.5)*.35;
   ty=(e.clientY/innerHeight-.5)*.2;
  });

  function resize(){
   const w=mount.clientWidth,h=mount.clientHeight;
   camera.aspect=w/h;
   camera.updateProjectionMatrix();
   renderer.setSize(w,h);
  }
  addEventListener('resize',resize);

  const clock=new THREE.Clock();
  function loop(){
   requestAnimationFrame(loop);
   const t=clock.getElapsedTime();
   world.rotation.z=-0.48+t*(Math.PI*2/64);
   world.rotation.x+=(ty-world.rotation.x)*.018;
   world.rotation.y+=(tx-world.rotation.y)*.018;
   renderer.render(scene,camera);
  }
  loop();
 }).catch(()=>{});
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