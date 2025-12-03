# 📊 COMPARATIVA: ANTES vs DESPUÉS del Patrón Repository

## Organización del código

| Aspecto | ANTES | DESPUÉS |
|---------|-------|---------|
| **Carpetas** | `controllers/`, `services/`, `dao/`, `models/` | `controllers/`, `services/`, **`repositories/`**, `dao/`, `models/` |
| **Instanciación de dependencias** | Service requiere DAO directo | Service requiere Repository (via Factory) |
| **Métodos del Repository** | N/A | 50+ métodos disponibles de dominio |
| **Abstracción** | DAO expone CRUD básico | Repository expone operaciones de negocio |

---

## Comparativa de código: ProductService

### ANTES (Sin Repository Pattern)
```javascript
const mongoose = require("mongoose");
const productDao = require("../dao/productDao");  // ❌ Acople directo

class ProductService {
  
  async createProduct(data) {
    if (!data || typeof data !== "object") return null;
    // ❌ Acceso directo al DAO
    return await productDao.create(data);
  }

  async getProductById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    // ❌ Acceso directo al DAO
    return await productDao.findById(id);
  }

  async updateProductById(id, data) {
    if (!mongoose.isValidObjectId(id)) return null;
    if (!data || typeof data !== "object") return null;
    // ❌ Acceso directo al DAO
    return await productDao.updateById(id, data);
  }

  async deleteProductById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    // ❌ Acceso directo al DAO
    return await productDao.deleteById(id);
  }

  async getProductsPaginated({
    filter = {},
    sort = {},
    limit = 10,
    page = 1
  }) {
    // ❌ Acceso directo al DAO
    return await productDao.paginate(filter, {
      sort,
      limit,
      page,
      lean: true
    });
  }

  async countProducts(filter = {}) {
    // ❌ Acceso directo al DAO
    return await productDao.count(filter);
  }

  // ❌ NO HAY métodos para:
  // - Verificar stock
  // - Actualizar stock
  // - Buscar por código
  // - Buscar por categoría
}

module.exports = new ProductService();
```

**Problemas:**
- ❌ Service acoplado directamente a DAO
- ❌ No hay abstracción de acceso a datos
- ❌ Falta métodos específicos del dominio
- ❌ Difícil cambiar de BD
- ❌ Difícil de testear

---

### DESPUÉS (Con Repository Pattern)
```javascript
const mongoose = require("mongoose");
const RepositoryFactory = require("../repositories/RepositoryFactory");  // ✅ Factory pattern

class ProductService {
  constructor() {
    // ✅ Inyección de dependencia vía Factory
    this.productRepository = RepositoryFactory.createProductRepository();
  }

  async createProduct(data) {
    if (!data || typeof data !== "object") return null;
    // ✅ Usa Repository (no DAO directo)
    return await this.productRepository.create(data);
  }

  async getProductById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    // ✅ Usa Repository
    return await this.productRepository.findById(id);
  }

  async updateProductById(id, data) {
    if (!mongoose.isValidObjectId(id)) return null;
    if (!data || typeof data !== "object") return null;
    // ✅ Usa Repository
    return await this.productRepository.updateById(id, data);
  }

  async deleteProductById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    // ✅ Usa Repository
    return await this.productRepository.deleteById(id);
  }

  async getProductsPaginated({
    filter = {},
    sort = {},
    limit = 10,
    page = 1
  }) {
    // ✅ Usa Repository con método específico
    return await this.productRepository.findPaginated(filter, {
      sort,
      limit,
      page,
      lean: true
    });
  }

  async countProducts(filter = {}) {
    // ✅ Usa Repository
    return await this.productRepository.count(filter);
  }

  // ✅ NUEVOS métodos específicos del dominio
  async hasEnoughStock(productId, quantity) {
    return await this.productRepository.hasEnoughStock(productId, quantity);
  }

  async getStock(productId) {
    return await this.productRepository.getStock(productId);
  }

  async updateStock(productId, quantityChange) {
    return await this.productRepository.updateStock(productId, quantityChange);
  }
}

module.exports = new ProductService();
```

**Ventajas:**
- ✅ Service desacoplado de DAO
- ✅ Abstracción clara de acceso a datos
- ✅ Métodos específicos del dominio disponibles
- ✅ Fácil cambiar de BD (solo cambiar DAO)
- ✅ Fácil de testear (mockear Repository)

---

## Comparativa de métodos disponibles

### ANTES: Solo métodos CRUD básicos
```javascript
// DAO disponible: solo CRUD puro
productDao.create()
productDao.findById()
productDao.findAll()
productDao.updateById()
productDao.deleteById()
productDao.paginate()
productDao.count()

// ❌ Para lógica de negocio, Service debe hacer queries complejas
async checkStock(productId, qty) {
  const product = await productDao.findById(productId);  // Query 1
  return product && product.stock >= qty;               // Lógica en Service
}
```

### DESPUÉS: Métodos específicos del dominio
```javascript
// Repository disponible: 50+ métodos
// Heredados de BaseRepository:
productRepository.create()
productRepository.findById()
productRepository.findAll()
productRepository.updateById()
productRepository.deleteById()
productRepository.count()
productRepository.findPaginated()

// Específicos de ProductRepository:
productRepository.findByCode()
productRepository.codeExists()
productRepository.findByCategory()
productRepository.hasEnoughStock()       // ✅ Lógica encapsulada
productRepository.getStock()             // ✅ Lógica encapsulada
productRepository.updateStock()          // ✅ Lógica encapsulada

// ✅ Service solo orquesta:
async checkStock(productId, qty) {
  return await productRepository.hasEnoughStock(productId, qty);
}
```

---

## Comparativa de responsabilidades

| Responsabilidad | ANTES | DESPUÉS |
|-----------------|-------|---------|
| Validar entrada | Service | Service |
| Lógica de negocio | Service | Service |
| Queries complejas | Service | Repository |
| Métodos de dominio | N/A | Repository |
| CRUD puro | DAO | DAO |
| Acceso a MongoDB | DAO | DAO |

---

## Ejemplo práctico: Verificar stock + Actualizar

### ANTES
```javascript
// Service debe hacer lógica compleja
class ProductService {
  async decreaseStock(productId, quantity) {
    // Query 1: Obtener producto
    const product = await productDao.findById(productId);
    
    if (!product) throw new Error("Producto no encontrado");
    
    // Lógica en Service
    if (product.stock < quantity) {
      throw new Error("Stock insuficiente");
    }
    
    // Query 2: Actualizar
    return await productDao.updateById(productId, {
      stock: product.stock - quantity
    });
  }
}
```

**Problemas:**
- 2 queries a BD
- Lógica dispersa
- Difícil de reutilizar

### DESPUÉS
```javascript
// Repository encapsula la lógica
class ProductRepository {
  async hasEnoughStock(productId, quantity) {
    const product = await this.findById(productId);
    return product && product.stock >= quantity;
  }

  async updateStock(productId, quantityChange) {
    return await this.dao.findByIdAndUpdate(
      productId,
      { $inc: { stock: quantityChange } },
      { new: true }
    );
  }
}

// Service es limpio
class ProductService {
  async decreaseStock(productId, quantity) {
    // Verificar en 1 llamada
    const hasStock = await this.productRepository
      .hasEnoughStock(productId, quantity);
    
    if (!hasStock) throw new Error("Stock insuficiente");
    
    // Actualizar en 1 llamada (usa operador $inc de MongoDB)
    return await this.productRepository.updateStock(productId, -quantity);
  }
}
```

**Ventajas:**
- 2 queries optimizadas
- Lógica encapsulada
- Service limpio
- Reutilizable

---

## Flujo de datos

### ANTES
```
Controller
    ↓
Service (recibe, valida, orquesta, queries complejas)
    ↓
DAO (CRUD puro)
    ↓
MongoDB
```

### DESPUÉS
```
Controller
    ↓
Service (recibe, valida, orquesta)
    ↓
Repository (métodos de dominio)
    ↓
DAO (CRUD puro)
    ↓
MongoDB
```

---

## Facilidad de testing

### ANTES: Difícil de mockear
```javascript
// ❌ Difícil mockear DAO individual
const productDao = require("../dao/productDao");
jest.mock("../dao/productDao");

class ProductService {
  // DAO importado globalmente, difícil de reemplazar
}
```

### DESPUÉS: Fácil de mockear
```javascript
// ✅ Fácil mockear Repository
const mockRepository = {
  hasEnoughStock: jest.fn().mockResolvedValue(true),
  updateStock: jest.fn()
};

class ProductService {
  constructor() {
    this.productRepository = mockRepository;  // Inyectar mock
  }
}
```

---

## Ejemplo de migración de BD

### Si cambias MongoDB → PostgreSQL

#### ANTES
```javascript
// ❌ Cambios dispersos

// En Service:
const product = await productDao.findById(id);  // DAO cambió

// En DAO:
const product = await Product.findById(id);  // Mongoose → Sequelize

// En Controller: Sin cambios (felicidad)
const product = await productService.getProductById(id);
```

#### DESPUÉS
```javascript
// ✅ Cambios solo en DAO

// En Repository: Sin cambios
await this.dao.findById(id);  // Same interface

// En DAO: Cambio solo aquí
async findById(id) {
  // Antes: MongoDB
  return await Product.findById(id);  // Mongoose
  
  // Después: PostgreSQL
  return await db.query("SELECT * FROM products WHERE id = ?", [id]);
}

// En Service: Sin cambios
await this.productRepository.findById(id);

// En Controller: Sin cambios
await productService.getProductById(id);
```

**Cambios necesarios:**
- ANTES: 30+ lugares ❌
- DESPUÉS: Solo DAO ✅

---

## Resumen: ¿Por qué esta arquitectura es mejor?

| Beneficio | Impacto |
|-----------|--------|
| **Separación de responsabilidades** | Código más mantenible |
| **Abstracción de datos** | Fácil cambiar de BD |
| **Métodos de dominio** | Código de negocio más limpio |
| **Factory Pattern** | Inyección de dependencias centralizada |
| **Testing** | Mocking simple y aislado |
| **Reutilización** | Repositorio usado por múltiples Services |
| **Documentación** | Métodos de Repository documentan el dominio |
| **Escalabilidad** | Fácil agregar nuevos métodos sin afectar Service |

