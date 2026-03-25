
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/dist/ScrollSmoother";


gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export function animacionPrinCliente() {

    gsap.from("#BodyPrinCliente", {
        opacity: 0,
        duration: 1.5,
        y: 30,
        ease: "power3.out",
    })

}