const passport = require("passport");

// Middleware de autenticación usando JWT
module.exports.auth = passport.authenticate("jwt", { session: false });

// Middleware para verificar rol de administrador
module.exports.isAdmin = (req, res, next) => {
  // Primero verificar autenticación con JWT
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Error en la autenticación",
      });
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Acceso denegado. Debes iniciar sesión primero.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Solo los administradores tienen acceso a esta ruta.",
      });
    }

    // Asignar el usuario al request para que esté disponible en la ruta
    req.user = user;
    next();
  })(req, res, next);
};
