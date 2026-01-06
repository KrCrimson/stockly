# Stock Management API

Backend API para sistema de gestión de inventario construido con Node.js, Express y MongoDB.

## 🚀 Características

- **Gestión de Productos**: CRUD completo con categorización
- **Movimientos de Stock**: Tracking de entradas, salidas y ajustes
- **Dashboard Analytics**: Estadísticas y tendencias en tiempo real
- **Validación Robusta**: Usando Joi para validación de esquemas
- **API RESTful**: Endpoints bien estructurados y documentados
- **MongoDB**: Base de datos NoSQL flexible
- **Middleware de Seguridad**: Helmet, CORS, Rate Limiting

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/     # Controladores de rutas
│   ├── models/         # Modelos de Mongoose
│   ├── routes/         # Definición de rutas
│   ├── middleware/     # Middleware personalizado
│   ├── config/         # Configuración de base de datos
│   └── app.js         # Aplicación principal
├── package.json
└── .env.example
```

## 🛠 Instalación

1. **Instalar dependencias**:
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   Editar `.env` con tu configuración de MongoDB.

3. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

## 📊 API Endpoints

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto específico
- `POST /api/products` - Crear nuevo producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto (soft delete)
- `PATCH /api/products/:id/stock` - Actualizar stock
- `GET /api/products/low-stock` - Productos con stock bajo
- `GET /api/products/categories` - Listar categorías

### Movimientos de Stock
- `GET /api/stock-movements` - Listar movimientos
- `GET /api/stock-movements/:id` - Obtener movimiento específico
- `POST /api/stock-movements` - Crear movimiento
- `POST /api/stock-movements/:id/reverse` - Reversar movimiento
- `GET /api/stock-movements/product/:id/history` - Historial por producto
- `GET /api/stock-movements/stats` - Estadísticas de movimientos

### Dashboard
- `GET /api/dashboard` - Dashboard principal
- `GET /api/dashboard/trends` - Análisis de tendencias
- `POST /api/dashboard/reports` - Reportes personalizados

## 🗄 Modelos de Datos

### Product
```javascript
{
  name: String,           // Nombre del producto
  description: String,    // Descripción
  sku: String,           // SKU único
  category: String,       // Categoría
  unitPrice: Number,      // Precio unitario
  currentStock: Number,   // Stock actual
  minStockLevel: Number,  // Nivel mínimo de stock
  maxStockLevel: Number,  // Nivel máximo de stock
  supplier: {
    name: String,
    contact: String
  },
  isActive: Boolean,
  tags: [String],
  timestamps: true
}
```

### StockMovement
```javascript
{
  product: ObjectId,      // Referencia al producto
  type: String,          // IN, OUT, ADJUSTMENT, TRANSFER
  quantity: Number,       // Cantidad
  reason: String,        // Razón del movimiento
  reference: String,      // Referencia externa
  notes: String,         // Notas adicionales
  previousStock: Number,  // Stock anterior
  newStock: Number,      // Nuevo stock
  performedBy: String,   // Usuario que realizó
  warehouse: String,     // Almacén
  timestamps: true
}
```

## 🔧 Scripts Disponibles

- `npm start` - Ejecutar en producción
- `npm run dev` - Ejecutar en desarrollo con nodemon
- `npm test` - Ejecutar tests
- `npm run test:watch` - Tests en modo watch

## 🛡 Seguridad

- **Helmet**: Headers de seguridad
- **CORS**: Configuración de Cross-Origin Resource Sharing
- **Rate Limiting**: Limitación de requests por IP
- **Validación**: Validación robusta con Joi
- **Error Handling**: Manejo centralizado de errores

## 📝 Uso Ejemplo

```javascript
// Crear un producto
POST /api/products
{
  "name": "Producto Ejemplo",
  "sku": "PROD-001",
  "category": "Electrónicos",
  "unitPrice": 99.99,
  "minStockLevel": 10
}

// Registrar entrada de stock
POST /api/stock-movements
{
  "product": "product_id",
  "type": "IN",
  "quantity": 50,
  "reason": "PURCHASE",
  "performedBy": "admin"
}
```