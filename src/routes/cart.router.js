const { Router } = require("express");
const cartController = require("../controllers/cartController");

const router = Router();

/* ================================
   Rutas de vistas
================================ */
router.get("/:cid/view", cartController.getCartByIdView);

/* ================================
   Rutas de carrito (API JSON)
================================ */
router.post("/", cartController.createCart);
router.get("/:cid/view", cartController.getCartByIdView);
router.post("/:cid/product/:pid", cartController.addProductToCart);
router.delete("/:cid/products/:pid", cartController.deleteProductFromCart);
router.put("/:cid", cartController.replaceCartProducts);
router.put("/:cid/products/:pid", cartController.updateProductQuantity);
router.delete("/:cid", cartController.clearCart);

module.exports = router;
