/* =====================================================================
   ENHANCED LIQUID GLASS TUNING
   Runs after the main LiquidGlass bootstrap and updates its per-element
   data-config through the library's supported MutationObserver path.
===================================================================== */
(()=> {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Material configuration is owned by script.js now. This file only
     handles interaction after the WebGL instance is already stable. */

  const apply=()=>{
    document.documentElement.classList.add('liquid-enhanced');
  };

  /* Main bootstrap adds the ready class asynchronously. */
  const boot=()=>{
    const run=()=>{
      apply();
    };
    if(document.documentElement.classList.contains('liquid-glass-ready') ||
       document.documentElement.classList.contains('liquid-glass-fallback')){
      run();
      return;
    }
    const observer=new MutationObserver(()=>{
      if(document.documentElement.classList.contains('liquid-glass-ready') ||
         document.documentElement.classList.contains('liquid-glass-fallback')){
        observer.disconnect();
        run();
      }
    });
    observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
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
