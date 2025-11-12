import axios from "axios";
import API_BASE_URL from "@/config/api";

const API_URL = `${API_BASE_URL}/api/products`;

export const ProductService = {
  // Lấy danh sách tất cả sản phẩm
  getAllProducts: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Network Error");
    }
  },

  createProduct: async (productData) => {
    try {
      // Kiểm tra và xử lý các trường description
      const updatedDescription = {
        ...productData.description,
        fertilizer: Array.isArray(productData.description.fertilizer)
          ? productData.description.fertilizer
          : productData.description.fertilizer
          ? [productData.description.fertilizer]
          : [],
        pesticide: Array.isArray(productData.description.pesticide)
          ? productData.description.pesticide
          : productData.description.pesticide
          ? [productData.description.pesticide]
          : [],
        numberOfHarvestDays: productData.description.numberOfHarvestDays ? Number(productData.description.numberOfHarvestDays) : undefined,
      };

      // Tạo product data với description đã được xử lý
      const finalProductData = {
        ...productData,
        description: updatedDescription,
        price: Number(productData.price),
        stock: Number(productData.stock),
      };

      const response = await axios.post(API_URL, finalProductData);
      return response.data;
    } catch (error) {
      // Kiểm tra lỗi từ response và ném lại thông báo phù hợp
      throw error.response ? error.response.data : new Error("Network Error");
    }
  },

  // Lấy sản phẩm theo category
  getProductsByCategory: async (categoryId) => {
    try {
      const response = await axios.get(`${API_URL}/category/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Network Error");
    }
  },

  // Lấy sản phẩm theo ID
  getProductById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Network Error");
    }
  },

  getRecentProducts: async (userId) => {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const response = await axios.get(
        `${API_URL}/new-arrivals/recent/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error in getRecentProducts:", error);
      if (error.response) {
        console.error("Response error:", error.response);
        throw error.response.data;
      } else if (error.request) {
        console.error("Request error:", error.request);
        throw new Error("No response received from the server.");
      } else {
        console.error("General error:", error.message);
        throw new Error("Network Error");
      }
    }
  },
  getRecommendedProducts: async (userId) => {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const response = await axios.get(`${API_URL}/recommendations/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error in getRecommendedProducts:", error);
      if (error.response) {
        console.error("Response error:", error.response);
        throw error.response.data;
      } else if (error.request) {
        console.error("Request error:", error.request);
        throw new Error("No response received from the server.");
      } else {
        console.error("General error:", error.message);
        throw new Error("Network Error");
      }
    }
  },
};
