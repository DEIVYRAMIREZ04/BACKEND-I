const mongoose = require("mongoose");
const RepositoryFactory = require("../repositories/RepositoryFactory");
const Product = require("../models/product.model");
const User = require("../models/User.model");

class CartService {
  constructor() {
    this.cartRepository = RepositoryFactory.createCartRepository();
    this.userRepository = RepositoryFactory.createUserRepository();
    this.productRepository = RepositoryFactory.createProductRepository();
  }

  /**
   * Crear nuevo carrito vacío
   * @returns {Promise} - Carrito creado
   */
  async createCart() {
    return await this.cartRepository.create({ products: [] });
  }

  /**
   * Obtener carrito por ID
   * @param {String} id - ID del carrito
   * @returns {Promise} - Carrito encontrado
   */
  async getCartById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return await this.cartRepository.findByIdWithProducts(id);
  }

  /**
   * Obtener o crear carrito para un usuario
   * @param {String} userId - ID del usuario
   * @returns {Promise} - Carrito del usuario
   */
  async getOrCreateCartForUser(userId) {
    if (!mongoose.isValidObjectId(userId)) return null;

    try {
      const user = await this.userRepository.findByIdWithCart(userId);

      if (user && user.cart) {
        // Usuario ya tiene carrito, devolverlo
        return await this.cartRepository.findByIdWithProducts(user.cart._id);
      }

      // Usuario no tiene carrito, crear uno nuevo
      const newCart = await this.cartRepository.create({ products: [] });
      await this.userRepository.updateUserCart(userId, newCart._id);

      return newCart;
    } catch (error) {
      console.error("Error en getOrCreateCartForUser:", error);
      throw error;
    }
  }

  /**
   * Agregar producto al carrito
   * @param {String} cid - ID del carrito
   * @param {String} pid - ID del producto
   * @param {Number} quantity - Cantidad
   * @returns {Promise} - Carrito actualizado
   */
  async addProductToCart(cid, pid, quantity = 1) {
    // Validaciones
    if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) {
      return null;
    }

    if (quantity <= 0) quantity = 1;

    // Verificar que el producto exista usando Repository
    const productExists = await this.productRepository.findById(pid);
    if (!productExists) return null;

    // Usar Repository para agregar producto
    return await this.cartRepository.addProduct(cid, pid, quantity);
  }

  /**
   * Eliminar producto del carrito
   * @param {String} cid - ID del carrito
   * @param {String} pid - ID del producto
   * @returns {Promise} - Carrito actualizado
   */
  async removeProductFromCart(cid, pid) {
    if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) {
      return null;
    }
    return await this.cartRepository.removeProduct(cid, pid);
  }

  /**
   * Vaciar carrito
   * @param {String} cid - ID del carrito
   * @returns {Promise} - Carrito vacío
   */
  async clearCart(cid) {
    if (!mongoose.isValidObjectId(cid)) return null;
    return await this.cartRepository.clearCart(cid);
  }

  /**
   * Reemplazar todos los productos del carrito
   * @param {String} cid - ID del carrito
   * @param {Array} products - Array de productos
   * @returns {Promise} - Carrito actualizado
   */
  async replaceProducts(cid, products) {
    if (!mongoose.isValidObjectId(cid)) return null;
    if (!Array.isArray(products)) return null;
    return await this.cartRepository.replaceProducts(cid, products);
  }

  /**
   * Actualizar cantidad de producto en carrito
   * @param {String} cid - ID del carrito
   * @param {String} pid - ID del producto
   * @param {Number} quantity - Nueva cantidad
   * @returns {Promise} - Carrito actualizado
   */
  async updateQuantity(cid, pid, quantity) {
    if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) {
      return null;
    }
    if (quantity <= 0) quantity = 1;
    return await this.cartRepository.updateQuantity(cid, pid, quantity);
  }

  /**
   * Obtener cantidad total de items en carrito
   * @param {String} cid - ID del carrito
   * @returns {Promise<Number>}
   */
  async getTotalItems(cid) {
    return await this.cartRepository.getTotalItems(cid);
  }

  /**
   * Obtener cantidad de un producto específico en carrito
   * @param {String} cid - ID del carrito
   * @param {String} pid - ID del producto
   * @returns {Promise<Number>}
   */
  async getProductQuantity(cid, pid) {
    return await this.cartRepository.getProductQuantity(cid, pid);
  }
}

module.exports = new CartService();