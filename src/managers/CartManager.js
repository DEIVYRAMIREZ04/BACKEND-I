const CartManager = require("../managers/CartManager");
const ProductManager = require("../managers/ProductManager"); // si lo tienes
const cartManager = new CartManager();


class CartController {
  // 👉 Mostrar carrito en vista handlebars
  async getCartByIdView(req, res) {
    try {
      const { cid } = req.params;
      const cart = await cartManager.getCartById(cid);

      if (!cart) {
        return res.status(404).send("Carrito no encontrado");
      }

      // Si quieres mostrar la info completa de cada producto (título, precio)
      // necesitas leer los productos desde ProductManager:
      const productManager = new ProductManager();
      const allProducts = await productManager.getProducts();

      const productsWithData = cart.products.map(item => {
        const productInfo = allProducts.find(p => p.id === item.product);
        return {
          ...item,
          productData: productInfo || { title: "Producto no encontrado", price: 0 }
        };
      });

      res.render("pages/cart", {
        title: "Tu carrito 🛒",
        cartId: cart.id,
        products: productsWithData
      });
    } catch (error) {
      console.error("❌ Error al renderizar carrito:", error);
      res.status(500).send("Error interno del servidor");
    }
  }
}

module.exports = new CartController();
