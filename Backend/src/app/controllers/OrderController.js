const Order = require('../models/Order');

const OrderController = {
    async createOrder(req, res) {
        try {
            const OrderData = req.body;
            const newOrder = new Order(OrderData);
            const savedOrder = await newOrder.save();
            res.status(201).json({ message: 'Tạo đơn hàng thành công', data: savedOrder });
        } catch (err) {
            res.status(400).json({ message: 'Tạo đơn hàng thất bại', error: err.message });
        }
    },
    async getOrders(req, res) {
        try {
            const userId = req.query.userId; 
            if (!userId) {
                return res.status(400).json({ message: 'Thiếu userId' });
            }

            const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
            res.status(200).json({ message: 'Danh sách đơn hàng', data: orders });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng', error: err.message });
        }
    },

    async getOrderDetail(req, res) {
        try {
            const { id } = req.params;
            const order = await Order.findById(id).populate('products.product');

            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            }

            res.status(200).json({ message: 'Chi tiết đơn hàng', data: order });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi khi lấy chi tiết đơn hàng', error: err.message });
        }
    },
    async cancelOrder(req, res) {
        try {
            const { id } = req.params;
            const userId = req.body.userId || req.query.userId; // userId gửi kèm từ client

            const order = await Order.findOne({ _id: id, user: userId });
            if (!order) {
                return res.status(404).json({ message: 'Đơn hàng không tồn tại hoặc không thuộc người dùng này.' });
            }

            if (order.status !== 'PENDING') {
                return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng có trạng thái PENDING.' });
            }

            order.status = 'CANCELED';
            await order.save();

            res.status(200).json({ message: 'Hủy đơn hàng thành công', data: order });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi khi hủy đơn hàng', error: err.message });
        }
    },
};


module.exports = OrderController;