# 🚀 Deploy Instructions

## 📋 Pasos para Deploy Completo

### **1. Frontend en Vercel**

1. **Conectar repositorio a Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - "New Project" → Importar desde GitHub
   - Selecciona `profile-craft-v2`
   - Framework: Vite
   - Root Directory: `app/front-end`

2. **Variables de entorno en Vercel:**
   ```bash
   VITE_API_URL=https://tu-backend.onrender.com/api
   ```

### **2. Backend en Render**

1. **Crear Web Service en Render:**
   - Ve a [render.com](https://render.com)
   - "New +" → "Web Service"
   - Conecta tu repositorio GitHub
   - Configuración:
     ```
     Name: profile-craft-backend
     Environment: Node
     Region: Frankfurt (EU)
     Branch: main
     Root Directory: app/back-end
     Build Command: npm run build
     Start Command: npm run start:mongodb
     ```

2. **Variables de entorno en Render:**
   ```bash
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/database
   JWT_SECRET=tu-jwt-secret-super-seguro
   CLOUDINARY_CLOUD_NAME=tu-cloudinary-cloud
   CLOUDINARY_API_KEY=tu-cloudinary-key
   CLOUDINARY_API_SECRET=tu-cloudinary-secret
   CORS_ORIGIN=https://tu-app.vercel.app
   ```

### **3. Keep-alive automático**

Después del deploy del backend, actualiza la URL en el workflow:

```yaml
# En .github/workflows/keep-backend-alive.yml
curl -f https://profile-craft-backend.onrender.com/health
```

### **4. MongoDB Atlas**

1. Crear cluster gratuito en [MongoDB Atlas](https://cloud.mongodb.com)
2. Crear usuario y obtener connection string
3. Agregar IP de Render a whitelist: `0.0.0.0/0`

## 🎯 **URLs Finales**

Después del deploy tendrás:

- **Frontend**: `https://tu-usuario.vercel.app`
- **Backend**: `https://profile-craft-backend.onrender.com`

## 🔧 **Configuración CORS**

Actualizar en el código del backend:

```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'https://tu-usuario.vercel.app', // Tu URL de Vercel
];
```

## ✅ **Checklist de Deploy**

- [ ] Frontend deploye
- [ ] Backend deploye
- [ ] MongoDB conecte
- [ ] CORS configurado
- [ ] Keep-alive activado
- [ ] Tests básicos funcionando

## 🚀 **Beneficios de esta configuración:**

- ✅ **$0/mes costo total**
- ✅ **Deploy automático** desde Git
- ✅ **Cold starts eliminados** (keep-alive)
- ✅ **Performance global** (Vercel CDN)
- ✅ **SSL automático** en ambos
- ✅ **Escalabilidad** futura
