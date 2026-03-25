import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const splitCache = new Map();

function getOrInitSplit(target, vars) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return null;
  if (splitCache.has(element)) return splitCache.get(element);
  const split = new SplitText(element, vars);
  splitCache.set(element, split);
  return split;
}

// Función Helper optimizada para móviles
function observarSeccion(elemento, callback) {
  if (!elemento) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Ejecutamos en el siguiente frame para no bloquear el scroll
        requestAnimationFrame(() => callback());
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px" // Un pequeño margen para evitar disparos accidentales
  });
  observer.observe(elemento);
}

// Ya no necesitamos pre-procesamiento agresivo
export function prepareAnimations() {
  // Solo configuramos visibilidad inicial sin procesar SplitText pesado
  gsap.set(".gsap-reveal", { autoAlpha: 1 });
}

// ===== SECCIÓN 0 (WELCOME) - INMEDIATA =====
export function animarTitulo() {
  const element = document.querySelector("#titulo");
  if (!element) return;
  
  // Lazy Split
  const splitText = getOrInitSplit(element, { type: "chars,words" });
  element.style.perspective = "1000px";
  
  gsap.from(splitText.chars, {
    duration: 1,
    y: 50,
    rotateX: -90,
    opacity: 0,
    stagger: 0.015, // Más rápido para móvil
    ease: "power3.out",
    willChange: "transform, opacity", // Aceleración hardware
    transformOrigin: "50% 100% -50",
  });

  // El brillo solo tras terminar la entrada para no saturar
  const shineTl = gsap.timeline({ repeat: -1, repeatDelay: 5, delay: 2 });
  shineTl.to(splitText.chars, {
    duration: 0.4,
    color: "#3b82f6",
    stagger: 0.03,
    ease: "power2.out",
  }).to(splitText.chars, {
    duration: 0.4,
    color: "inherit",
    stagger: 0.03,
    ease: "power2.in",
  }, "-=0.2");
}

export function animarParrafo() {
  const parrafo = document.querySelector("#parrafo");
  if (!parrafo) return;
  
  // Pequeño delay extra para esperar al título
  setTimeout(() => {
    const splitText = getOrInitSplit(parrafo, { type: "words,lines" });
    gsap.from(splitText.words, {
      duration: 0.7,
      opacity: 0,
      y: 15,
      stagger: 0.01,
      ease: "power2.out",
      willChange: "transform, opacity"
    });
  }, 400);
}

export function animarFormulario() {
  const form = document.querySelector("#animacionFormulario");
  if (!form) return;
  gsap.from(form, { 
    delay: 0.9, 
    duration: 0.8, 
    y: 20, 
    autoAlpha: 0, 
    ease: "power3.out",
    willChange: "transform, opacity"
  });
}

// ===== SECCIÓN 2 (CARACTERÍSTICAS) =====
export function animarTitulo2() {
  const titulo = document.querySelector("#titulo2");
  observarSeccion(titulo, () => {
    const splitText = getOrInitSplit(titulo, { type: "chars" });
    gsap.from(splitText.chars, { 
      duration: 0.5, 
      y: 20, 
      scale: 0.8, 
      opacity: 0, 
      stagger: 0.02, 
      ease: "back.out(1.2)",
      willChange: "transform, opacity"
    });
  });
}

export function animarParrafo2() {
  const p = document.querySelector("#parrafo2");
  observarSeccion(p, () => {
    const splitText = getOrInitSplit(p, { type: "words" });
    gsap.from(splitText.words, { 
      duration: 0.5, 
      opacity: 0, 
      y: 10, 
      stagger: 0.015, 
      ease: "power2.out",
      willChange: "transform, opacity"
    });
  });
}

export function animarControlCitas() {
  const grid = document.querySelector("#controlCitas");
  observarSeccion(grid, () => {
    gsap.from(grid.children, { 
      duration: 0.5, 
      y: 30, 
      opacity: 0, 
      stagger: 0.05, 
      ease: "power2.out",
      willChange: "transform, opacity"
    });
  });
}

// ===== SECCIÓN 3 (PASOS) =====
export function animarTitulo3() {
  const titulo = document.querySelector("#titulo3");
  observarSeccion(titulo, () => {
    const splitText = getOrInitSplit(titulo, { type: "chars" });
    gsap.from(splitText.chars, { duration: 0.4, y: -10, opacity: 0, stagger: 0.015, ease: "power2.out" });
  });
}

export function miniTitulo() {
  document.querySelectorAll("#miniTitulo").forEach(el => {
    observarSeccion(el, () => {
      const splitText = getOrInitSplit(el, { type: "words" });
      gsap.from(splitText.words, { duration: 0.4, x: -10, opacity: 0, stagger: 0.015, ease: "power2.out" });
    });
  });
}

export function animarParrafo3() {
  document.querySelectorAll("#parrafo3").forEach(el => {
    observarSeccion(el, () => {
      const splitText = getOrInitSplit(el, { type: "words" });
      gsap.from(splitText.words, { duration: 0.4, x: 10, opacity: 0, stagger: 0.015, ease: "power2.out" });
    });
  });
}

export function Rounded() {
  const rounded = document.querySelector("#rounded");
  if (!rounded) return;
  observarSeccion(rounded, () => {
    const elements = [rounded, document.querySelector("#rounded2"), document.querySelector("#rounded3")].filter(Boolean);
    gsap.from(elements, { duration: 0.5, autoAlpha: 0, scale: 0.5, stagger: 0.1, ease: "back.out(1.5)" });
    elements.forEach((el, index) => {
      if (el) gsap.to(el, { duration: 3, rotateY: 360, repeat: -1, ease: "power1.inOut", delay: index * 0.1 });
    });
  });
}

// ===== SECCIÓN 4 (CTA FINAL) =====
export function animarParrafo4() {
  const cta = document.querySelector("#ctaFinal");
  observarSeccion(cta, () => {
    const splitText = getOrInitSplit(cta, { type: "words" });
    gsap.from(splitText.words, { duration: 0.5, y: 15, opacity: 0, stagger: 0.015, ease: "power2.out" });
  });
}