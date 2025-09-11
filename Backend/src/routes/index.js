const authenRoutes = require('./authenRoutes');

function route(app) {
    app.use("/api/auth", authenRoutes);
}

module.exports = route;