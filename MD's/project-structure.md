# 🏗️ ESTRUCTURA DEL PROYECTO - Sistema de Inventario

## 🎯 Arquitectura General

### Patrón Arquitectónico: Clean Architecture
```
┌─────────────────────────────────────────────────┐
│                 FRAMEWORKS                      │
│           (Web, Database, External)             │
├─────────────────────────────────────────────────┤
│              INTERFACE ADAPTERS                 │
│         (Controllers, Gateways, Presenters)     │
├─────────────────────────────────────────────────┤
│                USE CASES                        │
│              (Business Rules)                   │
├─────────────────────────────────────────────────┤
│                  ENTITIES                       │
│              (Enterprise Rules)                 │
└─────────────────────────────────────────────────┘
```

### Principios SOLID Aplicados
- **SRP**: Cada clase tiene una responsabilidad específica
- **OCP**: Extensible sin modificar código existente
- **LSP**: Implementaciones intercambiables
- **ISP**: Interfaces específicas y cohesivas
- **DIP**: Dependencias invertidas mediante abstracciones

---

## 📂 Estructura de Carpetas

```
Stock-Management-System/
├── 📁 src/
│   ├── 📁 Core/                          # Capa de Dominio
│   │   ├── 📁 Entities/
│   │   │   ├── 📄 Product.cs
│   │   │   ├── 📄 StockMovement.cs
│   │   │   └── 📄 AuditLog.cs
│   │   ├── 📁 ValueObjects/
│   │   │   ├── 📄 ProductCode.cs
│   │   │   ├── 📄 MovementType.cs
│   │   │   └── 📄 ProductStatus.cs
│   │   ├── 📁 Interfaces/
│   │   │   ├── 📄 IProductRepository.cs
│   │   │   ├── 📄 IMovementRepository.cs
│   │   │   └── 📄 IStockCalculator.cs
│   │   └── 📁 Exceptions/
│   │       ├── 📄 InsufficientStockException.cs
│   │       └── 📄 DomainException.cs
│   │
│   ├── 📁 Application/                    # Capa de Casos de Uso
│   │   ├── 📁 UseCases/
│   │   │   ├── 📁 Products/
│   │   │   │   ├── 📄 CreateProductUseCase.cs
│   │   │   │   ├── 📄 UpdateProductUseCase.cs
│   │   │   │   ├── 📄 DeleteProductUseCase.cs
│   │   │   │   └── 📄 GetProductsUseCase.cs
│   │   │   └── 📁 Movements/
│   │   │       ├── 📄 RegisterStockInUseCase.cs
│   │   │       ├── 📄 RegisterStockOutUseCase.cs
│   │   │       └── 📄 GetMovementsHistoryUseCase.cs
│   │   ├── 📁 DTOs/
│   │   │   ├── 📄 ProductDto.cs
│   │   │   ├── 📄 MovementDto.cs
│   │   │   └── 📄 StockStatusDto.cs
│   │   ├── 📁 Validators/
│   │   │   ├── 📄 ProductValidator.cs
│   │   │   └── 📄 MovementValidator.cs
│   │   └── 📁 Services/
│   │       ├── 📄 StockCalculatorService.cs
│   │       └── 📄 AlertService.cs
│   │
│   ├── 📁 Infrastructure/                 # Capa de Infraestructura
│   │   ├── 📁 Data/
│   │   │   ├── 📁 Context/
│   │   │   │   └── 📄 InventoryDbContext.cs
│   │   │   ├── 📁 Repositories/
│   │   │   │   ├── 📄 ProductRepository.cs
│   │   │   │   └── 📄 MovementRepository.cs
│   │   │   ├── 📁 Configurations/
│   │   │   │   ├── 📄 ProductConfiguration.cs
│   │   │   │   └── 📄 MovementConfiguration.cs
│   │   │   └── 📁 Migrations/
│   │   ├── 📁 External/
│   │   │   ├── 📄 EmailService.cs
│   │   │   └── 📄 LoggingService.cs
│   │   └── 📁 Cache/
│   │       └── 📄 StockCacheService.cs
│   │
│   └── 📁 Presentation/                   # Capa de Presentación
│       ├── 📁 API/
│       │   ├── 📁 Controllers/
│       │   │   ├── 📄 ProductsController.cs
│       │   │   ├── 📄 MovementsController.cs
│       │   │   └── 📄 ReportsController.cs
│       │   ├── 📁 Middleware/
│       │   │   ├── 📄 ErrorHandlingMiddleware.cs
│       │   │   └── 📄 AuditMiddleware.cs
│       │   └── 📁 Filters/
│       │       └── 📄 ValidationFilter.cs
│       └── 📁 Web/                       # Frontend (si se implementa)
│           ├── 📁 Components/
│           ├── 📁 Pages/
│           └── 📁 Services/
│
├── 📁 tests/                             # Testing
│   ├── 📁 UnitTests/
│   │   ├── 📁 Core/
│   │   ├── 📁 Application/
│   │   └── 📁 Infrastructure/
│   ├── 📁 IntegrationTests/
│   └── 📁 E2ETests/
│
├── 📁 docs/                              # Documentación
│   ├── 📄 api-documentation.md
│   ├── 📄 deployment-guide.md
│   └── 📄 architecture-decisions.md
│
└── 📁 tools/                             # Herramientas y Scripts
    ├── 📁 scripts/
    ├── 📁 docker/
    └── 📁 postman/
```

---

## 🧩 Componentes Principales

### 1. **Core Layer (Dominio)**

#### Entities
```csharp
public class Product : BaseEntity
{
    public ProductCode Code { get; private set; }
    public string Name { get; private set; }
    public int MinimumStock { get; private set; }
    public ProductStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? DeletedAt { get; private set; }
    
    // Business Methods
    public void UpdateMinimumStock(int newMinimum);
    public void MarkAsDeleted();
    public bool IsActive => DeletedAt == null && Status != ProductStatus.Inactive;
}
```

#### Value Objects
```csharp
public class MovementType : ValueObject
{
    public static readonly MovementType StockIn = new("STOCK_IN");
    public static readonly MovementType StockOut = new("STOCK_OUT");
    
    public string Value { get; private set; }
    // Validation logic here
}
```

### 2. **Application Layer (Casos de Uso)**

#### Use Case Example
```csharp
public class RegisterStockOutUseCase
{
    private readonly IProductRepository _productRepo;
    private readonly IMovementRepository _movementRepo;
    private readonly IStockCalculator _stockCalculator;
    
    public async Task<Result> ExecuteAsync(RegisterStockOutRequest request)
    {
        // 1. Validar entrada
        // 2. Obtener producto
        // 3. Calcular stock actual
        // 4. Validar stock suficiente
        // 5. Registrar movimiento
        // 6. Actualizar estado del producto
        // 7. Retornar resultado
    }
}
```

### 3. **Infrastructure Layer**

#### Repository Implementation
```csharp
public class ProductRepository : IProductRepository
{
    private readonly InventoryDbContext _context;
    private readonly IMapper _mapper;
    
    public async Task<Product> GetByIdAsync(Guid id)
    {
        var entity = await _context.Products
            .Where(p => p.DeletedAt == null)
            .FirstOrDefaultAsync(p => p.Id == id);
            
        return _mapper.Map<Product>(entity);
    }
}
```

---

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: .NET 8 / ASP.NET Core
- **ORM**: Entity Framework Core
- **Database**: PostgreSQL (principal) / SQL Server (alternativa)
- **Cache**: Redis (opcional para optimización)
- **API Documentation**: Swagger/OpenAPI
- **Testing**: xUnit + Moq + FluentAssertions
- **Logging**: Serilog
- **Validation**: FluentValidation

### Frontend (Opcional)
- **Framework**: React/Vue.js/Angular
- **State Management**: Redux/Vuex/NgRx
- **UI Components**: Material-UI/Vuetify/Angular Material
- **HTTP Client**: Axios/Fetch API
- **Testing**: Jest + Testing Library

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions / Azure DevOps
- **Monitoring**: Application Insights / Prometheus
- **Documentation**: Swagger UI + Markdown

---

## 🗄️ Modelo de Base de Datos

### Tablas Principales

```sql
-- Productos
CREATE TABLE Products (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Code NVARCHAR(20) UNIQUE NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    MinimumStock INT NOT NULL DEFAULT 0,
    Status NVARCHAR(20) NOT NULL,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NOT NULL,
    DeletedAt DATETIME2 NULL,
    
    INDEX IX_Products_Code (Code),
    INDEX IX_Products_Status (Status),
    INDEX IX_Products_DeletedAt (DeletedAt)
);

-- Movimientos de Stock
CREATE TABLE StockMovements (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    ProductId UNIQUEIDENTIFIER NOT NULL,
    Type NVARCHAR(20) NOT NULL, -- STOCK_IN, STOCK_OUT
    Quantity DECIMAL(18,2) NOT NULL,
    Reason NVARCHAR(100) NOT NULL,
    UserId UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIME2 NOT NULL,
    
    FOREIGN KEY (ProductId) REFERENCES Products(Id),
    INDEX IX_Movements_ProductId (ProductId),
    INDEX IX_Movements_Type (Type),
    INDEX IX_Movements_CreatedAt (CreatedAt)
);

-- Auditoría (opcional)
CREATE TABLE AuditLogs (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    EntityType NVARCHAR(50) NOT NULL,
    EntityId UNIQUEIDENTIFIER NOT NULL,
    Action NVARCHAR(20) NOT NULL,
    Changes NTEXT NULL,
    UserId UNIQUEIDENTIFIER NULL,
    Timestamp DATETIME2 NOT NULL,
    IpAddress NVARCHAR(45) NULL
);
```

### Views para Optimización

```sql
-- Vista de Stock Actual (Opcional - para performance)
CREATE VIEW vw_ProductStock AS
SELECT 
    p.Id,
    p.Code,
    p.Name,
    p.Status,
    p.MinimumStock,
    COALESCE(
        (SELECT SUM(CASE WHEN Type = 'STOCK_IN' THEN Quantity ELSE -Quantity END)
         FROM StockMovements sm 
         WHERE sm.ProductId = p.Id), 0
    ) AS CurrentStock,
    p.DeletedAt
FROM Products p;
```

---

## 🔄 Flujos de Datos Principales

### 1. **Registro de Entrada de Stock**
```
Usuario → Controller → UseCase → Validator → Repository → Database
    ↑                                                          ↓
Cache ← StockCalculator ← EventHandler ← Domain Event ← Entity
```

### 2. **Consulta de Stock Actual**
```
Request → Controller → UseCase → StockCalculator → Query → Result
                                      ↓
                              Cache (opcional)
```

### 3. **Validación de Stock Suficiente**
```
StockOut Request → UseCase → StockCalculator → Business Rule → Result
                                ↑
                         Current Stock Query
```

---

## 📊 Patrones de Diseño Aplicados

### Domain-Driven Design (DDD)
- **Aggregates**: Product como aggregate root
- **Value Objects**: ProductCode, MovementType
- **Domain Events**: StockUpdated, ProductCreated
- **Repository Pattern**: Abstracción de persistencia

### Event Sourcing (Simplificado)
- Los movimientos actúan como eventos inmutables
- El estado (stock) se deriva de la secuencia de eventos
- Posibilidad de reconstruir el estado en cualquier momento

### CQRS (Command Query Responsibility Segregation)
- Commands: RegisterStockIn, RegisterStockOut
- Queries: GetCurrentStock, GetMovementHistory
- Separación de modelos de lectura y escritura

### Factory Pattern
- ProductFactory para crear productos con reglas específicas
- MovementFactory para validar y crear movimientos

---

## 🧪 Estrategia de Testing

### Testing Pyramid

```
        E2E Tests (5%)
    ┌─────────────────────┐
    │  API Integration    │
    └─────────────────────┘
  
     Integration Tests (15%)
  ┌───────────────────────────┐
  │ Repository + Database     │
  │ Use Case + Dependencies   │
  └───────────────────────────┘

        Unit Tests (80%)
┌─────────────────────────────────┐
│    Entities + Value Objects     │
│    Use Cases (Mocked)           │
│    Services + Validators        │
└─────────────────────────────────┘
```

### Test Categories

#### Unit Tests
- **Entities**: Comportamiento de negocio
- **Value Objects**: Validaciones y equality
- **Use Cases**: Lógica de negocio aislada
- **Services**: Cálculos y transformaciones

#### Integration Tests
- **Repositories**: Persistencia real
- **API Controllers**: Request/Response completo
- **External Services**: Servicios de terceros

#### E2E Tests
- **User Journeys**: Flujos completos del usuario
- **API Workflows**: Secuencias de operaciones

---

## 🚀 Estrategia de Despliegue

### Ambientes

```
Development → Testing → Staging → Production
     ↑            ↑         ↑          ↑
   Local      Integration  UAT     Live System
```

### Containerization

```dockerfile
# Ejemplo Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet build --no-restore

FROM build AS test
RUN dotnet test --no-build

FROM build AS publish
RUN dotnet publish --no-restore -o /app

FROM base AS final
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "InventorySystem.API.dll"]
```

### CI/CD Pipeline

```yaml
# .github/workflows/main.yml
stages:
  - build
  - test
  - security-scan
  - deploy-staging
  - integration-tests
  - deploy-production
```

---

## 📈 Consideraciones de Escalabilidad

### Performance Optimizations
1. **Database Indexing**: Índices en campos frecuentemente consultados
2. **Caching Strategy**: Redis para stock actual calculado
3. **Query Optimization**: Proyecciones específicas en LINQ
4. **Pagination**: Límites en listados grandes

### Horizontal Scaling
1. **Stateless Design**: APIs sin estado de sesión
2. **Database Sharding**: Por producto o fecha si es necesario
3. **Microservices**: Separación por bounded contexts
4. **Event-Driven Architecture**: Para sincronización entre servicios

### Monitoring & Observability
1. **Application Performance Monitoring (APM)**
2. **Business Metrics**: KPIs del inventario
3. **Error Tracking**: Logs centralizados
4. **Health Checks**: Endpoints de salud del sistema

---

## 🔒 Consideraciones de Seguridad

### Authentication & Authorization
- JWT Tokens para autenticación
- Role-based access control (RBAC)
- Rate limiting en APIs críticas

### Data Protection
- Validación de entrada estricta
- SQL injection prevention (EF Core)
- Audit trail completo
- Backup y recovery automático

### Compliance
- Registro de todas las operaciones
- Retention policies para logs
- Data privacy (opcional GDPR)

---

Esta estructura proporciona una base sólida para implementar el sistema de inventario siguiendo las mejores prácticas de desarrollo de software y permitiendo escalabilidad futura.