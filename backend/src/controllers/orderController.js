
const orderService = require("../services/orderService");

// Kiểm tra ID hợp lệ
const parseId = (value) => {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return null;
    }

    return id;
};

// Xử lý lỗi Database
const handleDatabaseError = (res, error) => {
    console.error("Order Controller Error:", error);

    // Trùng OrderCode hoặc Unique Constraint
    if (error.number === 2627 || error.number === 2601) {
        return res.status(409).json({
            success: false,
            message: "OrderCode đã tồn tại!"
        });
    }

    // Vi phạm khóa ngoại
    if (error.number === 547) {
        return res.status(409).json({
            success: false,
            message: "CustomerID hoặc AddressID không tồn tại, hoặc đơn hàng đang được sử dụng!"
        });
    }

    // Vi phạm NOT NULL
    if (error.number === 515) {
        return res.status(400).json({
            success: false,
            message: "Thiếu dữ liệu bắt buộc!"
        });
    }

    // Dữ liệu vượt quá độ dài cột
    if (error.number === 8152 || error.number === 2628) {
        return res.status(400).json({
            success: false,
            message: "Một hoặc nhiều trường dữ liệu vượt quá độ dài cho phép!"
        });
    }

    return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ khi xử lý đơn hàng!"
    });
};

// Kiểm tra dữ liệu đơn hàng
const validateOrder = (data, isUpdate = false) => {
    const errors = [];

    if (!isUpdate) {
        const orderCode = data.OrderCode;

        if (
            typeof orderCode !== "string" ||
            !orderCode.trim() ||
            orderCode.trim().length > 30
        ) {
            errors.push("OrderCode không được để trống và tối đa 30 ký tự!");
        }
    }

    const customerId = Number(data.CustomerID);

    if (
        !Number.isSafeInteger(customerId) ||
        customerId <= 0
    ) {
        errors.push("CustomerID phải là số nguyên dương!");
    }

    if (
        data.AddressID !== undefined &&
        data.AddressID !== null &&
        data.AddressID !== ""
    ) {
        const addressId = Number(data.AddressID);

        if (!Number.isSafeInteger(addressId) || addressId <= 0) {
            errors.push("AddressID phải là số nguyên dương hoặc null!");
        }
    }

    if (
        typeof data.RecipientName !== "string" ||
        !data.RecipientName.trim() ||
        data.RecipientName.trim().length > 150
    ) {
        errors.push("RecipientName không được để trống và tối đa 150 ký tự!");
    }

    if (
        typeof data.RecipientPhone !== "string" ||
        !data.RecipientPhone.trim() ||
        data.RecipientPhone.trim().length > 20
    ) {
        errors.push("RecipientPhone không được để trống và tối đa 20 ký tự!");
    }

    if (
        typeof data.ShippingAddress !== "string" ||
        !data.ShippingAddress.trim() ||
        data.ShippingAddress.trim().length > 700
    ) {
        errors.push("ShippingAddress không được để trống và tối đa 700 ký tự!");
    }

    const totalAmount = Number(data.TotalAmount);

    if (
        data.TotalAmount === undefined ||
        data.TotalAmount === null ||
        data.TotalAmount === "" ||
        !Number.isFinite(totalAmount) ||
        totalAmount < 0 ||
        !/^\d+(\.\d{1,2})?$/.test(String(data.TotalAmount))
    ) {
        errors.push("TotalAmount phải là số không âm và tối đa 2 chữ số thập phân!");
    }

    const orderSource = data.OrderSource || "WEBSITE";
    const paymentMethod = data.PaymentMethod || "COD";
    const orderStatus = data.OrderStatus || "PENDING";
    const paymentStatus = data.PaymentStatus || "UNPAID";

    if (typeof orderSource !== "string" || !orderSource.trim() || orderSource.length > 20) {
        errors.push("OrderSource không được để trống và tối đa 20 ký tự!");
    }

    if (typeof paymentMethod !== "string" || !paymentMethod.trim() || paymentMethod.length > 30) {
        errors.push("PaymentMethod không được để trống và tối đa 30 ký tự!");
    }

    if (typeof orderStatus !== "string" || !orderStatus.trim() || orderStatus.length > 30) {
        errors.push("OrderStatus không được để trống và tối đa 30 ký tự!");
    }

    if (typeof paymentStatus !== "string" || !paymentStatus.trim() || paymentStatus.length > 30) {
        errors.push("PaymentStatus không được để trống và tối đa 30 ký tự!");
    }

    if (
        data.Note !== undefined &&
        data.Note !== null &&
        (typeof data.Note !== "string" || data.Note.length > 500)
    ) {
        errors.push("Note tối đa 500 ký tự!");
    }

    return errors;
};

// Chuẩn hóa dữ liệu
const normalizeOrderData = (data) => ({
    CustomerID: Number(data.CustomerID),
    AddressID:
        data.AddressID === undefined ||
        data.AddressID === null ||
        data.AddressID === ""
            ? null
            : Number(data.AddressID),
    RecipientName: data.RecipientName.trim(),
    RecipientPhone: data.RecipientPhone.trim(),
    ShippingAddress: data.ShippingAddress.trim(),
    TotalAmount: Number(data.TotalAmount),
    OrderSource: (data.OrderSource || "WEBSITE").trim(),
    PaymentMethod: (data.PaymentMethod || "COD").trim(),
    OrderStatus: (data.OrderStatus || "PENDING").trim(),
    PaymentStatus: (data.PaymentStatus || "UNPAID").trim(),
    Note:
        data.Note === undefined ||
        data.Note === null ||
        data.Note.trim() === ""
            ? null
            : data.Note.trim()
});

// GET /api/orders
const getAllOrders = async (req, res) => {
    try {
        const filters = {};

        if (req.query.customerId !== undefined) {
            const customerId = parseId(req.query.customerId);

            if (!customerId) {
                return res.status(400).json({
                    success: false,
                    message: "customerId phải là số nguyên dương!"
                });
            }

            filters.customerId = customerId;
        }

        if (req.query.orderStatus) {
            filters.orderStatus = req.query.orderStatus.trim();
        }

        if (req.query.paymentStatus) {
            filters.paymentStatus = req.query.paymentStatus.trim();
        }

        if (req.query.orderSource) {
            filters.orderSource = req.query.orderSource.trim();
        }

        if (req.query.search) {
            filters.search = req.query.search.trim();
        }

        const orders = await orderService.getAllOrders(filters);

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đơn hàng thành công!",
            data: orders
        });
    } catch (error) {
        return handleDatabaseError(res, error);
    }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "OrderID không hợp lệ!"
            });
        }

        const order = await orderService.getOrderById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin đơn hàng thành công!",
            data: order
        });
    } catch (error) {
        return handleDatabaseError(res, error);
    }
};

// GET /api/orders/code/:orderCode
const getOrderByCode = async (req, res) => {
    try {
        const orderCode = req.params.orderCode.trim();

        if (!orderCode || orderCode.length > 30) {
            return res.status(400).json({
                success: false,
                message: "OrderCode không hợp lệ!"
            });
        }

        const order = await orderService.getOrderByCode(orderCode);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin đơn hàng thành công!",
            data: order
        });
    } catch (error) {
        return handleDatabaseError(res, error);
    }
};

// POST /api/orders
const createOrder = async (req, res) => {
    try {
        const errors = validateOrder(req.body);

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: errors[0]
            });
        }

        const orderData = normalizeOrderData(req.body);

        const order = await orderService.createOrder({
            ...orderData,
            OrderCode: req.body.OrderCode.trim()
        });

        return res.status(201).json({
            success: true,
            message: "Tạo đơn hàng thành công!",
            data: order
        });
    } catch (error) {
        return handleDatabaseError(res, error);
    }
};

// PUT /api/orders/:id
const updateOrder = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "OrderID không hợp lệ!"
            });
        }

        const existingOrder = await orderService.getOrderById(id);

        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng!"
            });
        }

        const errors = validateOrder({
            ...req.body,
            CustomerID: existingOrder.CustomerID
        }, true);

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: errors[0]
            });
        }

        const orderData = normalizeOrderData({
            ...req.body,
            CustomerID: existingOrder.CustomerID
        });

        const updatedOrder = await orderService.updateOrder(id, orderData);

        return res.status(200).json({
            success: true,
            message: "Cập nhật đơn hàng thành công!",
            data: updatedOrder
        });
    } catch (error) {
        return handleDatabaseError(res, error);
    }
};

// DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "OrderID không hợp lệ!"
            });
        }

        const deleted = await orderService.deleteOrder(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Xóa đơn hàng thành công!"
        });
    } catch (error) {
        return handleDatabaseError(res, error);
    }
};

module.exports = {
    getAllOrders,
    getOrderById,
    getOrderByCode,
    createOrder,
    updateOrder,
    deleteOrder
};
