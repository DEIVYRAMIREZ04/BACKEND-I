const Cart = require("../models/Cart");

class CartDao {
  async createCart() {
    return await Cart.create({ products: [] });
  }

  async getCartById(cartId, { populate = false } = {}) {
    if (populate) {
      return await Cart.findById(cartId).populate("products.product");
    }
    return await Cart.findById(cartId);
  }

  async addProductToCart(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    const existing = cart.products.find(
      (p) => p.product.toString() === productId
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    return cart;
  }

  async removeProduct(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    cart.products = cart.products.filter(
      (p) => p.product.toString() !== productId
    );

    await cart.save();
    return cart;
  }

  async replaceProducts(cartId, productsArray) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    // productsArray = [{ product: id, quantity: n }]
    cart.products = productsArray;
    await cart.save();
    return cart;
  }

  async updateQuantity(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    const productInCart = cart.products.find(
      (p) => p.product.toString() === productId
    );

    if (!productInCart) return null;

    productInCart.quantity = quantity;
    await cart.save();
    return cart;
  }

  async clearCart(cartId) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    cart.products = [];
    await cart.save();
    return cart;
  }
}

module.exports = CartDao;
