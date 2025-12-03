/**
 * UserDTO - Data Transfer Object para usuarios
 * Convierte un usuario de la BD a un objeto seguro para respuestas HTTP
 * Evita enviar información sensible como contraseña
 */
class UserDTO {
  /**
   * Crea un UserDTO desde una entidad de BD
   * @param {Object} user - Usuario de la BD
   * @returns {Object} - DTO con datos públicos
   */
  static fromEntity(user) {
    if (!user) return null;

    return {
      id: user._id.toString(),
      first_name: user.first_name,
      last_name: user.last_name || null,
      email: user.email,
      age: user.age || null,
      role: user.role || "user",
      cart: user.cart ? user.cart.toString() : null,
      createdAt: user.createdAt
    };
  }

  /**
   * Crea un array de UserDTOs
   * @param {Array} users - Array de usuarios
   * @returns {Array} - Array de DTOs
   */
  static fromEntities(users) {
    if (!Array.isArray(users)) return [];
    return users.map(user => this.fromEntity(user));
  }

  /**
   * DTO minimalista (solo datos esenciales)
   * @param {Object} user - Usuario de la BD
   * @returns {Object} - DTO minimalista
   */
  static minimal(user) {
    if (!user) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role || "user"
    };
  }

  /**
   * DTO con carrito poblado (para operaciones de carrito)
   * @param {Object} user - Usuario con carrito poblado
   * @returns {Object}
   */
  static withCart(user) {
    if (!user) return null;

    const dto = this.fromEntity(user);

    // Si el carrito está poblado, incluir detalles
    if (user.cart && typeof user.cart === "object" && user.cart._id) {
      dto.cart = {
        id: user.cart._id.toString(),
        products: user.cart.products || [],
        createdAt: user.cart.createdAt
      };
    }

    return dto;
  }
}

module.exports = UserDTO;
