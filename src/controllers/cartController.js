const cartService = require("../services/cartService");
const productService = require("../services/productService");

class CartController {
  async getCartByIdView(req, res) {
    try {
      const { cid } = req.params;
      const cart = await cartService.getCartById(cid);

      if (!cart)
        return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

      const hasProducts = cart.products && cart.products.length > 0;

      res.json({
        status: "success",
        message: "Carrito obtenido correctamente",
        hasProducts,
        payload: cart
      });
    } catch (err) {
      console.error("Error al mostrar carrito:", err);
      res.status(500).json({ status: "error", message: "Error al cargar el carrito" });
    }
  }

  async getCart(req, res) {
    try {
      const { cid } = req.params;
      const cart = await cartService.getCartById(cid);
      if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
      res.json({ status: "success", payload: cart });
    } catch (err) {
      console.error("Error al obtener carrito:", err);
      res.status(500).json({ status: "error", error: err.message });
    }
  }

  async addProductToCart(req, res) {
    try {
      const { pid } = req.params;
      const { quantity = 1 } = req.body;

      if (!pid || pid.length !== 24) {
        return res.status(400).json({ status: "error", message: "ID de producto inválido" });
      }

      const qty = parseInt(quantity);
      if (isNaN(qty) || qty < 1) {
        return res.status(400).json({
          status: "error",
          message: "Cantidad debe ser un número mayor a 0"
        });
      }

      // Obtener o crear carrito para el usuario autenticado
      let cid = req.body.cid; // Si se pasa cartId en el body, usarlo
      
      if (!cid) {
        // Si no hay carrito, buscar el del usuario autenticado (si está logueado)
        if (req.user && req.user._id) {
          const userCart = await cartService.getOrCreateCartForUser(req.user._id);
          cid = userCart._id.toString();
        } else {
          // Usuario no autenticado, crear carrito anónimo
          const newCart = await cartService.createCart();
          cid = newCart._id.toString();
          console.log(`🆕 Nuevo carrito anónimo creado: ${cid}`);
        }
      }

      const product = await productService.getProductById(pid);
      if (!product) {
        return res.status(404).json({ status: "error", message: "Producto no encontrado" });
      }

      if (product.stock < qty) {
        return res.status(400).json({
          status: "error",
          message: `Stock insuficiente. Disponible: ${product.stock}`
        });
      }

      const updatedCart = await cartService.addProductToCart(cid, pid, qty);
      if (!updatedCart) {
        return res.status(500).json({
          status: "error",
          message: "Error al actualizar el carrito"
        });
      }

      console.log(`Producto "${product.title}" agregado al carrito (${cid}) - Cantidad: ${qty}`);

      res.json({
        status: "success",
        message: `Producto "${product.title}" agregado al carrito`,
        data: {
          cartId: cid,
          productId: pid,
          productName: product.title,
          quantity: qty,
          price: product.price,
          total: product.price * qty
        }
      });
    } catch (err) {
      console.error("Error al agregar producto:", err);
      res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
        error: err.message
      });
    }
  }

  async deleteProductFromCart(req, res) {
    try {
      const { cid, pid } = req.params;

      if (!cid || cid.length !== 24) {
        return res.status(400).json({ status: "error", message: "ID de carrito inválido" });
      }

      if (!pid || pid.length !== 24) {
        return res.status(400).json({ status: "error", message: "ID de producto inválido" });
      }

      const cart = await cartService.getCartById(cid);
      if (!cart) {
        return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
      }

      const productInCart = cart.products.find(p => p.product._id.toString() === pid);
      if (!productInCart) {
        return res.status(404).json({
          status: "error",
          message: "Producto no encontrado en el carrito"
        });
      }

      const updatedCart = await cartService.removeProductFromCart(cid, pid);
      if (!updatedCart) {
        return res.status(500).json({
          status: "error",
          message: "Error al eliminar producto del carrito"
        });
      }

      console.log(`Producto "${productInCart.product.title}" eliminado del carrito (${cid})`);

      res.json({
        status: "success",
        message: `Producto "${productInCart.product.title}" eliminado del carrito`,
        data: {
          cartId: cid,
          productId: pid,
          productName: productInCart.product.title,
          remainingItems: updatedCart.products.length
        }
      });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  async replaceCartProducts(req, res) {
    try {
      const { cid } = req.params;
      const products = req.body;
      const updated = await cartService.replaceProducts(cid, products);
      if (!updated)
        return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
      res.json({ status: "success", payload: updated });
    } catch (err) {
      console.error("Error al reemplazar productos:", err);
      res.status(500).json({ status: "error", error: err.message });
    }
  }

  async updateProductQuantity(req, res) {
    try {
      const { cid, pid } = req.params;
      let { quantity } = req.body;

      const qty = parseInt(quantity);
      if (isNaN(qty)) {
        return res.status(400).json({
          status: "error",
          message: "La cantidad debe ser un número válido"
        });
      }

      const cart = await cartService.getCartById(cid);
      if (!cart) {
        return res.status(404).json({
          status: "error",
          message: "Carrito no encontrado"
        });
      }

      const productInCart = cart.products.find(p => p.product._id.toString() === pid);
      if (!productInCart) {
        return res.status(404).json({
          status: "error",
          message: "Producto no encontrado en el carrito"
        });
      }

      if (qty <= 0) {
        const updatedCart = await cartService.removeProductFromCart(cid, pid);
        return res.json({
          status: "success",
          message: `Producto "${productInCart.product.title}" eliminado del carrito (cantidad = 0)`,
          payload: updatedCart
        });
      }

      const updatedCart = await cartService.updateQuantity(cid, pid, qty);
      if (!updatedCart) {
        return res.status(500).json({
          status: "error",
          message: "Error al actualizar cantidad"
        });
      }

      console.log(`Cantidad actualizada de "${productInCart.product.title}" a ${qty}`);

      res.json({
        status: "success",
        message: `Cantidad actualizada: ${productInCart.product.title} → ${qty}`,
        payload: updatedCart
      });
    } catch (err) {
      console.error("Error al actualizar cantidad:", err);
      res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
        error: err.message
      });
    }
  }

  async clearCart(req, res) {
    try {
      const { cid } = req.params;
      const updated = await cartService.clearCart(cid);
      if (!updated)
        return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
      res.json({ status: "success", message: "Carrito vaciado correctamente", payload: updated });
    } catch (err) {
      console.error("Error al vaciar carrito:", err);
      res.status(500).json({ status: "error", error: err.message });
    }
  }

  async createCart(req, res) {
    try {
      const newCart = await cartService.createCart();
      res.status(201).json({ status: "success", message: "Carrito creado", payload: newCart });
    } catch (err) {
      console.error("Error al crear carrito:", err);
      res.status(500).json({ status: "error", error: err.message });
    }
  }

  async checkout(req, res) {
    try {
      const { cid } = req.params;
      const userId = req.user && req.user._id;

      if (!userId) return res.status(401).json({ status: 'error', message: 'Autenticación requerida' });

      const ticketService = require('../services/ticketService');
      const TicketDTO = require('../dtos/TicketDTO');

      const result = await ticketService.checkout(cid, userId);

      if (!result || !result.ticket) {
        return res.status(400).json({ status: 'error', message: result ? result.message : 'No se creó ticket', failedItems: result ? result.failedItems : [] });
      }

      const confirmation = TicketDTO.confirmation(result.ticket, result.failedItems);

      res.status(200).json({ status: 'success', payload: confirmation });
    } catch (error) {
      console.error('Error en checkout:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = new CartController();
