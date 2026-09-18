# Créditos

Esta plantilla no usa ninguna fotografía de archivo. Toda la obra gráfica es
SVG propio, dibujado a mano para este repositorio:

- El sello (icono de marca, sello grande de portada/confianza/pie, sellos
  mini de servicios y calendario), con la textura de grano de tampón hecha
  con un filtro SVG (`feTurbulence` + `feColorMatrix` + `feComposite`), no
  con una imagen.
- Las dos ilustraciones del equipo (Xoana Bértola Leis y Diego Cortiñas
  Vidal): siluetas planas con el mismo filtro de grano, no fotografías.
- El logotipo/monograma «B» (favicon, icono de la app, marca de la
  cabecera).

## Tipografía

- **Fraunces** (titulares, wordmark, sellos) — Google Fonts, licencia SIL
  Open Font License.
- **Space Mono** (cifras, fechas, expedientes) — Google Fonts, licencia SIL
  Open Font License.

Se comprobó antes de cerrar la plantilla que Fraunces (peso 600, sin
cursiva) y Space Mono renderizan correctamente `€`, `ñ`, á/é/í/ó/ú/ü y
`« »` — captura de la comprobación en `screenshots/glifos-test.png`. La
web en sí no muestra ningún importe en euros (una gestoría no cotiza
precio en la portada), pero el glifo estaba comprobado por si se añade en
un reskin.

## Librerías

- [Lenis](https://github.com/darkroomengineering/lenis) — scroll suave, por
  CDN (unpkg).
- [GSAP](https://gsap.com/) — cortina de entrada y char-reveal de
  titulares, por CDN (cdnjs).

Ninguna otra dependencia. Sin build, sin npm, sin framework.
