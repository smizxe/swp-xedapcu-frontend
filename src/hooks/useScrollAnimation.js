import { useEffect, useRef, useState } from 'react';

/**
 * Returns [ref, isVisible] — attach `ref` to any DOM element.
 * `isVisible` becomes true once the element enters the viewport (fires once).
 */
export const useScrollAnimation = (threshold = 0.15) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(el); // fire only once
                }
            },
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return [ref, isVisible];
};

/**
 * Returns an array of [ref, isVisible] pairs for a list of items.
 * Useful for staggered card/grid animations.
 */
export const useScrollAnimationList = (count, threshold = 0.1) => {
    // Build a fixed-length array of animation pairs
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const items = Array.from({ length: count }, () => useScrollAnimation(threshold));
    return items;
};

export default useScrollAnimation;
