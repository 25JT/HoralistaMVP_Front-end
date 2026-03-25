import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/dist/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export function animar() {

  document.addEventListener("DOMContentLoaded", () => {
    gsap.from("#registroNegocio", {
      delay: 0.5,
      opacity: 0,
      y: -50,
      duration: 1.5,
      ease: "power2.out",

    });
  });

  document.addEventListener("DOMContentLoaded", () => {
    // Esperar a que las fuentes estén listas antes de SplitText
    const startSplitting = () => {
      // Revelar elementos
      gsap.set(".gsap-reveal", { autoAlpha: 1 });

      const splitText = new SplitText("#tituloNegocio", {
        type: "chars",
      });

      const tl = gsap.timeline();
      tl.from(splitText.chars, {
        opacity: 0,
        y: -50,
        duration: 2,
        ease: "power2.out",
        stagger: {
          each: 0.05,
          from: "random",
        },
      });
      tl.to(splitText.chars, {
        scale: 1.1,
        duration: 2,
        ease: "power2.out",
        repeat: -1,
        yoyo: true,
      });
    };

    if (document.fonts) {
      document.fonts.ready.then(startSplitting).catch(startSplitting);
    } else {
      startSplitting();
    }
  });
}