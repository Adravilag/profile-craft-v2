// Global ambient declarations to smooth incremental migration fixes

declare module '@cv-maker/shared' {
  export const useNavigation: any;
  export const useData: any;
  export const useAuth: any;
  const _default: any;
  export default _default;
}

declare module '@/components/OptimizedImage' {
  export const OptimizedImage: any;
  export default OptimizedImage;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Provide minimal jest/test globals to avoid tsc errors while tests are present
declare var describe: any;
declare var test: any;
declare var it: any;
declare var expect: any;
declare var beforeEach: any;
declare var afterEach: any;
// Use Vitest global `vi` instead of Jest's `jest` when running frontend tests
declare var vi: any;

declare module '*.svg' {
  const content: any;
  export default content;
}

// Backwards compatibility global aliases used widely in the codebase
declare type article = import('@/types/api').Project;
declare type articlePageProps = any;
declare type articleTheme = any;
