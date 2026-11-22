
const { sql, connectDB } = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (email, password) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("Email", sql.NVarChar(150), email)
        .query(`
            SELECT
                AdminID,
                FullName,
                Email,
                PasswordHash,
                Role,
                IsActive
            FROM dbo.AdminUsers
            WHERE Email = @Email
        `);

    if (result.recordset.length === 0) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const admin = result.recordset[0];

    if (!admin.IsActive) {
        throw new Error("ACCOUNT_DISABLED");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        admin.PasswordHash
    );

    if (!isPasswordValid) {
        throw new Error("INVALID_CREDENTIALS");
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET_MISSING");
    }

    const token = jwt.sign(
        {
            adminId: admin.AdminID,
            role: admin.Role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1h"
        }
    );

    return {
        admin: {
            AdminID: admin.AdminID,
            FullName: admin.FullName,
            Email: admin.Email,
            Role: admin.Role
        },
        token
    };
};

const getAdminById = async (adminId) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("AdminID", sql.Int, adminId)
        .query(`
            SELECT
                AdminID,
                FullName,
                Email,
                Role,
                IsActive,
                CreatedAt
            FROM dbo.AdminUsers
            WHERE AdminID = @AdminID
        `);

    return result.recordset[0] || null;
};

module.exports = {
    login,
    getAdminById
};
