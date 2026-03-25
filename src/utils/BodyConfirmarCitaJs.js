import { ruta } from "../utils/ruta.js";

async function actualizarCita(id, accion) {
    try {
        // Deshabilitar botones
        const btnConfirmar = document.getElementById("btnConfirmar");
        const btnCancelar = document.getElementById("btnCancelar");
        btnConfirmar.disabled = true;
        btnConfirmar.classList.add("opacity-50");
        btnCancelar.disabled = true;
        btnCancelar.classList.add("opacity-50");

        // Agregar atributo al <body>
        document.body.setAttribute(
            "data-estado",
            accion === "confirmar" ? "confirmada" : "cancelada",
        );

        const endpoint =
            accion === "confirmar"
                ? `${ruta}/confirmar-cita`
                : `${ruta}/cancelar-cita`;

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({
                id,
                estado: document.body.dataset.estado,
            }),
        });


        const data = await res.json();
        if (res.ok) {

            document.getElementById("mensaje").textContent =
                accion === "confirmar"
            if (accion === "confirmar") {
                document.getElementById("mensaje").textContent = "✅ Tu cita ha sido confirmada con éxito";
                //evitar que el usuario pueda devolverse a la pantalla de confirmar cita
                history.pushState(null, null, location.href);
                setTimeout(() => {
                    location.href = "/";
                }, 3000);

            } else {
                document.getElementById("mensaje").textContent = "❌ Tu cita ha sido cancelada";
                //evitar que el usuario pueda devolverse a la pantalla de confirmar cita
                history.pushState(null, null, location.href);
                setTimeout(() => {
                    location.href = "/";
                }, 3000);

            }

        } else {
            document.getElementById("mensaje").textContent =
                "⚠️ Hubo un problema: " + data.message;
        }
    } catch (error) {
        document.getElementById("mensaje").textContent =
            "⚠️ Error al conectar con el servidor";
    }
}

window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    fetch(`${ruta}/datos-usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ id }),
    })
        .then((res => res.json()))
        .then((data => {


            document.getElementById("cliente").textContent = data[0].nombre_usuario;
            document.getElementById("servicio").textContent = data[0].nombre_servicio;
            document.getElementById("fechaHora").textContent = data[0].fecha + " / " + data[0].hora;
            document.getElementById("precio").textContent = data[0].precio_servicio;
        }))



    if (id) {
        document
            .getElementById("btnConfirmar")
            .addEventListener("click", () =>
                actualizarCita(id, "confirmar"),
            );
        document
            .getElementById("btnCancelar")
            .addEventListener("click", () =>
                actualizarCita(id, "cancelar"),
            );
    } else {
        document.getElementById("mensaje").textContent = "⚠️ No se encontró el ID de la cita";
        document.getElementById("btnConfirmar").disabled = true;
        document.getElementById("cuerpo").classList.add("hidden")
        document.getElementById("btnCancelar").disabled = true;

    }
};