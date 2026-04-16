import { alertaCheck5, alertaFallo, alertaMal } from "../assets/Alertas/Alertas.js";
import { animar } from "../assets/Animaciones/animaRegSecion.js";
import { ruta } from "../utils/ruta.js";
import { validarInicioProfesional } from "./validarInicio.js";

validarInicioProfesional();
animar();

// --- VARIABLES Y ESTADO ---
let currentStep = 1;
const totalSteps = 6;
let map, marker;

// Selectores
const form = document.getElementById("registroNegocio");
const steps = document.querySelectorAll(".form-step");
const stepItems = document.querySelectorAll(".step-item");
const progressBar = document.getElementById("stepper-progress");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const btnSubmit = document.getElementById("btn-submit");

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    updateStepperUI();
});


// --- NAVEGACIÓN DEL STEPPER ---

function updateStepperUI() {
    // Actualizar Visibilidad de Pasos
    steps.forEach(step => {
        if (parseInt(step.dataset.step) === currentStep) {
            step.classList.remove("hidden");
            // Si entramos al paso del mapa, redibujarlo si ya existe
            if (currentStep === 2 && map) {
                setTimeout(() => {
                    map.invalidateSize();
                }, 100);
            } else if (currentStep === 2 && !map) {
                // Si no existe, inicializarlo
                setTimeout(initMap, 200);
            }
        } else {
            step.classList.add("hidden");
        }
    });

    // Actualizar Indicadores de Círculos
    stepItems.forEach(item => {
        const stepNum = parseInt(item.dataset.step);
        const circle = item.querySelector(".step-circle");
        const label = item.querySelector("span");

        if (stepNum === currentStep) {
            item.classList.add("active");
            circle.classList.replace("bg-gray-200", "bg-blue-500");
            circle.classList.replace("text-gray-404", "text-white");
            label.classList.replace("text-gray-500", "text-blue-500");
            label.classList.add("font-bold");
        } else if (stepNum < currentStep) {
            item.classList.remove("active");
            circle.classList.replace("bg-blue-500", "bg-green-500");
            circle.classList.replace("bg-gray-200", "bg-green-500");
            circle.classList.replace("text-gray-400", "text-white");
            label.classList.replace("text-blue-500", "text-green-600");
        } else {
            item.classList.remove("active");
            circle.classList.add("bg-gray-200");
            circle.classList.remove("bg-blue-500", "bg-green-500");
            circle.querySelector("span").classList.add("text-gray-400");
            label.classList.add("text-gray-500");
            label.classList.remove("text-blue-500", "text-green-600", "font-bold");
        }
    });

    // Actualizar Barra de Progreso
    const progressWidth = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressBar.style.width = `${progressWidth}%`;

    // Botones
    if (currentStep === 1) {
        btnPrev.classList.add("hidden");
    } else {
        btnPrev.classList.remove("hidden");
    }

    if (currentStep === totalSteps) {
        btnNext.classList.add("hidden");
        btnSubmit.classList.remove("hidden");
        updateSummary();
    } else {
        btnNext.classList.remove("hidden");
        btnSubmit.classList.add("hidden");
    }
}

function validateCurrentStep() {
    const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentStepEl.querySelectorAll("input[required], select[required], textarea[required]");
    let isValid = true;

    inputs.forEach(input => {
        if (!input.checkValidity()) {
            input.reportValidity();
            isValid = false;
        }
    });

    // Validaciones especiales por paso
    if (currentStep === 2) {
        const lat = document.getElementById("latitud").value;
        const lon = document.getElementById("longitud").value;

        console.log(lat, lon);

        if (!lat || !lon) {
            alertaMal("Por favor selecciona tu ubicación en el mapa");
            isValid = false;
        }
    }

    if (currentStep === 3) {
        const diasChecked = document.querySelectorAll('input[name="dias_trabajo"]:checked');
        if (diasChecked.length === 0) {
            alertaMal("Selecciona al menos un día de trabajo");
            isValid = false;
        }
    }

    return isValid;
}

btnNext.addEventListener("click", () => {
    if (validateCurrentStep()) {
        currentStep++;
        updateStepperUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

btnPrev.addEventListener("click", () => {
    currentStep--;
    updateStepperUI();
});

// --- CONTADOR DE CARACTERES ---
const descripcionText = document.getElementById("descripcion");
const charCount = document.getElementById("char-count");

descripcionText?.addEventListener("input", (e) => {
    const length = e.target.value.length;
    charCount.textContent = `${length} / 150`;
    if (length >= 140) charCount.classList.add("text-orange-500");
    else charCount.classList.remove("text-orange-500");
});

// --- LÓGICA DEL MAPA (Leaflet) ---

function initMap() {
    if (map) return;

    // Inicializar mapa (Centrado por defecto en Colombia si no hay ubicación)
    map = L.map('map').setView([4.5709, -74.2973], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Marker inicial
    marker = L.marker([4.5709, -74.2973], { draggable: true }).addTo(map);

    // Evento al mover el marcador
    marker.on('dragend', function (event) {
        const position = marker.getLatLng();
        updateCoords(position.lat, position.lng);
    });

    // Evento al hacer clic en el mapa
    map.on('click', function (e) {
        marker.setLatLng(e.latlng);
        updateCoords(e.latlng.lat, e.latlng.lng);
    });

    setupMapSearch();
}

function updateCoords(lat, lng) {
    document.getElementById("latitud").value = lat;
    document.getElementById("longitud").value = lng;
}

function setupMapSearch() {
    const searchInput = document.getElementById("search-location");
    const btnSearch = document.getElementById("btn-search-loc");
    const resultsList = document.getElementById("search-results");

    const performSearch = async () => {
        const query = searchInput.value;
        if (query.length < 3) return;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
            const data = await response.json();

            resultsList.innerHTML = "";
            if (data.length > 0) {
                resultsList.classList.remove("hidden");
                data.forEach(place => {
                    const li = document.createElement("li");
                    li.className = "p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 text-sm";
                    li.textContent = place.display_name;
                    li.addEventListener("click", () => {
                        const lat = parseFloat(place.lat);
                        const lon = parseFloat(place.lon);

                        map.setView([lat, lon], 16);
                        marker.setLatLng([lat, lon]);
                        updateCoords(lat, lon);

                        resultsList.classList.add("hidden");
                        searchInput.value = place.display_name;
                    });
                    resultsList.appendChild(li);
                });
            } else {
                resultsList.classList.add("hidden");
            }
        } catch (error) {
            console.error("Error buscando ubicación:", error);
        }
    };

    btnSearch.addEventListener("click", performSearch);

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            performSearch();
        }
    });

    // Cerrar resultados al hacer clic fuera
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !resultsList.contains(e.target)) {
            resultsList.classList.add("hidden");
        }
    });
}

// --- GESTIÓN DE IMÁGENES (Previews) ---
function setupImagePreview(inputId, previewId, placeholderId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const placeholder = document.getElementById(placeholderId);
    const dropzone = document.getElementById(`${inputId}-dropzone`);

    dropzone?.addEventListener("click", () => input.click());

    input?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                preview.src = event.target.result;
                preview.classList.remove("hidden");
                placeholder.classList.add("hidden");

                // Actualizar en resumen también
                if (inputId === "logo") document.getElementById("summary-logo").src = event.target.result;
                if (inputId === "banner") document.getElementById("summary-banner").style.backgroundImage = `url(${event.target.result})`;
            };
            reader.readAsDataURL(file);
        }
    });
}

setupImagePreview("logo", "logo-preview", "logo-placeholder");
setupImagePreview("banner", "banner-preview", "banner-placeholder");

// --- RESUMEN FINAL ---
function updateSummary() {
    const formData = new FormData(form);

    document.getElementById("summary-name").textContent = formData.get("nombre_establecimiento") || "Nombre del Negocio";
    document.getElementById("summary-address").textContent = formData.get("direccion") || "Dirección no especificada";
    document.getElementById("summary-phone").textContent = formData.get("telefono_establecimiento") || "Sin teléfono";
    document.getElementById("summary-description").textContent = formData.get("descripcion") ? `"${formData.get("descripcion")}"` : "Sin descripción.";

    const lat = formData.get("latitud");
    const lon = formData.get("longitud");


    if (lat && lon) {
        const locInfo = document.createElement("p");
        locInfo.className = "text-[10px] text-gray-400 mt-1";
        locInfo.textContent = `Coordenadas: ${parseFloat(lat).toFixed(4)}, ${parseFloat(lon).toFixed(4)}`;
        document.getElementById("summary-address").parentElement.appendChild(locInfo);
    }

    const tipo = formData.get("tipo_servicio");
    document.getElementById("summary-type").textContent = tipo === "estilista" ? "Estilista" : tipo === "barbero" ? "Barbería" : "Negocio";

    const precio = formData.get("precio") || "$ 0";
    document.getElementById("summary-price").textContent = precio;

    const interval = formData.get("intervaloCitas");
    const intervalText = interval < 60 ? `${interval} min` : `${interval / 60} hora(s)`;
    document.getElementById("summary-interval").textContent = intervalText;

    const inicio = formData.get("hora_inicio");
    const fin = formData.get("hora_fin");
    const dias = formData.getAll("dias_trabajo").join(", ");

    const format12h = (time24) => {
        if (!time24) return "";
        const [h, m] = time24.split(":");
        let hour = parseInt(h);
        const period = hour >= 12 ? "PM" : "AM";
        hour = hour > 12 ? hour - 12 : hour;
        if (hour === 0) hour = 12;
        return `${hour.toString().padStart(2, "0")}:${m} ${period}`;
    };

    const inicio12 = format12h(inicio);
    const fin12 = format12h(fin);

    document.getElementById("summary-hours").textContent = (inicio && fin) ? `${dias} / ${inicio12} - ${fin12}` : "Horario no definido";
}

// --- VALIDACIONES DE PRECIO Y HORA (Existentes) ---

const precioInput = document.getElementById('precio');

precioInput?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (Number(value) > 200000) value = '200000'; // Ajustado un poco el límite si es necesario

    const formatter = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    });

    if (value) {
        e.target.value = formatter.format(Number(value));
    } else {
        e.target.value = '';
    }
});

// --- CUSTOM TIME PICKER LOGIC ---

function setupCustomTimePicker(pickerId) {
    const picker = document.getElementById(pickerId);
    if (!picker) return;

    const btn = picker.querySelector('.time-display-btn');
    const dropdown = picker.querySelector('.time-dropdown');
    const input = picker.querySelector('input[type="hidden"]');
    const selectedText = picker.querySelector('.selected-text');
    const options = picker.querySelectorAll('.time-option');

    // Open/Close dropdown
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close other open pickers
        document.querySelectorAll('.time-dropdown.active').forEach(d => {
            if (d !== dropdown) {
                d.classList.remove('active');
                d.closest('.custom-time-picker').querySelector('.time-display-btn').classList.remove('active');
            }
        });

        btn.classList.toggle('active');
        dropdown.classList.toggle('active');
    });

    // Select option
    options.forEach(option => {
        option.addEventListener('click', () => {
            const val = option.dataset.value;
            const displayVal = option.dataset.display;

            input.value = val;
            selectedText.textContent = displayVal;
            selectedText.classList.remove('text-gray-400');
            selectedText.classList.add('text-gray-800', 'font-black');

            // UI feedback
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            // Close
            btn.classList.remove('active');
            dropdown.classList.remove('active');

            // Trigger validation
            validarHoras();

            // Hide error if selected
            const errorId = input.id === 'hora_inicio' ? 'hora-error' : 'hora-fin-error';
            const errorEl = document.getElementById(errorId);
            if (errorEl) {
                errorEl.classList.add('hidden');
                errorEl.classList.remove('flex');
            }
        });
    });
}

function validarHoras() {
    const horaInicio = document.getElementById('hora_inicio').value;
    const horaFin = document.getElementById('hora_fin').value;
    const errorFin = document.getElementById('hora-fin-error');

    if (horaInicio && horaFin) {
        if (horaFin <= horaInicio) {
            alertaMal('La hora de cierre debe ser posterior a la de apertura');
            if (errorFin) {
                errorFin.classList.remove('hidden');
                errorFin.classList.add('flex');
            }
            // Reset values
            const pickerFin = document.getElementById('picker-fin');
            const inputFin = document.getElementById('hora_fin');
            const textFin = pickerFin.querySelector('.selected-text');
            const optionsFin = pickerFin.querySelectorAll('.time-option');

            inputFin.value = "";
            textFin.textContent = "06:00 PM";
            textFin.classList.add('text-gray-400');
            textFin.classList.remove('font-black');
            optionsFin.forEach(opt => opt.classList.remove('selected'));
        } else {
            if (errorFin) {
                errorFin.classList.add('hidden');
                errorFin.classList.remove('flex');
            }
        }
    }
}

// Global click to close dropdowns
document.addEventListener('click', () => {
    document.querySelectorAll('.time-dropdown.active').forEach(d => d.classList.remove('active'));
    document.querySelectorAll('.time-display-btn.active').forEach(b => b.classList.remove('active'));
});

setupCustomTimePicker('picker-inicio');
setupCustomTimePicker('picker-fin');

// --- ENVÍO DE DATOS ---

form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userid = sessionStorage.getItem("Id");
    if (!userid) {
        alertaMal("Debes iniciar sesión");
        return;
    }

    const formData = new FormData(form);
    
    try {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="animate-spin material-symbols-outlined">sync</span> Registrando...`;

        // Obtener IP pública desde el front para asegurar que no sea ::1
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            formData.append("ip_frontend", ipData.ip);
        } catch (ipErr) {
            console.error("No se pudo obtener la IP pública:", ipErr);
            formData.append("ip_frontend", "0.0.0.0"); // Fallback
        }

        const response = await fetch(`${ruta}/registroNegocio`, {
            method: "POST",
            body: formData,
            credentials: 'include',
        });

        const data = await response.json();

        if (data.success) {
            alertaCheck5("¡Negocio registrado exitosamente!");
        } else {
            alertaFallo(data.message || "Error al registrar");
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `Registrar Negocio <span class="material-symbols-outlined ml-2">check_circle</span>`;
        }
    } catch (err) {
        console.error(err);
        alertaFallo("Error de conexión con el servidor");
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `Registrar Negocio <span class="material-symbols-outlined ml-2">check_circle</span>`;
    }
});

// Final initialization
updateStepperUI();

// --- LÓGICA MODAL TÉRMINOS PROFESIONALES ---
const modalTerminosProf = document.getElementById("modalTerminosProfesionales");
const checkAceptarProf = document.getElementById("checkAceptarTerminosProf");
const btnAceptarProf = document.getElementById("btnAceptarTerminosProf");

checkAceptarProf?.addEventListener("change", () => {
    if (btnAceptarProf) {
        btnAceptarProf.disabled = !checkAceptarProf.checked;
        if (checkAceptarProf.checked) {
            btnAceptarProf.classList.remove("opacity-50", "cursor-not-allowed");
        } else {
            btnAceptarProf.classList.add("opacity-50", "cursor-not-allowed");
        }
    }
});

btnAceptarProf?.addEventListener("click", () => {
    if (checkAceptarProf?.checked) {
        modalTerminosProf?.classList.add("hidden");
        // Opcional: Guardar en localStorage que ya aceptó en esta sesión
        sessionStorage.setItem("terminosProfesionalesAceptados", "true");
    }
});

// Asegurar que el modal se vea si no ha sido aceptado
if (sessionStorage.getItem("terminosProfesionalesAceptados") === "true") {
    modalTerminosProf?.classList.add("hidden");
}
