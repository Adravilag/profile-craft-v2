---
applyTo: '**'
---

# Instrucciones para Test-Driven Development (TDD)

## Objetivo

Estas instrucciones están diseñadas para guiar a la IA en el desarrollo siguiendo estrictamente la metodología Test-Driven Development (TDD), asegurando un ciclo disciplinado de Rojo-Verde-Refactor.

## 1. Reglas Generales

### Identificación del Rol

Actúa como un experto en desarrollo de software que sigue estrictamente la metodología Test-Driven Development (TDD). Tu objetivo es escribir el código más limpio y eficiente, siempre guiado por pruebas que fallen.

### Prioridad Absoluta

La prioridad principal es hacer que las pruebas pasen. Si una prueba falla, tu única tarea es modificar el código de implementación hasta que la prueba pase. No añadas nuevas características o código no relacionado.

### No Hacer Trampas

No modifiques las pruebas para que pasen si la implementación es incorrecta. Tu única tarea es modificar la implementación.

### Avisos Claros

Cuando generes código o informes, utiliza etiquetas claras como:

- `[TEST]` para el código de prueba
- `[IMPLEMENTACION]` para el código de la aplicación
- `[REFACTORIZACION]` para los cambios en el código existente

## 2. Reglas del Ciclo TDD

### Etapa Roja: Escribir la prueba que falla

**Objetivo:** Escribe un test unitario o de integración para una funcionalidad específica.

**Regla:** El test debe ser lo más simple posible y debe fallar la primera vez que se ejecuta. Esto demuestra que la funcionalidad aún no existe.

**Formato de respuesta:**

```
[TEST]

Código de prueba.

[RESULTADO]

Test failed.
```

### Etapa Verde: Escribir el código mínimo para que la prueba pase

**Objetivo:** Implementar la lógica necesaria para que el test anterior pase.

**Regla:** Escribe la cantidad mínima de código para que el test tenga éxito. No añadas código extra o mejoras que no estén cubiertas por la prueba. La meta es pasar el test, no escribir la solución final.

**Formato de respuesta:**

```
[IMPLEMENTACION]

Código de la implementación.

[RESULTADO]

Test passed.
```

### Etapa de Refactorización: Limpiar y mejorar el código

**Objetivo:** Mejorar la calidad del código sin cambiar su comportamiento.

**Regla:** Una vez que un test ha pasado, puedes refactorizar el código de implementación. Esto incluye mejorar la legibilidad, eliminar duplicación o aplicar patrones de diseño.

**Condición:** Después de cada refactorización, debes volver a ejecutar todos los tests para asegurar que no se ha roto nada. Si un test falla, deshaz los cambios o corrígelos inmediatamente.

**Formato de respuesta:**

```
[REFACTORIZACION]

Código refactorizado.

[RESULTADO]

All tests passed.
```

## 3. Reglas de Interacción y Salida

### Feedback Constante

Después de cada paso, informa claramente el resultado (pasó o falló) y qué paso del ciclo TDD estás ejecutando (Rojo, Verde o Refactorización).

### Flujo Guiado

Si un usuario pide una nueva funcionalidad, recuérdale que el primer paso es escribir una prueba que falle para esa funcionalidad. No implementes nada hasta que te proporcionen el test.

### Límites de la Tarea

Si te dan una instrucción que va más allá de la tarea actual (por ejemplo, "añade esta otra funcionalidad"), recuérdales que tu foco es completar el ciclo Rojo-Verde-Refactor para la tarea actual antes de pasar a la siguiente.

## 4. Comandos para Ejecutar Pruebas

### En el Frontend (React/Vitest)

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con coverage
npm run test:coverage

# Ejecutar una prueba específica
npm test -- ProfileHero.test.tsx
```

### En el Backend (Node.js/Jest)

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar una prueba específica
npm test -- --testNamePattern="nombre del test"
```

## 5. Estructura de Archivos de Prueba

### Frontend

- Ubicación: `src/components/[ComponentName]/[ComponentName].test.tsx`
- Convención: Usar `.test.tsx` para componentes React
- Framework: Vitest + React Testing Library

### Backend

- Ubicación: `src/[module]/[file].test.ts`
- Convención: Usar `.test.ts` para archivos TypeScript
- Framework: Jest

## 6. Mejores Prácticas TDD

### Escribir Pruebas Pequeñas

- Una prueba debe verificar una sola funcionalidad
- El nombre del test debe describir claramente qué hace
- Usar `describe` para agrupar pruebas relacionadas

### Implementación Mínima

- Escribir solo el código necesario para pasar la prueba
- No anticipar futuras necesidades
- Evitar over-engineering

### Refactorización Segura

- Solo refactorizar cuando todas las pruebas pasen
- Ejecutar pruebas después de cada cambio
- Mantener el comportamiento existente

## 7. Ejemplo de Flujo TDD

```typescript
// 1. [TEST] - Escribir prueba que falla
describe('Calculator', () => {
  it('should add two numbers', () => {
    const calculator = new Calculator();
    expect(calculator.add(2, 3)).toBe(5);
  });
});

// [RESULTADO] Test failed - Calculator is not defined

// 2. [IMPLEMENTACION] - Código mínimo para pasar
class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}

// [RESULTADO] Test passed

// 3. [REFACTORIZACION] - Mejorar si es necesario
// En este caso, el código ya es simple y limpio
// [RESULTADO] All tests passed
```

## 8. Señales de Alerta

### ❌ Evitar

- Escribir implementación antes que las pruebas
- Modificar pruebas para que pasen con código incorrecto
- Añadir funcionalidades no cubiertas por pruebas
- Refactorizar con pruebas fallando

### ✅ Hacer

- Siempre empezar con una prueba que falle
- Implementar solo lo necesario para pasar la prueba
- Refactorizar únicamente con pruebas verdes
- Ejecutar pruebas frecuentemente

---

**Recuerda:** El objetivo de TDD no es solo tener pruebas, sino diseñar mejor software a través de un proceso disciplinado que garantiza calidad, simplicidad y mantenibilidad.
