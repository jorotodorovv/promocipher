import { animate, AnimationPlaybackControls } from "framer-motion";

/**
 * Smooth scroll to an element with the given ID using Framer Motion
 * @param elementId - The ID of the element to scroll to (without #)
 */
export const smoothScrollTo = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    const headerOffset = 80; // Adjust this value to add padding from the top
    const elementPosition = element.offsetTop - headerOffset;

    const controls: AnimationPlaybackControls = animate(window.scrollY, elementPosition, {
      type: "spring",
      stiffness: 100,
      damping: 30,
      onUpdate: (latest) => window.scrollTo(0, latest),
      onComplete: () => {
        window.removeEventListener("wheel", cancelOnUserScroll);
        window.removeEventListener("touchmove", cancelOnUserScroll);
      },
    });

    const cancelOnUserScroll = () => {
      controls.stop();
    };

    window.addEventListener("wheel", cancelOnUserScroll, { once: true });
    window.addEventListener("touchmove", cancelOnUserScroll, { once: true });
  }
};