# Centralized Configuration Setup

Este proyecto ahora utiliza configuraciones centralizadas para mantener consistencia entre front-end y back-end.

## Estructura de configuración

### Raíz del proyecto

- `package.json` - Workspace principal con scripts unificados
- `tsconfig.base.json` - Configuración TypeScript base
- `eslint.config.js` - Reglas ESLint compartidas
- `.prettierrc` - Formato de código unificado
- `.gitignore` - Reglas de exclusión centralizadas

### Scripts principales (desde la raíz)

```bash
# Desarrollo
npm run dev              # Ejecuta front-end y back-end simultáneamente
npm run dev:frontend     # Solo front-end
npm run dev:backend      # Solo back-end

# Build
npm run build            # Compila ambos proyectos
npm run build:frontend   # Solo front-end
npm run build:backend    # Solo back-end

# Calidad de código
npm run lint             # Linting en ambos proyectos
npm run lint:fix         # Arregla errores automáticamente
npm run format           # Formatea todo el código
npm run type-check       # Verificación TypeScript

# Testing
npm run test             # Tests en ambos proyectos
```

### Beneficios

1. **Consistencia**: Mismas reglas de linting, formato y TypeScript
2. **Simplicidad**: Un solo lugar para configurar herramientas
3. **Mantenimiento**: Easier dependency management
4. **Workflows**: Scripts centralizados para CI/CD

### Migración completada

- ✅ Configuraciones TypeScript unificadas
- ✅ ESLint centralizado
- ✅ Prettier compartido
- ✅ Scripts de workspace
- ✅ Husky/lint-staged en raíz
- ✅ .gitignore consolidado
