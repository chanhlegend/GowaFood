const express = require('express');
const router = express.Router();
const ProductController = require('../app/controllers/ProductController');

// Lấy danh sách tất cả sản phẩm
router.get('/', ProductController.getAllProducts);

// Tạo sản phẩm mới
router.post('/', ProductController.createProduct);

module.exports = router;
