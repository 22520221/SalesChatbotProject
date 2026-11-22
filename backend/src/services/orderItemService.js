
const { sql, connectDB } = require("../config/database");

// Lấy danh sách sản phẩm trong đơn hàng
const getAllOrderItems = async (filters = {}) => {
    const pool = await connectDB();

    let query = `
        SELECT
            oi.OrderItemID,
            oi.OrderID,
            o.OrderCode,
            oi.ProductID,
            oi.ProductName,
            oi.UnitPrice,
            oi.Quantity,
            oi.Subtotal
        FROM dbo.OrderItems oi
        INNER JOIN dbo.Orders o ON oi.OrderID = o.OrderID
        WHERE 1 = 1
    `;

    const request = pool.request();

    if (filters.orderId) {
        query += " AND oi.OrderID = @OrderID";
        request.input("OrderID", sql.Int, filters.orderId);
    }

    if (filters.productId) {
        query += " AND oi.ProductID = @ProductID";
        request.input("ProductID", sql.Int, filters.productId);
    }

    query += " ORDER BY oi.OrderItemID DESC";

    const result = await request.query(query);
    return result.recordset;
};

// Lấy chi tiết một sản phẩm trong đơn hàng
const getOrderItemById = async (id) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("OrderItemID", sql.Int, id)
        .query(`
            SELECT
                oi.OrderItemID,
                oi.OrderID,
                o.OrderCode,
                oi.ProductID,
                oi.ProductName,
                oi.UnitPrice,
                oi.Quantity,
                oi.Subtotal
            FROM dbo.OrderItems oi
            INNER JOIN dbo.Orders o ON oi.OrderID = o.OrderID
            WHERE oi.OrderItemID = @OrderItemID
        `);

    return result.recordset[0] || null;
};

// Lấy danh sách sản phẩm theo đơn hàng
const getOrderItemsByOrderId = async (orderId) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("OrderID", sql.Int, orderId)
        .query(`
            SELECT
                OrderItemID,
                OrderID,
                ProductID,
                ProductName,
                UnitPrice,
                Quantity,
                Subtotal
            FROM dbo.OrderItems
            WHERE OrderID = @OrderID
            ORDER BY OrderItemID DESC
        `);

    return result.recordset;
};


// Thêm sản phẩm vào đơn hàng
const createOrderItem = async (data) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // Kiểm tra đơn hàng có tồn tại không
        const orderResult = await new sql.Request(transaction)
            .input("OrderID", sql.Int, data.OrderID)
            .query(`
                SELECT OrderID, OrderStatus
                FROM dbo.Orders
                WHERE OrderID = @OrderID
            `);

        if (orderResult.recordset.length === 0) {
            throw new Error("ORDER_NOT_FOUND");
        }

        // Chỉ cho phép thêm sản phẩm khi đơn hàng đang chờ xử lý
        if (orderResult.recordset[0].OrderStatus !== "PENDING") {
            throw new Error("ORDER_NOT_PENDING");
        }

        // Lấy thông tin sản phẩm từ database
        const productResult = await new sql.Request(transaction)
            .input("ProductID", sql.Int, data.ProductID)
            .query(`
                SELECT ProductID, ProductName, Price, IsActive
                FROM dbo.Products
                WHERE ProductID = @ProductID
            `);

        if (productResult.recordset.length === 0) {
            throw new Error("PRODUCT_NOT_FOUND");
        }

        const product = productResult.recordset[0];

        if (!product.IsActive) {
            throw new Error("PRODUCT_INACTIVE");
        }

        // Thêm sản phẩm vào đơn hàng
        const insertResult = await new sql.Request(transaction)
            .input("OrderID", sql.Int, data.OrderID)
            .input("ProductID", sql.Int, product.ProductID)
            .input("ProductName", sql.NVarChar(200), product.ProductName)
            .input("UnitPrice", sql.Decimal(18, 2), product.Price)
            .input("Quantity", sql.Int, data.Quantity)
            .query(`
                INSERT INTO dbo.OrderItems (
                    OrderID,
                    ProductID,
                    ProductName,
                    UnitPrice,
                    Quantity
                )
                OUTPUT INSERTED.OrderItemID
                VALUES (
                    @OrderID,
                    @ProductID,
                    @ProductName,
                    @UnitPrice,
                    @Quantity
                )
            `);

        // Tính lại tổng tiền đơn hàng
        await new sql.Request(transaction)
            .input("OrderID", sql.Int, data.OrderID)
            .query(`
                UPDATE dbo.Orders
                SET TotalAmount = (
                    SELECT COALESCE(SUM(Subtotal), 0)
                    FROM dbo.OrderItems
                    WHERE OrderID = @OrderID
                )
                WHERE OrderID = @OrderID
            `);

        await transaction.commit();

        return await getOrderItemById(insertResult.recordset[0].OrderItemID);

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};


const updateOrderItem = async (id, data) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // Kiểm tra sản phẩm trong đơn hàng
        const itemResult = await new sql.Request(transaction)
            .input("OrderItemID", sql.Int, id)
            .query(`
                SELECT OrderItemID, OrderID, ProductID
                FROM dbo.OrderItems
                WHERE OrderItemID = @OrderItemID
            `);

        if (itemResult.recordset.length === 0) {
            throw new Error("ORDER_ITEM_NOT_FOUND");
        }

        const item = itemResult.recordset[0];

        // Kiểm tra trạng thái đơn hàng
        const orderResult = await new sql.Request(transaction)
            .input("OrderID", sql.Int, item.OrderID)
            .query(`
                SELECT OrderStatus
                FROM dbo.Orders
                WHERE OrderID = @OrderID
            `);

        if (orderResult.recordset[0].OrderStatus !== "PENDING") {
            throw new Error("ORDER_NOT_PENDING");
        }

        const productId = data.ProductID ?? item.ProductID;

        // Lấy thông tin sản phẩm mới
        const productResult = await new sql.Request(transaction)
            .input("ProductID", sql.Int, productId)
            .query(`
                SELECT ProductID, ProductName, Price, IsActive
                FROM dbo.Products
                WHERE ProductID = @ProductID
            `);

        if (productResult.recordset.length === 0) {
            throw new Error("PRODUCT_NOT_FOUND");
        }

        const product = productResult.recordset[0];

        if (!product.IsActive) {
            throw new Error("PRODUCT_INACTIVE");
        }

        const quantity = data.Quantity ?? item.Quantity;

        // Cập nhật sản phẩm trong đơn hàng
        await new sql.Request(transaction)
            .input("OrderItemID", sql.Int, id)
            .input("ProductID", sql.Int, product.ProductID)
            .input("ProductName", sql.NVarChar(200), product.ProductName)
            .input("UnitPrice", sql.Decimal(18, 2), product.Price)
            .input("Quantity", sql.Int, quantity)
            .query(`
                UPDATE dbo.OrderItems
                SET
                    ProductID = @ProductID,
                    ProductName = @ProductName,
                    UnitPrice = @UnitPrice,
                    Quantity = @Quantity
                WHERE OrderItemID = @OrderItemID
            `);

        // Tính lại tổng tiền đơn hàng
        await new sql.Request(transaction)
            .input("OrderID", sql.Int, item.OrderID)
            .query(`
                UPDATE dbo.Orders
                SET TotalAmount = (
                    SELECT COALESCE(SUM(Subtotal), 0)
                    FROM dbo.OrderItems
                    WHERE OrderID = @OrderID
                )
                WHERE OrderID = @OrderID
            `);

        await transaction.commit();

        return await getOrderItemById(id);

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};


const deleteOrderItem = async (id) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // Kiểm tra sản phẩm trong đơn hàng
        const itemResult = await new sql.Request(transaction)
            .input("OrderItemID", sql.Int, id)
            .query(`
                SELECT OrderItemID, OrderID
                FROM dbo.OrderItems
                WHERE OrderItemID = @OrderItemID
            `);

        if (itemResult.recordset.length === 0) {
            throw new Error("ORDER_ITEM_NOT_FOUND");
        }

        const item = itemResult.recordset[0];

        // Kiểm tra trạng thái đơn hàng
        const orderResult = await new sql.Request(transaction)
            .input("OrderID", sql.Int, item.OrderID)
            .query(`
                SELECT OrderStatus
                FROM dbo.Orders
                WHERE OrderID = @OrderID
            `);

        if (orderResult.recordset[0].OrderStatus !== "PENDING") {
            throw new Error("ORDER_NOT_PENDING");
        }

        // Xóa sản phẩm khỏi đơn hàng
        await new sql.Request(transaction)
            .input("OrderItemID", sql.Int, id)
            .query(`
                DELETE FROM dbo.OrderItems
                WHERE OrderItemID = @OrderItemID
            `);

        // Tính lại tổng tiền đơn hàng
        await new sql.Request(transaction)
            .input("OrderID", sql.Int, item.OrderID)
            .query(`
                UPDATE dbo.Orders
                SET TotalAmount = (
                    SELECT COALESCE(SUM(Subtotal), 0)
                    FROM dbo.OrderItems
                    WHERE OrderID = @OrderID
                )
                WHERE OrderID = @OrderID
            `);

        await transaction.commit();

        return {
            OrderItemID: id,
            OrderID: item.OrderID
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    getAllOrderItems,
    getOrderItemById,
    getOrderItemsByOrderId,
    createOrderItem,
    updateOrderItem,
    deleteOrderItem
};
