const passport = require("passport");
const { JWT_SECRET } = require("../config/passport.config");
const jwt = require("jsonwebtoken");
const productService = require("../services/productService");

/**
 * Inicializa eventos de Socket.IO con autenticación y validación de permisos
 * @param {Server} io - Instancia de Socket.IO
 */
function initSockets(io) {
  /**
   * Middleware para autenticar sockets usando JWT
   * Extrae el token del header Authorization y verifica su validez
   */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        console.log(`[Socket] Cliente conectado sin autenticación (anónimo): ${socket.id}`);
        // Permitir conexión anónima pero marcar como no autenticado
        socket.user = null;
        return next();
      }

      // Verificar y decodificar el token JWT
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      console.log(`[Socket] Cliente autenticado: ${decoded.email} (${socket.id})`);
      next();
    } catch (error) {
      console.error(`[Socket] Error de autenticación: ${error.message}`);
      // No rechazar la conexión, solo marcar como no autenticado
      socket.user = null;
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ Cliente conectado a Socket.IO: ${socket.id}`);

    /**
     * Evento: deleteProduct
     * Solo administradores pueden eliminar productos
     */
    socket.on("deleteProduct", async (productId) => {
      try {
        // Validar que el usuario esté autenticado
        if (!socket.user) {
          return socket.emit("error", {
            status: "error",
            message: "No autenticado. Debes iniciar sesión para eliminar productos.",
          });
        }

        // Validar que el usuario sea administrador
        if (socket.user.role !== "admin") {
          return socket.emit("error", {
            status: "error",
            message: "Acceso denegado. Solo administradores pueden eliminar productos.",
          });
        }

        // Validar que sea un ObjectId válido
        if (!productId || productId.length !== 24) {
          return socket.emit("error", {
            status: "error",
            message: "ID de producto inválido",
          });
        }

        // Eliminar el producto
        const deletedProduct = await productService.deleteProductById(productId);

        if (!deletedProduct) {
          return socket.emit("error", {
            status: "error",
            message: "Producto no encontrado",
          });
        }

        // Obtener lista actualizada de productos
        const updatedProducts = await productService.getAllProducts();

        // Emitir a todos los clientes conectados
        io.emit("updateProducts", {
          status: "success",
          message: `Producto "${deletedProduct.title}" eliminado por ${socket.user.email}`,
          data: updatedProducts,
        });

        console.log(
          `🗑️  Producto "${deletedProduct.title}" eliminado por ${socket.user.email}`
        );

        // Confirmar al cliente que eliminó
        socket.emit("productDeleted", {
          status: "success",
          message: `Producto eliminado correctamente`,
          productId,
        });
      } catch (error) {
        console.error("[Socket] Error al eliminar producto:", error);
        socket.emit("error", {
          status: "error",
          message: "Error al eliminar producto",
          error: error.message,
        });
      }
    });

    /**
     * Evento: createProduct (opcional, para crear desde socket)
     * Solo administradores pueden crear productos
     */
    socket.on("createProduct", async (productData) => {
      try {
        if (!socket.user) {
          return socket.emit("error", {
            status: "error",
            message: "No autenticado. Debes iniciar sesión para crear productos.",
          });
        }

        if (socket.user.role !== "admin") {
          return socket.emit("error", {
            status: "error",
            message: "Acceso denegado. Solo administradores pueden crear productos.",
          });
        }

        // Validar campos obligatorios
        if (!productData.title || !productData.code || !productData.price) {
          return socket.emit("error", {
            status: "error",
            message: "Faltan campos obligatorios: title, code, price",
          });
        }

        // Crear el producto
        const newProduct = await productService.createProduct(productData);

        // Obtener lista actualizada
        const updatedProducts = await productService.getAllProducts();

        // Emitir a todos los clientes
        io.emit("updateProducts", {
          status: "success",
          message: `Producto "${newProduct.title}" creado por ${socket.user.email}`,
          data: updatedProducts,
        });

        console.log(
          `✨ Producto "${newProduct.title}" creado por ${socket.user.email}`
        );

        socket.emit("productCreated", {
          status: "success",
          message: "Producto creado correctamente",
          product: newProduct,
        });
      } catch (error) {
        console.error("[Socket] Error al crear producto:", error);
        socket.emit("error", {
          status: "error",
          message: "Error al crear producto",
          error: error.message,
        });
      }
    });

    /**
     * Evento: disconnect
     * Se ejecuta cuando un cliente se desconecta
     */
    socket.on("disconnect", () => {
      const userEmail = socket.user?.email || "anónimo";
      console.log(`❌ Cliente desconectado: ${userEmail} (${socket.id})`);
    });

    /**
     * Evento: error (opcional)
     * Maneja errores generales
     */
    socket.on("error", (error) => {
      console.error(`[Socket] Error recibido del cliente: ${error}`);
    });
  });
}

module.exports = initSockets;
