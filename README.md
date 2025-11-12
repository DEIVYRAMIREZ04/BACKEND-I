# 🛒 E-commerce Backend - Entrega Final

## 🚀 Características Implementadas
- Sistema de persistencia con **MongoDB** y **Mongoose**
- **Paginación** implementada con `mongoose-paginate-v2`
- **Gestión completa de productos y carritos**
- **Vistas dinámicas** con Handlebars
- **Manejo de archivos** con Multer
- **Arquitectura por capas** (MVC + DAO + Services)
- **Soporte para filtros, ordenamiento y búsquedas**

## 🧱 Endpoints de Productos
- `GET /api/products` → Lista paginada de productos con filtros y ordenamiento  
- `GET /api/products/:id` → Obtener producto por ID  
- `POST /api/products` → Crear nuevo producto (permite subir imagen)  
- `PUT /api/products/:id` → Actualizar producto existente  
- `DELETE /api/products/:id` → Eliminar producto por ID  

### Parámetros opcionales en `GET /api/products`
- `limit`: Cantidad de productos por página (default 10)
- `page`: Número de página (default 1)
- `query`: Filtro por nombre o categoría
- `sort`: Orden por precio (`asc` o `desc`)

### Ejemplo de respuesta:
```json
{
  "status": "success",
  "payload": [...],
  "totalPages": 3,
  "prevPage": 1,
  "nextPage": 3,
  "page": 2,
  "hasPrevPage": true,
  "hasNextPage": true,
  "prevLink": "http://localhost:8080/api/products?page=1",
  "nextLink": "http://localhost:8080/api/products?page=3"
}
🛒 Endpoints de Carrito
GET /api/carts/:cid → Obtener carrito por ID (con populate)

POST /api/carts → Crear un carrito vacío

POST /api/carts/:cid/products/:pid → Agregar producto al carrito

PUT /api/carts/:cid → Reemplazar el contenido completo del carrito

PUT /api/carts/:cid/products/:pid → Actualizar cantidad de un producto

DELETE /api/carts/:cid/products/:pid → Eliminar un producto específico

DELETE /api/carts/:cid → Vaciar todo el carrito

🧭 Vistas Implementadas
/products → Catálogo con paginación, filtros y ordenamiento

/product/:id → Detalle de producto con botón "Agregar al carrito"

/api/carts/:cid/view → Vista detallada del carrito

🔎 Funcionalidades de Filtrado y Búsqueda
Filtro por categoría o nombre

Ordenamiento ascendente/descendente por precio

Paginación conservando filtros activos

Navegación fluida entre páginas con parámetros persistentes

⚙️ Tecnologías Utilizadas
Node.js + Express.js – Servidor backend

MongoDB + Mongoose – Persistencia de datos

Handlebars – Motor de plantillas para vistas

Socket.io – Actualización en tiempo real

Multer – Subida y manejo de imágenes

Method Override – Permitir PUT/DELETE en formularios

📁 Estructura del Proyecto
css

src/
├── app.js
├── config/
│   └── config.js
├── controllers/
│   ├── productController.js
│   └── cartController.js
├── dao/
│   ├── productDao.js
│   └── cartDao.js
├── managers/
│   ├── ProductManager.js
│   └── CartManager.js
├── models/
│   ├── product.model.js
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