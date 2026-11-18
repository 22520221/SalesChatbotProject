const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/health", healthRoutes);

// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found!"
    });
});

module.exports = app;