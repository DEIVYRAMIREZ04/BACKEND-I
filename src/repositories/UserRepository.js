/**
 * UserRepository - Maneja persistencia de usuarios
 * Abstrae el UserDAO y proporciona métodos específicos para gestionar usuarios
 */
const BaseRepository = require("./BaseRepository");
const mongoose = require("mongoose");

class UserRepository extends BaseRepository {
  /**
   * Encuentra usuario por email
   * @param {String} email - Email del usuario
   * @returns {Promise} - Usuario encontrado
   */
  async findByEmail(email) {
    if (!email || typeof email !== "string") return null;
    return await this.dao.findOne({ email: email.toLowerCase() });
  }

  /**
   * Obtiene usuario con su carrito poblado
   * @param {String} userId - ID del usuario
   * @returns {Promise} - Usuario con carrito
   */
  async findByIdWithCart(userId) {
    if (!mongoose.isValidObjectId(userId)) return null;
    return await this.dao.findById(userId, { populate: ["cart"] });
  }

  /**
   * Actualiza el carrito del usuario
   * @param {String} userId - ID del usuario
   * @param {String} cartId - ID del carrito
   * @returns {Promise} - Usuario actualizado
   */
  async updateUserCart(userId, cartId) {
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(cartId)) {
      return null;
    }
    return await this.updateById(userId, { cart: cartId });
  }

  /**
   * Existe usuario con ese email?
   * @param {String} email - Email a verificar
   * @returns {Promise<Boolean>}
   */
  async emailExists(email) {
    if (!email) return false;
    const user = await this.findByEmail(email);
    return !!user;
  }
}

module.exports = UserRepository;
