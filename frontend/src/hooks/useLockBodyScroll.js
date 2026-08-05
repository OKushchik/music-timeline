import { useEffect } from 'react';

/**
 * Locks page scroll (esp. on mobile) while `locked` is true.
 * Needed during drag-and-drop so the page doesn't scroll with the finger.
 */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return;

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyTouchAction: body.style.touchAction,
    };

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.touchAction = 'none';

    const preventTouchMove = (e) => {
      // Allow scrolling inside elements that opt in (e.g. horizontal timeline)
      if (e.target.closest?.('[data-scroll-lock-exempt]')) return;
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventTouchMove, { passive: false });

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.width = prev.bodyWidth;
      body.style.touchAction = prev.bodyTouchAction;
      document.removeEventListener('touchmove', preventTouchMove);
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
