const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const productsRouter = require("./routes/product.router");
const cartsRouter = require("./routes/cart.router");
const { MONGO_URI,paths } = require("./config/config");
const ProductManager = require("./managers/ProductManager");
const mongoose = require("mongoose");
require("dotenv").config(); 

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const productManager = new ProductManager();
const PORT = process.env.PORT || 8080;


//cart

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

// --- Handlebars
const handlebars = require("express-handlebars");
const { Mongoose } = require("mongoose");
const { config } = require("dotenv");
app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      year: () => new Date().getFullYear(),
      first: (arr) => (arr && arr.length > 0 ? arr[0] : null),
      firstThumbnail: (thumbnails) => {
      if (thumbnails && thumbnails.length > 0) {
        return thumbnails[0];
      }
      return '/uploads/no-image.png';
    }
    },
  })
);
app.set("view engine", "hbs");
app.set("views", paths.views); 

// ---Mongoose
mongoose.connect(MONGO_URI) 
  .then(() => console.log("Conectado a MongoDB Atlas"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// --- Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Archivos estáticos
app.use("/static", express.static(paths.public));
app.use("/uploads", express.static(paths.upload));

// --- Compartir io en las rutas
app.set("io", io);

// --- Rutas API
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// --- Rutas de vistas
app.get("/", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("pages/home", { products });
});

app.get("/realtimeproducts", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("realTimeProducts", { products });
});

// --- Socket.IO
io.on("connection", (socket) => {
  console.log(" Cliente conectado");

  //Solo un listener para eliminar
  socket.on("deleteProduct", async (id) => {
    await productManager.deleteProduct(id);
    io.emit("updateProducts", await productManager.getProducts());
  });
});

// --- Server ON
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
