# E-COMERCE-BACK - E-commerce con Node.js, Express y MongoDB

**King-Llantas** es una aplicación web tipo **E-commerce** desarrollada con **Node.js**, **Express**, **MongoDB (Mongoose)** y **Handlebars** como motor de vistas.  
Permite realizar operaciones completas de **CRUD** (Crear, Leer, Actualizar y Eliminar) sobre productos y carritos, simulando el flujo real de una tienda en línea especializada en llantas.

---

## 📋 Tabla de Contenido

1. [Características principales](#-características-principales)  
2. [Tecnologías utilizadas](#-tecnologías-utilizadas)  
3. [Estructura del proyecto](#-estructura-del-proyecto)  
4. [Instalación y configuración](#-instalación-y-configuración)  
5. [Ejecución del proyecto](#-ejecución-del-proyecto)  
6. [Uso del CRUD paso a paso](#-uso-del-crud-paso-a-paso)  
   - [Productos](#1-productos)  
   - [Carritos](#2-carritos)  
7. [Vistas con Handlebars](#-vistas-con-handlebars)  
8. [Autor](#-autor)

---

## Características principales

- CRUD completo de **productos** y **carritos**.  
- Renderizado dinámico con **Handlebars**.  
- Conexión a base de datos en **MongoDB Atlas**.  
- Arquitectura escalable con capas (**controllers**, **services**, **routes**, **models**).  
- Uso de **Mongoose** para modelar los datos.  
- Creación automática de carritos para el usuario al ingresar.  
- Gestión de productos desde vistas y API.  
- Integración con **dotenv** para manejo seguro de variables.

---

## Tecnologías utilizadas

- **Node.js** – entorno de ejecución de JavaScript.  
- **Express.js** – framework backend.  
- **MongoDB + Mongoose** – base de datos NoSQL.  
- **Handlebars (HBS)** – motor de plantillas para vistas dinámicas.  
- **Nodemon** – recarga automática durante desarrollo.  
- **Dotenv** – manejo de variables de entorno.

---

## 🗂️ Estructura del proyecto

📦 E-COMERCE-BACK
├── src/
│ ├── app.js # Configuración principal del servidor
│ ├── routes/
│ │ ├── product.router.js # Rutas para productos
│ │ └── cart.router.js # Rutas para carritos
│ ├── controllers/
│ │ ├── productController.js
│ │ └── cartController.js
│ ├── services/
│ │ ├── productService.js
│ │ └── cartService.js
│ ├── models/
│ │ ├── Product.js # Esquema de producto
│ │ └── Cart.js # Esquema de carrito
│ ├── views/
│ │ ├── layouts/
│ │ │ └── main.hbs
│ │ ├── pages/
│ │ │ ├── home.hbs
│ │ │ ├── empresa.hbs
| | | ├── detalleProduct.hbs
│ │ │ ├── products.hbs
│ │ │ └── cart.hbs
| | ├──partials
| |   ├──footer.hbs
| |   ├──header.hbs
│ └── config/
│ 
├── .env # Variables de entorno
├── .gitignore
├── package.json
└── README.md

yaml
Copiar código

---

## Instalación y configuración

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/DEIVYRAMIREZ04/BACKEND-I.git
   
Instalar dependencias

bash

Copiar código

npm install


🚀 Ejecución del proyecto
Modo desarrollo:

bash

npm run dev


La aplicación correrá en:

http://localhost:8080

# Uso del CRUD paso a paso

 1-Productos
Modelo (Product.js):

js

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  stock: Number
});

module.exports = mongoose.model("Product", productSchema);
➕ Crear producto
Ruta: POST /api/products
Ejemplo (Postman o JSON):

json

{
  "title": "Llantas Goodyear 18”",
  "description": "Resistentes y de excelente agarre en carretera",
  "price": 520000,
  "category": "Camioneta",
  "stock": 15
}
📖 Leer productos
Ruta: GET /api/products
Devuelve todos los productos almacenados.
También se renderizan en la vista principal /.

✏️ Actualizar producto
Ruta: PUT /api/products/:id
Ejemplo:

json

{
  "price": 540000,
  "stock": 18
}
❌ Eliminar producto
Ruta: DELETE /api/products/:id
Elimina un producto según su ID.

2-Carritos

Modelo (Cart.js):

js

const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    quantity: { type: Number, default: 1 }
  }]
});

module.exports = mongoose.model("Cart", cartSchema);
➕ Crear carrito
Ruta: POST /api/carts
Crea un nuevo carrito vacío.

🛒 Agregar producto al carrito
Ruta: POST /api/carts/:cid/products/:pid
Agrega un producto al carrito. Si ya existe, aumenta la cantidad.

📖 Ver carrito
Ruta: GET /api/carts/:cid/view
Muestra la vista cart.hbs con los productos y cantidades del carrito actual.

❌ Eliminar producto del carrito
Ruta: DELETE /api/carts/:cid/products/:pid
Elimina un producto específico del carrito.

🗑️ Vaciar carrito
Ruta: DELETE /api/carts/:cid
Elimina todos los productos del carrito.

🖼️ Vistas con Handlebars
products.hbs
Muestra todos los productos disponibles y permite agregarlos al carrito mediante botones de acción.

cart.hbs
Muestra los productos añadidos al carrito, sus cantidades y total a pagar.

detalleProduct.hbs
Muestrta eldetalle del mproducto.

Ejemplo de navegación:

hbs
Copiar código
<li><a href="/api/carts/{{cartId}}/view">Ver carrito</a></li>




👨‍💻 Autor
Deivy Ramírez



Proyecto King-Llantas, un e-commerce educativo funcional con CRUD completo, desarrollado con Node.js, Express, MongoDB y Handlebars.



📧 Contacto: deivrsmirez@gmail.com
