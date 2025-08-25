const fs = require("fs").promises;
const path = require("path");

class ProductManager {
  constructor() {
    this.filePath = path.join(__dirname, "../data/products.json");
  }

  async #readFile() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async #writeFile(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async getProducts() {
    return await this.#readFile();
  }

  async getProductById(id) {
    const products = await this.#readFile();
    return products.find(p => p.id === id);
  }

  async addProduct(product) {
    const products = await this.#readFile();
    const newProduct = { id: Date.now().toString(), ...product };
    products.push(newProduct);
    await this.#writeFile(products);
    return newProduct;
  }

  async updateProduct(id, fields) {
    const products = await this.#readFile();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...fields, id }; // id no se cambia
    await this.#writeFile(products);
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this.#readFile();
    const filtered = products.filter(p => p.id !== id);
    if (products.length === filtered.length) return false;
    await this.#writeFile(filtered);
    return true;
  }
}

module.exports = ProductManager;