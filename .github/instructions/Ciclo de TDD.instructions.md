---
applyTo: '**'
---

# Guía Rápida de TDD

## Objetivo

Seguir el ciclo Rojo → Verde → Refactor de forma estricta para garantizar código limpio, probado y mantenible.

## 1. Reglas Generales

**Rol:** Actúa como experto en TDD.

**Prioridad:** Haz que los tests pasen.

**No trampas:** Nunca modifiques tests para que pasen.

**Etiquetas:**

- `[TEST]` → código de prueba
- `[IMPLEMENTACION]` → código de aplicación
- `[REFACTORIZACION]` → mejoras sin cambiar comportamiento

## 2. Ciclo TDD

### 🔴 Rojo – Escribir test que falle

- Prueba lo más simple posible.
- Debe fallar inicialmente.

```
[TEST]
código de prueba

[RESULTADO]
Test failed
```

### 🟢 Verde – Implementar lo mínimo

- Escribe solo lo necesario para pasar el test.

```
[IMPLEMENTACION]
código mínimo

[RESULTADO]
Test passed
```

### ♻️ Refactor – Mejorar código

- Limpieza, legibilidad y patrones si aplican.
- Corre todos los tests: deben seguir pasando.

```
[REFACTORIZACION]
código refactorizado

[RESULTADO]
All tests passed
```

## 3. Flujo de Interacción

- Siempre empieza con un test que falle.
- No avances a otra funcionalidad sin cerrar el ciclo actual.
- Feedback constante: indica paso y resultado.

## 4. Comandos útiles

### Frontend (React/Vitest):

```bash
npm test              # todas
npm run test:watch    # en watch
npm run test:coverage # con coverage
npm test -- file.test.tsx
```

### Backend (Node/Jest):

```bash
npm test
npm run test:watch
npm test -- --testNamePattern="nombre del test"
```

## 5. Organización de archivos

- **Frontend:** `src/components/[Component]/[Component].test.tsx` (Vitest + RTL)
- **Backend:** `src/[module]/[file].test.ts` (Jest)

## 6. Buenas prácticas

### ✅ Hacer

- Tests pequeños y claros
- Implementación mínima
- Refactor solo con tests verdes

### ❌ Evitar

- Nunca escribir código sin test
- Nunca cambiar el test para que pase

## 7. Ejemplo breve

```typescript
// 🔴 Test
[TEST]
it('suma dos números', () => {
  const c = new Calculator();
  expect(c.add(2, 3)).toBe(5);
});
[RESULTADO] Test failed

// 🟢 Implementación mínima
[IMPLEMENTACION]
class Calculator {
  add(a: number, b: number) { return a + b; }
}
[RESULTADO] Test passed

// ♻️ Refactor (si aplica)
[REFACTORIZACION]
// código ya limpio
[RESULTADO] All tests passed
```

## 🚨 Señales de alerta

- ❌ Implementación antes de pruebas
- ❌ Funcionalidad sin test
- ❌ Refactor con tests fallando

## 📌 Recuerda

**TDD es disciplina → prueba primero, implementación mínima, luego refactor.**

## Notas de retroalimentación y reglas prácticas

- Orden de hooks (crítico): nunca colocar early-returns que eviten ejecutar hooks (p. ej. `if (!isOpen) return null`) antes de declarar hooks. Hacer el gating después de las llamadas a hooks o controlar visibilidad desde el componente padre para evitar violaciones de las reglas de React y renders inestables.
- Tests asíncronos: cuando un componente hace fetch o muestra un skeleton loader, los tests deben usar helpers explícitos (`waitFor`, `findBy*`) o mocks síncronos para evitar flakes y renders parciales.
- Checklist PR-TDD (antes de abrir PR):
  1. Añadir test rojo que describa la expectativa.
  2. Implementar la mínima funcionalidad para pasar el test.
  3. Ejecutar linters, build y tests locales; arreglar warnings relevantes.
  4. Añadir o actualizar tests que cubran regresiones y documentar cambios en el test si el contrato cambió.
- Depuración rápida en tests: si falta un elemento, usar `screen.debug()` o `console.log(container.innerHTML)` justo antes de la aserción para inspeccionar el DOM real.
