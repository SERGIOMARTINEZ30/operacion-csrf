/* =========================================================
   Operación CSRF — Contenido del juego
   Todo el contenido educativo vive aquí para poder revisarlo
   y corregirlo sin tocar la lógica del juego.
   ========================================================= */

const NIVELES = [
  { id: "academia", num: 0, titulo: "Academia", sub: "Aprende qué es CSRF", icono: "📘" },
  { id: "amenaza",  num: 1, titulo: "¿Amenaza o no?", sub: "Distingue CSRF de otros ataques", icono: "🔍" },
  { id: "atacante", num: 2, titulo: "Mente del atacante", sub: "Arma un ataque (simulado)", icono: "🎭" },
  { id: "servidor", num: 3, titulo: "Eres el servidor", sub: "Acepta o bloquea peticiones", icono: "🛡️" },
  { id: "codigo",   num: 4, titulo: "Revisión de código", sub: "Encuentra el código vulnerable", icono: "🧑‍💻" },
  { id: "trivia",   num: 5, titulo: "Trivia relámpago", sub: "Casos reales y defensas", icono: "⚡" }
];

/* ---------- ACADEMIA ---------- */
const ACADEMIA = [
  {
    titulo: "¿Qué es CSRF?",
    html: `<p><b>Cross-Site Request Forgery</b> (falsificación de solicitudes entre sitios) es un ataque en el que una página maliciosa hace que <b>tu propio navegador</b> envíe una petición a otro sitio donde ya tienes la sesión abierta, <b>sin que te des cuenta</b>.</p>
           <p>El sitio recibe la petición con tu cookie de sesión válida y cree que fuiste tú.</p>`,
    galleta: "¡Hola! Soy Galleta 🍪, tu cookie de sesión. El problema es que me envían a todas partes… ¡aunque tú no lo pidas!"
  },
  {
    titulo: "Los 3 ingredientes",
    html: `<ol class="lista-num">
             <li><b>Sesión activa:</b> la víctima inició sesión y el navegador guarda su cookie.</li>
             <li><b>Acción sensible predecible:</b> cambiar clave, correo o transferir, con parámetros que el atacante puede adivinar.</li>
             <li><b>El servidor no verifica la intención:</b> solo revisa la cookie, no si el usuario de verdad quiso hacerlo.</li>
           </ol>
           <p>Si falta uno, el ataque no funciona.</p>`,
    galleta: "El atacante NO necesita tu contraseña ni robarme. Solo necesita que yo viaje con la petición."
  },
  {
    titulo: "Así se ve un ataque",
    html: `<p>El atacante pone esto en su página (por ejemplo, una que promete un iPhone gratis):</p>
<pre class="code">&lt;form action="https://bancodemo.test/cambiar-correo"
      method="POST"&gt;
  &lt;input type="hidden" name="correo"
         value="atacante@correo.test"&gt;
&lt;/form&gt;
&lt;script&gt;document.forms[0].submit()&lt;/script&gt;</pre>
           <p>Al abrir la página, el formulario se envía solo. El navegador adjunta la cookie del banco.</p>`,
    galleta: "Todo pasa en menos de un segundo. La víctima solo ve la página del 'premio'."
  },
  {
    titulo: "¿Qué puede lograr?",
    html: `<div class="mini-grid">
             <div class="mini"><span>🔑</span><b>Tomar la cuenta</b>Cambiar la clave o el correo y dejar al dueño por fuera.</div>
             <div class="mini"><span>💸</span><b>Mover dinero</b>Transferencias o pagos que nadie autorizó.</div>
             <div class="mini"><span>👑</span><b>Abusar de un admin</b>Si la víctima es administradora, el atacante actúa con sus permisos.</div>
           </div>
           <p>Está dentro de <b>OWASP Top 10 A01:2021 Broken Access Control</b> y se clasifica como <b>CWE-352</b>.</p>`,
    galleta: "Con permisos de administrador, un solo clic puede comprometer toda la aplicación."
  },
  {
    titulo: "Casos reales",
    html: `<div class="casos">
             <div class="caso"><b>Gmail · 2007</b>Un CSRF permitía crear filtros en la cuenta de la víctima para reenviar sus correos a otra dirección. Google lo corrigió en menos de 24 horas.</div>
             <div class="caso"><b>ING Direct · 2008</b>Investigadores de Princeton (Zeller y Felten) encontraron un CSRF que permitía abrir cuentas a nombre de la víctima y transferir su dinero. Fue uno de los primeros CSRF conocidos que movía fondos de un banco.</div>
             <div class="caso"><b>YouTube · 2008</b>El mismo estudio halló que se podían añadir videos a favoritos o enviar mensajes en nombre del usuario.</div>
             <div class="caso"><b>uTorrent WebUI · 2008</b>(CVE-2008-6586) Una página externa podía forzar descargas de torrents y cambiar las credenciales del panel web.</div>
           </div>`,
    galleta: "Todos se corrigieron, pero muestran que hasta los sitios grandes caen si no se protegen."
  },
  {
    titulo: "Cómo se previene",
    html: `<div class="defs">
             <div class="def ok"><b>✅ Token anti-CSRF</b>Un código secreto e impredecible en cada formulario. El atacante no puede adivinarlo. Es la defensa base.</div>
             <div class="def ok"><b>✅ Cookie SameSite</b>Con <code>Strict</code> (o <code>Lax</code>) el navegador no envía la cookie en peticiones POST que vienen de otros sitios.</div>
             <div class="def ok"><b>✅ Re-autenticación</b>Pedir la contraseña actual (o un código) antes de acciones críticas.</div>
             <div class="def ok"><b>✅ Nunca cambiar datos con GET</b>Un simple &lt;img&gt; puede disparar una petición GET.</div>
             <div class="def no"><b>❌ No sirven solas:</b> HTTPS, cookies HttpOnly, contraseñas largas ni antivirus. El navegador igual adjunta la cookie.</div>
           </div>`,
    galleta: "Mejor en capas: token como base, y SameSite y re-autenticación como refuerzo. ¡A jugar!"
  }
];

/* ---------- NIVEL 1: ¿AMENAZA O NO? ---------- */
const AMENAZAS = [
  { txt: "Juan tiene abierta la sesión de su banco. Abre una página de \"premios\" que, en segundo plano, envía un formulario al banco para transferir dinero.",
    csrf: true, exp: "Es CSRF: la página usa la sesión abierta de Juan para enviar una petición al banco sin que él lo sepa." },
  { txt: "Llega un correo que imita al banco y pide escribir usuario y contraseña en una página falsa.",
    csrf: false, exp: "Es phishing: busca robar la contraseña. En CSRF el atacante nunca necesita la contraseña." },
  { txt: "Un foro muestra una 'imagen' cuyo src es http://192.168.0.1/admin/cambiar-dns?dns=6.6.6.6. El administrador del router tiene la sesión abierta y visita el foro.",
    csrf: true, exp: "Es CSRF: el navegador pide esa URL al router con la sesión del administrador. Por eso nunca se deben cambiar datos con GET." },
  { txt: "Un comentario en un blog contiene un <script> que se ejecuta dentro del mismo blog y lee datos de los visitantes.",
    csrf: false, exp: "Es XSS (Cross-Site Scripting): el código malicioso se ejecuta DENTRO del sitio vulnerable. En CSRF la petición sale desde OTRO sitio." },
  { txt: "Un programa prueba miles de contraseñas por minuto en la página de inicio de sesión.",
    csrf: false, exp: "Es un ataque de fuerza bruta contra el login. No usa la sesión de nadie." },
  { txt: "Con la sesión de su red social abierta, Ana visita una web que publica un mensaje en su perfil sin que ella haga nada.",
    csrf: true, exp: "Es CSRF: la web maliciosa hace que el navegador de Ana publique en su nombre usando su cookie." },
  { txt: "En el buscador de una tienda, el atacante escribe ' OR 1=1 -- y obtiene toda la tabla de clientes.",
    csrf: false, exp: "Es inyección SQL: se manipula la consulta a la base de datos. No tiene que ver con la sesión de una víctima." },
  { txt: "Mientras tienes tu correo abierto, una página crea a escondidas un filtro que reenvía todos tus correos al atacante.",
    csrf: true, exp: "Es CSRF, igual que el caso real de Gmail en 2007: la acción 'crear filtro' se ejecutó con la sesión de la víctima." }
];

/* ---------- NIVEL 2: MENTE DEL ATACANTE ---------- */
const ATACANTE = [
  { pregunta: "¿Qué necesita la víctima para que el ataque funcione?",
    opciones: [
      { t: "Tener la sesión abierta en el banco", ok: true, exp: "¡Exacto! Sin sesión activa no hay cookie que el navegador pueda adjuntar." },
      { t: "Darte su contraseña", ok: false, exp: "No. Si tuvieras la contraseña no necesitarías CSRF. Este ataque funciona SIN conocerla." },
      { t: "Instalar un programa del atacante", ok: false, exp: "No. CSRF solo necesita que la víctima visite una página web. No se instala nada." }
    ]},
  { pregunta: "¿Qué acción del banco eliges como objetivo?",
    opciones: [
      { t: "Cambiar el correo de la cuenta (solo pide el nuevo correo)", ok: true, exp: "¡Bien! Todos sus parámetros son predecibles y no pide nada secreto. Con tu correo puesto, luego usas 'olvidé mi contraseña'." },
      { t: "Cambiar la clave, que pide la contraseña actual", ok: false, exp: "Falla: es re-autenticación. Tú no conoces la contraseña actual, así que el banco rechaza la petición." },
      { t: "Transferir, que exige un token secreto en el formulario", ok: false, exp: "Falla: es un token anti-CSRF. No puedes adivinarlo ni leerlo desde otro sitio." }
    ]},
  { pregunta: "¿Cómo haces que la petición salga del navegador de la víctima?",
    opciones: [
      { t: "Un formulario oculto que se envía solo al abrir mi página", ok: true, exp: "¡Correcto! Es la técnica clásica: el navegador envía el POST y adjunta la cookie del banco." },
      { t: "Leer la cookie del banco con JavaScript desde mi página", ok: false, exp: "Imposible: la política del mismo origen impide que tu página lea cookies de otro dominio. Y en CSRF no hace falta leerla." },
      { t: "Pedirle a la víctima que me copie su cookie", ok: false, exp: "Eso sería ingeniería social y robo de sesión, no CSRF. En CSRF la víctima no hace nada consciente." }
    ]},
  { pregunta: "¿Por qué el banco acepta la petición?",
    opciones: [
      { t: "Llega con la cookie válida y el banco no verifica la intención", ok: true, exp: "¡Esa es la raíz del problema! Una cookie válida no prueba que el usuario quiso hacer la acción." },
      { t: "Porque el atacante descifró la cookie", ok: false, exp: "No. El atacante nunca ve la cookie: el navegador la envía por él." },
      { t: "Porque el banco no usa HTTPS", ok: false, exp: "No. Con HTTPS pasa igual: el cifrado protege el viaje, pero el navegador sigue adjuntando la cookie." }
    ]}
];

/* ---------- NIVEL 3: ERES EL SERVIDOR ---------- */
// El token válido de la sesión se genera al azar al iniciar el nivel.
// "token" puede ser: "ok" (correcto), "mal" (incorrecto), null (no viene).
const PETICIONES = [
  { metodo: "POST", ruta: "/cambiar-clave", origen: "https://bancodemo.test", cookie: true, token: "ok",
    aceptar: true, exp: "Viene del propio banco, con sesión y con el token correcto. Es legítima." },
  { metodo: "POST", ruta: "/transferir", origen: "https://premiosgratis.test", cookie: true, token: null,
    aceptar: false, exp: "Viene de otro sitio y no trae token. Es el ataque CSRF típico." },
  { metodo: "GET", ruta: "/saldo", origen: "https://bancodemo.test", cookie: true, token: null,
    aceptar: true, exp: "GET de solo lectura desde el banco: no cambia nada, así que no necesita token." },
  { metodo: "POST", ruta: "/cambiar-correo", origen: "https://premiosgratis.test", cookie: true, token: "mal",
    aceptar: false, exp: "El atacante intentó adivinar el token y falló. Token incorrecto = bloquear." },
  { metodo: "GET", ruta: "/transferir?para=hacker&monto=2000000", origen: "(ninguno: lo pidió una etiqueta <img>)", cookie: true, token: null,
    aceptar: false, exp: "¡Un GET que mueve dinero! Una simple imagen puede dispararlo. Las acciones que cambian datos nunca deben usar GET." },
  { metodo: "POST", ruta: "/transferir", origen: "https://bancodemo.test", cookie: true, token: "ok",
    aceptar: true, exp: "Origen correcto, sesión activa y token válido. Adelante." },
  { metodo: "POST", ruta: "/cambiar-clave", origen: "https://bancodemo.test", cookie: false, token: "ok",
    aceptar: false, exp: "No trae cookie de sesión: no sabemos quién es. Sin sesión no se cambia nada." },
  { metodo: "POST", ruta: "/pagar", origen: "https://bancodemo.test.premiosgratis.test", cookie: true, token: null,
    aceptar: false, exp: "¡Trampa! El dominio empieza como el banco, pero termina en premiosgratis.test. Y además no trae token." },
  { metodo: "POST", ruta: "/cerrar-sesion", origen: "https://premiosgratis.test", cookie: true, token: null,
    aceptar: false, exp: "Aunque parezca inofensiva, es una acción iniciada por otro sitio sin token. Se bloquea." },
  { metodo: "POST", ruta: "/cambiar-correo", origen: "https://bancodemo.test", cookie: true, token: "ok",
    aceptar: true, exp: "Todo en orden: el usuario lo pidió desde el formulario del banco." }
];

/* ---------- NIVEL 4: REVISIÓN DE CÓDIGO ---------- */
const CODIGOS = [
  { titulo: "Formulario de transferencia",
    code: `<form action="/transferir" method="POST">
  <input name="destino">
  <input name="monto">
  <button>Enviar</button>
</form>

// Servidor
if (req.session.usuario) {
  transferir(req.body.destino, req.body.monto);
}`,
    vulnerable: true, exp: "Vulnerable: el servidor solo revisa que haya sesión. No hay token ni nada que pruebe la intención del usuario." },
  { titulo: "Formulario con token",
    code: `<form action="/transferir" method="POST">
  <input type="hidden" name="csrf"
         value="<%= session.csrfToken %>">
  ...
</form>

// Servidor
if (req.body.csrf !== req.session.csrfToken) {
  return res.status(403).send("Token inválido");
}`,
    vulnerable: false, exp: "Seguro: el token es secreto, distinto por sesión, y si falta o no coincide se rechaza la petición." },
  { titulo: "Ruta para borrar la cuenta",
    code: `app.get("/borrar-cuenta", (req, res) => {
  if (req.session.usuario) {
    borrarCuenta(req.session.usuario);
  }
});`,
    vulnerable: true, exp: "Vulnerable: usa GET para una acción destructiva. Un <img src=\"/borrar-cuenta\"> en cualquier página basta." },
  { titulo: "Validación del token",
    code: `// Rechaza si el token viene y no coincide
if (req.body.csrf &&
    req.body.csrf !== req.session.csrfToken) {
  return res.status(403).end();
}
cambiarClave(req.body.nueva);`,
    vulnerable: true, exp: "Vulnerable: solo valida el token SI viene. El atacante simplemente no lo envía y la petición pasa. Debe rechazarse también cuando falta." },
  { titulo: "Cookie de sesión",
    code: `Set-Cookie: session_id=a8F3kL...;
            Secure; HttpOnly`,
    vulnerable: true, exp: "Vulnerable: HttpOnly evita que JavaScript LEA la cookie, pero no evita que el navegador la ENVÍE desde otros sitios. Falta SameSite y un token." },
  { titulo: "Cookie con SameSite",
    code: `Set-Cookie: session_id=a8F3kL...;
            Secure; HttpOnly;
            SameSite=Strict`,
    vulnerable: false, exp: "Mitigado: con SameSite=Strict el navegador no envía la cookie en peticiones que vienen de otros sitios. Ideal combinarlo con token." },
  { titulo: "Revisar el Referer",
    code: `const ref = req.headers.referer || "";
if (!ref.includes("bancodemo.test")) {
  return res.status(403).end();
}
cambiarCorreo(req.body.correo);`,
    vulnerable: true, exp: "Vulnerable: \"includes\" acepta https://bancodemo.test.atacante.test o https://atacante.test/?bancodemo.test. Hay que comparar el origen exacto, y mejor usar token." },
  { titulo: "Token para todos",
    code: `// Mismo token para todos los usuarios
const CSRF_TOKEN = "CSRF_12345";

if (req.body.csrf !== CSRF_TOKEN) {
  return res.status(403).end();
}`,
    vulnerable: true, exp: "Vulnerable: el token es fijo y público. El atacante lo ve en su propia cuenta y lo copia. Debe ser aleatorio y por sesión." },
  { titulo: "Cambio de clave",
    code: `if (req.body.csrf !== req.session.csrfToken) {
  return res.status(403).end();
}
const ok = await bcrypt.compare(
  req.body.claveActual, usuario.hash);
if (!ok) return res.status(401).end();
cambiarClave(req.body.claveNueva);`,
    vulnerable: false, exp: "Seguro: defensa en capas. Token anti-CSRF y además re-autenticación con la clave actual." }
];

/* ---------- NIVEL 5: TRIVIA ---------- */
const TRIVIA = [
  { p: "¿Qué significa la sigla CSRF?",
    o: ["Cross-Site Request Forgery", "Cookie Session Remote Function", "Client Side Request Filter", "Cross-Server Response Fault"], c: 0,
    exp: "Cross-Site Request Forgery: falsificación de solicitudes entre sitios." },
  { p: "¿Con qué identificador de MITRE se clasifica CSRF?",
    o: ["CWE-79", "CWE-89", "CWE-352", "CWE-200"], c: 2,
    exp: "CWE-352. (CWE-79 es XSS y CWE-89 es inyección SQL)." },
  { p: "En el OWASP Top 10 de 2021, CSRF está dentro de…",
    o: ["A03 Injection", "A01 Broken Access Control", "A07 Identification Failures", "A02 Cryptographic Failures"], c: 1,
    exp: "A01:2021 Broken Access Control, la categoría número uno." },
  { p: "En 2008, investigadores de Princeton hallaron un CSRF que permitía transferir dinero en este banco:",
    o: ["Bancolombia", "ING Direct", "Bank of America", "Santander"], c: 1,
    exp: "ING Direct. Zeller y Felten lo reportaron y el banco lo corrigió." },
  { p: "En 2007, un CSRF en Gmail permitía al atacante…",
    o: ["Leer la contraseña", "Crear filtros que reenviaban los correos", "Borrar la cuenta", "Desactivar el antivirus"], c: 1,
    exp: "Crear filtros que reenviaban correos a otra dirección. Google lo corrigió en menos de 24 horas." },
  { p: "¿Por qué una cookie HttpOnly NO detiene un ataque CSRF?",
    o: ["Porque se puede descifrar", "Porque el atacante no necesita leerla: el navegador la envía", "Porque solo funciona con HTTP", "Porque expira muy rápido"], c: 1,
    exp: "HttpOnly impide que JavaScript lea la cookie, pero el navegador la sigue adjuntando automáticamente." },
  { p: "Con SameSite=Lax (lo que Chrome aplica por defecto desde 2020), ¿qué petición desde otro sitio SÍ lleva la cookie?",
    o: ["Un formulario POST oculto", "Una petición fetch() en segundo plano", "Hacer clic en un enlace normal (GET)", "Ninguna, nunca"], c: 2,
    exp: "Lax permite la cookie en navegaciones GET de nivel superior, como un clic en un enlace. Por eso las acciones que cambian datos no deben ser GET." },
  { p: "¿Cuál es la defensa base recomendada por OWASP contra CSRF?",
    o: ["Usar HTTPS", "Contraseñas de 16 caracteres", "Token anti-CSRF impredecible", "Un CAPTCHA en el login"], c: 2,
    exp: "El token anti-CSRF (synchronizer token). SameSite y re-autenticación son buenos refuerzos." },
  { p: "En Colombia, ¿qué artículo de la Ley 1273 de 2009 tipifica la transferencia no consentida de activos?",
    o: ["Art. 269A", "Art. 269F", "Art. 269J", "Art. 269I"], c: 2,
    exp: "El 269J. El 269A es acceso abusivo a un sistema informático." },
  { p: "¿Qué tiene que hacer la víctima para caer en un CSRF?",
    o: ["Escribir su clave en una página falsa", "Solo visitar la página maliciosa con la sesión abierta", "Descargar un archivo", "Desactivar el firewall"], c: 1,
    exp: "Basta con visitar la página maliciosa mientras la sesión está activa. No tiene que escribir ni descargar nada." }
];

const RANGOS = [
  { min: 0,    nombre: "Recluta",            desc: "Vas empezando. ¡Repite los niveles para subir de rango!" },
  { min: 2000, nombre: "Analista de seguridad", desc: "Reconoces el ataque y sus defensas principales." },
  { min: 4000, nombre: "Cazador de CSRF",    desc: "Detectas peticiones falsas y código vulnerable con facilidad." },
  { min: 5500, nombre: "Guardián del banco", desc: "¡Nivel experto! Nadie falsifica una petición frente a ti." }
];
