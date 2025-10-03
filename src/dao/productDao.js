const Product = require("../models/product.model");

class ProductDao {
  async create(data) {
    const nuevo = new Product(data);
    return await nuevo.save();
  }

  async findAll() {
    return await Product.find();
  }

  async findById(id) {
    return await Product.findById(id);
  }

  async updateById(id, data) {
    return await Product.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id) {
    return await Product.findByIdAndDelete(id);
  }

  // 🔥 nuevos métodos
  async paginate(filter, options) {
    return await Product.paginate(filter, options);
  }

  async count(filter) {
    return await Product.countDocuments(filter);
  }
}

module.exports = new ProductDao();
