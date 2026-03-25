import { alertaCheck5, alertaFallo, alertaMal } from "../assets/Alertas/Alertas.js";
import { animar } from "../assets/Animaciones/animaRegSecion.js";
import { ruta } from "../utils/ruta.js";
import { validarInicioProfesional } from "./validarInicio.js";

validarInicioProfesional();
animar();

// --- VARIABLES Y ESTADO ---
let currentStep = 1;
const totalSteps = 5;

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
    document.getElementById("summary-hours").textContent = (inicio && fin) ? `${dias} / ${inicio} - ${fin}` : "Horario no definido";
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

function validarHoraEnPunto(inputElement, errorElementId) {
    if (!inputElement) return;
    const horaInput = inputElement.value;
    if (!horaInput) return;
    const minutos = horaInput.split(':')[1];
    const errorElement = document.getElementById(errorElementId);

    if (minutos !== '00') {
        errorElement?.classList.remove('hidden');
        inputElement.setCustomValidity('La hora debe ser en punto (minutos :00)');
    } else {
        errorElement?.classList.add('hidden');
        inputElement.setCustomValidity('');
    }
}

document.getElementById('hora_inicio')?.addEventListener('change', function () {
    validarHoraEnPunto(this, 'hora-error');
});

document.getElementById('hora_fin')?.addEventListener('change', function () {
    validarHoraEnPunto(this, 'hora-fin-error');

    const horaInicio = document.getElementById('hora_inicio').value;
    const horaFin = this.value;

    if (horaInicio && horaFin && horaFin <= horaInicio) {
        alertaMal('La hora final debe ser posterior a la hora de inicio');
        this.value = '';
    }
});

// --- ENVÍO DE DATOS ---

form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userid = sessionStorage.getItem("Id");
    if (!userid) {
        alertaMal("Debes iniciar sesión");
        return;
    }

    const formData = new FormData(form);
    // Agregamos el userID al formData
    // formData.append("userid", userid); // El backend lo toma de la sesión, pero por si acaso


    try {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="animate-spin material-symbols-outlined">sync</span> Registrando...`;

        const response = await fetch(`${ruta}/registroNegocio`, {
            method: "POST",
            body: formData, // Enviamos FormData directamente (sin JSON.stringify)
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
