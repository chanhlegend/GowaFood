const authenRoutes = require("./authenRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const cartRoutes = require("./cartRoutes");
const recipeRoutes = require("./recipeRoutes");
const payosRouter = require('./payos');
const orderRouter = require('./orderRoute');
const reviewRouter = require('./reviewRoutes');
const giftCodeRoutes = require('./giftCodeRoutes');
const addressRouter = require('./addressRoutes');
function route(app) {
  app.use("/api/auth", authenRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/users", userRoutes);
  app.use("/auth", authRoutes); // Đường dẫn cho OAuth
  app.use("/api/cart", cartRoutes);
  app.use("/api/recipes", recipeRoutes);
  app.use('/api/payos', payosRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/reviews', reviewRouter);
  app.use('/api/gift-codes', giftCodeRoutes);
  app.use('/api/address', addressRouter);
}

module.exports = route;
