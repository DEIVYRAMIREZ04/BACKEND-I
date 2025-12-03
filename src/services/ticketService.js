const mongoose = require('mongoose');
const RepositoryFactory = require('../repositories/RepositoryFactory');
const TicketDTO = require('../dtos/TicketDTO');

class TicketService {
  constructor() {
    this.ticketRepository = RepositoryFactory.createTicketRepository();
    this.productRepository = RepositoryFactory.createProductRepository();
    this.cartRepository = RepositoryFactory.createCartRepository();
    this.userRepository = RepositoryFactory.createUserRepository();
  }

  /**
   * Realiza el checkout de un carrito para un usuario
   * - Verifica propiedad del carrito
   * - Valida stock por producto
   * - Crea ticket con los items procesados
   * - Reduce stock de productos procesados
   * - Elimina del carrito sólo los items procesados (los fallidos quedan)
   */
  async checkout(cartId, userId) {
    if (!mongoose.isValidObjectId(cartId) || !mongoose.isValidObjectId(userId)) {
      throw new Error('IDs inválidos');
    }

    // Verificar propiedad del carrito a través del usuario
    const user = await this.userRepository.findByIdWithCart(userId);
    if (!user) throw new Error('Usuario no encontrado');

    // Si el usuario tiene carrito asignado y no coincide, denegar
    if (user.cart && user.cart._id && user.cart._id.toString() !== cartId) {
      throw new Error('No tienes permiso para procesar este carrito');
    }

    // Obtener carrito con productos poblados
    const cart = await this.cartRepository.findByIdWithProducts(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    const items = cart.products || [];
    if (items.length === 0) {
      throw new Error('El carrito está vacío');
    }

    const processed = [];
    const failed = [];

    // Separar procesables vs fallidos
    for (const item of items) {
      const product = item.product;
      const qty = item.quantity || 0;

      if (!product) {
        failed.push({ productId: null, requestedQty: qty, availableQty: 0 });
        continue;
      }

      const available = await this.productRepository.getStock(product._id);
      if (available >= qty) {
        processed.push({ product, quantity: qty });
      } else {
        failed.push({
          productId: product._id.toString(),
          title: product.title || product.name || 'producto',
          requestedQty: qty,
          availableQty: available
        });
      }
    }

    if (processed.length === 0) {
      // Nada se pudo procesar
      return {
        ticket: null,
        failedItems: failed,
        message: 'No se pudo procesar ningún item del carrito'
      };
    }

    // Reducir stock para los items procesados
    for (const p of processed) {
      await this.productRepository.updateStock(p.product._id, -p.quantity);
    }

    // Calcular total
    const total = processed.reduce((sum, p) => sum + (p.product.price || 0) * p.quantity, 0);

    // Crear ticket con items procesados
    const ticketData = {
      user: userId,
      products: processed.map(p => ({ product: p.product._id, quantity: p.quantity })),
      total,
      status: failed.length === 0 ? 'completed' : 'partial'
    };

    const created = await this.ticketRepository.create(ticketData);

    // Obtener ticket poblado para DTO
    const ticketPopulated = await this.ticketRepository.findByIdWithProducts(created._id);

    // Remover del carrito los productos que fueron procesados
    const remaining = items
      .filter(i => {
        const prodId = i.product && i.product._id ? i.product._id.toString() : null;
        return !processed.some(p => p.product._id.toString() === prodId);
      })
      .map(i => ({ product: i.product._id, quantity: i.quantity }));

    await this.cartRepository.replaceProducts(cartId, remaining);

    return {
      ticket: ticketPopulated,
      failedItems: failed,
      message: failed.length === 0 ? 'Compra completada' : 'Compra parcial'
    };
  }
}

module.exports = new TicketService();
