# 🍪 Operación CSRF

**Juego interactivo educativo sobre Cross-Site Request Forgery (CSRF)**

Laboratorio de hacking ético · Universidad Libre

**Integrantes:** Sergio Martinez · Jhon Suarez

🔗 **Jugar en línea:** https://sergiomartinez30.github.io/operacion-csrf/

---

## ¿De qué se trata?

Una página falsa promete un iPhone gratis. Detrás, un formulario oculto intenta usar la sesión bancaria de la víctima. El jugador recorre seis etapas para entender cómo funciona el ataque, reconocer situaciones de riesgo y aprender a prevenirlo. Lo acompaña **Galleta 🍪**, la cookie de sesión, que da pistas durante el juego.

| Etapa | Tipo de reto | Qué se aprende |
|---|---|---|
| **Academia** | Lecciones interactivas | Qué es CSRF, sus 3 ingredientes, cómo se ve el código del ataque, impacto, casos reales y defensas |
| **1 · ¿Amenaza o no?** | Escenarios (sí / no) | Distinguir CSRF de phishing, XSS, fuerza bruta e inyección SQL |
| **2 · Mente del atacante** | Construcción del ataque paso a paso + simulación animada | Qué necesita el atacante, qué acciones son vulnerables y por qué el servidor acepta la petición |
| **3 · Eres el servidor** | Decisiones contrarreloj (aceptar / bloquear) | Validar el token anti-CSRF, el Origin, la sesión y el uso correcto de GET y POST |
| **4 · Revisión de código** | Auditoría de fragmentos de código | Errores reales: token opcional, token fijo, GET destructivo, cookie sin SameSite, validación débil del Referer |
| **5 · Trivia relámpago** | Preguntas con tiempo | Casos reales (Gmail 2007, ING Direct 2008, uTorrent 2008), OWASP, CWE-352 y Ley 1273 de 2009 |

**Mecánicas:** puntaje con bonus por racha y por rapidez, 3 vidas por etapa, de 1 a 3 estrellas según los aciertos, etapas que se desbloquean en orden, explicación después de cada respuesta, rango final (Recluta → Guardián del banco) y progreso guardado en el navegador.

## Contenido técnico cubierto

- **Definición y mecanismo:** el navegador adjunta automáticamente la cookie de sesión aunque la petición venga de otro sitio. El servidor no verifica la intención del usuario.
- **Condiciones del ataque:** sesión activa, acción sensible con parámetros predecibles y un servidor que solo revisa la cookie.
- **Riesgos:** toma de la cuenta (cambio de clave o correo), transferencias no autorizadas y abuso de cuentas de administrador.
- **Prevención:** token anti-CSRF (defensa base), cookies `SameSite=Strict/Lax`, re-autenticación en acciones críticas y no cambiar datos con GET. También se explica por qué **no bastan** HTTPS, `HttpOnly` ni las contraseñas largas.
- **Clasificación:** OWASP Top 10 A01:2021 Broken Access Control · MITRE CWE-352.
- **Marco legal en Colombia:** Ley 1273 de 2009 (arts. 269A y 269J).

## Tecnologías

- HTML5, CSS3 y JavaScript puro, **sin frameworks ni dependencias**.
- Gráficos vectoriales SVG hechos a mano: la mascota Galleta, el escudo y el favicon.
- Google Fonts (Krona One, Archivo, JetBrains Mono).
- `localStorage` para guardar el progreso. Si el navegador no lo permite, el juego funciona igual.
- Diseño *responsive*: celular, tableta y computador.

## Estructura del proyecto

```
csrf-juego/
├── index.html        Página principal
├── css/styles.css    Estilos (paleta negro + amarillo neón de la exposición)
├── js/datos.js       Todo el contenido educativo: lecciones, escenarios, peticiones, código y trivia
├── js/juego.js       Lógica del juego: pantallas, puntaje, vidas, temporizadores y guardado
├── assets/favicon.svg
└── README.md
```

El contenido está separado de la lógica: para corregir o agregar preguntas solo hay que editar `js/datos.js`.

## Cómo ejecutarlo

- **En línea:** abrir el enlace público.
- **En el computador:** descargar el proyecto y abrir `index.html` con doble clic. No necesita instalar nada.

## Uso de IA generativa

| Herramienta | Aporte al desarrollo |
|---|---|
| **Claude (Anthropic)** | **Diseño del juego:** propuesta de las seis etapas, las mecánicas (vidas, rachas, temporizador, estrellas, rangos) y la narrativa de "Operación CSRF". |
| | **Contenido:** redacción de las lecciones, los escenarios, las peticiones HTTP y los fragmentos de código vulnerable y seguro, con su explicación. Búsqueda y verificación de los casos reales en fuentes públicas. |
| | **Programación:** código HTML, CSS y JavaScript completo, incluido el diseño adaptable a celulares. |
| | **Recursos gráficos:** la mascota Galleta, el escudo de la portada y el favicon, todos en SVG. |
| | **Pruebas:** recorrido automático del juego completo en un navegador (en computador y en celular) para comprobar que no hubiera errores. |

**Papel del equipo:** definir el tema a partir de nuestra exposición y laboratorio de CSRF, revisar la precisión técnica del contenido contra las fuentes, ajustar textos y decisiones de diseño, y publicar el juego.

## Fuentes

- OWASP Top 10 (A01:2021) — https://owasp.org/Top10/
- OWASP CSRF Prevention Cheat Sheet — https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- MITRE CWE-352 — https://cwe.mitre.org/data/definitions/352.html
- PortSwigger Web Security Academy: CSRF — https://portswigger.net/web-security/csrf
- Zeller y Felten (2008), *Cross-Site Request Forgeries: Exploitation and Prevention*, Princeton University (casos ING Direct, YouTube, MetaFilter y New York Times)
- Google Security Blog (nov. 2008), sobre el fallo CSRF de Gmail reportado y corregido en septiembre de 2007
- NVD, CVE-2008-6586 (uTorrent WebUI)
- Ley 1273 de 2009 (Colombia) — http://www.secretariasenado.gov.co/senado/basedoc/ley_1273_2009.html

---

> ⚠️ Todos los sitios, cuentas y datos del juego son ficticios. Las técnicas descritas solo deben practicarse en sistemas propios o con autorización expresa.
