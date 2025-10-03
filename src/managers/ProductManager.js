const Product = require("../models/product.model"); // importamos tu modelo "llanta"

class ProductManager {
  async getProducts() {
    return await Product.find();
  }

  async getProductById(id) {
    return await Product.findById(id);
  }

  async addProduct(product) {
    const newProduct = new Product(product);
    return await newProduct.save();
  }

  async updateProduct(id, fields) {
    return await Product.findByIdAndUpdate(id, fields, { new: true });
  }

  async deleteProduct(id) {
    return await Product.findByIdAndDelete(id);
  }
}

module.exports = ProductManager;
