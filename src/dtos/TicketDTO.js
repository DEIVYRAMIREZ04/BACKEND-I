/**
 * TicketDTO - Data Transfer Object para tickets de compra
 * Convierte un ticket de la BD a un objeto seguro para respuestas HTTP
 */
class TicketDTO {
  /**
   * DTO completo del ticket
   * @param {Object} ticket - Ticket de la BD
   * @returns {Object}
   */
  static complete(ticket) {
    if (!ticket) return null;

    const ProductDTO = require("./ProductDTO");

    const products = ticket.products.map(item => ({
      product: ProductDTO.complete(item.product),
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity
    }));

    return {
      id: ticket._id.toString(),
      code: ticket.code,
      user: ticket.user.toString(),
      products,
      total: ticket.total,
      itemCount: products.reduce((sum, item) => sum + item.quantity, 0),
      status: ticket.status || "completed",
      purchaseDate: ticket.purchaseDate || ticket.createdAt,
      createdAt: ticket.createdAt
    };
  }

  /**
   * DTO para confirmación de compra (respuesta POST)
   * @param {Object} ticket - Ticket creado
   * @param {Array} failedItems - Items que no se pudieron procesar
   * @returns {Object}
   */
  static confirmation(ticket, failedItems = []) {
    if (!ticket) return null;

    const ProductDTO = require("./ProductDTO");

    const completedProducts = ticket.products.map(item => ({
      title: item.product.title,
      quantity: item.quantity,
      unitPrice: item.product.price,
      subtotal: item.product.price * item.quantity
    }));

    return {
      success: failedItems.length === 0,
      ticket: {
        code: ticket.code,
        total: ticket.total,
        itemsProcessed: completedProducts.length,
        itemsFailed: failedItems.length
      },
      products: {
        completed: completedProducts,
        failed: failedItems
      },
      status: failedItems.length === 0 ? "completed" : "partial",
      message:
        failedItems.length === 0
          ? "Compra completada exitosamente"
          : `Compra parcial. ${failedItems.length} productos no procesados.`
    };
  }

  /**
   * DTO minimalista
   * @param {Object} ticket - Ticket de la BD
   * @returns {Object}
   */
  static minimal(ticket) {
    if (!ticket) return null;

    return {
      code: ticket.code,
      total: ticket.total,
      status: ticket.status || "completed",
      date: ticket.purchaseDate || ticket.createdAt
    };
  }

  /**
   * Array de tickets (historial de compras)
   * @param {Array} tickets - Array de tickets
   * @returns {Array}
   */
  static fromArray(tickets) {
    if (!Array.isArray(tickets)) return [];

    return tickets.map(ticket => this.minimal(ticket));
  }
}

module.exports = TicketDTO;
