/**
 * CartRepository - Maneja persistencia de carritos
 * Abstrae el CartDAO con métodos específicos de carritos
 */
const BaseRepository = require("./BaseRepository");
const mongoose = require("mongoose");

class CartRepository extends BaseRepository {
  /**
   * Obtiene carrito con productos poblados
   * @param {String} cartId - ID del carrito
   * @returns {Promise} - Carrito con productos
   */
  async findByIdWithProducts(cartId) {
    if (!mongoose.isValidObjectId(cartId)) return null;
    return await this.dao.findById(cartId, { populate: true });
  }

  /**
   * Agrega producto al carrito
   * @param {String} cartId - ID del carrito
   * @param {String} productId - ID del producto
   * @param {Number} quantity - Cantidad a agregar
   * @returns {Promise} - Carrito actualizado
   */
  async addProduct(cartId, productId, quantity = 1) {
    if (!mongoose.isValidObjectId(cartId) || !mongoose.isValidObjectId(productId)) {
      return null;
    }
    if (quantity <= 0) quantity = 1;
    return await this.dao.addProduct(cartId, productId, quantity);
  }

  /**
   * Elimina producto del carrito
   * @param {String} cartId - ID del carrito
   * @param {String} productId - ID del producto
   * @returns {Promise} - Carrito actualizado
   */
  async removeProduct(cartId, productId) {
    if (!mongoose.isValidObjectId(cartId) || !mongoose.isValidObjectId(productId)) {
      return null;
    }
    return await this.dao.removeProduct(cartId, productId);
  }

  /**
   * Obtiene cantidad de un producto en el carrito
   * @param {String} cartId - ID del carrito
   * @param {String} productId - ID del producto
   * @returns {Promise<Number>} - Cantidad (0 si no existe)
   */
  async getProductQuantity(cartId, productId) {
    if (!mongoose.isValidObjectId(cartId) || !mongoose.isValidObjectId(productId)) {
      return 0;
    }
    const cart = await this.findByIdWithProducts(cartId);
    if (!cart) return 0;

    const product = cart.products.find(p => p.product._id.toString() === productId);
    return product ? product.quantity : 0;
  }

  /**
   * Actualiza cantidad de producto en carrito
   * @param {String} cartId - ID del carrito
   * @param {String} productId - ID del producto
   * @param {Number} quantity - Nueva cantidad
   * @returns {Promise} - Carrito actualizado
   */
  async updateQuantity(cartId, productId, quantity) {
    if (!mongoose.isValidObjectId(cartId) || !mongoose.isValidObjectId(productId)) {
      return null;
    }
    return await this.dao.updateQuantity(cartId, productId, quantity);
  }

  /**
   * Vacía el carrito
   * @param {String} cartId - ID del carrito
   * @returns {Promise} - Carrito vacío
   */
  async clearCart(cartId) {
    if (!mongoose.isValidObjectId(cartId)) return null;
    return await this.dao.clearCart(cartId);
  }

  /**
   * Obtiene cantidad total de items en el carrito
   * @param {String} cartId - ID del carrito
   * @returns {Promise<Number>} - Cantidad total
   */
  async getTotalItems(cartId) {
    if (!mongoose.isValidObjectId(cartId)) return 0;
    const cart = await this.findByIdWithProducts(cartId);
    if (!cart || !cart.products) return 0;
    return cart.products.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Reemplaza todos los productos del carrito
   * @param {String} cartId - ID del carrito
   * @param {Array} products - Array de productos
   * @returns {Promise} - Carrito actualizado
   */
  async replaceProducts(cartId, products) {
    if (!mongoose.isValidObjectId(cartId) || !Array.isArray(products)) {
      return null;
    }
    return await this.dao.replaceProducts(cartId, products);
  }
}

module.exports = CartRepository;
