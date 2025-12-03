const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const initializePassport = require("../config/passport.config");
const { JWT_SECRET } = require("../config/passport.config");
const { validateRegister, validateLogin } = require("../middleware/validation");
const UserDTO = require("../dtos/UserDTO");
const RepositoryFactory = require("../repositories/RepositoryFactory");
const PasswordReset = require("../models/PasswordReset.model");
const mailService = require("../services/mailService");

const userRepository = RepositoryFactory.createUserRepository();
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

/**
 * POST /forgot-password
 * Envía email con link de recuperación
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ status: "error", message: "Email requerido" });

    // Buscar usuario
    const user = await userRepository.findByEmail(email);
    if (!user) return res.status(404).json({ status: "error", message: "Usuario no encontrado" });

    // Generar token
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Crear registro PasswordReset
    await PasswordReset.create({
      user: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 3600000) // 1 hora
    });

    // Construir link
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}&userId=${user._id}`;

    // Enviar email
    await mailService.sendPasswordResetEmail(email, resetLink);

    res.json({ status: "success", message: "Email de recuperación enviado. Revisa tu bandeja de entrada." });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

/**
 * POST /reset-password
 * Valida token y actualiza contraseña
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, userId, newPassword, confirmPassword } = req.body;

    // Validar datos
    if (!token || !userId || !newPassword) {
      return res.status(400).json({ status: "error", message: "Datos incompletos" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: "error", message: "Las contraseñas no coinciden" });
    }

    // Hash del token recibido
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Buscar reset válido y no expirado
    const reset = await PasswordReset.findOne({
      user: userId,
      token: hashedToken,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!reset) return res.status(400).json({ status: "error", message: "Token inválido o expirado" });

    // Buscar usuario
    const user = await userRepository.findById(userId);
    if (!user) return res.status(404).json({ status: "error", message: "Usuario no encontrado" });

    // Verificar que NO sea la misma contraseña
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) return res.status(400).json({ status: "error", message: "No puedes usar la misma contraseña anterior" });

    // Hash nueva contraseña
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar usuario
    await userRepository.updateById(userId, { password: newHashedPassword });

    // Marcar token como usado
    reset.used = true;
    await reset.save();

    // Enviar email de confirmación
    await mailService.sendPasswordChangedEmail(user.email);

    res.json({ status: "success", message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error en reset-password:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
