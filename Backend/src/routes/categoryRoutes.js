const express = require('express');
const router = express.Router();
const CategoryController = require('../app/controllers/CategoryController');

// Lấy danh sách tất cả danh mục
router.get('/', CategoryController.getAllCategories);

module.exports = router;
