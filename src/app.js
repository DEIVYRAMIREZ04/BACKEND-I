require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const cors = require("cors");
const productsRouter = require("./routes/product.router");
const cartsRouter = require("./routes/cart.router");
const apiRouter = require("./routes/api.router");
const initSockets = require("./sockets");
const { MONGO_URI, paths } = require("./config/config");
const passport = require("passport");
const initializePassport = require("./config/passport.config");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const PORT = process.env.PORT || 8080;
const sessionsRouter = require("./routes/session.router");

// ====== CORS ======
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

//Middleware Globales
app.use(methodOverride("_method"))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Passport (JWT stateless - no sesiones)
initializePassport();
app.use(passport.initialize());

//Static
app.use("/static", express.static(paths.public));
app.use("/uploads", express.static(paths.upload));

//Rutas API
app.use("/api/sessions", sessionsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api", apiRouter);

async function start() {
  try {
    console.log("Intentando conectar a MongoDB...");
    await mongoose.connect(MONGO_URI, {});
    console.log("✅ Conectado a MongoDB Atlas");

    app.use((err, req, res, next) => {
      console.error("Error capturado:", err);

      res.status(err.status || 500).json({
        status: "error",
        message: err.message || "Error interno del servidor",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      });
    });

    // Inicializar Socket.IO con autenticación y manejo de eventos
    initSockets(io);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Servidor JSON corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error al conectar a MongoDB:", err);
    process.exit(1);
  }
}

start();
