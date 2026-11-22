
const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");

// GET /api/payments
router.get("/", paymentController.getAllPayments);

// GET /api/payments/order/:orderId
router.get("/order/:orderId", paymentController.getPaymentsByOrderId);

// GET /api/payments/:id
router.get("/:id", paymentController.getPaymentById);

// POST /api/payments
router.post("/", paymentController.createPayment);

// PUT /api/payments/:id
router.put("/:id", paymentController.updatePayment);

// DELETE /api/payments/:id
router.delete("/:id", paymentController.deletePayment);

module.exports = router;
