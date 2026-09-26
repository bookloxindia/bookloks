(async function () {
  const app = document.getElementById('app');
  try {
    const response = await fetch('../data/manifest.json', { cache: 'no-store' });
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
    script.onload = () => { window.setTimeout(() => document.getElementById('splashScreen')?.classList.add('hide'), 3200); };
    document.body.appendChild(script);
  } catch (err) {
    console.error(err);
    document.getElementById('splashScreen')?.classList.add('hide');
    app.innerHTML = '<section style="padding:40px;text-align:center"><h2>BookLoks could not load</h2><p>Please open the app through GitHub Pages / Cloudflare Pages, not as a local file.</p><p style="color:#a00">' + String(err.message || err) + '</p></section>';
  }
})();
