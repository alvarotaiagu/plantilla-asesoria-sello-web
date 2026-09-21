/* Bértola Asesores — main.js
   Concepto «Sello»: los impactos de tampón son transición CSS + IntersectionObserver
   (no tweens de GSAP sobre el propio sello: ver PLIEGO §6, trampa de clip-path/opacidad
   pisada). GSAP se reserva para la cortina, los titulares y los botones magnéticos.
   Todo lo que es contenido (calendario, contadores) sigue funcionando sin GSAP y con
   movimiento reducido; solo se apaga el movimiento. */
(function () {
  'use strict';

  var html = document.documentElement;
  var mqReducida = window.matchMedia('(prefers-reduced-motion: reduce)');
  var motion = html.classList.contains('js-motion');

  mqReducida.addEventListener('change', function (e) {
    motion = !e.matches;
    html.classList.toggle('js-motion', motion);
  });

  var gsapListo = typeof window.gsap !== 'undefined';
  if (gsapListo) { html.classList.add('gsap-listo'); }

  /* ---------------------------------------------------------------------
     1. Aviso de cookies
     ------------------------------------------------------------------- */
  (function cookies() {
    var banner = document.getElementById('cookie-banner');
    var okBtn = document.getElementById('cookie-ok');
    var soloBtn = document.getElementById('cookie-config');
    if (!banner) return;
    var CLAVE = 'bertola-cookies';

    /* mientras el aviso está abierto, aparta el mando de paleta hacia
       arriba lo que mida el aviso, para que no quede tapado por él
       (--cookie-h, ver css/style.css y el control de paleta más abajo) */
    function ajustarOffsetCookie() {
      var alto = banner.hidden ? 0 : banner.offsetHeight + 14;
      html.style.setProperty('--cookie-h', alto + 'px');
    }

    try {
      if (!localStorage.getItem(CLAVE)) {
        banner.hidden = false;
      }
    } catch (e) {
      banner.hidden = false;
    }
    requestAnimationFrame(ajustarOffsetCookie);
    window.addEventListener('resize', ajustarOffsetCookie);

    function cerrar(valor) {
      banner.hidden = true;
      ajustarOffsetCookie();
      try { localStorage.setItem(CLAVE, valor); } catch (e) {}
    }
    if (okBtn) okBtn.addEventListener('click', function () { cerrar('aceptado'); });
    if (soloBtn) soloBtn.addEventListener('click', function () { cerrar('solo-esenciales'); });
  })();

  /* ---------------------------------------------------------------------
     Control de paleta (demostración). NO ES PARTE DEL SITIO: es un mando
     para enseñar la misma web en tres paletas de color delante del
     cliente mientras decide. Al entregar la web ya como oficial se borra
     esta función, el bloque .paleta del CSS, el <div id="paleta"> del
     HTML y la bandera del <head>.
     ------------------------------------------------------------------- */
  (function initPaleta() {
    var caja = document.getElementById('paleta');
    var botones = {
      rojo: document.getElementById('paleta-rojo'),
      anil: document.getElementById('paleta-anil'),
      musgo: document.getElementById('paleta-musgo')
    };
    if (!caja || !botones.rojo || !botones.anil || !botones.musgo) return;
    var CLAVE_PALETA = 'sello-paleta';

    caja.hidden = false; // sin JS no se enseña: no haría nada

    function pintar(nombre, guardar) {
      html.classList.remove('paleta-anil', 'paleta-musgo');
      if (nombre !== 'rojo') html.classList.add('paleta-' + nombre);
      Object.keys(botones).forEach(function (k) {
        botones[k].setAttribute('aria-pressed', String(k === nombre));
      });
      if (guardar) { try { localStorage.setItem(CLAVE_PALETA, nombre); } catch (e) {} }
    }

    var actual = html.classList.contains('paleta-anil') ? 'anil' : html.classList.contains('paleta-musgo') ? 'musgo' : 'rojo';
    pintar(actual, false);
    botones.rojo.addEventListener('click', function () { pintar('rojo', true); });
    botones.anil.addEventListener('click', function () { pintar('anil', true); });
    botones.musgo.addEventListener('click', function () { pintar('musgo', true); });
  })();

  /* ---------------------------------------------------------------------
     2. Menú móvil
     ------------------------------------------------------------------- */
  (function menuMovil() {
    var boton = document.getElementById('menu-boton');
    var menu = document.getElementById('menu-movil');
    if (!boton || !menu) return;
    function alternar(abrir) {
      boton.setAttribute('aria-expanded', String(abrir));
      menu.classList.toggle('abierto', abrir);
      document.body.style.overflow = abrir ? 'hidden' : '';
    }
    boton.addEventListener('click', function () {
      alternar(boton.getAttribute('aria-expanded') !== 'true');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { alternar(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && boton.getAttribute('aria-expanded') === 'true') {
        alternar(false);
        boton.focus();
      }
    });
  })();

  /* ---------------------------------------------------------------------
     3. Mapa solo bajo clic (sin API key, sin iframe hasta que se pide)
     ------------------------------------------------------------------- */
  (function mapa() {
    var boton = document.getElementById('mapa-boton');
    var caja = document.getElementById('mapa-caja');
    var consentimiento = document.getElementById('mapa-consentimiento');
    if (!boton || !caja) return;
    boton.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.title = 'Mapa de Bértola Asesores en Betanzos';
      iframe.src = 'https://www.google.com/maps?q=' +
        encodeURIComponent('Bértola Asesores, Rúa do Pombal 9, 15300 Betanzos, A Coruña') +
        '&output=embed';
      caja.innerHTML = '';
      caja.appendChild(iframe);
      if (consentimiento) consentimiento.remove();
    });
  })();

  /* ---------------------------------------------------------------------
     4. Calendario fiscal — fechas reales de la AEAT, estado calculado con
        la fecha del sistema (no se inventa ningún "hoy").
     ------------------------------------------------------------------- */
  var CALENDARIO_AEAT = [
    { mes: 1, dia: 30, nombre: 'IVA, retenciones y pago fraccionado (4º trimestre)', modelo: 'Modelos 303 · 130/131 · 111 · 115' },
    { mes: 1, dia: 30, nombre: 'Resumen anual del IVA', modelo: 'Modelo 390' },
    { mes: 1, dia: 31, nombre: 'Resumen anual de retenciones e ingresos a cuenta', modelo: 'Modelo 190' },
    { mes: 2, dia: 'ultimo-feb', nombre: 'Declaración anual de operaciones con terceros', modelo: 'Modelo 347' },
    { mes: 4, dia: 20, nombre: 'IVA, retenciones y pago fraccionado (1er trimestre)', modelo: 'Modelos 303 · 130/131 · 111 · 115' },
    { especial: true, mesInicio: 4, mesFin: 6, nombre: 'Campaña de la Renta', modelo: 'IRPF · fechas exactas las fija la AEAT cada año' },
    { mes: 7, dia: 20, nombre: 'IVA, retenciones y pago fraccionado (2º trimestre)', modelo: 'Modelos 303 · 130/131 · 111 · 115' },
    { mes: 7, dia: 25, nombre: 'Impuesto sobre Sociedades', modelo: 'Modelo 200' },
    { mes: 10, dia: 20, nombre: 'IVA, retenciones y pago fraccionado (3er trimestre)', modelo: 'Modelos 303 · 130/131 · 111 · 115' }
  ];
  var MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

  function ultimoDiaDeFebrero(anio) {
    return new Date(anio, 2, 0).getDate();
  }

  function pintarCalendario() {
    var cont = document.getElementById('calendario-tabla');
    if (!cont) return;
    var hoy = new Date();
    var hoyMedianoche = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    var anio = hoy.getFullYear();

    var frag = document.createDocumentFragment();

    CALENDARIO_AEAT.forEach(function (item) {
      var fila = document.createElement('div');
      fila.setAttribute('role', 'row');
      fila.className = 'calendario-fila';

      if (item.especial) {
        fila.classList.add('especial');
        fila.innerHTML =
          '<div class="calendario-fecha mono" role="cell">' + MESES[item.mesInicio - 1] + '<small>–' + MESES[item.mesFin - 1] + '</small></div>' +
          '<div role="cell"><span class="calendario-nombre">' + item.nombre + '</span><span class="calendario-modelo">' + item.modelo + '</span></div>' +
          '<div class="calendario-cuenta mono" role="cell">campaña anual</div>' +
          '<div class="calendario-estado" role="cell"><span class="estado-etq">Ventana anual</span></div>';
        frag.appendChild(fila);
        return;
      }

      var dia = item.dia === 'ultimo-feb' ? ultimoDiaDeFebrero(anio) : item.dia;
      var fecha = new Date(anio, item.mes - 1, dia);
      var diffMs = fecha.getTime() - hoyMedianoche.getTime();
      var diffDias = Math.round(diffMs / 86400000);
      var cerrado = diffDias < 0;

      fila.classList.add(cerrado ? 'cerrado' : 'abierto');

      var cuentaTexto = cerrado
        ? 'cerrado'
        : (diffDias === 0 ? 'hoy' : diffDias + ' día' + (diffDias === 1 ? '' : 's'));

      fila.innerHTML =
        '<div class="calendario-fecha mono" role="cell">' + dia + '<small>' + MESES[item.mes - 1] + '</small></div>' +
        '<div role="cell"><span class="calendario-nombre">' + item.nombre + '</span><span class="calendario-modelo">' + item.modelo + '</span></div>' +
        '<div class="calendario-cuenta mono" role="cell"' + (!cerrado ? ' data-contador-texto data-hasta="' + diffDias + '"' : '') + '>' + cuentaTexto + '</div>' +
        '<div class="calendario-estado" role="cell">' +
          (cerrado
            ? '<div class="sello sello-mini calendario-sello" data-sello><div class="sello-bleed"></div>' +
              '<svg class="sello-svg" viewBox="0 0 220 220" aria-hidden="true">' +
              '<circle class="sello-anillo grueso" cx="110" cy="110" r="96" filter="url(#grano-tampon)"/>' +
              '<circle class="sello-anillo fino" cx="110" cy="110" r="80" filter="url(#grano-tampon)"/>' +
              '<text class="sello-centro" x="110" y="118" font-size="22">CERRADO</text></svg></div>'
            : '<span class="estado-etq">Plazo abierto</span>') +
        '</div>';

      frag.appendChild(fila);
    });

    cont.appendChild(frag);
  }
  pintarCalendario();

  /* ---------------------------------------------------------------------
     5. Sellos: impacto por IntersectionObserver + transición CSS.
        El estado "sin estampar" solo existe si html tiene js-motion Y
        gsap-listo (ver style.css); si no, ya se ve estampado y esto es un
        adorno inerte, no una condición de contenido.
     ------------------------------------------------------------------- */
  (function sellos() {
    var nodos = document.querySelectorAll('.sello[data-sello]');
    if (!nodos.length) return;
    if (!('IntersectionObserver' in window) || !motion || !gsapListo) {
      // Se ven ya en su estado final por CSS: nada que hacer.
      return;
    }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        var el = entrada.target;
        el.classList.add('golpeado');
        io.unobserve(el);
      });
    }, { threshold: 0.4, rootMargin: '0px 0px -8% 0px' });
    nodos.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------------------
     6. Contadores (cifras del hero y días del calendario)
        Con movimiento reducido o sin GSAP el número aparece directo, sin
        cuenta — el contenido cambia igual, solo no se anima.
     ------------------------------------------------------------------- */
  (function contadores() {
    var nodos = document.querySelectorAll('[data-contador], [data-contador-texto]');
    if (!nodos.length) return;

    function animarNumero(el, hasta, esTexto) {
      if (!motion || !('requestAnimationFrame' in window)) {
        el.textContent = esTexto ? sufijoDias(hasta) : String(hasta);
        return;
      }
      var inicio = null;
      var duracion = 900;
      function paso(t) {
        if (inicio === null) inicio = t;
        var progreso = Math.min(1, (t - inicio) / duracion);
        var facil = 1 - Math.pow(1 - progreso, 3);
        var valor = Math.round(hasta * facil);
        el.textContent = esTexto ? sufijoDias(valor) : String(valor);
        if (progreso < 1) requestAnimationFrame(paso);
      }
      requestAnimationFrame(paso);
    }
    function sufijoDias(v) {
      if (v <= 0) return 'hoy';
      return v + ' día' + (v === 1 ? '' : 's');
    }

    if (!('IntersectionObserver' in window)) {
      nodos.forEach(function (el) {
        var esTexto = el.hasAttribute('data-contador-texto');
        var hasta = parseInt(el.getAttribute('data-hasta'), 10) || 0;
        el.textContent = esTexto ? sufijoDias(hasta) : String(hasta);
      });
      return;
    }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        var el = entrada.target;
        var esTexto = el.hasAttribute('data-contador-texto');
        var hasta = parseInt(el.getAttribute('data-hasta'), 10) || 0;
        // El HTML ya trae el valor final correcto (para cuando no hay JS o no
        // hay movimiento); solo lo reiniciamos a 0 justo antes de animar.
        if (motion) el.textContent = esTexto ? sufijoDias(0) : '0';
        animarNumero(el, hasta, esTexto);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });
    nodos.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------------------
     7. Char-reveal de titulares (GSAP). Se anima "y" en px explícito, nunca
        yPercent, porque el translateY(115%) que ya trae el CSS se leería
        como px y dejaría las palabras clavadas abajo (trampa del pliego).
     ------------------------------------------------------------------- */
  (function titulares() {
    if (!motion || !gsapListo) return;
    var titulares = document.querySelectorAll('[data-char-reveal]');
    if (!titulares.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        var el = entrada.target;
        var palabras = el.querySelectorAll('.palabra');
        gsap.to(palabras, {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'expo.out',
          stagger: 0.028
        });
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    titulares.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------------------
     8. Botones magnéticos (CTA principal y WhatsApp flotante)
     ------------------------------------------------------------------- */
  (function magneticos() {
    if (!motion) return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    var botones = document.querySelectorAll('.btn-mag');
    botones.forEach(function (btn) {
      var radio = 60;
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var relX = e.clientX - (r.left + r.width / 2);
        var relY = e.clientY - (r.top + r.height / 2);
        var dist = Math.hypot(relX, relY);
        var alcance = Math.max(r.width, r.height) / 2 + radio;
        var fuerza = Math.max(0, 1 - dist / alcance);
        btn.style.transform = 'translate(' + (relX * 0.32 * fuerza) + 'px,' + (relY * 0.32 * fuerza) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  })();

  /* ---------------------------------------------------------------------
     9. Cursor de sello (solo con puntero fino)
     ------------------------------------------------------------------- */
  (function cursor() {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    var cur = document.getElementById('cursor');
    if (!cur) return;
    html.classList.add('tiene-cursor');
    var activo = false;
    window.addEventListener('mousemove', function (e) {
      if (!activo) { html.classList.add('cursor-activo'); activo = true; }
      cur.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
    });
    document.addEventListener('mouseleave', function () { html.classList.remove('cursor-activo'); });
    document.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('sobre-enlace'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('sobre-enlace'); });
    });
  })();

  /* ---------------------------------------------------------------------
     10. Lenis — único motor de scroll suave
     ------------------------------------------------------------------- */
  var lenis = null;
  if (motion && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true });
    function elevar(t) { lenis.raf(t); requestAnimationFrame(elevar); }
    requestAnimationFrame(elevar);
  }

  /* ---------------------------------------------------------------------
     11. Cortina de entrada — encadenada, expo.inOut, retirada garantizada
         incluso sin GSAP y con movimiento reducido.
     ------------------------------------------------------------------- */
  (function cortina() {
    var cortina = document.getElementById('cortina');
    var sello = document.getElementById('cortina-sello');
    var panel = document.getElementById('cortina-panel');
    if (!cortina) return;

    var seguro = null;
    function quitar() {
      if (cortina.hidden) return;
      if (seguro) clearTimeout(seguro);
      cortina.hidden = true;
      cortina.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    // Red de seguridad: pase lo que pase (GSAP caído a medio timeline, pestaña
    // en segundo plano, lo que sea), la cortina desaparece sola.
    seguro = setTimeout(quitar, 4200);

    if (!motion || !gsapListo) {
      // Sin animación (movimiento reducido) o sin GSAP: fuera ya, sin depender
      // de ninguna librería.
      quitar();
      return;
    }

    document.body.style.overflow = 'hidden';
    gsap.set(panel, { yPercent: 0 });
    var tl = gsap.timeline({ onComplete: quitar });
    tl.set(sello, { opacity: 0, scale: 2.6, rotate: -24 })
      .to(sello, { opacity: 1, scale: 1, rotate: -6, duration: 0.85, ease: 'back.out(1.6)' }, 0.15)
      .to(sello, { scale: 0.92, duration: 0.12 }, '>-0.05')
      .to(sello, { opacity: 0, scale: 0.7, duration: 0.35, ease: 'power2.in' }, '+=0.25')
      .to(panel, { yPercent: -108, duration: 0.9, ease: 'expo.inOut' }, '<')
      .set(cortina, { pointerEvents: 'none' });
  })();

  /* Año en curso, por si algún texto lo necesita (ninguno lo requiere ahora
     mismo, pero deja el gancho preparado para el aviso legal). */
  document.querySelectorAll('[data-anio]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
