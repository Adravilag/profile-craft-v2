export type RevealObserverOptions = {
  selector?: string;
  rootMargin?: string;
  threshold?: number | number[];
  revealedClass?: string;
};

export const setupRevealObserver = (opts: RevealObserverOptions = {}): void => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const selector = opts.selector || '[data-reveal]';
  const revealedClass = opts.revealedClass || 'revealed';

  const elements = () => Array.from(document.querySelectorAll(selector)) as Element[];

  if (typeof IntersectionObserver === 'undefined') {
    // Fallback: revelar todos si no hay soporte
    elements().forEach(el => el.classList.add(revealedClass));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(revealedClass);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: opts.rootMargin || '0px 0px -10% 0px',
      threshold: opts.threshold ?? 0.1,
    }
  );

  // Observe current elements
  elements().forEach(el => observer.observe(el));

  // Observe future elements added to DOM
  const mo = new MutationObserver(() => {
    elements().forEach(el => {
      if (!(el as any).__revealedObserved) {
        observer.observe(el);
        (el as any).__revealedObserved = true;
      }
    });
  });
  mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
};
