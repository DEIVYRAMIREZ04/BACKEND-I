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
  try {
    if (!id || id.trim() === "") {
      console.warn("⚠️ ID vacío o inválido recibido para eliminar producto");
      return null;
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      console.warn("❌ No se encontró producto con ID:", id);
    }

    return deletedProduct;
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
}

}

module.exports = ProductManager;
