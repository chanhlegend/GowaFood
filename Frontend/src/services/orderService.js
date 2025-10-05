import axios from "axios";

const API_URL = "https://gowafood.onrender.com/api/orders";

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
  },

  getOrders: async () => {
    try {
      const u = JSON.parse(localStorage.getItem("user_gowa"));
      const userId = u?.id || u?._id;
      if (!userId) {
        return {
          success: false,
          message:
            "Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại.",
        };
      }

      const response = await axios.get(`${API_URL}?userId=${userId}`);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Lấy danh sách đơn hàng thành công",
      };
    } catch (error) {
      console.error("❌ Lỗi lấy danh sách đơn hàng:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Không thể lấy danh sách đơn hàng",
      };
    }
  },

  getOrderDetail: async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/${orderId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Lấy chi tiết đơn hàng thành công",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Không thể lấy chi tiết đơn hàng",
      };
    }
  },

  cancelOrder: async (orderId) => {
    console.log("Canceling order with ID:", orderId);
    
    try {
      const response = await axios.put(
        `${API_URL}/cancel/${orderId}`
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Hủy đơn hàng thành công",
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.response?.data?.message || "Không thể hủy đơn hàng",
      };
    }
  },

  getOrderByProductAndUser: async (productId, userId) => {
    try {
      const response = await axios.get(`${API_URL}/byProduct/${productId}/${userId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Lấy đơn hàng theo sản phẩm và người dùng thành công",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Không thể lấy đơn hàng theo sản phẩm và người dùng",
      };
    }
  },
};

export default OrderService;
