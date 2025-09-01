# Guía de Seguridad - ProfileCraft

## 🔒 Configuración de Seguridad para Producción

### Variables de Entorno Obligatorias

1. **JWT_SECRET** (CRÍTICO)

   ```bash
   # Generar un secret seguro de 64+ caracteres:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **ADMIN_SECRET** (CRÍTICO)

   ```bash
   # Generar secret para operaciones administrativas:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **MONGODB_URI** (OBLIGATORIO)
   ```bash
   MONGODB_URI=mongodb://username:password@host:port/database
   ```

### 🛡️ Características de Seguridad Implementadas

#### Autenticación y Autorización

- ✅ JWT tokens con expiración (7 días)
- ✅ Cookies httpOnly para almacenamiento seguro de tokens
- ✅ Middleware de autenticación robusto
- ✅ Roles de usuario (admin/user)
- ✅ Hashing de contraseñas con bcrypt (salt rounds: 10)

#### Endpoints Protegidos

- ✅ Endpoint debug `/debug/change-password` SOLO en desarrollo
- ✅ Validación de headers x-admin-secret
- ✅ Verificación de entorno de producción

#### CORS y Headers de Seguridad

- ✅ CORS configurado con origins permitidos
- ✅ Credentials habilitados para cookies
- ✅ Headers de autorización controlados

#### Validación de Datos

- ✅ Validación de entrada en todos los endpoints
- ✅ Sanitización de datos de usuario
- ✅ Límites de tamaño de archivos (10MB)
- ✅ Tipos de archivo permitidos restringidos

#### Manejo de Errores

- ✅ No exposición de información sensible en errores
- ✅ Logging seguro sin mostrar credenciales
- ✅ Manejo robusto de excepciones

### 🚫 Endpoints Restringidos en Producción

- `/debug/change-password` - Solo desarrollo
- Herramientas administrativas movidas fuera de `/public`

### 📝 Checklist Pre-Despliegue

- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ JWT_SECRET único y seguro (64+ chars)
- [ ] ✅ ADMIN_SECRET configurado
- [ ] ✅ NODE_ENV=production
- [ ] ✅ Dependencias actualizadas (sin vulnerabilidades)
- [ ] ✅ Endpoints debug deshabilitados
- [ ] ✅ Archivos sensibles fuera de public/

### 🔍 Auditoría de Seguridad

Ejecutar regularmente:

```bash
npm audit
npm audit fix
```

### 📞 Herramientas de Desarrollo

- **Cambio de contraseña admin**: `app/back-end/tools/change-admin-password.html`
  - Solo usar en desarrollo local
  - Requiere ADMIN_SECRET configurado

### ⚠️ Notas Importantes

1. **NUNCA** commits archivos `.env` al repositorio
2. **SIEMPRE** usa HTTPS en producción
3. **ROTA** secretos regularmente
4. **MONITOREA** logs de acceso sospechoso
5. **MANTÉN** dependencias actualizadas

---

_Última actualización: Septiembre 2025_
