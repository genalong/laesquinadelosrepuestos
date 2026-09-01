const header = document.querySelector(".header");
const intro = document.querySelector(".intro-logo");
const logoIntro = document.querySelector(".intro-logo-img");
const indicadorIntro = document.querySelector(".intro-indicador");
const menuToggle = document.querySelector(".menu-toggle");
const menuPrincipal = document.querySelector(".nav-links");
const categorias = document.querySelectorAll(".categoria");
const botonCotizar = document.querySelector("#botonCotizar");
const consultaTexto = document.querySelector("#consultaTexto");
const vehiculo = document.querySelector("#vehiculo");
const mensajeFormulario = document.querySelector("#mensajeFormulario");
const seleccionResumen = document.querySelector("#seleccionResumen");
const resumenSeleccion = document.querySelector("#resumenSeleccion");
const anioActual = document.querySelector("#anioActual");

/* Intro + header */
let actualizacionPendiente = false;
let usuarioDesplazo = window.scrollY > 0;

function actualizarIntroYHeader() {
  const scroll = Math.max(window.scrollY, 0);
  const altoIntro = intro ? intro.offsetHeight : window.innerHeight;
  const progreso = Math.min(scroll / Math.max(altoIntro * 0.72, 1), 1);
  const menuAbierto = menuPrincipal?.classList.contains("abierto") ?? false;

  if (header) {
    const umbralHeader = Math.min(220, altoIntro * 0.23);
    header.classList.toggle("visible", scroll > umbralHeader || menuAbierto);
  }

  if (logoIntro && (usuarioDesplazo || scroll > 0)) {
    const movimiento = scroll * 0.28;
    const escala = Math.max(1 - progreso * 0.16, 0.84);
    const opacidad = Math.max(1 - progreso * 1.25, 0);

    logoIntro.style.transform = `translate3d(0, -${movimiento}px, 0) scale(${escala})`;
    logoIntro.style.opacity = String(opacidad);
  }

  if (indicadorIntro) {
    indicadorIntro.style.opacity = String(Math.max(1 - progreso * 3, 0));
  }

  actualizacionPendiente = false;
}

function solicitarActualizacion() {
  if (actualizacionPendiente) return;

  actualizacionPendiente = true;
  window.requestAnimationFrame(actualizarIntroYHeader);
}

window.addEventListener(
  "scroll",
  () => {
    usuarioDesplazo = true;
    solicitarActualizacion();
  },
  { passive: true },
);

window.addEventListener("resize", solicitarActualizacion);

if (window.scrollY > 0) {
  solicitarActualizacion();
}

/* Menú móvil */
function cerrarMenu({ devolverFoco = false } = {}) {
  if (!menuToggle || !menuPrincipal) return;

  menuPrincipal.classList.remove("abierto");
  menuToggle.classList.remove("activo");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menú");
  document.body.classList.remove("menu-abierto");

  if (devolverFoco) menuToggle.focus();
  solicitarActualizacion();
}

if (menuToggle && menuPrincipal) {
  menuToggle.addEventListener("click", () => {
    const estaAbierto = menuPrincipal.classList.toggle("abierto");

    menuToggle.classList.toggle("activo", estaAbierto);
    menuToggle.setAttribute("aria-expanded", String(estaAbierto));
    menuToggle.setAttribute("aria-label", estaAbierto ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("menu-abierto", estaAbierto);
    solicitarActualizacion();
  });

  menuPrincipal.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => cerrarMenu());
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && menuPrincipal.classList.contains("abierto")) {
      cerrarMenu({ devolverFoco: true });
    }
  });

  document.addEventListener("click", (evento) => {
    if (
      menuPrincipal.classList.contains("abierto") &&
      !header?.contains(evento.target)
    ) {
      cerrarMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860 && menuPrincipal.classList.contains("abierto")) {
      cerrarMenu();
    }
  });
}

/* Categorías */
const categoriasSeleccionadas = [];

function actualizarResumenCategorias() {
  const cantidad = categoriasSeleccionadas.length;

  if (seleccionResumen) {
    if (cantidad === 0) {
      seleccionResumen.textContent = "Ninguna categoría seleccionada.";
    } else if (cantidad === 1) {
      seleccionResumen.textContent = `1 categoría seleccionada: ${categoriasSeleccionadas[0]}.`;
    } else {
      seleccionResumen.textContent = `${cantidad} categorías seleccionadas.`;
    }
  }

  if (resumenSeleccion) {
    resumenSeleccion.textContent =
      cantidad === 0
        ? "Todavía no elegiste categorías."
        : categoriasSeleccionadas.join(" · ");
  }
}

categorias.forEach((categoria) => {
  categoria.addEventListener("click", () => {
    const nombreCategoria = categoria.dataset.categoria;
    if (!nombreCategoria) return;

    const posicion = categoriasSeleccionadas.indexOf(nombreCategoria);
    const estabaSeleccionada = posicion !== -1;

    if (estabaSeleccionada) {
      categoriasSeleccionadas.splice(posicion, 1);
    } else {
      categoriasSeleccionadas.push(nombreCategoria);
    }

    const estaSeleccionada = !estabaSeleccionada;
    categoria.classList.toggle("seleccionada", estaSeleccionada);
    categoria.setAttribute("aria-pressed", String(estaSeleccionada));

    const estado = categoria.querySelector(".categoria-estado");
    if (estado) estado.textContent = estaSeleccionada ? "Incluido" : "Seleccionar";

    if (mensajeFormulario) mensajeFormulario.textContent = "";
    if (consultaTexto) consultaTexto.removeAttribute("aria-invalid");

    actualizarResumenCategorias();
  });
});

/* Consulta por WhatsApp */
function enviarConsulta(evento) {
  evento?.preventDefault();

  if (!consultaTexto || !vehiculo) return;

  const consulta = consultaTexto.value.trim();
  const nombreVehiculo = vehiculo.value.trim();

  if (categoriasSeleccionadas.length === 0 && consulta === "") {
    if (mensajeFormulario) {
      mensajeFormulario.textContent = "Seleccioná una categoría o escribí qué estás buscando.";
    }

    consultaTexto.setAttribute("aria-invalid", "true");
    consultaTexto.focus();
    return;
  }

  consultaTexto.removeAttribute("aria-invalid");
  if (mensajeFormulario) mensajeFormulario.textContent = "";

  const partes = ["Hola, quisiera consultar en La Esquina de los Repuestos."];

  if (categoriasSeleccionadas.length > 0) {
    const lista = categoriasSeleccionadas.map((categoria) => `• ${categoria}`).join("\n");
    partes.push(`Estoy buscando:\n${lista}`);
  }

  if (consulta !== "") {
    partes.push(`Consulta:\n${consulta}`);
  }

  if (nombreVehiculo !== "") {
    partes.push(`Vehículo:\n${nombreVehiculo}`);
  }

  const mensaje = partes.join("\n\n");
  const urlWhatsapp = `https://wa.me/59898288662?text=${encodeURIComponent(mensaje)}`;
  const nuevaVentana = window.open(urlWhatsapp, "_blank");

  if (nuevaVentana) nuevaVentana.opener = null;
}

const formularioConsulta = botonCotizar?.closest("form");

if (formularioConsulta) {
  formularioConsulta.addEventListener("submit", enviarConsulta);
} else if (botonCotizar) {
  botonCotizar.addEventListener("click", enviarConsulta);
}

consultaTexto?.addEventListener("input", () => {
  consultaTexto.removeAttribute("aria-invalid");
  if (mensajeFormulario) mensajeFormulario.textContent = "";
});

/* Ajustes de movimiento y pie */
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelector(".hero-video")?.pause();
}

if (anioActual) {
  anioActual.textContent = String(new Date().getFullYear());
}
