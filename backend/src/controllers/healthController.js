const healthService = require("../services/healthService");

const checkServer = (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Backend Server is running!"
    });
};

const checkDatabase = async (req, res) => {
    try {
        const data = await healthService.checkDatabase();

        return res.status(200).json({
            success: true,
            message: "Database connected successfully!",
            data
        });

    } catch (error) {
        return res.status(503).json({
            success: false,
            message: "Database connection failed!",
            error: error.message
        });
    }
};

module.exports = {
    checkServer,
    checkDatabase
};