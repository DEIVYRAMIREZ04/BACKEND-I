module.exports.auth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      status: "error",
      message: "Acceso denegado. Debes iniciar sesión primero.",
    });
  }
  next();
};

module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      status: "error",
      message: "Acceso denegado. Usuario no autenticado.",
    });
  }

  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      message: "Solo los administradores tienen acceso a esta ruta.",
    });
  }

  next();
};
