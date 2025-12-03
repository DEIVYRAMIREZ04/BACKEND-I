const mongoose = require("mongoose");
const RepositoryFactory = require("../repositories/RepositoryFactory");

class ProductService {
  constructor() {
    // Inyectar el Repository en lugar del DAO
    this.productRepository = RepositoryFactory.createProductRepository();
  }

  /**
   * Crear nuevo producto
   * @param {Object} data - Datos del producto
   * @returns {Promise} - Producto creado
   */
  async createProduct(data) {
    if (!data || typeof data !== "object") return null;
    return await this.productRepository.create(data);
  }

  /**
   * Obtener todos los productos
   * @returns {Promise} - Array de productos
   */
  async getAllProducts() {
    return await this.productRepository.findAll();
  }

  /**
   * Obtener producto por ID
   * @param {String} id - ID del producto
   * @returns {Promise} - Producto encontrado
   */
  async getProductById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return await this.productRepository.findById(id);
  }

  /**
   * Actualizar producto
   * @param {String} id - ID del producto
   * @param {Object} data - Datos a actualizar
   * @returns {Promise} - Producto actualizado
   */
  async updateProductById(id, data) {
    if (!mongoose.isValidObjectId(id)) return null;
    if (!data || typeof data !== "object") return null;
    return await this.productRepository.updateById(id, data);
  }

  /**
   * Eliminar producto
   * @param {String} id - ID del producto
   * @returns {Promise} - Producto eliminado
   */
  async deleteProductById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return await this.productRepository.deleteById(id);
  }

  /**
   * Obtener productos con paginación
   * @param {Object} options - Opciones (filter, sort, limit, page)
   * @returns {Promise} - Resultado paginado
   */
  async getProductsPaginated({
    filter = {},
    sort = {},
    limit = 10,
    page = 1
  }) {
    return await this.productRepository.findPaginated(filter, {
      sort,
      limit,
      page,
      lean: true
    });
  }

  /**
   * Contar productos
   * @param {Object} filter - Filtros a aplicar
   * @returns {Promise<Number>} - Cantidad de productos
   */
  async countProducts(filter = {}) {
    return await this.productRepository.count(filter);
  }

  /**
   * Verificar si hay stock suficiente
   * @param {String} productId - ID del producto
   * @param {Number} quantity - Cantidad requerida
   * @returns {Promise<Boolean>}
   */
  async hasEnoughStock(productId, quantity) {
    return await this.productRepository.hasEnoughStock(productId, quantity);
  }

  /**
   * Obtener stock actual de un producto
   * @param {String} productId - ID del producto
   * @returns {Promise<Number>}
   */
  async getStock(productId) {
    return await this.productRepository.getStock(productId);
  }

  /**
   * Actualizar stock (restar o sumar)
   * @param {String} productId - ID del producto
   * @param {Number} quantityChange - Cantidad a cambiar (negativo para restar)
   * @returns {Promise} - Producto actualizado
   */
  async updateStock(productId, quantityChange) {
    return await this.productRepository.updateStock(productId, quantityChange);
  }
}

module.exports = new ProductService();
