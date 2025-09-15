const authenRoutes = require("./authenRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const cartRoutes = require("./cartRoutes");
const recipeRoutes = require("./recipeRoutes");

function route(app) {
  app.use("/api/auth", authenRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/users", userRoutes);
  app.use("/auth", authRoutes); // Đường dẫn cho OAuth
  app.use("/api/cart", cartRoutes);
  app.use("/api/recipes", recipeRoutes);
}

module.exports = route;
