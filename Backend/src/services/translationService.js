const translate = require('translate-google');

class TranslationService {
    // Dịch từ tiếng Việt sang tiếng Anh
    static async translateToEnglish(text) {
        try {
            if (!text || typeof text !== 'string') {
                return text;
            }
            
            const result = await translate(text, { from: 'vi', to: 'en' });
            return result;
        } catch (error) {
            console.error('Translation to English error:', error);
            return text; // Trả về text gốc nếu dịch lỗi
        }
    }

    // Dịch từ tiếng Anh sang tiếng Việt
    static async translateToVietnamese(text) {
        try {
            if (!text || typeof text !== 'string') {
                return text;
            }
            
            const result = await translate(text, { from: 'en', to: 'vi' });
            return result;
        } catch (error) {
            console.error('Translation to Vietnamese error:', error);
            return text; // Trả về text gốc nếu dịch lỗi
        }
    }

    // Dịch object recipe từ tiếng Anh sang tiếng Việt
    static async translateRecipe(recipe) {
        try {
            const translatedRecipe = { ...recipe };
            
            // Dịch title
            if (recipe.title) {
                translatedRecipe.title = await this.translateToVietnamese(recipe.title);
            }

            return translatedRecipe;
        } catch (error) {
            console.error('Recipe translation error:', error);
            return recipe;
        }
    }

    // Dịch array recipes từ tiếng Anh sang tiếng Việt
    static async translateRecipes(recipes) {
        try {
            if (!Array.isArray(recipes)) {
                return recipes;
            }

            const translatedRecipes = [];
            for (const recipe of recipes) {
                const translatedRecipe = await this.translateRecipe(recipe);
                translatedRecipes.push(translatedRecipe);
            }

            return translatedRecipes;
        } catch (error) {
            console.error('Recipes translation error:', error);
            return recipes;
        }
    }

    // Dịch chi tiết công thức từ tiếng Anh sang tiếng Việt
    static async translateRecipeDetail(recipeDetail) {
        try {
            const translatedDetail = { ...recipeDetail };
            
            // Dịch title
            if (recipeDetail.title) {
                translatedDetail.title = await this.translateToVietnamese(recipeDetail.title);
            }

            // Dịch summary
            if (recipeDetail.summary) {
                // Loại bỏ HTML tags trước khi dịch
                const cleanSummary = recipeDetail.summary.replace(/<[^>]*>/g, '');
                const translatedSummary = await this.translateToVietnamese(cleanSummary);
                translatedDetail.summary = translatedSummary;
            }

            // Dịch instructions
            if (recipeDetail.analyzedInstructions && Array.isArray(recipeDetail.analyzedInstructions)) {
                for (const instruction of recipeDetail.analyzedInstructions) {
                    if (instruction.steps && Array.isArray(instruction.steps)) {
                        for (const step of instruction.steps) {
                            if (step.step) {
                                step.step = await this.translateToVietnamese(step.step);
                            }
                        }
                    }
                }
            }

            // Dịch ingredients
            if (recipeDetail.extendedIngredients && Array.isArray(recipeDetail.extendedIngredients)) {
                for (const ingredient of recipeDetail.extendedIngredients) {
                    if (ingredient.name) {
                        ingredient.name = await this.translateToVietnamese(ingredient.name);
                    }
                }
            }

            return translatedDetail;
        } catch (error) {
            console.error('Recipe detail translation error:', error);
            return recipeDetail;
        }
    }
}

module.exports = TranslationService;
