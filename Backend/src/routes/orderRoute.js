const exprees = require("express");
const router = exprees.Router();
const orderController = require("../app/controllers/OrderController");

// POST /api/orders
router.post("/createOrder", orderController.createOrder);
router.get("/", orderController.getOrders);

router.get("/:id", orderController.getOrderDetail);

router.put("/cancel/:id", orderController.cancelOrder);

// lấy order theo product id và user id
router.get("/byProduct/:productId/:userId", orderController.getOrderByProductAndUser);

module.exports = router;