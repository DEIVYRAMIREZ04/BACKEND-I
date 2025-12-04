# 🛒 E-Commerce Backend API

Backend profesional de e-commerce con arquitectura escalable, autenticación JWT, autorización por roles y sistema de compra completo.

## ⚡ Quick Start

### Requisitos
- Node.js v20+
- MongoDB Atlas
- Gmail App Password (para emails)

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (.env)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=tu_secreto
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=app_password
SMTP_FROM=tu_email@gmail.com
FRONTEND_URL=http://localhost:3000

# 3. Iniciar servidor
npm start          # Producción
npm run dev        # Desarrollo
```

## 📚 Documentación

- **[GUIA_EXPOSICION.md](./GUIA_EXPOSICION.md)** - Guía paso a paso para presentación

## 🔗 Endpoints Principales

### Autenticación
- `POST /api/sessions/register` - Registrar usuario
- `POST /api/sessions/login` - Iniciar sesión
- `GET /api/sessions/current` - Usuario actual
- `POST /api/sessions/forgot-password` - Recuperar contraseña
- `POST /api/sessions/reset-password` - Restablecer contraseña

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` (admin) - Crear producto
- `PUT /api/products/:id` (admin) - Actualizar producto
- `DELETE /api/products/:id` (admin) - Eliminar producto

### Carritos
- `POST /api/carts` - Crear carrito
- `GET /api/carts/:cid` - Obtener carrito
- `POST /api/carts/:cid/products/:pid` - Agregar producto
- `POST /api/carts/:cid/checkout` - Procesar compra

## 🏗️ Arquitectura

```
Controllers → Services → Repositories → DAOs → MongoDB
```

**7 Capas:**
1. **Controllers** - Manejo de requests
2. **Services** - Lógica de negocio
3. **Repositories** - Abstracción de datos (patrón Repository)
4. **DAOs** - Operaciones CRUD
5. **Models** - Esquemas Mongoose
6. **Middleware** - Autenticación y autorización
7. **Routes** - Mapeo de endpoints

## 🔐 Seguridad

- ✅ JWT (24h) - Autenticación stateless
- ✅ Bcrypt - Hash de contraseñas
- ✅ isAdmin - Solo administradores
- ✅ isOwner - Validación de propiedad
- ✅ DTOs - Respuestas seguras (sin passwords)
- ✅ Email 2FA - Recuperación de contraseña

## 📦 Tecnologías

- Express.js 5.1.0
- MongoDB + Mongoose 8.18.2
- JWT + Passport.js
- Bcrypt 6.0.0
- Nodemailer 6.9.7
- Socket.IO 4.8.1
- Express-Validator 7.0.0

## 📁 Estructura del Proyecto

```
src/
├── controllers/      # Manejo de requests
├── services/         # Lógica de negocio
├── repositories/     # Patrón Repository
├── dao/             # Acceso a datos
├── models/          # Esquemas MongoDB
├── dtos/            # DTOs seguros
├── middleware/      # Auth, autorización
├── routes/          # Endpoints
├── config/          # Configuración
└── sockets/         # Real-time
```

## 🚀 Características Implementadas

- ✅ Patrón Repository (abstracción de datos)
- ✅ DTOs (seguridad en responses)
- ✅ Autorización por roles (admin/user)
- ✅ Checkout con manejo de stock
- ✅ Tickets de compra automáticos
- ✅ Recuperación de contraseña por email
- ✅ Carrito de compras persistente
- ✅ Validación exhaustiva

## 📧 Email

Para habilitar password recovery:

1. Generar [App Password](https://support.google.com/accounts/answer/185833) en Gmail
2. Usar como `SMTP_PASSWORD` en `.env`
3. Los emails se envían automáticamente

## 📝 Licencia

MIT - Deivry Ramírez 2024
│   └── cart.model.js
├── routes/
│   ├── product.router.js
│   └── cart.router.js
├── services/
│   ├── productService.js
│   └── cartService.js
└── Views/
    ├── layouts/
    │   └── main.hbs
    ├── pages/
    │   ├── home.hbs
    │   ├── products.hbs
    │   ├── detalleProduct.hbs
    │   └── cart.hbs
    └── partials/
        ├── header.hbs
        └── footer.hbs
🚀 Instalación y Ejecución

git clone https://github.com/DEIVYRAMIREZ04/BACKEND-I.git
cd e-commerce-back
npm install

Iniciar servidor:

bash

npm run dev   # modo desarrollo
npm start     # modo producción
Acceder a:

Home: http://localhost:8080

Productos: http://localhost:8080/products

API Productos: http://localhost:8080/api/products

API Carritos: http://localhost:8080/api/carts

📌 Endpoints Disponibles
Productos
GET /api/products

GET /api/products/:id

POST /api/products

PUT /api/products/:id

DELETE /api/products/:id

Carritos
GET /api/carts/:cid

POST /api/carts

POST /api/carts/:cid/products/:pid

PUT /api/carts/:cid

PUT /api/carts/:cid/products/:pid

DELETE /api/carts/:cid/products/:pid

DELETE /api/carts/:cid

Vistas
/

/products

/product/:id

/api/carts/:cid/view

🌟 Características Destacadas
Paginación inteligente que mantiene filtros activos

Filtros por nombre, categoría y disponibilidad

Carrito persistente asociado al usuario actual


Validación de datos robusta

Manejo de errores 


🧠 Notas de Desarrollo
Persistencia principal con MongoDB

populate en carritos para traer productos completos

Vistas optimizadas para una UX/UI moderna

Código estructurado bajo patrón MVC

👨‍💻 Autor
Desarrollado por: Deivy Ramirez — King Llantas E-commerce 2025