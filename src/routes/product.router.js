const { Router } = require("express");
const productController = require("../controllers/productController");
const multer = require("multer");

const router = Router();

// --- multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `img-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

//controlkador de rutas

//Home (ejemplo landing page con productos destacados)
router.get("/home", productController.getHome);

//Vista con todos los productos (render handlebars)
router.get("/view", productController.getAllProductsView);

//API JSON con paginación, filtros y orden
router.get("/", productController.getAllProductsApi);

// Obtener producto por ID
router.get("/:id", productController.getProductById);

//Crear producto (con imagen)
router.post("/", upload.single("imagen"), productController.createProduct);

// Actualizar producto
router.put("/:id", productController.updateProduct);

//Eliminar producto
router.delete("/:id", productController.deleteProduct);

//detalle de producto
router.get("/:id/view", productController.getProductDetailView.bind(productController));


module.exports = router;
