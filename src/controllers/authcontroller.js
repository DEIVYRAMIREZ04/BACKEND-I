const User = require("../models/User.model");
const bcrypt = require("bcrypt");

class AuthController {
  /**
   * Obtiene el usuario actual autenticado
   * Usado típicamente después de una autenticación JWT exitosa
   */
  async getCurrentUser(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: "error",
          message: "Usuario no autenticado",
        });
      }

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
    } catch (error) {
      console.error("Error al obtener usuario actual:", error);
      res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Actualiza datos del perfil del usuario autenticado
   */
  async updateProfile(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: "error",
          message: "Usuario no autenticado",
        });
      }

      const { first_name, last_name, age } = req.body;
      const updateData = {};

      if (first_name) updateData.first_name = first_name;
      if (last_name) updateData.last_name = last_name;
      if (age) updateData.age = age;

      const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
        new: true,
      });

      res.json({
        status: "success",
        message: "Perfil actualizado correctamente",
        user: {
          id: updatedUser._id,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      res.status(500).json({
        status: "error",
        message: "Error al actualizar perfil",
      });
    }
  }

  /**
   * Cambia la contraseña del usuario autenticado
   */
  async changePassword(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: "error",
          message: "Usuario no autenticado",
        });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          status: "error",
          message: "Debe proporcionar contraseña actual y nueva",
        });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Usuario no encontrado",
        });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          status: "error",
          message: "Contraseña actual incorrecta",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.json({
        status: "success",
        message: "Contraseña actualizada correctamente",
      });
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      res.status(500).json({
        status: "error",
        message: "Error al cambiar contraseña",
      });
    }
  }
}

module.exports = new AuthController();
