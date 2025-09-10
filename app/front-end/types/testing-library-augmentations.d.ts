import React from 'react';

declare module '@testing-library/react' {
  // Minimal renderHook declaration for TypeScript to satisfy tests that import it.
  export function renderHook<TProps, TResult>(
    callback: (props: TProps) => TResult,
    options?: { initialProps?: TProps; wrapper?: React.ComponentType<any> }
  ): {
    result: { current: TResult };
    rerender: (props?: TProps) => void;
    unmount: () => void;
  };

  // Re-export act from react-dom/test-utils for typing convenience
  export { act } from 'react-dom/test-utils';
}

declare module '@testing-library/dom' {
  // Allow the `level` option for heading roles used in tests
  interface ByRoleOptions {
    level?: number;
  }
}
