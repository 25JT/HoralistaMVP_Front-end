import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";




// Registrar plugins una vez al inicio
gsap.registerPlugin(ScrollTrigger);


// Revelar elementos
gsap.set(".gsap-reveal", { autoAlpha: 1 });

gsap.from("#titulo", {
    opacity: 0,
    duration: 1,
    y: -20,
    ease: "power3.out",
})
