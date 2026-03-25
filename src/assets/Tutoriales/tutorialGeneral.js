import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { ruta } from "../../utils/ruta.js";

window.addEventListener("load", function () {
    window.tutorialGeneralPresente = true; // Señal para otros scripts
    fetch(`${ruta}/api/tour/general`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
    })
        .then((response) => response.json())
        .then((data) => {
            if (data === 0) {
                console.log(data);
                tutoGeneral();
            } else {
                window.dispatchEvent(new CustomEvent("tutorialTerminado"));
            }
        })
        .catch((error) => {
            console.error(error);
            window.dispatchEvent(new CustomEvent("tutorialTerminado"));
        });
});


function tutoGeneral() {
    let haTocadoElMenu = false;

    // Detectar clic en el botón de menú directamente
    const menuBtn = document.getElementById("menuToggle");

    const finalizarTutorial = () => {
        fetch(`${ruta}/api/tour/general/finalizado`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
        })
            .then((response) => response.json())
            .then(() => {
                window.dispatchEvent(new CustomEvent("tutorialTerminado"));
            })
            .catch((error) => {
                console.error("Error al finalizar tutorial:", error);
                window.dispatchEvent(new CustomEvent("tutorialTerminado"));
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
                popover: {
                    title: '<div class="flex items-center gap-2 text-blue-600"><span class="material-symbols-outlined">explore</span><span>¡Bienvenido a HoraLista!</span></div>',
                    description: 'Estamos encantados de tenerte. Vamos a darte un pequeño tour por las secciones principales para que empieces a gestionar tu negocio.',
                    side: "center",
                    align: 'center'
                }
            },
            {
                element: '#menuToggle',
                popover: {
                    title: '<div class="flex items-center gap-2 text-blue-600"><span class="material-symbols-outlined">menu</span><span>Menú Principal</span></div>',
                    description: 'Toca el ícono del menú para desplegar todas tus opciones de navegación. <b>Pruébalo ahora</b> para poder continuar.',
                    side: "bottom",
                    align: 'start',
                    onNextClick: () => {
                        if (!haTocadoElMenu) {
                            const popover = document.querySelector('.driver-popover-description');
                            if (popover && !popover.querySelector('.aviso-interaccion')) {
                                const aviso = document.createElement('div');
                                aviso.className = 'aviso-interaccion mt-3 p-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg animate-pulse';
                                aviso.innerHTML = '⚠️ <b>¡Oye!</b> Abre primero el menú lateral para continuar.';
                                popover.appendChild(aviso);
                                setTimeout(() => aviso.remove(), 1500);
                            }
                            return;
                        }
                        driverObj.moveNext();
                    }
                }
            },
            {
                element: '#PaginaPrincipal',
                popover: {
                    title: '<div class="flex items-center gap-2 text-blue-600"><span class="material-symbols-outlined">home</span><span>Inicio</span></div>',
                    description: 'Desde aquí volverás siempre a la pagina principal.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#Negocio',
                popover: {
                    title: '<div class="flex items-center gap-2 text-blue-600"><span class="material-symbols-outlined">dashboard</span><span>Panel de Negocio</span></div>',
                    description: 'Administra tus citas agendadas y visualiza el estado actual de tu jornada.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#VincularWhatsApp',
                popover: {
                    title: '<div class="flex items-center gap-2 text-green-600"><span class="material-symbols-outlined">chat</span><span>WhatsApp</span></div>',
                    description: 'Configura la vinculación con WhatsApp para enviar recordatorios automáticos a tus clientes.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#TuPagina',
                popover: {
                    title: '<div class="flex items-center gap-2 text-blue-600"><span class="material-symbols-outlined">web</span><span>Tu Página Pública</span></div>',
                    description: 'Personaliza cómo tus clientes ven tu negocio y el enlace que usarán para agendar.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#AgregarServicio',
                popover: {
                    title: '<div class="flex items-center gap-2 text-blue-600"><span class="material-symbols-outlined">add_circle</span><span>Servicios</span></div>',
                    description: 'Crea y edita los servicios que ofreces: precios, descripciones y duraciones.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#Settings',
                popover: {
                    title: '<div class="flex items-center gap-2 text-blue-600"><span class="material-symbols-outlined">settings</span><span>Ajustes</span></div>',
                    description: 'Ajusta tus horarios de trabajo, días festivos y la capacidad diaria de citas.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                popover: {
                    title: '<div class="flex items-center gap-2 text-green-600"><span class="material-symbols-outlined">check_circle</span><span>¡Listo para empezar!</span></div>',
                    description: 'Has completado el recorrido general. Explora cada sección para sacar el máximo provecho a tu herramientas.',

                }
            }
        ]
    });

    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            haTocadoElMenu = true;
            // Si el driver está activo y en el paso del menú (paso 1, índice 1)
            // Automáticamente avanzamos al siguiente
            if (driverObj.isActive() && driverObj.getActiveIndex() === 1) {
                driverObj.moveNext();
            }
        });
    }

    driverObj.drive();
}
