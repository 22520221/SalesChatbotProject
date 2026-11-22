
const { sql, connectDB } = require("../config/database");

// 1. Lấy danh sách thanh toán
const getAllPayments = async (filters = {}) => {
    const pool = await connectDB();

    const request = pool.request();

    let query = `
        SELECT
            p.PaymentID,
            p.OrderID,
            o.OrderCode,
            p.PaymentCode,
            p.PaymentMethod,
            p.Amount,
            p.PaymentStatus,
            p.TransactionReference,
            p.PaidAt,
            p.CreatedAt
        FROM Payments p
        INNER JOIN Orders o ON p.OrderID = o.OrderID
        WHERE 1 = 1
    `;

    if (filters.orderId) {
        query += " AND p.OrderID = @OrderID";
        request.input("OrderID", sql.Int, Number(filters.orderId));
    }

    if (filters.paymentStatus) {
        query += " AND p.PaymentStatus = @PaymentStatus";
        request.input("PaymentStatus", sql.VarChar(30), filters.paymentStatus);
    }

    if (filters.paymentMethod) {
        query += " AND p.PaymentMethod = @PaymentMethod";
        request.input("PaymentMethod", sql.VarChar(30), filters.paymentMethod);
    }

    query += " ORDER BY p.PaymentID DESC";

    const result = await request.query(query);

    return result.recordset;
};

// 2. Lấy thanh toán theo ID
const getPaymentById = async (id) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("PaymentID", sql.Int, id)
        .query(`
            SELECT
                p.PaymentID,
                p.OrderID,
                o.OrderCode,
                p.PaymentCode,
                p.PaymentMethod,
                p.Amount,
                p.PaymentStatus,
                p.TransactionReference,
                p.PaidAt,
                p.CreatedAt
            FROM Payments p
            INNER JOIN Orders o ON p.OrderID = o.OrderID
            WHERE p.PaymentID = @PaymentID
        `);

    return result.recordset[0] || null;
};

// 3. Lấy danh sách thanh toán theo OrderID
const getPaymentsByOrderId = async (orderId) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("OrderID", sql.Int, orderId)
        .query(`
            SELECT
                p.PaymentID,
                p.OrderID,
                o.OrderCode,
                p.PaymentCode,
                p.PaymentMethod,
                p.Amount,
                p.PaymentStatus,
                p.TransactionReference,
                p.PaidAt,
                p.CreatedAt
            FROM Payments p
            INNER JOIN Orders o ON p.OrderID = o.OrderID
            WHERE p.OrderID = @OrderID
            ORDER BY p.PaymentID DESC
        `);

    return result.recordset;
};

// 4. Thêm thanh toán
const createPayment = async (data) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("OrderID", sql.Int, data.OrderID)
        .input("PaymentCode", sql.VarChar(100), data.PaymentCode || null)
        .input("PaymentMethod", sql.VarChar(30), data.PaymentMethod)
        .input("Amount", sql.Decimal(18, 2), data.Amount)
        .input("PaymentStatus", sql.VarChar(30), data.PaymentStatus || "PENDING")
        .input("TransactionReference", sql.NVarChar(200), data.TransactionReference || null)
        .input("PaidAt", sql.DateTime2, data.PaidAt || null)
        .query(`
            INSERT INTO Payments (
                OrderID,
                PaymentCode,
                PaymentMethod,
                Amount,
                PaymentStatus,
                TransactionReference,
                PaidAt
            )
            OUTPUT INSERTED.PaymentID
            VALUES (
                @OrderID,
                @PaymentCode,
                @PaymentMethod,
                @Amount,
                @PaymentStatus,
                @TransactionReference,
                @PaidAt
            )
        `);

    return await getPaymentById(result.recordset[0].PaymentID);
};

// 5. Cập nhật thanh toán
const updatePayment = async (id, data) => {
    const pool = await connectDB();

    const existingPayment = await getPaymentById(id);

    if (!existingPayment) {
        throw new Error("PAYMENT_NOT_FOUND");
    }

    const result = await pool.request()
        .input("PaymentID", sql.Int, id)
        .input(
            "PaymentMethod",
            sql.VarChar(30),
            data.PaymentMethod ?? existingPayment.PaymentMethod
        )
        .input(
            "Amount",
            sql.Decimal(18, 2),
            data.Amount ?? existingPayment.Amount
        )
        .input(
            "PaymentStatus",
            sql.VarChar(30),
            data.PaymentStatus ?? existingPayment.PaymentStatus
        )
        .input(
            "TransactionReference",
            sql.NVarChar(200),
            data.TransactionReference ?? existingPayment.TransactionReference
        )
        .input(
            "PaidAt",
            sql.DateTime2,
            data.PaidAt ?? existingPayment.PaidAt
        )
        .query(`
            UPDATE Payments
            SET
                PaymentMethod = @PaymentMethod,
                Amount = @Amount,
                PaymentStatus = @PaymentStatus,
                TransactionReference = @TransactionReference,
                PaidAt = @PaidAt
            WHERE PaymentID = @PaymentID
        `);

    return await getPaymentById(id);
};

// 6. Xóa thanh toán
const deletePayment = async (id) => {
    const pool = await connectDB();

    const existingPayment = await getPaymentById(id);

    if (!existingPayment) {
        throw new Error("PAYMENT_NOT_FOUND");
    }

    await pool.request()
        .input("PaymentID", sql.Int, id)
        .query(`
            DELETE FROM Payments
            WHERE PaymentID = @PaymentID
        `);

    return {
        PaymentID: id,
        OrderID: existingPayment.OrderID
    };
};

module.exports = {
    getAllPayments,
    getPaymentById,
    getPaymentsByOrderId,
    createPayment,
    updatePayment,
    deletePayment
};
