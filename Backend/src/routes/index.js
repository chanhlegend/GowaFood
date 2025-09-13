const authenRoutes = require("./authenRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");

function route(app) {
  app.use("/api/auth", authenRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/users", userRoutes);
  app.use("/auth", authRoutes); // Đường dẫn cho OAuth
}

module.exports = route;
