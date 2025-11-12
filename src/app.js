require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const cartService = require("./services/cartService");
const productsRouter = require("./routes/product.router");
const cartsRouter = require("./routes/cart.router");
const authRoutes = require("./routes/auth.router");
const { MONGO_URI, paths } = require("./config/config");
const ProductManager = require("./managers/ProductManager");
const productController = require("./controllers/productController");
const { auth, isAdmin } = require("./middleware/auth");
const passport = require("passport");
const initializePassport = require("./config/passport.config");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const productManager = new ProductManager();
const PORT = process.env.PORT || 8080;
const sessionsRouter = require("./routes/session.router");


// --- Middlewares básicos ---
app.use("/api/sessions", sessionsRouter);
app.use(methodOverride("_method"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// --- Archivos estáticos ---
app.use("/static", express.static(paths.public));
app.use("/uploads", express.static(paths.upload));

// --- 🧠 Configurar sesiones (ANTES de las rutas) ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || "clave-secreta",
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: "aceeso-admi",
      collectionName: "sessions",
      ttl: 60 * 60, // 1 hora
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 día
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // solo HTTPS en prod
    },
  })
);

// --- Passport ---
initializePassport();
app.use(passport.initialize());


// --- Rutas API ---
app.use("/", authRoutes);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// --- Middleware para verificar roles ---
function requireRole(role) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ status: "error", message: "Debes iniciar sesión" });
    }

    if (req.session.user.role !== role) {
      req.session.destroy(() => {
        res.status(403).json({ status: "error", message: "Solo administradores pueden acceder" });
      });
      return;
    }

    next();
  };
}

// --- Conexión a MongoDB y arranque del servidor ---
async function start() {
  try {
    console.log("Intentando conectar a MongoDB...");
    await mongoose.connect(MONGO_URI, {});
    console.log("✅ Conectado a MongoDB Atlas");

    // Inicializar carrito
    try {
      const existingCart = await cartService.getAnyCart();
      if (existingCart) {
        app.locals.cartId = existingCart._id.toString();
        console.log("🛒 Carrito existente cargado:", app.locals.cartId);
      } else {
        const newCart = await cartService.createCart();
        app.locals.cartId = newCart._id.toString();
        console.log("🆕 Carrito creado al iniciar servidor:", app.locals.cartId);
      }
    } catch (err) {
      console.error("❌ Error al inicializar carrito:", err);
    }

    // --- Rutas JSON en lugar de vistas ---

    app.get("/", async (req, res) => {
      try {
        const products = await productManager.getProducts();
        res.json({
          status: "success",
          message: "Productos cargados correctamente",
          data: {
            products,
            cartId: req.app.locals.cartId || null,
            user: req.session?.user || null,
          },
        });
      } catch (error) {
        console.error("Error al cargar productos:", error);
        res.status(500).json({
          status: "error",
          message: "Error al cargar productos",
          error: error.message,
        });
      }
    });

    app.get("/empresa", (req, res) => {
      res.json({
        status: "success",
        message: "Información de la empresa disponible",
        user: req.session?.user || null,
      });
    });

    app.get("/register", isAdmin, (req, res) => {
      res.json({
        status: "success",
        message: "Ruta disponible solo para administradores",
        user: req.session?.user || null,
      });
    });

    app.get("/realTimeProducts", auth, async (req, res) => {
      try {
        const products = await productManager.getProducts();
        res.json({
          status: "success",
          message: "Productos en tiempo real",
          data: products,
          user: req.user,
        });
      } catch (error) {
        console.error("Error en realTimeProducts:", error);
        res.status(500).json({ status: "error", message: "Error interno", error: error.message });
      }
    });

    app.get("/products", productController.getAllProductsApi);

    // --- Socket.IO ---
    io.on("connection", (socket) => {
      console.log("Cliente conectado a Socket.IO");
      socket.on("deleteProduct", async (id) => {
        await productManager.deleteProduct(id);
        io.emit("updateProducts", await productManager.getProducts());
      });
    });

    // --- Iniciar servidor ---
    httpServer.listen(PORT, () => {
      console.log(`🚀 Servidor JSON corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error al conectar a MongoDB:", err);
    process.exit(1);
  }
}

start();

/*🔐 Autenticación (Passport + Sessions)
Endpoints
Método	Ruta	Descripción	Body (JSON)	Respuesta
POST	/register	Registro (solo admin)	{ "email": "", "password": "", "role": "user" }	201 { message }
POST	/login	Iniciar sesión	{ "email": "", "password": "" }	200 { message }
GET	/logout	Cerrar sesión	—	{ message: "Sesión cerrada" }
Roles

admin: puede crear, editar y eliminar productos.

user: solo puede ver y agregar productos al carrito.

🛍️ Productos — /api/products
Método	Ruta	Descripción	Body	Auth
GET	/api/products	Listar todos	—	Público
GET	/api/products/:id	Obtener uno	—	Público
POST	/api/products	Crear (con imagen)	form-data (imagen)	Admin
PUT	/api/products/:id	Actualizar	JSON parcial	Admin
DELETE	/api/products/:id	Eliminar	—	Admin
🛒 Carritos — /api/carts
Método	Ruta	Descripción	Body
GET	/api/carts/:cid	Obtener carrito	—
POST	/api/carts	Crear nuevo carrito	—
POST	/api/carts/:cid/products/:pid	Agregar producto	—
DELETE	/api/carts/:cid/products/:pid	Eliminar producto	—
⚡ Socket.IO (productos en tiempo real)

Canal: realTimeProducts

Eventos:

deleteProduct → Elimina un producto por ID.

updateProducts → Envía lista actualizada al cliente.

🧰 Middleware de Autorización
auth        // Requiere estar logueado
isAdmin     // Requiere rol admin

🧪 Cómo testear con Postman

Inicia el servidor:

npm start


Abre Postman → crea una colección.

Usa las rutas anteriores.

Primero haz POST /login para autenticar.

Postman guardará la cookie connect.sid.

Luego podrás acceder a las rutas protegidas (crear, editar o eliminar productos).

🧱 Rutas principales del proyecto
Tipo	Ruta	Descripción
Vistas	/	Página principal (Handlebars)
Vistas	/realTimeProducts	Productos en tiempo real
API	/api/products	CRUD de productos
API	/api/carts	CRUD de carritos
Auth	/login, /register, /logout	Autenticación
🧠 Tecnologías

Node.js / Express

MongoDB / Mongoose

Passport.js (LocalStrategy)

Handlebars (vistas)

Socket.IO (tiempo real)

Multer (uploads)

Express-session + connect-mongo*/