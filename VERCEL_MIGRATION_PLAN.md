# 🚀 Migración a Vercel Functions - Plan Detallado

## 📁 Nueva Estructura del Proyecto

```
app/
├── front-end/              # Frontend React (se mantiene)
└── serverless-backend/     # Nuevo backend serverless
    ├── api/                # Vercel Functions
    │   ├── auth/
    │   │   ├── login.ts
    │   │   ├── register.ts
    │   │   └── verify.ts
    │   ├── profile/
    │   │   ├── index.ts
    │   │   └── [id].ts
    │   ├── experiences/
    │   │   ├── index.ts
    │   │   └── [id].ts
    │   └── uploads/
    │       └── image.ts
    ├── lib/                # Utilidades compartidas
    │   ├── db.ts          # MongoDB connection
    │   ├── auth.ts        # JWT utilities
    │   └── cors.ts        # CORS helper
    └── vercel.json        # Configuración
```

## 🔧 Configuración Vercel

### vercel.json

```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@3"
    }
  },
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "JWT_SECRET": "@jwt_secret",
    "CLOUDINARY_CLOUD_NAME": "@cloudinary_cloud_name",
    "CLOUDINARY_API_KEY": "@cloudinary_api_key",
    "CLOUDINARY_API_SECRET": "@cloudinary_api_secret"
  }
}
```

## 📝 Ejemplos de Migración

### 1. **Endpoint de Experiencias**

#### Antes (Express):

```typescript
// routes/experiences.ts
router.get('/', experiencesController.getExperiences);
router.post('/', authenticateAdmin, experiencesController.createExperience);
```

#### Después (Vercel Function):

```typescript
// api/experiences/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../lib/db';
import { authenticate } from '../../lib/auth';
import { setCORS } from '../../lib/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS
  setCORS(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Connect DB
  await connectDB();

  try {
    if (req.method === 'GET') {
      // Lógica para obtener experiencias
      const experiences = await Experience.find().sort({ startDate: -1 });
      return res.status(200).json(experiences);
    } else if (req.method === 'POST') {
      // Verificar autenticación
      const user = await authenticate(req);
      if (!user) return res.status(401).json({ error: 'No autorizado' });

      // Lógica para crear experiencia
      const experience = new Experience(req.body);
      await experience.save();
      return res.status(201).json(experience);
    } else {
      return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

### 2. **Upload de Archivos**

#### Después (Cloudinary directo):

```typescript
// api/uploads/image.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import { authenticate } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Verificar autenticación
  const user = await authenticate(req);
  if (!user) return res.status(401).json({ error: 'No autorizado' });

  try {
    const { image, imageType } = req.body;

    const result = await cloudinary.uploader.upload(image, {
      folder: imageType === 'profile' ? 'profile' : 'projects',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    return res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

### 3. **Utilidades Compartidas**

#### lib/db.ts

```typescript
import mongoose from 'mongoose';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI!, opts).then(mongoose => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
```

#### lib/cors.ts

```typescript
import { NextApiRequest, NextApiResponse } from 'next';

const allowedOrigins = ['http://localhost:3000', 'https://your-app.vercel.app'];

export function setCORS(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin || '')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}
```

## ⏱️ **Plan de Migración Gradual**

### Fase 1: Setup inicial (2-3 horas)

- [ ] Crear estructura de carpetas
- [ ] Configurar Vercel project
- [ ] Setup variables de entorno
- [ ] Crear utilidades base (db, cors, auth)

### Fase 2: Endpoints de lectura (4-6 horas)

- [ ] /api/experiences
- [ ] /api/projects
- [ ] /api/skills
- [ ] /api/profile
- [ ] Testing

### Fase 3: Endpoints de escritura (6-8 horas)

- [ ] /api/auth/\*
- [ ] CRUD operations
- [ ] File uploads
- [ ] Testing exhaustivo

### Fase 4: Deploy y optimización (2-3 horas)

- [ ] Deploy a Vercel
- [ ] Configurar dominios
- [ ] Performance testing
- [ ] Monitoring

## 💰 **Costos Estimados**

### Vercel Pro (si superas límites gratuitos)

- **$20/mes** por developer
- **100GB** bandwidth
- **Unlimited** functions
- **Edge Functions**

### Ventajas vs Render

- ✅ **Performance**: Edge computing global
- ✅ **Escalabilidad**: Automática e infinita
- ✅ **Deploy speed**: 30 segundos vs 3 minutos
- ✅ **DX**: Excelente experiencia de desarrollo

## 🤔 **¿Procedemos con la migración?**

Puedo ayudarte a:

1. **Crear la estructura base** de Vercel Functions
2. **Migrar endpoints específicos** paso a paso
3. **Mantener ambos backends** durante la transición
4. **Solo configurar Vercel para frontend** y mantener Render para backend
