
const { sql, connectDB } = require("../config/database");

// 1. Lấy danh sách khách hàng
// Hỗ trợ tìm kiếm theo tên, email và số điện thoại
const getAllCustomers = async (search = null) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("search", sql.NVarChar(150), search)
        .query(`
            SELECT
                CustomerID,
                FullName,
                Email,
                Phone,
                MessengerPSID,
                CreatedAt
            FROM Customers
            WHERE
                @search IS NULL
                OR FullName LIKE N'%' + @search + N'%'
                OR Email LIKE N'%' + @search + N'%'
                OR Phone LIKE N'%' + @search + N'%'
            ORDER BY CustomerID DESC
        `);

    return result.recordset;
};

// 2. Lấy khách hàng theo ID
const getCustomerById = async (id) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            SELECT
                CustomerID,
                FullName,
                Email,
                Phone,
                MessengerPSID,
                CreatedAt
            FROM Customers
            WHERE CustomerID = @id
        `);

    return result.recordset[0] || null;
};

// 3. Tìm khách hàng theo MessengerPSID
const getCustomerByMessengerPSID = async (psid) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("psid", sql.NVarChar(100), psid)
        .query(`
            SELECT
                CustomerID,
                FullName,
                Email,
                Phone,
                MessengerPSID,
                CreatedAt
            FROM Customers
            WHERE MessengerPSID = @psid
        `);

    return result.recordset[0] || null;
};

// 4. Thêm khách hàng
const createCustomer = async (customerData) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("fullName", sql.NVarChar(150), customerData.FullName)
        .input("email", sql.NVarChar(150), customerData.Email ?? null)
        .input("phone", sql.NVarChar(20), customerData.Phone ?? null)
        .input("messengerPSID", sql.NVarChar(100), customerData.MessengerPSID ?? null)
        .query(`
            INSERT INTO Customers (
                FullName,
                Email,
                Phone,
                MessengerPSID
            )
            OUTPUT INSERTED.CustomerID
            VALUES (
                @fullName,
                @email,
                @phone,
                @messengerPSID
            )
        `);

    return await getCustomerById(result.recordset[0].CustomerID);
};

// 5. Cập nhật khách hàng
const updateCustomer = async (id, customerData) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id", sql.Int, id)
        .input("fullName", sql.NVarChar(150), customerData.FullName)
        .input("email", sql.NVarChar(150), customerData.Email ?? null)
        .input("phone", sql.NVarChar(20), customerData.Phone ?? null)
        .input("messengerPSID", sql.NVarChar(100), customerData.MessengerPSID ?? null)
        .query(`
            UPDATE Customers
            SET
                FullName = @fullName,
                Email = @email,
                Phone = @phone,
                MessengerPSID = @messengerPSID
            WHERE CustomerID = @id
        `);

    if (result.rowsAffected[0] === 0) {
        return null;
    }

    return await getCustomerById(id);
};

// 6. Xóa khách hàng
// Không cho phép xóa nếu khách hàng đã có đơn hàng
const deleteCustomer = async (id) => {
    const pool = await connectDB();

    const check = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            SELECT
                CustomerID,
                CASE WHEN EXISTS (
                    SELECT 1
                    FROM Orders
                    WHERE Orders.CustomerID = Customers.CustomerID
                ) THEN 1 ELSE 0 END AS HasOrders
            FROM Customers
            WHERE CustomerID = @id
        `);

    if (check.recordset.length === 0) {
        return { notFound: true };
    }

    if (check.recordset[0].HasOrders) {
        return { hasOrders: true };
    }

    await pool.request()
        .input("id", sql.Int, id)
        .query(`
            DELETE FROM Customers
            WHERE CustomerID = @id
        `);

    return { deleted: true };
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    getCustomerByMessengerPSID,
    createCustomer,
    updateCustomer,
    deleteCustomer
};
