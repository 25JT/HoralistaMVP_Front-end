import { ruta } from "./ruta";
import { alertaCheck3, alertaFallo } from "../assets/Alertas/Alertas.js";

let intervaloValidar = null;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Verificar estado inicial al cargar la página
    verificarEstadoInicial();
});

async function verificarEstadoInicial() {
    try {
        const res = await fetch(`${ruta}/estadoWhatsApp`, {
            method: "GET",
            credentials: 'include',
        });
        const data = await res.json();
        // console.log("Estado inicial:", data);

        if (data.connected === true || data.vinculado === true) {
            alertaCheck("WhatsApp ya está vinculado");
            // Opcional: Ocultar el contenedor de QR si ya está conectado
        } else {
            // 2. Si no está vinculado, obtener el QR e iniciar el "reloj"
            iniciarProcesoVinculacion();
        }
    } catch (err) {
        console.error("Error al verificar estado inicial:", err);
        // Intentamos iniciar el proceso de todos modos por si es error de red temporal
        iniciarProcesoVinculacion();
    }
}

async function iniciarProcesoVinculacion() {
    try {
        const res = await fetch(`${ruta}/vincularWhatsApp`, {
            method: "POST",
            credentials: 'include',
        });
        const data = await res.json();

        if (data.qr) {
            qrRender(data.qr);
            // 3. Iniciar el "reloj" para preguntar por el estado cada 3 segundos
            if (!intervaloValidar) {
                // console.log("Iniciando polling de estado...");
                intervaloValidar = setInterval(validarVinculado, 3000);
            }
        } else {
            alertaFallo("Error al generar el QR. Por favor, actualiza la página.");
        }
    } catch (err) {
        console.error("Error en iniciarProcesoVinculacion:", err);
        alertaFallo("Error al conectar con el servidor de WhatsApp");
    }
}

async function validarVinculado() {
    try {
        const res = await fetch(`${ruta}/estadoWhatsApp`, {
            method: "GET",
            credentials: 'include',
        });
        const data = await res.json();
        //   console.log("Polling estado:", data);

        if (data.connected === true || data.vinculado === true) {
            alertaCheck3("¡WhatsApp Vinculado con éxito!");



            // 4. Detener el reloj
            if (intervaloValidar) {
                clearInterval(intervaloValidar);
                intervaloValidar = null;
                //     console.log("Polling detenido.");
            }

            // Opcional: Limpiar el QR de la pantalla
            const imgQr = document.getElementById("imgQr");
            if (imgQr) {
                // imagen de éxito 
                imgQr.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuDXvCLSvDgaJp60xH9618XP5K3x4zvFddTCAEt9kgaZwVwhn3KUKWGP9MxkEMH_LNb6lJzF0Uqei4e8hoLWKQGFwJrm1sIiX2W7jJBtOMf6ZXMc4fi4qinnAYvxPJaAtH0rU8tcdPKTN5bKBjjXTRDmNM_YIe001lZ_O-hlcjXsKlcDSmRL4ePi7qtbu2lDl0iaFsmlAnuQqAyVyQMlVBXr12bGJMmlFnUeTdrWQDxF747WRrsack8rzCaEj981_qoJBsDKFxtlBg";
            }
        }
    } catch (err) {
        console.error("Error en el polling de estado:", err);
    }
}

function qrRender(qr) {
    const imgQr = document.getElementById("imgQr");
    if (imgQr) {
        imgQr.src = qr;
    } else {
        console.error("No se encontró el elemento 'imgQr' en el DOM");
    }
}


//cancelar vianculacion
document.addEventListener("DOMContentLoaded", () => {
    const btnCancelar = document.getElementById("btn-cancelar-vinculacion");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", () => {
            window.location.href = "/MenuNegocio    ";
        });
    }
});