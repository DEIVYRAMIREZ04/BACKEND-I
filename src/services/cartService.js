const Cart = require("../models/cart.model"); // 👈 tu esquema mongoose

class CartService {
  async getAnyCart() {
  const cart = await Cart.findOne();
  return cart;
}

  async createCart() {
    const newCart = new Cart({ products: [] });
    return await newCart.save();
  }

  async getCartById(id) {
    return await Cart.findById(id).populate("products.product");
  }

  async addProductToCart(cid, pid, quantity = 1) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
    if (productIndex >= 0) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ product: pid, quantity });
    }

    return await cart.save();
  }

  async removeProductFromCart(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    return await cart.save();
  }

  async clearCart(cid) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    cart.products = [];
    return await cart.save();
  }
}

module.exports = new CartService();
