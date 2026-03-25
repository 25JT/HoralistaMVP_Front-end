import { io } from "socket.io-client";
import { ruta } from "../utils/ruta.js";
import { validarInicioCliente } from "../utils/validarInicio.js";
import { alertaCheck, alertaFallo, alertaMal, alertaConfirm } from "../assets/Alertas/Alertas.js";
import flatpickr from "flatpickr";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import "flatpickr/dist/flatpickr.min.css";

validarInicioCliente();
const userid = sessionStorage.getItem("Id");

// Variables de paginación
let paginaActual = 1;
const citasPorPagina = 5;
let totalCitas = 0;
let todasLasCitas = [];
let citasFiltradas = [];

// Variables de filtro
let filtroFechaInicio = null;
let filtroFechaFin = null;



// Inicializar Flatpickr y eventos
document.addEventListener("DOMContentLoaded", () => {
    const dateRangeInput = document.getElementById("date-range");
    if (dateRangeInput) {
        flatpickr(dateRangeInput, {
            mode: "range",
            dateFormat: "Y-m-d",
            locale: Spanish,
            minDate: "today",
            onClose: function (selectedDates, dateStr, instance) {
                if (selectedDates.length === 2) {
                    filtroFechaInicio = selectedDates[0];
                    filtroFechaFin = selectedDates[1];
                    // Ajustar fin del día para la fecha final
                    filtroFechaFin.setHours(23, 59, 59, 999);
                } else {
                    filtroFechaInicio = null;
                    filtroFechaFin = null;
                }
            }
        });
    }

    const btnAplicarFiltros = document.getElementById("btn-aplicar-filtros");
    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener("click", aplicarFiltros);
    }

    // Configurar event listeners para botones de paginación
    const btnAnterior = document.getElementById("btn-anterior");
    const btnSiguiente = document.getElementById("btn-siguiente");

    if (btnAnterior) {
        btnAnterior.addEventListener("click", () => cambiarPagina("anterior"));
    }

    if (btnSiguiente) {
        btnSiguiente.addEventListener("click", () => cambiarPagina("siguiente"));
    }
});

function aplicarFiltros() {
    const estadoFiltro = document.getElementById("status-filter").value;
    const busqueda = document.getElementById("search").value.toLowerCase().trim();

    citasFiltradas = todasLasCitas.filter(cita => {
        // Filtro por Fecha
        if (filtroFechaInicio && filtroFechaFin) {
            const fechaCita = new Date(cita.fecha);
            // Tratamos fecha como local, comparamos timestamps del día
            const fechaCitaTime = new Date(fechaCita.toDateString()).getTime();
            const inicioTime = new Date(filtroFechaInicio.toDateString()).getTime();
            const finTime = new Date(filtroFechaFin.toDateString()).getTime();

            if (fechaCitaTime < inicioTime || fechaCitaTime > finTime) {
                return false;
            }
        }

        // Filtro por Estado
        if (estadoFiltro !== "Todos") {
            if (cita.estado.toLowerCase() !== estadoFiltro.toLowerCase()) {
                return false;
            }
        }

        // Filtro por Búsqueda (Servicio o Establecimiento)
        if (busqueda) {
            const servicio = (cita.servicio || "").toLowerCase();
            const establecimiento = (cita.nombre_establecimiento || "").toLowerCase();
            if (!servicio.includes(busqueda) && !establecimiento.includes(busqueda)) {
                return false;
            }
        }

        return true;
    });

    paginaActual = 1;
    totalCitas = citasFiltradas.length;
    renderizarCitas();
}

// Función para formatear fecha
function formatearFecha(fecha) {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString("es-CO", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// Función para formatear hora
function formatearHora(hora) {
    if (!hora) return "N/A";
    return hora.substring(0, 5); // "15:00:00" -> "15:00"
}

// Función para obtener clase de estado
function obtenerClaseEstado(estado) {
    const estados = {
        confirmada: "bg-purple-100 text-purple-800",
        pendiente: "bg-yellow-100 text-yellow-800",
        cancelada: "bg-red-100 text-red-800",
        "en curso": "bg-blue-100 text-blue-800",
        completada: "bg-green-100 text-green-800",
    };
    return estados[estado.toLowerCase()] || "bg-gray-100 text-gray-800";
}

// Función para capitalizar primera letra
function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Función para mostrar modal con detalles de la cita
function mostrarDetallesCita(agenda) {
    const fechaFormateada = new Date(agenda.fecha).toLocaleDateString("es-CO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const modalHTML = `
<div id="modal-detalles" class="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
<div class="w-full max-w-2xl bg-white  rounded-xl shadow-lg flex flex-col">
<div class="p-6 border-b border-gray-200  flex justify-between items-center">
<h2 class="text-xl font-bold text-gray-900 ">Detalles de la Cita</h2>
</div>
<div class="p-6 flex-1 overflow-y-auto space-y-6">
<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
<div>
<p class="text-sm font-medium text-gray-500 ">Hora</p>
<p class="text-base font-semibold text-gray-800 ">${formatearHora(agenda.hora)}</p>
</div>
<div>
<p class="text-sm font-medium text-gray-500 ">Fecha </p>
<p class="text-base font-semibold text-gray-800 ">${fechaFormateada}</p>
</div>
<div>
<p class="text-sm font-medium text-gray-500 ">Establecimiento</p>
<p class="text-base font-semibold text-gray-800 ">${agenda.nombre_establecimiento || "N/A"}</p>
</div>
<div>
<p class="text-sm font-medium text-gray-500 ">Servicio</p>
<p class="text-base font-semibold text-gray-800 ">${agenda.servicio || "Servicio General"}</p>
</div>
<div>
<p class="text-sm font-medium text-gray-500 ${obtenerClaseEstado(agenda.estado)} " >${capitalizar(agenda.estado)}</p>
</div>
</div>
</div>
<div class="p-6 border-t border-gray-200  flex flex-col sm:flex-row-reverse gap-3">
<button id="editar-cita" class="flex w-full sm:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 text-black border-2 border-blue-500  hover:bg-blue-500 hover:text-white text-sm font-bold leading-normal tracking-[0.015em]">
<span class="material-symbols-outlined text-base">edit</span>
<span>Modificar</span>
</button>
<button id="cerrar-modal" class="flex w-full sm:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 text-black border-2 border-blue-500  hover:bg-blue-500 hover:text-white text-sm font-bold leading-normal tracking-[0.015em]">
<span class="material-symbols-outlined text-base">cancel</span>
<span>Cerrar</span>
</button>
</div>
</div>
</div>
  `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Event listeners para cerrar modal
    document.getElementById("cerrar-modal").addEventListener("click", cerrarModal);
    document.getElementById("modal-detalles").addEventListener("click", (e) => {
        if (e.target.id === "modal-detalles") cerrarModal();
    });

    // Event listener para editar cita
    document.getElementById("editar-cita").addEventListener("click", () => {
        const estadoCita = String(agenda.estado).toLowerCase();
        
        // Solo permitir edición si está pendiente (o es "0")
        if (estadoCita !== "pendiente" && estadoCita !== "0") {
            alertaMal("Solo se pueden modificar citas en estado pendiente");
            return;
        }

        if (agenda.id_pservicio && agenda.id) {
            sessionStorage.setItem("editCitaId", agenda.id);
            window.location.href = `/Agendar/${agenda.id_pservicio}`;
        } else {
            console.error("No se encontró el ID del servicio o de la cita", agenda);
            alertaMal("Error al intentar editar la cita");
        }
    });
}

function cerrarModal() {
    const modal = document.getElementById("modal-detalles");
    if (modal) modal.remove();
}

// Función para cancelar cita
async function cancelarCita(id, estado) {
    if (estado.toLowerCase() === "cancelada") {
        alertaMal("Esta cita ya está cancelada");
        return;
    }

    const confirmado = await alertaConfirm("¿Estás seguro de que deseas cancelar esta cita?");
    if (!confirmado) {
        return;
    }

    fetch(`${ruta}/cancelar-cita`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ id }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (!data.success) {
                console.error("Error en respuesta:", data.message);
                alertaFallo("Error al cancelar la cita");
                return;
            }
            alertaCheck("Cita cancelada correctamente");
        })
        .catch((error) => {
            console.error("Error al cancelar cita:", error);
            alertaFallo("Error al cancelar la cita");
        });
}

// Función para renderizar citas de la página actual
function renderizarCitas() {

    const tbody = document.getElementById("tabla-citas-body");

    if (!tbody) {
        console.error("No se encontró el elemento tabla-citas-body");
        return;
    }

    if (citasFiltradas.length === 0) {
        tbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-8 text-center text-gray-500">
            <div class="flex flex-col items-center gap-2">
              <span class="material-symbols-outlined text-5xl text-gray-300">event_busy</span>
              <p class="text-lg">No hay citas encontradas</p>
            </div>
          </td>
        </tr>
      `;
        actualizarControlesPaginacion();
        return;
    }

    // Calcular índices para la página actual
    const inicio = (paginaActual - 1) * citasPorPagina;
    const fin = inicio + citasPorPagina;
    const citasPagina = citasFiltradas.slice(inicio, fin);

    tbody.innerHTML = ""; // Limpiar tabla

    citasPagina.forEach((agenda) => {
        const fila = document.createElement("tr");
        fila.className = "hover:bg-gray-50";

        const isCancelada = agenda.estado.toLowerCase() === "cancelada";

        fila.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-gray-800">${formatearFecha(agenda.fecha)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-gray-800">${formatearHora(agenda.hora)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-gray-800">${agenda.nombre_establecimiento || "N/A"}</td>
        <td class="px-6 py-4 whitespace-nowrap text-gray-800">${agenda.servicio || "Servicio General"}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${obtenerClaseEstado(agenda.estado)}">
            ${capitalizar(agenda.estado)}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right">
          <button class="btn-ver p-2 rounded-full hover:bg-gray-200 text-gray-500" data-id="${agenda.id}">
            <span class="material-symbols-outlined text-xl">visibility</span>
          </button>
          <button class="btn-cancelar p-2 rounded-full hover:bg-gray-200 text-gray-500 ${isCancelada ? "opacity-50 cursor-not-allowed" : ""}" 
                  data-id="${agenda.id}" 
                  ${isCancelada ? "disabled" : ""}>
            <span class="material-symbols-outlined text-xl">delete</span>
          </button>
        </td>
      `;

        tbody.appendChild(fila);

        // Event listener para botón "Ver detalles"
        fila.querySelector(".btn-ver").addEventListener("click", () => {
            mostrarDetallesCita(agenda);
        });

        // Event listener para botón "Cancelar"
        if (!isCancelada) {
            fila.querySelector(".btn-cancelar").addEventListener("click", () => {
                cancelarCita(agenda.id, agenda.estado);
            });
        }
    });

    actualizarControlesPaginacion();
}

// Función para actualizar controles de paginación
function actualizarControlesPaginacion() {
    const totalPaginas = Math.ceil(totalCitas / citasPorPagina);
    const inicio = (paginaActual - 1) * citasPorPagina + 1;
    const fin = Math.min(paginaActual * citasPorPagina, totalCitas);

    // Actualizar información de paginación
    const infoPaginacion = document.getElementById("info-paginacion");
    if (infoPaginacion) {
        if (totalCitas === 0) {
            infoPaginacion.textContent = "No hay citas";
            const loader = document.getElementById("loader");
            if (loader) {
                loader.style.display = "none";
            }
        } else {
            infoPaginacion.textContent = `Mostrando ${inicio}-${fin} de ${totalCitas} cita${totalCitas !== 1 ? "s" : ""}`;
            const loader = document.getElementById("loader");
            if (loader) {
                loader.style.display = "none";
            }
        }
    }

    // Actualizar botones de navegación
    const btnAnterior = document.getElementById("btn-anterior");
    const btnSiguiente = document.getElementById("btn-siguiente");

    if (btnAnterior) {
        btnAnterior.disabled = paginaActual === 1;
    }

    if (btnSiguiente) {
        btnSiguiente.disabled = paginaActual >= totalPaginas;
    }
}

// Función para cambiar de página
function cambiarPagina(direccion) {
    const totalPaginas = Math.ceil(totalCitas / citasPorPagina);

    if (direccion === "anterior") {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarCitas();
        }
    } else if (direccion === "siguiente") {
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarCitas();
        }
    }
}
// Función para cargar citas desde el servidor
function cargarCitas() {
    fetch(`${ruta}/mostrarCitas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid }),
        credentials: 'include',
    })
        .then((response) => response.json())
        .then((data) => {

            if (!data.success) {
                console.error("❌ Error en respuesta:", data.message);
                return;
            }

            todasLasCitas = data.data;
            citasFiltradas = todasLasCitas; // Inicialmente todas
            totalCitas = todasLasCitas.length;


            // Renderizar página actual
            renderizarCitas();
        })
        .catch((error) => {
            // console.error("❌ Error al obtener datos:", error);
            alertaFallo("Error al cargar las citas");
        });
}

// Carga inicial
cargarCitas();

// --- Configuración de Socket.io para tiempo real ---

const socket = io(ruta, {
    withCredentials: true
});

socket.on("connect", () => {
    // console.log("🚀 [Socket.io] Conectado exitosamente al servidor en:", ruta);
    // console.log("ID de Socket:", socket.id);
});

// Escuchar cambios de estado desde el backend
socket.on("actualizar_estado_citas", (data) => {
    cargarCitas();
});

socket.on("connect_error", (error) => {
    //   console.error("❌ [Socket.io] Error de conexión:", error.message);
    console.log("Asegúrate de que 'ruta' coincida con tu servidor activo:", ruta);
});
