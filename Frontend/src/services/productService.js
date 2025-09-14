import axios from "axios";

const API_URL = "/api/products";

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

    // Tạo sản phẩm mới
    createProduct: async (productData) => {
        try {
            const response = await axios.post(API_URL, productData);
            return response.data;
        } catch (error) {
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
    }
};
