/* HSM Chile V4: carrusel de banners de la portada (cambia cada 6 segundos; se detiene con el cursor encima o si la persona pide menos movimiento). */
(function () {
  "use strict";
  var h = document.querySelector(".v4-hero"); if (!h) { return; }
  var s = Array.prototype.slice.call(h.querySelectorAll(".v4-slide")), p = Array.prototype.slice.call(h.querySelectorAll(".v4-puntos button")), i = 0, t = null;
  function ir(n) {
    i = (n + s.length) % s.length;
    s.forEach(function (x, k) { x.classList.toggle("activa", k === i); x.tabIndex = k === i ? 0 : -1; });
    p.forEach(function (x, k) { x.classList.toggle("activa", k === i); });
  }
  function auto() { if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { return; } clearInterval(t); t = setInterval(function () { ir(i + 1); }, 6000); }
  h.querySelector(".izq").addEventListener("click", function () { ir(i - 1); auto(); });
  h.querySelector(".der").addEventListener("click", function () { ir(i + 1); auto(); });
  p.forEach(function (b, k) { b.addEventListener("click", function () { ir(k); auto(); }); });
  h.addEventListener("mouseenter", function () { clearInterval(t); }); h.addEventListener("mouseleave", auto);
  auto();
})();
