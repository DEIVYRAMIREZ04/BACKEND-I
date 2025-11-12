const { Router } = require("express");
const productController = require("../controllers/productController");
const multer = require("multer");

const router = Router();

// --- Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `img-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// --- RUTAS API JSON ---

// Home (ejemplo de landing con productos destacados)
router.get("/home", async (req, res) => {
  try {
    const data = await productController.getHome(req, res);
    res.json({
      status: "success",
      message: "Productos destacados cargados correctamente",
      data,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error al cargar productos destacados",
      error: err.message,
    });
  }
});

// Todos los productos (paginación, filtros, orden)
router.get("/", productController.getAllProductsApi);

// Obtener producto por ID
router.get("/:id", productController.getProductById);

// Crear producto (con imagen)
router.post("/", upload.single("imagen"), productController.createProduct);

// Actualizar producto
router.put("/:id", productController.updateProduct);

// Eliminar producto
router.delete("/:id", productController.deleteProduct);

// Detalle de producto (versión JSON)
router.get("/:id/detail", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productController.getProductById(req, res);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      });
    }

    res.json({
      status: "success",
      message: "Detalle del producto cargado correctamente",
      product,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error al cargar detalle del producto",
      error: err.message,
    });
  }
});

module.exports = router;
