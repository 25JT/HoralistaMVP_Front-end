import { alertaCheck, alertaFallo } from "../assets/Alertas/Alertas.js";
import gsap from "gsap";
import { ruta } from "../utils/ruta.js";

// Animación de entrada del formulario
gsap.to("#formContainer", {
  duration: 0.8,
  opacity: 1,
  y: 0,
  ease: "power2.out",
});

const token = new URLSearchParams(window.location.search).get("id_token");

window.onload = () => {
  if (token == null || token == "") {
    alertaFallo("Token no encontrado");

  }
}


const svgAbierto = `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 8L3.07945 4.30466C4.29638 2.84434 6.09909 2 8 2C9.90091 2 11.7036 2.84434 12.9206 4.30466L16 8L12.9206 11.6953C11.7036 13.1557 9.90091 14 8 14C6.09909 14 4.29638 13.1557 3.07945 11.6953L0 8ZM8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z" fill="#000000"/></svg>`;

const svgCerrado = `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 16H13L10.8368 13.3376C9.96488 13.7682 8.99592 14 8 14C6.09909 14 4.29638 13.1557 3.07945 11.6953L0 8L3.07945 4.30466C3.14989 4.22013 3.22229 4.13767 3.29656 4.05731L0 0H3L16 16ZM5.35254 6.58774C5.12755 7.00862 5 7.48941 5 8C5 9.65685 6.34315 11 8 11C8.29178 11 8.57383 10.9583 8.84053 10.8807L5.35254 6.58774Z" fill="#000000"/><path d="M16 8L14.2278 10.1266L7.63351 2.01048C7.75518 2.00351 7.87739 2 8 2C9.90091 2 11.7036 2.84434 12.9206 4.30466L16 8Z" fill="#000000"/></svg>`;

// Selecciona todos los botones que tienen data-toggle
document.querySelectorAll("[data-toggle]").forEach(btn => {

  btn.addEventListener("click", () => {
    const inputId = btn.getAttribute("data-toggle");
    const input = document.getElementById(inputId);
    const icon = btn.querySelector(".icon");

    if (input.type === "password") {
      input.type = "text";
      icon.innerHTML = svgCerrado;
    } else {
      input.type = "password";
      icon.innerHTML = svgAbierto;
    }
  });

});

const btn = document.getElementById("submitBtn");
const msg = document.getElementById("message");
//console.log(token);

btn.addEventListener("click", async () => {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Validar campos
  if (!password || !confirmPassword) {
    msg.textContent = "Todos los campos son obligatorios";
    msg.className = "mt-4 text-center font-semibold text-red-500";
    return;
  }
  if (password !== confirmPassword) {
    msg.textContent = "Las contraseñas no coinciden";
    msg.className = "mt-4 text-center font-semibold text-red-500";
    return;
  }

  try {
    const res = await fetch(`${ruta}/cambiar-password?id_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ token: token, password: password }),
    });

    const data = await res.json();
    msg.textContent = data.message;
    msg.className = `mt-4 text-center font-semibold $   {
          data.success ? "text-green-500" : "text-red-500"
        }`;
    // Redirigir al inicio
    setTimeout(() => {
      alertaCheck(data.message);
      location.href = "/";
    }, 2500);

    // Animación de éxito
    if (data.success) {
      gsap.to("#formContainer", {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
      });
    }
  } catch (error) {
    msg.textContent = "Error de conexión con el servidor";
    msg.className = "mt-4 text-center font-semibold text-red-500";
    alertaFallo("Error de conexión con el servidor");
  }
});