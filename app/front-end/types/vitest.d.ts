/// <reference types="vitest" />

// Declaraciones globales para vitest cuando se usa con globals: true
declare global {
  const describe: typeof import('vitest').describe;
  const it: typeof import('vitest').it;
  const test: typeof import('vitest').test;
  const expect: typeof import('vitest').expect;
  const beforeAll: typeof import('vitest').beforeAll;
  const afterAll: typeof import('vitest').afterAll;
  const beforeEach: typeof import('vitest').beforeEach;
  const afterEach: typeof import('vitest').afterEach;
  const vi: typeof import('vitest').vi;
}

// Declaraciones de módulo para vitest
declare module 'vitest' {
  export const describe: any;
  export const it: any;
  export const test: any;
  export const expect: any;
  export const beforeAll: any;
  export const afterAll: any;
  export const beforeEach: any;
  export const afterEach: any;
  export const vi: any;
}
