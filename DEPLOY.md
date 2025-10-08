# DEPLOY NOTES

## Resumen

En este repo monorepo (npm workspace) se han añadido `react` y `react-dom` en el `package.json` raíz para evitar fallos en plataformas de despliegue que ejecutan `npm install`/`npm run build` desde la raíz y no realizan el hoisting o la instalación por paquete esperada.

## Por qué

- Algunos proveedores (p. ej. Vercel, Render) ejecutan `npm install` o `npm run build` desde la raíz del proyecto. Si la instalación no hace hoisting de dependencias de workspace o si la plataforma intenta construir el paquete `app/front-end` sin instalar las dependencias del propio subpaquete, la build puede fallar con errores como `Could not load .../node_modules/react/jsx-runtime`.
- Añadir `react`/`react-dom` en la raíz es una solución práctica para evitar este fallo sin cambiar la configuración del provider.

## Opciones alternativas (más limpias)

1. Configurar el pipeline de CI para instalar y construir en el workspace específico:
   - Comandos recomendados para Vercel / Render / Netlify:

```bash
# instalar dependencias en monorepo
pnpm install
# instalar y construir solo el front-end
pnpm --filter ./app/front-end install
pnpm --filter ./app/front-end run build
```

- O bien, ejecutar directamente (si el provider no soporta `pnpm`):

```bash
cd app/front-end
npm install
npm run build
```

2. Mantener dependencia únicamente en `app/front-end/package.json` y modificar la configuración del provider para que haga la instalación y build desde `app/front-end`.

## Qué se ha hecho en este repo

- Se añadieron `react` y `react-dom` en el `package.json` del root para eliminar el fallo en deployments que ejecutan `npm install` en la raíz.

## Recomendación

- Mantener la dependencia en la raíz solo si el flujo de CI usado por su host lo requiere. Si tiene control sobre el pipeline, preferible configurar la build para instalar y compilar desde `app/front-end`.

## Comandos útiles (local)

- Instalar y construir todo con pnpm (monorepo):

```bash
pnpm install
pnpm --dir app/front-end run build
```

- Construir solo front-end:

```bash
pnpm --filter ./app/front-end run build
```

- Construir solo back-end:

```bash
pnpm --filter ./app/back-end run build
```

## Contacto

Si prefiere que revirtamos el cambio y en su lugar ajuste la configuración de su proveedor (ej. Vercel build command), puedo generar el snippet de configuración exacto o un script `build_frontend.sh` para invocar en CI.
