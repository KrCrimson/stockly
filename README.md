# Stock Management System

Sistema completo de gestión de inventario construido con **React**, **Node.js** y **MongoDB**.

## 🏗 Arquitectura

```
📁 Stock Management/
├── 📁 backend/          # API Node.js + Express + MongoDB
├── 📁 frontend/         # Aplicación React + TypeScript
└── 📄 README.md         # Este archivo
```

## 🚀 Características

### Backend (Node.js + MongoDB)
- ✅ **API RESTful completa** con Express.js
- ✅ **Base de datos MongoDB** con Mongoose
- ✅ **Validación robusta** con Joi
- ✅ **Seguridad** (Helmet, CORS, Rate Limiting)
- ✅ **Gestión de productos** con categorización
- ✅ **Tracking de movimientos** de stock
- ✅ **Dashboard con analytics** en tiempo real
- ✅ **Sistema de alertas** para stock bajo

### Frontend (React + TypeScript)
- 🔄 **Interfaz moderna** con React 18
- 🔄 **TypeScript** para type safety
- 🔄 **React Router** para navegación
- 🔄 **State Management** con Context API
- 🔄 **Dashboard interactivo** con charts
- 🔄 **Formularios de gestión** de inventario
- 🔄 **Reportes y analytics** visuales

## 🛠 Instalación y Configuración

### 1. Prerrequisitos
- **Node.js** 18+ 
- **MongoDB** (local o Atlas)
- **Git**

### 2. Backend Setup
```bash
# Navegar al backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu MongoDB URI

# Ejecutar en desarrollo
npm run dev
```

### 3. Frontend Setup
```bash
# Navegar al frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start
```

### 4. Acceso a la Aplicación
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📊 Funcionalidades del Sistema

### 🏷 Gestión de Productos
- Crear, editar y eliminar productos
- Categorización y etiquetado
- Gestión de proveedores
- Control de precios y SKUs únicos
- Niveles mínimos y máximos de stock

### 📦 Movimientos de Stock
- **Entradas**: Compras, transferencias, ajustes
- **Salidas**: Ventas, devoluciones, mermas
- **Historial completo** de movimientos
- **Reversión** de movimientos erróneos
- **Auditoría** con timestamp y usuario

### 📈 Dashboard y Analytics
- **Estadísticas generales** del inventario
- **Productos con stock crítico**
- **Top productos** por movimientos
- **Tendencias** de entrada/salida
- **Valor total** del inventario
- **Reportes personalizados**

### 🚨 Sistema de Alertas
- **Stock bajo**: Productos bajo nivel mínimo
- **Stock alto**: Productos sobre nivel máximo
- **Productos inactivos**: Sin movimientos recientes
- **Vencimientos**: Productos próximos a vencer

## 🔌 API Endpoints

### Productos
```
GET    /api/products           # Listar productos
POST   /api/products           # Crear producto
GET    /api/products/:id       # Obtener producto
PUT    /api/products/:id       # Actualizar producto
DELETE /api/products/:id       # Eliminar producto
GET    /api/products/low-stock # Stock crítico
```

### Movimientos
```
GET    /api/stock-movements    # Listar movimientos
POST   /api/stock-movements    # Crear movimiento
GET    /api/stock-movements/:id # Obtener movimiento
POST   /api/stock-movements/:id/reverse # Reversar
```

### Dashboard
```
GET    /api/dashboard          # Dashboard principal
GET    /api/dashboard/trends   # Análisis tendencias
POST   /api/dashboard/reports  # Reportes custom
```

## 🗄 Esquema de Datos

### Producto
```typescript
interface Product {
  name: string;
  description?: string;
  sku: string;           // Único
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  supplier?: {
    name: string;
    contact: string;
  };
  isActive: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Movimiento de Stock
```typescript
interface StockMovement {
  product: ObjectId;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  reason: string;
  reference?: string;
  notes?: string;
  previousStock: number;
  newStock: number;
  performedBy: string;
  warehouse: string;
  createdAt: Date;
}
```

## 🔧 Scripts Disponibles

### Backend
```bash
npm start          # Producción
npm run dev        # Desarrollo con nodemon
npm test           # Tests con Jest
```

### Frontend
```bash
npm start          # Desarrollo
npm run build      # Build para producción
npm test           # Tests con Jest
npm run eject      # Eject de CRA (irreversible)
```

## 🛡 Seguridad Implementada

- **Validación de esquemas** con Joi
- **Rate limiting** para prevenir abuso
- **CORS** configurado para frontend
- **Headers de seguridad** con Helmet
- **Sanitización** de inputs
- **Manejo de errores** centralizado

## 🚀 Despliegue

### Desarrollo Local
1. MongoDB local o Atlas
2. Backend en puerto 5000
3. Frontend en puerto 3000

### Producción
- **Backend**: Heroku, Railway, DigitalOcean
- **Frontend**: Vercel, Netlify
- **Database**: MongoDB Atlas
- **Variables de entorno** configuradas

## 📝 Próximas Características

- [ ] **Autenticación** con JWT
- [ ] **Roles y permisos** de usuario
- [ ] **Códigos de barras** scanning
- [ ] **Reportes en PDF/Excel**
- [ ] **Notificaciones push**
- [ ] **API de terceros** para proveedores
- [ ] **Multi-tenant** para empresas
- [ ] **Móvil app** con React Native

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**¡Perfecto!** Has creado un sistema completo de gestión de inventario con las tecnologías modernas: **React + Node.js + MongoDB**. 🎉

A professional inventory management system built with Clean Architecture, implementing Event Sourcing patterns for reliable stock tracking.

## 🏗️ Architecture

This project follows Clean Architecture principles with clear separation of concerns:

- **Core**: Domain entities, value objects, and business rules
- **Application**: Use cases, DTOs, and application services
- **Infrastructure**: Data persistence, external services, and caching
- **Presentation**: API controllers, middleware, and filters

## 🚀 Quick Start

### Prerequisites
- .NET 8 SDK
- PostgreSQL 15+
- Docker (optional)

### Running with Docker
```bash
cd tools/docker
docker-compose up -d
```

### Running Locally
```bash
# Restore packages
dotnet restore src/Presentation/API/

# Run migrations
./tools/scripts/migrate-database.sh

# Start the application
dotnet run --project src/Presentation/API/
```

## 📋 Features

- ✅ Product management with validation
- ✅ Stock movement tracking (Event Sourcing)
- ✅ Automatic stock calculation
- ✅ Low stock alerts
- ✅ Audit trail for all operations
- ✅ Soft delete functionality
- ✅ RESTful API with Swagger documentation

## 🧪 Testing

```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

## 📚 Documentation

- [API Documentation](docs/api-documentation.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Architecture Decisions](docs/architecture-decisions.md)
- [Project Structure](project-structure.md)
- [Product Backlog](backlog.md)

## 🛠️ Development

This project follows Scrum methodology with clearly defined user stories and acceptance criteria. Check the [backlog](backlog.md) for current sprint planning and progress tracking.

## 📊 Key Principles

1. **Stock is never modified directly** - Always calculated from movements
2. **Movements are immutable** - Event sourcing ensures data integrity
3. **Business rules in Use Cases** - Clean separation of concerns
4. **Comprehensive testing** - Unit, Integration, and E2E tests

## 🤝 Contributing

1. Follow the existing Clean Architecture structure
2. Write tests for all new functionality
3. Update documentation as needed
4. Follow the established coding standards