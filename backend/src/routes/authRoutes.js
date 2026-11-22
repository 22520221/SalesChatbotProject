const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

const {
    verifyToken,
    authorizeAdmin
} = require("../middlewares/authMiddleware");

// Admin login
router.post("/login", authController.login);

// Get current admin information
router.get(
    "/me",
    verifyToken,
    authorizeAdmin,
    authController.getMe
);

module.exports = router;