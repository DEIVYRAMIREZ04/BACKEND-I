const path = require("path");
require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 8080,
  paths: {
    upload: path.join(__dirname, "../..", "uploads"),
    views: path.join(__dirname, "..", "Views"),
    public: path.join(__dirname, "../..", "public"),
  },
};
