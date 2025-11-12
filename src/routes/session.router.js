const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/passport.config");
const router = express.Router();

/**
 * @route POST /api/sessions/register
 * @desc Registra un nuevo usuario y devuelve el token JWT
 */
router.post("/register", (req, res, next) => {
  passport.authenticate("register", { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ status: "error", error: err.message });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: info?.message || "Error al registrar usuario",
      });
    }

    // ✅ Generar el token JWT inmediatamente después del registro
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      status: "success",
      message: "Usuario registrado correctamente",
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  })(req, res, next);
});

/**
 * @route POST /api/sessions/login
 * @desc Inicia sesión y devuelve un token JWT
 */
router.post("/login", (req, res, next) => {
  passport.authenticate("login", { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ status: "error", error: err.message });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: info?.message || "Credenciales inválidas",
      });
    }

    // ✅ Generar token JWT para el usuario autenticado
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      status: "success",
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  })(req, res, next);
});

/**
 * @route GET /api/sessions/current
 * @desc Devuelve los datos del usuario autenticado (requiere JWT)
 */
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      status: "success",
      user: {
        id: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  }
);

module.exports = router;
