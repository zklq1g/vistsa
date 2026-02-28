import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * CursorFollower — A smooth trailing custom cursor.
 * - Small dot snaps instantly to cursor position
 * - Larger ring follows with lag (lerp effect via GSAP quickTo)
 * - Ring grows on hoverable elements
 */
const CursorFollower = () => {
    const dotRef = useRef(null);
    const ringRef = useRef(null);

    useEffect(() => {
        const dot = dotRef.current;
        const ring = ringRef.current;

        if (!dot || !ring) return;

        // quickTo gives us smooth lerp-based animation
        const moveDot = gsap.quickTo(dot, 'css', { duration: 0, ease: 'none' });
        const moveRingX = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3.out' });
        const moveRingY = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3.out' });

        const onMove = (e) => {
            const { clientX: x, clientY: y } = e;

            // dot follows instantly
            gsap.set(dot, { x: x - 4, y: y - 4 });

            // ring follows with lag
            moveRingX(x - 20);
            moveRingY(y - 20);
        };

        const onHoverIn = () => {
            gsap.to(ring, { scale: 1.8, opacity: 0.5, duration: 0.3 });
            gsap.to(dot, { scale: 0, duration: 0.2 });
        };

        const onHoverOut = () => {
            gsap.to(ring, { scale: 1, opacity: 0.6, duration: 0.3 });
            gsap.to(dot, { scale: 1, duration: 0.2 });
        };

        window.addEventListener('mousemove', onMove);

        // Attach hover listeners to all interactive elements
        const interactables = document.querySelectorAll('a, button, [data-cursor-hover]');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', onHoverIn);
            el.addEventListener('mouseleave', onHoverOut);
        });

        return () => {
            window.removeEventListener('mousemove', onMove);
            interactables.forEach(el => {
                el.removeEventListener('mouseenter', onHoverIn);
                el.removeEventListener('mouseleave', onHoverOut);
            });
        };
    }, []);

    return (
        <>
            {/* Main dot */}
            <div
                ref={dotRef}
                style={{
                    position: 'fixed',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--c-accent)',
                    pointerEvents: 'none',
                    zIndex: 99999,
                    top: 0, left: 0,
                    willChange: 'transform',
                }}
            />
            {/* Ring */}
            <div
                ref={ringRef}
                style={{
                    position: 'fixed',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '1px solid var(--c-accent)',
                    pointerEvents: 'none',
                    zIndex: 99999,
                    top: 0, left: 0,
                    opacity: 0.6,
                    willChange: 'transform',
                    mixBlendMode: 'difference',
                }}
            />
        </>
    );
};

export default CursorFollower;
