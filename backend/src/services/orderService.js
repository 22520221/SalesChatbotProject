const { sql, connectDB } = require("../config/database");

// Lấy danh sách đơn hàng
const getAllOrders = async (filters = {}) => {
    const pool = await connectDB();

    let query = `
        SELECT
            o.*,
            c.FullName AS CustomerName,
            c.Email AS CustomerEmail
        FROM dbo.Orders o
        INNER JOIN dbo.Customers c
            ON o.CustomerID = c.CustomerID
        WHERE 1 = 1
    `;

    const request = pool.request();

    if (filters.customerId) {
        query += " AND o.CustomerID = @CustomerID";
        request.input("CustomerID", sql.Int, filters.customerId);
    }

    if (filters.orderStatus) {
        query += " AND o.OrderStatus = @OrderStatus";
        request.input("OrderStatus", sql.VarChar(30), filters.orderStatus);
    }

    if (filters.paymentStatus) {
        query += " AND o.PaymentStatus = @PaymentStatus";
        request.input("PaymentStatus", sql.VarChar(30), filters.paymentStatus);
    }

    if (filters.orderSource) {
        query += " AND o.OrderSource = @OrderSource";
        request.input("OrderSource", sql.VarChar(20), filters.orderSource);
    }

    if (filters.search) {
        query += `
            AND (
                o.OrderCode LIKE @Search
                OR o.RecipientName LIKE @Search
                OR o.RecipientPhone LIKE @Search
            )
        `;
        request.input("Search", sql.NVarChar(200), `%${filters.search}%`);
    }

    query += " ORDER BY o.OrderDate DESC, o.OrderID DESC";

    const result = await request.query(query);
    return result.recordset;
};

// Lấy đơn hàng theo ID
const getOrderById = async (id) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("OrderID", sql.Int, id)
        .query(`
            SELECT
                o.*,
                c.FullName AS CustomerName,
                c.Email AS CustomerEmail
            FROM dbo.Orders o
            INNER JOIN dbo.Customers c
                ON o.CustomerID = c.CustomerID
            WHERE o.OrderID = @OrderID
        `);

    return result.recordset[0] || null;
};

// Lấy đơn hàng theo mã
const getOrderByCode = async (orderCode) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("OrderCode", sql.VarChar(30), orderCode)
        .query(`
            SELECT *
            FROM dbo.Orders
            WHERE OrderCode = @OrderCode
        `);

    return result.recordset[0] || null;
};

// Tạo đơn hàng
const createOrder = async (orderData) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("OrderCode", sql.VarChar(30), orderData.OrderCode)
        .input("CustomerID", sql.Int, orderData.CustomerID)
        .input("AddressID", sql.Int, orderData.AddressID)
        .input("RecipientName", sql.NVarChar(150), orderData.RecipientName)
        .input("RecipientPhone", sql.NVarChar(20), orderData.RecipientPhone)
        .input("ShippingAddress", sql.NVarChar(700), orderData.ShippingAddress)
        .input("TotalAmount", sql.Decimal(18, 2), orderData.TotalAmount)
        .input("OrderSource", sql.VarChar(20), orderData.OrderSource || "WEBSITE")
        .input("PaymentMethod", sql.VarChar(30), orderData.PaymentMethod || "COD")
        .input("OrderStatus", sql.VarChar(30), orderData.OrderStatus || "PENDING")
        .input("PaymentStatus", sql.VarChar(30), orderData.PaymentStatus || "UNPAID")
        .input("Note", sql.NVarChar(500), orderData.Note)
        .query(`
            INSERT INTO dbo.Orders (
                OrderCode,
                CustomerID,
                AddressID,
                RecipientName,
                RecipientPhone,
                ShippingAddress,
                TotalAmount,
                OrderSource,
                PaymentMethod,
                OrderStatus,
                PaymentStatus,
                Note
            )
            OUTPUT INSERTED.OrderID
            VALUES (
                @OrderCode,
                @CustomerID,
                @AddressID,
                @RecipientName,
                @RecipientPhone,
                @ShippingAddress,
                @TotalAmount,
                @OrderSource,
                @PaymentMethod,
                @OrderStatus,
                @PaymentStatus,
                @Note
            )
        `);

    return await getOrderById(result.recordset[0].OrderID);
};

// Cập nhật đơn hàng
const updateOrder = async (id, orderData) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("OrderID", sql.Int, id)
        .input("CustomerID", sql.Int, orderData.CustomerID)
        .input("AddressID", sql.Int, orderData.AddressID)
        .input("RecipientName", sql.NVarChar(150), orderData.RecipientName)
        .input("RecipientPhone", sql.NVarChar(20), orderData.RecipientPhone)
        .input("ShippingAddress", sql.NVarChar(700), orderData.ShippingAddress)
        .input("TotalAmount", sql.Decimal(18, 2), orderData.TotalAmount)
        .input("OrderSource", sql.VarChar(20), orderData.OrderSource)
        .input("PaymentMethod", sql.VarChar(30), orderData.PaymentMethod)
        .input("OrderStatus", sql.VarChar(30), orderData.OrderStatus)
        .input("PaymentStatus", sql.VarChar(30), orderData.PaymentStatus)
        .input("Note", sql.NVarChar(500), orderData.Note)
        .query(`
            UPDATE dbo.Orders
            SET
                CustomerID = @CustomerID,
                AddressID = @AddressID,
                RecipientName = @RecipientName,
                RecipientPhone = @RecipientPhone,
                ShippingAddress = @ShippingAddress,
                TotalAmount = @TotalAmount,
                OrderSource = @OrderSource,
                PaymentMethod = @PaymentMethod,
                OrderStatus = @OrderStatus,
                PaymentStatus = @PaymentStatus,
                Note = @Note
            WHERE OrderID = @OrderID
        `);

    if (result.rowsAffected[0] === 0) {
        return null;
    }

    return await getOrderById(id);
};

// Xóa đơn hàng
const deleteOrder = async (id) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("OrderID", sql.Int, id)
        .query(`
            DELETE FROM dbo.Orders
            WHERE OrderID = @OrderID
        `);

    return result.rowsAffected[0] > 0;
};

module.exports = {
    getAllOrders,
    getOrderById,
    getOrderByCode,
    createOrder,
    updateOrder,
    deleteOrder
};
