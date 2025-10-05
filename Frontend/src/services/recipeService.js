import axios from "axios";

const API_URL = "https://gowafood.onrender.com/api/recipes";

export const RecipeService = {
    // Lấy công thức từ AI dựa trên nguyên liệu
    getRecipeAI: async (ingredients) => {
        try {
            const response = await axios.post(`${API_URL}`, {
                ingredients: ingredients
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching recipes:', error);
            throw error;
        }
    },
    // Lấy công thức nấu ăn theo id
    getRecipeAIById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching recipe:', error);
            throw error;
        }
    }
};
