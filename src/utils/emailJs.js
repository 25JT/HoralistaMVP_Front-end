import { ruta } from "../utils/ruta.js";
import gsap from "gsap";


const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("id_token");

function mostrarMensaje(msg, isSuccess) {
    const mensajeEl = document.getElementById("mensaje");
    if (mensajeEl) {
        mensajeEl.textContent = msg;
        mensajeEl.classList.remove("text-green-600", "text-red-500", "text-gray-700");
        if (isSuccess) {
            mensajeEl.classList.add("text-green-600");
            document.body.style.background = "#d1fae5";
        } else {
            mensajeEl.classList.add("text-red-500");
            document.body.style.background = "#fee2e2";
        }
        setTimeout(() => {
            gsap.fromTo("#card-email", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power2.out" });
        }, 100);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        mostrarMensaje("Token no encontrado en el enlace.", false);
    } else {
        fetch(`${ruta}/verificar-email?id_token=${token}`, { credentials: 'include' })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    mostrarMensaje(data.message, true);
                } else {
                    mostrarMensaje(data.message, false);
                }
            })
            .catch(() => {
                mostrarMensaje("Error al conectar con el servidor.", false);
            });
    }
});

const volver = document.getElementById("volver");
if (volver) {
    volver.addEventListener("click", () => {
        window.location.href = "/";
    });
}
