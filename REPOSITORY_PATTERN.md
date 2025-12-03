# 🏗️ PATRÓN REPOSITORY - Guía Completa

## 📚 Estructura Implementada

```
src/
├── repositories/              # 🎯 NUEVA CAPA - Abstracción de datos
│   ├── BaseRepository.js      # Clase base con métodos comunes
│   ├── UserRepository.js      # Métodos específicos de usuarios
│   ├── ProductRepository.js   # Métodos específicos de productos
│   ├── CartRepository.js      # Métodos específicos de carritos
│   └── RepositoryFactory.js   # Factory para instanciar repositories
│
├── services/                  # Lógica de negocio
│   ├── productService.js      # ✅ REFACTORIZADO - Ahora usa Repository
│   ├── cartService.js         # ✅ REFACTORIZADO - Ahora usa Repository
│   └── userService.js         # (Si existe, también refactorizar)
│
├── controllers/               # Controladores (sin cambios)
│
├── dao/                       # Data Access Objects (sin cambios internos)
│   ├── productDao.js         # ✅ Mejorado con métodos faltantes
│   ├── cartDao.js
│   └── userDao.js             # 🆕 NUEVO - Agregado
│
└── models/                    # Modelos Mongoose (sin cambios)
```

---

## 🔄 FLUJO DE DATOS CON REPOSITORY PATTERN

### ANTES (Sin Repository):
```
┌─────────────┐
│ Controller  │
└──────┬──────┘
       │ req, res
       ▼
┌─────────────────────┐
│ ProductService      │
│ (lógica negocio)    │
└──────┬──────────────┘
       │ accede directo
       ▼
┌──────────────────────┐
│ ProductDAO           │
│ (acceso a datos)     │
└──────┬───────────────┘
       │
       ▼
    MongoDB
```

### DESPUÉS (Con Repository):
```
┌─────────────┐
│ Controller  │
└──────┬──────┘
       │ req, res
       ▼
┌──────────────────────────┐
│ ProductService           │
│ (lógica de negocio)      │ ← Valida, procesa, orquesta
└──────┬───────────────────┘
       │ usa métodos
       ▼
┌──────────────────────────┐
│ ProductRepository        │ ← Abstrae el DAO
│ (interfaz de datos)      │   Métodos específicos de dominio
└──────┬───────────────────┘
       │ delega
       ▼
┌──────────────────────────┐
│ ProductDAO               │ ← Operaciones CRUD puras
│ (acceso a BD)            │
└──────┬───────────────────┘
       │
       ▼
    MongoDB
```

---

## 💡 EJEMPLO PRÁCTICO - Agregando un producto

### 1️⃣ Controller recibe la petición:
```javascript
// controllers/productController.js
async createProduct(req, res) {
  const { title, description, code, price, stock, category } = req.body;
  
  const newProduct = {
    title, description, code,
    price: parseFloat(price),
    stock: parseInt(stock),
    category
  };

  const saved = await productService.createProduct(newProduct);
  res.status(201).json({ status: "success", payload: saved });
}
```

### 2️⃣ Service ejecuta lógica de negocio:
```javascript
// services/productService.js (REFACTORIZADO)
async createProduct(data) {
  // Validaciones de lógica de negocio
  if (!data || typeof data !== "object") return null;
  
  // Usa Repository (no DAO directo)
  return await this.productRepository.create(data);
}
```

### 3️⃣ Repository abstrae el acceso a datos:
```javascript
// repositories/ProductRepository.js
async create(data) {
  // Delega al DAO
  return await this.dao.create(data);
}

// Pero también ofrece métodos específicos del dominio:
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
```

### 4️⃣ DAO accede a la base de datos:
```javascript
// dao/productDao.js
async create(data) {
  const nuevo = new Product(data);
  return await nuevo.save();
}

async findByIdAndUpdate(id, data, options) {
  return await Product.findByIdAndUpdate(id, data, options);
}
```

---

## 🎁 BENEFICIOS DEL PATRÓN REPOSITORY

### 1. **Separación de Responsabilidades** ✅
```javascript
// Service: Solo lógica de negocio
async checkoutCart(cartId, userId) {
  const cart = await this.cartRepository.findByIdWithProducts(cartId);
  if (!cart) throw new Error("Carrito no encontrado");
  
  for (const item of cart.products) {
    const hasStock = await this.productRepository.hasEnoughStock(
      item.product._id,
      item.quantity
    );
    if (!hasStock) throw new Error("Stock insuficiente");
  }
  
  // Procesar compra...
}

// Repository: Solo abstrae datos
async hasEnoughStock(productId, quantity) {
  const product = await this.findById(productId);
  return product && product.stock >= quantity;
}

// DAO: Solo operaciones CRUD
async findByIdAndUpdate(id, data, options) {
  return await Product.findByIdAndUpdate(id, data, options);
}
```

### 2. **Fácil de cambiar de BD** 🔄
Si mañana cambias MongoDB por PostgreSQL:
- ❌ Modificarías DAOs y Services
- ✅ Modificarías solo el DAO, Services y Repository quedan igual

```javascript
// Hoy: MongoDB
class ProductDAO {
  async create(data) {
    const nuevo = new Product(data);
    return await nuevo.save();  // Mongoose
  }
}

// Mañana: PostgreSQL (Repository y Service sin cambios)
class ProductDAO {
  async create(data) {
    return await db.products.create(data);  // Sequelize/Knex
  }
}
```

### 3. **Métodos específicos del dominio** 🎯
El Repository ofrece métodos que tienen sentido en el negocio:

```javascript
// Repository ofrece:
await productRepository.hasEnoughStock(productId, quantity);
await productRepository.updateStock(productId, -5);  // Restar 5
await productRepository.findByCategory("llantas");
await productRepository.codeExists(productCode);

// NO OBLIGA a usar:
await productRepository.findAll()
  .then(p => p.filter(x => x.stock >= qty))
  .then(p => p.filter(x => x.category === "llantas"))
```

### 4. **Testing simplificado** 🧪
```javascript
// Mock del Repository para tests
const mockRepository = {
  hasEnoughStock: jest.fn().mockResolvedValue(true),
  updateStock: jest.fn().mockResolvedValue({ stock: 5 }),
};

// Service usa el mock sin problemas
const service = new ProductService();
service.productRepository = mockRepository;

// Testear lógica sin tocar BD
await service.processCheckout(...);
```

### 5. **Transacciones más fáciles** 💫
El Repository puede manejar transacciones atómicas:

```javascript
class CartRepository {
  async checkout(cartId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      await this.clearCart(cartId, { session });
      await User.updateOne(
        { _id: userId },
        { cart: null },
        { session }
      );
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
```

---

## 🚀 CÓMO USAR LOS REPOSITORIES

### En Services:
```javascript
const RepositoryFactory = require("../repositories/RepositoryFactory");

class ProductService {
  constructor() {
    // ✅ Inyectar Repository
    this.productRepository = RepositoryFactory.createProductRepository();
  }

  async createProduct(data) {
    return await this.productRepository.create(data);
  }

  async getProductById(id) {
    return await this.productRepository.findById(id);
  }

  async checkStock(productId, quantity) {
    return await this.productRepository.hasEnoughStock(productId, quantity);
  }
}
```

### Métodos disponibles por Repository:

#### **BaseRepository** (todos usan):
```javascript
create(data)                // Crear
findById(id, options)       // Obtener por ID
findAll()                   // Obtener todos
updateById(id, data)        // Actualizar
deleteById(id)              // Eliminar
count(filter)               // Contar
```

#### **ProductRepository** (específicos):
```javascript
findPaginated(filter, options)    // Con paginación
findByCode(code)                  // Por código
codeExists(code)                  // Existe código?
findByCategory(category)          // Por categoría
updateStock(productId, change)    // Actualizar stock
hasEnoughStock(productId, qty)    // Hay stock?
getStock(productId)               // Obtener stock actual
```

#### **UserRepository** (específicos):
```javascript
findByEmail(email)                // Por email
findByIdWithCart(userId)          // Usuario con carrito
updateUserCart(userId, cartId)    // Asignar carrito
emailExists(email)                // Existe email?
```

#### **CartRepository** (específicos):
```javascript
findByIdWithProducts(cartId)      // Con productos poblados
addProduct(cartId, productId, qty)  // Agregar producto
removeProduct(cartId, productId)  // Eliminar producto
getProductQuantity(cartId, pid)   // Cantidad de producto
updateQuantity(cartId, pid, qty)  // Actualizar cantidad
clearCart(cartId)                 // Vaciar carrito
getTotalItems(cartId)             // Items totales
replaceProducts(cartId, products) // Reemplazar todos
```

---

## ✅ VERIFICACIÓN - Todo funciona igual

Los cambios son **completamente transparentes** para Controllers:

```javascript
// Controllers NO necesitan cambios ✅
async createProduct(req, res) {
  const saved = await productService.createProduct(req.body);
  res.json({ status: "success", payload: saved });
}

// Internamente:
// Controller → Service → Repository → DAO → BD
// (Antes era: Controller → Service → DAO → BD)
```

---

## 📝 Próximos pasos

Con el Patrón Repository implementado, ahora es más fácil:
1. ✅ Agregar validaciones de negocio
2. ✅ Implementar DTOs (siguiente paso)
3. ✅ Crear lógica de compra compleja
4. ✅ Manejar transacciones
5. ✅ Testear sin tocar la BD

---

## 🔗 Referencias
- [Repository Pattern - Martin Fowler](https://martinfowler.com/eaaCatalog/repository.html)
- [Domain Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design)
