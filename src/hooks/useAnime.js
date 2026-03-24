import { useEffect, useRef } from 'react';
import { animate as animeV4, stagger } from 'animejs';

// Compatibility wrapper for v3-style single object syntax
const animate = (targets, params) => {
  if (!params && typeof targets === 'object' && targets.targets) {
    return animeV4(targets.targets, targets);
  }
  return animeV4(targets, params);
};

/**
 * A custom hook to simplify Anime.js usage in React components.
 */
export const useAnime = (options, dependencies = []) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, options);
    }
  }, dependencies);

  return ref;
};

/**
 * Staggered entrance animation for a list of children.
 */
export const animateStagger = (selector, extraOptions = {}) => {
  animate(selector, {
    opacity: [0, 1],
    translateY: [20, 0],
    delay: stagger(80),
    duration: 800,
    easing: 'outQuart',
    ...extraOptions
  });
};

// Attach stagger to animate for easier migration/compatibility
animate.stagger = stagger;

export { animate, stagger };
export default animate;
