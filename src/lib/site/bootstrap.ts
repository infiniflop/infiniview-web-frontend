// Runs before paint to set the initial theme - avoids a flash of the wrong
// palette on first load. Reads the saved preference, then falls back to the
// OS preference. Also flags `js` so scroll-reveal content is only hidden when
// script can reveal it, marks everything except the light/dark /preview demo as a dark surface (so
// the page ground and overscroll area are right at first paint), and arms a failsafe that un-hides marketing content if the
// motion layer never boots (a no-op elsewhere, e.g. /preview). Kept tiny and
// inlined; no React state involved.
export const themeInitScript = `(function(){try{var c=document.cookie.match(/(?:^|; )theme=(light|dark)/);var s=localStorage.getItem('theme');var t=(c?c[1]:null)||(s==='light'||s==='dark'?s:null)||(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');if(t==='light')document.documentElement.classList.add('light');}catch(e){}document.documentElement.classList.add('js');if(location.pathname.indexOf('/preview')!==0)document.documentElement.classList.add('surface-dark');setTimeout(function(){if(document.querySelector('.site-root')&&document.documentElement.dataset.motion!=='ready')document.documentElement.classList.add('reveal-failsafe')},5000);})();`;
