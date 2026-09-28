/* =====================================================================
   ENHANCED LIQUID GLASS TUNING
   Runs after the main LiquidGlass bootstrap and updates its per-element
   data-config through the library's supported MutationObserver path.
===================================================================== */
(()=> {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  const dark={
    blurAmount:.22,refraction:.70,chromAberration:.018,edgeHighlight:.075,
    specular:.075,fresnel:.82,distortion:.002,opacity:.46,saturation:-.01,
    tintStrength:.010,brightness:-.30,shadowOpacity:.48,shadowSpread:18,
    shadowOffsetY:4,floating:false,button:false,bevelMode:0
  };
  const card={
    blurAmount:.20,refraction:.68,chromAberration:.020,edgeHighlight:.085,
    specular:.085,fresnel:.86,distortion:.0025,opacity:.42,saturation:.00,
    tintStrength:.009,brightness:-.24,shadowOpacity:.40,shadowSpread:14,
    shadowOffsetY:3,floating:false,button:false,bevelMode:0
  };
  const control={
    blurAmount:.16,refraction:.76,chromAberration:.018,edgeHighlight:.11,
    specular:.13,fresnel:.94,distortion:.003,opacity:.58,saturation:.015,
    tintStrength:.012,brightness:-.16,shadowOpacity:.34,shadowSpread:10,
    shadowOffsetY:2,floating:false,button:true,bevelMode:0
  };

  const apply=()=>{
    document.documentElement.classList.add('liquid-enhanced');

    document.querySelectorAll('.glass-panel,.glass-card').forEach(el=>{
      const isShell=el.matches(
        '.education-shell,.achievement-shell,.leadership-shell,.contact-shell,.command-panel,.project-modal-card'
      );
      el.dataset.config=JSON.stringify(isShell?dark:card);
    });

    document.querySelectorAll('.glass-button,.glass-control').forEach(el=>{
      el.dataset.config=JSON.stringify(control);
    });

    const orbit=document.querySelector('.achievement-orbit');
    if(orbit){
      const r=Math.min(54,Math.max(26,(orbit.getBoundingClientRect().width||72)/2));
      orbit.dataset.config=JSON.stringify({
        ...control,
        blurAmount:.10,
        refraction:1.12,
        opacity:.70,
        brightness:-.08,
        edgeHighlight:.16,
        specular:.20,
        fresnel:1.10,
        cornerRadius:r,
        zRadius:r,
        bevelMode:1,
        button:false
      });
    }
  };

  /* Main bootstrap adds the ready class asynchronously. */
  const boot=()=>{
    apply();
    setTimeout(apply,80);
    setTimeout(apply,420);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  /* Cursor-responsive optical movement on cards. */
  if(!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.querySelectorAll('.glass-card,.glass-panel').forEach(el=>{
      el.addEventListener('pointermove',e=>{
        const r=el.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width;
        const y=(e.clientY-r.top)/r.height;
        el.style.setProperty('--mx',(x*100).toFixed(1)+'%');
        el.style.setProperty('--my',(y*100).toFixed(1)+'%');
        if(el.classList.contains('glass-card')){
          const rx=((.5-y)*2.2).toFixed(2);
          const ry=((x-.5)*2.2).toFixed(2);
          el.style.transform='translate3d(0,-5px,0) perspective(900px) rotateX('+rx+'deg) rotateY('+ry+'deg)';
        }
      },{passive:true});
      el.addEventListener('pointerleave',()=>{
        el.style.transform='';
      },{passive:true});
    });
  }
})();
