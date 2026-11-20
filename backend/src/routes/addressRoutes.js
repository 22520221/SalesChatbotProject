
const express = require("express");
const router = express.Router();

const addressController = require("../controllers/addressController");

// GET /api/addresses
router.get("/", addressController.getAllAddresses);

// GET /api/addresses/customer/:customerId
router.get("/customer/:customerId", addressController.getAddressesByCustomerId);

// GET /api/addresses/:id
router.get("/:id", addressController.getAddressById);

// POST /api/addresses
router.post("/", addressController.createAddress);

// PUT /api/addresses/:id
router.put("/:id", addressController.updateAddress);

// DELETE /api/addresses/:id
router.delete("/:id", addressController.deleteAddress);

module.exports = router;
