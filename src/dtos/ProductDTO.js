/**
 * ProductDTO - Data Transfer Object para productos
 * Convierte un producto de la BD a un objeto seguro para respuestas HTTP
 */
class ProductDTO {
  /**
   * DTO completo para administradores
   * @param {Object} product - Producto de la BD
   * @returns {Object} - DTO completo
   */
  static complete(product) {
    if (!product) return null;

    return {
      id: product._id.toString(),
      title: product.title,
      description: product.description,
      code: product.code,
      price: product.price,
      status: product.status,
      stock: product.stock,
      category: product.category,
      thumbnails: product.thumbnails || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }

  /**
   * DTO público (para clientes)
   * Oculta información sensible como stock actual
   * @param {Object} product - Producto de la BD
   * @returns {Object} - DTO público
   */
  static public(product) {
    if (!product) return null;

    // Si no está disponible, ni mostrar el producto
    if (product.status === false) return null;

    return {
      id: product._id.toString(),
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      thumbnails: product.thumbnails || [],
      inStock: product.stock > 0,
      estimatedDelivery: "5-7 días"
    };
  }

  /**
   * DTO minimalista para listados
   * @param {Object} product - Producto de la BD
   * @returns {Object}
   */
  static minimal(product) {
    if (!product) return null;

    return {
      id: product._id.toString(),
      title: product.title,
      price: product.price,
      image: product.thumbnails ? product.thumbnails[0] : null
    };
  }

  /**
   * DTO para carrito (incluye cantidad)
   * @param {Object} product - Producto de la BD
   * @param {Number} quantity - Cantidad en carrito
   * @returns {Object}
   */
  static inCart(product, quantity = 1) {
    if (!product) return null;

    const dto = this.complete(product);
    dto.quantity = quantity;
    dto.subtotal = product.price * quantity;

    return dto;
  }

  /**
   * Convierte array de productos
   * @param {Array} products - Array de productos
   * @param {String} type - Tipo de DTO: 'complete', 'public', 'minimal'
   * @returns {Array}
   */
  static fromArray(products, type = "complete") {
    if (!Array.isArray(products)) return [];

    return products
      .map(p => this[type](p))
      .filter(p => p !== null);
  }
}

module.exports = ProductDTO;
