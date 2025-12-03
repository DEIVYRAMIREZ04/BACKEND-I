const RepositoryFactory = require('../repositories/RepositoryFactory');

const userRepository = RepositoryFactory.createUserRepository();
const cartRepository = RepositoryFactory.createCartRepository();

/**
 * isAdmin - Solo permite acceso a usuarios con role === 'admin'
 */
async function isAdmin(req, res, next) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Autenticación requerida' });
    if (user.role !== 'admin') return res.status(403).json({ error: 'Solo administradores' });
    return next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * isOwner - Verifica que el usuario sea propietario del recurso (carrito)
 */
async function isOwner(req, res, next) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Autenticación requerida' });

    const { cid } = req.params;
    if (!cid) return res.status(400).json({ error: 'Carrito inválido' });

    const cart = await cartRepository.findByIdWithProducts(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    // Si el carrito tiene referencia a user, comparar
    if (cart.user) {
      if (cart.user.toString() !== user._id.toString()) {
        return res.status(403).json({ error: 'No tienes acceso a este carrito' });
      }
    } else {
      // Si no hay relación clara en el carrito, verificar el usuario
      const userWithCart = await userRepository.findByIdWithCart(user._id);
      if (!userWithCart || !userWithCart.cart) return res.status(403).json({ error: 'No tienes acceso a este carrito' });
      if (userWithCart.cart._id.toString() !== cid) return res.status(403).json({ error: 'No tienes acceso a este carrito' });
    }

    return next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { isAdmin, isOwner };