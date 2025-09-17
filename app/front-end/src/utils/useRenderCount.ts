import React from 'react';

/**
 * Debug hook to count renders of a component. Returns the current count and
 * optionally logs to console when it changes. Use only in development.
 */
export default function useRenderCount(name?: string, log = false) {
  const ref = React.useRef(0);
  ref.current += 1;
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && log) {
      // eslint-disable-next-line no-console
      console.debug(`[render] ${name || 'component'} render #${ref.current}`);
    }
  });
  return ref.current;
}
