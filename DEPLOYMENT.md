# Stockly - Sistema de Gestión de Inventarios

## 🚀 Despliegue en Producción

### Backend en Render.com

#### 1. Preparar el repositorio
- ✅ Código ya está en GitHub: https://github.com/KrCrimson/stockly.git

#### 2. Crear cuenta en Render
1. Ve a [render.com](https://render.com)
2. Registrate o inicia sesión con GitHub
3. Conecta tu cuenta de GitHub

#### 3. Crear nuevo Web Service
1. Click en "New" → "Web Service"
2. Conecta tu repositorio: `KrCrimson/stockly`
3. Configura los siguientes campos:
   - **Name:** `stockly-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free` (para empezar)

#### 4. Variables de Entorno en Render
Agrega estas variables en la sección "Environment":

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/stock_management
FRONTEND_URL=https://tu-app.vercel.app
JWT_SECRET=tu_super_secreto_jwt_para_produccion_muy_largo_y_seguro
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Frontend en Vercel

#### 1. Crear cuenta en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Registrate o inicia sesión con GitHub

#### 2. Importar proyecto
1. Click en "Add New" → "Project"
2. Importa desde GitHub: `KrCrimson/stockly`
3. Configura:
   - **Framework Preset:** `Create React App`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

#### 3. Variables de Entorno en Vercel
Agrega en la sección "Environment Variables":

```bash
REACT_APP_API_URL=https://stockly-backend.onrender.com
REACT_APP_ENVIRONMENT=production
```

### Base de Datos MongoDB Atlas

#### 1. Crear cluster en MongoDB Atlas
1. Ve a [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (M0 - Free tier)
4. Configura usuario de base de datos
5. Whitelist IP addresses (0.0.0.0/0 para acceso global)
6. Obtén la connection string

#### 2. Connection String
Formato: `mongodb+srv://usuario:password@cluster.mongodb.net/stock_management`

## 📋 Lista de verificación pre-despliegue

- [ ] MongoDB Atlas cluster creado y configurado
- [ ] Variables de entorno configuradas en Render
- [ ] Variables de entorno configuradas en Vercel
- [ ] CORS configurado para permitir tu dominio de Vercel
- [ ] JWT_SECRET cambiado por uno seguro para producción
- [ ] Rate limiting configurado
- [ ] Build del frontend funciona localmente

## 🔧 URLs de producción
- **Backend:** https://stockly-backend.onrender.com
- **Frontend:** https://stockly.vercel.app (o tu dominio personalizado)

## 🚨 Seguridad
1. Nunca subas archivos `.env` al repositorio
2. Usa secretos seguros para JWT en producción
3. Configura CORS adecuadamente
4. Considera usar un dominio personalizado
5. Monitorea los logs de aplicación

## 📊 Monitoreo post-despliegue
- Render: Panel de logs y métricas
- Vercel: Analytics y logs de función
- MongoDB Atlas: Performance y usage metrics