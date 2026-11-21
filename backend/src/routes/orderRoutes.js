
const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");

// GET /api/orders
router.get("/", orderController.getAllOrders);

// GET /api/orders/code/:orderCode
router.get("/code/:orderCode", orderController.getOrderByCode);

// GET /api/orders/:id
router.get("/:id", orderController.getOrderById);

// POST /api/orders
router.post("/", orderController.createOrder);

// PUT /api/orders/:id
router.put("/:id", orderController.updateOrder);

// DELETE /api/orders/:id
router.delete("/:id", orderController.deleteOrder);

module.exports = router;
