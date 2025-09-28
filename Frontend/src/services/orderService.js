import axios from "axios";

const API_URL = "/api/orders";

const OrderService = {
  createOrder: async (orderData) => {
    console.log("Creating order with data:", orderData);
    try {
        const response = await axios.post(`${API_URL}/createOrder`, orderData);
        return {
            success: true,
            data: response.data.data,
            message: "Đặt hàng thành công",
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || "Đặt hàng thất bại",
        };
    }
    }
};

export default OrderService;