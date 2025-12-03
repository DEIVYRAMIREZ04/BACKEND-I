const productService = require("../services/productService");
const querystring = require("querystring");
const cartService = require("../services/cartService");

class ProductController {
  async getHome(req, res) {
    try {
      const products = await productService.getAllProducts();
      const cart = await cartService.createCart();

      res.json({
        status: "success",
        message: "Inicio cargado correctamente",
        payload: {
          cartId: cart._id,
          products
        }
      });
    } catch (error) {
      console.error("Error al cargar home:", error);
      res.status(500).json({ status: "error", message: "Error interno del servidor" });
    }
  }

  async getAllProductsApi(req, res) {
    try {
      let { limit = 10, page = 1, sort, query } = req.query;
      limit = parseInt(limit) || 10;
      page = parseInt(page) || 1;

      const filter = {};
      if (query) {
        if (query.includes(":")) {
          const [key, value] = query.split(":");
          if (key === "category") filter.category = value;
          else if (key === "status")
            filter.status = value === "true" || value === "1";
          else filter[key] = value;
        } else {
          filter.$or = [{ category: query }, { title: new RegExp(query, "i") }];
        }
      }

      const sortObj = {};
      if (sort === "asc") sortObj.price = 1;
      else if (sort === "desc") sortObj.price = -1;

      const total = await productService.countProducts(filter);
      const totalPages = Math.max(1, Math.ceil(total / limit));
      if (page > totalPages) page = totalPages;

      const products = await productService.getProductsPaginated({
        filter,
        sort: sortObj,
        limit,
        page,
      });

      const hasPrevPage = page > 1;
      const hasNextPage = page < totalPages;
      const prevPage = hasPrevPage ? page - 1 : null;
      const nextPage = hasNextPage ? page + 1 : null;

      const buildLink = (p) => {
        const q = { ...req.query, page: p, limit };
        return `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}?${querystring.stringify(q)}`;
      };

      res.json({
        status: "success",
        message: "Productos paginados obtenidos correctamente",
        payload: products,
        totalPages,
        prevPage,
        nextPage,
        page,
        hasPrevPage,
        hasNextPage,
        prevLink: hasPrevPage ? buildLink(prevPage) : null,
        nextLink: hasNextPage ? buildLink(nextPage) : null
      });
    } catch (err) {
      console.error("Error en paginación:", err);
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  async getProductById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product)
        return res.status(404).json({ status: "error", message: "Producto no encontrado" });

      res.json({ status: "success", payload: product });
    } catch (err) {
      console.error("Error al obtener producto:", err);
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  async createProduct(req, res) {
    try {
      const { title, description, code, price, status, stock, category } = req.body;

      const newProduct = {
        title,
        description,
        code,
        price: parseFloat(price),
        status: status === "true",
        stock: parseInt(stock),
        category,
        thumbnails: req.file ? [`/uploads/${req.file.filename}`] : [],
      };

      const saved = await productService.createProduct(newProduct);

      req.app.get("io").emit("updateProducts", await productService.getAllProducts());

      res.status(201).json({
        status: "success",
        message: "Producto creado correctamente",
        payload: saved
      });
    } catch (err) {
      console.error("Error al crear producto:", err);
      res.status(500).json({ status: "error", message: "Error al crear producto" });
    }
  }

  async updateProduct(req, res) {
    try {
      const updated = await productService.updateProductById(req.params.id, req.body);
      if (!updated)
        return res.status(404).json({ status: "error", message: "Producto no encontrado" });

      res.json({
        status: "success",
        message: "Producto actualizado correctamente",
        payload: updated
      });
    } catch (err) {
      console.error("Error al actualizar producto:", err);
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      const deleted = await productService.deleteProductById(req.params.id);
      if (!deleted)
        return res.status(404).json({ status: "error", message: "Producto no encontrado" });

      req.app.get("io").emit("updateProducts", await productService.getAllProducts());

      res.json({
        status: "success",
        message: "Producto eliminado correctamente",
        payload: deleted
      });
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      res.status(500).json({ status: "error", message: err.message });
    }
  }
}

module.exports = new ProductController();
