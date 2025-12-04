# 📊 GUÍA DE EXPOSICIÓN - CÓMO FUNCIONA EL PROYECTO

> **Objetivo:** Explicación paso a paso, clara y eficiente del backend de e-commerce para presentación

---

## 🎯 EN 2 MINUTOS

El proyecto es un **backend de e-commerce profesional** que maneja:
1. **Registro y login** de usuarios con JWT
2. **Catálogo de productos** con admin
3. **Carrito de compras** con validación de stock
4. **Checkout completo** que genera tickets de compra
5. **Recuperación de contraseña** por email

**Tecnología:** Node.js + Express + MongoDB

---

## 🏗️ ARQUITECTURA (LO MÁS IMPORTANTE)

```
CLIENTE (Frontend)
    ↓ HTTP Request
ROUTES (app.js → router)
    ↓
MIDDLEWARE (auth, validation, isOwner, isAdmin)
    ↓
CONTROLLERS (validar request → llamar servicio)
    ↓
SERVICES (lógica de negocio → llamar repositorios)
    ↓
REPOSITORIES (abstracción de datos → llamar DAO)
    ↓
DAO (operaciones CRUD MongoDB)
    ↓
MODELS (esquemas Mongoose)
    ↓
MONGODB (base de datos)
```

**¿Por qué tantas capas?**
- **Escalabilidad:** Cambiar BD sin afectar Services
- **Mantenimiento:** Cada capa tiene una responsabilidad
- **Testing:** Fácil de testear cada capa
- **Reutilización:** Servicios usables desde múltiples controllers

---

## 🔐 AUTENTICACIÓN (JWT)

### ¿Cómo funciona?

```
1. Usuario se REGISTRA
   POST /api/sessions/register → { email, password }
   ↓
   Password se HASHEA con bcrypt (NUNCA se guarda en texto plano)
   Usuario se guarda en MongoDB
   Generar JWT: token = { id, email, role, exp: +24h }
   ✅ Response: { token, user }

2. Usuario INICIA SESIÓN
   POST /api/sessions/login → { email, password }
   ↓
   Buscar usuario por email
   Comparar password hasheado vs ingresado
   Generar JWT
   ✅ Response: { token, user }

3. Cliente GUARDA JWT en localStorage
   localStorage.setItem('token', jwt)

4. Cliente hace request AUTENTICADO
   GET /api/sessions/current
   Headers: Authorization: Bearer {JWT}
   ↓
   Middleware auth valida JWT
   Si es válido: req.user = payload del JWT
   ✅ Controller devuelve UserDTO (SIN password)

5. Token EXPIRA en 24 horas
   Usuario debe hacer login nuevamente
```

---

## 👥 AUTORIZACIÓN (isAdmin, isOwner)

### Dos niveles de control:

**isAdmin Middleware:**
```javascript
// Solo usuarios con role === 'admin'
POST /api/products (crear producto) → isAdmin ✅
PUT /api/products/:id (editar) → isAdmin ✅
DELETE /api/products/:id (eliminar) → isAdmin ✅

Usuario normal intenta → 403 Forbidden ❌
```

**isOwner Middleware:**
```javascript
// Solo el dueño del carrito
POST /api/carts/:cid/products/:pid (agregar) → isOwner ✅
POST /api/carts/:cid/checkout (comprar) → isOwner ✅

Usuario B intenta acceder carrito de Usuario A → 403 Forbidden ❌
```

---

## 🛒 FLUJO DE COMPRA COMPLETO

### Paso 1: Crear Carrito
```
POST /api/carts
↓
Controller: cartController.createCart()
↓
Service: cartService.createCart()
↓
Repository: cartRepository.create({})
↓
DAO: cartDao.save(new Cart())
↓
MongoDB: Guardado ✅
Response: { id: "507f..." }
```

### Paso 2: Agregar Producto al Carrito
```
POST /api/carts/:cid/products/:pid
Body: { quantity: 2 }
Headers: Authorization: Bearer {JWT}

↓ Middleware auth valida JWT
↓ Middleware isOwner verifica propiedad
↓ Controller: cartController.addProductToCart()

   1. Validar que el producto existe
   2. ProductRepository.hasEnoughStock(productId, 2) ← Verificar stock
      Si stock < 2 → Error 400 "No hay stock"
   3. CartRepository.addProduct(cartId, productId, 2)
      Si ya existe → sumar cantidad
      Si es nuevo → agregar
   4. Guardar en MongoDB
   
↓ Response: CartDTO.minimal() (SIN prices)
{
  cartId: "507f...",
  productName: "Llanta",
  quantity: 2
}
```

### Paso 3: CHECKOUT (Lo más importante)
```
POST /api/carts/:cid/checkout
Headers: Authorization: Bearer {JWT}

↓ Middleware auth valida JWT
↓ Middleware isOwner verifica propiedad
↓ Controller: cartController.checkout()

   TicketService.checkout(cartId, userId):
   
   1. Validar carrito existe y pertenece al usuario
   
   2. Obtener carrito completo con productos:
      carrito = { 
        products: [
          { product: { id, stock, price }, quantity: 2 },
          { product: { id, stock, price }, quantity: 5 }
        ]
      }
   
   3. VALIDAR STOCK para CADA producto:
      FOR EACH producto en carrito:
        stock disponible = productRepository.getStock(productId)
        
        SI stock >= cantidad:
          ✅ PROCESABLE (se puede comprar)
        SINO:
          ❌ FALLIDO (no hay stock suficiente)
   
   4. CREAR TICKET solo con PROCESABLES:
      ticket = {
        code: "TICKET-A1B2C3D4", ← Código único
        user: userId,
        products: [procesables],
        total: $500,
        status: "completed",
        purchaseDate: now
      }
      
      Guardar en MongoDB ✅
   
   4. REDUCIR STOCK para PROCESABLES:
      FOR EACH producto procesable:
        productRepository.updateStock(productId, -cantidad)
      
   5. ACTUALIZAR CARRITO:
      Remover productos procesables
      Mantener productos fallidos en el carrito
      cartRepository.replaceProducts(cartId, [fallidos])
   
   6. Response: TicketDTO.confirmation()
      {
        ticket: { code, total },
        products: {
          completed: [...],
          failed: [...]
        },
        status: "completed"
      }
```

**Resultado:**
- ✅ Ticket creado con items que había stock
- ✅ Stock reducido automáticamente
- ✅ Items sin stock quedan en carrito
- ✅ Usuario puede intentar comprarlos luego (si admin agrega stock)

---

## 📧 RECUPERACIÓN DE CONTRASEÑA

### Paso 1: Usuario olvida contraseña
```
POST /api/sessions/forgot-password
Body: { email: "juan@test.com" }

↓ Backend:
   1. Buscar usuario por email
   2. Generar token aleatorio: "abc123def456xyz"
   3. HASHEAR token con bcrypt (NO guardamos token en texto plano)
   4. Guardar en PasswordReset:
      {
        user: userId,
        token: bcrypt.hash("abc123..."),
        expiresAt: now + 1 hora,
        used: false
      }
   5. Construir link reset:
      https://tuapp.com/reset-password?token=abc123def456xyz&userId=507f...
   6. Enviar email con mailService.sendPasswordResetEmail()
      Contenido HTML con botón clickeable

✅ Response: "Email enviado, revisa bandeja"
```

### Paso 2: Usuario recibe email y hace click
```
Usuario hace click en enlace → frontend abre formulario

Completa:
- Token: abc123def456xyz
- UserId: 507f1f77bcf86cd799439011
- Nueva contraseña: newpass123
- Confirmar contraseña: newpass123
```

### Paso 3: Backend valida y cambia contraseña
```
POST /api/sessions/reset-password
Body: {
  token: "abc123def456xyz",
  userId: "507f1f77bcf86cd799439011",
  newPassword: "newpass123",
  confirmPassword: "newpass123"
}

↓ Backend validaciones:
   1. Buscar PasswordReset con token hasheado coincida
      query: { token: bcrypt.hash(token_recibido) }
      
   2. Verificar NO expiró (expiresAt > ahora)
      Si expiró → Error "Token inválido"
      
   3. Verificar NO fue usado (used === false)
      Si fue usado → Error "Token ya utilizado"
      
   4. Verificar newPassword ≠ oldPassword
      Si son iguales → Error "Use contraseña diferente"
      
   5. HASHEAR nueva contraseña
      newPasswordHash = bcrypt.hash(newPassword)
      
   6. Actualizar usuario:
      userRepository.updateById(userId, { password: newPasswordHash })
      
   7. Marcar token como usado:
      passwordResetRepository.updateById(resetId, { used: true })
      
   8. Enviar email de confirmación
      mailService.sendPasswordChangedEmail()

✅ Response: "Contraseña actualizada correctamente"

Usuario hace LOGIN con nueva contraseña ✅
```

---

## 📊 DTOs (Data Transfer Objects)

**¿Qué son?**
Objetos que transforman entidades BD → respuestas HTTP seguras

**¿Por qué?**
```javascript
// ❌ MAL: Expone password
usuario = {
  id: "507f...",
  email: "juan@test.com",
  password: "$2b$10$hashedpassword...",  ← ¡NUNCA mostrar!
  role: "user"
}

// ✅ BIEN: UserDTO (sin password)
userDTO = {
  id: "507f...",
  email: "juan@test.com",
  first_name: "Juan",
  role: "user"
  // password excluido
}
```

**DTOs implementados:**

1. **UserDTO** → GET /api/sessions/current
   - ✅ Sin password
   - ✅ Con datos públicos

2. **ProductDTO** → GET /api/products
   - ✅ Variante "public" (sin admin data)
   - ✅ Variante "complete" (admin only)

3. **CartDTO** → GET /api/carts/:cid
   - ✅ Con totales calculados
   - ✅ Sin información sensible

4. **TicketDTO** → POST /api/carts/:cid/checkout
   - ✅ Confirmación de compra
   - ✅ Items procesados vs fallidos

---

## 🔄 PATRÓN REPOSITORY

**El patrón más importante del proyecto**

### Sin Repository (mal):
```javascript
// Service acoplado a MongoDB
async addProductToCart(cartId, productId, qty) {
  const cart = await Cart.findById(cartId);  ← Directo a MongoDB
  cart.products.push({ product: productId, quantity: qty });
  await cart.save();
}

// PROBLEMA: Si cambias BD a PostgreSQL, rompiste todo ❌
```

### Con Repository (bien):
```javascript
// Service solo conoce Repository interface
async addProductToCart(cartId, productId, qty) {
  await cartRepository.addProduct(cartId, productId, qty); ← Abstracción
}

// Repository implementa operación específica
class CartRepository {
  async addProduct(cartId, productId, qty) {
    const cart = await this.dao.findById(cartId);
    cart.products.push({ product: productId, quantity: qty });
    return await this.dao.save(cart);
  }
}

// VENTAJA: Cambiar DAO sin afectar Service ✅
```

### Repositories implementados:
- **BaseRepository** (CRUD genérico)
- **UserRepository** (operaciones de usuario)
- **ProductRepository** (operaciones de producto + stock)
- **CartRepository** (operaciones de carrito)
- **TicketRepository** (operaciones de ticket)
- **RepositoryFactory** (inyección de dependencias)

---

## 📁 ESTRUCTURA CARPETAS (RÁPIDO)

```
src/
├── controllers/        ← Reciben requests, llaman servicios
├── services/           ← Lógica de negocio, orquestan repositorios
├── repositories/       ← Abstracción de datos
├── dao/               ← CRUD puro MongoDB
├── models/            ← Esquemas Mongoose
├── dtos/              ← Transformación de datos
├── middleware/        ← Auth, autorización, validación
├── routes/            ← Mapeo de endpoints
└── config/            ← Configuración
```

---

## 🚀 FLUJO COMPLETO: Usuario registra y compra

```
1️⃣ REGISTRAR
   POST /api/sessions/register { email, password }
   → Password hashed con bcrypt
   → Usuario guardado en MongoDB
   → JWT generado
   → Response: { token, user }

2️⃣ CREAR CARRITO
   POST /api/carts
   → cartService.createCart()
   → cartRepository.create()
   → Carrito vacío en MongoDB
   → Response: { id: "507f..." }

3️⃣ AGREGAR PRODUCTO
   POST /api/carts/:cid/products/:pid { quantity: 2 }
   Headers: Authorization: Bearer {JWT}
   → auth middleware valida JWT
   → isOwner middleware verifica carrito es suyo
   → ProductRepository.hasEnoughStock() valida
   → CartRepository.addProduct() añade
   → Response: CartDTO

4️⃣ CHECKOUT
   POST /api/carts/:cid/checkout
   Headers: Authorization: Bearer {JWT}
   → isOwner valida
   → TicketService.checkout():
      - Validar stock cada producto
      - Crear ticket con procesables
      - Reducir stock
      - Remover procesables del carrito
   → Response: TicketDTO.confirmation()
   
5️⃣ USAR NUEVAMENTE CARRITO
   Carrito aún tiene items fallidos
   POST /api/carts/:cid/checkout (nuevo intento)
   Si admin agregó stock → Se procesan ✅
   Si no → Vuelven a fallar ❌
```

---

## 💡 CARACTERÍSTICAS CLAVE

| Característica | Cómo funciona |
|---|---|
| **JWT 24h** | Token se expira automáticamente, usuario debe re-login |
| **isAdmin** | Solo usuarios con role='admin' pueden crear/editar productos |
| **isOwner** | Solo el dueño del carrito puede comprarlo |
| **Stock dinámico** | Se reduce solo si la compra se procesa (parcial OK) |
| **Compras parciales** | Items sin stock quedan en carrito para intentar después |
| **Email automático** | Nodemailer envía enlaces recovery (1hr expiry) |
| **DTOs** | Nunca enviamos passwords, siempre objetos transformados |
| **Repository** | Cambiar BD sin afectar lógica de negocio |

---

## 🎬 DEMO (PASO A PASO)

### Cliente 1: Compra exitosa
```
1. Registra: juan@test.com / pass123
2. Crea carrito
3. Agrega Llanta (stock: 10) cantidad 5
4. Checkout → ✅ COMPRA EXITOSA
5. Ticket creado, stock = 5

Resultado:
- Ticket: TICKET-A1B2C3D4
- Total: $600
- Items procesados: 1
- Items fallidos: 0
```

### Cliente 2: Compra parcial
```
1. Registra: maria@test.com / pass456
2. Crea carrito
3. Agrega Llanta (stock: 5 quedan) cantidad 10
4. Checkout → COMPRA PARCIAL
   - Procesados: 5 (está en carrito)
   - Fallidos: 5 (quedan en carrito)
5. Ticket creado con 5 items, stock = 0

Resultado:
- Ticket: TICKET-X7Y8Z9W0
- Total: $300 (solo 5 llantas)
- Items procesados: 5
- Items fallidos: 5 (en carrito esperando stock)
- Admin agrega 10 más
- Cliente intenta checkout de nuevo → SUCCESS ✅
```

### Cliente 3: Olvida contraseña
```
1. POST /forgot-password → juan@test.com
2. Email recibido con link (válido 1 hora)
3. Click en link → Abre formulario reset
4. POST /reset-password con token + nueva pass
5. Contraseña cambiada ✅
6. Login con nueva password ✅
```

---

## ⚡ RESUMEN EJECUTIVO (30 segundos)

✅ **Backend profesional** con 7 capas de arquitectura  
✅ **Autenticación JWT** segura + autorización por roles  
✅ **Carrito de compras** con validación de stock real-time  
✅ **Checkout inteligente** maneja compras parciales  
✅ **Email automático** para recuperación de contraseña  
✅ **DTOs seguros** nunca expone passwords  
✅ **Patrón Repository** para cambiar BD sin afectar lógica  
✅ **Producción listo** con validación exhaustiva  

---

**Preguntas esperadas en exposición:**

❓ "¿Por qué tantas capas?"  
→ Escalabilidad, mantenimiento, testing, reutilización

❓ "¿Cómo manejas compras parciales?"  
→ Separas procesables/fallidos, creas ticket con procesables, dejas fallidos en carrito

❓ "¿Qué pasa si no hay stock?"  
→ ProductRepository.hasEnoughStock() falla, item se marca como "fallido"

❓ "¿Token JWT es seguro?"  
→ Sí, tiene exp: 24h + secret key. Si se roba, caduca solo

❓ "¿Cómo recupera contraseña?"  
→ Token expirable (1h), hasheado, validado, nuevo password hasheado

