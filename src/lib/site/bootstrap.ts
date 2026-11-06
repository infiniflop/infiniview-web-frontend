// Runs before paint, inlined in <head>; no React state involved. The site is dark only, so there is
// no theme to choose: the colour scheme comes from CSS and the viewport meta alone. This script
// flags `js` (so scroll-reveal content is only hidden when script can reveal it), marks every path
// except the /preview demo as the marketing surface (so the page ground and overscroll area are
// right at first paint), and arms a failsafe that un-hides marketing content if the motion layer
// never boots (not merely if it is slow: it waits for the page to finish loading, up to 8 s). The
// failsafe is a no-op where there is no `.site-root`, e.g. /preview.
export const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');if(location.pathname.indexOf('/preview')!==0){d.classList.add('surface-dark');d.style.backgroundColor='#03040a'}var t0=Date.now(),loadAt=0;window.addEventListener('load',function(){loadAt=Date.now()});(function chk(){if(!document.querySelector('.site-root')||d.dataset.motion==='ready')return;var now=Date.now();if(now-t0>=8000||(now-t0>=3000&&loadAt&&now-loadAt>=1500))d.classList.add('reveal-failsafe');else setTimeout(chk,300)})();})();`;
