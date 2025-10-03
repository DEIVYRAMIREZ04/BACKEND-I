const productDao = require("../dao/productDao");

class ProductService {
  async createProduct(data) {
    return await productDao.create(data);
  }

  async getAllProducts() {
    return await productDao.findAll();
  }

  async getProductById(id) {
    return await productDao.findById(id);
  }

  async updateProductById(id, data) {
    return await productDao.updateById(id, data);
  }

  async deleteProductById(id) {
    return await productDao.deleteById(id);
  }

  // 🔥 nuevos
  async getProductsPaginated({ filter, sort, limit, page }) {
    return await productDao.paginate(filter, {
      sort,
      limit,
      page,
      lean: true, // importante para que handlebars los lea
    });
  }

  async countProducts(filter) {
    return await productDao.count(filter);
  }
}

module.exports = new ProductService();
