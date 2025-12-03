const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true, trim: true },
  last_name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  age: { type: Number, min: 0 },
  password: { type: String, required: true }, // hash con bcrypt
  cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
  role: { type: String, default: "user", enum: ["user", "admin"] },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
