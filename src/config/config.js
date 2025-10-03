const path = require("path");
require("dotenv").config();
const mongoose = require("mongoose");

module.exports = {
  MONGO_URI: process.env.MONGO_URI || "mongodb+srv://deivrsmirez_db_user:RyVcTSeZGUhWg6Ti@cluster0llantas.6ttbebs.mongodb.net/king_llantas?retryWrites=true&w=majority&appName=Cluster0llantas",
  PORT: process.env.PORT || 8080,
  paths: {
    upload: path.join(__dirname, "../..", "uploads"),
    views: path.join(__dirname, "..", "Views"),
    public: path.join(__dirname, "../..", "public"),
  },
};
