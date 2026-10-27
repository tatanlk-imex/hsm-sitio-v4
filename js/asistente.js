/* Asistente de cotización HSM: preguntas básicas guiadas (sin inteligencia artificial, 100 % editable).
   Orienta al cliente, arma el resumen y lo envía por WhatsApp, formulario o correo. */
(function () {
  "use strict";
  var C = window.HSM_CONFIG || {};
  var RAIZ = document.documentElement.getAttribute("data-raiz") || "./";
  var TEL = "(02) 2396 4723";

  // ---------- Flujo de preguntas ----------
  // Cada opción: [texto visible, siguiente nodo, clave opcional para recomendar]
  var PLAZO = { q: "¿Para cuándo lo necesitas?", key: "Plazo", opts: [["Lo antes posible", "extra"], ["Este mes", "extra"], ["En los próximos meses", "extra"], ["Solo estoy averiguando", "extra"]] };
  var COMPRA = { q: "¿Prefieres comprar o arrendar?", key: "Modalidad", opts: [["Comprar", "plazo"], ["Arrendar", "plazo"], ["Aún no lo sé, quiero comparar", "plazo"]] };
  var F = {
    inicio: { q: "¡Hola! Soy el asistente de HSM Chile. Te hago unas preguntas rápidas para orientarte y que tu cotización llegue completa. ¿Qué necesitas?", key: "Necesidad", opts: [
      ["Prepararme para la Ley 21.719 (destrucción de documentos)", "doc_vol", "doc"], ["Destruir documentos", "doc_vol", "doc"], ["Destruir discos duros", "disc_cant", "disc"], ["Compactar cartón o residuos", "pre_mat", "pre"],
      ["Reciclar cartón para relleno (ProfiPack)", "pp_vol", "pp"], ["Compactar botellas PET o latas", "pet_vol", "pet"], ["Arrendar un equipo", "arr_eq", "arr"], ["Servicio técnico, repuestos o insumos", "ser_tipo", "ser"]] },
    // Documentos
    doc_vol: { q: "¿Cuántas hojas destruyes aproximadamente al día?", key: "Volumen diario", opts: [["Hasta 50 hojas", "doc_sec", "v1"], ["Entre 50 y 500", "doc_sec", "v2"], ["Entre 500 y 5.000", "doc_sec", "v3"], ["Más de 5.000 o un archivo completo", "doc_sec", "v4"]] },
    doc_sec: { q: "¿Qué tipo de información vas a destruir?", key: "Tipo de información", opts: [["General, sin datos sensibles", "compra", "s1"], ["Confidencial de la empresa", "compra", "s2"], ["Datos personales, financieros o de salud", "compra", "s3"], ["Información reservada o estratégica", "compra", "s4"]] },
    // Discos
    disc_cant: { q: "¿Cuántos discos o soportes necesitas destruir?", key: "Cantidad de soportes", opts: [["Pocos (menos de 20)", "compra"], ["Decenas", "compra"], ["Cientos o más", "compra"]] },
    // Prensas
    pre_mat: { q: "¿Qué material quieres compactar?", key: "Material", opts: [["Cartón", "pre_vol"], ["Plástico o film", "pre_vol"], ["Papel", "pre_vol"], ["Varios materiales", "pre_vol"]] },
    pre_vol: { q: "¿Qué volumen de residuos generas?", key: "Volumen de residuos", opts: [["Bajo (local o tienda)", "pre_en", "p1"], ["Medio (bodega o planta pequeña)", "pre_en", "p2"], ["Alto (industria o centro de distribución)", "pre_en", "p3"]] },
    pre_en: { q: "¿Qué conexión eléctrica tienes disponible?", key: "Energía", opts: [["Monofásica (enchufe común)", "compra"], ["Trifásica", "compra"], ["No lo sé", "compra"]] },
    // ProfiPack
    pp_vol: { q: "¿Cuántos envíos despachas al mes aproximadamente?", key: "Envíos al mes", opts: [["Menos de 500", "pp_en", "q1"], ["Entre 500 y 5.000", "pp_en", "q2"], ["Más de 5.000", "pp_en", "q3"]] },
    pp_en: { q: "¿Qué conexión eléctrica tienes disponible?", key: "Energía", opts: [["Monofásica", "compra"], ["Trifásica", "compra"], ["No lo sé", "compra"]] },
    // PET
    pet_vol: { q: "¿Qué quieres compactar y en qué cantidad?", key: "Material y volumen", opts: [["Botellas PET, poca cantidad", "compra"], ["Botellas PET y latas, volumen medio", "compra"], ["Gran volumen o envases con líquido", "compra"]] },
    // Arriendo
    arr_eq: { q: "¿Qué tipo de equipo quieres arrendar?", key: "Equipo a arrendar", opts: [["Destructora de papel", "arr_t"], ["Prensa o compactadora", "arr_t"], ["Recicladora de cartón ProfiPack", "arr_t"], ["No lo sé, necesito orientación", "arr_t"]] },
    arr_t: { q: "¿Por cuánto tiempo lo necesitas?", key: "Duración", opts: [["Por días", "plazo"], ["Por meses", "plazo"], ["Por años", "plazo"], ["No lo sé aún", "plazo"]] },
    // Servicio
    ser_tipo: { q: "¿Qué necesitas?", key: "Servicio", opts: [["Reparación o mantención", "ser_mod"], ["Repuestos", "ser_mod"], ["Insumos (aceite, cintas, alambres)", "ser_mod"], ["Instalación o puesta en marcha", "ser_mod"]] },
    ser_mod: { q: "¿Cuál es el modelo de tu equipo? (puedes escribir 'no sé')", key: "Modelo", input: "text", next: "plazo", ph: "Ej.: HSM B34 o V-Press 860" },
    // Comunes
    compra: COMPRA,
    plazo: PLAZO,
    extra: { q: "¿Algo más que debamos saber? (opcional)", key: "Comentarios", input: "text", next: "nombre", ph: "Escribe aquí o deja vacío", opcional: true },
    nombre: { q: "Para enviarte la cotización, ¿cuál es tu nombre?", key: "Nombre", input: "text", next: "empresa", ph: "Nombre y apellido" },
    empresa: { q: "¿De qué empresa o institución eres?", key: "Empresa", input: "text", next: "correo", ph: "Empresa (opcional)", opcional: true },
    correo: { q: "¿A qué correo te enviamos la cotización?", key: "Correo", input: "email", next: "fono", ph: "tucorreo@empresa.cl" },
    fono: { q: "¿Y un teléfono para coordinar? (opcional)", key: "Teléfono", input: "tel", next: "fin", ph: "+56 9 …", opcional: true }
  };

  // ---------- Recomendación referencial ----------
  function recomendar(t, c) {
    var lin = { v1: "Compact o Home Office", v2: "Office Pro", v3: "Departamental", v4: "Industrial Powerline" };
    var rutas = { v1: "destructoras-de-papel/compact/", v2: "destructoras-de-papel/office-pro/", v3: "destructoras-de-papel/departamental/", v4: "destructoras-de-papel/industrial-powerline/" };
    var niv = { s1: "P-2 (corte en tiras)", s2: "P-3 a P-4", s3: "P-4 o superior (corte en partículas)", s4: "P-5 a P-7" };
    if (t === "doc") { return { txt: "Por lo que cuentas, te orientaría hacia la línea " + lin[c.v] + ", con nivel de seguridad " + niv[c.s] + " (DIN 66399, referencial).", ruta: rutas[c.v], etiqueta: "Ver línea " + lin[c.v] }; }
    if (t === "disc") { return { txt: "Para destruir soportes digitales tenemos las destructoras de discos duros HSM StoreEx.", ruta: "destruccion-de-discos-duros/", etiqueta: "Ver destructoras de discos" }; }
    if (t === "pre") {
      var m = { p1: ["prensas verticales V-Press", "prensas-compactadoras/prensas-verticales/"], p2: ["prensas horizontales HL (semiautomáticas)", "prensas-compactadoras/prensas-horizontales-hl/"], p3: ["prensas horizontales VK (automáticas)", "prensas-compactadoras/prensas-horizontales-vk/"] }[c.p];
      return { txt: "Para ese volumen te orientaría hacia las " + m[0] + ".", ruta: m[1], etiqueta: "Ver prensas" };
    }
    if (t === "pp") { return { txt: c.q === "q1" ? "Para ese volumen suele bastar el ProfiPack C 400 (de sobremesa)." : "Para ese volumen te orientaría hacia el ProfiPack P 425 (3 capas).", ruta: "recicladora-de-carton-profipack/", etiqueta: "Ver ProfiPack" }; }
    if (t === "pet") { return { txt: "Para botellas PET y latas tenemos perforadoras y compactadoras PET-Crusher.", ruta: "perforadoras-de-pet/", etiqueta: "Ver perforadoras de PET" }; }
    if (t === "arr") { return { txt: "Arrendamos por días, meses o un año, con servicio técnico propio.", ruta: "arriendo-de-equipos/", etiqueta: "Ver arriendo" }; }
    if (t === "ser") { return { txt: "Nuestro servicio técnico atiende en tu lugar de trabajo o en nuestras oficinas.", ruta: "servicio-tecnico/", etiqueta: "Ver servicio técnico" }; }
    return null;
  }
  var INTERES = { doc: "destruccion-documentos", disc: "discos-duros", pre: "prensas", pp: "profipack", pet: "pet", arr: "arriendo", ser: "servicio-tecnico" };

  // ---------- Interfaz ----------
  var raiz = document.createElement("div");
  raiz.innerHTML =
    '<button type="button" class="asesor-btn" aria-expanded="false" aria-controls="asesor-panel"><span aria-hidden="true">💬</span> ¿Te ayudo a cotizar?</button>' +
    '<section class="asesor-panel" id="asesor-panel" role="dialog" aria-label="Asistente de cotización HSM" hidden>' +
    '<header><strong>Asistente HSM</strong><button type="button" class="asesor-cerrar" aria-label="Cerrar asistente">×</button></header>' +
    '<div class="asesor-msgs" aria-live="polite"></div><div class="asesor-ctl"></div></section>';
  document.body.appendChild(raiz);
  var btn = raiz.querySelector(".asesor-btn"), panel = raiz.querySelector(".asesor-panel");
  var msgs = raiz.querySelector(".asesor-msgs"), ctl = raiz.querySelector(".asesor-ctl");
  var estado = null, iniciado = false;

  function nuevo() { estado = { tema: "", c: {}, resp: [], datos: {} }; }
  function burbuja(texto, tipo) {
    var d = document.createElement("div"); d.className = "asesor-b " + (tipo || "bot"); d.textContent = texto; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d;
  }
  function evento(n, d) { if (window.gtag) { window.gtag("event", n, d || {}); } }

  function preguntar(id) {
    var n = F[id]; if (!n) { return resumen(); }
    burbuja(n.q, "bot"); ctl.innerHTML = "";
    if (n.opts) {
      n.opts.forEach(function (o) {
        var b = document.createElement("button"); b.type = "button"; b.className = "asesor-op"; b.textContent = o[0];
        b.addEventListener("click", function () { responder(n, id, o[0], o[1], o[2]); }); ctl.appendChild(b);
      });
    } else {
      var f = document.createElement("form"); f.className = "asesor-in";
      var i = document.createElement("input"); i.type = n.input; i.placeholder = n.ph || ""; i.setAttribute("aria-label", n.q); i.autocomplete = n.input === "email" ? "email" : (id === "nombre" ? "name" : "off");
      var s = document.createElement("button"); s.type = "submit"; s.className = "asesor-env"; s.textContent = "Enviar";
      f.appendChild(i); f.appendChild(s);
      if (n.opcional) { var sk = document.createElement("button"); sk.type = "button"; sk.className = "asesor-saltar"; sk.textContent = "Saltar"; sk.addEventListener("click", function () { responder(n, id, "", n.next); }); f.appendChild(sk); }
      f.addEventListener("submit", function (e) {
        e.preventDefault(); var v = i.value.trim();
        if (!v && !n.opcional) { i.focus(); return; }
        if (n.input === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { burbuja("Revisa el correo, parece incompleto.", "bot"); i.focus(); return; }
        responder(n, id, v, n.next);
      });
      ctl.appendChild(f); i.focus();
    }
  }
  function responder(n, id, texto, sig, clave) {
    if (id === "inicio") { estado.tema = clave; }
    if (clave && id !== "inicio") { estado.c[clave.charAt(0)] = clave; }
    if (texto) { burbuja(texto, "yo"); estado.resp.push([n.key, texto]); }
    ctl.innerHTML = "";
    if (n.key === "Nombre" || n.key === "Empresa" || n.key === "Correo" || n.key === "Teléfono") { estado.datos[n.key] = texto; }
    setTimeout(function () { sig === "fin" ? resumen() : preguntar(sig); }, 250);
  }
  function textoResumen() {
    var l = ["Hola, soy " + (estado.datos["Nombre"] || "") + (estado.datos["Empresa"] ? " (" + estado.datos["Empresa"] + ")" : "") + ". Quiero cotizar con HSM Chile:"];
    estado.resp.forEach(function (r) { if (["Nombre", "Empresa", "Correo", "Teléfono"].indexOf(r[0]) < 0) { l.push("• " + r[0] + ": " + r[1]); } });
    var rc = recomendar(estado.tema, estado.c); if (rc) { l.push("• Orientación del asistente: " + rc.txt); }
    l.push("Correo: " + (estado.datos["Correo"] || "-")); l.push("Teléfono: " + (estado.datos["Teléfono"] || "-"));
    return l.join("\n");
  }
  function resumen() {
    var rc = recomendar(estado.tema, estado.c);
    burbuja("¡Gracias, " + (estado.datos["Nombre"] || "") + "! Esto es lo que entendí:", "bot");
    burbuja(textoResumen().split("\n").slice(1).join("\n"), "bot");
    if (rc) {
      var d = burbuja(rc.txt + " ", "bot"); var a = document.createElement("a"); a.href = RAIZ + rc.ruta; a.textContent = rc.etiqueta; d.appendChild(a);
    }
    ctl.innerHTML = "";
    var lab = document.createElement("label"); lab.className = "asesor-acepto";
    lab.innerHTML = '<input type="checkbox"> <span>Acepto que Imex use estos datos para responder mi solicitud (<a href="' + RAIZ + 'politica-de-privacidad/">política de privacidad</a>).</span>';
    ctl.appendChild(lab); var chk = lab.querySelector("input");
    function exigir() { if (!chk.checked) { burbuja("Para enviar necesito que aceptes el uso de tus datos.", "bot"); chk.focus(); return false; } return true; }
    if (C.WHATSAPP) {
      var w = document.createElement("a"); w.className = "btn btn-wsp asesor-enviar"; w.href = "#"; w.innerHTML = '<span>Enviar por WhatsApp</span>';
      w.addEventListener("click", function (e) { e.preventDefault(); if (!exigir()) { return; } evento("asistente_whatsapp", { tema: estado.tema }); window.open("https://wa.me/" + C.WHATSAPP + "?text=" + encodeURIComponent(textoResumen()), "_blank", "noopener"); fin(); });
      ctl.appendChild(w);
    }
    var m = document.createElement("button"); m.type = "button"; m.className = "btn btn-sec asesor-enviar"; m.textContent = C.FORM_ENDPOINT ? "Enviar solicitud" : "Enviar por correo";
    m.addEventListener("click", function () { if (!exigir()) { return; } evento("asistente_correo", { tema: estado.tema }); enviarCorreo(); });
    ctl.appendChild(m);
  }
  function fin() { burbuja("¡Listo! Un ejecutivo te contactará para confirmar el modelo y enviarte la cotización. Si es urgente, llámanos al " + TEL + ".", "bot"); }
  function enviarCorreo() {
    var d = { nombre: estado.datos["Nombre"], empresa: estado.datos["Empresa"] || "", correo: estado.datos["Correo"], telefono: estado.datos["Teléfono"] || "", interes: INTERES[estado.tema] || "otro", equipo: "", mensaje: textoResumen(), pagina: location.href, origen: "asistente" };
    if (C.FORM_ENDPOINT) {
      fetch(C.FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(d) })
        .then(function (r) { if (!r.ok) { throw new Error(); } ctl.innerHTML = ""; fin(); })
        .catch(function () { burbuja("No pudimos enviar la solicitud. Escríbenos a " + C.CORREO_COTIZACIONES + " o llama al " + TEL + ".", "bot"); });
    } else {
      window.location.href = "mailto:" + C.CORREO_COTIZACIONES + "?subject=" + encodeURIComponent("Cotización web HSM (asistente): " + (INTERES[estado.tema] || "consulta")) + "&body=" + encodeURIComponent(textoResumen());
      ctl.innerHTML = ""; fin();
    }
  }
  function abrir() {
    panel.hidden = false; btn.setAttribute("aria-expanded", "true"); btn.hidden = true;
    if (!iniciado) { iniciado = true; nuevo(); preguntar("inicio"); evento("asistente_abierto"); }
  }
  function cerrar() { panel.hidden = true; btn.hidden = false; btn.setAttribute("aria-expanded", "false"); btn.focus(); }
  btn.addEventListener("click", abrir);
  raiz.querySelector(".asesor-cerrar").addEventListener("click", cerrar);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { cerrar(); } });
})();
