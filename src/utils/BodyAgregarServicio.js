import { ruta } from "../utils/ruta.js"
import { alertaMal } from "../assets/Alertas/Alertas";

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");


    if (id) {
        fetch(`${ruta}/api/tienda/catalogo/editar/vista`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const servicio = data.catalogo.find(servicio => servicio.id == id);

                    if (servicio) {
                        document.getElementById("service-name").value = servicio.nombre_servicio;
                        document.getElementById("service-price").value = servicio.precio;
                        document.getElementById("service-duration").value = servicio.duracion;
                        document.getElementById("service-desc").value = servicio.descripcion;
                        document.getElementById("foto1-preview").src = servicio.foto1;
                        document.getElementById("foto11-preview").src = servicio.foto1;
                        document.getElementById("foto2-preview").src = servicio.foto2;
                        document.getElementById("foto3-preview").src = servicio.foto3;
                        document.getElementById("service-name-preview").innerHTML = servicio.nombre_servicio;
                        document.getElementById("service-price-preview").innerHTML = servicio.precio;
                        document.getElementById("service-duration-preview").innerHTML = servicio.duracion + " min";
                        document.getElementById("service-description-preview").innerHTML = servicio.descripcion;
                    }
                }
            })
            .catch(error => console.error(error));
    }
}

const foto1 = document.getElementById("foto1")
const foto2 = document.getElementById("foto2")
const foto3 = document.getElementById("foto3")

//actualizacion en tiempo real 
let timer, timer1, timer2, timer3, timer4, timer5, timer6
//Nombre del servicio
const nombreServicio = document.getElementById("service-name")

nombreServicio.addEventListener("input", () => {
    clearTimeout(timer3)
    timer3 = setTimeout(() => {
        if (nombreServicio.value === "") {
            document.getElementById("service-name-preview").innerHTML = "Corte de Cabello Premium";
        } else {
            document.getElementById("service-name-preview").innerHTML = nombreServicio.value;
        }
    }, 1000);
})
//PRECIO 
const precioServicio = document.getElementById("service-price")

precioServicio.addEventListener("input", () => {
    clearTimeout(timer4)
    timer4 = setTimeout(() => {
        if (precioServicio.value === "") {
            document.getElementById("service-price-preview").innerHTML = "$0.000";
        } else {
            document.getElementById("service-price-preview").innerHTML = "$" + precioServicio.value;
        }
    }, 1000);
})

//Duracion
const duracionServicio = document.getElementById("service-duration")

duracionServicio.addEventListener("input", () => {
    clearTimeout(timer5)
    timer5 = setTimeout(() => {
        if (duracionServicio.value === "") {
            document.getElementById("service-duration-preview").innerHTML = "30 min";
        } else {
            document.getElementById("service-duration-preview").innerHTML = duracionServicio.value + " min";
        }
    }, 1000);
})

//descripcion
const descripcionServicio = document.getElementById("service-desc")

descripcionServicio.addEventListener("input", () => {
    clearTimeout(timer6)
    timer6 = setTimeout(() => {
        if (descripcionServicio.value === "") {
            document.getElementById("service-description-preview").innerHTML = "Descripción del servicio";
        } else {
            document.getElementById("service-description-preview").innerHTML = descripcionServicio.value;
        }
    }, 1000);
})

//foto1
foto1.addEventListener("change", () => {
    // console.log(foto1);

    clearTimeout(timer)
    timer = setTimeout(() => {
        if (foto1.value === "") {
            document.getElementById("foto1-preview").src = "https://lh3.googleusercontent.com/aida-public/AB6AXuAkUfUP1gFVo3HZO5Frp1_KHZCoUTa0GZqumL379y7Fl-ZQLq3_7ZMPoGiwAZaJHcNTxII_oEbBMscWjUr-A_J81RixbTjh5x6XHmhUht4JDo7N9jUyTb0clRF_2YmIYhEDd9i_lQxFREN8UhJ4A1125mKNQ3mLZRUoQbCih6KPMgQy8PhU6slk3-11Aap6VGhYYnmOl4WoHg4fGX5snW8eGU8GMWvL0BOUeOGGwDwZzWxEfmYP8yWZKsVo5L10EcKW3xnU5iltzQ";
        } else {
            document.getElementById("foto1-preview").src = URL.createObjectURL(foto1.files[0]);
            document.getElementById("foto11-preview").src = URL.createObjectURL(foto1.files[0]);
        }
    }, 1000);
});



//foto2
foto2.addEventListener("change", () => {
    clearTimeout(timer1)
    timer1 = setTimeout(() => {
        if (foto2.value === "") {
            document.getElementById("foto2-preview").src = "https://lh3.googleusercontent.com/aida-public/AB6AXuAkUfUP1gFVo3HZO5Frp1_KHZCoUTa0GZqumL379y7Fl-ZQLq3_7ZMPoGiwAZaJHcNTxII_oEbBMscWjUr-A_J81RixbTjh5x6XHmhUht4JDo7N9jUyTb0clRF_2YmIYhEDd9i_lQxFREN8UhJ4A1125mKNQ3mLZRUoQbCih6KPMgQy8PhU6slk3-11Aap6VGhYYnmOl4WoHg4fGX5snW8eGU8GMWvL0BOUeOGGwDwZzWxEfmYP8yWZKsVo5L10EcKW3xnU5iltzQ";
        } else {
            document.getElementById("foto2-preview").src = URL.createObjectURL(foto2.files[0]);

            //          console.log({ foto2, preview: URL.createObjectURL(foto2.files[0]) });
        }
    }, 1000);
});

//foto3
foto3.addEventListener("change", () => {
    clearTimeout(timer2)
    timer2 = setTimeout(() => {
        if (foto3.value === "") {
            document.getElementById("foto3-preview").src = "https://lh3.googleusercontent.com/aida-public/AB6AXuAkUfUP1gFVo3HZO5Frp1_KHZCoUTa0GZqumL379y7Fl-ZQLq3_7ZMPoGiwAZaJHcNTxII_oEbBMscWjUr-A_J81RixbTjh5x6XHmhUht4JDo7N9jUyTb0clRF_2YmIYhEDd9i_lQxFREN8UhJ4A1125mKNQ3mLZRUoQbCih6KPMgQy8PhU6slk3-11Aap6VGhYYnmOl4WoHg4fGX5snW8eGU8GMWvL0BOUeOGGwDwZzWxEfmYP8yWZKsVo5L10EcKW3xnU5iltzQ";
        } else {
            document.getElementById("foto3-preview").src = URL.createObjectURL(foto3.files[0]);

            //     console.log({ foto3, preview: URL.createObjectURL(foto3.files[0]) });
        }
    }, 1000);
});

//enviar datos al servidor

document.getElementById("guardarServicio").addEventListener("click", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idurl = urlParams.get("id");

    if (precioServicio.value === "" || nombreServicio.value === "" || duracionServicio.value === "" || descripcionServicio.value === "") {
        alertaMal("Por favor, ingrese todos los campos");
        return;
    }

    const formData = new FormData();
    if (idurl) {
        formData.append("idurl", idurl);
    }
    formData.append("userid", sessionStorage.getItem("Id"));
    formData.append("precio", precioServicio.value);
    formData.append("nombre", nombreServicio.value);
    formData.append("duracion", duracionServicio.value);
    formData.append("descripcion", descripcionServicio.value);
    if (foto1.files[0]) {
        formData.append("foto1", foto1.files[0]);
    }
    if (foto2.files[0]) {
        formData.append("foto2", foto2.files[0]);
    }
    if (foto3.files[0]) {
        formData.append("foto3", foto3.files[0]);
    }

    const loadingOverlay = document.getElementById("loading-overlay");
    loadingOverlay.classList.remove("hidden");
    loadingOverlay.classList.add("flex");

    fetch(`${ruta}/api/tienda/catalogo/guardar`, {
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
                window.location.href = "/TuPagina";
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