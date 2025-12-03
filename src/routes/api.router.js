const express = require("express");
const router = express.Router();
const productService = require("../services/productService");
const { auth, isAdmin } = require("../middleware/auth");

/**
 * GET /api
 * Obtiene todos los productos (sin paginación)
 */
router.get("/", async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json({
      status: "success",
      message: "Productos cargados correctamente",
      data: {
        products,
        user: req.user || null,
      },
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
    res.status(500).json({
      status: "error",
      message: "Error al cargar productos",
      error: error.message,
    });
  }
});

/**
 * GET /api/empresa
 * Información de la empresa
 */
router.get("/empresa", (req, res) => {
  res.json({
    status: "success",
    message: "Información de la empresa disponible",
    user: req.user || null,
  });
});

/**
 * POST /api/register
 * Ruta solo para administradores (actualmente solo devuelve confirmación)
 * Nota: El registro real se maneja en /api/sessions/register
 */
router.post("/register", isAdmin, (req, res) => {
  res.json({
    status: "success",
    message: "Ruta disponible solo para administradores",
    user: req.user || null,
  });
});

/**
 * GET /api/realTimeProducts
 * Obtiene productos en tiempo real (requiere autenticación)
 */
router.get("/realTimeProducts", auth, async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json({
      status: "success",
      message: "Productos en tiempo real",
      data: products,
      user: req.user,
    });
  } catch (error) {
    console.error("Error en realTimeProducts:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno",
      error: error.message,
    });
  }
});

module.exports = router;
