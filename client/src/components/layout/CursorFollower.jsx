import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CursorFollower = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const moveRingX = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3.out' });
    const moveRingY = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3.out' });

    const onMove = (e) => {
      const { clientX: x, clientY: y } = e;
      gsap.set(dot, { x: x - 4, y: y - 4 });
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

    let rebindTimeout = null;

    const bindHoverListeners = () => {
      const interactables = document.querySelectorAll('a, button, [data-cursor-hover]');
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', onHoverIn);
        el.removeEventListener('mouseleave', onHoverOut);
        el.addEventListener('mouseenter', onHoverIn);
        el.addEventListener('mouseleave', onHoverOut);
      });
    };

    bindHoverListeners();

    const observer = new MutationObserver(() => {
      if (rebindTimeout) clearTimeout(rebindTimeout);
      rebindTimeout = setTimeout(() => {
        bindHoverListeners();
      }, 200);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rebindTimeout) clearTimeout(rebindTimeout);
      observer.disconnect();
      const interactables = document.querySelectorAll('a, button, [data-cursor-hover]');
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', onHoverIn);
        el.removeEventListener('mouseleave', onHoverOut);
      });
    };
  }, []);

  return (
    <>
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
