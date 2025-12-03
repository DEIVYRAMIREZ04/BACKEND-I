const { Router } = require("express");
const cartController = require("../controllers/cartController");
const { auth } = require("../middleware/auth");
const {
  validateAddToCart,
  validateCartId,
  validateProductIdInCart,
  validateUpdateQuantity,
} = require("../middleware/validation");

const router = Router();

router.get("/:cid/view", validateCartId, cartController.getCartByIdView);
router.get("/:cid", validateCartId, cartController.getCart);
router.post("/", cartController.createCart);
router.post("/:cid/products/:pid", validateCartId, validateProductIdInCart, validateAddToCart, cartController.addProductToCart);
router.delete("/:cid/products/:pid", validateCartId, validateProductIdInCart, cartController.deleteProductFromCart);
router.put("/:cid/products/:pid", validateCartId, validateProductIdInCart, validateUpdateQuantity, cartController.updateProductQuantity);
router.put("/:cid", validateCartId, cartController.replaceCartProducts);
router.delete("/:cid", validateCartId, cartController.clearCart);
router.post("/:cid/checkout", validateCartId, auth, cartController.checkout);

module.exports = router;