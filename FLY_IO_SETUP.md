# 🚀 Fly.io Setup para tu Backend

## 📋 Plan de migración de Render → Fly.io

### 1. **Crear Dockerfile optimizado**

```dockerfile
# Dockerfile (en app/back-end/)
FROM node:18-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Build del proyecto
RUN npm run build

# Exponer puerto
EXPOSE 8080

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=8080

# Comando de inicio
CMD ["npm", "run", "start:mongodb"]
```

### 2. **Configuración Fly.io**

```toml
# fly.toml (en app/back-end/)
app = "profile-craft-backend"
primary_region = "mad"  # Madrid - cerca de España

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "8080"

# Configuración del servicio HTTP
[[services]]
  internal_port = 8080
  protocol = "tcp"
  auto_stop_machines = false   # 🔥 Evitar que se duerma
  auto_start_machines = true
  min_machines_running = 1     # 🔥 Mantener siempre 1 activa

  [[services.ports]]
    handlers = ["http"]
    port = 80
    force_https = true

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

# Configuración de health checks
[http_service]
  internal_port = 8080
  force_https = true

  # Health check para mantener la app viva
  [http_service.checks]
    [http_service.checks.alive]
      type = "http"
      interval = "15s"
      timeout = "10s"
      path = "/health"
```

### 3. **Scripts de package.json adaptados**

```json
{
  "scripts": {
    "fly:setup": "flyctl auth login && flyctl launch --no-deploy",
    "fly:deploy": "flyctl deploy",
    "fly:logs": "flyctl logs",
    "fly:status": "flyctl status",
    "fly:scale": "flyctl scale count 1 --region mad"
  }
}
```

### 4. **Variables de entorno**

```bash
# Configurar secrets en Fly.io
flyctl secrets set MONGODB_URI="mongodb+srv://..."
flyctl secrets set JWT_SECRET="tu-jwt-secret"
flyctl secrets set CLOUDINARY_CLOUD_NAME="tu-cloud"
flyctl secrets set CLOUDINARY_API_KEY="tu-api-key"
flyctl secrets set CLOUDINARY_API_SECRET="tu-api-secret"
```

### 5. **Deploy automático con GitHub Actions**

```yaml
# .github/workflows/deploy-backend-fly.yml
name: Deploy Backend to Fly.io

on:
  push:
    branches: [main]
    paths:
      - 'app/back-end/**'
      - '.github/workflows/deploy-backend-fly.yml'

jobs:
  deploy:
    name: Deploy Backend
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./app/back-end

    steps:
      - uses: actions/checkout@v4

      - name: Setup Fly.io CLI
        uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy to Fly.io
        run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## ⚡ **Ventajas específicas para tu portfolio:**

### **Performance mejorada:**

- 🚀 **Primera carga**: 2-5s (vs 30-60s Render)
- 🌍 **Global**: Usuarios de cualquier país tienen buena velocidad
- 🔄 **Always-on**: Sin interrupciones por inactividad

### **Costo optimizado:**

- 💰 **~$1.94/mes** para una app básica
- 🎁 **$5 crédito** mensual incluido
- 📊 **ROI excelente** para performance profesional

### **DevX superior:**

- 🛠️ **CLI potente**: `flyctl logs`, `flyctl ssh console`
- 📈 **Métricas**: Dashboard con performance real
- 🔧 **Debug fácil**: SSH directo a tu app

## 🎯 **¿Procedemos con Fly.io?**

Puedo ayudarte a:

1. **🔧 Setup completo** de Fly.io para tu backend
2. **📁 Crear todos los archivos** de configuración
3. **🚀 Deploy inicial** paso a paso
4. **🌐 Configurar frontend** para usar la nueva URL
5. **📊 Optimizar rendimiento** y monitoreo

**¿Te parece que probemos Fly.io?** Es la solución perfecta para tu problema de cold starts y el costo es mínimo (~$2/mes) para la mejora de performance que obtienes.
