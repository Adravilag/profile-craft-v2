# 🚀 Vercel Deploy - Checklist

## ✅ **Paso a paso en Vercel Dashboard:**

### **1. Conectar repositorio**

- [ ] Ir a [vercel.com](https://vercel.com)
- [ ] Crear cuenta con GitHub
- [ ] Clic "New Project"
- [ ] Importar `profile-craft-v2`

### **2. Configuración del proyecto**

```
Framework: Vite ✅ (detectado automático)
Root Directory: app/front-end
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### **3. Variables de entorno**

En Vercel Dashboard → Settings → Environment Variables:

```bash
VITE_API_URL=http://localhost:3000/api
```

_(Temporal - cambiaremos después del backend)_

### **4. Deploy**

- [ ] Clic "Deploy"
- [ ] Esperar ~60 segundos
- [ ] ¡Tu frontend estará live!

## 🎯 **URL esperada:**

`https://profile-craft-v2-[random].vercel.app`

## 🔧 **Si hay errores:**

### **Error común: Root Directory**

- Asegúrate de configurar: `app/front-end`
- No solo `front-end`

### **Error de build:**

- Verifica que `vercel.json` esté en la raíz del proyecto
- Las dependencias se instalarán automáticamente

## 📱 **Después del deploy:**

1. ✅ Frontend funcionando en Vercel
2. ⚠️ API calls fallarán (normal, backend no está deployado aún)
3. 🎨 UI/UX funcionará perfectamente

## 🎯 **Siguiente paso:**

Una vez que veas tu frontend live, procedemos con Render para el backend.
