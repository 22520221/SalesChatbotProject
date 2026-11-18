
const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health API
app.use("/api/health", healthRoutes);

// Categories API
app.use("/api/categories", categoryRoutes);

// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found!"
    });
});

module.exports = app;
