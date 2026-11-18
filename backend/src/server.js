require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/database");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Start Backend
        app.listen(PORT, () => {
            console.log("--------------------------------");
            console.log("SALES CHATBOT BACKEND");
            console.log("--------------------------------");
            console.log(`Server running at http://localhost:${PORT}`);
            console.log(`Health: http://localhost:${PORT}/api/health`);
            console.log(`Database: http://localhost:${PORT}/api/health/db`);
        });

        // Connect Database
        try {
            await connectDB();
            console.log("SQL Server connected successfully!");
            console.log("Database: SalesChatbotDB");
        } catch (error) {
            console.error("SQL Server connection error!");
            console.error(error.message);
        }

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();