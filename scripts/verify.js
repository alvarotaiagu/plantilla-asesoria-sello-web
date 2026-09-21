/* Verificación del PLIEGO §7 para Bértola Asesores.
   node scripts/verify.js   (con un server local sirviendo el repo) */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BERTOLA_URL || 'http://127.0.0.1:8994/';
const OUT = path.join(__dirname, '..', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

const TAMANOS = [
  { name: 'escritorio', width: 1440, height: 900 },
  { name: 'movil', width: 390, height: 844 }
];
const SECCIONES = ['#servicios', '#calendario', '#confianza', '#equipo', '#contacto'];

async function scrollHasta(page, selector) {
  for (let i = 0; i < 60; i++) {
    const enVista = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.45 && r.bottom > 0;
    }, selector);
    if (enVista) break;
    await page.mouse.wheel(0, 550);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(1600); // asentar Lenis + disparar IO/ScrollTrigger
}

function attachLoggers(page, bucket, etiqueta) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') bucket.consoleErrors.push(`[${etiqueta}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => bucket.consoleErrors.push(`[${etiqueta}] pageerror: ${err.message}`));
  page.on('requestfailed', (req) => {
    const f = req.failure();
    bucket.peticionesFallidas.push(`[${etiqueta}] ${req.url()} — ${f && f.errorText}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) bucket.peticionesFallidas.push(`[${etiqueta}] ${res.status()} ${res.url()}`);
  });
}

(async () => {
  const browser = await chromium.launch();
  const informe = { consoleErrors: [], peticionesFallidas: [], notas: [], comprobaciones: {} };

  /* ---------------- 1-4. Pasada normal, escritorio y móvil ---------------- */
  for (const tam of TAMANOS) {
    const opciones = { viewport: { width: tam.width, height: tam.height } };
    if (tam.name === 'movil') { opciones.isMobile = true; opciones.hasTouch = true; }
    const ctx = await browser.newContext(opciones);
    const page = await ctx.newPage();
    attachLoggers(page, informe, `normal-${tam.name}`);

    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForSelector('#cortina', { state: 'hidden', timeout: 6000 }).catch(() =>
      informe.notas.push(`La cortina no se retiró a tiempo en ${tam.name}`)
    );
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, `${tam.name}-01-portada.png`) });

    for (const sel of SECCIONES) {
      await scrollHasta(page, sel);
      const archivo = sel.replace('#', '');
      await page.screenshot({ path: path.join(OUT, `${tam.name}-${archivo}.png`) });
    }

    // Estado de las clases de movimiento
    const clases = await page.evaluate(() => ({
      jsMotion: document.documentElement.classList.contains('js-motion'),
      gsapListo: document.documentElement.classList.contains('gsap-listo')
    }));
    informe.comprobaciones[`clases-${tam.name}`] = clases;

    // Sellos estampados tras recorrer toda la página
    const selladosPendientes = await page.evaluate(() =>
      document.querySelectorAll('.sello[data-sello]:not(.golpeado)').length
    );
    informe.comprobaciones[`sellos-sin-estampar-${tam.name}`] = selladosPendientes;

    // Calendario: comprobar que se generaron filas
    const filasCalendario = await page.evaluate(() => document.querySelectorAll('.calendario-fila').length);
    informe.comprobaciones[`filas-calendario-${tam.name}`] = filasCalendario;

    if (tam.name === 'movil') {
      // Menú móvil
      await page.click('#menu-boton');
      await page.waitForTimeout(500);
      const expandido = await page.getAttribute('#menu-boton', 'aria-expanded');
      const abierto = await page.evaluate(() => document.getElementById('menu-movil').classList.contains('abierto'));
      informe.comprobaciones['menu-movil-abre'] = { expandido, abierto };
      await page.screenshot({ path: path.join(OUT, `${tam.name}-02-menu-abierto.png`) });
      await page.click('#menu-boton');
      await page.waitForTimeout(500);
      const expandidoCierra = await page.getAttribute('#menu-boton', 'aria-expanded');
      informe.comprobaciones['menu-movil-cierra'] = expandidoCierra;
    }

    if (tam.name === 'escritorio') {
      // Mapa bajo clic
      const iframesAntes = await page.evaluate(() => document.querySelectorAll('#mapa-caja iframe').length);
      await page.click('#mapa-boton');
      await page.waitForTimeout(600);
      const iframesDespues = await page.evaluate(() => document.querySelectorAll('#mapa-caja iframe').length);
      const srcMapa = await page.evaluate(() => {
        const ifr = document.querySelector('#mapa-caja iframe');
        return ifr ? ifr.src : null;
      });
      informe.comprobaciones['mapa-bajo-clic'] = { iframesAntes, iframesDespues, srcMapa };
      await page.screenshot({ path: path.join(OUT, `${tam.name}-mapa-cargado.png`) });
    }

    await ctx.close();
  }

  /* ---------------- Cookie banner (contexto limpio) ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    attachLoggers(page, informe, 'cookies');
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const visibleAntes = await page.isVisible('#cookie-banner');
    await page.screenshot({ path: path.join(OUT, 'escritorio-03-cookies-visible.png') });
    await page.click('#cookie-ok');
    await page.waitForTimeout(300);
    const hiddenDespues = await page.getAttribute('#cookie-banner', 'hidden');
    const guardado = await page.evaluate(() => localStorage.getItem('bertola-cookies'));
    informe.comprobaciones['cookie-banner'] = { visibleAntes, hiddenDespues, guardado };
    await page.screenshot({ path: path.join(OUT, 'escritorio-04-cookies-cerrado.png') });
    await ctx.close();
  }

  /* ---------------- 5. GSAP bloqueado ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    attachLoggers(page, informe, 'sin-gsap');
    await page.route('**cdnjs.cloudflare.com/**gsap**', (route) => route.abort());
    await page.route('**unpkg.com/lenis**', (route) => route.abort());
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const clasesSinGsap = await page.evaluate(() => ({
      jsMotion: document.documentElement.classList.contains('js-motion'),
      gsapListo: document.documentElement.classList.contains('gsap-listo'),
      cortinaOculta: document.getElementById('cortina').hidden
    }));
    informe.comprobaciones['sin-gsap'] = clasesSinGsap;
    await page.screenshot({ path: path.join(OUT, 'escritorio-05-sin-gsap-portada.png'), fullPage: false });
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, 'escritorio-05-sin-gsap-scroll.png'), fullPage: false });
    await ctx.close();
  }

  /* ---------------- 6. prefers-reduced-motion ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    attachLoggers(page, informe, 'reduced-motion');
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const clasesReducido = await page.evaluate(() => ({
      jsMotion: document.documentElement.classList.contains('js-motion'),
      cortinaOculta: document.getElementById('cortina').hidden
    }));
    informe.comprobaciones['reduced-motion'] = clasesReducido;
    await page.screenshot({ path: path.join(OUT, 'escritorio-06-reduced-motion-portada.png') });
    await scrollHasta(page, '#calendario');
    const cifraCalendario = await page.evaluate(() => {
      const c = document.querySelector('.calendario-fila.abierto .calendario-cuenta');
      return c ? c.textContent.trim() : null;
    });
    informe.comprobaciones['reduced-motion-calendario-cifra'] = cifraCalendario;
    await page.screenshot({ path: path.join(OUT, 'escritorio-06-reduced-motion-calendario.png') });
    await ctx.close();
  }

  /* ---------------- 7. Control de paleta (demostración) ---------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    attachLoggers(page, informe, 'paleta');
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800); // aviso de cookies visible en este contexto limpio

    const solapaConCookies = await page.evaluate(() => {
      const p = document.getElementById('paleta').getBoundingClientRect();
      const c = document.getElementById('cookie-banner').getBoundingClientRect();
      return !(p.right < c.left || p.left > c.right || p.bottom < c.top || p.top > c.bottom);
    });
    informe.comprobaciones['paleta-solapa-cookies'] = solapaConCookies;
    await page.screenshot({ path: path.join(OUT, 'escritorio-07-paleta-con-cookies.png') });

    const colorRojo = await page.evaluate(() => getComputedStyle(document.querySelector('.btn-rojo')).backgroundColor);
    await page.click('#paleta-anil');
    await page.waitForTimeout(200);
    const colorAnil = await page.evaluate(() => getComputedStyle(document.querySelector('.btn-rojo')).backgroundColor);
    const guardadoPaleta = await page.evaluate(() => localStorage.getItem('sello-paleta'));
    informe.comprobaciones['paleta-cambia-color'] = { colorRojo, colorAnil, cambia: colorRojo !== colorAnil, guardadoPaleta };
    await page.screenshot({ path: path.join(OUT, 'escritorio-07-paleta-anil.png') });

    // recarga: la paleta guardada debe aplicarse antes del primer paint, sin salto
    await page.reload({ waitUntil: 'domcontentloaded' });
    const claseInmediata = await page.evaluate(() => document.documentElement.classList.contains('paleta-anil'));
    informe.comprobaciones['paleta-sin-flash-al-recargar'] = claseInmediata;
    await page.waitForLoadState('networkidle');
    await page.click('#paleta-rojo'); // deja el sitio en el color real de la marca
    await ctx.close();
  }

  /* ---------------- 8. Sin marcadores pendientes ---------------- */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const texto = await page.evaluate(() => document.body.innerText);
    const sospechosos = ['[PENDIENTE]', 'TODO', 'Lorem ipsum', 'lorem ipsum', 'NUMERO-PENDIENTE'];
    informe.comprobaciones['marcadores-pendientes'] = sospechosos.filter((s) => texto.includes(s));
    await ctx.close();
  }

  await browser.close();

  informe.resumen = {
    erroresConsola: informe.consoleErrors.length,
    peticionesFallidas: informe.peticionesFallidas.length
  };

  fs.writeFileSync(path.join(__dirname, 'verify-report.json'), JSON.stringify(informe, null, 2));
  console.log(JSON.stringify(informe, null, 2));
})();
