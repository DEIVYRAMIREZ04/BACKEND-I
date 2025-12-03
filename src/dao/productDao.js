const mongoose = require("mongoose");
const Product = require("../models/product.model");

class ProductDao {

  async create(data) {
    try {
      const nuevo = new Product(data);
      return await nuevo.save();
    } catch (error) {
      console.error("Error en DAO.create:", error);
      throw error;
    }
  }

  async findAll() {
    try {
      return await Product.find().lean();
    } catch (error) {
      console.error("Error en DAO.findAll:", error);
      throw error;
    }
  }

  async findById(id) {
    try {
      if (!mongoose.isValidObjectId(id)) return null;
      return await Product.findById(id).lean();
    } catch (error) {
      console.error("Error en DAO.findById:", error);
      throw error;
    }
  }

  async findOne(filter = {}) {
    try {
      return await Product.findOne(filter).lean();
    } catch (error) {
      console.error("Error en DAO.findOne:", error);
      throw error;
    }
  }

  async find(filter = {}) {
    try {
      return await Product.find(filter).lean();
    } catch (error) {
      console.error("Error en DAO.find:", error);
      throw error;
    }
  }

  async updateById(id, data) {
    try {
      if (!mongoose.isValidObjectId(id)) return null;

      return await Product.findByIdAndUpdate(id, data, {
        new: true,
        lean: true
      });
    } catch (error) {
      console.error("Error en DAO.updateById:", error);
      throw error;
    }
  }

  async findByIdAndUpdate(id, data, options = { new: true }) {
    try {
      if (!mongoose.isValidObjectId(id)) return null;
      return await Product.findByIdAndUpdate(id, data, options);
    } catch (error) {
      console.error("Error en DAO.findByIdAndUpdate:", error);
      throw error;
    }
  }

  async deleteById(id) {
    try {
      if (!mongoose.isValidObjectId(id)) return null;
      return await Product.findByIdAndDelete(id).lean();
    } catch (error) {
      console.error("Error en DAO.deleteById:", error);
      throw error;
    }
  }

  async paginate(filter, options) {
    try {
      return await Product.paginate(filter, options);
    } catch (error) {
      console.error("Error en DAO.paginate:", error);
      throw error;
    }
  }

  async count(filter) {
    try {
      return await Product.countDocuments(filter);
    } catch (error) {
      console.error("Error en DAO.count:", error);
      throw error;
    }
  }
}

module.exports = new ProductDao();
