
const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/health", healthRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found!"
    });
});

module.exports = app;

