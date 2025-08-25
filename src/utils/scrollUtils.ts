import { animate } from "framer-motion";

/**
 * Smooth scroll to an element with the given ID using Framer Motion
 * @param elementId - The ID of the element to scroll to (without #)
 */
export const smoothScrollTo = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    const headerOffset = 80; // Adjust this value to add padding from the top
    const elementPosition = element.offsetTop - headerOffset;

    animate(window.scrollY, elementPosition, {
      type: "spring",
      stiffness: 100,
      damping: 30,
      onUpdate: (latest) => window.scrollTo(0, latest),
    });
  }
};