// Runs before paint to set the initial theme - avoids a flash of the wrong
// palette on first load. Reads the saved preference, then falls back to the
// OS preference. Also flags `js` so scroll-reveal content is only hidden when
// script can reveal it, marks everything except the light/dark /preview demo as a dark surface (so
// the page ground and overscroll area are right at first paint), and arms a failsafe that un-hides marketing content if the
// motion layer never boots (not merely if it is slow: it waits for the page to finish loading, up to 8 s) (a no-op elsewhere, e.g. /preview). Kept tiny and
// inlined; no React state involved.
export const themeInitScript = `(function(){try{var c=document.cookie.match(/(?:^|; )theme=(light|dark)/);var s=localStorage.getItem('theme');var t=(c?c[1]:null)||(s==='light'||s==='dark'?s:null)||(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');if(t==='light')document.documentElement.classList.add('light');}catch(e){}document.documentElement.classList.add('js');if(location.pathname.indexOf('/preview')!==0){document.documentElement.classList.add('surface-dark');document.documentElement.style.backgroundColor='#03040a'}var t0=Date.now(),loadAt=0;window.addEventListener('load',function(){loadAt=Date.now()});(function chk(){var d=document.documentElement;if(!document.querySelector('.site-root')||d.dataset.motion==='ready')return;var now=Date.now();if(now-t0>=8000||(now-t0>=3000&&loadAt&&now-loadAt>=1500))d.classList.add('reveal-failsafe');else setTimeout(chk,300)})();})();`;
