import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(ScrollTrigger, SplitText);
/**
 * Obtiene una instancia de SplitText de la caché o crea una nueva si no existe.
 * @param {Element|string} target - El elemento o selector
 * @param {Object} vars - Opciones para SplitText
 * @returns {SplitText}
 */

//abrir menu de inicio de sesion

document.querySelector("#btn-Iniciar").addEventListener("click", () => {
    document.location.href = "/";
})

document.querySelector("#btn-Iniciar2").addEventListener("click", () => {
    document.location.href = "/";
})



//Animaciones
// Elementos múltiples

const tl = gsap.timeline();
tl.from("#titulo", {
    duration: 1,
    filter: "blur(10px)",
    y: 20,
    stagger: {
        each: 0.1,
    },
    autoAlpha: 0,
    ease: "power3.out",
    onComplete: () => {
        tl.to("#titulo", {
            duration: 1,
            y: -20,
            repeat: -1,
            yoyo: true,
            stagger: {
                each: 0.1,
            },
            ease: "power3.out",
        }, "<0.5");
    }

})

tl.from("#parrafo", {
    duration: 1,
    x: -20,
    autoAlpha: 0,
    ease: "power3.out",

})

tl.from("#Iniciar", {
    duration: 1,
    y: 20,
    autoAlpha: 0,
    ease: "power3.out",
})

//mision visio
gsap.to("#caja1", {
    scrollTrigger: {
        trigger: "#caja1",
        start: "top 80%",
        end: "top 40%",
        scrub: true,
    },
    opacity: 1,
    x: 10,
    ease: "power3.out",

})
gsap.to("#caja2", {
    scrollTrigger: {
        trigger: "#caja2",
        start: "top 80%",
        end: "top 40%",
        scrub: true,
    },
    opacity: 1,
    x: -10,
    ease: "power3.out",

})
//Quienes Somos

gsap.to("#caja3", {
    scrollTrigger: {
        trigger: "#caja3",
        start: "top 50%",
        end: "top 20%",
        scrub: true,
        markers: false,
    },
    opacity: 1,

    ease: "power3.out",

})


gsap.to("#parrafo2", {
    scrollTrigger: {
        trigger: "#parrafo2",
        start: "top 80%",
        end: "top 20%",
        scrub: true,

    },
    opacity: 1,
    x: 10,
    ease: "power3.out",

})
gsap.to("#parrafo3", {
    scrollTrigger: {
        trigger: "#parrafo3",
        start: "top 80%",
        end: "top 20%",
        scrub: true,

    },
    opacity: 1,
    x: 10,
    ease: "power3.out",

})

gsap.to("#img", {
    scrollTrigger: {
        trigger: "#img",
        start: "center 70%",
        end: "center 40%",
        scrub: true,

    },
    opacity: 1,
    x: 10,
    ease: "power3.out",

})

//Nuestro impacto

gsap.to("#caja4", {
    scrollTrigger: {
        trigger: "#caja4",
        start: "top 40%",
        end: "top 10%",
        scrub: true,
    },
    opacity: 1,
    y: -10,
    ease: "power3.out",

})

gsap.to("#minBox1", {
    scrollTrigger: {
        trigger: "#minBox1",
        start: "top 60%",
        end: "top 30%",
        scrub: true,
    },
    opacity: 1,
    x: -10,
    ease: "power3.out",

})
gsap.to("#minBox2", {
    scrollTrigger: {
        trigger: "#minBox2",
        start: "top 60%",
        end: "top 30%",
        scrub: true,
    },
    opacity: 1,
    x: 10,
    ease: "power3.out",

})
gsap.to("#minBox3", {
    scrollTrigger: {
        trigger: "#minBox3",
        start: "top 50%",
        end: "top 10%",
        scrub: true,
    },
    opacity: 1,
    x: -10,
    ease: "power3.out",

})
gsap.to("#minBox4", {
    scrollTrigger: {
        trigger: "#minBox4",
        start: "top 50%",
        end: "top 10%",
        scrub: true,

    },
    opacity: 1,
    duration: 2,
    x: 10,
    ease: "power3.out",

})

gsap.to("#caja4", {
    scrollTrigger: {
        trigger: "#caja4",
        start: "top 50%",
        end: "top 10%",
        scrub: true,

    },
    opacity: 1,
    y: 10,
    ease: "power3.out",

})

gsap.to("#caja5", {
    scrollTrigger: {
        trigger: "#caja5",
        start: "top 50%",
        end: "top 10%",
        scrub: true,

    },
    opacity: 1,
    y: -10,
    ease: "power3.out",

})


