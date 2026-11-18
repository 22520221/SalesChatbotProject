
const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");

// GET: Lấy danh sách sản phẩm, hỗ trợ tìm kiếm và lọc
router.get("/", productController.getAllProducts);

// GET: Lấy chi tiết sản phẩm theo ID
router.get("/:id", productController.getProductById);

// POST: Thêm sản phẩm
router.post("/", productController.createProduct);

// PUT: Cập nhật sản phẩm
router.put("/:id", productController.updateProduct);

// DELETE: Xóa mềm sản phẩm
router.delete("/:id", productController.deleteProduct);

module.exports = router;
