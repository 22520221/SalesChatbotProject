const { connectDB } = require("../config/database");

const checkDatabase = async () => {
    const pool = await connectDB();

    const result = await pool.request().query(`
        SELECT
            DB_NAME() AS databaseName,
            @@SERVERNAME AS serverName,
            GETDATE() AS currentTime
    `);

    return result.recordset[0];
};

module.exports = {
    checkDatabase
};