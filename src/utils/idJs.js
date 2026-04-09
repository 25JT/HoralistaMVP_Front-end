
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
import flatpickr from "flatpickr";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import "flatpickr/dist/flatpickr.min.css";

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

    if (loader) {
        loader.classList.remove("hidden");
        loader.classList.add("flex");
    }
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
            contenedor.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">${data.message || "No hay horas disponibles"}</div>`;
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarError("No se pudieron cargar las horas disponibles.");
    } finally {
        if (loader) {
            loader.classList.add("hidden");
            loader.classList.remove("flex");
        }
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
            <div class="col-span-full text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                No hay horas disponibles para hoy con el margen de tiempo requerido.
            </div>
        `;
        return;
    }

    horasDisponibles.forEach(hora24 => {
        const [hora, minuto] = hora24.split(':');
        const horaNum = parseInt(hora);
        const minutoNum = parseInt(minuto);
        const ampm = horaNum >= 12 ? 'PM' : 'AM';
        const hora12 = horaNum % 12 === 0 ? 12 : horaNum % 12;
        const labelTime = `${hora12}:${String(minutoNum).padStart(2, '0')}`;

        const boton = document.createElement('button');
        boton.className = 'hora-btn flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-500 hover:shadow-lg transition-all transform active:scale-95 group relative overflow-hidden';
        boton.dataset.id = hora24;
        boton.type = 'button';

        boton.innerHTML = `
             <span class="text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors z-10">${labelTime}</span>
             <span class="text-[10px] uppercase font-black text-slate-400 group-hover:text-blue-400 transition-colors z-10">${ampm}</span>
             <div class="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        `;

        boton.addEventListener('click', () => {
            document.querySelectorAll('.hora-btn').forEach(b => {
                b.classList.remove('border-blue-600', 'bg-blue-600', 'shadow-blue-200', 'ring-4', 'ring-blue-100');
                b.classList.add('border-slate-100', 'bg-slate-50');
                const spans = b.querySelectorAll('span');
                spans[0].className = 'text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors z-10';
                spans[1].className = 'text-[10px] uppercase font-black text-slate-400 group-hover:text-blue-400 transition-colors z-10';
            });

            boton.classList.add('border-blue-600', 'bg-blue-600', 'shadow-blue-200', 'ring-4', 'ring-blue-100');
            boton.classList.remove('bg-slate-50', 'border-slate-100');
            const activeSpans = boton.querySelectorAll('span');
            activeSpans[0].className = 'text-base font-black text-white z-10';
            activeSpans[1].className = 'text-[10px] uppercase font-black text-blue-100 z-10';

            document.getElementById('hora').value = hora24;

            // Actualizar label de hora seleccionada
            const labelSel = document.getElementById('label-horario-seleccionado');
            if (labelSel) {
                labelSel.textContent = `Seleccionado: ${labelTime} ${ampm}`;
                labelSel.classList.remove('hidden');
            }
        });

        contenedor.appendChild(boton);
    });
}

function mostrarError(mensaje) {
    const contenedor = document.getElementById("horas");
    contenedor.innerHTML = `
        <div class="col-span-full text-center py-12 text-red-500 border-2 border-dashed border-red-100 rounded-xl bg-red-50/50">
            <span class="material-symbols-outlined block mb-2">error</span>
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

    const circles = document.querySelectorAll('.dia-circle');
    circles.forEach(circleContainer => {
        const dayName = circleContainer.dataset.day;
        const dayNameLower = dayName.toLowerCase().replace('é', 'e').replace('á', 'a');
        const map = {
            'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6, 'domingo': 0
        };

        const div = circleContainer.querySelector('div');
        if (div) {
            if (diasTrabajoPermitidos.includes(map[dayNameLower])) {
                div.className = 'w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-blue-200 border-none';
                const span = circleContainer.querySelector('span');
                if (span) {
                    span.className = 'text-[10px] text-blue-600 font-bold';
                    span.classList.remove('hidden');
                }
            } else {
                div.className = 'w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold border border-transparent opacity-50';
                const span = circleContainer.querySelector('span');
                if (span) span.className = 'text-[10px] text-slate-400 font-medium hidden sm:block';
            }
        }
    });
}


// --- INITIALIZE FLATPICKR ---
document.addEventListener("DOMContentLoaded", () => {
    const fechaInput = document.getElementById("fecha");
    if (fechaInput) {
        flatpickr(fechaInput, {
            dateFormat: "Y-m-d",
            locale: Spanish,
            minDate: "today",
            disableMobile: "true", // Use custom flatpickr on mobile too for consistency
            onChange: function (selectedDates, dateStr) {
                cargarHorasDisponibles();
            }
        });
    }
});


fetch(`${ruta}/datosUsuario`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userid, id }),
    credentials: 'include',
})
    .then((res) => {

        if (res.status === 400) {
            crearusuario();
            return;
        }

        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        return res.json();
    })

    .then((data) => {
        if (!data) return; // viene de crearusuario (status 400)
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

// ===== MODAL DE REGISTRO PARA INVITADOS =====
function crearusuario() {
    const modal = document.getElementById("modal-registro-invitado");
    if (!modal) return;

    // Mostrar el modal
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    // === Country Picker (selector de país con bandera) ===
    const cpBtn = document.getElementById("reg-cp-btn");
    const cpList = document.getElementById("reg-cp-list");
    const cpFlag = document.getElementById("reg-cp-flag");
    const cpCode = document.getElementById("reg-cp-code");

    if (cpBtn && cpList) {
        // Abrir / cerrar la lista
        cpBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            cpList.classList.toggle("hidden");
        });

        // Seleccionar opción
        cpList.querySelectorAll("li").forEach(li => {
            li.addEventListener("click", () => {
                const iso = li.dataset.iso;
                const code = li.dataset.code;
                if (cpFlag) {
                    cpFlag.src = `https://flagcdn.com/w20/${iso}.png`;
                    cpFlag.alt = iso.toUpperCase();
                }
                if (cpCode) cpCode.textContent = code;
                cpList.classList.add("hidden");
            });
        });

        // Cerrar al clic fuera
        document.addEventListener("click", () => cpList.classList.add("hidden"));
        cpList.addEventListener("click", e => e.stopPropagation());
    }

    // Toggle visibilidad contraseña
    const togglePwdBtn = document.getElementById("toggle-pwd-reg");
    const pwdInput = document.getElementById("reg-contrasena");
    const pwdIcon = document.getElementById("icon-toggle-pwd");
    if (togglePwdBtn && pwdInput && pwdIcon) {
        togglePwdBtn.addEventListener("click", () => {
            const isHidden = pwdInput.type === "password";
            pwdInput.type = isHidden ? "text" : "password";
            pwdIcon.textContent = isHidden ? "visibility_off" : "visibility";
        });
    }

    // Botón REGISTRARSE
    const btnRegistro = document.getElementById("btn-registro-invitado");
    if (btnRegistro) {
        btnRegistro.addEventListener("click", async () => {
            const nombre = document.getElementById("reg-nombre")?.value?.trim();
            const code_pais = (document.getElementById("reg-cp-code")?.textContent?.trim() || "+57").replace("+", "");
            const telefonoRaw = document.getElementById("reg-telefono")?.value?.trim();
            const telefono = telefonoRaw ? `${code_pais}${telefonoRaw}` : "";
            const correo = document.getElementById("reg-correo")?.value?.trim();
            const contrasena = document.getElementById("reg-contrasena")?.value;

            if (!nombre || !telefono || !correo || !contrasena) {
                alertaMal("Por favor, completa todos los campos.");
                return;
            }
            if (contrasena.length < 6) {
                alertaMal("La contraseña debe tener al menos 6 caracteres.");
                return;
            }

            // Deshabilitar botón mientras carga
            btnRegistro.disabled = true;
            btnRegistro.innerHTML = `
                <span class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Creando cuenta...
            `;

            try {
                const res = await fetch(`${ruta}/registro/cliente`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ nombre, code_pais, telefono, correo, contrasena }),
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    // Guardar el nuevo ID de sesión y recargar la misma URL
                    // (el server debería haber seteado la cookie de sesión)
                    sessionStorage.setItem("Id", data.id || "");
                    sessionStorage.setItem("Role", "cliente");
                    modal.classList.add("hidden");
                    modal.classList.remove("flex");
                    // Recargar para que el fetch principal cargue los datos del nuevo usuario
                    window.location.reload();
                } else {
                    alertaMal(data.message || "Error al crear la cuenta. Intenta de nuevo.");
                    btnRegistro.disabled = false;
                    btnRegistro.innerHTML = `
                        <span class="material-symbols-outlined text-lg">check_circle</span>
                        Crear cuenta y continuar
                    `;
                }
            } catch (err) {
                console.error("Error registro:", err);
                alertaMal("Ocurrió un error. Intenta de nuevo.");
                btnRegistro.disabled = false;
                btnRegistro.innerHTML = `
                    <span class="material-symbols-outlined text-lg">check_circle</span>
                    Crear cuenta y continuar
                `;
            }
        });
    }

    // Botón "Ya tengo cuenta" → mostrar panel login
    const btnLogin = document.getElementById("btn-login-invitado");
    const panelRegistro = document.getElementById("panel-registro");
    const panelLogin = document.getElementById("panel-login");

    if (btnLogin && panelRegistro && panelLogin) {
        btnLogin.addEventListener("click", () => {
            panelRegistro.classList.add("hidden");
            panelLogin.classList.remove("hidden");
        });
    }

    // Botón "Volver" → regresar al panel de registro
    const btnVolverRegistro = document.getElementById("btn-volver-registro");
    if (btnVolverRegistro && panelRegistro && panelLogin) {
        btnVolverRegistro.addEventListener("click", () => {
            panelLogin.classList.add("hidden");
            panelRegistro.classList.remove("hidden");
        });
    }

    // Toggle contraseña panel login
    const togglePwdLoginBtn = document.getElementById("toggle-pwd-login");
    const pwdLoginInput = document.getElementById("login-contrasena");
    const pwdLoginIcon = document.getElementById("icon-toggle-pwd-login");
    if (togglePwdLoginBtn && pwdLoginInput && pwdLoginIcon) {
        togglePwdLoginBtn.addEventListener("click", () => {
            const isHidden = pwdLoginInput.type === "password";
            pwdLoginInput.type = isHidden ? "text" : "password";
            pwdLoginIcon.textContent = isHidden ? "visibility_off" : "visibility";
        });
    }

    // Botón INICIAR SESIÓN
    const btnSubmitLogin = document.getElementById("btn-submit-login");
    if (btnSubmitLogin) {
        btnSubmitLogin.addEventListener("click", async () => {
            const correo = document.getElementById("login-correo")?.value?.trim();
            const contrasena = document.getElementById("login-contrasena")?.value;

            if (!correo || !contrasena) {
                alertaMal("Por favor, completa todos los campos.");
                return;
            }

            btnSubmitLogin.disabled = true;
            btnSubmitLogin.innerHTML = `
                <span class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Ingresando...
            `;

            try {
                const res = await fetch(`${ruta}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ correo, contrasena }),
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    sessionStorage.setItem("Id", data.id || "");
                    sessionStorage.setItem("Role", data.role || "cliente");
                    modal.classList.add("hidden");
                    modal.classList.remove("flex");
                    window.location.reload();
                } else {
                    alertaMal(data.message || "Correo o contraseña incorrectos.");
                    btnSubmitLogin.disabled = false;
                    btnSubmitLogin.innerHTML = `
                        <span class="material-symbols-outlined text-lg">login</span>
                        Ingresar
                    `;
                }
            } catch (err) {
                console.error("Error login:", err);
                alertaMal("Ocurrió un error. Intenta de nuevo.");
                btnSubmitLogin.disabled = false;
                btnSubmitLogin.innerHTML = `
                    <span class="material-symbols-outlined text-lg">login</span>
                    Ingresar
                `;
            }
        });
    }
}


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
                const input = document.getElementById("fecha");
                input.value = fechaLimpia;

                // Actualizar Flatpickr si existe
                if (input._flatpickr) {
                    input._flatpickr.setDate(fechaLimpia);
                }

                await cargarHorasDisponibles();

                if (document.getElementById("hora")) {
                    document.getElementById("hora").value = cita.hora;
                    setTimeout(() => {
                        const botonesHora = document.querySelectorAll('.hora-btn');
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

// Abrir el selector de fecha al hacer clic en el input (ya manejado por flatpickr)
/*
if (fechaInput) {
    fechaInput.addEventListener("click", () => {
        if (typeof fechaInput.showPicker === 'function') {
            fechaInput.showPicker();
        }
    });
}
*/

// Bloquear fechas pasadas (ya manejado por flatpickr minDate)
/*
document.addEventListener("DOMContentLoaded", () => {
    const today = new Date();
    const minDate = today.toISOString().split("T")[0];
    if (fechaInput) fechaInput.setAttribute("min", minDate);
});
*/

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
                const mNameLabels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                const mName = mNameLabels[mIndex];
                const y = date.getUTCFullYear();
                const fechaCompleta = `${d}-${String(mIndex + 1).padStart(2, '0')}-${y}`;

                const card = document.createElement("div");

                if (item.es_laborable == 0) {
                    card.className = "flex items-center gap-3 p-3 bg-red-50/50 border border-red-100 rounded-xl transition-all hover:shadow-sm";
                    card.innerHTML = `
                        <div class="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-red-500 text-white shrink-0">
                            <span class="text-[9px] font-black uppercase leading-none">${mName}</span>
                            <span class="text-base font-black leading-none">${d}</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-sm font-bold text-slate-700">${fechaCompleta}</span>
                            <span class="text-[10px] font-black text-red-500 uppercase tracking-wider">No Laborable</span>
                        </div>
                    `;
                } else {
                    card.className = "flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl transition-all hover:shadow-sm";
                    card.innerHTML = `
                        <div class="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-blue-500 text-white shrink-0">
                            <span class="text-[9px] font-black uppercase leading-none">${mName}</span>
                            <span class="text-base font-black leading-none">${d}</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-sm font-bold text-slate-700">${fechaCompleta}</span>
                            <span class="text-[10px] font-black text-blue-600 uppercase tracking-wider">Laborable Extra</span>
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