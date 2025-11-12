const Product = require("../models/Product");
const Order = require("../models/Order");
class ProductController {
  // Lấy danh sách tất cả sản phẩm
  async getAllProducts(req, res) {
    try {
      const products = await Product.find()
        .populate("category")
      res.status(200).json(products);
    } catch (err) {
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  }

  async createProduct(req, res) {
    try {
      const { name, description, price, category, images, stock } =
        req.body;

      const updatedDescription = {
        ...description,
        fertilizer: Array.isArray(description.fertilizer)
          ? description.fertilizer
          : [description.fertilizer],
        pesticide: Array.isArray(description.pesticide)
          ? description.pesticide
          : [description.pesticide], 
      };

      const newProduct = new Product({
        name,
        description: updatedDescription,
        price,
        category,
        images,
        stock,
      });

      const savedProduct = await newProduct.save();

      res.status(201).json(savedProduct);
    } catch (err) {
      res
        .status(400)
        .json({ message: "Tạo sản phẩm thất bại", error: err.message });
    }
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id).populate("category");

      if (!product) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      res.status(200).json(product);
    } catch (err) {
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  }

  // lấy product theo category
  async getProductsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const products = await Product.find({ category: categoryId })
        .populate("category")
      res.status(200).json(products);
    } catch (err) {
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  }

  async getRelatedProduct(req, res) {
    try {
      const { userId } = req.params;
      const orders = await Order.find({ user: userId }).populate(
        "products.product"
      );

      if (orders.length === 0) {
        return res.status(404).json(" Bạn chưa có đơn hàng nào");
      }
      const purchasedProducts = [];
      const categories = [];

      orders.forEach((order) => {
        order.products.forEach((item) => {
          purchasedProducts.push(item.product);
          if (item.product.category) {
            categories.push(item.product.category);
          }
        });
      });

      const relatedProducts = await Product.find({
        category: { $in: categories },
        _id: { $nin: purchasedProducts.map((product) => product._id) },
      }).limit(10);

      res.json(relatedProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getLastedPurchase(req, res) {
    try {
      const { userId } = req.params;
      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10);

      if (orders.length === 0) {
        return res
          .status(404)
          .json({ message: "No orders found for this user" });
      }

      const purchasedProducts = [];
      orders.forEach((order) => {
        order.products.forEach((item) => {
          purchasedProducts.push(item.product);
        });
      });

      const uniquePurchasedProducts = [...new Set(purchasedProducts)];

      const products = await Product.find({
        _id: { $in: uniquePurchasedProducts },
      });

      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new ProductController();
