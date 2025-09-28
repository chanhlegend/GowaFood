const exprees = require("express");
const router = exprees.Router();
const orderController = require("../app/controllers/OrderController");

// POST /api/orders
router.post("/createOrder", orderController.createOrder);

module.exports = router;