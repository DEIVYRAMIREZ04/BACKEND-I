const { Router } = require("express");
const productController = require("../controllers/productController");
const multer = require("multer");
const { auth, isAdmin } = require("../middleware/auth");
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
} = require("../middleware/validation");

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `img-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

router.get("/home", productController.getHome);

router.get("/", productController.getAllProductsApi);
router.get("/:id", validateProductId, productController.getProductById);
router.post("/", auth, isAdmin, upload.single("imagen"), validateCreateProduct, productController.createProduct);
router.put("/:id", auth, isAdmin, validateProductId, validateUpdateProduct, productController.updateProduct);
router.delete("/:id", auth, isAdmin, validateProductId, productController.deleteProduct);

module.exports = router;
