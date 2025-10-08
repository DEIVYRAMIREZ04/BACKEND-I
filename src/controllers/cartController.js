const cartService = require("../services/cartService");

class CartController {
  // 🛒 Vista renderizada del carrito
  async getCartByIdView(req, res) {
    try {
      const { cid } = req.params;
      const cart = await cartService.getCartById(cid);

      if (!cart) return res.status(404).send("Carrito no encontrado");

      const hasProducts = cart.products && cart.products.length > 0;

      res.render("pages/cart", { cart, hasProducts, title: "Tu Carrito" });
    } catch (err) {
      console.error("Error al mostrar carrito:", err);
      res.status(500).send("Error al cargar el carrito");
    }
  }

  // 🔍 Obtener carrito (JSON)
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

  // ➕ Agregar producto al carrito global (o crear uno si no existe)
  async addProductToCart(req, res) {
    try {
      const { pid } = req.params;

      let cid = req.app.locals.cartId;
      if (!cid) {
        const newCart = await cartService.createCart();
        cid = newCart._id.toString();
        req.app.locals.cartId = cid;
      }

      const updatedCart = await cartService.addProductToCart(cid, pid);
      if (!updatedCart) return res.status(404).json({ error: "Carrito o producto no encontrado" });

      console.log(`✅ Producto agregado al carrito (${cid})`);
      res.redirect(`/api/carts/${cid}/view`);
    } catch (err) {
      console.error("Error al agregar producto:", err);
      res.status(500).json({ status: "error", error: err.message });
    }
  }

  // ❌ Eliminar producto específico del carrito
 async deleteProductFromCart(req, res) {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartService.removeProductFromCart(cid, pid);

    if (!updatedCart) {
      return res.status(404).send({ status: "error", message: "Carrito no encontrado" });
    }

    // 👇 Redirige a la vista del carrito
    res.redirect(`/api/carts/${cid}/view`);

  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).send({ status: "error", message: "Error al eliminar producto del carrito" });
  }
}

  // 🔁 Reemplazar todos los productos
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

  // 🔢 Actualizar cantidad de un producto
  async updateProductQuantity(req, res) {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;
      if (!quantity || isNaN(quantity)) return res.status(400).json({ error: "Cantidad inválida" });

      const updated = await cartService.updateQuantity(cid, pid, Number(quantity));
      if (!updated) return res.status(404).json({ error: "Carrito o producto no encontrado" });
      res.json({ status: "success", payload: updated });
    } catch (err) {
      console.error("Error al actualizar cantidad:", err);
      res.status(500).json({ status: "error", error: err.message });
    }
  }

  // 🧹 Vaciar carrito completo
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

  // 🆕 Crear carrito vacío
  async createCart(req, res) {
    try {
      const newCart = await cartService.createCart();
      res.status(201).json({ status: "success", payload: newCart });
    } catch (err) {
      console.error("Error al crear carrito:", err);
      res.status(500).json({ status: "error", error: err.message });
    }
  }
}

module.exports = new CartController();
