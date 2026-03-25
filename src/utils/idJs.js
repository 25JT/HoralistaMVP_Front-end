
const idElement = document.getElementById("idservicio");
const id = idElement ? idElement.dataset.id : null;

// Obtener el ID del servicio del catálogo desde la URL (parámetro 's')
const urlParams = new URLSearchParams(window.location.search);
const idCatalogo = urlParams.get("s");

// Obtener citaId de sessionStorage si existe (modo edición)
const citaId = sessionStorage.getItem("editCitaId");

// Ensure ID exists
if (idElement && id) {
    idElement.textContent = "ID Establecimiento: " + id;
}

import { ruta } from "../utils/ruta.js";
import gsap from "gsap";
import {
    alertaCheck3,
    alertaCheck4,
    alertaFallo,
    alertaMal,
} from "../assets/Alertas/Alertas.js";
const userid = sessionStorage.getItem("Id");
const userRole = sessionStorage.getItem("Role");

// estado de los dias que trabajara el establecimiento
let diasTrabajoPermitidos = []; // los dias que estan permitidos se muestra con un numero  (0=dom, 1=lun, ..., 6=sab)
let listaFechasEspeciales = []; // almacen de fechas especiales fetched de la db

async function cargarHorasDisponibles() {
    const idServicio = id;
    const fecha = document.getElementById("fecha").value;
    const loader = document.getElementById("loader-servicios");
    const contenedor = document.getElementById("horas");

    if (!idServicio || !fecha) {
        return;
    }

    // validamos si el dia esta permitido
    const selectedDate = new Date(fecha + "T00:00:00");
    const dayIndex = selectedDate.getDay();

    // Validamos fechas especiales primero (tienen prioridad)
    // Usamos comparación de strings directa (YYYY-MM-DD) para evitar problemas de zona horaria
    const fechaEspecialEncontrada = listaFechasEspeciales.find(item => {
        // item.fecha usualmente viene como ISO string "2026-01-20T00:00:00.000Z" o similar
        const itemFechaStr = item.fecha.split('T')[0];
        return itemFechaStr === fecha;
    });

    if (fechaEspecialEncontrada) {
        if (fechaEspecialEncontrada.es_laborable == 0) {
            alertaMal("El establecimiento no atiende en esta fecha especial.");
            document.getElementById("fecha").value = "";
            contenedor.innerHTML = "";
            return;
        }
        // Si es laborable == 1, saltamos la validacion de diasTrabajoPermitidos
    } else {
        // revisamos si los dias estan permitidos por el calendario general
        if (diasTrabajoPermitidos.length > 0 && !diasTrabajoPermitidos.includes(dayIndex)) {
            alertaMal("El establecimiento no atiende este día. Por favor seleccione otro.");
            document.getElementById("fecha").value = "";
            contenedor.innerHTML = "";
            return;
        }
    }

    if (loader) loader.classList.remove("hidden");
    contenedor.innerHTML = "";

    try {
        const response = await fetch(`${ruta}/validarHoras`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({
                id: idServicio,
                fecha: fecha,
                id_catalogo: idCatalogo
            }),
        });

        if (!response.ok) throw new Error("Error en la respuesta del servidor");

        const data = await response.json();


        if (data.success) {
            //    console.log(data);

            // Actualizar el nombre del servicio en el campo de mensaje/notas dinámicamente
            // Solo si no estamos en modo edición (donde las notas ya vienen de la cita)
            const mensajeInput = document.getElementById("mensaje");
            const contadorMensaje = document.getElementById("contador-mensaje");
            if (mensajeInput && !citaId) {
                mensajeInput.value = data.nombreServicio || "";
                if (contadorMensaje) {
                    contadorMensaje.textContent = 100 - mensajeInput.value.length;
                }
            }

            mostrarHorasDisponibles(data);


        } else {

            contenedor.innerHTML = `<div class="col-span-full text-center py-4 text-gray-500">${data.message || "No hay horas disponibles"}</div>`;
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarError("No se pudieron cargar las horas disponibles.");
    } finally {
        if (loader) loader.classList.add("hidden");
    }
}

function mostrarHorasDisponibles(data) {
    const contenedor = document.getElementById("horas");
    contenedor.innerHTML = "";

    // Usamos directamente las horas que el backend ya validó y filtró por nosotros
    let horasDisponibles = data.disponibles || [];

    // --- FILTRO DE TIEMPO REAL (SOLO PARA HOY) ---
    // Mantenemos este filtro en el frontend porque depende del reloj del usuario
    const fechaSeleccionada = document.getElementById("fecha").value;
    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split("T")[0];

    if (fechaSeleccionada === fechaHoy) {
        // Obtenemos la hora actual y le sumamos 20 minutos de margen
        const ahora = new Date();
        ahora.setMinutes(ahora.getMinutes() + 20);
        const horaActualMinutos = ahora.getHours() * 60 + ahora.getMinutes();

        horasDisponibles = horasDisponibles.filter(hora => {
            const [h, m] = hora.split(':');
            const horaSlotMinutos = parseInt(h) * 60 + parseInt(m);
            return horaSlotMinutos >= horaActualMinutos;
        });
    }



    if (horasDisponibles.length === 0) {
        contenedor.innerHTML = `
            <div class="col-span-full text-center py-4 text-gray-500">
                No hay horas disponibles para esta fecha.
            </div>
        `;
        return;
    }



    // Creamos botones para cada hora disponible
    horasDisponibles.forEach(hora24 => {
        const [hora, minuto] = hora24.split(':');
        const horaNum = parseInt(hora);
        const minutoNum = parseInt(minuto);
        const ampm = horaNum >= 12 ? 'PM' : 'AM';
        const hora12 = horaNum % 12 === 0 ? 12 : horaNum % 12;
        const labelTime = `${hora12}:${String(minutoNum).padStart(2, '0')}`;

        const boton = document.createElement('button');
        boton.className = 'hora flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 bg-background-light hover:bg-primary hover:text-white hover:border-primary transition-all group';
        boton.dataset.id = hora24;
        boton.type = 'button';

        boton.innerHTML = `
             <span class="text-lg font-bold pointer-events-none ">${labelTime}</span>
             <span class="text-xs uppercase font-medium text-slate-500 group-hover:text-blue-100 pointer-events-none">${ampm}</span>
        `;

        boton.addEventListener('click', () => {
            document.querySelectorAll('.hora').forEach(b => {
                // Reset styles
                b.className = 'hora flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 bg-background-light hover:bg-primary hover:text-white hover:border-primary transition-all group';
                const spans = b.querySelectorAll('span');
                if (spans[1]) spans[1].classList.add('text-slate-500');
                if (spans[1]) spans[1].classList.remove('text-blue-800');
            });
            // Active style
            boton.className = 'hora flex flex-col items-center justify-center p-3 rounded-lg border border-blue-500 bg-primary text-black transition-all shadow-md ring-2 ring-primary/20  ';
            const activeSpans = boton.querySelectorAll('span');
            if (activeSpans[1]) activeSpans[1].classList.remove('text-slate-500');
            if (activeSpans[1]) activeSpans[1].classList.add('text-blue-800');

            document.getElementById('hora').value = hora24;
        });

        contenedor.appendChild(boton);
    });
}

function mostrarError(mensaje) {
    const contenedor = document.getElementById("horas");
    contenedor.innerHTML = `
        <div class="col-span-full text-center py-4 text-red-500">
            ${mensaje}
        </div>
    `;
}

// Helper para parsear los dias de trabajo string e.g. "Lunes a Viernes" o "Lunes, Miercoles"
function parsearDiasTrabajo(diasStr) {
    if (!diasStr) return [];
    const diasMap = {
        'lunes': 1, 'martes': 2, 'miercoles': 3, 'miércoles': 3,
        'jueves': 4, 'viernes': 5, 'sabado': 6, 'sábado': 6, 'domingo': 0
    };

    diasStr = diasStr.toLowerCase();


    let allowed = [];

    // Check ranges like "lunes a viernes"
    if (diasStr.includes(' a ')) {
        const parts = diasStr.split(' a ');
        const start = diasMap[parts[0].trim()];
        const end = diasMap[parts[1].trim()];
        if (start !== undefined && end !== undefined) {
            let current = start;
            while (current !== end) {
                allowed.push(current);
                current = (current + 1) % 7;
            }
            allowed.push(end);
        }
    } else {
        // Check individual days
        Object.keys(diasMap).forEach(dayName => {
            if (diasStr.includes(dayName)) {
                allowed.push(diasMap[dayName]);
            }
        });
    }

    // If "lunes - viernes" syntax
    if (diasStr.includes('-')) {
        // Fallback for hyphen
        const parts = diasStr.split('-');
        if (parts.length === 2 && diasMap[parts[0].trim()] && diasMap[parts[1].trim()]) {
            const start = diasMap[parts[0].trim()];
            const end = diasMap[parts[1].trim()];
            let current = start;
            while (current !== end) {
                allowed.push(current);
                current = (current + 1) % 7;
            }
            allowed.push(end);
        }
    }

    return [...new Set(allowed)];
}

function actualizarCirculosDias(diasStr) {
    diasTrabajoPermitidos = parsearDiasTrabajo(diasStr);

    const mapDayToName = {
        1: 'Lunes', 2: 'Martes', 3: 'Miercoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sabado', 0: 'Domingo'
    };

    // Reset all circles
    document.querySelectorAll('.dia-circle').forEach(div => {
        const circle = div.querySelector('div');
        if (circle) {
            circle.className = 'w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold border border-slate-300';
        }
    });

    // Highlight allowed
    diasTrabajoPermitidos.forEach(dayIdx => {
        // Find element by data-day or similar
        // BodyId uses names like "Lunes", "Martes"
        // Need to match dayIdx to these
        const name = mapDayToName[dayIdx]; // e.g. "Lunes"
        // Try simple search
        // Note: BodyId uses "Miercoles" no accent in data-day if I set it so. 
        // Let's assume standard names.

        // Improve selector in BodyId to have data-attributes or just query text
    });

    // More robust approach: Iterate circles and check data-day
    const circles = document.querySelectorAll('.dia-circle'); // Added class in BodyId step
    circles.forEach(circleContainer => {
        const dayName = circleContainer.dataset.day; // "Lunes", "Martes"
        // Map dayName to index
        const dayNameLower = dayName.toLowerCase().replace('é', 'e').replace('á', 'a');
        const map = {
            'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6, 'domingo': 0
        };

        if (diasTrabajoPermitidos.includes(map[dayNameLower])) {
            const div = circleContainer.querySelector('div');
            if (div) {

                //diseño de los botones de los dias permitidos
                div.className = 'w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-sm';
            }
        }
    });
}


document.getElementById("fecha").addEventListener("change", cargarHorasDisponibles);


fetch(`${ruta}/datosUsuario`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userid, id }),
    credentials: 'include',
})

    .then((res) => {
        if (res.statusText === "Unauthorized") {
            alertaFallo("No autorizado Por favor inicia sesión");

            return;
        }

        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        return res.json();
    })

    .then((data) => {
        //console.log(data);
        const usuario = data.data[0];
        const Establecimiento = data.rows2[0];

        // Fill hidden fields for submit logic
        if (document.getElementById("nombre")) document.getElementById("nombre").innerHTML = usuario.nombre;
        if (document.getElementById("apellido")) document.getElementById("apellido").innerHTML = usuario.apellidos;
        if (document.getElementById("telefono")) document.getElementById("telefono").innerHTML = usuario.telefono;
        if (document.getElementById("correo")) document.getElementById("correo").innerHTML = usuario.correo;

        if (document.getElementById("dias")) document.getElementById("dias").innerHTML = Establecimiento.dias_trabajo;
        if (document.getElementById("negocio")) document.getElementById("negocio").innerHTML = Establecimiento.nombre_establecimiento;
        if (document.getElementById("telefono_negocio")) document.getElementById("telefono_negocio").innerHTML = Establecimiento.telefono_establecimiento;
        if (document.getElementById("direccion")) document.getElementById("direccion").innerHTML = Establecimiento.direccion;

        // Visual Updates
        const tituloNegocio = document.getElementById("nombre-negocio-titulo");
        if (tituloNegocio) tituloNegocio.textContent = "Agendar en " + Establecimiento.nombre_establecimiento;

        actualizarCirculosDias(Establecimiento.dias_trabajo || "");

        // Si estamos en modo edición, cargar los datos de la cita
        if (citaId) {
            cargarDatosCitaEdicion();
        }
    })
    .catch((err) => {
        console.error("Error al obtener datos:", err);
    });

// Función para cargar datos de la cita en modo edición
async function cargarDatosCitaEdicion() {
    try {
        const res = await fetch(`${ruta}/obtenerCita`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: citaId }),
            credentials: 'include',
        });
        const data = await res.json();
        if (data.success && data.data) {
            const cita = data.data;
            // Pre-llenar campos
            if (document.getElementById("fecha")) {
                const fechaLimpia = cita.fecha.split('T')[0];
                document.getElementById("fecha").value = fechaLimpia;
                // Disparar cambio para cargar horas
                await cargarHorasDisponibles();

                // Marcar la hora actual de la cita
                if (document.getElementById("hora")) {
                    document.getElementById("hora").value = cita.hora;
                    // Intentar seleccionar el botón de hora correspondiente
                    setTimeout(() => {
                        const botonesHora = document.querySelectorAll('.hora');
                        botonesHora.forEach(btn => {
                            if (btn.dataset.id === cita.hora) {
                                btn.click();
                            }
                        });
                    }, 500);
                }
            }
            if (document.getElementById("mensaje")) {
                document.getElementById("mensaje").value = cita.mensaje || "";
            }

            // Cambiar texto del botón
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.innerHTML = '<span>Actualizar Cita</span>';
            }

            // Cambiar título si existe
            const tituloNegocio = document.getElementById("nombre-negocio-titulo");
            if (tituloNegocio) {
                tituloNegocio.textContent = "Modificar Cita";
            }
        }
    } catch (error) {
        console.error("Error al cargar datos de la cita:", error);
    }
}

// --- CONTADOR DE CARACTERES MENSAJE ---
const mensajeInput = document.getElementById("mensaje");
const contadorMensaje = document.getElementById("contador-mensaje");
if (mensajeInput && contadorMensaje) {
    // Ya no poblamos desde sessionStorage para evitar datos "pegajosos".
    // Ahora se puebla dinámicamente en cargarHorasDisponibles() desde la base de datos via el backend.

    mensajeInput.addEventListener("input", function () {
        const restante = 100 - mensajeInput.value.length;
        contadorMensaje.textContent = restante;
    });
}

// --- VALIDACIONES DE FECHA Y HORA ---
const fechaInput = document.getElementById("fecha");
const horaInput = document.getElementById("hora");
const form = document.getElementById("citaForm");
const mensaje2 = document.getElementById("mensaje");

// Abrir el selector de fecha al hacer clic en el input
if (fechaInput) {
    fechaInput.addEventListener("click", () => {
        if (typeof fechaInput.showPicker === 'function') {
            fechaInput.showPicker();
        }
    });
}

// Bloquear fechas pasadas
document.addEventListener("DOMContentLoaded", () => {
    const today = new Date();
    const minDate = today.toISOString().split("T")[0];
    if (fechaInput) fechaInput.setAttribute("min", minDate);
});

// Validar disponibilidad antes de enviar
if (form) {
    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        const nombre = document.getElementById("nombre").innerHTML;
        const apellido = document.getElementById("apellido").innerHTML;
        const fecha = fechaInput.value;
        const hora = horaInput.value;
        const mensaje = mensaje2 ? mensaje2.value : "";
        const correo = document.getElementById("correo").innerHTML;
        const nombre_establecimiento = document.getElementById("negocio").innerHTML;
        const telefono_establecimiento = document.getElementById("telefono_negocio").innerHTML;
        const direccion = document.getElementById("direccion").innerHTML;

        if (!fecha || !hora) {
            alertaMal("Selecciona una fecha y hora válidas");
            submitButton.disabled = false;
            return;
        }

        const fechaEspecialObj = listaFechasEspeciales.find(item => item.fecha.split('T')[0] === fecha);
        const esFechaEspecial = fechaEspecialObj ? (fechaEspecialObj.es_laborable == 1 ? 1 : 0) : null;

        // console.log("esFechaEspecial", esFechaEspecial);

        const response = await fetch(`${ruta}/${citaId ? 'actCita' : 'agendarcita'}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({
                userid,
                id,
                id_catalogo: idCatalogo, // Enviamos el ID del servicio del catálogo desde la URL
                citaId, // Enviamos el ID de la cita si estamos editando
                fecha,
                hora,
                mensaje,
                correo,
                nombre_establecimiento,
                telefono_establecimiento,
                nombre,
                apellido,
                direccion,
                esFechaEspecial
            }),
        })
            .finally(() => {
                submitButton.disabled = false;
            });

        if (!response.ok) {
            const errorText = await response.text();
            // console.error("Respuesta inesperada:", errorText);
            alertaFallo("Error al agendar");
            return;
        }

        const data = await response.json();
        if (!data.success) {
            alertaMal(data.message);
            return;
        }

        // Limpiar citaId de sessionStorage después de un éxito si estábamos editando
        if (citaId) {
            sessionStorage.removeItem("editCitaId");
        }

        if (userRole === "profesional") {
            alertaCheck3(citaId ? "Cita actualizada correctamente" : "Cita agendada correctamente");
        } else {
            alertaCheck4(citaId ? "Cita actualizada correctamente" : "Cita agendada correctamente");
        }
    });
}

//fechas-especiales
window.onload = function () {
    cargarFechasEspeciales()
}

function cargarFechasEspeciales() {
    const fechasEspeciales = document.getElementById("fechas-especiales");
    fetch(`${ruta}/fechas-especiales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
            id,
        }),
    })
        .then((res) => {
            if (!res.ok) throw new Error("Error en la respuesta del servidor");
            return res.json();
        })

        .then((data) => {

            if (data.data === null || data.data.length === 0) {
                fechasEspeciales.innerHTML = "";
                const div = document.createElement("div");
                div.textContent = "No hay fechas especiales";
                div.className = "text-center text-gray-500";
                fechasEspeciales.appendChild(div);
                return;
            }
            //    console.log(data.data);
            listaFechasEspeciales = data.data; // Guardamos para validar al cambiar fecha
            fechasEspeciales.innerHTML = "";

            const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

            data.data.forEach((item) => {
                const date = new Date(item.fecha);
                const d = String(date.getUTCDate()).padStart(2, '0');
                const mIndex = date.getUTCMonth();
                const mName = meses[mIndex];
                const y = date.getUTCFullYear();
                const fechaCompleta = `${d}-${String(mIndex + 1).padStart(2, '0')}-${y}`;

                const card = document.createElement("div");

                if (item.es_laborable == 0) {
                    // Diseño NO LABORABLE (Rojo)
                    card.className = "date-card group relative flex items-center justify-between  bg-white border border-slate-300 rounded-xl transition-all hover:shadow-md hover:border-red-200 ";
                    card.innerHTML = `
                        <div class="flex items-center gap-4">
                            <div class="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-red-50 ">
                                <span class="text-xs font-bold uppercase">${mName}</span>
                                <span class="text-lg font-bold leading-none">${d}</span>
                            </div>
                            <div class="flex items-center gap-4">
                                <span class="font-semibold text-slate-700">${fechaCompleta}</span>
                                <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-red-100  rounded-full flex items-center gap-1">
                                    No Laborable
                                </span>
                            </div>
                        </div>
                    `;
                } else {
                    // Diseño LABORABLE (Azul/Verde)
                    card.className = "date-card group relative flex items-center justify-between  bg-white border border-slate-300 rounded-xl transition-all hover:shadow-md hover:border-primary/30";
                    card.innerHTML = `
                        <div class="flex items-center space-x-4">
                            <div class="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-blue-500 text-white">
                                <span class="text-xs font-bold uppercase">${mName}</span>
                                <span class="text-lg font-bold leading-none">${d}</span>
                            </div>
                            <div>
                                <div class="flex items-center gap-4">
                                    <span class="font-semibold text-slate-700">${fechaCompleta}</span>
                                    <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                                        Laborable
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                }
                fechasEspeciales.appendChild(card);
            });



        })
        .catch((err) => {
            console.error("Error al obtener datos:", err);
        });
}

//volver
const btnVolver = document.getElementById("volver");
if (btnVolver) {
    btnVolver.addEventListener("click", function () {
        window.location.href = "/PrincipalCliente";
    });
}

// GSAP
if (form) {
    gsap.from("#citaForm", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power2.out",
    });
}