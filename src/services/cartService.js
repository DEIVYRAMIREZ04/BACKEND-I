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

  // Verifica si el producto ya está en el carrito
  const productIndex = cart.products.findIndex(p => p.product?.toString() === pid);

  // Si el producto existe, sumamos la cantidad
  if (productIndex >= 0 && cart.products[productIndex]) {
    cart.products[productIndex].quantity = 
      (cart.products[productIndex].quantity || 0) + quantity;
  } else {
    // Si no existe o el registro está roto, lo añadimos correctamente
    cart.products.push({ product: pid, quantity });
  }

  // Filtra cualquier entrada nula o rota (por si el carrito tiene basura)
  cart.products = cart.products.filter(p => p && p.product);

  await cart.save();
  return await cart.populate("products.product");
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

  async replaceProducts(cid, products) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    cart.products = products;
    return await cart.save();
  }

  async updateQuantity(cid, pid, quantity) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
    if (productIndex >= 0) {
      cart.products[productIndex].quantity = quantity;
      return await cart.save();
    }
    return null;
  }
}

module.exports = new CartService();
