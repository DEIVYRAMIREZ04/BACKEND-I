const BaseRepository = require("./BaseRepository");
const mongoose = require("mongoose");

class TicketRepository extends BaseRepository {
  /**
   * Obtiene tickets de un usuario con productos poblados
   */
  async findByUserId(userId, options = {}) {
    if (!mongoose.isValidObjectId(userId)) return [];
    return await this.dao.findByUserId(userId, {
      populate: ["user", "products.product"],
      ...options
    });
  }

  /**
   * Obtiene ticket por código con detalles completos
   */
  async findByCode(code) {
    if (!code || typeof code !== "string") return null;
    return await this.dao.findByCode(code);
  }

  /**
   * Obtiene ticket con productos poblados
   */
  async findByIdWithProducts(ticketId) {
    if (!mongoose.isValidObjectId(ticketId)) return null;
    return await this.dao.findById(ticketId, {
      populate: ["user", "products.product"]
    });
  }

  /**
   * Obtiene historial de compras de un usuario
   */
  async getUserPurchaseHistory(userId, limit = 10) {
    if (!mongoose.isValidObjectId(userId)) return [];
    return await this.dao.findByUserId(userId, {
      populate: ["products.product"],
      sort: { purchaseDate: -1 },
      limit
    });
  }

  /**
   * Verifica si un código de ticket existe
   */
  async codeExists(code) {
    if (!code) return false;
    const ticket = await this.findByCode(code);
    return !!ticket;
  }

  /**
   * Obtiene estadísticas de compra del usuario
   */
  async getUserPurchaseStats(userId) {
    if (!mongoose.isValidObjectId(userId)) return null;

    const tickets = await this.dao.findByUserId(userId);

    const totalPurchases = tickets.length;
    const totalSpent = tickets.reduce((sum, t) => sum + t.total, 0);
    const completedPurchases = tickets.filter(t => t.status === "completed").length;
    const partialPurchases = tickets.filter(t => t.status === "partial").length;

    return {
      totalPurchases,
      totalSpent,
      completedPurchases,
      partialPurchases,
      averageOrderValue: totalPurchases > 0 ? (totalSpent / totalPurchases).toFixed(2) : 0
    };
  }

  /**
   * Obtiene ticket más reciente del usuario
   */
  async getLatestUserTicket(userId) {
    if (!mongoose.isValidObjectId(userId)) return null;

    const tickets = await this.dao.findByUserId(userId, {
      sort: { purchaseDate: -1 },
      limit: 1
    });

    return tickets.length > 0 ? tickets[0] : null;
  }
}

module.exports = TicketRepository;
