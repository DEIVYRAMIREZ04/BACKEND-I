const { Router } = require("express");
const cartController = require("../controllers/cartController");
const { auth } = require("../middleware/auth");
const { isOwner } = require("../middleware/authorization");
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
router.post("/:cid/products/:pid", validateCartId, auth, isOwner, validateProductIdInCart, validateAddToCart, cartController.addProductToCart);
router.delete("/:cid/products/:pid", validateCartId, auth, isOwner, validateProductIdInCart, cartController.deleteProductFromCart);
router.put("/:cid/products/:pid", validateCartId, auth, isOwner, validateProductIdInCart, validateUpdateQuantity, cartController.updateProductQuantity);
router.put("/:cid", validateCartId, auth, isOwner, cartController.replaceCartProducts);
router.delete("/:cid", validateCartId, auth, isOwner, cartController.clearCart);
router.post("/:cid/checkout", validateCartId, auth, isOwner, cartController.checkout);

module.exports = router;