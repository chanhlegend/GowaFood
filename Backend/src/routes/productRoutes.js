const express = require('express');
const router = express.Router();
const ProductController = require('../app/controllers/ProductController');

// Lấy danh sách tất cả sản phẩm
router.get('/', ProductController.getAllProducts);

// Tạo sản phẩm mới
router.post('/', ProductController.createProduct);

// Lấy sản phẩm theo category
router.get('/category/:categoryId', ProductController.getProductsByCategory);

// Lấy sản phẩm theo ID
router.get('/:id', ProductController.getProductById);

// Lấy sản phẩm mới mua 
router.get('/new-arrivals/recent/:userId', ProductController.getLastedPurchase);

// Lấy sản phẩm đề xuất 
router.get ('/recommendations/:userId', ProductController.getRelatedProduct);
module.exports = router;
