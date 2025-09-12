const authenRoutes = require('./authenRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');

function route(app) {
    app.use("/api/auth", authenRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/categories", categoryRoutes);
}

module.exports = route;