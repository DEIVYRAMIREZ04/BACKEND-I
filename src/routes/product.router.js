const { Router } = require("express");
const ProductManager = require("../managers/ProductManager");
const multer = require("multer");

const router = Router();
const productManager = new ProductManager();

// --- multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `img-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// --- GET /
router.get("/", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("pages/home", { products });
});

// --- GET /view
router.get("/view", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("pages/products", { products });
});

// --- GET /:pid
router.get("/:pid", async (req, res) => {
  const product = await productManager.getProductById(req.params.pid);
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(product);
});

// --- POST /
router.post("/", upload.single("imagen"), async (req, res) => {
  try {
    const { title, description, code, price, status, stock, category } = req.body;

    const newProduct = {
      title,
      description,
      code,
      price: parseFloat(price),
      status: status === "true",
      stock: parseInt(stock),
      category,
      thumbnails: [`/uploads/${req.file.filename}`]
    };

    const saved = await productManager.addProduct(newProduct);

    // avisamos a todos los sockets
    req.app.get("io").emit("updateProducts", await productManager.getProducts());

    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error al crear:", err);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// --- PUT /:pid
router.put("/:pid", async (req, res) => {
  const updated = await productManager.updateProduct(req.params.pid, req.body);
  if (!updated) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(updated);
});

// --- DELETE /:pid
router.delete("/:pid", async (req, res) => {
  const deleted = await productManager.deleteProduct(req.params.pid);

  if (!deleted) return res.status(404).json({ error: "Producto no encontrado" });

  req.app.get("io").emit("updateProducts", await productManager.getProducts());
  res.json({ success: true });
});

module.exports = router;
