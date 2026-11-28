
const { sql, connectDB } = require("../config/database");

// Get all policies with optional filters
const getAllPolicies = async (filters = {}) => {
    const pool = await connectDB();
    const request = pool.request();

    let query = `
        SELECT
            PolicyID,
            PolicyType,
            Title,
            Content,
            IsActive,
            UpdatedAt
        FROM dbo.Policies
        WHERE 1 = 1
    `;

    if (filters.policyType) {
        query += ` AND PolicyType = @PolicyType`;
        request.input("PolicyType", sql.VarChar(50), filters.policyType);
    }

    if (filters.isActive !== undefined) {
        query += ` AND IsActive = @IsActive`;
        request.input("IsActive", sql.Bit, filters.isActive);
    }

    query += ` ORDER BY PolicyID DESC`;

    const result = await request.query(query);
    return result.recordset;
};

// Get policy by ID
const getPolicyById = async (policyId) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("PolicyID", sql.Int, policyId)
        .query(`
            SELECT
                PolicyID,
                PolicyType,
                Title,
                Content,
                IsActive,
                UpdatedAt
            FROM dbo.Policies
            WHERE PolicyID = @PolicyID
        `);

    return result.recordset[0] || null;
};

// Create policy
const createPolicy = async (policyData) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("PolicyType", sql.VarChar(50), policyData.PolicyType)
        .input("Title", sql.NVarChar(200), policyData.Title)
        .input("Content", sql.NVarChar(sql.MAX), policyData.Content)
        .query(`
            INSERT INTO dbo.Policies (
                PolicyType,
                Title,
                Content
            )
            OUTPUT
                INSERTED.PolicyID,
                INSERTED.PolicyType,
                INSERTED.Title,
                INSERTED.Content,
                INSERTED.IsActive,
                INSERTED.UpdatedAt
            VALUES (
                @PolicyType,
                @Title,
                @Content
            )
        `);

    return result.recordset[0];
};

// Update policy
const updatePolicy = async (policyId, policyData) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("PolicyID", sql.Int, policyId)
        .input("PolicyType", sql.VarChar(50), policyData.PolicyType)
        .input("Title", sql.NVarChar(200), policyData.Title)
        .input("Content", sql.NVarChar(sql.MAX), policyData.Content)
        .input("IsActive", sql.Bit, policyData.IsActive)
        .query(`
            UPDATE dbo.Policies
            SET
                PolicyType = @PolicyType,
                Title = @Title,
                Content = @Content,
                IsActive = @IsActive,
                UpdatedAt = SYSDATETIME()
            OUTPUT
                INSERTED.PolicyID,
                INSERTED.PolicyType,
                INSERTED.Title,
                INSERTED.Content,
                INSERTED.IsActive,
                INSERTED.UpdatedAt
            WHERE PolicyID = @PolicyID
        `);

    return result.recordset[0] || null;
};

// Soft delete policy
const deletePolicy = async (policyId) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("PolicyID", sql.Int, policyId)
        .query(`
            UPDATE dbo.Policies
            SET
                IsActive = 0,
                UpdatedAt = SYSDATETIME()
            OUTPUT
                INSERTED.PolicyID,
                INSERTED.PolicyType,
                INSERTED.Title,
                INSERTED.Content,
                INSERTED.IsActive,
                INSERTED.UpdatedAt
            WHERE PolicyID = @PolicyID
              AND IsActive = 1
        `);

    return result.recordset[0] || null;
};

module.exports = {
    getAllPolicies,
    getPolicyById,
    createPolicy,
    updatePolicy,
    deletePolicy
};
