import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { ruta } from "../../utils/ruta.js";

window.addEventListener("load", function () {

    fetch(`${ruta}/api/tour/ajustes`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
    })

        .then((response) => {
            return response.json();
        })
        .then((data) => {
            if (data === 0) {
                tutoAjustes()
            }
        })
        .catch((error) => {
            console.error(error);
        });



});

function tutoAjustes() {

    // Variable para rastrear si el usuario ha interactuado con el calendario
    let haTocadoDia = false;

    // Interceptamos la función global de clic en día para detectar interacción
    const interceptarClic = () => {
        const originalOnDayClick = window.onDayClick;
        window.onDayClick = function (...args) {
            haTocadoDia = true;
            if (typeof originalOnDayClick === "function") {
                originalOnDayClick(...args);
            }
        };
    };

    // Intentamos interceptar inmediatamente y también cuando el DOM cargue
    interceptarClic();
    document.addEventListener("DOMContentLoaded", interceptarClic);

    const finalizarTutorial = () => {
        fetch(`${ruta}/api/tour/ajustes/finalizado`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
        })
            .then((response) => response.json())
            .then((data) => {
                //     console.log("Tutorial finalizado:", data);
            })
            .catch((error) => {
                console.error("Error al finalizar tutorial:", error);
            });
    };

    const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: false,
        opacity: 0.75,
        stagePadding: 4,
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        doneBtnText: 'Finalizar',
        progressText: 'Paso {{current}} de {{total}}',
        showButtons: ['next', 'previous'],
        keyboardControl: false,
        onDestroyed: finalizarTutorial,
        steps: [
            {
                element: '#BodyAjustes',
                popover: {
                    title: '<div class="flex items-center gap-2 text-blue-600"><span class="material-symbols-outlined">settings</span><span>Tour Ajustes</span></div>',
                    description: 'Desde aquí puedes personalizar cómo tus clientes agendan citas: duración, horarios, días laborales y fechas especiales.',
                    side: "left",
                    align: 'start'
                }
            },
            {
                element: '#duracion-cita',
                popover: {
                    title: '<div class="flex items-center gap-2 text-blue-600"><span class="material-symbols-outlined">schedule</span><span>Duración de citas</span></div>',
                    description: 'Define el intervalo entre cada cita (30 min - 3 horas). Esto determinará la disponibilidad diaria para tus clientes.',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '#horario-jornada',
                popover: {
                    title: '<div class="flex items-center gap-2 text-blue-600"><span class="material-symbols-outlined">access_time</span><span>Horario de jornada</span></div>',
                    description: 'Establece tu hora de inicio y fin. Los cambios solo afectarán a las citas que se agenden de ahora en adelante.',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '#calendario-laboral',
                popover: {
                    title: '<div class="flex items-center gap-2 text-blue-600"><span class="material-symbols-outlined">calendar_month</span><span>Calendario laboral</span></div>',
                    description: 'Realiza ajustes puntuales: marca días como no laborables o habilita días especiales como domingos.',
                    side: "left",
                    align: 'start'
                }
            },
            {
                element: '#calendario-laboral',
                popover: {
                    title: '<div class="flex items-center gap-2 text-blue-600"><span class="material-symbols-outlined">touch_app</span><span>Interacción</span></div>',
                    description: 'Toca un día para cambiar su estado: <span class="text-blue-500 font-bold">Azul</span> para laborable y <span class="text-slate-400 font-bold">Gris</span> para no laborable.',
                    side: "bottom",
                    align: 'start',
                    onNextClick: () => {
                        if (!haTocadoDia) {
                            // Si no ha tocado un día, mostramos un aviso y evitamos avanzar
                            const popover = document.querySelector('.driver-popover-description');
                            if (popover) {
                                const aviso = document.createElement('div');
                                aviso.className = 'mt-3 p-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg animate-pulse';
                                aviso.innerHTML = '⚠️ <b>¡Oye!</b> Toca primero un día en el calendario antes de continuar.';
                                popover.appendChild(aviso);

                                // Remover el aviso después de unos segundos si no se interactúa
                                setTimeout(() => aviso.remove(), 4000);
                            }
                            return;
                        }
                        driverObj.moveNext();
                    }
                }
            },
            {
                element: '#seccion-capacidad',
                popover: {
                    title: '<div class="flex items-center gap-2 text-blue-600"><span class="material-symbols-outlined">tune</span><span>Capacidad específica</span></div>',
                    description: 'Ajusta la cantidad de citas y franjas para un día puntual si tu disponibilidad cambia.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#seccion-capacidad',
                popover: {
                    title: '<div class="flex items-center gap-2 text-amber-500"><span class="material-symbols-outlined">warning</span><span>¡Importante!</span></div>',
                    description: 'Si pones <b>0</b>, el sistema permitirá citas ilimitadas según tu horario. Si excedes el máximo, se ajustará automáticamente.',
                    side: "center",
                    align: 'center'
                }
            },
            {
                element: '#actualizar-dias',
                popover: {
                    title: '<div class="flex items-center gap-2 text-blue-600"><span class="material-symbols-outlined">event_repeat</span><span>Días habituales</span></div>',
                    description: 'Define qué días de la semana trabajas normalmente (ej: Lunes a Viernes).',
                    side: "left",
                    align: 'start'
                }
            },
            {
                element: '#btn-guardar',
                popover: {
                    title: '<div class="flex items-center gap-2 text-blue-600"><span class="material-symbols-outlined">save</span><span>Guardar cambios</span></div>',
                    description: 'No olvides guardar para aplicar la nueva configuración a tu agenda pública.',
                    side: "left",
                    align: 'start'
                }
            },
            {
                popover: {
                    title: '<div class="flex items-center gap-2 text-green-600"><span class="material-symbols-outlined">check_circle</span><span>¡Todo listo!</span></div>',
                    description: 'Tu agenda está lista para ser configurada. Si tienes dudas, aquí estaremos para ayudarte.'
                }
            }
        ]
    });




    driverObj.drive();
}
