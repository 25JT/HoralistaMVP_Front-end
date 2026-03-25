import { validarInicioProfesional } from "./validarInicio.js";
import { ruta } from "./ruta.js";
import { cerrarSesion } from "./navJs.js";
import { alertaCheck, alertaFallo, alertaMal, alertaCheckReload } from "../assets/Alertas/Alertas.js";
import { animacionPrinCliente } from "../assets/Animaciones/animacionPrinCliente.js";

validarInicioProfesional();
animacionPrinCliente();
const userid = sessionStorage.getItem("Id");
const userRole = sessionStorage.getItem("Role");

// Variables globales para el calendario
let diasTrabajo = [];
let diasTrabajoNumeros = [];
let diasExcepciones = {}; // Objeto para almacenar excepciones por fecha: "2025-11-25": boolean
let mesActual = new Date().getMonth();
let anioActual = new Date().getFullYear();

// Variables de estado y ajustes
let intervaloCitaSeleccionado = null;
let horaInicio = "--";
let horaFin = "--";

// Variables para rastrear valores iniciales (evitar sobreescritura accidental)
let initialIntervalo = null;
let initialHoraInicio = "--";
let initialHoraFin = "--";
let initialDiasTrabajo = [];
//calendario
// Función para convertir nombres de días a números
function convertirDiasANumeros(diasTexto) {
    const mapaDias = {
        "Domingo": 0,
        "Lunes": 1,
        "Martes": 2,
        "Miércoles": 3,
        "Jueves": 4,
        "Viernes": 5,
        "Sábado": 6
    };

    if (!diasTexto || diasTexto.length === 0) return [];

    // Si diasTexto es un string separado por comas
    if (typeof diasTexto === 'string') {
        return diasTexto.split(',').map(dia => {
            const nombreLimpio = dia.trim();
            // Convertir a Capitalizado (Primera letra mayúscula, resto minúscula) para que coincida con mapaDias
            const nombreNormalizado = nombreLimpio.charAt(0).toUpperCase() + nombreLimpio.slice(1).toLowerCase();
            return mapaDias[nombreNormalizado];
        }).filter(num => num !== undefined);
    }

    // Si es un array de strings
    if (Array.isArray(diasTexto)) {
        return diasTexto.map(dia => {
            const nombreLimpio = dia.trim();
            const nombreNormalizado = nombreLimpio.charAt(0).toUpperCase() + nombreLimpio.slice(1).toLowerCase();
            return mapaDias[nombreNormalizado];
        }).filter(num => num !== undefined);
    }

    return [];
}

function cargarDatos() {


    fetch(`${ruta}/api/diasTrabajo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ userid, userRole }),
    })
        .then(response => response.json())
        .then(data => {




            if (data.success && data.data) {
                // Limpiar excepciones previas antes de cargar nuevas
                diasExcepciones = {};



                data.data.forEach((config, index) => {
                    // 1. Calendario: Configuración general de días de trabajo
                    // La tomamos del primer registro que la tenga
                    if (config.dias_trabajo && diasTrabajoNumeros.length === 0) {
                        initialDiasTrabajo = config.dias_trabajo.split(',').map(d => {
                            const nombreLimpio = d.trim();
                            return nombreLimpio.charAt(0).toUpperCase() + nombreLimpio.slice(1).toLowerCase();
                        });
                        diasTrabajoNumeros = convertirDiasANumeros(config.dias_trabajo);
                    }

                    // 2. Otros ajustes (solo del primer registro principal)
                    if (index === 0) {
                        // Duración de cita
                        if (config.intervaloCita) {
                            initialIntervalo = config.intervaloCita.toString();
                            intervaloCitaSeleccionado = initialIntervalo;
                            const input = document.querySelector(`input[name="duration"][value="${intervaloCitaSeleccionado}"]`);
                            if (input) {
                                input.checked = true;
                                input.dispatchEvent(new Event('change'));
                            }
                        }

                        // Horas laborales
                        if (config.hora_inicio) {
                            initialHoraInicio = config.hora_inicio;
                            horaInicio = initialHoraInicio;
                            const el = document.getElementById("hora_inicio");
                            if (el) el.value = config.hora_inicio;
                        }
                        if (config.hora_fin) {
                            initialHoraFin = config.hora_fin;
                            horaFin = initialHoraFin;
                            const el = document.getElementById("hora_fin");
                            if (el) el.value = config.hora_fin;
                        }
                    }

                    // 3. Cargar excepciones (fecha y es_laborable)
                    if (config.fecha && config.es_laborable !== undefined) {
                        const d = new Date(config.fecha);
                        // Usamos UTC para evitar desajustes por zona horaria en la medianoche
                        const year = d.getUTCFullYear();
                        const month = d.getUTCMonth();
                        const day = d.getUTCDate();
                        const key = `${year}-${month}-${day}`;

                        diasExcepciones[key] = (config.es_laborable === 1);
                        //           console.log(`Excepción cargada: ${key} -> ${config.es_laborable === 1 ? 'Laborable' : 'No Laborable'}`);
                    }
                });

                renderizarCalendario();
                renderizarActualizarTrabajo();
            } else {
                console.log(data.message || "No se encontraron datos de configuración");
            }
        })
        .catch(error => {
            console.error("Error al cargar ajustes:", error);
        });
}

function renderizarActualizarTrabajo() {
    const checkboxes = document.querySelectorAll('input[name="dias_trabajo"]');
    checkboxes.forEach(checkbox => {
        if (initialDiasTrabajo.includes(checkbox.value)) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
    });
}

function renderizarCalendario() {

    const calendarioDias = document.getElementById("calendario-dias");
    const mesAnioTexto = document.getElementById("mes-anio-texto");

    // Limpiar calendario
    calendarioDias.innerHTML = "";

    // Obtener primer y último día del mes
    const primerDia = new Date(anioActual, mesActual, 1);
    const ultimoDia = new Date(anioActual, mesActual + 1, 0);
    const diasEnMes = ultimoDia.getDate();

    // Obtener día de la semana del primer día (0 = Domingo, 1 = Lunes, etc.)
    let primerDiaSemana = primerDia.getDay();
    // Ajustar para que Lunes sea 0
    primerDiaSemana = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

    // Actualizar texto del mes
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    if (mesAnioTexto) {
        mesAnioTexto.textContent = `${meses[mesActual]} ${anioActual}`;
    }

    // Agregar espacios vacíos antes del primer día
    for (let i = 0; i < primerDiaSemana; i++) {
        const espacioVacio = document.createElement("div");
        espacioVacio.className = "aspect-square";
        calendarioDias.appendChild(espacioVacio);
    }

    // Obtener fecha actual
    const hoy = new Date();
    const esHoy = (dia) => {
        return dia === hoy.getDate() &&
            mesActual === hoy.getMonth() &&
            anioActual === hoy.getFullYear();
    };

    // Generar días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
        const fecha = new Date(anioActual, mesActual, dia);
        const diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

        // Crear clave única para la fecha: "YYYY-M-D"
        const fechaClave = `${anioActual}-${mesActual}-${dia}`;

        // Determinar si es día de trabajo
        // 1. Verificamos si hay una excepción específica para este día
        // 2. Si no, usamos la regla general de días de la semana
        let esDiaTrabajo;

        if (diasExcepciones.hasOwnProperty(fechaClave)) {
            esDiaTrabajo = diasExcepciones[fechaClave];
        } else {
            esDiaTrabajo = diasTrabajoNumeros.includes(diaSemana);
        }

        const botonDia = document.createElement("button");
        botonDia.className = `aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all group relative`;

        if (esHoy(dia)) {
            // Día actual
            botonDia.className += ` bg-white ring-2 ring-blue-500 ring-offset-2 text-blue-500 font-bold hover:bg-slate-50 z-10`;
        } else if (esDiaTrabajo) {
            // Día de trabajo
            botonDia.className += ` bg-blue-500 text-white hover:bg-blue-600 font-semibold`;
        } else {
            // Día no laborable
            botonDia.className += ` bg-slate-50 text-slate-400 hover:bg-slate-100 border border-transparent hover:border-slate-200`;
        }

        const spanDia = document.createElement("span");
        spanDia.className = "text-sm" + (esDiaTrabajo || esHoy(dia) ? " font-semibold" : " font-medium");
        spanDia.textContent = dia;

        botonDia.appendChild(spanDia);

        // Agregar indicador para días de trabajo
        if (esDiaTrabajo || esHoy(dia)) {
            const indicador = document.createElement("div");
            indicador.className = `size-1 rounded-full ${esHoy(dia) ? 'bg-primary' : 'bg-white/50'}`;
            botonDia.appendChild(indicador);
        }

        // Agregar event listener para marcar/desmarcar días específicos (excepciones)
        botonDia.addEventListener('click', () => {
            const fechaClaveClick = `${anioActual}-${mesActual}-${dia}`;

            // Invertir el estado actual
            const nuevoEstado = !esDiaTrabajo;

            // Guardar en excepciones
            diasExcepciones[fechaClaveClick] = nuevoEstado;

            // console.log(`📅 Fecha ${dia}/${mesActual + 1}/${anioActual} (Día ${diaSemana})`);
            // console.log(`   Estado cambiado a: ${nuevoEstado ? 'LABORABLE' : 'NO LABORABLE'}`);
            // console.log("   Excepciones actuales:", diasExcepciones);

            // Re-renderizar el calendario
            renderizarCalendario();

            // Notificar a otros scripts (AjustesCapacidadDia.js)
            if (typeof window.onDayClick === 'function') {
                window.onDayClick(dia, mesActual, anioActual, nuevoEstado);
            }

        });

        calendarioDias.appendChild(botonDia);
    }
}

function cambiarMes(direccion) {
    mesActual += direccion;

    if (mesActual > 11) {
        mesActual = 0;
        anioActual++;
    } else if (mesActual < 0) {
        mesActual = 11;
        anioActual--;
    }

    renderizarCalendario();
}

// cambiar el mes en el calendario
document.addEventListener("DOMContentLoaded", () => {
    const btnAnterior = document.getElementById("btn-mes-anterior");
    const btnSiguiente = document.getElementById("btn-mes-siguiente");

    if (btnAnterior) {
        btnAnterior.addEventListener("click", () => cambiarMes(-1));
    }

    if (btnSiguiente) {
        btnSiguiente.addEventListener("click", () => cambiarMes(1));
    }
});

cargarDatos();
// fin calendario

// duracion citas
function duracionCita() {
    const duracionInputs = document.querySelectorAll('input[name="duration"]');

    duracionInputs.forEach(input => {
        input.addEventListener("change", () => {
            // Remover borde de todos los labels
            duracionInputs.forEach(otherInput => {
                const label = otherInput.closest('label');
                if (label) {
                    label.classList.remove('border-blue-500', 'border-2');
                    label.classList.add('border-slate-200');

                    // Resetear iconos
                    const iconContainer = label.querySelector('.relative.flex');
                    if (iconContainer) {
                        const uncheckedIcon = iconContainer.children[0];
                        const checkedIcon = iconContainer.children[1];
                        if (uncheckedIcon) {
                            uncheckedIcon.classList.remove('opacity-0', 'scale-0');
                        }
                        if (checkedIcon) {
                            checkedIcon.classList.add('opacity-0');
                            checkedIcon.classList.add('scale-0');
                        }
                    }
                }
            });

            // Agregar borde al label seleccionado
            const selectedLabel = input.closest('label');
            if (selectedLabel) {
                selectedLabel.classList.remove('border-slate-200');
                selectedLabel.classList.add('border-blue-500', 'border-2');

                // Cambiar iconos del seleccionado
                const iconContainer = selectedLabel.querySelector('.relative.flex');
                if (iconContainer) {
                    const uncheckedIcon = iconContainer.children[0];
                    const checkedIcon = iconContainer.children[1];
                    if (uncheckedIcon) {
                        uncheckedIcon.classList.add('opacity-0');
                        uncheckedIcon.classList.add('scale-0');
                    }
                    if (checkedIcon) {
                        checkedIcon.classList.remove('opacity-0', 'scale-0');
                    }
                }
            }

            intervaloCitaSeleccionado = input.value;
            //  console.log("Intervalo seleccionado:", intervaloCitaSeleccionado, "minutos");


        });
    });
}
duracionCita();

//horario de jornada

function horarioJornada() {
    const btnInicio = document.getElementById("hora_inicio");
    const btnFin = document.getElementById("hora_fin");

    if (btnInicio) {
        // Inicializar con el valor actual del DOM (por si ya está cargado o tiene un default)
        if (btnInicio.value !== "--") horaInicio = btnInicio.value;

        btnInicio.addEventListener("change", () => {
            horaInicio = btnInicio.value;
            //   console.log("Hora de inicio seleccionada:", horaInicio);
        });
    }

    if (btnFin) {
        // Inicializar con el valor actual del DOM
        if (btnFin.value !== "--") horaFin = btnFin.value;

        btnFin.addEventListener("change", () => {
            horaFin = btnFin.value;
            //  console.log("Hora de fin seleccionada:", horaFin);
        });
    }
}
horarioJornada();

//guardar los ajustes


const btnGuardar = document.getElementById("btn-guardar");
btnGuardar.addEventListener("click", async () => {



    const updatePromises = [];

    // Duración: Solo si cambió
    if (intervaloCitaSeleccionado && intervaloCitaSeleccionado !== initialIntervalo) {
        // Para evitar el error "Faltan las horas", enviamos también las horas actuales
        const payload = {
            userid,
            userRole,
            intervaloCita: intervaloCitaSeleccionado
        };

        // Solo enviamos las horas si no son "--"
        if (horaInicio !== "--") payload.horaInicio = horaInicio;
        if (horaFin !== "--") payload.horaFin = horaFin;

        updatePromises.push(
            fetch(`${ruta}/api/duracionCita`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(payload),
            })
                .then(res => res.json())
                .then(data => ({ type: 'Duración', ...data }))
                .catch(err => ({ type: 'Duración', success: false, message: err.message }))
        );
    }

    // Horas: Solo si no son '--' Y alguna cambió
    if (horaInicio !== "--" && horaFin !== "--" && (horaInicio !== initialHoraInicio || horaFin !== initialHoraFin)) {
        updatePromises.push(
            fetch(`${ruta}/api/horasLaborales`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({
                    userid,
                    userRole,
                    horaInicio,
                    horaFin,
                    intervaloCita: intervaloCitaSeleccionado // También incluimos la duración por si acaso
                }),
            })
                .then(res => res.json())
                .then(data => ({ type: 'Horario', ...data }))
                .catch(err => ({ type: 'Horario', success: false, message: err.message }))
        );
    }

    // Excepciones: Siempre que haya alguna (o podrías rastrear cambios aquí también)
    if (Object.keys(diasExcepciones).length > 0) {
        updatePromises.push(
            fetch(`${ruta}/api/fechasExcep`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ userid, userRole, diasExcepciones }),
            })
                .then(res => res.json())
                .then(data => ({ type: 'Calendario', ...data }))
                .catch(err => ({ type: 'Calendario', success: false, message: err.message }))
        );
    }

    // Días de Trabajo: Comparar y loguear(Segun solicitud del usuario)
    const currentCheckboxes = document.querySelectorAll('input[name="dias_trabajo"]');
    const currentDiasTrabajo = Array.from(currentCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    // Identificar cambios
    const diasAgregados = currentDiasTrabajo.filter(d => !initialDiasTrabajo.includes(d));
    const diasRemovidos = initialDiasTrabajo.filter(d => !currentDiasTrabajo.includes(d));

    if (diasAgregados.length > 0 || diasRemovidos.length > 0) {
        updatePromises.push(
            fetch(`${ruta}/api/diasTrabajoActualizar`, { // Mantengo la ruta por ahora, pero la integro en el flujo
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ currentDiasTrabajo }),
            })
                .then(async res => {
                    const contentType = res.headers.get("content-type");
                    if (!res.ok) {
                        // Intentar obtener mensaje de error del servidor si es JSON, si no, usar texto plano
                        let errorMsg = `Error ${res.status}`;
                        try {
                            if (contentType && contentType.includes("application/json")) {
                                const errData = await res.json();
                                errorMsg += `: ${errData.message || res.statusText}`;
                            } else {
                                errorMsg += `: ${res.statusText || 'Ruta no encontrada'}`;
                            }
                        } catch (e) {
                            errorMsg += `: No se pudo conectar con el servidor`;
                        }
                        throw new Error(errorMsg);
                    }

                    if (!contentType || !contentType.includes("application/json")) {
                        throw new Error("El servidor no devolvió una respuesta válida (JSON esperado)");
                    }
                    return res.json();
                })
                .then(data => ({ type: 'Días Trabajo', ...data, message: data.message }))


                .catch(err => ({ type: 'Días Trabajo', success: false, message: err.message }))
        );
    }

    // Capacidad por Día: Integrar promesas si existen
    if (typeof window.obtenerPromesasCapacidad === 'function') {
        const promesasCapacidad = window.obtenerPromesasCapacidad();
        updatePromises.push(...promesasCapacidad);
    }

    if (updatePromises.length === 0) {
        alertaMal("No se detectaron cambios para guardar.");
        return;
    }

    btnGuardar.disabled = true;
    const originalText = btnGuardar.textContent;
    btnGuardar.textContent = "Guardando...";

    try {
        const results = await Promise.all(updatePromises);
        let msg = "";
        let hasError = false;

        results.forEach(r => {
            if (r.success) msg += `✅ ${r.type} guardado.\n`;
            else {
                msg += `❌ ${r.type}: ${r.message || 'Error'}\n`;
                hasError = true;
            }
        });

        if (hasError) {
            alertaFallo(msg);
        } else {
            alertaCheckReload(msg);
        }

        if (hasError && results.some(r => r.status === 401)) cerrarSesion();

    } catch (error) {
        alertaFallo("Error crítico al guardar.");
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = originalText;
    }

    // Actualizar dia de trabajo
});

//volver
const btnVolver = document.getElementById("btn-volver");
if (btnVolver) {

    btnVolver.addEventListener("click", function () {
        history.back();
    });
}


