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

  document.querySelectorAll('.experience-toggle').forEach(toggle=>{
    toggle.addEventListener('pointermove',event=>{
      const rect=toggle.getBoundingClientRect();
      toggle.style.setProperty('--switch-x',`${((event.clientX-rect.left)/rect.width*100).toFixed(1)}%`);
      toggle.style.setProperty('--switch-y',`${((event.clientY-rect.top)/rect.height*100).toFixed(1)}%`);
    },{passive:true});
    toggle.addEventListener('click',()=>{
      const card=toggle.closest('.experience-card');
      const impact=card?.querySelector('.experience-impact');
      if(!card||!impact)return;
      const expanded=toggle.getAttribute('aria-expanded')==='true';
      toggle.setAttribute('aria-expanded',String(!expanded));
      impact.setAttribute('aria-hidden',String(expanded));
      card.classList.toggle('is-expanded',!expanded);
    });

    document.querySelectorAll('.contact-email,.contact-link-grid a,.project-link,.demo-links a,.glass-button').forEach(action=>{
      action.addEventListener('pointermove',event=>{
        const rect=action.getBoundingClientRect();
        action.style.setProperty('--action-x',`${((event.clientX-rect.left)/rect.width*100).toFixed(1)}%`);
        action.style.setProperty('--action-y',`${((event.clientY-rect.top)/rect.height*100).toFixed(1)}%`);
      },{passive:true});
      action.addEventListener('pointerleave',()=>{
        action.style.removeProperty('--action-x');
        action.style.removeProperty('--action-y');
      },{passive:true});
    });

    const primaryNav=document.querySelector('#primary-nav');
    primaryNav?.addEventListener('pointermove',event=>{
      const rect=primaryNav.getBoundingClientRect();
      primaryNav.style.setProperty('--nav-x',`${((event.clientX-rect.left)/rect.width*100).toFixed(1)}%`);
      primaryNav.style.setProperty('--nav-y',`${((event.clientY-rect.top)/rect.height*100).toFixed(1)}%`);
    },{passive:true});
  });

  document.querySelectorAll('.section-kicker').forEach(kicker=>{
    kicker.addEventListener('pointermove',event=>{
      const rect=kicker.getBoundingClientRect();
      kicker.style.setProperty('--kicker-x',`${((event.clientX-rect.left)/rect.width*100).toFixed(1)}%`);
      kicker.style.setProperty('--kicker-y',`${((event.clientY-rect.top)/rect.height*100).toFixed(1)}%`);
    },{passive:true});
    kicker.addEventListener('pointerleave',()=>{
      kicker.style.removeProperty('--kicker-x');
      kicker.style.removeProperty('--kicker-y');
    },{passive:true});
  });

  if(!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.querySelectorAll('#projects .project-media').forEach(media=>{
      media.addEventListener('pointermove',e=>{
        const r=media.getBoundingClientRect();
        media.style.setProperty('--preview-x',`${((e.clientX-r.left)/r.width*100).toFixed(1)}%`);
        media.style.setProperty('--preview-y',`${((e.clientY-r.top)/r.height*100).toFixed(1)}%`);
      },{passive:true});
      media.addEventListener('pointerleave',()=>{
        media.style.removeProperty('--preview-x');
        media.style.removeProperty('--preview-y');
      },{passive:true});
    });
  }

  if(!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.querySelectorAll('#projects .project-card').forEach(card=>{
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width;
        const y=(e.clientY-r.top)/r.height;
        card.style.setProperty('--project-x',`${(x*100).toFixed(1)}%`);
        card.style.setProperty('--project-y',`${(y*100).toFixed(1)}%`);
      },{passive:true});
      card.addEventListener('pointerleave',()=>{
        card.style.removeProperty('--project-x');
        card.style.removeProperty('--project-y');
      },{passive:true});
    });
  }

  if(!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches){
    const innerCards=document.querySelectorAll(
      '#education .education-card, #education .profile-card, ' +
      '#experience .experience-card, #achievements .achievement-item, ' +
      '#leadership .leadership-list > div, #skills .skill-card, ' +
      '#certificates .certificate-card'
    );
    innerCards.forEach(card=>{
      card.classList.add('interactive-inner-card');
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width;
        const y=(e.clientY-r.top)/r.height;
        const rx=((.5-y)*1.5).toFixed(2);
        const ry=((x-.5)*1.5).toFixed(2);
        card.style.setProperty('--inner-x',`${(x*100).toFixed(1)}%`);
        card.style.setProperty('--inner-y',`${(y*100).toFixed(1)}%`);
        card.style.transform=`translate3d(0,-3px,0) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      },{passive:true});
      card.addEventListener('pointerleave',()=>{
        card.style.removeProperty('--inner-x');
        card.style.removeProperty('--inner-y');
        card.style.removeProperty('transform');
      },{passive:true});
    });
  }

  if(!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.querySelectorAll('#projects .project-content').forEach(content=>{
      content.classList.add('interactive-project-content');
      content.addEventListener('pointermove',e=>{
        const r=content.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width;
        const y=(e.clientY-r.top)/r.height;
        const rx=((.5-y)*1.1).toFixed(2);
        const ry=((x-.5)*1.1).toFixed(2);
        content.style.setProperty('--content-x',`${(x*100).toFixed(1)}%`);
        content.style.setProperty('--content-y',`${(y*100).toFixed(1)}%`);
        content.style.transform=`perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      },{passive:true});
      content.addEventListener('pointerleave',()=>{
        content.style.removeProperty('--content-x');
        content.style.removeProperty('--content-y');
        content.style.removeProperty('transform');
      },{passive:true});
    });
  }

  if(!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches){
    const achievementShell=document.querySelector('#achievements .achievement-shell');
    if(achievementShell){
      achievementShell.addEventListener('pointermove',e=>{
        const r=achievementShell.getBoundingClientRect();
        achievementShell.style.setProperty('--achievement-x',`${((e.clientX-r.left)/r.width*100).toFixed(1)}%`);
        achievementShell.style.setProperty('--achievement-y',`${((e.clientY-r.top)/r.height*100).toFixed(1)}%`);
      },{passive:true});
      achievementShell.addEventListener('pointerleave',()=>{
        achievementShell.style.removeProperty('--achievement-x');
        achievementShell.style.removeProperty('--achievement-y');
      },{passive:true});
    }
  }

  if(!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches){
    const mobilePanel=document.querySelector('#mobile-glass-nav');
    const menuButton=document.querySelector('.mobile-glass-root .menu-toggle');
    const track=(element,prefix,e)=>{
      const r=element.getBoundingClientRect();
      element.style.setProperty(`--${prefix}-x`,`${((e.clientX-r.left)/r.width*100).toFixed(1)}%`);
      element.style.setProperty(`--${prefix}-y`,`${((e.clientY-r.top)/r.height*100).toFixed(1)}%`);
    };
    mobilePanel?.addEventListener('pointermove',e=>track(mobilePanel,'mobile',e),{passive:true});
    menuButton?.addEventListener('pointermove',e=>track(menuButton,'menu',e),{passive:true});
  }
})();
