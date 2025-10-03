const cartService = require("../services/cartService");
const Cart = require("../models/cart.model");

class CartController {
  // Vista renderizada
  async getCartByIdView(req, res) {
    try {
      const cartId = req.params.cid;
      const cart = await Cart.findById(cartId).populate("products.product").lean();
      if (!cart) return res.status(404).send("Carrito no encontrado");
      res.render("pages/cart", { cart });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error al cargar el carrito");
    }
  }

  // Crear carrito
  async createCart(req, res) {
    try {
      const newCart = await cartService.createCart();
      res.status(201).json({ status: "success", payload: newCart });
    } catch (err) {
      console.error("Error al crear carrito:", err);
      res.status(500).json({ status: "error", error: err.message });
    }
  }

  // Obtener carrito (JSON)
  async getCart(req, res) {
    try {
      const { cid } = req.params;
      const cart = await cartService.getCartById(cid, { populate: true });
      if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
      res.json({ status: "success", payload: cart });
    } catch (err) {
      console.error("Error al obtener carrito:", err);
      res.status(500).json({ status: "error", error: err.message });
    }
  }

  // Agregar producto al carrito
  async addProductToCart(req, res) {
    try {
      const { cid, pid } = req.params;
      const updatedCart = await cartService.addProductToCart(cid, pid);
      if (!updatedCart) return res.status(404).json({ error: "Carrito o producto no encontrado" });
      res.json({ status: "success", payload: updatedCart });
    } catch (err) {
      console.error("Error al agregar producto:", err);
      res.status(500).json({ status: "error", error: err.message });
    }
  }

  // Eliminar producto específico
  async deleteProductFromCart(req, res) {
    try {
      const { cid, pid } = req.params;
      const updated = await cartService.removeProduct(cid, pid);
      if (!updated) return res.status(404).json({ error: "Carrito o producto no encontrado" });
      res.json({ status: "success", payload: updated });
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      res.status(500).json({ status: "error", error: err.message });
    }
  }

  // Reemplazar todos los productos
  async replaceCartProducts(req, res) {
    try {
      const { cid } = req.params;
      const products = req.body;
      const updated = await cartService.replaceProducts(cid, products);
      if (!updated) return res.status(404).json({ error: "Carrito no encontrado" });
      res.json({ status: "success", payload: updated });
    } catch (err) {
      console.error("Error al reemplazar productos:", err);
      res.status(500).json({ status: "error", error: err.message });
    }
  }

  // Actualizar cantidad de producto
  async updateProductQuantity(req, res) {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;
      if (!quantity || isNaN(quantity)) {
        return res.status(400).json({ error: "Cantidad inválida" });
      }
      const updated = await cartService.updateQuantity(cid, pid, Number(quantity));
      if (!updated) return res.status(404).json({ error: "Carrito o producto no encontrado" });
      res.json({ status: "success", payload: updated });
    } catch (err) {
      console.error("Error al actualizar cantidad:", err);
      res.status(500).json({ status: "error", error: err.message });
    }
  }

  // Vaciar carrito
  async clearCart(req, res) {
    try {
      const { cid } = req.params;
      const updated = await cartService.clearCart(cid);
      if (!updated) return res.status(404).json({ error: "Carrito no encontrado" });
      res.json({ status: "success", payload: updated });
    } catch (err) {
      console.error("Error al vaciar carrito:", err);
      res.status(500).json({ status: "error", error: err.message });
    }
  }
}

module.exports = new CartController();
