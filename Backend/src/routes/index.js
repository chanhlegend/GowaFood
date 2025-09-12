const authenRoutes = require("./authenRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");
const authRoutes = require("./authRoutes");

function route(app) {
  app.use("/api/auth", authenRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/auth", authRoutes); // Đường dẫn cho OAuth
}

module.exports = route;
