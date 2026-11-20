
const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customerController");

// GET: Lấy danh sách khách hàng, hỗ trợ tìm kiếm
router.get("/", customerController.getAllCustomers);

// GET: Tìm khách hàng theo MessengerPSID
router.get(
    "/messenger/:psid",
    customerController.getCustomerByMessengerPSID
);

// GET: Lấy chi tiết khách hàng theo ID
router.get("/:id", customerController.getCustomerById);

// POST: Thêm khách hàng
router.post("/", customerController.createCustomer);

// PUT: Cập nhật khách hàng
router.put("/:id", customerController.updateCustomer);

// DELETE: Xóa khách hàng
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;
