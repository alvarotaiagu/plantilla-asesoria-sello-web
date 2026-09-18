# Bértola Asesores — plantilla «Sello»

> **Sitio de demostración.** Bértola Asesores es un negocio ficticio, creado
> como plantilla de muestra para la biblioteca de WEBS NEGOCIOS. Los datos,
> las ilustraciones y las opiniones son de muestra: no corresponden a
> ninguna gestoría real de Betanzos ni de ningún otro lugar. Meta
> `robots: noindex, nofollow` en todas las páginas.

Gestoría fiscal, laboral, contable y de constitución de empresas en
Betanzos (A Coruña). Una de las cuatro plantillas ficticias autorizadas
para el sector asesoría fiscal en `SECTORES.md` (excepción del
2026-09-18), construida en paralelo con otras tres (conceptos Casillas,
Cinta sumadora y Expediente) sin coordinación entre agentes.

## El concepto: «Sello»

El trámite como aprobación oficial estampada. No hay columnas que cuadran
ni cuenta atrás: hay un instante de aprobación por sección, marcado con un
sello de tampón que impacta el papel — grano y ligero bleed de tinta vía
filtro SVG (`feTurbulence`), nunca un sello vectorial limpio y frío.

**El porqué:** una gestoría no vende promesas, vende que el papeleo quede
cerrado. El sello es el gesto más honesto para eso: no es una animación
decorativa, es la marca que dice «esto ya está». Por eso el propio
calendario fiscal (sección 4) usa el mismo sello para marcar qué plazos
están cerrados este ciclo, calculado contra la fecha real del sistema —
no hay ninguna fecha inventada en esa sección.

**Nota de colisión detectada durante la construcción:** al revisar
`registro/` antes de empezar se encontró que la plantilla de agencia de
viajes (`plantilla-viajes-web`, concepto «Sellos», Viajes Arroaz) ya usa el
motivo del tampón — con una paleta muy cercana (papel/tinta/rojo de
tampón). Como «Sello» venía asignado explícitamente en `SECTORES.md` como
parte del lote autorizado de 4 plantillas de asesoría, se mantuvo el
concepto pero se diferenció la ejecución a propósito: aquí el sello es
**uno solo, oficial y burocrático** («AL DÍA», «CERRADO», «GARANTÍA»,
estilo sello de Hacienda/notaría), no una colección de sellos de viaje
decorativos con formas distintas; y los tonos de rojo/tinta se separaron
por hexadecimal de los usados en viajes.

## Paleta

| Token | Valor | Uso |
|---|---|---|
| `--papel` | `#F2EDE1` | Fondo base |
| `--panel` | `#EAE3D3` | Fondo del calendario |
| `--crema` | `#F8F4EA` | Tarjetas |
| `--tinta` | `#1F2A24` | Texto, estructura, fondo de cabeceras oscuras |
| `--muted` | `#5A6159` | Texto secundario — **5,47:1 sobre papel, 5,81:1 sobre crema** |
| `--rojo` | `#A8503E` | Marca, sellos, CTA — 4,63:1 sobre papel |
| `--rojo-texto` | `#8F4435` | Variante de texto — 5,90:1 sobre papel |

Todos los pares se calcularon con un script de contraste (WCAG relative
luminance) antes de escribir el CSS, no a ojo — ver el cálculo en el
historial del repo. Ningún texto se apaga con `opacity`: el token
`--muted` es un color propio, auditable.

## Tipografía

- **Fraunces** (600) — titulares, wordmark, texto de los sellos.
- **Space Mono** — cifras, fechas, números de expediente (`tabular-nums`).

Se comprobó que Fraunces (peso 600, sin cursiva) trae `€`, `ñ`, tildes y
comillas latinas antes de cerrar la tipografía — la trampa conocida del
pliego es la cursiva, que aquí no se usa en ningún sitio.

## Estructura (7 secciones, en este orden)

1. **Portada** — el sello «AL DÍA» impacta sobre un expediente de muestra
   al cargar la página.
2. **Cinta** — marquee lento en mayúsculas con las áreas de servicio.
3. **Servicios** — sticky-stack de 5 tarjetas (fiscal, laboral, contable,
   constitución, trámites); cada una se estampa «Presentado» al entrar en
   viewport.
4. **Calendario fiscal** — plazos generales de la AEAT para el ejercicio
   natural; cada fila se calcula contra la fecha real del navegador y se
   marca «cerrado» (con sello) o «plazo abierto» (con cuenta de días).
5. **Confianza / reseñas** — un sello «GARANTÍA» y cuatro testimonios
   ficticios (nombre de pila, nunca atribuidos a ninguna plataforma).
6. **Equipo** — dos personas, ilustración plana (no fotografía).
7. **Contacto + pie** — ficha del despacho, WhatsApp flotante, mapa solo
   bajo clic, aviso de demo obligatorio, enlaces a `legal.html`.

## Movimiento (recursos del PLIEGO §2, protagonista: el sello)

1. **Sello-impacto** (protagonista) — transición CSS + `IntersectionObserver`,
   no un tween de GSAP sobre el propio sello (ver «decisiones técnicas»).
2. **Lenis** como único motor de scroll suave.
3. **Char-reveal** de titulares — GSAP, animando `y` en píxeles explícitos
   (nunca `yPercent`, ver trampa de GSAP más abajo).
4. **Marquee** infinito de áreas de servicio.
5. **Botones magnéticos** — CTA principal y WhatsApp flotante.
6. **Contadores** — cifras del hero y los días de plazo del calendario
   fiscal (un contador real, no decorativo).
7. **Cursor propio** contextual, solo con puntero fino.
8. **Cortina de entrada** (obligatoria, no cuenta para el mínimo): un sello
   grande golpea sobre el nombre del despacho y se retira deslizándose,
   revelando la portada — encadenada, `expo.inOut`, retirada garantizada.

## Decisiones técnicas

- **El sello no anima con GSAP.** Es una transición CSS disparada por
  `IntersectionObserver`, siguiendo la recomendación del pliego («las
  máscaras y apariciones salen mejor como transición CSS + IO»). El estado
  «sin estampar» (`translateY(-54px) rotate(-20deg) scale(1.7); opacity:0`)
  solo existe bajo `html.js-motion.gsap-listo` — dos banderas separadas:
  `js-motion` la pone un script mínimo y bloqueante en el `<head>` (no
  depende de que GSAP cargue) según `prefers-reduced-motion`; `gsap-listo`
  la pone `main.js` solo si `window.gsap` existe de verdad. Sin las dos a
  la vez, el sello se ve **siempre** en su posición final: sin JS, con el
  CDN de GSAP caído o con movimiento reducido, no hay ningún estado vacío
  que se pueda quedar a medias. El mismo patrón protege el char-reveal de
  los titulares.
- **Char-reveal:** se anima `y: 0` en píxeles explícitos, nunca `yPercent`,
  porque el `translateY(115%)` que ya trae el CSS se leería como un valor
  en píxeles y dejaría las palabras clavadas fuera de pantalla (trampa del
  pliego).
- **Cortina:** además de la animación de GSAP, hay una red de seguridad
  `setTimeout` de 4,2 s que la retira pase lo que pase, y un bloque
  `<noscript>` que la oculta con CSS puro si JavaScript está desactivado
  del todo.
- **Calendario fiscal:** las fechas límite (día/mes) están fijas porque son
  las reglas generales y estables de la AEAT (20 de cada mes de
  liquidación trimestral, 25 de julio para Sociedades, etc.); la campaña de
  Renta se muestra como ventana informativa sin día exacto, porque esa
  fecha sí cambia cada año y no se ha inventado.
- **Sticky-stack de servicios:** el `<li>` (`.servicio-item`) es el propio
  elemento `sticky`, con `padding-bottom` como recorrido — nunca
  `min-height`, que habría dejado tarjetas fantasma (trampa del pliego).

## Bug real cazado en la verificación

El grid de la portada (`.hero .container`) se declaró con `display:grid`
pero **sin `grid-template-columns`**: por defecto eso colapsa a una sola
columna, así que la escena del sello (columna derecha) se apilaba *debajo*
del texto — a 1316px de scroll en 1440×900, fuera del primer pliegue del
todo. Se detectó al capturar el elemento del sello del hero de forma
aislada y comprobar su `getBoundingClientRect()`, no mirando la captura de
pantalla completa (que, al no incluir esa zona, no delataba el problema a
simple vista). Se corrigió con `grid-template-columns:1.05fr .95fr` desde
900px. De paso se cambió `.hero-papel` de posicionamiento absoluto por
`flex` con `gap`, porque el texto del expediente y el sello se pisaban en
390px con el esquema de porcentajes anterior.

También se corrigió el icono de «cerrar» del menú móvil: las tres barras
usaban `display:grid; gap:5px` y las transformaciones de apertura
(`translateY` + `rotate`) no llevaban a los tres trazos al mismo centro,
así que en vez de una X se veía un «▷». Se cambió a tres `span` con
`position:absolute` a `top:0/7px/14px` dentro de un contenedor de tamaño
fijo, que sí da una X limpia.

## Qué tocar para reskinear esta plantilla a un cliente real

1. **Datos del despacho**: nombre, dirección, teléfono, WhatsApp, CIF y
   horario están todos en `index.html`, sección `#contacto` (bloque
   `.ficha`) y en `legal.html`. También en el `<head>` (`<meta
   description>`, `og:title`, `og:description`) y en `manifest.json`.
2. **Servicios**: las 5 tarjetas de `#servicios-lista` en `index.html` —
   cambiar título, texto y la lista `.servicio-lista-detalle` de cada una.
3. **Calendario fiscal**: si el cliente tiene un régimen especial
   (recargo de equivalencia, módulos, etc.), hay que revisar el array
   `CALENDARIO_AEAT` en `js/main.js` — las fechas actuales son las del
   régimen general.
4. **Equipo**: sustituir las ilustraciones SVG por fotografías reales (o
   mantener el estilo ilustrado si el despacho lo prefiere) en
   `#equipo .equipo-retrato`, y los nombres/bios.
5. **Reseñas**: los 4 testimonios de `#confianza` son ficticios — si el
   cliente tiene reseñas reales de Google, sustituir el texto pero
   **mantener la advertencia de que no llevan `aggregateRating`** salvo
   que se decida publicarlas como datos estructurados de verdad.
6. **Mapa**: cambiar la cadena de búsqueda en `js/main.js` (función
   `mapa()`, variable dentro de `iframe.src`) por la dirección real.
7. **Quitar el aviso de demo**: el comentario HTML de `index.html`, el
   bloque `.pie-demo` del footer y la primera línea de este README.
8. **Quitar `noindex, nofollow`** del `<meta name="robots">` en todas las
   páginas.
9. **Logo**: `assets/img/logo/icon.svg` es un monograma «B» genérico —
   sustituir por el logo real del despacho y regenerar
   `assets/img/logo/icon-*.png` y `og.png` con
   `node scripts/generate_icons.js` (necesita un servidor local sirviendo
   el repo, ver el propio script).

## Verificación (PLIEGO §7)

Ejecutada con Playwright (Chromium) contra un servidor estático local.

- **1440×900 y 390×844**, con `isMobile`/`hasTouch` reales en la pasada
  móvil. Capturas de las 7 secciones en ambos tamaños, en `screenshots/`.
- **Recorrido con `mouse.wheel`** (no `window.scrollTo`, que no dispara
  los `IntersectionObserver`/`ScrollTrigger` con Lenis de por medio),
  esperando ~1,6 s entre tramos para que Lenis asiente.
- **Consola limpia**: 0 errores y 0 peticiones fallidas fuera de la pasada
  que bloquea el CDN a propósito.
- **GSAP bloqueado** (`route.abort()` sobre cdnjs y unpkg): `gsap-listo`
  nunca se activa, la cortina se retira igualmente (por la rama sin GSAP,
  no por el timeout de seguridad) y toda la página se lee entera —
  capturas en `screenshots/escritorio-05-sin-gsap-*.png`.
- **`prefers-reduced-motion: reduce`**: `js-motion` no se activa, la
  cortina desaparece al instante, los sellos y titulares se ven ya en su
  estado final, y el contador de días del calendario sigue mostrando la
  cifra correcta (verificado por texto, no solo visualmente) —
  `screenshots/escritorio-06-reduced-motion-*.png`.
- **Cookies**: banner visible en la primera visita, `De acuerdo` lo cierra
  y guarda `bertola-cookies` en `localStorage`; sin cookies de analítica.
- **Menú móvil**: `aria-expanded` alterna `true`/`false`, el panel se abre
  y se cierra.
- **Mapa**: 0 iframes antes de pulsar «Mostrar mapa», 1 después, apuntando
  a la dirección ficticia, sin API key.
- **Sin marcadores pendientes**: se buscó `[PENDIENTE]`, `TODO`, `Lorem
  ipsum` y `NUMERO-PENDIENTE` en el texto renderizado — ninguno presente.
- **Repaso del §1**: nombre comprobado en la web antes de fijarlo (ver
  abajo), dirección y teléfono de muestra, sin `aggregateRating` en ningún
  `schema.org`, reseñas sin atribuir a ninguna plataforma.

El script vive en `scripts/verify.js` (`node scripts/verify.js`, con
`BERTOLA_URL` apuntando a un servidor local) y escribe también
`scripts/verify-report.json`.

**Pendiente de esta plantilla** (igual que el resto de la biblioteca, ver
`REGISTRO.md`): no se midió `longtask` con `PerformanceObserver` (la
página no lleva canvas ni WebGL, así que el riesgo es bajo, pero no está
medido); sin auditoría automática de contraste (axe/Lighthouse) — el
contraste de color se calculó a mano con un script, no con una herramienta
de auditoría; solo probado en Chromium.

## Comprobación del nombre (PLIEGO §1)

Antes de fijar «Bértola Asesores» se buscó en la web. No existe ninguna
gestoría con ese nombre exacto. Sí existe una **«Asesores Betanzos, S.L.»**
real (inactiva) en el mismo Betanzos y con el mismo tipo de servicio
(fiscal/laboral/contable/comercial) — por eso se descartó cualquier
nombre genérico tipo «Asesores Betanzos» y se optó por «Bértola», que es
el nombre de una parroquia real del propio concello de Betanzos (recurso
ya usado en otras plantillas de la biblioteca para nombres con arraigo
local sin ser el nombre de un negocio existente). La dirección (Rúa do
Pombal, 9) es una calle genérica inventada; el CIF (B15000000) y los
teléfonos (981 00 00 45 / 611 00 00 45) son de muestra, sin corresponder a
ninguna línea real.

## Estructura del repo

```
index.html        404.html        legal.html
css/style.css      js/main.js
assets/img/logo/   (icon.svg, favicon.svg, icon-*.png, og.png)
scripts/generate_icons.js   scripts/verify.js
screenshots/        manifest.json   .nojekyll
```

Sin build, sin npm, sin framework: se abre `index.html` con doble clic o
se sirve la carpeta con cualquier servidor estático.
