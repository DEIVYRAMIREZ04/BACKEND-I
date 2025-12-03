const mongoose = require("mongoose");
const Ticket = require("../models/ticket.model");

class TicketDAO {
  /**
   * Crear nuevo ticket
   */
  async create(data) {
    try {
      const ticket = new Ticket(data);
      return await ticket.save();
    } catch (error) {
      console.error("Error en TicketDAO.create:", error);
      throw error;
    }
  }

  /**
   * Obtener ticket por ID
   */
  async findById(id, options = {}) {
    try {
      if (!mongoose.isValidObjectId(id)) return null;

      let query = Ticket.findById(id);

      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach(field => (query = query.populate(field)));
        } else {
          query = query.populate(options.populate);
        }
      }

      if (options.lean) query = query.lean();

      return await query;
    } catch (error) {
      console.error("Error en TicketDAO.findById:", error);
      throw error;
    }
  }

  /**
   * Obtener tickets de un usuario
   */
  async findByUserId(userId, options = {}) {
    try {
      if (!mongoose.isValidObjectId(userId)) return [];

      let query = Ticket.find({ user: userId });

      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach(field => (query = query.populate(field)));
        } else {
          query = query.populate(options.populate);
        }
      }

      if (options.lean) query = query.lean();
      if (options.sort) query = query.sort(options.sort);
      if (options.limit) query = query.limit(options.limit);

      return await query;
    } catch (error) {
      console.error("Error en TicketDAO.findByUserId:", error);
      throw error;
    }
  }

  /**
   * Obtener ticket por código
   */
  async findByCode(code) {
    try {
      return await Ticket.findOne({ code }).populate("user").populate("products.product");
    } catch (error) {
      console.error("Error en TicketDAO.findByCode:", error);
      throw error;
    }
  }

  /**
   * Actualizar ticket
   */
  async updateById(id, data) {
    try {
      if (!mongoose.isValidObjectId(id)) return null;
      return await Ticket.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      console.error("Error en TicketDAO.updateById:", error);
      throw error;
    }
  }

  /**
   * Eliminar ticket
   */
  async deleteById(id) {
    try {
      if (!mongoose.isValidObjectId(id)) return null;
      return await Ticket.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error en TicketDAO.deleteById:", error);
      throw error;
    }
  }

  /**
   * Contar tickets
   */
  async count(filter = {}) {
    try {
      return await Ticket.countDocuments(filter);
    } catch (error) {
      console.error("Error en TicketDAO.count:", error);
      throw error;
    }
  }

  /**
   * Obtener todos los tickets
   */
  async findAll(options = {}) {
    try {
      let query = Ticket.find();

      if (options.populate) query = query.populate(options.populate);
      if (options.lean) query = query.lean();
      if (options.sort) query = query.sort(options.sort);

      return await query;
    } catch (error) {
      console.error("Error en TicketDAO.findAll:", error);
      throw error;
    }
  }
}

module.exports = new TicketDAO();
