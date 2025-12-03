# 🚀 GUÍA RÁPIDA - Cómo usar los Repositories

## 1️⃣ En los Services

### ProductService - Ejemplo completo

```javascript
const RepositoryFactory = require("../repositories/RepositoryFactory");

class ProductService {
  constructor() {
    // ✅ Inyectar el Repository
    this.productRepository = RepositoryFactory.createProductRepository();
    this.cartRepository = RepositoryFactory.createCartRepository();
  }

  // ========== OPERACIONES BÁSICAS ==========

  async createProduct(data) {
    return await this.productRepository.create(data);
  }

  async getProductById(id) {
    return await this.productRepository.findById(id);
  }

  async getAllProducts() {
    return await this.productRepository.findAll();
  }

  async updateProduct(id, data) {
    return await this.productRepository.updateById(id, data);
  }

  async deleteProduct(id) {
    return await this.productRepository.deleteById(id);
  }

  // ========== OPERACIONES ESPECÍFICAS DEL DOMINIO ==========

  // ✨ Verificar stock disponible
  async checkStock(productId, quantity) {
    return await this.productRepository.hasEnoughStock(productId, quantity);
  }

  // ✨ Obtener stock actual
  async getStock(productId) {
    return await this.productRepository.getStock(productId);
  }

  // ✨ Restar stock (cuando se compra)
  async decreaseStock(productId, quantity) {
    return await this.productRepository.updateStock(productId, -quantity);
  }

  // ✨ Aumentar stock (cuando se devuelve)
  async increaseStock(productId, quantity) {
    return await this.productRepository.updateStock(productId, quantity);
  }

  // ✨ Obtener productos de una categoría
  async getProductsByCategory(category) {
    return await this.productRepository.findByCategory(category);
  }

  // ✨ Verificar si un código ya existe
  async codeAlreadyExists(code) {
    return await this.productRepository.codeExists(code);
  }

  // ========== OPERACIONES CON PAGINACIÓN ==========

  async getProductsPaginated(filter = {}, sort = {}, limit = 10, page = 1) {
    return await this.productRepository.findPaginated(filter, {
      sort,
      limit,
      page,
      lean: true
    });
  }

  // ========== LÓGICA COMPLEJA ==========

  // Ejemplo: Procesar una compra
  async processCheckout(cartId, userId) {
    // 1. Obtener carrito poblado
    const cart = await this.cartRepository.findByIdWithProducts(cartId);
    if (!cart) throw new Error("Carrito no encontrado");

    const completedItems = [];
    const failedItems = [];

    // 2. Verificar stock de cada producto
    for (const item of cart.products) {
      const hasStock = await this.checkStock(
        item.product._id,
        item.quantity
      );

      if (!hasStock) {
        failedItems.push(item);
        continue;
      }

      // 3. Reducir stock
      await this.decreaseStock(item.product._id, item.quantity);
      completedItems.push(item);
    }

    // 4. Vaciar carrito
    await this.cartRepository.clearCart(cartId);

    return {
      completed: completedItems,
      failed: failedItems,
      success: failedItems.length === 0
    };
  }
}

module.exports = new ProductService();
```

---

## 2️⃣ En los Repositories

### ProductRepository - Todos los métodos disponibles

```javascript
// HEREDADOS de BaseRepository:
await productRepository.create(data);              // Crear
await productRepository.findById(id);              // Por ID
await productRepository.findAll();                 // Todos
await productRepository.updateById(id, data);      // Actualizar
await productRepository.deleteById(id);            // Eliminar
await productRepository.count(filter);             // Contar

// ESPECÍFICOS de ProductRepository:
await productRepository.findPaginated(filter, options);  // Con paginación
await productRepository.findByCode(code);          // Por código único
await productRepository.codeExists(code);          // ¿Existe código?
await productRepository.findByCategory(category);  // Por categoría
await productRepository.updateStock(id, change);   // Actualizar stock
await productRepository.hasEnoughStock(id, qty);   // ¿Hay stock?
await productRepository.getStock(id);              // Stock actual
```

### CartRepository - Todos los métodos disponibles

```javascript
// HEREDADOS de BaseRepository:
await cartRepository.create(data);                 // Crear
await cartRepository.findById(id);                 // Por ID
await cartRepository.findAll();                    // Todos
await cartRepository.updateById(id, data);         // Actualizar
await cartRepository.deleteById(id);               // Eliminar

// ESPECÍFICOS de CartRepository:
await cartRepository.findByIdWithProducts(id);     // Con productos poblados
await cartRepository.addProduct(cid, pid, qty);    // Agregar
await cartRepository.removeProduct(cid, pid);      // Eliminar
await cartRepository.getProductQuantity(cid, pid); // Cantidad
await cartRepository.updateQuantity(cid, pid, qty);// Actualizar cantidad
await cartRepository.clearCart(cid);               // Vaciar
await cartRepository.getTotalItems(cid);           // Items totales
await cartRepository.replaceProducts(cid, prods);  // Reemplazar todos
```

### UserRepository - Todos los métodos disponibles

```javascript
// HEREDADOS de BaseRepository:
await userRepository.create(data);                 // Crear
await userRepository.findById(id);                 // Por ID
await userRepository.findAll();                    // Todos
await userRepository.updateById(id, data);         // Actualizar
await userRepository.deleteById(id);               // Eliminar

// ESPECÍFICOS de UserRepository:
await userRepository.findByEmail(email);           // Por email
await userRepository.findByIdWithCart(userId);     // Con carrito
await userRepository.updateUserCart(uid, cid);     // Asignar carrito
await userRepository.emailExists(email);           // ¿Email existe?
```

---

## 3️⃣ Ejemplos prácticos

### Ejemplo 1: Crear producto + validar código

```javascript
async createProduct(productData) {
  // 1. Verificar que el código no exista
  const codeExists = await this.productRepository.codeExists(
    productData.code
  );
  
  if (codeExists) {
    throw new Error("El código del producto ya existe");
  }

  // 2. Crear el producto
  return await this.productRepository.create(productData);
}
```

### Ejemplo 2: Agregar producto al carrito + verificar stock

```javascript
async addProductToCart(cartId, productId, quantity) {
  // 1. Verificar que hay stock disponible
  const hasStock = await this.productRepository.hasEnoughStock(
    productId,
    quantity
  );
  
  if (!hasStock) {
    throw new Error("Stock insuficiente");
  }

  // 2. Agregar al carrito
  return await this.cartRepository.addProduct(cartId, productId, quantity);
}
```

### Ejemplo 3: Procesar compra completa

```javascript
async checkout(cartId, userId) {
  // 1. Obtener carrito con productos
  const cart = await this.cartRepository.findByIdWithProducts(cartId);
  
  if (!cart || cart.products.length === 0) {
    throw new Error("El carrito está vacío");
  }

  const processedItems = [];
  const failedItems = [];

  // 2. Procesar cada producto
  for (const item of cart.products) {
    // Verificar stock
    const hasStock = await this.productRepository.hasEnoughStock(
      item.product._id,
      item.quantity
    );

    if (!hasStock) {
      failedItems.push({
        product: item.product._id,
        requested: item.quantity,
        available: await this.productRepository.getStock(item.product._id)
      });
      continue;
    }

    // Restar stock
    await this.productRepository.updateStock(item.product._id, -item.quantity);
    processedItems.push(item);
  }

  // 3. Crear ticket de compra
  const ticket = {
    user: userId,
    products: processedItems,
    amount: this.calculateTotal(processedItems),
    status: failedItems.length === 0 ? "completed" : "partial",
    date: new Date()
  };

  // 4. Vaciar carrito
  await this.cartRepository.clearCart(cartId);

  return {
    ticket,
    failedItems,
    totalProcessed: processedItems.length,
    totalFailed: failedItems.length
  };
}
```

### Ejemplo 4: Actualizar perfil de usuario

```javascript
async updateUserProfile(userId, updateData) {
  // 1. Obtener usuario actual
  const user = await this.userRepository.findById(userId);
  if (!user) throw new Error("Usuario no encontrado");

  // 2. Si intenta cambiar email, verificar que no existe
  if (updateData.email && updateData.email !== user.email) {
    const emailExists = await this.userRepository.emailExists(updateData.email);
    if (emailExists) throw new Error("El email ya está registrado");
  }

  // 3. Actualizar usuario
  return await this.userRepository.updateById(userId, updateData);
}
```

---

## 4️⃣ Testing con Repositories

### Mock simple para tests

```javascript
const mockProductRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  hasEnoughStock: jest.fn(),
  updateStock: jest.fn(),
  getStock: jest.fn(),
};

describe("ProductService", () => {
  let service;

  beforeEach(() => {
    service = new ProductService();
    service.productRepository = mockProductRepository;
  });

  test("debería reducir stock cuando se procesa compra", async () => {
    // Arrange
    mockProductRepository.hasEnoughStock.mockResolvedValue(true);
    mockProductRepository.updateStock.mockResolvedValue({ stock: 95 });

    // Act
    await service.decreaseStock("product-123", 5);

    // Assert
    expect(mockProductRepository.updateStock).toHaveBeenCalledWith(
      "product-123",
      -5
    );
  });

  test("debería lanzar error si no hay stock", async () => {
    // Arrange
    mockProductRepository.hasEnoughStock.mockResolvedValue(false);

    // Act & Assert
    await expect(
      service.addProductToCart("cart-123", "product-123", 100)
    ).rejects.toThrow("Stock insuficiente");
  });
});
```

---

## 5️⃣ Resumen de patrones comunes

### Patrón 1: Validación antes de operación
```javascript
// ✅ Validar primero, luego actuar
const exists = await repository.findById(id);
if (!exists) throw new Error("No encontrado");
const updated = await repository.updateById(id, data);
```

### Patrón 2: Verificación de stock
```javascript
// ✅ Verificar disponibilidad
const hasStock = await productRepository.hasEnoughStock(productId, qty);
if (!hasStock) throw new Error("Stock insuficiente");

// Luego ejecutar
await productRepository.updateStock(productId, -qty);
```

### Patrón 3: Operación atómica (múltiples pasos)
```javascript
// ✅ Si algo falla, todo falla
try {
  await productRepository.updateStock(pid, -qty);
  await cartRepository.removeProduct(cid, pid);
  await userRepository.updateUserCart(uid, null);
} catch (error) {
  // Rollback manual o usar transacciones
  throw error;
}
```

---

## ✅ Checklist de implementación

- [ ] Services creados con RepositoryFactory
- [ ] Repositories inyectados en constructor
- [ ] Usar métodos específicos del dominio (no queries complejas)
- [ ] Métodos documentados con JSDoc
- [ ] Tests con mocks del Repository
- [ ] No acceder a DAO desde Services
- [ ] No acceder a Modelos desde Services

