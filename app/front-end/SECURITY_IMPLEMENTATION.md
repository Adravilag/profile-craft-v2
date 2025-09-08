# Sistema de Seguridad de Dominio y Logging

## 🔒 Protección de Dominio

### Problema Resuelto

- **Antes**: La API podía ser accedida desde cualquier dominio, exponiendo datos confidenciales
- **Ahora**: Solo el dominio oficial `https://adavilag-portfolio.vercel.app` puede acceder en producción

### Funcionamiento

#### Dominios Autorizados

- **Producción**: `https://adavilag-portfolio.vercel.app` (exclusivamente)
- **Desarrollo**: `localhost:3000`, `localhost:5173`, `127.0.0.1:3000`, `127.0.0.1:5173`

#### Validación Automática

```typescript
// Valida automáticamente antes de operaciones críticas
if (isProductionDomain() && !validateRequest()) {
  throw new Error('🚫 Acceso no autorizado desde este dominio');
}
```

#### Funciones Protegidas

- `authLogin()` - Autenticación
- `authRegister()` - Registro de usuarios
- `getAuthenticatedUserProfile()` - Perfil autenticado
- `updateProfile()` - Actualización de perfil

## 🛡️ Logging Seguro

### Problema Resuelto

- **Antes**: Tokens, passwords y emails se mostraban en claro en los logs
- **Ahora**: Automáticamente censura información sensible

### Datos Protegidos

- **Tokens**: `token`, `authToken`, `authorization`, `jwt`, etc. → `[REDACTED]`
- **Passwords**: `password`, `currentPassword`, `newPassword` → `[REDACTED]`
- **Emails**: `user@example.com` → `u***@example.com`
- **JWT Tokens**: Detecta patrones JWT automáticamente → `[JWT_TOKEN_REDACTED]`

### Uso del Logger Seguro

```typescript
import { createSecureLogger } from '../utils/secureLogging';

const logger = createSecureLogger('API');

// Automáticamente sanitiza los datos
logger.info('Usuario logueado:', {
  email: 'test@example.com', // → t***@example.com
  token: 'secret_token', // → [REDACTED]
  name: 'John', // → John (sin cambios)
});
```

## 🔧 Implementación Técnica

### Archivos Principales

- `src/utils/domainSecurity.ts` - Validación de dominio
- `src/utils/secureLogging.ts` - Sistema de logging seguro
- `src/services/api.ts` - API con protecciones aplicadas

### Tests de Seguridad

- `domainSecurity.test.ts` - Tests de validación de dominio
- `secureLogging.test.ts` - Tests de sanitización de logs
- `apiDomainSecurity.test.ts` - Tests de integración

### Configuración de Entorno

```typescript
// Solo en producción se aplica validación estricta
if (isProductionDomain() && !validateRequest()) {
  // Bloquea acceso no autorizado
}

// En desarrollo permite localhost
if (import.meta.env.DEV) {
  // Permite dominios de desarrollo
}
```

## 🚨 Alertas de Seguridad

### Logs de Acceso Denegado

```
🚫 Acceso denegado desde origen no autorizado: {
  origin: 'https://malicious-site.com',
  authorized: 'https://adavilag-portfolio.vercel.app'
}
```

### Datos Censurados

```
// Antes (INSEGURO)
✅ Respuesta exitosa: { token: 'eyJhbGciOiJIUzI1...', email: 'user@gmail.com' }

// Ahora (SEGURO)
✅ Respuesta exitosa: { token: '[REDACTED]', email: 'u***@gmail.com' }
```

## 📋 Checklist de Seguridad

### ✅ Implementado

- [x] Validación de dominio en producción
- [x] Logging seguro con censura automática
- [x] Protección de funciones de autenticación
- [x] Tests de seguridad completos
- [x] Interceptors de axios con validación

### 🔄 Próximas Mejoras

- [ ] Rate limiting por IP
- [ ] Detectar y bloquear intentos de scraping
- [ ] Logs de auditoria para accesos denegados
- [ ] Alertas automáticas por actividad sospechosa

## 🛠️ Mantenimiento

### Para Desarrolladores

1. **Nunca** deshabilites la validación de dominio en producción
2. **Siempre** usa `secureApiLogger` en lugar de `console.log`
3. **Revisa** que nuevas funciones de API incluyan validación de dominio
4. **Ejecuta** tests de seguridad antes de hacer deploy

### Para Debugging

```javascript
// En consola del navegador (solo desarrollo)
window.debugConfig.enable('API'); // Activar logs de API
window.debugConfig.status(); // Ver estado actual
window.debugConfig.disable('API'); // Desactivar logs
```
