const exprees = require("express");
const router = exprees.Router();
const orderController = require("../app/controllers/OrderController");

// POST /api/orders
router.post("/createOrder", orderController.createOrder);
router.get("/", orderController.getOrders);

router.get("/:id", orderController.getOrderDetail);

router.delete("/:id", orderController.cancelOrder);

module.exports = router;