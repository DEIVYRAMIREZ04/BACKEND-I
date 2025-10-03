const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const kingProductsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    status: { type: Boolean, default: true },
    stock: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, lowercase: true, trim: true },
    thumbnails: { type: [String], default: ["NO_IMAGE"] },
  },
  { timestamps: true }
);

// 👇 le añadimos paginación
kingProductsSchema.plugin(mongoosePaginate);

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", kingProductsSchema);

module.exports = Product;
