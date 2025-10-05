import axios from "axios";

const API_URL = "https://gowafood.onrender.com/api/categories";

export const CategoryService = {
    // Lấy danh sách tất cả danh mục
    getAllCategories: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Network Error");
        }
    },
};
