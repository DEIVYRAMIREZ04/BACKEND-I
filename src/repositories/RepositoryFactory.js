/**
 * RepositoryFactory - Factory para crear instancias de Repositories
 * Centraliza la inyección de dependencias (Repositories + DAOs)
 * 
 * PATRÓN FACTORY: Proporciona un punto único de creación de objetos
 * Beneficios:
 * - Fácil de cambiar implementaciones
 * - Centraliza la configuración
 * - Facilita testing con mocks
 */

const UserRepository = require("./UserRepository");
const ProductRepository = require("./ProductRepository");
const CartRepository = require("./CartRepository");
const TicketRepository = require("./TicketRepository");

const userDao = require("../dao/userDao");
const productDao = require("../dao/productDao");
const cartDao = require("../dao/cartDao");
const ticketDao = require("../dao/ticketDao");

class RepositoryFactory {
  static createUserRepository() {
    return new UserRepository(userDao);
  }

  static createProductRepository() {
    return new ProductRepository(productDao);
  }

  static createCartRepository() {
    return new CartRepository(cartDao);
  }

  static createTicketRepository() {
    return new TicketRepository(ticketDao);
  }

  /**
   * Retorna objeto con todas las instancias
   * Útil para inyección en servicios
   */
  static getAllRepositories() {
    return {
      userRepository: this.createUserRepository(),
      productRepository: this.createProductRepository(),
      cartRepository: this.createCartRepository(),
      ticketRepository: this.createTicketRepository(),
    };
  }
}

module.exports = RepositoryFactory;
