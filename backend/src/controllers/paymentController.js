
const paymentService = require("../services/paymentService");

// Kiểm tra số nguyên dương
const isPositiveInteger = (value) => {
    return Number.isInteger(Number(value)) && Number(value) > 0;
};

// Kiểm tra PaymentStatus
const validPaymentStatuses = [
    "PENDING",
    "SUCCESS",
    "FAILED",
    "REFUNDED"
];

// 1. GET /api/payments
const getAllPayments = async (req, res) => {
    try {
        const { orderId, paymentStatus, paymentMethod } = req.query;

        if (orderId !== undefined && !isPositiveInteger(orderId)) {
            return res.status(400).json({
                success: false,
                message: "OrderID phải là số nguyên dương!"
            });
        }

        const payments = await paymentService.getAllPayments({
            orderId,
            paymentStatus,
            paymentMethod
        });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách thanh toán thành công!",
            data: payments
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. GET /api/payments/:id
const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isPositiveInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "PaymentID phải là số nguyên dương!"
            });
        }

        const payment = await paymentService.getPaymentById(Number(id));

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thanh toán!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin thanh toán thành công!",
            data: payment
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. GET /api/payments/order/:orderId
const getPaymentsByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!isPositiveInteger(orderId)) {
            return res.status(400).json({
                success: false,
                message: "OrderID phải là số nguyên dương!"
            });
        }

        const payments = await paymentService.getPaymentsByOrderId(
            Number(orderId)
        );

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách thanh toán theo đơn hàng thành công!",
            data: payments
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 4. POST /api/payments
const createPayment = async (req, res) => {
    try {
        const {
            OrderID,
            PaymentCode,
            PaymentMethod,
            Amount,
            PaymentStatus,
            TransactionReference,
            PaidAt
        } = req.body;

        if (!isPositiveInteger(OrderID)) {
            return res.status(400).json({
                success: false,
                message: "OrderID phải là số nguyên dương!"
            });
        }

        if (
            typeof PaymentMethod !== "string" ||
            !PaymentMethod.trim() ||
            PaymentMethod.length > 30
        ) {
            return res.status(400).json({
                success: false,
                message: "PaymentMethod không được để trống và tối đa 30 ký tự!"
            });
        }

        if (
            Amount === undefined ||
            Amount === null ||
            Amount === "" ||
            !Number.isFinite(Number(Amount)) ||
            Number(Amount) < 0 ||
            !/^\d+(\.\d{1,2})?$/.test(String(Amount))
        ) {
            return res.status(400).json({
                success: false,
                message: "Amount phải là số không âm và tối đa 2 chữ số thập phân!"
            });
        }

        if (
            PaymentCode !== undefined &&
            PaymentCode !== null &&
            (typeof PaymentCode !== "string" || PaymentCode.length > 100)
        ) {
            return res.status(400).json({
                success: false,
                message: "PaymentCode tối đa 100 ký tự!"
            });
        }

        if (
            PaymentStatus !== undefined &&
            !validPaymentStatuses.includes(PaymentStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: "PaymentStatus chỉ được là PENDING, SUCCESS, FAILED hoặc REFUNDED!"
            });
        }

        if (
            TransactionReference !== undefined &&
            TransactionReference !== null &&
            (typeof TransactionReference !== "string" ||
                TransactionReference.length > 200)
        ) {
            return res.status(400).json({
                success: false,
                message: "TransactionReference tối đa 200 ký tự!"
            });
        }

        if (
            PaidAt !== undefined &&
            PaidAt !== null &&
            (typeof PaidAt !== "string" || isNaN(Date.parse(PaidAt)))
        ) {
            return res.status(400).json({
                success: false,
                message: "PaidAt không đúng định dạng ngày giờ!"
            });
        }

        const payment = await paymentService.createPayment({
            OrderID: Number(OrderID),
            PaymentCode: PaymentCode?.trim() || null,
            PaymentMethod: PaymentMethod.trim(),
            Amount: Number(Amount),
            PaymentStatus: PaymentStatus || "PENDING",
            TransactionReference: TransactionReference || null,
            PaidAt: PaidAt || null
        });

        return res.status(201).json({
            success: true,
            message: "Thêm thanh toán thành công!",
            data: payment
        });
    } catch (error) {
        if (error.number === 547) {
            return res.status(409).json({
                success: false,
                message: "Đơn hàng không tồn tại hoặc dữ liệu vi phạm ràng buộc!"
            });
        }

        if (error.number === 2601 || error.number === 2627) {
            return res.status(409).json({
                success: false,
                message: "PaymentCode đã tồn tại!"
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 5. PUT /api/payments/:id
const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isPositiveInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "PaymentID phải là số nguyên dương!"
            });
        }

        const {
            PaymentMethod,
            Amount,
            PaymentStatus,
            TransactionReference,
            PaidAt
        } = req.body;

        if (
            PaymentMethod === undefined &&
            Amount === undefined &&
            PaymentStatus === undefined &&
            TransactionReference === undefined &&
            PaidAt === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp thông tin cần cập nhật!"
            });
        }

        if (
            PaymentMethod !== undefined &&
            (typeof PaymentMethod !== "string" ||
                !PaymentMethod.trim() ||
                PaymentMethod.length > 30)
        ) {
            return res.status(400).json({
                success: false,
                message: "PaymentMethod không được để trống và tối đa 30 ký tự!"
            });
        }

        if (
            Amount !== undefined &&
            (
                Amount === null ||
                Amount === "" ||
                !Number.isFinite(Number(Amount)) ||
                Number(Amount) < 0 ||
                !/^\d+(\.\d{1,2})?$/.test(String(Amount))
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Amount phải là số không âm và tối đa 2 chữ số thập phân!"
            });
        }

        if (
            PaymentStatus !== undefined &&
            !validPaymentStatuses.includes(PaymentStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: "PaymentStatus chỉ được là PENDING, SUCCESS, FAILED hoặc REFUNDED!"
            });
        }

        if (
            TransactionReference !== undefined &&
            TransactionReference !== null &&
            (typeof TransactionReference !== "string" ||
                TransactionReference.length > 200)
        ) {
            return res.status(400).json({
                success: false,
                message: "TransactionReference tối đa 200 ký tự!"
            });
        }

        if (
            PaidAt !== undefined &&
            PaidAt !== null &&
            (typeof PaidAt !== "string" || isNaN(Date.parse(PaidAt)))
        ) {
            return res.status(400).json({
                success: false,
                message: "PaidAt không đúng định dạng ngày giờ!"
            });
        }

        const payment = await paymentService.updatePayment(Number(id), {
            PaymentMethod:
                PaymentMethod === undefined ? undefined : PaymentMethod.trim(),
            Amount: Amount === undefined ? undefined : Number(Amount),
            PaymentStatus,
            TransactionReference,
            PaidAt
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thanh toán!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật thanh toán thành công!",
            data: payment
        });
    } catch (error) {
        if (error.message === "PAYMENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thanh toán!"
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 6. DELETE /api/payments/:id
const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isPositiveInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "PaymentID phải là số nguyên dương!"
            });
        }

        const result = await paymentService.deletePayment(Number(id));

        return res.status(200).json({
            success: true,
            message: "Xóa thanh toán thành công!",
            data: result
        });
    } catch (error) {
        if (error.message === "PAYMENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thanh toán!"
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllPayments,
    getPaymentById,
    getPaymentsByOrderId,
    createPayment,
    updatePayment,
    deletePayment
};
