/* HSM Chile - comportamiento mínimo. El sitio funciona completo sin JavaScript (salvo filtros y envío del formulario). */
(function () {
  "use strict";
  var C = window.HSM_CONFIG || {};
  var RAIZ = document.documentElement.getAttribute("data-raiz") || "./";

  // Menú móvil
  var btn = document.querySelector(".btn-menu");
  var nav = document.getElementById("menu-principal");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var abierto = nav.classList.toggle("abierto");
      btn.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
  }

  // WhatsApp (solo si está configurado)
  if (C.WHATSAPP) {
    document.querySelectorAll("[data-whatsapp]").forEach(function (a) {
      var texto = a.getAttribute("data-whatsapp") || "Hola, quiero cotizar un equipo HSM.";
      a.href = "https://wa.me/" + C.WHATSAPP + "?text=" + encodeURIComponent(texto);
      a.hidden = false;
    });
  }

  // Google Analytics (solo si está configurado)
  if (C.GA4_ID) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(C.GA4_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", C.GA4_ID);
  }
  function evento(nombre, datos) { if (window.gtag) { window.gtag("event", nombre, datos || {}); } }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) { return; }
    var h = a.getAttribute("href") || "";
    if (h.indexOf("tel:") === 0) { evento("llamar", { numero: h }); }
    if (h.indexOf("wa.me") > -1) { evento("whatsapp"); }
    if (h.indexOf("cotizar") > -1) { evento("clic_cotizar", { destino: h }); }
  });

  // Cuenta regresiva Ley 21.719 (vigencia plena: diciembre de 2026)
  var diasLey = Math.ceil((new Date(2026, 11, 1) - new Date()) / 86400000);
  document.querySelectorAll("[data-cuenta-ley]").forEach(function (el) {
    el.textContent = diasLey > 1 ? "faltan " + diasLey + " días para su vigencia plena" : (diasLey === 1 ? "falta 1 día para su vigencia plena" : "la ley ya rige");
  });

  // Autodiagnóstico "¿Está tu empresa lista?"
  var diag = document.getElementById("form-autodiagnostico");
  if (diag) {
    var pend = {
      p1: "Identificar qué documentos con datos personales manejas (clientes, trabajadores, pacientes).",
      p2: "Contar con una política escrita de conservación y eliminación de documentos.",
      p3: "Destruir los documentos de forma que no se pueda leer su contenido (botarlos no basta).",
      p4: "Registrar cada eliminación: fecha, responsable y tipo de documento.",
      p5: "Destruir de forma segura los discos duros y equipos en desuso.",
      p6: "Definir qué nivel de seguridad usar según el tipo de información."
    };
    diag.addEventListener("submit", function (e) {
      e.preventDefault();
      var puntos = 0, faltan = [], sin = 0;
      Object.keys(pend).forEach(function (k) {
        var s = diag.querySelector("input[name=" + k + "]:checked");
        if (!s) { sin++; return; }
        if (s.value === "si") { puntos++; } else { faltan.push(pend[k]); }
      });
      var res = document.getElementById("diag-resultado");
      if (sin) { res.hidden = false; res.className = "resultado"; res.innerHTML = "<p><strong>Responde las 6 preguntas</strong> para ver tu resultado (te faltan " + sin + ").</p>"; return; }
      var nivel = puntos >= 5 ? ["bien", "Vas bien encaminado"] : (puntos >= 3 ? ["", "Tienes brechas importantes"] : ["", "Riesgo alto: conviene actuar antes de diciembre"]);
      var html = "<h3>" + nivel[1] + " (" + puntos + " de 6)</h3>";
      if (faltan.length) { html += "<p>Puntos por resolver:</p><ul>" + faltan.map(function (f) { return "<li>" + f + "</li>"; }).join("") + "</ul>"; }
      var msg = "Autodiagnóstico Ley 21.719: " + puntos + "/6. Pendientes: " + (faltan.join(" | ") || "ninguno");
      html += '<p><a class="btn" href="' + RAIZ + 'cotizar/?interes=destruccion-documentos&msg=' + encodeURIComponent(msg) + '">Pedir asesoría con mi resultado</a></p>';
      html += '<p class="meta">Resultado orientativo; no constituye asesoría legal.</p>';
      res.className = "resultado " + nivel[0]; res.innerHTML = html; res.hidden = false; res.scrollIntoView({ behavior: "smooth", block: "nearest" });
      evento("autodiagnostico_ley", { puntos: puntos });
    });
  }

  // Video de producto (YouTube se carga solo al hacer clic, para que la página sea rápida y no use cookies antes)
  document.querySelectorAll(".video").forEach(function (v) {
    var b = v.querySelector(".video-play");
    if (!b) { return; }
    b.addEventListener("click", function () {
      var id = v.getAttribute("data-video");
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0";
      f.title = "Video del producto";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      v.innerHTML = ""; v.appendChild(f);
      evento("video_visto", { video_id: id, pagina: location.pathname });
    });
  });

  // Pestañas de producto (sin JavaScript se ven todas las secciones seguidas)
  var pest = document.querySelector(".pestanas");
  if (pest) {
    var tabs = Array.prototype.slice.call(pest.querySelectorAll("[role=tab]"));
    var paneles = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
    var activar = function (i) {
      tabs.forEach(function (t, j) { t.setAttribute("aria-selected", j === i ? "true" : "false"); t.tabIndex = j === i ? 0 : -1; });
      paneles.forEach(function (p, j) { p.hidden = j !== i; });
    };
    pest.classList.add("con-js");
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { activar(i); if (i === 1) { evento("ver_ficha_tecnica", { pagina: location.pathname }); } });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var n = (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length; activar(n); tabs[n].focus(); }
      });
    });
    activar(0);
    if (location.hash === "#ficha") { activar(1); }
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (a && /\.pdf(\?|$)/i.test(a.getAttribute("href") || "")) { evento("descargar_ficha", { archivo: (a.getAttribute("href") || "").split("/").pop() }); }
  });

  // Galería de producto
  var principal = document.querySelector(".galeria .principal img");
  document.querySelectorAll(".galeria .miniaturas button").forEach(function (b) {
    b.addEventListener("click", function () {
      if (principal) { principal.src = b.getAttribute("data-src"); }
      document.querySelectorAll(".galeria .miniaturas button").forEach(function (x) { x.removeAttribute("aria-current"); });
      b.setAttribute("aria-current", "true");
    });
  });

  // Buscador de cabecera -> catálogo
  var fb = document.getElementById("buscar-cabecera");
  if (fb) {
    fb.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = fb.querySelector("input").value.trim();
      window.location.href = RAIZ + "productos/" + (q ? "?q=" + encodeURIComponent(q) : "");
    });
  }

  // Catálogo con filtros
  var cont = document.getElementById("catalogo");
  if (cont) {
    var tarjetas = Array.prototype.slice.call(cont.querySelectorAll("[data-familia]"));
    var cuenta = document.getElementById("contador");
    var texto = document.getElementById("filtro-texto");
    var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-familia-filtro]"));
    var corte = document.getElementById("filtro-corte");
    var sinResultados = document.getElementById("sin-resultados");
    var estado = { familia: "todos", q: "", corte: "" };
    function norm(t) { return (t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
    function aplicar() {
      var n = 0;
      tarjetas.forEach(function (t) {
        var ok = (estado.familia === "todos" || t.getAttribute("data-familia") === estado.familia) &&
          (!estado.corte || t.getAttribute("data-corte") === estado.corte) &&
          (!estado.q || norm(t.getAttribute("data-busqueda")).indexOf(norm(estado.q)) > -1);
        t.hidden = !ok;
        if (ok) { n++; }
      });
      if (cuenta) { cuenta.textContent = n + (n === 1 ? " equipo" : " equipos"); }
      if (sinResultados) { sinResultados.hidden = n !== 0; }
    }
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        chips.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        c.setAttribute("aria-pressed", "true");
        estado.familia = c.getAttribute("data-familia-filtro");
        aplicar();
      });
    });
    if (texto) { texto.addEventListener("input", function () { estado.q = texto.value; aplicar(); }); }
    if (corte) { corte.addEventListener("change", function () { estado.corte = corte.value; aplicar(); }); }
    var qs = new URLSearchParams(window.location.search);
    if (qs.get("q") && texto) { texto.value = qs.get("q"); estado.q = qs.get("q"); }
    var fam = qs.get("familia");
    if (fam) {
      var chip = chips.filter(function (c) { return c.getAttribute("data-familia-filtro") === fam; })[0];
      if (chip) { chip.click(); }
    }
    aplicar();
  }

  // Formulario de cotización
  var form = document.getElementById("form-cotizacion");
  if (form) {
    var qs2 = new URLSearchParams(window.location.search);
    var eq = qs2.get("equipo");
    var interes = qs2.get("interes");
    if (eq && form.elements.equipo) { form.elements.equipo.value = eq; }
    if (interes && form.elements.interes) { form.elements.interes.value = interes; }
    var pm = qs2.get("msg");
    if (pm && form.elements.mensaje) { form.elements.mensaje.value = pm; }
    var msg = document.getElementById("form-mensaje");
    function aviso(clase, texto) { msg.className = "aviso " + clase; msg.textContent = texto; msg.hidden = false; msg.focus(); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements.sitio_web && form.elements.sitio_web.value) { return; } // trampa para robots
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var d = {};
      Array.prototype.forEach.call(form.elements, function (el) { if (el.name && el.type !== "checkbox") { d[el.name] = el.value; } });
      d.pagina = window.location.href;
      evento("enviar_cotizacion", { interes: d.interes });
      var asunto = "Cotización web HSM: " + (d.equipo || d.interes || "consulta");
      var cuerpo = "Nombre: " + d.nombre + "\nEmpresa: " + (d.empresa || "-") + "\nCorreo: " + d.correo + "\nTeléfono: " + (d.telefono || "-") +
        "\nInterés: " + d.interes + "\nEquipo: " + (d.equipo || "-") + "\n\nMensaje:\n" + (d.mensaje || "-") + "\n\nEnviado desde: " + d.pagina;
      if (C.FORM_ENDPOINT) {
        fetch(C.FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(d) })
          .then(function (r) { if (!r.ok) { throw new Error("fallo"); } form.reset(); aviso("aviso-ok", "¡Gracias! Recibimos tu solicitud. Te responderemos dentro del horario de atención (lunes a viernes)."); })
          .catch(function () { aviso("aviso-error", "No pudimos enviar el formulario. Escríbenos a " + C.CORREO_COTIZACIONES + " o llama al (02) 2396 4723."); });
      } else {
        window.location.href = "mailto:" + C.CORREO_COTIZACIONES + "?subject=" + encodeURIComponent(asunto) + "&body=" + encodeURIComponent(cuerpo);
        aviso("aviso-ok", "Se abrió tu programa de correo con la solicitud lista. Solo debes presionar Enviar. Si no se abrió, escríbenos a " + C.CORREO_COTIZACIONES + ".");
      }
    });
  }
})();
