const express = require("express");
const passport = require("passport");
const { isAdmin } = require("../middleware/auth");
const router = express.Router();

// --- GET: Login (solo mensaje informativo) ---
router.get("/login", (req, res) => {
  res.json({
    status: "ok",
    message: "Usa POST /login para iniciar sesión",
  });
});

// --- GET: Register (solo admins) ---
router.get("/register", isAdmin, (req, res) => {
  res.json({
    status: "ok",
    message: "Usa POST /register para registrar un nuevo usuario (solo admin)",
  });
});

// --- POST: Registro ---
router.post("/register", isAdmin, (req, res, next) => {
  passport.authenticate("register", (err, user, info) => {
    if (err) return res.status(500).json({ status: "error", error: err.message });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: info?.message || "Error al registrar usuario",
      });
    }

    req.login(user, (err) => {
      if (err) return res.status(500).json({ status: "error", error: err.message });

      return res.status(201).json({
        status: "success",
        message: "Usuario registrado correctamente",
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      });
    });
  })(req, res, next);
});

// --- POST: Login ---
router.post("/login", (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) return res.status(500).json({ status: "error", error: err.message });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: info?.message || "Credenciales incorrectas",
      });
    }

    req.login(user, (err) => {
      if (err) return res.status(500).json({ status: "error", error: err.message });

      return res.json({
        status: "success",
        message: `Inicio de sesión exitoso como ${user.role}`,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      });
    });
  })(req, res, next);
});

// --- GET: Logout ---
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).json({
        status: "error",
        message: "No se pudo cerrar sesión",
      });
    }

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({
        status: "success",
        message: "Sesión cerrada correctamente",
      });
    });
  });
});

module.exports = router;
