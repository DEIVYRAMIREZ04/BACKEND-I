/**
 * CartDTO - Data Transfer Object para carritos
 * Convierte un carrito de la BD a un objeto seguro para respuestas HTTP
 */
class CartDTO {
  /**
   * DTO completo del carrito con productos poblados
   * @param {Object} cart - Carrito de la BD con productos poblados
   * @returns {Object}
   */
  static complete(cart) {
    if (!cart) return null;

    const ProductDTO = require("./ProductDTO");

    const products = cart.products.map(item => ({
      product: ProductDTO.complete(item.product),
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity
    }));

    const total = products.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      id: cart._id.toString(),
      products,
      total,
      itemCount: products.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    };
  }

  /**
   * DTO minimalista (sin productos poblados)
   * @param {Object} cart - Carrito de la BD
   * @returns {Object}
   */
  static minimal(cart) {
    if (!cart) return null;

    return {
      id: cart._id.toString(),
      itemCount: cart.products ? cart.products.length : 0,
      createdAt: cart.createdAt
    };
  }

  /**
   * DTO para respuestas de agregar/eliminar productos
   * @param {Object} cart - Carrito de la BD
   * @param {String} action - Acción realizada: 'added', 'removed', 'updated'
   * @returns {Object}
   */
  static action(cart, action = "updated") {
    if (!cart) return null;

    return {
      id: cart._id.toString(),
      action,
      itemCount: cart.products ? cart.products.length : 0,
      timestamp: new Date()
    };
  }

  /**
   * DTO para visualización de carrito en vistas
   * @param {Object} cart - Carrito de la BD con productos poblados
   * @returns {Object}
   */
  static forView(cart) {
    if (!cart) return null;

    const ProductDTO = require("./ProductDTO");

    const products = (cart.products || []).map(item => ({
      id: item.product._id.toString(),
      title: item.product.title,
      price: item.product.price,
      image: item.product.thumbnails ? item.product.thumbnails[0] : null,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity
    }));

    const total = products.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      id: cart._id.toString(),
      products,
      summary: {
        total,
        itemCount: products.reduce((sum, item) => sum + item.quantity, 0),
        averagePrice: products.length > 0 ? (total / products.length).toFixed(2) : 0
      }
    };
  }
}

module.exports = CartDTO;
