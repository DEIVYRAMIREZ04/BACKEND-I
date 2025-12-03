/**
 * ProductRepository - Maneja persistencia de productos
 * Abstrae el ProductDAO con métodos específicos de productos
 */
const BaseRepository = require("./BaseRepository");
const mongoose = require("mongoose");

class ProductRepository extends BaseRepository {
  /**
   * Obtiene productos con paginación, filtros y ordenamiento
   * @param {Object} filter - Filtros a aplicar
   * @param {Object} options - Opciones (sort, limit, page, lean)
   * @returns {Promise} - Resultado paginado
   */
  async findPaginated(filter = {}, options = {}) {
    return await this.dao.paginate(filter, options);
  }

  /**
   * Encuentra producto por código único
   * @param {String} code - Código del producto
   * @returns {Promise} - Producto encontrado
   */
  async findByCode(code) {
    if (!code || typeof code !== "string") return null;
    return await this.dao.findOne({ code: code.trim() });
  }

  /**
   * Verifica si existe un producto con ese código
   * @param {String} code - Código a verificar
   * @returns {Promise<Boolean>}
   */
  async codeExists(code) {
    if (!code) return false;
    const product = await this.findByCode(code);
    return !!product;
  }

  /**
   * Busca productos por categoría
   * @param {String} category - Categoría
   * @returns {Promise} - Array de productos
   */
  async findByCategory(category) {
    if (!category || typeof category !== "string") return [];
    return await this.dao.find({ category: category.toLowerCase() });
  }

  /**
   * Actualiza el stock de un producto
   * @param {String} productId - ID del producto
   * @param {Number} quantityChange - Cantidad a restar (negativo) o sumar
   * @returns {Promise} - Producto actualizado
   */
  async updateStock(productId, quantityChange) {
    if (!mongoose.isValidObjectId(productId) || typeof quantityChange !== "number") {
      return null;
    }
    return await this.dao.findByIdAndUpdate(
      productId,
      { $inc: { stock: quantityChange } },
      { new: true }
    );
  }

  /**
   * Verifica si hay stock suficiente
   * @param {String} productId - ID del producto
   * @param {Number} quantity - Cantidad requerida
   * @returns {Promise<Boolean>}
   */
  async hasEnoughStock(productId, quantity) {
    if (!mongoose.isValidObjectId(productId) || quantity <= 0) return false;
    const product = await this.findById(productId);
    return product && product.stock >= quantity;
  }

  /**
   * Obtiene stock actual de un producto
   * @param {String} productId - ID del producto
   * @returns {Promise<Number>} - Cantidad en stock
   */
  async getStock(productId) {
    if (!mongoose.isValidObjectId(productId)) return 0;
    const product = await this.findById(productId);
    return product ? product.stock : 0;
  }
}

module.exports = ProductRepository;
