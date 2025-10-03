const { Router } = require("express");
const cartController = require("../controllers/cartController");

const router = Router();

// Vista renderizada del carrito
router.get("/:cid/view", cartController.getCartByIdView);

// API REST

// POST /api/carts -> crear carrito
router.post("/", cartController.createCart);

// GET /api/carts/:cid -> obtener carrito con populate
router.get("/:cid", cartController.getCart);

// POST /api/carts/:cid/product/:pid -> agregar producto al carrito
router.post("/:cid/product/:pid", cartController.addProductToCart);

// DELETE /api/carts/:cid/products/:pid -> eliminar un producto específico
router.delete("/:cid/products/:pid", cartController.deleteProductFromCart);

// PUT /api/carts/:cid -> reemplazar todos los productos
router.put("/:cid", cartController.replaceCartProducts);

// PUT /api/carts/:cid/products/:pid -> actualizar cantidad de producto
router.put("/:cid/products/:pid", cartController.updateProductQuantity);

// DELETE /api/carts/:cid -> vaciar carrito
router.delete("/:cid", cartController.clearCart);

module.exports = router;
