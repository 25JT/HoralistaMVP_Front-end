import { ruta } from "./ruta.js";
import { alertaFallo } from "../assets/Alertas/Alertas.js";



window.onload = () => {

  const urlParams = window.location.pathname.split('/');
  const idurl = urlParams[urlParams.length - 1];



  if (!idurl) {
    alertaFallo("No se pudo obtener el id del servicio");
    return;
  }

  const loader = document.getElementById("loader-catalogo");
  if (loader) loader.classList.remove("hidden");

  fetch(`${ruta}/catalogo/vista/usuario/${idurl}`, { credentials: 'include' })
    .then((response) => response.json())
    .then((data) => {
      if (loader) loader.classList.add("hidden");

      if (!data.success) {
        console.error("Error en respuesta:", data.message);
        alertaFallo("No se pudieron cargar los servicios");
        return;
      }

      if (data.data.length === 0) {
        alertaFallo("No se encontraron servicios");
        return;
      }

      renderizarServicios(data);
    })
    .catch((error) => {
      if (loader) loader.classList.add("hidden");
      console.error("Error al obtener datos:", error);
    });

}
function renderizarServicios(data) {
  const container = document.querySelector(".card-grid");
  container.innerHTML = "";

  data.data.forEach((servicio) => {

    const card = document.createElement("div");
    card.className = "bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all group";
    card.innerHTML = `
        <!-- Carrusel -->
        <div class="relative h-64 overflow-hidden cursor-pointer group/img">
          <div class="carousel-images flex transition-transform duration-500 h-full">
            <div class="w-full h-full flex-shrink-0 overflow-hidden">
              <img
                src="${servicio.foto1}"
                class="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                onclick="window.abrirLightbox('${servicio.foto1}')"
              />
            </div>
            <div class="w-full h-full flex-shrink-0 overflow-hidden">
              <img
                src="${servicio.foto2}"
                class="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                onclick="window.abrirLightbox('${servicio.foto2}')"
              />
            </div>
            <div class="w-full h-full flex-shrink-0 overflow-hidden">
              <img
                src="${servicio.foto3}"
                class="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                onclick="window.abrirLightbox('${servicio.foto3}')"
              />
            </div>
          </div>

          <!-- Botones -->
          <button
            class="prev absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 px-2 rounded"
            >‹</button
          >
          <button
            class="next absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 px-2 rounded"
            >›</button
          >
        </div>

        <!-- Contenido -->
        <div class="p-6">
          <h3
            class="italic text-xl font-bold mb-2 group-hover:text-primary transition-colors"
          >
            ${servicio.nombre_servicio}
          </h3>

          <p class="text-slate-500 text-sm mb-6 line-clamp-2">
            ${servicio.descripcion}
          </p>

          <div class="flex items-center justify-between border-t border-gray-200" >
            <div class="flex flex-col  ">
              <span class="text-lg font-bold text-slate-900 italic "> $ ${servicio.precio}</span>
              <div class="flex items-center text-xs text-slate-400 font-medium">
              <span class="material-symbols-outlined text-sm mr-1">schedule</span>
                ${servicio.duracion} min
              </div>
            </div>

            <button
              class="btn-reservar bg-primary hover:bg-primary/90 text-black px-6 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              Reservar
            </button>
          </div>
        </div>
      `;
    container.appendChild(card);

    // Flechas para cambio de imagenes (solo para esta card)
    const carouselImages = card.querySelector(".carousel-images");
    const nextBtn = card.querySelector(".next");
    const prevBtn = card.querySelector(".prev");

    if (carouselImages && nextBtn && prevBtn) {
      let index = 0;
      const slides = carouselImages.children;

      nextBtn.onclick = (e) => {
        e.stopPropagation();
        index = (index + 1) % slides.length;
        carouselImages.style.transform = `translateX(-${index * 100}%)`;
      };

      prevBtn.onclick = (e) => {
        e.stopPropagation();
        index = (index - 1 + slides.length) % slides.length;
        carouselImages.style.transform = `translateX(-${index * 100}%)`;
      };
    }

    // Event listener para reservar (buscando en la card actual)
    const btnReservar = card.querySelector(".btn-reservar");
    if (btnReservar) {
      btnReservar.addEventListener("click", () => {
        sessionStorage.removeItem("editCitaId");
        // sessionStorage.setItem("id_pservicio", servicio.id_pservicio); // No longer strictly needed for timing
        // sessionStorage.setItem("id", servicio.id); // Replaced by URL param
        // sessionStorage.setItem("nombre_servicio", servicio.nombre_servicio); // Eliminado para no tener datos pegajosos
        window.location.href = `/Agendar/${servicio.id_pservicio}?s=${servicio.id}`;
      });
    }
  });

}

// --- Lógica del Lightbox ---
window.abrirLightbox = (src) => {
  const lightboxHTML = `
    <div id="lightbox" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in" onclick="window.cerrarLightbox()">
      <div class="relative max-w-5xl w-full h-full flex items-center justify-center">
        <button class="absolute top-4 right-4 text-white hover:text-primary transition-colors z-[110]">
          <span class="material-symbols-outlined text-4xl">close</span>
        </button>
        <img src="${src}" class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" onclick="event.stopPropagation()" />
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", lightboxHTML);
  document.body.style.overflow = "hidden"; // Prevenir scroll
};

window.cerrarLightbox = () => {
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    lightbox.remove();
    document.body.style.overflow = "auto";
  }
};

//boton regresar
const btnRegresar = document.getElementById("btn-regresar");
btnRegresar.addEventListener("click", () => {
  window.location.href = "/PrincipalCliente";
});