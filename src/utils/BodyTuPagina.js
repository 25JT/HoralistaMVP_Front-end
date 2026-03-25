import { ruta } from "../utils/ruta.js"
import { alertaMal, alertaCheckReload } from "../assets/Alertas/Alertas";

const tituloTienda = document.getElementById("shop-name");
const direccionTienda = document.getElementById("shop-address");
const descripcionTienda = document.getElementById("shop-desc");
const logoTienda = document.getElementById("logo");
const bannerTienda = document.getElementById("banner");
const telefonoTienda = document.getElementById("shop-phone");

//cargar la pagina si la persona tiene negocio como veria la pespectiva si no cargara los default
window.onload = () => {
    fetch(`${ruta}/api/tienda/identidad`, {
        method: "GET",
        credentials: "include"

    })
        //si hay data sera enviada al las id
        .then(response => response.json())
        .then(data => {
            if (data.rows[0] === null) {


                tituloTienda.value = "";
                direccionTienda.value = "";
                descripcionTienda.value = "";

            } else {
                if (data.rows[0].logo === null) {
                    document.getElementById("logo-preview").src = "https://lh3.googleusercontent.com/aida-public/AB6AXuAkUfUP1gFVo3HZO5Frp1_KHZCoUTa0GZqumL379y7Fl-ZQLq3_7ZMPoGiwAZaJHcNTxII_oEbBMscWjUr-A_J81RixbTjh5x6XHmhUht4JDo7N9jUyTb0clRF_2YmIYhEDd9i_lQxFREN8UhJ4A1125mKNQ3mLZRUoQbCih6KPMgQy8PhU6slk3-11Aap6VGhYYnmOl4WoHg4fGX5snW8eGU8GMWvL0BOUeOGGwDwZzWxEfmYP8yWZKsVo5L10EcKW3xnU5iltzQ";
                } else {
                    document.getElementById("logo-preview").src = data.rows[0].logo;
                }
                if (data.rows[0].banner === null) {
                    document.getElementById("banner-preview").src = "https://lh3.googleusercontent.com/aida-public/AB6AXuBP-IMlDIqaNWrsjUTT4z4uoMdE5j4mSuNVCrwrmBGp4iuilA40aDI97VJb2XwPk0IsZst4sBxWFUjQolVaudL1hdsnSBEl0yD4j0jo_ncrOeA0ZqPtI8uFu0PIV4iIbgwhq45pprUMBAYIAg7vJ9bb1Oy1zQ9cL5HNu9xSPvMVOOCnHKg7oHGV8CxWBBTGsdPhq-s8-RE6ZayXx674YgXAx9B8kH7rhwAN84ymtVrsmZBQZUO2IpOgJc8-4EcJp3anG4_cg6RJTw";
                } else {
                    document.getElementById("banner-preview").src = data.rows[0].banner;
                }

                document.getElementById("shop-name").value = data.rows[0].nombre_establecimiento;
                document.getElementById("shop-address").value = data.rows[0].direccion;
                document.getElementById("shop-desc").value = data.rows[0].descripcion;
                document.getElementById("shop-phone").value = data.rows[0].telefono_establecimiento || "";
                document.getElementById("shop-name-preview").innerHTML = data.rows[0].nombre_establecimiento;
                document.getElementById("location-preview").innerHTML = data.rows[0].direccion;
                document.getElementById("description-preview").innerHTML = data.rows[0].descripcion;
                document.getElementById("phone-preview").innerHTML = data.rows[0].telefono_establecimiento || "+57 000 000 0000";



            }
        })

        .catch(error => console.error("Error al cargar la pagina", error));

    ObtenerServicio();
}

//actualizacion en tiempo real 
let timer, timer1, timer2, timer3, timer4, timer5
//titulo tienda
tituloTienda.addEventListener("input", () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
        if (tituloTienda.value === "") {
            document.getElementById("shop-name-preview").innerHTML = "Hora Lista";
        } else {
            document.getElementById("shop-name-preview").innerHTML = tituloTienda.value;

            //         console.log({ tituloTienda, preview: tituloTienda.value });
        }
    }, 1000);
});
//direccion de la tienda
direccionTienda.addEventListener("input", () => {
    clearTimeout(timer1)
    timer1 = setTimeout(() => {
        if (direccionTienda.value === "") {
            document.getElementById("location-preview").innerHTML = "Calle de la Innovación 25, Colombia";
        } else {
            document.getElementById("location-preview").innerHTML = direccionTienda.value;

            //     console.log({ direccionTienda, preview: direccionTienda.value });
        }
    }, 1000);
});

//descripcion de la tienda
descripcionTienda.addEventListener("input", () => {
    clearTimeout(timer2)
    timer2 = setTimeout(() => {
        if (descripcionTienda.value === "") {
            document.getElementById("description-preview").innerHTML = "Optimiza tu tiempo y elimina las perdidas. Concéntrate en lo que más importa y deja que HoraLista se encargue de tu agenda.";
        } else {
            document.getElementById("description-preview").innerHTML = descripcionTienda.value;

            //   console.log({ descripcionTienda, preview: descripcionTienda.value });
        }
    }, 1000);
});

//telefono de la tienda
telefonoTienda.addEventListener("input", () => {
    clearTimeout(timer5)
    timer5 = setTimeout(() => {
        if (telefonoTienda.value === "") {
            document.getElementById("phone-preview").innerHTML = "+57 000 000 0000";
        } else {
            document.getElementById("phone-preview").innerHTML = telefonoTienda.value;

            //       console.log({ telefonoTienda, preview: telefonoTienda.value });
        }
    }, 1000);
});

//logoTienda Img
logoTienda.addEventListener("change", () => {
    clearTimeout(timer3)
        ;

    if (!logoTienda.files[0]) {
        document.getElementById("logo-preview").src = "https://lh3.googleusercontent.com/aida-public/AB6AXuAkUfUP1gFVo3HZO5Frp1_KHZCoUTa0GZqumL379y7Fl-ZQLq3_7ZMPoGiwAZaJHcNTxII_oEbBMscWjUr-A_J81RixbTjh5x6XHmhUht4JDo7N9jUyTb0clRF_2YmIYhEDd9i_lQxFREN8UhJ4A1125mKNQ3mLZRUoQbCih6KPMgQy8PhU6slk3-11Aap6VGhYYnmOl4WoHg4fGX5snW8eGU8GMWvL0BOUeOGGwDwZzWxEfmYP8yWZKsVo5L10EcKW3xnU5iltzQ";
        return;
    }

    document.getElementById("logo-preview").src = URL.createObjectURL(logoTienda.files[0]);

    //  console.log({ logoTienda, preview: URL.createObjectURL(logoTienda.files[0]) });


});
//Banner de la tienda Img

bannerTienda.addEventListener("change", () => {
    clearTimeout(timer4)

    const file = bannerTienda.files[0];

    if (!file) {
        document.getElementById("banner-preview").src = "https://lh3.googleusercontent.com/aida-public/AB6AXuBP-IMlDIqaNWrsjUTT4z4uoMdE5j4mSuNVCrwrmBGp4iuilA40aDI97VJb2XwPk0IsZst4sBxWFUjQolVaudL1hdsnSBEl0yD4j0jo_ncrOeA0ZqPtI8uFu0PIV4iIbgwhq45pprUMBAYIAg7vJ9bb1Oy1zQ9cL5HNu9xSPvMVOOCnHKg7oHGV8CxWBBTGsdPhq-s8-RE6ZayXx674YgXAx9B8kH7rhwAN84ymtVrsmZBQZUO2IpOgJc8-4EcJp3anG4_cg6RJTw";
        return;
    }

    document.getElementById("banner-preview").src = URL.createObjectURL(file);

    //  console.log({ file, preview: URL.createObjectURL(file) });

});

//Guardar cambio 
document.getElementById("btn-guardar-cambios").addEventListener("click", () => {

    if (tituloTienda.value === "" || direccionTienda.value === "" || descripcionTienda.value === "") {
        alertaMal("Todos los campos son obligatorios");
        return;
    }
    const logo = logoTienda.files[0] ? URL.createObjectURL(logoTienda.files[0]) : null;
    const banner = bannerTienda.files[0] ? URL.createObjectURL(bannerTienda.files[0]) : null;
    // Preparamos el FormData
    const formData = new FormData();
    formData.append("userid", sessionStorage.getItem("Id"));
    formData.append("tituloTienda", tituloTienda.value);
    formData.append("direccionTienda", direccionTienda.value);
    formData.append("descripcionTienda", descripcionTienda.value);
    formData.append("telefonoTienda", telefonoTienda.value);

    // Añadimos los archivos reales (logoTienda.files[0]), no el blob URL
    if (logoTienda.files[0]) {
        formData.append("logo", logoTienda.files[0]);
    }
    if (bannerTienda.files[0]) {
        formData.append("banner", bannerTienda.files[0]);
    }

    console.log(formData);

    const loadingOverlay = document.getElementById("loading-overlay");
    loadingOverlay.classList.remove("hidden");
    loadingOverlay.classList.add("flex");

    fetch(`${ruta}/api/tienda/identidad/guardar`, {
        method: "POST",
        credentials: "include",
        body: formData
    })
        .then(response => {
            if (response.status === 200 || response.status === 500) {
                return response.json();
            }
            throw new Error("Respuesta inesperada");
        })
        .then(data => {
            if (data.success || data.status === "ok") {
                window.location.reload();
            } else {
                loadingOverlay.classList.add("hidden");
                loadingOverlay.classList.remove("flex");
                alertaMal(data.message || "Error al guardar");
            }
        })
        .catch(error => {
            console.error(error);
            loadingOverlay.classList.add("hidden");
            loadingOverlay.classList.remove("flex");
            window.location.reload();
        });
})

//Crea Servicio

function ObtenerServicio() {
    const container = document.getElementById("catalogo-container");
    fetch(`${ruta}/api/tienda/catalogo/obtener`, {
        method: "GET",
        credentials: "include"
    })
        .then(response => {
            if (response.status === 200 || response.status === 500) {
                return response.json();
            }
            throw new Error("Respuesta inesperada");
        })
        .then(data => {
            if (data.success && data.catalogo && data.catalogo.length > 0) {
                container.innerHTML = ""; // Limpiar contenedor

                data.catalogo.forEach(servicio => {
                    const card = document.createElement("div");
                    card.className = "rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-primary/20 hover:shadow-md";
                    card.innerHTML = `
                        <div class="flex flex-col sm:flex-row gap-4">
                            <div class="border-2 border-slate-200 w-full sm:size-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 aspect-video sm:aspect-square">
                                <img
                                    alt="Service"
                                    class="size-full object-cover"
                                    src="${servicio.foto1 || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkUfUP1gFVo3HZO5Frp1_KHZCoUTa0GZqumL379y7Fl-ZQLq3_7ZMPoGiwAZaJHcNTxII_oEbBMscWjUr-A_J81RixbTjh5x6XHmhUht4JDo7N9jUyTb0clRF_2YmIYhEDd9i_lQxFREN8UhJ4A1125mKNQ3mLZRUoQbCih6KPMgQy8PhU6slk3-11Aap6VGhYYnmOl4WoHg4fGX5snW8eGU8GMWvL0BOUeOGGwDwZzWxEfmYP8yWZKsVo5L10EcKW3xnU5iltzQ'}"
                                />
                            </div>
                            <div class="flex flex-1 flex-col gap-3">
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div class="flex flex-col gap-1">
                                        <label class="text-[10px] font-bold uppercase text-slate-400">Servicio</label>
                                        <input
                                            class="w-full border-none p-0 text-sm font-semibold text-slate-800 focus:ring-0 bg-transparent"
                                            type="text"
                                            readonly
                                            value="${servicio.nombre_servicio}"
                                        />
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <label class="text-[10px] font-bold uppercase text-slate-400">Precio ($)</label>
                                        <input
                                            class="w-full border-none p-0 text-sm font-semibold text-slate-800 focus:ring-0 bg-transparent"
                                            type="text"
                                            readonly
                                            value="${servicio.precio}"
                                        />
                                    </div>
                                </div>
                                <div class="flex items-center justify-between border-t border-slate-50 pt-2 sm:border-0 sm:pt-0">
                                    <div class="flex flex-col gap-1">
                                        <label class="text-[10px] font-bold uppercase text-slate-400">Duración</label>
                                        <span class="text-sm text-slate-600 font-medium">${servicio.duracion} min</span>
                                    </div>
                                    <div class="flex gap-2">
                                        <button id="edit-servicio-${servicio.id}" class="flex size-9 items-center justify-center rounded-lg border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-primary transition-colors">
                                            <span class="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button id="delete-servicio-${servicio.id}" class="flex size-9 items-center justify-center rounded-lg border border-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                                            <span class="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    container.appendChild(card);
                });


                data.catalogo.forEach(servicio => {

                    //eliminar servicio
                    const deleteButton = document.getElementById(`delete-servicio-${servicio.id}`);
                    deleteButton.addEventListener("click", () => {
                        fetch(`${ruta}/api/tienda/catalogo/eliminar`, {
                            method: "DELETE",
                            credentials: "include",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                id: servicio.id

                            })
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


                                    alertaCheckReload(data.message)


                                } else {
                                    alertaMal(data.message || "Error al guardar");
                                }
                            })
                            .catch(error => {
                                console.error(error);
                            });
                    });


                    //editar 
                    const editButton = document.getElementById(`edit-servicio-${servicio.id}`);
                    editButton.addEventListener("click", () => {
                        window.location.href = `/AgregarServicio?id=${servicio.id}`;
                    });
                });
            } else {
                container.innerHTML = ""; // Asegurar que no aparezca nada si no hay servicios
            }
        })
        .catch(error => {
            console.error(error);
        });
}

document.getElementById("AñadirCita").addEventListener("click", validarCantidadCitas);

//Validar cantidad de servicios
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

            if (data.success) {


                if (data.cantidadServicios >= 6) {
                    alertaMal("No puedes agregar más de 6 servicios");
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

