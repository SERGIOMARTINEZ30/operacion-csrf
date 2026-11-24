/* =========================================================
   Operación CSRF — Lógica del juego
   Vanilla JS, sin dependencias. Funciona abriendo index.html
   o desde cualquier hosting estático.
   ========================================================= */
(() => {
  "use strict";

  const app = document.getElementById("app");
  const hud = document.getElementById("hud");
  const $puntos = document.getElementById("hud-puntos");
  const $racha = document.getElementById("hud-racha");
  const $vidas = document.getElementById("hud-vidas");
  const $toast = document.getElementById("toast");

  const VIDAS_MAX = 3;
  const CLAVE_GUARDADO = "operacion-csrf-v1";

  /* ---------------- Guardado (localStorage con respaldo en memoria) ---------------- */
  const progresoVacio = () => ({ desbloqueado: 0, niveles: {} });
  let progreso = progresoVacio();
  try {
    const raw = localStorage.getItem(CLAVE_GUARDADO);
    if (raw) progreso = Object.assign(progresoVacio(), JSON.parse(raw));
  } catch (e) { /* sin almacenamiento: se juega igual */ }
  const guardar = () => { try { localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(progreso)); } catch (e) {} };

  /* ---------------- Estado de la partida ---------------- */
  const st = { nivel: null, puntos: 0, racha: 0, vidas: VIDAS_MAX, aciertos: 0, total: 0, idx: 0 };
  let temporizador = null;
  const pararTimer = () => { if (temporizador) { clearTimeout(temporizador); temporizador = null; } };

  /* ---------------- Utilidades ---------------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const barajar = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const totalGuardado = () => Object.values(progreso.niveles).reduce((s, n) => s + (n.puntos || 0), 0);
  const nivelInfo = (id) => NIVELES.find((n) => n.id === id);

  function pintar(html) {
    pararTimer();
    app.innerHTML = `<section class="pantalla">${html}</section>`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toast(msg) {
    $toast.textContent = msg;
    $toast.classList.add("ver");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => $toast.classList.remove("ver"), 1600);
  }

  function actualizarHUD(modoMapa) {
    if (modoMapa) {
      $puntos.textContent = totalGuardado();
      $racha.textContent = "–";
      $vidas.innerHTML = "";
      return;
    }
    $puntos.textContent = st.puntos;
    $racha.textContent = st.racha;
    let h = "";
    for (let i = 0; i < VIDAS_MAX; i++) h += `<span class="${i < st.vidas ? "" : "muerta"}">❤️</span>`;
    $vidas.innerHTML = h;
  }

  /* Suma puntos por acierto: base + bonus de racha + bonus extra (tiempo) */
  function acierto(base = 100, extra = 0) {
    st.racha++;
    st.aciertos++;
    const bonusRacha = Math.min(st.racha - 1, 5) * 10;
    const ganados = base + bonusRacha + extra;
    st.puntos += ganados;
    actualizarHUD();
    return ganados;
  }
  function fallo() {
    st.racha = 0;
    st.vidas = Math.max(0, st.vidas - 1);
    actualizarHUD();
    const sec = app.querySelector(".pantalla");
    if (sec) { sec.classList.remove("sacudir"); void sec.offsetWidth; sec.classList.add("sacudir"); }
  }

  function iniciarPartida(id, total) {
    Object.assign(st, { nivel: id, puntos: 0, racha: 0, vidas: VIDAS_MAX, aciertos: 0, total, idx: 0 });
    hud.classList.remove("oculto-stats");
    actualizarHUD();
  }

  const cabecera = (id, idx, total, extra = "") => {
    const n = nivelInfo(id);
    const pct = Math.round((idx / total) * 100);
    return `<div class="nivel-head">
      <div><div class="kicker">Nivel ${n.num} · ${esc(n.titulo)}</div>${extra}</div>
      <div class="contador">${Math.min(idx + 1, total)} / ${total}</div>
      <div class="progreso"><div style="width:${pct}%"></div></div>
    </div>`;
  };

  const galletaSVG = (cara = "feliz") => `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="#d79a4a" stroke="#ffe100" stroke-width="2"/>
      <circle cx="32" cy="32" r="24" fill="#e7ad5c"/>
      <circle cx="18" cy="22" r="3.2" fill="#5a3415"/><circle cx="45" cy="18" r="2.6" fill="#5a3415"/>
      <circle cx="47" cy="42" r="3" fill="#5a3415"/><circle cx="17" cy="44" r="2.4" fill="#5a3415"/>
      <circle cx="25" cy="30" r="4" fill="#fff"/><circle cx="39" cy="30" r="4" fill="#fff"/>
      <circle cx="26" cy="31" r="2" fill="#111"/><circle cx="40" cy="31" r="2" fill="#111"/>
      ${cara === "triste"
        ? '<path d="M25 44 Q32 38 39 44" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
        : '<path d="M24 40 Q32 47 40 40" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>'}
    </svg>`;
  const galleta = (txt, cara) => `<div class="galleta">${galletaSVG(cara)}<div class="burbuja">${txt}</div></div>`;

  const feedback = (ok, titulo, exp, pts) =>
    `<div class="feedback ${ok ? "ok" : "bad"}">${ok && pts ? `<span class="puntos-ganados">+${pts}</span>` : ""}<strong>${titulo}</strong>${exp}</div>`;

  /* Botón "Siguiente": si se acabaron las vidas lleva a la pantalla de derrota */
  function botonSiguiente(cont, alSeguir, texto = "Siguiente →") {
    const sinVidas = st.vidas <= 0;
    cont.insertAdjacentHTML("beforeend",
      `<div class="acciones"><button class="btn btn-neon" id="btn-sig">${sinVidas ? "Ver resultado" : texto}</button></div>`);
    const b = document.getElementById("btn-sig");
    b.focus({ preventScroll: true });
    b.onclick = () => (sinVidas ? derrota() : alSeguir());
  }

  /* =========================================================
     PANTALLAS GENERALES
     ========================================================= */
  function portada() {
    hud.classList.add("oculto-stats");
    const total = totalGuardado();
    pintar(`
      <div class="portada">
        <div>
          <div class="kicker">Juego educativo de ciberseguridad</div>
          <h1 class="neon">Operación<br>CSRF</h1>
          <p class="lead">Una página falsa promete un iPhone gratis. Detrás, un formulario oculto intenta usar tu sesión del banco. ¿Podrás entender el ataque… y detenerlo?</p>
          <p class="muted">6 etapas · retos, escenarios, código real y trivia · unos 15 minutos</p>
          ${total ? `<p class="record">Tu puntaje acumulado: <b>${total}</b> puntos</p>` : ""}
          <div class="acciones">
            <button class="btn btn-neon" id="b-jugar">${progreso.desbloqueado > 0 ? "Continuar misión" : "Empezar misión"} ▸</button>
          </div>
        </div>
        <div class="portada-arte">${arteEscudo()}</div>
      </div>`);
    document.getElementById("b-jugar").onclick = mapa;
  }

  function arteEscudo() {
    return `<svg class="flotar" viewBox="0 0 240 270" aria-hidden="true">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a2a"/><stop offset="1" stop-color="#0a0a0a"/></linearGradient>
      </defs>
      <path d="M120 10 L220 48 V130 C220 196 176 238 120 260 C64 238 20 196 20 130 V48 Z" fill="url(#g1)" stroke="#ffe100" stroke-width="5"/>
      <path d="M120 28 L204 60 V130 C204 186 168 222 120 241 C72 222 36 186 36 130 V60 Z" fill="none" stroke="#ffe100" stroke-opacity=".35" stroke-width="2"/>
      <g transform="translate(62 70) scale(1.8)">
        <circle cx="32" cy="32" r="28" fill="#d79a4a" stroke="#ffe100" stroke-width="1.5"/>
        <circle cx="32" cy="32" r="24" fill="#e7ad5c"/>
        <circle cx="18" cy="22" r="3.2" fill="#5a3415"/><circle cx="45" cy="18" r="2.6" fill="#5a3415"/>
        <circle cx="47" cy="42" r="3" fill="#5a3415"/><circle cx="17" cy="44" r="2.4" fill="#5a3415"/>
        <circle cx="25" cy="30" r="4" fill="#fff"/><circle cx="39" cy="30" r="4" fill="#fff"/>
        <circle cx="26" cy="31" r="2" fill="#111"/><circle cx="40" cy="31" r="2" fill="#111"/>
        <path d="M24 40 Q32 47 40 40" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </g>
      <text x="120" y="206" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="#ffe100">session_id=••••</text>
    </svg>`;
  }

  function mapa() {
    hud.classList.add("oculto-stats");
    hud.classList.remove("oculto-stats");
    actualizarHUD(true);
    const todos = NIVELES.every((n) => progreso.niveles[n.id]);
    const tarjetas = NIVELES.map((n) => {
      const bloqueado = n.num > progreso.desbloqueado;
      const r = progreso.niveles[n.id];
      const est = r ? "⭐".repeat(r.estrellas) + "☆".repeat(3 - r.estrellas) : "";
      return `<button class="nivel ${r ? "hecho" : ""}" data-id="${n.id}" ${bloqueado ? "disabled" : ""}>
        <span class="nivel-ico">${n.icono}</span>
        <span>
          <span class="nivel-num">${n.num === 0 ? "INTRO" : "NIVEL " + n.num}</span>
          <span class="nivel-tit" style="display:block">${esc(n.titulo)}</span>
          <span class="nivel-sub" style="display:block">${esc(n.sub)}</span>
          ${r ? `<span class="nivel-estrellas" style="display:block">${est} <span class="muted" style="font-size:12px">${r.puntos} pts</span></span>` : ""}
        </span>
        ${bloqueado ? '<span class="candado">🔒</span>' : ""}
      </button>`;
    }).join("");
    pintar(`
      <div class="kicker">Mapa de la misión</div>
      <h2 class="neon">Elige tu etapa</h2>
      <p class="lead">Completa cada etapa para desbloquear la siguiente. Puedes repetirlas para mejorar tus estrellas.</p>
      <div class="mapa">${tarjetas}</div>
      <div class="acciones">
        ${todos ? '<button class="btn btn-neon" id="b-final">🏆 Ver resultado final</button>' : ""}
        <button class="btn btn-ghost" id="b-portada">← Portada</button>
        ${progreso.desbloqueado > 0 ? '<button class="btn btn-ghost" id="b-reset">Reiniciar progreso</button>' : ""}
      </div>`);
    app.querySelectorAll(".nivel").forEach((b) => (b.onclick = () => abrirNivel(b.dataset.id)));
    document.getElementById("b-portada").onclick = portada;
    const bf = document.getElementById("b-final"); if (bf) bf.onclick = final;
    const br = document.getElementById("b-reset");
    if (br) br.onclick = () => {
      if (br.dataset.confirmar) { progreso = progresoVacio(); guardar(); toast("Progreso reiniciado"); mapa(); }
      else { br.dataset.confirmar = "1"; br.textContent = "¿Seguro? Toca otra vez"; }
    };
  }

  function abrirNivel(id) {
    ({ academia, amenaza: nivelAmenaza, atacante: nivelAtacante, servidor: nivelServidor, codigo: nivelCodigo, trivia: nivelTrivia })[id]();
  }

  function estrellasDe(aciertos, total) {
    const p = total ? aciertos / total : 1;
    return p >= 0.9 ? 3 : p >= 0.7 ? 2 : 1;
  }

  function terminarNivel() {
    const n = nivelInfo(st.nivel);
    const estrellas = estrellasDe(st.aciertos, st.total);
    const previo = progreso.niveles[n.id];
    const mejora = !previo || st.puntos > previo.puntos;
    if (mejora) progreso.niveles[n.id] = { puntos: st.puntos, estrellas: Math.max(estrellas, previo ? previo.estrellas : 0) };
    else if (estrellas > previo.estrellas) previo.estrellas = estrellas;
    progreso.desbloqueado = Math.max(progreso.desbloqueado, n.num + 1);
    guardar();
    const siguiente = NIVELES.find((x) => x.num === n.num + 1);
    const est = [1, 2, 3].map((i) => `<span class="${i <= estrellas ? "" : "apagada"}">⭐</span>`).join("");
    pintar(`
      <div class="resultado">
        <div class="kicker">${esc(n.titulo)} · completado</div>
        <h2 class="neon">${estrellas === 3 ? "¡Impecable!" : estrellas === 2 ? "¡Muy bien!" : "¡Superado!"}</h2>
        <div class="estrellas">${est}</div>
        <div class="res-datos">
          <div class="res-dato"><b>${st.puntos}</b><span>Puntos</span></div>
          ${st.total ? `<div class="res-dato"><b>${st.aciertos}/${st.total}</b><span>Aciertos</span></div>` : ""}
          <div class="res-dato"><b>${"❤️".repeat(st.vidas) || "0"}</b><span>Vidas</span></div>
        </div>
        ${mejora && previo ? '<p class="muted">¡Nuevo récord en esta etapa!</p>' : ""}
        ${galleta(mensajeGalleta(estrellas))}
        <div class="acciones">
          ${siguiente ? `<button class="btn btn-neon" id="b-sig">Siguiente: ${esc(siguiente.titulo)} ▸</button>` : '<button class="btn btn-neon" id="b-fin">🏆 Ver resultado final</button>'}
          <button class="btn btn-ghost" id="b-rep">↺ Repetir</button>
          <button class="btn btn-ghost" id="b-mapa">Mapa</button>
        </div>
      </div>`);
    const bs = document.getElementById("b-sig"); if (bs) bs.onclick = () => abrirNivel(siguiente.id);
    const bfin = document.getElementById("b-fin"); if (bfin) bfin.onclick = final;
    document.getElementById("b-rep").onclick = () => abrirNivel(n.id);
    document.getElementById("b-mapa").onclick = mapa;
  }
  const mensajeGalleta = (e) =>
    e === 3 ? "¡Me protegiste perfecto! Así ningún sitio extraño me usa." :
    e === 2 ? "¡Bien hecho! Repasa las explicaciones de los fallos y vas por las 3 estrellas." :
              "Lo lograste. Repite la etapa: cada explicación es una pista para la próxima.";

  function derrota() {
    const n = nivelInfo(st.nivel);
    pintar(`
      <div class="resultado">
        <div class="kicker">${esc(n.titulo)}</div>
        <h2 class="neon">Sin vidas</h2>
        <p class="lead" style="margin:10px auto">El atacante ganó esta ronda. Llevabas ${st.aciertos} aciertos y ${st.puntos} puntos.</p>
        ${galleta("Tranquilo: hasta los bancos grandes cayeron con CSRF. Lee las pistas y vuelve a intentarlo.", "triste")}
        <div class="acciones">
          <button class="btn btn-neon" id="b-rep">↺ Intentar de nuevo</button>
          <button class="btn btn-ghost" id="b-mapa">Mapa</button>
        </div>
      </div>`);
    document.getElementById("b-rep").onclick = () => abrirNivel(n.id);
    document.getElementById("b-mapa").onclick = mapa;
  }

  function final() {
    hud.classList.remove("oculto-stats");
    actualizarHUD(true);
    const total = totalGuardado();
    const rango = RANGOS.filter((r) => total >= r.min).pop();
    const estrellas = NIVELES.reduce((s, n) => s + (progreso.niveles[n.id] ? progreso.niveles[n.id].estrellas : 0), 0);
    const filas = NIVELES.map((n) => {
      const r = progreso.niveles[n.id];
      return `<div><span>${n.icono} ${esc(n.titulo)}</span><span>${r ? "⭐".repeat(r.estrellas) + " · " + r.puntos + " pts" : "—"}</span></div>`;
    }).join("");
    pintar(`
      <div class="resultado">
        <div class="kicker">Misión cumplida</div>
        <h2 class="neon">Resultado final</h2>
        <div class="res-datos" style="margin-top:16px">
          <div class="res-dato"><b>${total}</b><span>Puntos</span></div>
          <div class="res-dato"><b>${estrellas}/${NIVELES.length * 3}</b><span>Estrellas</span></div>
        </div>
        <div class="muted" style="margin-top:12px">Tu rango</div>
        <div class="rango">${esc(rango.nombre)}</div>
        <p class="muted">${esc(rango.desc)}</p>
        <div class="resumen-niveles">${filas}</div>
        <div class="card" style="max-width:620px;margin:20px auto 0;text-align:left">
          <b style="color:var(--neon)">Lo que te llevas</b>
          <ul style="margin:8px 0 0 18px;color:#ddd">
            <li>CSRF no roba la sesión: la <b>usa</b>. El navegador adjunta la cookie por el atacante.</li>
            <li>Una cookie válida <b>no prueba</b> que el usuario quiso hacer la acción.</li>
            <li>Defensa en capas: <b>token anti-CSRF</b> como base; <b>SameSite</b> y <b>re-autenticación</b> como refuerzo; nunca cambiar datos con GET.</li>
          </ul>
        </div>
        <div class="acciones">
          <button class="btn btn-neon" id="b-copiar">📋 Copiar mi resultado</button>
          <button class="btn btn-ghost" id="b-mapa">Mapa</button>
        </div>
      </div>`);
    document.getElementById("b-mapa").onclick = mapa;
    document.getElementById("b-copiar").onclick = async () => {
      const txt = `Completé Operación CSRF con ${total} puntos y ${estrellas} estrellas. Rango: ${rango.nombre}. ¿Puedes superarme? ${location.href.split("#")[0]}`;
      try { await navigator.clipboard.writeText(txt); toast("¡Resultado copiado!"); }
      catch (e) { toast("No se pudo copiar"); }
    };
  }

  /* =========================================================
     INTRO: ACADEMIA
     ========================================================= */
  function academia() {
    iniciarPartida("academia", 0);
    let i = 0;
    const ver = () => {
      const L = ACADEMIA[i];
      const puntos = ACADEMIA.map((_, k) => `<span class="${k <= i ? "on" : ""}"></span>`).join("");
      pintar(`
        ${cabecera("academia", i, ACADEMIA.length)}
        <div class="card leccion"><h3>${L.titulo}</h3>${L.html}</div>
        ${galleta(L.galleta)}
        <div class="puntos-lec">${puntos}</div>
        <div class="acciones">
          ${i > 0 ? '<button class="btn btn-ghost" id="b-ant">← Anterior</button>' : ""}
          <button class="btn btn-neon" id="b-sig">${i < ACADEMIA.length - 1 ? "Siguiente →" : "¡Entendido! +100 pts"}</button>
        </div>`);
      const ba = document.getElementById("b-ant"); if (ba) ba.onclick = () => { i--; ver(); };
      document.getElementById("b-sig").onclick = () => {
        if (i < ACADEMIA.length - 1) { i++; ver(); }
        else { st.puntos = 100; actualizarHUD(); terminarNivel(); }
      };
    };
    ver();
  }

  /* =========================================================
     NIVEL 1: ¿AMENAZA O NO?
     ========================================================= */
  function nivelAmenaza() {
    const preguntas = barajar(AMENAZAS);
    iniciarPartida("amenaza", preguntas.length);
    const ver = () => {
      const q = preguntas[st.idx];
      pintar(`
        ${cabecera("amenaza", st.idx, preguntas.length, '<h2 class="neon">¿Es CSRF?</h2>')}
        <div class="card"><p class="escenario">${esc(q.txt)}</p></div>
        <div class="botones-sino" id="sino">
          <button class="btn btn-bad" data-r="1">🎯 Sí, es CSRF</button>
          <button class="btn btn-ghost" data-r="0">🚫 No, es otro ataque</button>
        </div>
        <div id="fb"></div>`);
      app.querySelectorAll("#sino .btn").forEach((b) => (b.onclick = () => {
        app.querySelectorAll("#sino .btn").forEach((x) => (x.disabled = true));
        const ok = (b.dataset.r === "1") === q.csrf;
        const fb = document.getElementById("fb");
        if (ok) fb.innerHTML = feedback(true, "¡Correcto!", esc(q.exp), acierto());
        else { fallo(); fb.innerHTML = feedback(false, "No exactamente…", esc(q.exp)); }
        botonSiguiente(fb, () => { st.idx++; st.idx < preguntas.length ? ver() : terminarNivel(); });
      }));
    };
    ver();
  }

  /* =========================================================
     NIVEL 2: MENTE DEL ATACANTE
     ========================================================= */
  function nivelAtacante() {
    iniciarPartida("atacante", ATACANTE.length);
    const kitTxt = ["Víctima con sesión abierta", "Acción predecible sin secretos", "Formulario oculto auto-enviado", "Servidor que solo mira la cookie"];
    let primerIntento = true;
    const ver = () => {
      const q = ATACANTE[st.idx];
      const ops = barajar(q.opciones);
      const kit = kitTxt.map((t, k) => `<li class="${k < st.idx ? "listo" : ""}">${t}</li>`).join("");
      primerIntento = true;
      pintar(`
        ${cabecera("atacante", st.idx, ATACANTE.length, '<h2 class="neon">Mente del atacante</h2>')}
        <p class="muted" style="margin:-6px 0 14px">Para defenderte, primero entiende cómo piensa el atacante. Todo es simulado y con datos ficticios.</p>
        <div class="arma">
          <div>
            <div class="card"><p class="escenario">${esc(q.pregunta)}</p></div>
            <div class="opciones" id="ops">${ops.map((o, k) =>
              `<button class="opcion" data-k="${k}"><span class="letra">${"ABC"[k]}</span><span>${esc(o.t)}</span></button>`).join("")}</div>
            <div id="fb"></div>
          </div>
          <aside class="kit"><h4>KIT DEL ATAQUE</h4><ul>${kit}</ul></aside>
        </div>`);
      app.querySelectorAll("#ops .opcion").forEach((b) => (b.onclick = () => {
        const o = ops[+b.dataset.k];
        const fb = document.getElementById("fb");
        if (o.ok) {
          app.querySelectorAll("#ops .opcion").forEach((x) => (x.disabled = true));
          b.classList.add("correcta");
          let pts = 0;
          if (primerIntento) pts = acierto(150); else { st.racha = 0; actualizarHUD(); }
          fb.innerHTML = feedback(true, primerIntento ? "¡Pieza conseguida!" : "Ahora sí", esc(o.exp), pts);
          botonSiguiente(fb, () => { st.idx++; st.idx < ATACANTE.length ? ver() : simulacion(); },
            st.idx < ATACANTE.length - 1 ? "Siguiente pieza →" : "▶ Lanzar ataque simulado");
        } else {
          b.disabled = true;
          b.classList.add("incorrecta");
          primerIntento = false;
          fallo();
          fb.innerHTML = feedback(false, "Esa pieza no sirve", esc(o.exp) + (st.vidas > 0 ? " <i>Prueba otra opción.</i>" : ""));
          if (st.vidas <= 0) { app.querySelectorAll("#ops .opcion").forEach((x) => (x.disabled = true)); botonSiguiente(fb, derrota); }
        }
      }));
    };

    function simulacion() {
      pintar(`
        <div class="kicker">Nivel 2 · Ataque simulado</div>
        <h2 class="neon">Así cae la cuenta</h2>
        <div class="navegador">
          <div class="nav-barra"><i></i><i></i><i></i><span class="nav-url">⚠️ https://premiosgratis.test/reclamar</span></div>
          <div class="nav-cuerpo"><h5>⚡ ¡FELICIDADES! ⚡</h5>Ganaste un iPhone. Cargando tu premio…</div>
        </div>
        <div class="log" id="log"></div>
        <div class="cadena">
          <div class="eslabon" id="e0"><b>1 · Correo cambiado</b>El banco ahora tiene el correo del atacante.</div>
          <div class="eslabon" id="e1"><b>2 · "Olvidé mi clave"</b>El enlace de recuperación llega al atacante.</div>
          <div class="eslabon" id="e2"><b>3 · Nueva clave</b>El atacante fija una contraseña.</div>
          <div class="eslabon" id="e3"><b>4 · Cuenta tomada</b>El dueño queda por fuera.</div>
        </div>
        <div id="fb"></div>`);
      const lineas = [
        ['', '> La víctima abre la página del "premio"…'],
        ['amar', '> El formulario oculto se envía solo:'],
        ['', 'POST /cambiar-correo HTTP/1.1\nHost: bancodemo.test\nOrigin: https://premiosgratis.test'],
        ['rojo', 'Cookie: session_id=AUTH_7F3K9Q  <- ¡adjuntada por el navegador!'],
        ['', '\ncorreo=atacante@correo.test'],
        ['amar', '\n< HTTP/1.1 200 OK — "Correo actualizado"'],
      ];
      const log = document.getElementById("log");
      let k = 0;
      const paso = () => {
        if (!document.getElementById("log")) return;
        if (k < lineas.length) {
          const [cls, t] = lineas[k++];
          const span = document.createElement("span");
          if (cls) span.className = cls;
          span.textContent = t + "\n";
          log.appendChild(span);
          temporizador = setTimeout(paso, 650);
        } else if (k < lineas.length + 4) {
          document.getElementById("e" + (k - lineas.length)).classList.add("on");
          k++;
          temporizador = setTimeout(paso, 600);
        } else {
          const fb = document.getElementById("fb");
          fb.innerHTML = feedback(true, "Lo entendiste desde adentro",
            "El atacante nunca vio la contraseña ni la cookie. Ahora piensa como defensor: un <b>token anti-CSRF</b> o pedir la <b>clave actual</b> habrían detenido todo en el paso 1.");
          botonSiguiente(fb, terminarNivel, "Terminar nivel ▸");
        }
      };
      temporizador = setTimeout(paso, 400);
    }
    ver();
  }

  /* =========================================================
     NIVEL 3: ERES EL SERVIDOR
     ========================================================= */
  function nivelServidor() {
    const peticiones = barajar(PETICIONES);
    iniciarPartida("servidor", peticiones.length);
    const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const gen = () => Array.from({ length: 8 }, () => abc[Math.floor(Math.random() * abc.length)]).join("").replace(/^(.{4})/, "$1-");
    const tokenValido = gen();
    const tokenFalso = () => tokenValido.slice(0, -2) + (tokenValido.slice(-2) === "7X" ? "Q2" : "7X");
    const SEG = 15;

    const ver = () => {
      const p = peticiones[st.idx];
      const tokTxt = p.token === "ok" ? `<span class="v-ok">${tokenValido}</span>` : p.token === "mal" ? `<span class="v-bad">${tokenFalso()}</span>` : '<span class="v-bad">(no viene)</span>';
      const origenBanco = p.origen === "https://bancodemo.test";
      pintar(`
        ${cabecera("servidor", st.idx, peticiones.length, '<h2 class="neon">Eres el servidor</h2>')}
        <div class="server-top">
          <div class="token-box">Token CSRF de esta sesión<code>${tokenValido}</code></div>
          <div class="reglas"><b>Reglas:</b> las acciones que cambian datos (POST) necesitan sesión y el <b>token exacto</b>. Un GET solo puede <b>leer</b>, nunca cambiar nada. Revisa bien el Origin.</div>
        </div>
        <div class="peticion" id="pet">
          <div class="pet-linea"><span class="metodo ${p.metodo === "GET" ? "get" : ""}">${p.metodo}</span><span class="v-neu">${esc(p.ruta)}</span></div>
          <div class="pet-linea"><span class="k">Origin:</span><span class="${origenBanco ? "v-ok" : "v-neu"}">${esc(p.origen)}</span></div>
          <div class="pet-linea"><span class="k">Cookie:</span>${p.cookie ? '<span class="v-ok">session_id=✔ válida</span>' : '<span class="v-bad">(sin cookie)</span>'}</div>
          <div class="pet-linea"><span class="k">csrf_token:</span>${p.metodo === "GET" && p.token === null ? '<span class="muted">— (GET)</span>' : tokTxt}</div>
        </div>
        <div class="timer" id="timer"><div></div></div>
        <div class="botones-sino" id="sino">
          <button class="btn btn-ok" data-r="1">✔ Aceptar</button>
          <button class="btn btn-bad" data-r="0">✖ Bloquear</button>
        </div>
        <div id="fb"></div>`);
      const inicio = performance.now();
      const barra = document.querySelector("#timer > div");
      requestAnimationFrame(() => {
        document.getElementById("timer").classList.add("corre");
        barra.style.transitionDuration = SEG + "s";
        barra.style.width = "0%";
      });
      const responder = (r) => {
        pararTimer();
        const restante = Math.max(0, SEG - (performance.now() - inicio) / 1000);
        barra.style.transitionDuration = "0s";
        barra.style.width = (restante / SEG * 100) + "%";
        app.querySelectorAll("#sino .btn").forEach((x) => (x.disabled = true));
        const fb = document.getElementById("fb");
        const correcto = r !== null && (r === "1") === p.aceptar;
        const decision = p.aceptar ? "Había que ACEPTARLA." : "Había que BLOQUEARLA.";
        if (correcto) fb.innerHTML = feedback(true, p.aceptar ? "¡Bien! Petición legítima" : "¡Ataque bloqueado!", esc(p.exp), acierto(100, Math.ceil(restante / SEG * 50)));
        else { fallo(); fb.innerHTML = feedback(false, r === null ? "¡Se acabó el tiempo!" : "Decisión incorrecta", `${decision} ${esc(p.exp)}`); }
        botonSiguiente(fb, () => { st.idx++; st.idx < peticiones.length ? ver() : terminarNivel(); });
      };
      app.querySelectorAll("#sino .btn").forEach((b) => (b.onclick = () => responder(b.dataset.r)));
      temporizador = setTimeout(() => responder(null), SEG * 1000);
    };
    ver();
  }

  /* =========================================================
     NIVEL 4: REVISIÓN DE CÓDIGO
     ========================================================= */
  function nivelCodigo() {
    const items = barajar(CODIGOS);
    iniciarPartida("codigo", items.length);
    const ver = () => {
      const c = items[st.idx];
      pintar(`
        ${cabecera("codigo", st.idx, items.length, '<h2 class="neon">Revisión de código</h2>')}
        <p class="muted" style="margin:-6px 0 12px">Eres auditor/a de seguridad. ¿Este fragmento protege contra CSRF?</p>
        <div class="card">
          <div class="codigo-tit">${esc(c.titulo)}</div>
          <pre class="code">${esc(c.code)}</pre>
        </div>
        <div class="botones-sino" id="sino">
          <button class="btn btn-bad" data-r="1">🐞 Vulnerable</button>
          <button class="btn btn-ok" data-r="0">🛡️ Seguro</button>
        </div>
        <div id="fb"></div>`);
      app.querySelectorAll("#sino .btn").forEach((b) => (b.onclick = () => {
        app.querySelectorAll("#sino .btn").forEach((x) => (x.disabled = true));
        const ok = (b.dataset.r === "1") === c.vulnerable;
        const fb = document.getElementById("fb");
        if (ok) fb.innerHTML = feedback(true, "¡Buen ojo!", esc(c.exp), acierto(120));
        else { fallo(); fb.innerHTML = feedback(false, "Revisa otra vez", esc(c.exp)); }
        botonSiguiente(fb, () => { st.idx++; st.idx < items.length ? ver() : terminarNivel(); });
      }));
    };
    ver();
  }

  /* =========================================================
     NIVEL 5: TRIVIA RELÁMPAGO
     ========================================================= */
  function nivelTrivia() {
    const preguntas = barajar(TRIVIA);
    iniciarPartida("trivia", preguntas.length);
    const SEG = 20;
    const ver = () => {
      const q = preguntas[st.idx];
      const orden = barajar(q.o.map((t, k) => ({ t, k })));
      pintar(`
        ${cabecera("trivia", st.idx, preguntas.length, '<h2 class="neon">Trivia relámpago</h2>')}
        <div class="card"><p class="escenario">${esc(q.p)}</p></div>
        <div class="timer" id="timer"><div></div></div>
        <div class="opciones" id="ops">${orden.map((o, i) =>
          `<button class="opcion" data-k="${o.k}"><span class="letra">${"ABCD"[i]}</span><span>${esc(o.t)}</span></button>`).join("")}</div>
        <div id="fb"></div>`);
      const inicio = performance.now();
      const barra = document.querySelector("#timer > div");
      requestAnimationFrame(() => {
        document.getElementById("timer").classList.add("corre");
        barra.style.transitionDuration = SEG + "s";
        barra.style.width = "0%";
      });
      const responder = (k) => {
        pararTimer();
        const restante = Math.max(0, SEG - (performance.now() - inicio) / 1000);
        barra.style.transitionDuration = "0s";
        barra.style.width = (restante / SEG * 100) + "%";
        app.querySelectorAll("#ops .opcion").forEach((x) => {
          x.disabled = true;
          if (+x.dataset.k === q.c) x.classList.add("correcta");
          else if (+x.dataset.k === k) x.classList.add("incorrecta");
        });
        const fb = document.getElementById("fb");
        if (k === q.c) fb.innerHTML = feedback(true, "¡Correcto!", esc(q.exp), acierto(100, Math.ceil(restante / SEG * 50)));
        else { fallo(); fb.innerHTML = feedback(false, k === null ? "¡Se acabó el tiempo!" : "Incorrecto", esc(q.exp)); }
        botonSiguiente(fb, () => { st.idx++; st.idx < preguntas.length ? ver() : terminarNivel(); });
      };
      app.querySelectorAll("#ops .opcion").forEach((b) => (b.onclick = () => responder(+b.dataset.k)));
      temporizador = setTimeout(() => responder(null), SEG * 1000);
    };
    ver();
  }

  /* ---------------- Arranque ---------------- */
  document.getElementById("btn-inicio").onclick = () => (st.nivel ? mapa() : portada());
  portada();
})();
