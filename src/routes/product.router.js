const { Router } = require("express");
const ProductManager = require("../managers/ProductManager");

const router = Router();
const productManager = new ProductManager();

// GET /
router.get("/", async (req, res) => {
  const products = await productManager.getProducts();
  res.json(products);
});

// GET /:pid
router.get("/:pid", async (req, res) => {
  const product = await productManager.getProductById(req.params.pid);
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(product);
});

// POST /
router.post("/", async (req, res) => {
  const newProduct = await productManager.addProduct(req.body);
  res.status(201).json(newProduct);
});

// PUT /:pid
router.put("/:pid", async (req, res) => {
  const updated = await productManager.updateProduct(req.params.pid, req.body);
  if (!updated) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(updated);
});

// DELETE /:pid
router.delete("/:pid", async (req, res) => {
  const success = await productManager.deleteProduct(req.params.pid);
  if (!success) return res.status(404).json({ error: "Producto no encontrado" });
  res.json({ message: "Producto eliminado" });
});

module.exports = router;