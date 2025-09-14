const express = require('express');
const router = express.Router();
const RecipeAIController = require('../app/controllers/RecipeAIController');

// Lấy công thức nấu ăn
router.post('/', RecipeAIController.getRecipeAI);

// Lấy công thức nấu ăn theo id
router.get('/:id', RecipeAIController.getRecipeAIById);

module.exports = router;
