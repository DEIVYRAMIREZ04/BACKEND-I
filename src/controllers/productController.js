const productService = require("../services/productService");
const querystring = require("querystring");

class ProductController {
  async getHome(req, res) {
    const products = await productService.getAllProducts();
    res.render("pages/home", { products });
  }

 async getAllProductsView(req, res) {
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

    res.render("pages/products", {
      products:products.docs,
      page,
      totalPages,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
    });
  } catch (err) {
    console.error("Error cargando productos view:", err);
    res.status(500).send("Error al cargar productos");
  }
}

  // GET /api/products con paginación, filtros y orden


  async getAllProductsApi(req, res) {
    try {
      let { limit = 10, page = 1, sort, query } = req.query;
      limit = parseInt(limit) || 10;
      page = parseInt(page) || 1;

      // construir filtro dinámico

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

      // ordenamiento

      const sortObj = {};
      if (sort === "asc") sortObj.price = 1;
      else if (sort === "desc") sortObj.price = -1;

      // pedirle a productService que devuelva paginado

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
        return `${req.protocol}://${req.get("host")}${req.baseUrl}${
          req.path
        }?${querystring.stringify(q)}`;
      };

      return res.json({
        status: "success",
        payload: products,
        totalPages,
        prevPage,
        nextPage,
        page,
        hasPrevPage,
        hasNextPage,
        prevLink: hasPrevPage ? buildLink(prevPage) : null,
        nextLink: hasNextPage ? buildLink(nextPage) : null,
      });
    } catch (err) {
      console.error("Error en paginación:", err);
      return res.status(500).json({ status: "error", error: err.message });
    }
  }

  async getProductById(req, res) {
    const product = await productService.getProductById(req.params.id);
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  }

  async createProduct(req, res) {
    try {
      const { title, description, code, price, status, stock, category } =
        req.body;

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

      // aviso a sockets

      req.app
        .get("io")
        .emit("updateProducts", await productService.getAllProducts());

      res.status(201).json(saved);
    } catch (err) {
      console.error("Error al crear:", err);
      res.status(500).json({ error: "Error al crear producto" });
    }
  }

  async updateProduct(req, res) {
    const updated = await productService.updateProductById(
      req.params.id,
      req.body
    );
    if (!updated)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(updated);
  }

  async deleteProduct(req, res) {
    const deleted = await productService.deleteProductById(req.params.id);

    if (!deleted)
      return res.status(404).json({ error: "Producto no encontrado" });

    req.app
      .get("io")
      .emit("updateProducts", await productService.getAllProducts());
    res.json({ success: true });
  }
}

module.exports = new ProductController();
