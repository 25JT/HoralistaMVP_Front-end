import { alertaMal2, alertaMal } from "../assets/Alertas/Alertas.js";
import { ruta } from "../utils/ruta.js";
import { cerrarSesion } from "./navJs.js";


//Obtener iamgen del usuario  de la bd 
export function updateImages() {
    fetch(`${ruta}/api/usuario/obtenerImagenUsuario`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error en respuesta: " + response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            if (data.logo) {
                sessionStorage.setItem("logo", data.logo);
                if (document.getElementById("imagenUser")) document.getElementById("imagenUser").style.backgroundImage = `url(${data.logo})`;
            } else {
                sessionStorage.setItem("logo", "https://cdn-icons-png.flaticon.com/512/25/25231.png");
            }

            if (data.fotoUsuario) {
                sessionStorage.setItem("fotoUsuario", data.fotoUsuario);
                if (document.getElementById("imagenUser")) document.getElementById("imagenUser").style.backgroundImage = `url(${data.fotoUsuario})`;
            } else {
                sessionStorage.setItem("fotoUsuario", "https://cdn-icons-png.flaticon.com/512/25/25231.png");
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

window.addEventListener("load", updateImages);


// ===== SIDEBAR MANAGEMENT =====
// Este archivo maneja toda la funcionalidad del sidebar (menú lateral)

// ===== SESSION MANAGEMENT =====
const userid = sessionStorage.getItem("Id");
const role = sessionStorage.getItem("Role");


// ===== DOM ELEMENTS =====
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const closeSidebar = document.getElementById("closeSidebar");
const btnCerrarSidebar = document.getElementById("btnCerrarSidebar");
const negocioLink = document.getElementById("Negocio");
const citasLink = document.getElementById("Citas");



function cerrarMenu() {
    if (sidebar) sidebar.classList.add("-translate-x-full");
    if (overlay) overlay.classList.add("hidden");
}

// ===== INITIALIZE SIDEBAR VISIBILITY =====
export function initializeSidebar() {
    const userid = sessionStorage.getItem("Id");
    let role = sessionStorage.getItem("Role");
    
    // Si role es nulo o la cadena "undefined", limpiar
    if (role === "undefined" || !role) {
        role = null;
    }
    
    if (role) role = role.toLowerCase();
    
    // Mostrar botón hamburguesa solo si hay sesión activa
    if (userid && menuToggle) {
        menuToggle.classList.remove("hidden");
    } else if (menuToggle) {
        menuToggle.classList.add("hidden");
    }

    // Role-based elements
    const elements = {
        negocio: document.getElementById("Negocio"),
        citas: document.getElementById("Citas"),
        tuPagina: document.getElementById("TuPagina"),
        settings: document.getElementById("Settings"),
        vincularWhatsApp: document.getElementById("VincularWhatsApp"),
        agregarServicio: document.getElementById("AgregarServicio"),
        servicios: document.getElementById("Servicios")
    };

    if (!userid) {
        // Si no hay sesión, ocultar TODO lo que sea específico de rol
        Object.values(elements).forEach(el => {
            if (el) el.classList.add("hidden");
        });
        return;
    }

    // Si hay sesión, mostrar/ocultar según el rol
    if (role === "cliente") {
        if (elements.negocio) elements.negocio.classList.add("hidden");
        if (elements.citas) elements.citas.classList.remove("hidden");
        if (elements.tuPagina) elements.tuPagina.classList.add("hidden");
        if (elements.settings) elements.settings.classList.add("hidden");
        if (elements.vincularWhatsApp) elements.vincularWhatsApp.classList.add("hidden");
        if (elements.agregarServicio) elements.agregarServicio.classList.add("hidden");
        if (elements.servicios) elements.servicios.classList.remove("hidden");
    } else if (role === "profesional") {
        if (elements.negocio) elements.negocio.classList.remove("hidden");
        if (elements.citas) elements.citas.classList.add("hidden");
        if (elements.tuPagina) elements.tuPagina.classList.remove("hidden");
        if (elements.settings) elements.settings.classList.remove("hidden");
        if (elements.vincularWhatsApp) elements.vincularWhatsApp.classList.remove("hidden");
        if (elements.agregarServicio) elements.agregarServicio.classList.remove("hidden");
        if (elements.servicios) elements.servicios.classList.add("hidden");
    }
}

// Inicializar sidebar
initializeSidebar();

// ===== EVENT LISTENERS =====

// Abrir sidebar
if (menuToggle && sidebar && overlay) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.remove("-translate-x-full");
        overlay.classList.remove("hidden");
    });
}

// Cerrar sidebar con botón X
if (closeSidebar) {
    closeSidebar.addEventListener("click", cerrarMenu);
}

// Cerrar sidebar al hacer click en el overlay
if (overlay) {
    overlay.addEventListener("click", cerrarMenu);
}

// Botón cerrar sesión desde sidebar
if (btnCerrarSidebar) {
    btnCerrarSidebar.addEventListener("click", cerrarSesion);
}

// ===== SIDEBAR ROLE-BASED NAVIGATION =====
if (negocioLink && citasLink) {
    // Navegación a MenuNegocio
    negocioLink.addEventListener("click", (e) => {
        e.preventDefault();
        location.href = "/MenuNegocio";
    });

    // Navegación a PrincipalCliente
    citasLink.addEventListener("click", (e) => {
        e.preventDefault();
        location.href = "/CitasAgendadas"; // Mantenemos la coherencia con el href del HTML
    });
}

//funciones conexion server
export function updateUserDetails() {
    const userid = sessionStorage.getItem("Id");
    if (!userid) {
        // Limpiar si no hay sesión
        const nombreUserEl = document.getElementById("nombreUser");
        const correoUserEl = document.getElementById("correoUser");
        if (nombreUserEl) nombreUserEl.textContent = "...";
        if (correoUserEl) correoUserEl.textContent = "";
        return;
    }

    const cachedName = sessionStorage.getItem("userName");
    const cachedEmail = sessionStorage.getItem("userEmail");

    const nombreUserEl = document.getElementById("nombreUser");
    const correoUserEl = document.getElementById("correoUser");

    if (cachedName && cachedEmail) {
        if (nombreUserEl) nombreUserEl.textContent = cachedName;
        if (correoUserEl) correoUserEl.textContent = cachedEmail;
    } else {
        fetch(`${ruta}/nombreUser`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({ userid }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error en respuesta: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                sessionStorage.setItem("userName", data.nombre);
                sessionStorage.setItem("userEmail", data.correo);

                if (nombreUserEl) nombreUserEl.textContent = data.nombre;
                if (correoUserEl) correoUserEl.textContent = data.correo;
            })
            .catch((error) => {
                console.error(error);
            });
    }
}

window.addEventListener("load", () => {
    initializeSidebar();
    updateUserDetails();
});

// Escuchar cambios en la sesión para actualizar todo el sidebar
window.addEventListener("sessionStateChanged", () => {
    initializeSidebar();
    updateUserDetails();
    updateImages();
});

document.getElementById("AgregarServicio").addEventListener("click", validarCantidadCitas);

function validarCantidadCitas() {

    fetch(`${ruta}/api/tienda/catalogo/validarCantalogos`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (response.status === 200 || response.status === 500) {
                return response.json();
            }
            throw new Error("Respuesta inesperada");
        })
        .then(data => {
            console.log(data);
            if (data.success) {


                if (data.cantidadServicios >= 6) {
                    alertaMal2("No puedes agregar más de 6 servicios");

                } else {
                    window.location.href = "/AgregarServicio";
                }
            } else {
                alertaMal(data.message || "Error al guardar");
            }
        })
        .catch(error => {
            console.error(error);
        });
}



