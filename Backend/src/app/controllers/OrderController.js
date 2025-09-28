const Order = require('../models/Order');

const OrderController = {
    // Tạo đơn hàng mới
    async createOrder(req, res) {
        try {
            const OrderData = req.body;
            console.log("Received order data:", OrderData);
            
            const newOrder = new Order(OrderData);
            const savedOrder = await newOrder.save();
            res.status(201).json({ message: 'Tạo đơn hàng thành công', data: savedOrder });
        } catch (err) {
            res.status(400).json({ message: 'Tạo đơn hàng thất bại', error: err.message });
        }
    }
}

module.exports = OrderController;