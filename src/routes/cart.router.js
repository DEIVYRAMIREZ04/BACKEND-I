// src/routes/cart.router.js
const { Router } = require("express");
const cartController = require("../controllers/cartController");

const router = Router();

/* ===========================================================
   🖼️ RUTAS DE VISTAS (HANDLEBARS)
   Estas rutas renderizan páginas con los datos del carrito.
=========================================================== */

// Mostrar un carrito específico (vista con productos)
router.get("/:cid/view", cartController.getCartByIdView);

/* ===========================================================
   🔗 RUTAS DE API (RESPUESTA EN JSON)
   Estas rutas son para consumo desde el frontend o Postman.
=========================================================== */

// Obtener un carrito por ID
router.get("/:cid", cartController.getCart);

// Crear un nuevo carrito vacío
router.post("/", cartController.createCart);

/* ===========================================================
   🛒 GESTIÓN DE PRODUCTOS DENTRO DEL CARRITO
=========================================================== */

// Agregar un producto al carrito
router.post("/:cid/products/:pid", cartController.addProductToCart);

// Eliminar un producto específico del carrito
router.delete("/:cid/products/:pid", cartController.deleteProductFromCart);

// Actualizar la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", cartController.updateProductQuantity);

/* ===========================================================
   ⚙️ GESTIÓN COMPLETA DEL CARRITO
=========================================================== */

// Reemplazar todos los productos del carrito (PUT)
router.put("/:cid", cartController.replaceCartProducts);

// Vaciar carrito completamente (DELETE)
router.delete("/:cid", cartController.clearCart);

module.exports = router;



/*Rutas API (para llamadas desde frontend o Postman)

Estas devuelven datos en JSON y permiten manejar el carrito desde código.

Método	Ruta	Descripción
GET	/:cid	Devuelve un carrito específico (por ID)
POST	/	Crea un carrito vacío
POST	/:cid/products/:pid	Agrega un producto al carrito
DELETE	/:cid/products/:pid	Elimina un producto específico
PUT	/:cid/products/:pid	Actualiza la cantidad de un producto
PUT	/:cid	Reemplaza todos los productos del carrito
DELETE	/:cid	Vacía el carrito completamente
⚙️ 3️⃣ Qué hace cada método
Ruta	Acción	Qué hace
GET /:cid/view	Vista del carrito	Renderiza una vista con los productos del carrito
GET /:cid	Obtener carrito	Devuelve en JSON el carrito con sus productos
POST /	Crear carrito	Crea un nuevo carrito vacío
POST /:cid/products/:pid	Agregar producto	Añade un producto al carrito con una cantidad inicial (por ejemplo, 1)
DELETE /:cid/products/:pid	Eliminar producto	Quita un producto específico del carrito
PUT /:cid/products/:pid	Actualizar cantidad	Cambia la cantidad del producto en el carrito
PUT /:cid	Reemplazar productos	Sustituye todo el contenido del carrito con otro array de productos
DELETE /:cid	Vaciar carrito	Borra todos los productos del carrito*/