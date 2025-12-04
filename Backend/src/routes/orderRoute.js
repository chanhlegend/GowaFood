const exprees = require("express");
const router = exprees.Router();
const orderController = require("../app/controllers/OrderController");

// Các routes với path parameters phức tạp phải đặt trước route cơ bản
// GET /api/orders/bestsellers?month=11&year=2025&limit=8
router.get("/bestsellers", orderController.getBestsellersByMonthYear);

// GET /api/orders/getAllOrders
router.get("/getAllOrders", orderController.getAllOrders);

// POST /api/orders
router.post("/createOrder", orderController.createOrder);

// GET /api/orders?userId=123
router.get("/", orderController.getOrders);

// GET /api/orders/byProduct/:productId/:userId
router.get("/byProduct/:productId/:userId", orderController.getOrderByProductAndUser);

// GET /api/orders/:id
router.get("/:id", orderController.getOrderDetail);

// PUT /api/orders/cancel/:id
router.put("/cancel/:id", orderController.cancelOrder);

module.exports = router;