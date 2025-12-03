/**
 * UserDAO - Data Access Object para usuarios
 * Encapsula todas las operaciones de acceso a datos de la colección de usuarios
 */
const mongoose = require("mongoose");
const User = require("../models/User.model");

class UserDAO {
  /**
   * Crear nuevo usuario
   * @param {Object} data - Datos del usuario
   * @returns {Promise} - Usuario creado
   */
  async create(data) {
    try {
      const user = new User(data);
      return await user.save();
    } catch (error) {
      console.error("Error en UserDAO.create:", error);
      throw error;
    }
  }

  /**
   * Encontrar usuario por ID
   * @param {String} id - ID del usuario
   * @param {Object} options - Opciones (populate, lean)
   * @returns {Promise} - Usuario encontrado
   */
  async findById(id, options = {}) {
    try {
      if (!mongoose.isValidObjectId(id)) return null;
      
      let query = User.findById(id);
      
      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach(field => query = query.populate(field));
        } else {
          query = query.populate(options.populate);
        }
      }
      
      if (options.lean) query = query.lean();
      
      return await query;
    } catch (error) {
      console.error("Error en UserDAO.findById:", error);
      throw error;
    }
  }

  /**
   * Encontrar usuario por email
   * @param {Object} filter - Filtro (ej: {email: "user@example.com"})
   * @returns {Promise} - Usuario encontrado
   */
  async findOne(filter = {}) {
    try {
      return await User.findOne(filter);
    } catch (error) {
      console.error("Error en UserDAO.findOne:", error);
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios
   * @returns {Promise} - Array de usuarios
   */
  async findAll() {
    try {
      return await User.find().lean();
    } catch (error) {
      console.error("Error en UserDAO.findAll:", error);
      throw error;
    }
  }

  /**
   * Actualizar usuario por ID
   * @param {String} id - ID del usuario
   * @param {Object} data - Datos a actualizar
   * @returns {Promise} - Usuario actualizado
   */
  async findByIdAndUpdate(id, data, options = { new: true }) {
    try {
      if (!mongoose.isValidObjectId(id)) return null;
      return await User.findByIdAndUpdate(id, data, options);
    } catch (error) {
      console.error("Error en UserDAO.findByIdAndUpdate:", error);
      throw error;
    }
  }

  /**
   * Actualizar usuario (alias)
   * @param {String} id - ID del usuario
   * @param {Object} data - Datos a actualizar
   * @returns {Promise} - Usuario actualizado
   */
  async updateById(id, data) {
    return this.findByIdAndUpdate(id, data);
  }

  /**
   * Eliminar usuario por ID
   * @param {String} id - ID del usuario
   * @returns {Promise} - Usuario eliminado
   */
  async findByIdAndDelete(id) {
    try {
      if (!mongoose.isValidObjectId(id)) return null;
      return await User.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error en UserDAO.findByIdAndDelete:", error);
      throw error;
    }
  }

  /**
   * Eliminar usuario (alias)
   * @param {String} id - ID del usuario
   * @returns {Promise} - Usuario eliminado
   */
  async deleteById(id) {
    return this.findByIdAndDelete(id);
  }

  /**
   * Contar usuarios que cumplan condiciones
   * @param {Object} filter - Filtro
   * @returns {Promise<Number>} - Cantidad
   */
  async count(filter = {}) {
    try {
      return await User.countDocuments(filter);
    } catch (error) {
      console.error("Error en UserDAO.count:", error);
      throw error;
    }
  }
}

module.exports = new UserDAO();
