const mongoose = require("mongoose");
const Cart = require("../models/cart.model");

class CartDao {
  async createCart() {
    try {
      return await Cart.create({ products: [] });
    } catch (error) {
      console.error("Error en DAO.createCart:", error);
      throw error;
    }
  }

  async findById(id, { populate = false } = {}) {
    try {
      if (!mongoose.isValidObjectId(id)) return null;
      
      const query = Cart.findById(id);
      if (populate) query.populate("products.product");
      
      return await query;
    } catch (error) {
      console.error("Error en DAO.findById:", error);
      throw error;
    }
  }

  async findOne({ populate = false } = {}) {
    try {
      const query = Cart.findOne();
      if (populate) query.populate("products.product");
      return await query;
    } catch (error) {
      console.error("Error en DAO.findOne:", error);
      throw error;
    }
  }

  async addProduct(cartId, productId, quantity) {
    try {
      if (!mongoose.isValidObjectId(cartId) || !mongoose.isValidObjectId(productId)) {
        return null;
      }

      const cart = await Cart.findById(cartId);
      if (!cart) return null;

      const index = cart.products.findIndex(
        p => p.product?.toString() === productId
      );

      if (index >= 0) {
        cart.products[index].quantity = (cart.products[index].quantity || 0) + quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }

      cart.products = cart.products.filter(p => p && p.product);
      await cart.save();
      return await cart.populate("products.product");
    } catch (error) {
      console.error("Error en DAO.addProduct:", error);
      throw error;
    }
  }

  async removeProduct(cartId, productId) {
    try {
      if (!mongoose.isValidObjectId(cartId) || !mongoose.isValidObjectId(productId)) {
        return null;
      }

      const cart = await Cart.findById(cartId);
      if (!cart) return null;

      cart.products = cart.products.filter(
        p => p.product.toString() !== productId
      );

      return await cart.save();
    } catch (error) {
      console.error("Error en DAO.removeProduct:", error);
      throw error;
    }
  }

  async clearCart(cartId) {
    try {
      if (!mongoose.isValidObjectId(cartId)) return null;

      const cart = await Cart.findById(cartId);
      if (!cart) return null;

      cart.products = [];
      return await cart.save();
    } catch (error) {
      console.error("Error en DAO.clearCart:", error);
      throw error;
    }
  }

  async replaceProducts(cartId, products) {
    try {
      if (!mongoose.isValidObjectId(cartId)) return null;

      const cart = await Cart.findById(cartId);
      if (!cart) return null;

      cart.products = products;
      return await cart.save();
    } catch (error) {
      console.error("Error en DAO.replaceProducts:", error);
      throw error;
    }
  }

  async updateQuantity(cartId, productId, quantity) {
    try {
      if (!mongoose.isValidObjectId(cartId) || !mongoose.isValidObjectId(productId)) {
        return null;
      }

      const cart = await Cart.findById(cartId);
      if (!cart) return null;

      const index = cart.products.findIndex(
        p => p.product.toString() === productId
      );

      if (index < 0) return null;

      cart.products[index].quantity = quantity;
      return await cart.save();
    } catch (error) {
      console.error("Error en DAO.updateQuantity:", error);
      throw error;
    }
  }
}

module.exports = new CartDao();