import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/** One lifecycle owns every scroll observer and ticker, including route changes. */
export function installChoreography() {
  gsap.registerPlugin(ScrollTrigger);
  const fine = matchMedia("(pointer: fine)").matches;
  const lenis = fine
    ? new Lenis({ duration: 0.85, smoothWheel: true, syncTouch: false, anchors: true })
    : null;
  const tick = (seconds: number) => {
    if (!document.hidden) lenis?.raf(seconds * 1000);
  };
  lenis?.on("scroll", ScrollTrigger.update);
  if (lenis) gsap.ticker.add(tick);
  const media = gsap.matchMedia();
  const context = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
      const rate = Number(el.dataset.parallax) || 0.08;
      gsap.fromTo(
        el,
        { y: -80 * rate },
        {
          y: 180 * rate,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );
    });
    document.querySelectorAll<HTMLElement>("[data-hive-scroll-cue]").forEach((el) => {
      gsap.to(el, {
        opacity: 0,
        y: -10,
        ease: "none",
        scrollTrigger: { start: 0, end: 120, scrub: true },
      });
    });
    media.add("(min-width: 1000px)", () => {
      document.querySelectorAll<HTMLElement>("[data-hive-projects]").forEach((section) => {
        const strip = section.querySelector<HTMLElement>("[data-hive-strip]");
        if (!strip || strip.scrollWidth <= section.clientWidth + 10) return;
        section.dataset.hiveChoreographed = "";
        gsap.to(strip, {
          x: () => -(strip.scrollWidth - section.clientWidth),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 18%",
            end: () => `+=${strip.scrollWidth - section.clientWidth}`,
            scrub: 0.6,
            pin: true,
            invalidateOnRefresh: true,
          },
        });
      });
      document.querySelectorAll<HTMLElement>("[data-hive-experience]").forEach((section) => {
        const steps = section.querySelectorAll<HTMLElement>("[data-hive-step]");
        if (steps.length < 2) return;
        if (section.offsetHeight > innerHeight * 0.8) {
          steps.forEach((step) =>
            gsap.fromTo(
              step,
              { y: 20 },
              {
                y: 0,
                opacity: 1,
                ease: "none",
                scrollTrigger: { trigger: step, start: "top 80%", end: "top 40%", scrub: 0.5 },
              },
            ),
          );
          const pin = section.querySelector<HTMLElement>("[data-hive-pin]");
          if (pin)
            ScrollTrigger.create({
              trigger: section,
              start: "top 20%",
              end: "bottom 60%",
              pin,
              pinSpacing: false,
            });
          return;
        }
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 20%",
            end: `+=${steps.length * 160}`,
            pin: true,
            scrub: 0.5,
          },
        });
        steps.forEach((step, index) =>
          timeline.fromTo(step, { y: 16 }, { y: 0, opacity: 1 }, index * 0.5),
        );
      });
      return () =>
        document.querySelectorAll<HTMLElement>("[data-hive-choreographed]").forEach((section) => {
          delete section.dataset.hiveChoreographed;
        });
    });
    document.querySelectorAll<SVGGeometryElement>("[data-hive-draw]").forEach((line) => {
      const length = line.getTotalLength();
      gsap.fromTo(
        line,
        { strokeDasharray: length, strokeDashoffset: length },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: line.closest("section"),
            start: "top 75%",
            end: "bottom 65%",
            scrub: true,
          },
        },
      );
    });
  });
  const spotlights = Array.from(document.querySelectorAll<HTMLElement>("[data-hive-spotlight]"));
  const spotlight = (event: PointerEvent) => {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
  };
  if (fine)
    spotlights.forEach((el) => el.addEventListener("pointermove", spotlight, { passive: true }));
  const refresh = () => ScrollTrigger.refresh();
  document.fonts.ready.then(refresh);
  return () => {
    media.revert();
    context.revert();
    gsap.ticker.remove(tick);
    lenis?.destroy();
    spotlights.forEach((el) => el.removeEventListener("pointermove", spotlight));
  };
}
