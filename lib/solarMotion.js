/** Premium easing — smooth deceleration */
export const EASE_OUT = [0.22, 1, 0.36, 1];

/** Default scroll reveal: run once, trigger slightly before fully in view */
export const VIEWPORT = {
  once: true,
  margin: "-12% 0px -8% 0px",
  amount: 0.2,
};

export function fadeUp(reduceMotion, y = 32) {
  return {
    hidden: reduceMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.55,
        ease: EASE_OUT,
      },
    },
  };
}

export function fadeScale(reduceMotion) {
  return {
    hidden: reduceMotion
      ? { opacity: 1, y: 0, scale: 1 }
      : { opacity: 0, y: 28, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: reduceMotion ? 0 : 0.6, ease: EASE_OUT },
    },
  };
}

export function slideAxis(reduceMotion, x = 0) {
  return {
    hidden: reduceMotion
      ? { opacity: 1, x: 0, y: 0 }
      : { opacity: 0, x, y: 16 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.65, ease: EASE_OUT },
    },
  };
}
