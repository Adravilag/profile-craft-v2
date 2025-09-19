// Stub para resolver referencias a 'vitest/globals' usadas por algunas librerías
// Re-exporta todo desde 'vitest' y añade las declaraciones globales si se usan.
import type * as _vitest from 'vitest';

declare module 'vitest/globals' {
  export * from 'vitest';
  // Algunos paquetes esperan exportaciones con nombres concretos
  export const describe: typeof _vitest.describe;
  export const it: typeof _vitest.it;
  export const test: typeof _vitest.test;
  export const expect: typeof _vitest.expect;
  export const beforeAll: typeof _vitest.beforeAll;
  export const afterAll: typeof _vitest.afterAll;
  export const beforeEach: typeof _vitest.beforeEach;
  export const afterEach: typeof _vitest.afterEach;
  export const vi: typeof _vitest.vi;
}

export {};
