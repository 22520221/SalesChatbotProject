
const { sql, connectDB } = require("../config/database");

// =====================================
// GET ALL CATEGORIES
// =====================================

const getAllCategories = async () => {
    const pool = await connectDB();

    const result = await pool.request().query(`
        SELECT
            CategoryID,
            CategoryName,
            Description,
            IsActive,
            CreatedAt
        FROM Categories
        ORDER BY CategoryID DESC
    `);

    return result.recordset;
};

// =====================================
// GET CATEGORY BY ID
// =====================================

const getCategoryById = async (id) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            SELECT
                CategoryID,
                CategoryName,
                Description,
                IsActive,
                CreatedAt
            FROM Categories
            WHERE CategoryID = @id
        `);

    return result.recordset[0] || null;
};

// =====================================
// CREATE CATEGORY
// =====================================

const createCategory = async (categoryData) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("name", sql.NVarChar(150), categoryData.CategoryName)
        .input("description", sql.NVarChar(sql.MAX), categoryData.Description || null)
        .query(`
            INSERT INTO Categories (
                CategoryName,
                Description
            )
            OUTPUT
                INSERTED.CategoryID,
                INSERTED.CategoryName,
                INSERTED.Description,
                INSERTED.IsActive,
                INSERTED.CreatedAt
            VALUES (
                @name,
                @description
            )
        `);

    return result.recordset[0];
};

// =====================================
// UPDATE CATEGORY
// =====================================

const updateCategory = async (id, categoryData) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id", sql.Int, id)
        .input("name", sql.NVarChar(150), categoryData.CategoryName)
        .input("description", sql.NVarChar(sql.MAX), categoryData.Description ?? null)
        .input("isActive", sql.Bit, categoryData.IsActive)
        .query(`
            UPDATE Categories
            SET
                CategoryName = @name,
                Description = @description,
                IsActive = @isActive
            OUTPUT
                INSERTED.CategoryID,
                INSERTED.CategoryName,
                INSERTED.Description,
                INSERTED.IsActive,
                INSERTED.CreatedAt
            WHERE CategoryID = @id
        `);

    return result.recordset[0] || null;
};

// =====================================
// DELETE CATEGORY
// =====================================

const deleteCategory = async (id) => {
    const pool = await connectDB();

    const check = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            SELECT
                CategoryID,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM Products
                        WHERE Products.CategoryID = Categories.CategoryID
                    )
                    THEN 1
                    ELSE 0
                END AS HasProducts
            FROM Categories
            WHERE CategoryID = @id
        `);

    if (check.recordset.length === 0) {
        return { notFound: true };
    }

    if (check.recordset[0].HasProducts) {
        return { hasProducts: true };
    }

    await pool.request()
        .input("id", sql.Int, id)
        .query(`
            DELETE FROM Categories
            WHERE CategoryID = @id
        `);

    return { deleted: true };
};

// =====================================
// EXPORT
// =====================================

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
