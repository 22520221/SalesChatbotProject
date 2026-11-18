
const sql = require("mssql");
require("dotenv").config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    server: process.env.DB_SERVER || "localhost",

    database: process.env.DB_NAME,

    options: {
        instanceName: process.env.DB_INSTANCE || "SQLEXPRESS",
        encrypt: process.env.DB_ENCRYPT === "true",
        trustServerCertificate:
            process.env.DB_TRUST_SERVER_CERTIFICATE === "true"
    },

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },

    connectionTimeout: 15000,
    requestTimeout: 15000
};

let poolPromise;

const connectDB = async () => {
    try {
        if (!poolPromise) {
            poolPromise = sql.connect(config).catch((error) => {
                poolPromise = null;
                throw error;
            });
        }

        const pool = await poolPromise;

        return pool;

    } catch (error) {
        console.error("Database connection failed:", error.message);
        throw error;
    }
};

module.exports = {
    sql,
    connectDB
};
