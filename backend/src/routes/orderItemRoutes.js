
const express = require("express");
const router = express.Router();

const orderItemController = require("../controllers/orderItemController");

// GET /api/order-items
router.get("/", orderItemController.getAllOrderItems);

// GET /api/order-items/order/:orderId
router.get("/order/:orderId", orderItemController.getOrderItemsByOrderId);

// GET /api/order-items/:id
router.get("/:id", orderItemController.getOrderItemById);

// POST /api/order-items
router.post("/", orderItemController.createOrderItem);

// PUT /api/order-items/:id
router.put("/:id", orderItemController.updateOrderItem);

// DELETE /api/order-items/:id
router.delete("/:id", orderItemController.deleteOrderItem);

module.exports = router;
