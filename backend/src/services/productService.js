
const { sql, connectDB } = require("../config/database");

// 1. Lấy danh sách sản phẩm
// Hỗ trợ tìm kiếm theo tên, lọc danh mục và trạng thái
const getAllProducts = async (filters = {}) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("search", sql.NVarChar(200), filters.search || null)
        .input("categoryId", sql.Int, filters.categoryId ?? null)
        .input("isActive", sql.Bit, filters.isActive ?? null)
        .query(`
            SELECT
                p.ProductID,
                p.CategoryID,
                c.CategoryName,
                p.ProductName,
                p.Description,
                p.Price,
                p.StockQuantity,
                p.ImageURL,
                p.IsActive,
                p.CreatedAt,
                p.UpdatedAt
            FROM Products p
            LEFT JOIN Categories c
                ON p.CategoryID = c.CategoryID
            WHERE
                (@search IS NULL
                    OR p.ProductName LIKE N'%' + @search + N'%')
                AND (@categoryId IS NULL
                    OR p.CategoryID = @categoryId)
                AND (@isActive IS NULL
                    OR p.IsActive = @isActive)
            ORDER BY p.ProductID DESC
        `);

    return result.recordset;
};

// 2. Lấy sản phẩm theo ID
const getProductById = async (id) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            SELECT
                p.ProductID,
                p.CategoryID,
                c.CategoryName,
                p.ProductName,
                p.Description,
                p.Price,
                p.StockQuantity,
                p.ImageURL,
                p.IsActive,
                p.CreatedAt,
                p.UpdatedAt
            FROM Products p
            LEFT JOIN Categories c
                ON p.CategoryID = c.CategoryID
            WHERE p.ProductID = @id
        `);

    return result.recordset[0] || null;
};

// 3. Thêm sản phẩm
const createProduct = async (productData) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("categoryId", sql.Int, productData.CategoryID)
        .input("name", sql.NVarChar(200), productData.ProductName)
        .input("description", sql.NVarChar(sql.MAX), productData.Description ?? null)
        .input("price", sql.Decimal(18, 2), productData.Price)
        .input("stock", sql.Int, productData.StockQuantity)
        .input("image", sql.NVarChar(500), productData.ImageURL ?? null)
        .query(`
            INSERT INTO Products (
                CategoryID,
                ProductName,
                Description,
                Price,
                StockQuantity,
                ImageURL
            )
            OUTPUT INSERTED.ProductID
            VALUES (
                @categoryId,
                @name,
                @description,
                @price,
                @stock,
                @image
            )
        `);

    return await getProductById(result.recordset[0].ProductID);
};

// 4. Cập nhật sản phẩm
const updateProduct = async (id, productData) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id", sql.Int, id)
        .input("categoryId", sql.Int, productData.CategoryID)
        .input("name", sql.NVarChar(200), productData.ProductName)
        .input("description", sql.NVarChar(sql.MAX), productData.Description ?? null)
        .input("price", sql.Decimal(18, 2), productData.Price)
        .input("stock", sql.Int, productData.StockQuantity)
        .input("image", sql.NVarChar(500), productData.ImageURL ?? null)
        .input("isActive", sql.Bit, productData.IsActive)
        .query(`
            UPDATE Products
            SET
                CategoryID = @categoryId,
                ProductName = @name,
                Description = @description,
                Price = @price,
                StockQuantity = @stock,
                ImageURL = @image,
                IsActive = @isActive,
                UpdatedAt = SYSDATETIME()
            WHERE ProductID = @id
        `);

    if (result.rowsAffected[0] === 0) {
        return null;
    }

    return await getProductById(id);
};

// 5. Xóa mềm sản phẩm
const deleteProduct = async (id) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            UPDATE Products
            SET
                IsActive = 0,
                UpdatedAt = SYSDATETIME()
            WHERE ProductID = @id
        `);

    return result.rowsAffected[0] > 0;
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
