
const orderItemService = require("../services/orderItemService");

// GET /api/order-items
const getAllOrderItems = async (req, res) => {
    try {
        const filters = {
            orderId: req.query.orderId,
            productId: req.query.productId
        };

        const data = await orderItemService.getAllOrderItems(filters);

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách sản phẩm trong đơn hàng thành công!",
            data
        });
    } catch (error) {
        console.error("getAllOrderItems error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách sản phẩm trong đơn hàng!"
        });
    }
};

// GET /api/order-items/:id
const getOrderItemById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "OrderItemID phải là số nguyên dương!"
            });
        }

        const data = await orderItemService.getOrderItemById(id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm trong đơn hàng!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy chi tiết sản phẩm trong đơn hàng thành công!",
            data
        });
    } catch (error) {
        console.error("getOrderItemById error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy chi tiết sản phẩm trong đơn hàng!"
        });
    }
};

// GET /api/order-items/order/:orderId
const getOrderItemsByOrderId = async (req, res) => {
    try {
        const orderId = Number(req.params.orderId);

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: "OrderID phải là số nguyên dương!"
            });
        }

        const data = await orderItemService.getOrderItemsByOrderId(orderId);

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách sản phẩm theo đơn hàng thành công!",
            data
        });
    } catch (error) {
        console.error("getOrderItemsByOrderId error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách sản phẩm theo đơn hàng!"
        });
    }
};

// POST /api/order-items
const createOrderItem = async (req, res) => {
    try {
        const { OrderID, ProductID, Quantity } = req.body;

        if (!Number.isInteger(OrderID) || OrderID <= 0) {
            return res.status(400).json({
                success: false,
                message: "OrderID phải là số nguyên dương!"
            });
        }

        if (!Number.isInteger(ProductID) || ProductID <= 0) {
            return res.status(400).json({
                success: false,
                message: "ProductID phải là số nguyên dương!"
            });
        }

        if (!Number.isInteger(Quantity) || Quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity phải là số nguyên dương!"
            });
        }

        const data = await orderItemService.createOrderItem({
            OrderID,
            ProductID,
            Quantity
        });

        return res.status(201).json({
            success: true,
            message: "Thêm sản phẩm vào đơn hàng thành công!",
            data
        });
    } catch (error) {
        console.error("createOrderItem error:", error);

        if (error.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng!"
            });
        }

        if (error.message === "PRODUCT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm!"
            });
        }

        if (error.message === "PRODUCT_INACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Sản phẩm đã bị vô hiệu hóa!"
            });
        }

        if (error.message === "ORDER_NOT_PENDING") {
            return res.status(400).json({
                success: false,
                message: "Chỉ được thay đổi sản phẩm khi đơn hàng đang ở trạng thái PENDING!"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi thêm sản phẩm vào đơn hàng!"
        });
    }
};

// PUT /api/order-items/:id
const updateOrderItem = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { ProductID, Quantity } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "OrderItemID phải là số nguyên dương!"
            });
        }

        if (ProductID !== undefined &&
            (!Number.isInteger(ProductID) || ProductID <= 0)) {
            return res.status(400).json({
                success: false,
                message: "ProductID phải là số nguyên dương!"
            });
        }

        if (Quantity !== undefined &&
            (!Number.isInteger(Quantity) || Quantity <= 0)) {
            return res.status(400).json({
                success: false,
                message: "Quantity phải là số nguyên dương!"
            });
        }

        if (ProductID === undefined && Quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ProductID hoặc Quantity cần cập nhật!"
            });
        }

        const data = await orderItemService.updateOrderItem(id, {
            ProductID,
            Quantity
        });

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm trong đơn hàng!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật sản phẩm trong đơn hàng thành công!",
            data
        });
    } catch (error) {
        console.error("updateOrderItem error:", error);

        if (error.message === "ORDER_ITEM_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm trong đơn hàng!"
            });
        }

        if (error.message === "PRODUCT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm!"
            });
        }

        if (error.message === "PRODUCT_INACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Sản phẩm đã bị vô hiệu hóa!"
            });
        }

        if (error.message === "ORDER_NOT_PENDING") {
            return res.status(400).json({
                success: false,
                message: "Chỉ được thay đổi sản phẩm khi đơn hàng đang ở trạng thái PENDING!"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật sản phẩm trong đơn hàng!"
        });
    }
};

// DELETE /api/order-items/:id
const deleteOrderItem = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "OrderItemID phải là số nguyên dương!"
            });
        }

        const data = await orderItemService.deleteOrderItem(id);

        return res.status(200).json({
            success: true,
            message: "Xóa sản phẩm khỏi đơn hàng thành công!",
            data
        });
    } catch (error) {
        console.error("deleteOrderItem error:", error);

        if (error.message === "ORDER_ITEM_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm trong đơn hàng!"
            });
        }

        if (error.message === "ORDER_NOT_PENDING") {
            return res.status(400).json({
                success: false,
                message: "Chỉ được xóa sản phẩm khi đơn hàng đang ở trạng thái PENDING!"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa sản phẩm khỏi đơn hàng!"
        });
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
