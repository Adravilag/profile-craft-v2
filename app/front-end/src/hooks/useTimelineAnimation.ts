import { useEffect, useRef } from 'react';

export const useTimelineAnimation = () => {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Opcional: detener la observación una vez que es visible
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px -50px 0px',
      }
    );

    if (timelineRef.current) {
      const items = timelineRef.current.querySelectorAll('.timeline-item, .chronological-item');
      items.forEach(item => observer.observe(item));
    }

    return () => {
      if (timelineRef.current) {
        const items = timelineRef.current.querySelectorAll('.timeline-item, .chronological-item');
        items.forEach(item => observer.unobserve(item));
      }
    };
  }, []);

  return timelineRef;
};
