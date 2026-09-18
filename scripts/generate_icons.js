/* Rasteriza icon.svg a los PNG de PWA y compone og.png sobre papel + tinta.
   node scripts/generate_icons.js   (con un server local en :8973) */
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.env.BERTOLA_URL || 'http://127.0.0.1:8973/';
const OUT = path.join(__dirname, '..', 'assets', 'img', 'logo');

(async () => {
  const b = await chromium.launch();

  for (const size of [96, 180, 192, 512]) {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    await p.setContent(`<body style="margin:0;background:#F2EDE1"><img src="${BASE}assets/img/logo/icon.svg" width="${size}" height="${size}"></body>`);
    await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(OUT, `icon-${size}.png`) });
    await p.close();
  }

  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.setContent(`<!DOCTYPE html><html><head><meta charset="utf-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Space+Mono:wght@400&display=swap">
    </head>
    <body style="margin:0;height:630px;background:#1F2A24;display:grid;place-items:center">
    <div style="display:flex;flex-direction:column;align-items:center;gap:28px">
      <div style="width:150px;height:150px;border-radius:50%;border:8px solid #A8503E;display:grid;place-items:center;position:relative">
        <div style="width:14px;height:88px;background:#A8503E;border-radius:3px;position:absolute;left:62px;top:31px"></div>
        <svg width="70" height="90" viewBox="0 0 70 90" style="position:absolute;left:76px;top:31px">
          <path fill="#A8503E" fill-rule="evenodd" d="M0 0 h10 c16 0 26 9 26 22 c0 10 -6 17 -15 20 c11 3 18 11 18 22 c0 14 -11 24 -28 24 h-11 z
            M6 12 v26 h14 c9 0 14 -5 14 -13 c0 -8 -5 -13 -14 -13 z
            M6 50 v26 h16 c10 0 16 -5 16 -13 c0 -8 -6 -13 -16 -13 z"/>
        </svg>
      </div>
      <p style="margin:0;font-family:'Fraunces',serif;font-weight:600;font-size:52px;color:#F2EDE1;letter-spacing:-.01em">Bértola Asesores</p>
      <p style="margin:0;font-family:'Space Mono',monospace;font-size:19px;letter-spacing:.28em;color:#C77E68;text-transform:uppercase">Lo que se presenta a tiempo, se sella</p>
    </div></body></html>`);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(OUT, 'og.png') });
  await b.close();
  console.log('iconos y og.png listos en', OUT);
})();
