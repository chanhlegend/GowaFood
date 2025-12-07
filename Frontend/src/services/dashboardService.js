import axios from "axios";
import API_BASE_URL from "@/config/api";

const API_URL = `${API_BASE_URL}/api`;

const DashboardService = {
  // Lấy doanh thu theo tháng trong một năm
  getRevenueByMonth: async (year) => {
    try {
      const response = await axios.get(`${API_URL}/orders/getAllOrders`);
      const allOrders = response.data.data || [];

      // Lọc đơn hàng theo năm
      const ordersInYear = allOrders.filter((order) => {
        const orderYear = new Date(order.createdAt).getFullYear();
        return orderYear === Number(year);
      });

      // Tính doanh thu theo tháng
      const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const revenueForMonth = ordersInYear
          .filter((order) => {
            const orderMonth = new Date(order.createdAt).getMonth() + 1;
            return orderMonth === month;
          })
          .reduce((sum, order) => sum + (order.amounts?.total || 0), 0);
        return revenueForMonth;
      });

      return {
        success: true,
        data: monthlyRevenue,
      };
    } catch (error) {
      console.error("❌ Lỗi lấy doanh thu theo tháng:", error);
      return {
        success: false,
        data: Array(12).fill(0),
      };
    }
  },

  // Lấy số sản phẩm bán ra theo tháng
  getProductsSoldByMonth: async (year) => {
    try {
      const response = await axios.get(`${API_URL}/orders/getAllOrders`);
      const allOrders = response.data.data || [];

      // Lọc đơn hàng theo năm
      const ordersInYear = allOrders.filter((order) => {
        const orderYear = new Date(order.createdAt).getFullYear();
        return orderYear === Number(year);
      });

      // Tính số sản phẩm bán ra theo tháng
      const monthlySold = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const quantityForMonth = ordersInYear
          .filter((order) => {
            const orderMonth = new Date(order.createdAt).getMonth() + 1;
            return orderMonth === month;
          })
          .reduce((sum, order) => {
            const orderQuantity = order.products?.reduce(
              (pSum, p) => pSum + (p.quantity || 0),
              0
            ) || 0;
            return sum + orderQuantity;
          }, 0);
        return quantityForMonth;
      });

      return {
        success: true,
        data: monthlySold,
      };
    } catch (error) {
      console.error("❌ Lỗi lấy số sản phẩm bán ra:", error);
      return {
        success: false,
        data: Array(12).fill(0),
      };
    }
  },

  // Lấy số sản phẩm bán ra theo năm (từ 2022 đến năm hiện tại)
  getProductsSoldByYear: async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/getAllOrders`);
      const allOrders = response.data.data || [];

      const now = new Date();
      const currentYear = now.getFullYear();
      const startYear = 2022;
      const years = [];
      const quantities = [];

      // Tính dữ liệu cho mỗi năm từ 2022 đến năm hiện tại
      for (let year = startYear; year <= currentYear; year++) {
        years.push(String(year));
        const quantityForYear = allOrders
          .filter((order) => {
            const orderYear = new Date(order.createdAt).getFullYear();
            return orderYear === year;
          })
          .reduce((sum, order) => {
            const orderQuantity = order.products?.reduce(
              (pSum, p) => pSum + (p.quantity || 0),
              0
            ) || 0;
            return sum + orderQuantity;
          }, 0);
        quantities.push(quantityForYear);
      }

      return {
        success: true,
        data: quantities,
        years: years,
      };
    } catch (error) {
      console.error("❌ Lỗi lấy số sản phẩm bán ra theo năm:", error);
      return {
        success: false,
        data: [],
        years: [],
      };
    }
  },

  // Lấy số sản phẩm bán ra theo quý
  getProductsSoldByQuarter: async (year) => {
    try {
      const response = await axios.get(`${API_URL}/orders/getAllOrders`);
      const allOrders = response.data.data || [];

      // Lọc đơn hàng theo năm
      const ordersInYear = allOrders.filter((order) => {
        const orderYear = new Date(order.createdAt).getFullYear();
        return orderYear === Number(year);
      });

      // Tính số sản phẩm bán ra theo quý
      const quarterlySold = Array.from({ length: 4 }, (_, i) => {
        const quarter = i + 1;
        const startMonth = (quarter - 1) * 3 + 1;
        const endMonth = quarter * 3;

        const quantityForQuarter = ordersInYear
          .filter((order) => {
            const orderMonth = new Date(order.createdAt).getMonth() + 1;
            return orderMonth >= startMonth && orderMonth <= endMonth;
          })
          .reduce((sum, order) => {
            const orderQuantity = order.products?.reduce(
              (pSum, p) => pSum + (p.quantity || 0),
              0
            ) || 0;
            return sum + orderQuantity;
          }, 0);
        return quantityForQuarter;
      });

      return {
        success: true,
        data: quarterlySold,
      };
    } catch (error) {
      console.error("❌ Lỗi lấy số sản phẩm bán ra theo quý:", error);
      return {
        success: false,
        data: [0, 0, 0, 0],
      };
    }
  },

  // Lấy số người dùng theo tháng
  getUsersByMonth: async (year) => {
    try {
      const response = await axios.get(`${API_URL}/users/getAllUsers`);
      const allUsers = response.data.data || [];

      // Tính số người dùng theo tháng dựa trên createdAt
      const monthlyUsers = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const usersInMonth = allUsers.filter((user) => {
          const userYear = new Date(user.createdAt).getFullYear();
          const userMonth = new Date(user.createdAt).getMonth() + 1;
          return userYear === Number(year) && userMonth === month;
        });
        return usersInMonth.length;
      });

      return {
        success: true,
        data: monthlyUsers,
      };
    } catch (error) {
      console.error("❌ Lỗi lấy số người dùng:", error);
      return {
        success: false,
        data: Array(12).fill(0),
      };
    }
  },

  // Lấy tổng số người dùng cộng dồn theo tháng (cho biểu đồ trend)
  getUsersCumulativeByMonth: async (year) => {
    try {
      const response = await axios.get(`${API_URL}/users/getAllUsers`);
      const allUsers = response.data.data || [];

      // Sắp xếp người dùng theo ngày tạo
      const sortedUsers = allUsers.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      // Tính số người dùng cộng dồn theo tháng
      const cumulativeUsers = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const endOfMonth = new Date(Number(year), month, 0);

        const totalUsersUpToMonth = sortedUsers.filter((user) => {
          return new Date(user.createdAt) <= endOfMonth;
        }).length;

        return totalUsersUpToMonth;
      });

      return {
        success: true,
        data: cumulativeUsers,
      };
    } catch (error) {
      console.error("❌ Lỗi lấy số người dùng cộng dồn:", error);
      return {
        success: false,
        data: Array(12).fill(0),
      };
    }
  },

  // Lấy tổng số người dùng
  getTotalUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}/users/getAllUsers`);
      const allUsers = response.data.data || [];
      return {
        success: true,
        count: allUsers.length,
      };
    } catch (error) {
      console.error("❌ Lỗi lấy tổng số người dùng:", error);
      return {
        success: false,
        count: 0,
      };
    }
  },

  // Lấy sản phẩm bán chạy theo tháng/năm
  getBestsellersByMonthYear: async (month, year) => {
    try {
      const response = await axios.get(`${API_URL}/orders/bestsellers`, {
        params: { month, year, limit: 8 },
      });

      if (response.data.data && Array.isArray(response.data.data)) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        data: [],
      };
    } catch (error) {
      console.error("❌ Lỗi lấy sản phẩm bán chạy:", error);
      return {
        success: false,
        data: [],
      };
    }
  },

  // Lấy tổng doanh thu của tháng hiện tại
  getCurrentMonthRevenue: async () => {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const response = await axios.get(`${API_URL}/orders/getAllOrders`);
      const allOrders = response.data.data || [];

      const monthRevenue = allOrders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getFullYear() === currentYear &&
            orderDate.getMonth() + 1 === currentMonth
          );
        })
        .reduce((sum, order) => sum + (order.amounts?.total || 0), 0);

      return {
        success: true,
        revenue: monthRevenue,
      };
    } catch (error) {
      console.error("❌ Lỗi lấy doanh thu tháng hiện tại:", error);
      return {
        success: false,
        revenue: 0,
      };
    }
  },

  // Lấy tổng sản phẩm bán ra của tháng hiện tại
  getCurrentMonthProductsSold: async () => {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const response = await axios.get(`${API_URL}/orders/getAllOrders`);
      const allOrders = response.data.data || [];

      const totalSold = allOrders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getFullYear() === currentYear &&
            orderDate.getMonth() + 1 === currentMonth
          );
        })
        .reduce((sum, order) => {
          const orderQuantity = order.products?.reduce(
            (pSum, p) => pSum + (p.quantity || 0),
            0
          ) || 0;
          return sum + orderQuantity;
        }, 0);

      return {
        success: true,
        quantity: totalSold,
      };
    } catch (error) {
      console.error("❌ Lỗi lấy sản phẩm bán tháng hiện tại:", error);
      return {
        success: false,
        quantity: 0,
      };
    }
  },

  // Lấy tất cả đơn hàng
  getAllOrders: async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/getAllOrders`);
      if (response.data.data && Array.isArray(response.data.data)) {
        return {
          success: true,
          data: response.data.data,
        };
      }
      return {
        success: false,
        data: [],
      };
    } catch (error) {
      console.error("❌ Lỗi lấy tất cả đơn hàng:", error);
      return {
        success: false,
        data: [],
      };
    }
  },
};

export default DashboardService;
