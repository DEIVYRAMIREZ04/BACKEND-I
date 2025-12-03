const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const initializePassport = require("../config/passport.config");
const { JWT_SECRET } = require("../config/passport.config");
const { validateRegister, validateLogin } = require("../middleware/validation");
const UserDTO = require("../dtos/UserDTO");
const router = express.Router();

router.post("/register", validateRegister, (req, res, next) => {
  passport.authenticate("register", { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ status: "error", error: err.message });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: info?.message || "Error al registrar usuario",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
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

router.post("/login", validateLogin, (req, res, next) => {
  passport.authenticate("login", { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ status: "error", error: err.message });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: info?.message || "Credenciales inválidas",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
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
