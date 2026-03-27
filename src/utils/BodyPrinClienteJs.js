import { ruta } from "../utils/ruta.js";
import { alertaFallo } from "../assets/Alertas/Alertas.js";
import { validarInicioCliente } from "./validarInicio.js";
import { animacionPrinCliente } from "../assets/Animaciones/animacionPrinCliente.js";

validarInicioCliente();
animacionPrinCliente();
// Variables de estado
let paginaActual = 1;
const serviciosPorPagina = 6;
let todosLosServicios = [];
let serviciosFiltrados = [];
let categoriaActual = "todas";
let busquedaActual = "";

// Elementos del DOM
const contenedor = document.getElementById("contenedor-servicios");
const loader = document.getElementById("loader-servicios");
const btnAnterior = document.getElementById("btn-anterior");
const btnSiguiente = document.getElementById("btn-siguiente");
const infoPaginacion = document.getElementById("info-paginacion");
const inputBusqueda = document.getElementById("input-busqueda");
const btnTodas = document.getElementById("btn-todas-categorias");
const btnManicure = document.getElementById("btn-manicure");
const btnBarberia = document.getElementById("btn-barberia");


function filtrarServicios() {
  const query = busquedaActual.toLowerCase().trim();

  serviciosFiltrados = todosLosServicios.filter(servicio => {
    const nombreNegocio = (servicio.nombre_establecimiento || "").toLowerCase();
    const nombreServicio = (servicio.Servicio || "").toLowerCase();
    const descripcionNegocio = (servicio.descripcion || "").toLowerCase();

    // Filtro por búsqueda (nombre de negocio, nombre de servicio o descripción)
    const coincideBusqueda = query === "" ||
      nombreNegocio.includes(query) ||
      nombreServicio.includes(query) ||
      descripcionNegocio.includes(query);

    // Filtro por categoría
    let coincideCategoria = true;
    if (categoriaActual !== "todas") {
      if (categoriaActual === "estilista") {
        // La categoría "estilista" abarca manicure, pedicure, maquillaje, etc.
        coincideCategoria = nombreServicio.includes("estilista");
      } else if (categoriaActual === "barbero") {
        // La categoría "barbero" abarca barberia, corte de cabello, etc.
        coincideCategoria = nombreServicio.includes("barbero");
      }
    }

    return coincideBusqueda && coincideCategoria;
  });

  paginaActual = 1; // Reiniciar a la primera página tras filtrar
  renderizarServicios();
}

// Función principal para renderizar servicios
function renderizarServicios() {
  if (!contenedor) return;

  contenedor.innerHTML = "";

  const inicio = (paginaActual - 1) * serviciosPorPagina;
  const fin = inicio + serviciosPorPagina;
  const serviciosPagina = serviciosFiltrados.slice(inicio, fin);

  console.log(serviciosPagina);


  if (serviciosPagina.length === 0) {
    contenedor.innerHTML = `<p class="col-span-full text-center text-gray-500">No hay servicios disponibles.</p>`;
    actualizarControles();
    return;
  }

  serviciosPagina.forEach((servicio, index) => {
    const servicioNombre = (servicio.Servicio || "").toLowerCase();
    const textoCompleto = `${servicioNombre}`;


    const tarjeta = document.createElement("div");
    tarjeta.className = "group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn";

    tarjeta.innerHTML = `
     <div
        class="shadow- w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-xl-soft overflow-hidden border-[8px] border-white"
      >
        <div class="relative h-48 w-full bg-slate-200">
          <img
            alt="Business Banner"
            class="size-full object-cover"
            id="banner-preview"
            src="${servicio.banner}"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
          >
          </div>
          <div
            class="absolute -bottom-10 left-6 size-24 rounded-2xl border-4 border-white bg-white shadow-xl overflow-hidden"
          >
            <img
              alt="Business Logo"
              id="logo-preview"
              class="size-full object-cover"
              src="${servicio.logo}"
            />
          </div>
        </div>
        <div class="px-6 pt-14 pb-8">
          <div class="flex flex-col gap-2">
            <h3
              id="shop-name-preview"
              class="text-2xl font-black text-slate-900 tracking-tight leading-tight"
            >
              ${servicio.nombre_establecimiento}
            </h3>
            <div class="flex flex-wrap items-center gap-3">
              <div
                class="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full"
              >
                <span
                  class="material-symbols-outlined text-amber-500 text-sm fill-1"
                  >star</span
                >
                <span class="text-xs font-bold text-amber-700">${servicio.media_calificacion}</span>
                <span class="text-[10px] text-amber-600 font-medium"
                  >(${servicio.total_calificaciones} reseñas)</span
                >
              </div>
          <!--    <span
                class="text-xs font-bold text-green-600 flex items-center gap-1"
              >
                <span class="size-1.5 rounded-full bg-green-500"></span>
                Abierto ahora
              </span>-->
            </div>
          </div>
          <div class="mt-6 space-y-5">
            <p
              id="description-preview"
              class="text-sm text-slate-600 leading-relaxed line-clamp-3"
            >
              ${servicio.descripcion}
            </p>
            <div
              class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <span class="material-symbols-outlined text-primary text-xl"
                >location_on</span
              >
              <div class="flex flex-col">
                <span
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-wide"
                  >Ubicación</span
                >
                <span
                  id="location-preview"
                  class="text-xs font-medium text-slate-700"
                  >${servicio.direccion}</span
                >
              </div>
            </div>
            <div
              class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <span class="material-symbols-outlined text-primary text-xl"
                >call</span
              >
              <div class="flex flex-col">
                <span
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-wide"
                  >Teléfono</span
                >
                <span
                  id="phone-preview"
                  class="text-xs font-medium text-slate-700"
                  >${servicio.telefono_establecimiento}</span
                >
              </div>
            </div>
          </div>
          
          <div class="mt-8 grid grid-cols-2 gap-3">
            <button
            id="btn-reservar-${servicio.id}"
              class="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white transition-all active:scale-95"
            >
              <span class="material-symbols-outlined text-lg"
                >calendar_month</span
              >
              Reservar
            </button>
            <button
            id="btn-servicios-${servicio.id}"
              class="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 transition-all active:scale-95"
            >
              <span class="material-symbols-outlined text-lg">info</span>
              Servicios
            </button>
          </div>
        </div>
    `;

    contenedor.appendChild(tarjeta);

    // Event listener para reservar
    const btnReservar = document.getElementById(`btn-reservar-${servicio.id}`);
    if (btnReservar) {
      btnReservar.addEventListener("click", () => {
        sessionStorage.removeItem("editCitaId");
        window.location.href = `/Agendar/${servicio.id}`;
      });
    }
    // Event listener para servicios
    const btnServicios = document.getElementById(`btn-servicios-${servicio.id}`);
    if (btnServicios) {
      btnServicios.addEventListener("click", () => {

        sessionStorage.removeItem("editCitaId");
        window.location.href = `/Catalogo/${servicio.id}`;
      });
    }
  });




  actualizarControles();
}

function actualizarControles() {
  const totalPaginas = Math.ceil(serviciosFiltrados.length / serviciosPorPagina);

  if (infoPaginacion) {
    if (serviciosFiltrados.length === 0) {
      infoPaginacion.textContent = "0 paginas";
    } else {
      infoPaginacion.textContent = `Pagina ${paginaActual} de ${totalPaginas}`;
    }
  }

  if (btnAnterior) {
    btnAnterior.disabled = paginaActual === 1;
  }
  if (btnSiguiente) {
    btnSiguiente.disabled = paginaActual >= totalPaginas || totalPaginas === 0;
  }
}

// Logic para cambiar pagina
if (btnAnterior) {
  btnAnterior.addEventListener("click", () => {
    if (paginaActual > 1) {
      paginaActual--;
      renderizarServicios();
      // Scroll al top del contenedor para mejor UX
      contenedor.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

if (btnSiguiente) {
  btnSiguiente.addEventListener("click", () => {
    const totalPaginas = Math.ceil(serviciosFiltrados.length / serviciosPorPagina);
    if (paginaActual < totalPaginas) {
      paginaActual++;
      renderizarServicios();
      contenedor.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// Event Listeners para Filtros
if (inputBusqueda) {
  inputBusqueda.addEventListener("input", (e) => {
    busquedaActual = e.target.value;
    filtrarServicios();
  });
}

function actualizarClasesBotones(categoriaElegida) {
  const botones = [
    { id: "btn-todas-categorias", cat: "todas" },
    { id: "btn-manicure", cat: "estilista" },
    { id: "btn-barberia", cat: "barbero" }
  ];

  botones.forEach(btn => {
    const el = document.getElementById(btn.id);
    if (!el) return;

    if (btn.cat === categoriaElegida) {
      el.classList.remove("text-gray-600", "hover:bg-gray-100");
      el.classList.add("text-primary", "bg-primary/10", "hover:bg-primary/20");
    } else {
      el.classList.add("text-gray-600", "hover:bg-gray-100");
      el.classList.remove("text-primary", "bg-primary/10", "hover:bg-primary/20", "bg-transparent");
      // Asegurarse de que no tenga el fondo de activo
      el.style.backgroundColor = "";
    }
  });
}

if (btnTodas) {
  btnTodas.addEventListener("click", () => {
    categoriaActual = "todas";
    actualizarClasesBotones("todas");
    filtrarServicios();
  });
}

if (btnManicure) {
  btnManicure.addEventListener("click", () => {
    categoriaActual = "estilista";
    actualizarClasesBotones("estilista");
    filtrarServicios();
  });
}

if (btnBarberia) {
  btnBarberia.addEventListener("click", () => {
    categoriaActual = "barbero";
    actualizarClasesBotones("barbero");
    filtrarServicios();
  });
}


// Fetch inicial
fetch(`${ruta}/serviciosDisponibles`, { credentials: 'include' })
  .then((response) => response.json())
  .then((data) => {


    if (loader) loader.style.display = "none";

    if (!data.success) {
      console.error("Error en respuesta:", data.message);
      alertaFallo("No se pudieron cargar los servicios");
      return;
    }



    todosLosServicios = data.data;
    serviciosFiltrados = [...todosLosServicios];
    renderizarServicios();
  })
  .catch((error) => {
    if (loader) loader.style.display = "none";
    console.error("Error al obtener datos:", error);
    alertaFallo("Error de conexión");
  });
