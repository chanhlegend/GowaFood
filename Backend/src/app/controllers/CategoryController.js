
const Category = require('../models/Category');

module.exports = {
    // Lấy danh sách tất cả danh mục
    getAllCategories: async (req, res) => {
        try {
            const categories = await Category.find();
            res.status(200).json(categories);
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }
};
