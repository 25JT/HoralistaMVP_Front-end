import { ruta } from "../utils/ruta.js";
import { alertaCheck2, alertaFallo, alertaMal, alertaFalloDesaparece } from "../assets/Alertas/Alertas.js";


// ===== DOM ELEMENTS =====
const btnCerrar = document.getElementById("btnCerrar");
const btnIniciar = document.getElementById("btnIniciar");
const btnIniciarMobile = document.getElementById("btnIniciarMobile");

// ===== UTILITY FUNCTIONS =====
export function cerrarSesion() {
  sessionStorage.clear();
  fetch(`${ruta}/logout`, {
    method: "POST",
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
      console.log(data);
      localStorage.clear();
      location.href = "/";
    })
    .catch((error) => {
      console.error(error);
    });
}


// ===== INITIALIZE UI BASED ON SESSION =====
export function initializeAuthButtons() {
  const userid = sessionStorage.getItem("Id");
  if (!userid) {
    // Usuario NO ha iniciado sesión (en esta pestaña)
    if (btnIniciar) {
      btnIniciar.classList.remove("hidden");
      btnIniciar.classList.add("border-2", "border-[#135bec]", "rounded-2xl");
    }
    if (btnIniciarMobile) {
      btnIniciarMobile.classList.remove("hidden");
      btnIniciarMobile.classList.add("border-2", "border-[#135bec]", "rounded-2xl");
    }
    if (btnCerrar) {
      btnCerrar.classList.add("hidden");
    }
  } else {
    // Usuario ha iniciado sesión
    if (btnIniciar) btnIniciar.classList.add("hidden");
    if (btnIniciarMobile) btnIniciarMobile.classList.add("hidden");
    if (btnCerrar) {
      btnCerrar.classList.remove("hidden");
      btnCerrar.addEventListener("click", cerrarSesion);
    }
  }
}

// Función global para verificar estado con el servidor
async function verificarEstadoGlobal() {
  try {
    const res = await fetch(`${ruta}/api/verificar-estado`, {
      method: 'GET',
      credentials: 'include'
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.usuario) {
        // Guardar datos (asegurando que el rol no sea undefined)
        sessionStorage.setItem("Id", data.usuario.id);

        // Verificación defensiva del rol (puede venir como 'role' o 'Role')
        const roleValue = data.usuario.rol;
        if (roleValue) {
          sessionStorage.setItem("Role", roleValue);
        }

        // Capturar estado del negocio si existe
        const statusNegocio = data.usuario.StatusNegocio ?? data.usuario.negocio_creado ?? data.usuario.status_negocio;
        if (statusNegocio !== undefined) {
          sessionStorage.setItem("StatusNegocio", statusNegocio);
        }

        if (data.usuario.nombre) sessionStorage.setItem("userName", data.usuario.nombre);
        if (data.usuario.correo) sessionStorage.setItem("userEmail", data.usuario.correo);

        // Notificar a todos los componentes
        window.dispatchEvent(new CustomEvent('sessionStateChanged'));
      } else {
        // Si el servidor dice que no hay sesión, limpiar
        if (sessionStorage.getItem("Id")) {
          sessionStorage.clear();
          window.dispatchEvent(new CustomEvent('sessionStateChanged'));
        }
      }
    }
  } catch (err) {
    console.error("Error en verificación global:", err);
  }
}

// Inicializar al cargar el script
initializeAuthButtons();
verificarEstadoGlobal();

// Escuchar cambios en la sesión desde otros scripts
window.addEventListener("sessionStateChanged", initializeAuthButtons);

// ===== EVENT LISTENERS =====

// Evento para abrir modal de login desde mobile
if (btnIniciarMobile) {
  btnIniciarMobile.addEventListener("click", () => {
    const loginDropdown = document.getElementById("loginDropdown");
    if (loginDropdown) loginDropdown.classList.remove("hidden");
  });
}



// ===== MODAL LOGIN =====
document.addEventListener("DOMContentLoaded", function () {
  const loginDropdown = document.getElementById("loginDropdown");
  const closeLogin = document.getElementById("closeLogin");
  const showForgot = document.getElementById("showForgot");
  const forgotForm = document.getElementById("forgotForm");
  const loginForm = document.getElementById("loginForm");
  const backToLogin = document.getElementById("backToLogin");

  // Evento para abrir modal de login desde desktop
  if (btnIniciar && loginDropdown) {
    btnIniciar.addEventListener("click", function () {
      loginDropdown.classList.remove("hidden");
    });
  }

  // Cerrar modal de login
  if (closeLogin && loginDropdown && loginForm && forgotForm) {
    closeLogin.addEventListener("click", function () {
      loginDropdown.classList.add("hidden");
      loginForm.classList.remove("hidden");
      forgotForm.classList.add("hidden");
    });
  }

  // Mostrar formulario de recuperación de contraseña
  if (showForgot && loginForm && forgotForm) {
    showForgot.addEventListener("click", function () {
      loginForm.classList.add("hidden");
      forgotForm.classList.remove("hidden");
    });
  }

  // Volver al formulario de login
  if (backToLogin && forgotForm && loginForm) {
    backToLogin.addEventListener("click", function () {
      forgotForm.classList.add("hidden");
      loginForm.classList.remove("hidden");
    });
  }


  // ===== OPTIMIZACIÓN PARA MÓVILES (TECLADO) =====
  const inputs = document.querySelectorAll('#loginDropdown input');
  const modalContent = document.querySelector('#loginDropdown > div');

  function handleFocus() {
    if (window.innerWidth < 768) {
      if (modalContent) {
        modalContent.style.transition = "transform 0.3s ease";
        modalContent.style.transform = "translateY(-80px)";
      }
    }
  }

  function handleBlur() {
    if (window.innerWidth < 768) {
      if (modalContent) {
        modalContent.style.transform = "translateY(0)";
      }
    }
  }

  inputs.forEach(input => {
    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);
  });
});

// Login BD original
const formData = document.getElementById("loginForm");
const correo = document.getElementById("loginEmail");
const contrasena = document.getElementById("loginPassword");

if (formData && !formData.dataset.listenerAdded) {
  formData.addEventListener("submit", (e) => {
    e.preventDefault();
    fetch(`${ruta}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correo: correo.value,
        contrasena: contrasena.value,
      }),
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {

        if (data.success) {
          const loginDropdown = document.getElementById("loginDropdown");
          if (loginDropdown) loginDropdown.classList.add("hidden");

          localStorage.setItem("Id", data.id);
          sessionStorage.setItem("Id", data.id);
          sessionStorage.setItem("Role", data.role);
          sessionStorage.setItem("StatusNegocio", data.negocio_creado);

          // Si el usuario está en una ruta de agendar, simplemente recargamos
          if (window.location.pathname.toLowerCase().includes("/agendar/")) {
            location.reload();
            return;
          }

          if (data.role === "profesional") {
            if (data.negocio_creado === 1) {

              location.href = "MenuNegocio";
            } else location.href = "RegNegocio";

          } else if (data.role === "cliente") {
            location.href = "CitasAgendadas";

          }

        } else {
          alertaMal(data.message);
        }
      })
      .catch((err) => {
        console.error(err);
        alertaFallo("Error al enviar el formulario");
      });
  });
}

//restablecer contraseña
const forgotForm = document.getElementById("forgotForm");
const correo2 = document.getElementById("forgotEmail");
const submitBtn = forgotForm?.querySelector('button[type="submit"]');

if (forgotForm && !forgotForm.dataset.listenerAdded) {
  forgotForm.dataset.listenerAdded = true; // Evita agregar el listener más de una vez

  forgotForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // 🔹 Deshabilitar el botón inmediatamente
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando..."; // Opcional
    }

    fetch(`${ruta}/restablecer-contrasena`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: correo2.value }),


    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alertaCheck2(data.message);
        } else {
          alertaFallo(data.message);
          if (submitBtn) submitBtn.disabled = false; // Reactivar si hubo error
        }
      })
      .catch((err) => {
        console.error(err);
        alertaFallo("Error al enviar el formulario");
        if (submitBtn) submitBtn.disabled = false; // Reactivar si hubo error
      });
  });
}

//validar vinculacion de wpp

export default async function estadoWhatsApp() {
  // Primero verificamos el estado del tutorial
  try {
    const resTour = await fetch(`${ruta}/api/tour/general`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    });
    const tutorialStatus = await resTour.json();

    // Si el tutorial está pendiente (0) y el script del tutorial está en la página
    if (tutorialStatus === 0 && window.tutorialGeneralPresente) {
      console.log("Tutorial pendiente, esperando a que termine para validar WhatsApp...");

      // Escuchamos el evento de finalización una sola vez
      window.addEventListener("tutorialTerminado", () => {
        console.log("Tutorial detectado como terminado/cerrado, validando WhatsApp...");
        ejecutarValidacionWhatsApp();
      }, { once: true });

      return;
    }
  } catch (err) {
    console.error("Error al verificar tutorial desde navJs:", err);
  }

  // Si el tutorial ya terminó o no está el script, procedemos normalmente
  ejecutarValidacionWhatsApp();
}

async function ejecutarValidacionWhatsApp() {
  fetch(`${ruta}/estadoWhatsApp`, {
    method: "GET",
    credentials: 'include',
  })
    .then(res => res.json())
    .then(data => {
      let estado = data.connected;
      if (estado === true) {
        console.log("WhatsApp vinculado (status 200)");
      } else {
        console.log("WhatsApp no vinculado (status 400)");
        alertaFalloDesaparece("WhatsApp no vinculado");
      }
    })
    .catch(err => {
      console.error("Error al verificar estado inicial:", err);
    });
}


// ===== BLOG NAVIGATION =====

export function setupBlogNavigation() {
  const btnBlog = document.getElementById("btnBlog");
  const btnNosotros = document.getElementById("btnNosotros");

  if (btnBlog) {
    btnBlog.addEventListener("click", () => {
      window.location.href = "/Blog";
    });
  }

  if (btnNosotros) {
    btnNosotros.addEventListener("click", () => {
      window.location.href = "/Nosotros";
    });
  }
}

// Inicializar al cargar el script
document.addEventListener("DOMContentLoaded", setupBlogNavigation);
