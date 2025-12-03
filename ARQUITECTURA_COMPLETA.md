# 🏛️ ARQUITECTURA DEL PROYECTO CON REPOSITORY PATTERN

## Diagrama de capas

```
╔══════════════════════════════════════════════════════════════════╗
║                     CONTROLADORES (Controllers)                  ║
║  productController | cartController | authController             ║
║                                                                  ║
║  Responsabilidad: Recibir req, validar, delegar, responder      ║
╚══════════════════════════════════════════════════════════════════╝
                              ↓
╔══════════════════════════════════════════════════════════════════╗
║                    SERVICIOS (Services)                          ║
║  ProductService | CartService | UserService                     ║
║                                                                  ║
║  Responsabilidad: Lógica de negocio, orquestación               ║
║  Ejemplo:                                                        ║
║  - Validar datos                                                ║
║  - Calcular descuentos                                          ║
║  - Verificar permisos                                           ║
║  - Coordinar múltiples operaciones                              ║
╚══════════════════════════════════════════════════════════════════╝
                              ↓
╔══════════════════════════════════════════════════════════════════╗
║              REPOSITORIES (Abstracción de Datos) 🆕              ║
║  UserRepository | ProductRepository | CartRepository            ║
║                                                                  ║
║  Responsabilidad: Métodos específicos del dominio               ║
║  Ejemplos:                                                      ║
║  - repository.hasEnoughStock(productId, qty)                    ║
║  - repository.updateStock(productId, -5)                        ║
║  - repository.findByEmail(email)                                ║
║  - repository.getTotalItems(cartId)                             ║
║                                                                  ║
║  NO hace:                                                       ║
║  - Queries complejas de Mongoose                                ║
║  - Lógica SQL/NoSQL específica                                  ║
╚══════════════════════════════════════════════════════════════════╝
                              ↓
╔══════════════════════════════════════════════════════════════════╗
║                  DAOs (Data Access Objects)                      ║
║  ProductDAO | CartDAO | UserDAO                                 ║
║                                                                  ║
║  Responsabilidad: Operaciones CRUD puras                        ║
║  Métodos:                                                       ║
║  - create()                                                     ║
║  - findById()                                                   ║
║  - updateById()                                                 ║
║  - deleteById()                                                 ║
║  - find()                                                       ║
║  - findOne()                                                    ║
╚══════════════════════════════════════════════════════════════════╝
                              ↓
╔══════════════════════════════════════════════════════════════════╗
║                    MODELOS (Mongoose)                            ║
║  Product | User | Cart | Ticket (próximo)                       ║
║                                                                  ║
║  Responsabilidad: Esquemas y validaciones de BD                 ║
╚══════════════════════════════════════════════════════════════════╝
                              ↓
╔══════════════════════════════════════════════════════════════════╗
║                  BASE DE DATOS (MongoDB)                         ║
║                                                                  ║
║  Persistencia de datos                                          ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Flujo de una petición POST /api/products

```
REQUEST: POST /api/products
│
├─ MIDDLEWARE: 
│  ├─ validateCreateProduct (validar entrada)
│  ├─ auth (verificar JWT)
│  └─ isAdmin (solo administrador)
│
▼
┌─────────────────────────────────────┐
│ productController.createProduct()   │
│                                     │
│ const newProduct = {                │
│   title: "Llanta XYZ",             │
│   description: "...",              │
│   code: "LLT-001",                 │
│   price: 150.00,                   │
│   stock: 100,                      │
│   category: "motos"                │
│ };                                 │
│                                     │
│ const saved =                       │
│  await productService.createProduct(newProduct) │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────┐
│ productService.createProduct(data)              │
│                                                 │
│ LÓGICA DE NEGOCIO:                             │
│ 1. if (!data || typeof data !== "object")      │
│    return null                                 │
│                                                 │
│ 2. const saved =                               │
│    await this.productRepository.create(data)   │
└──────────┬──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│ productRepository.create(data)               │
│                                              │
│ MÉTODOS DISPONIBLES:                        │
│ - create()                ✓ Usa aquí        │
│ - findById()                                │
│ - findByCode()                              │
│ - hasEnoughStock()                          │
│ - updateStock()                             │
│ - findByCategory()                          │
│ - codeExists()                              │
│ - findPaginated()                           │
│                                             │
│ return await this.dao.create(data)          │
└──────────┬───────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────┐
│ productDao.create(data)            │
│                                    │
│ const nuevo = new Product(data)    │
│ return await nuevo.save()          │
└──────────┬─────────────────────────┘
           │
           ▼
┌────────────────────────────────────┐
│ MongoDB                            │
│                                    │
│ Inserta documento en colección     │
│ "llantas"                          │
└──────────┬─────────────────────────┘
           │
           ▼
RESPONSE: 201 Created
{
  "status": "success",
  "payload": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Llanta XYZ",
    "code": "LLT-001",
    "price": 150.00,
    "stock": 100,
    ...
  }
}
```

---

## Flujo de una petición GET /api/carts/:cid/checkout (próximo)

```
REQUEST: POST /api/carts/:cid/checkout
│
├─ MIDDLEWARE: auth (usuario logueado)
│
▼
┌──────────────────────────────────────────┐
│ cartController.checkout(cartId, userId)  │
│                                          │
│ const result =                           │
│  await cartService.checkout(cid, uid)    │
└──────────┬───────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│ cartService.checkout(cartId, userId)                    │
│                                                         │
│ LÓGICA DE NEGOCIO COMPLEJA:                            │
│                                                         │
│ 1. Obtener carrito con productos:                      │
│    const cart = await this.cartRepository             │
│      .findByIdWithProducts(cartId)                    │
│                                                         │
│ 2. Validar que el usuario es dueño del carrito:       │
│    if (cart.userId !== userId) throw Error            │
│                                                         │
│ 3. Para CADA producto en el carrito:                   │
│    for (const item of cart.products) {                │
│      const hasStock = await this                       │
│        .productRepository                             │
│        .hasEnoughStock(item.product._id, qty)        │
│                                                         │
│      if (!hasStock) {                                 │
│        compraIncompleta.push(item)                    │
│        continue;                                      │
│      }                                                 │
│                                                         │
│      await this.productRepository                     │
│        .updateStock(id, -qty)  // Restar stock        │
│                                                         │
│      compraCompleta.push(item)                        │
│    }                                                  │
│                                                         │
│ 4. Crear Ticket:                                       │
│    const ticket = await this.ticketRepository         │
│      .create({                                        │
│        user: userId,                                  │
│        products: compraCompleta,                      │
│        amount: totalAmount,                           │
│        status: "completed"                            │
│      })                                               │
│                                                         │
│ 5. Vaciar carrito:                                    │
│    await this.cartRepository.clearCart(cartId)        │
└──────────┬────────────────────────────────────────────┘
           │
           ▼
RESPONSE: 200 OK
{
  "status": "success",
  "ticket": { ... },
  "productsNotProcessed": [...],
  "message": "Compra completada/incompleta"
}
```

---

## Estructura de directorios actualizada

```
src/
├── app.js                          # Entry point
├── config/
│   ├── config.js
│   └── passport.config.js
│
├── controllers/                    # Capas de entrada
│   ├── productController.js
│   ├── cartController.js
│   └── authController.js
│
├── routes/                         # Rutas
│   ├── product.router.js
│   ├── cart.router.js
│   ├── session.router.js
│   └── api.router.js
│
├── middleware/                     # Middlewares
│   ├── auth.js
│   └── validation.js
│
├── services/                       # 🎯 LÓGICA DE NEGOCIO
│   ├── productService.js           # ✅ Usa Repository
│   ├── cartService.js              # ✅ Usa Repository
│   └── userService.js              # (Por refactorizar)
│
├── repositories/                   # 🆕 ABSTRACCIÓN DE DATOS
│   ├── BaseRepository.js           # Base
│   ├── UserRepository.js           # Usuarios
│   ├── ProductRepository.js        # Productos
│   ├── CartRepository.js           # Carritos
│   └── RepositoryFactory.js        # Factory
│
├── dao/                            # Data Access Objects
│   ├── productDao.js
│   ├── cartDao.js
│   └── userDao.js                  # 🆕 NUEVO
│
├── models/                         # Esquemas Mongoose
│   ├── product.model.js
│   ├── cart.model.js
│   ├── User.model.js
│   └── ticket.model.js             # (Próximo)
│
├── sockets/                        # WebSockets
│   └── index.js
│
├── views/                          # Templates Handlebars
│   ├── layouts/
│   ├── pages/
│   └── partials/
│
├── public/                         # Archivos estáticos
│   ├── css/
│   └── js/
│
└── uploads/                        # Imágenes cargadas
```

---

## Patrón de inyección de dependencias

```javascript
// ✅ Con RepositoryFactory (Inversión de Control)
class ProductService {
  constructor() {
    // El Factory crea la instancia con sus dependencias
    this.productRepository = RepositoryFactory
      .createProductRepository();
  }
  
  async createProduct(data) {
    return await this.productRepository.create(data);
  }
}

// Ventajas:
// 1. Service no conoce sobre DAO
// 2. Fácil de mockear para tests
// 3. Cambiar implementación solo afecta Factory
```

---

## Resumen de responsabilidades

| Capa | Responsabilidad | Ejemplo |
|------|-----------------|---------|
| **Controller** | Recibir req, validar, responder | HTTP status, JSON |
| **Service** | Lógica de negocio, validaciones | Checks de stock, cálculos |
| **Repository** | Métodos específicos del dominio | `hasEnoughStock()`, `updateStock()` |
| **DAO** | Operaciones CRUD puras | `create()`, `findById()` |
| **Model** | Esquemas y validaciones BD | Tipos, requeridos, índices |
| **DB** | Persistencia | MongoDB |

