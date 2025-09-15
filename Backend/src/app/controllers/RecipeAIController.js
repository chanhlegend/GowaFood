const axios = require("axios");
const TranslationService = require("../../services/translationService");

const API_KEY = process.env.SPOONACULAR_API_KEY;

module.exports = {
    // Lấy danh sách tất cả danh mục
    getRecipeAI: async (req, res) => {
        try {
            const { ingredients } = req.body;
            
            // Dịch nguyên liệu từ tiếng Việt sang tiếng Anh
            const translatedIngredients = await TranslationService.translateToEnglish(ingredients);
            console.log(`Original ingredients: ${ingredients}`);
            console.log(`Translated ingredients: ${translatedIngredients}`);
        
            // Gọi API Spoonacular với nguyên liệu đã dịch
            const response = await axios.get(
              `https://api.spoonacular.com/recipes/findByIngredients`, 
              {
                params: {
                  ingredients: translatedIngredients,
                  number: 4, // số công thức muốn lấy
                  apiKey: API_KEY,
                },
              }
            );
        
            // Dịch kết quả từ tiếng Anh sang tiếng Việt
            const translatedRecipes = await TranslationService.translateRecipes(response.data);
            
            res.json(translatedRecipes);
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: "API request failed" });
          }
    },
    getRecipeAIById: async (req, res) => {
        try {
            const { id } = req.params;
            const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
                params: {
                    apiKey: API_KEY,
                },
            });
            
            // Dịch chi tiết công thức từ tiếng Anh sang tiếng Việt
            const translatedRecipeDetail = await TranslationService.translateRecipeDetail(response.data);
            
            res.json(translatedRecipeDetail);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "API request failed" });
        }
    }
};
