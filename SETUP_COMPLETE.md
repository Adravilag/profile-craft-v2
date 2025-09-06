# 🚀 Setup Completo: Vercel + Render + Keep-alive

## ✅ **Lo que he configurado:**

### **1. Archivos creados/modificados:**

- ✅ `vercel.json` - Configuración para Vercel
- ✅ `vite.config.ts` - Ajustado para Vercel
- ✅ `.github/workflows/keep-backend-alive.yml` - Keep-alive automático
- ✅ `.github/workflows/deploy-vercel.yml` - Deploy automático (opcional)
- ✅ `DEPLOY_INSTRUCTIONS.md` - Instrucciones paso a paso

### **2. Plan de deploy:**

1. **Frontend → Vercel** (deploy súper rápido, CDN global)
2. **Backend → Render** (sin cambios en tu código)
3. **Keep-alive → GitHub Actions** (elimina cold starts)

## 🎯 **Próximos pasos:**

### **Paso 1: Deploy del Frontend en Vercel**

1. Ve a [vercel.com](https://vercel.com) y crea cuenta
2. "New Project" → Conecta tu repositorio GitHub
3. Configuración automática detectada por `vercel.json`
4. Deploy automático

### **Paso 2: Deploy del Backend en Render**

1. Ve a [render.com](https://render.com) y crea cuenta
2. "New Web Service" → Conecta tu repositorio
3. Root Directory: `app/back-end`
4. Build Command: `npm run build`
5. Start Command: `npm run start:mongodb`

### **Paso 3: MongoDB Atlas**

1. Crear cluster gratuito en [MongoDB Atlas](https://cloud.mongodb.com)
2. Obtener connection string
3. Configurar en variables de entorno de Render

### **Paso 4: Actualizar URLs**

Una vez tengas las URLs reales, actualiza:

- Keep-alive workflow con URL real de Render
- Variables de entorno de Vercel con URL del backend

## 💰 **Costo total: $0/mes**

## 🚀 **Beneficios:**

- ✅ **Deploy en ~60 segundos** total
- ✅ **Cold starts eliminados** (keep-alive cada 14 min)
- ✅ **Performance global** (Vercel CDN)
- ✅ **SSL automático** en ambos servicios
- ✅ **Deploy automático** desde Git
- ✅ **Monitoreo incluido** en ambas plataformas

## 🤔 **¿Empezamos con el deploy?**

¿Quieres que te ayude con algún paso específico o prefieres empezar por Vercel o por Render?
