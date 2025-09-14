const Product = require('../models/Product');

class ProductController {
	// Lấy danh sách tất cả sản phẩm
	async getAllProducts(req, res) {
		try {
			const products = await Product.find().populate('category').populate('qrSource');
			res.status(200).json(products);
		} catch (err) {
			res.status(500).json({ message: 'Lỗi server', error: err.message });
		}
	}

	// Tạo sản phẩm mới
	async createProduct(req, res) {
		try {
			const { name, description, price, category, images, stock, qrSource } = req.body;
			const newProduct = new Product({
				name,
				description,
				price,
				category,
				images,
				stock,
				qrSource
			});
			const savedProduct = await newProduct.save();
			res.status(201).json(savedProduct);
		} catch (err) {
			res.status(400).json({ message: 'Tạo sản phẩm thất bại', error: err.message });
		}
	}

	// lấy product theo category
	async getProductsByCategory(req, res) {
		try {
			const { categoryId } = req.params;
			const products = await Product.find({ category: categoryId }).populate('category').populate('qrSource');
			res.status(200).json(products);
		} catch (err) {
			res.status(500).json({ message: 'Lỗi server', error: err.message });
		}
	}
}

module.exports = new ProductController();