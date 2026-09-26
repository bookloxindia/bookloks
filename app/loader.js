
(function registerBookLoksPWA(){
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).then(reg => {
      try { reg.update(); } catch (_) {}
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            try { reg.waiting?.postMessage({type:'SKIP_WAITING'}); } catch (_) {}
          }
        });
      });
    }).catch(err => console.warn('BookLoks PWA registration failed:', err));
  });
})();

(async function () {
  const app = document.getElementById('app');
  try {
    const response = await fetch('../data/manifest.json?v=7.0', { cache: 'no-store' });
    if (!response.ok) throw new Error('Manifest load failed: ' + response.status);
    const manifest = await response.json();
    window.APP_DATA = {
      subjects: manifest.subjects,
      books: manifest.books,
      curriculum: manifest.curriculum,
      notes: manifest.notes
    };
    const script = document.createElement('script');
    script.src = 'app.js';
    script.onload = () => {
      try { window.__bookloksReady = true; window.startBackgroundMusic?.(); } catch (_) {}
      const standalone = window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
      const delay = standalone ? 550 : 2400;
      window.setTimeout(() => {
        document.getElementById('splashScreen')?.classList.add('hide');
        try {
          const onboarded = localStorage.getItem('bookloks_onboarding_done') === '1';
          const hasName = !!window.bookloksPlayerName?.();
          if (onboarded && hasName) {
            window.showReturningWelcome?.();
          } else {
            if (onboarded && !hasName) localStorage.removeItem('bookloks_onboarding_done');
            const firstRun = window.startFirstRunOnboarding?.() === true;
            if (!firstRun && hasName) window.showReturningWelcome?.();
          }
        } catch (err) { console.warn('BookLoks welcome flow:', err); }
      }, delay);
    };
    document.body.appendChild(script);
  } catch (err) {
    console.error(err);
    document.getElementById('splashScreen')?.classList.add('hide');
    app.innerHTML = '<section style="padding:40px;text-align:center"><h2>BookLoks could not load</h2><p>Please open the app through GitHub Pages / Cloudflare Pages, not as a local file.</p><p style="color:#a00">' + String(err.message || err) + '</p></section>';
  }
})();
