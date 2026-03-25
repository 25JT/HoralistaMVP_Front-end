// AjustesCapacidadDia.js
// Lógica para manejar la capacidad de citas por día y franjas horarias
import { alertaCheck, alertaFallo, alertaMal } from "../assets/Alertas/Alertas.js";
import { ruta } from "./ruta.js";
(function () {
    let diasSeleccionados = [];
    const franjasHorarias = {
        manana: { inicio: "08:00", fin: "12:00" },
        tarde: { inicio: "14:00", fin: "18:00" },
        noche: { inicio: "18:00", fin: "22:00" },
        personalizada: { inicio: "", fin: "" }
    };

    function init() {
        const selectFranja = document.getElementById("select-franja");
        const seccionHorariosPerso = document.getElementById("horarios-personalizados");

        if (selectFranja) {
            selectFranja.addEventListener("change", (e) => {
                if (e.target.value === "personalizada") {
                    seccionHorariosPerso.classList.remove("hidden");
                    seccionHorariosPerso.classList.add("grid");
                } else {
                    seccionHorariosPerso.classList.add("hidden");
                    seccionHorariosPerso.classList.remove("grid");
                }
            });
        }
    }

    // Esta función es llamada desde Ajustes.js
    window.onDayClick = function (dia, mes, anio, esLaborable) {
        const fechaClave = `${anio}-${mes + 1}-${dia}`;

        if (esLaborable) {
            if (!diasSeleccionados.includes(fechaClave)) {
                diasSeleccionados.push(fechaClave);
            }
        } else {
            diasSeleccionados = diasSeleccionados.filter(f => f !== fechaClave);
        }

        actualizarUI();
    };

    function actualizarUI() {
        const seccion = document.getElementById("seccion-capacidad");
        const textoDias = document.getElementById("dias-seleccionados-texto");

        if (diasSeleccionados.length > 0) {
            seccion.classList.remove("hidden");
            // Efecto de entrada suave
            setTimeout(() => {
                seccion.classList.remove("scale-95", "opacity-0");
                seccion.classList.add("scale-100", "opacity-100");
            }, 10);

            textoDias.textContent = diasSeleccionados.length > 3
                ? `${diasSeleccionados.length} días seleccionados`
                : diasSeleccionados.join(", ");
        } else {
            seccion.classList.add("scale-95", "opacity-0");
            setTimeout(() => {
                seccion.classList.add("hidden");
            }, 300);
        }
    }

    window.obtenerPromesasCapacidad = function () {
        if (diasSeleccionados.length === 0) return [];

        const franja = document.getElementById("select-franja").value;
        const totalCitas = document.getElementById("cantidad-citas").value;
        const hInicioPerso = document.getElementById("capacidad-hora-inicio").value;
        const hFinPerso = document.getElementById("capacidad-hora-fin").value;

        const userid = sessionStorage.getItem("Id");
        const pservicioId = sessionStorage.getItem("pservicioId") || "N/A";

        //  console.log("%c--- LOG DE ACTUALIZACIÓN DE CAPACIDAD ---", "color: #3b82f6; font-weight: bold;");

        return diasSeleccionados.map(fecha => {
            const info = {
                id_usuario: userid,
                fecha: fecha,
                total_citas: totalCitas,
                franja: franja,
                hora_inicio: franja === 'personalizada' ? hInicioPerso : franjasHorarias[franja].inicio,
                hora_fin: franja === 'personalizada' ? hFinPerso : franjasHorarias[franja].fin,
                activo: 1
            };

            //     console.log("Procesando capacidad para:", fecha, info);

            return fetch(`${ruta}/api/actualizarCapacidadDia`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(info),
            })
                .then(res => res.json())
                .then(data => ({ type: `Capacidad (${fecha})`, ...data }))
                .catch(err => ({ type: `Capacidad (${fecha})`, success: false, message: err.message }));
        });
    };

    // Inicializar cuando el DOM esté listo
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
