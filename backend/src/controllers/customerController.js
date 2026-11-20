
const customerService = require("../services/customerService");

// Kiểm tra CustomerID hợp lệ
const parseCustomerId = (id) => {
    const parsedId = Number(id);

    if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
        return null;
    }

    return parsedId;
};

// 1. Lấy danh sách khách hàng
const getAllCustomers = async (req, res) => {
    try {
        const search = req.query.search?.trim() || null;

        const customers = await customerService.getAllCustomers(search);

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách khách hàng thành công!",
            data: customers
        });
    } catch (error) {
        console.error("Get customers error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách khách hàng!"
        });
    }
};

// 2. Lấy khách hàng theo ID
const getCustomerById = async (req, res) => {
    try {
        const id = parseCustomerId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "CustomerID không hợp lệ!"
            });
        }

        const customer = await customerService.getCustomerById(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khách hàng!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin khách hàng thành công!",
            data: customer
        });
    } catch (error) {
        console.error("Get customer error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thông tin khách hàng!"
        });
    }
};

// 3. Tìm khách hàng theo MessengerPSID
const getCustomerByMessengerPSID = async (req, res) => {
    try {
        const psid = req.params.psid?.trim();

        if (!psid) {
            return res.status(400).json({
                success: false,
                message: "MessengerPSID không được để trống!"
            });
        }

        const customer =
            await customerService.getCustomerByMessengerPSID(psid);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khách hàng với MessengerPSID này!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Tìm khách hàng theo MessengerPSID thành công!",
            data: customer
        });
    } catch (error) {
        console.error("Get customer by PSID error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi tìm khách hàng!"
        });
    }
};

// Kiểm tra dữ liệu tạo và cập nhật
const validateCustomer = (body) => {
    const { FullName, Email, Phone, MessengerPSID } = body;

    if (
        typeof FullName !== "string" ||
        !FullName.trim() ||
        FullName.trim().length > 150
    ) {
        return "FullName phải là chuỗi, không được để trống và tối đa 150 ký tự!";
    }

    if (
        Email !== undefined &&
        Email !== null &&
        (
            typeof Email !== "string" ||
            Email.trim().length > 150 ||
            (Email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email.trim()))
        )
    ) {
        return "Email không hợp lệ hoặc vượt quá 150 ký tự!";
    }

    if (
        Phone !== undefined &&
        Phone !== null &&
        (typeof Phone !== "string" || Phone.trim().length > 20)
    ) {
        return "Phone không hợp lệ hoặc vượt quá 20 ký tự!";
    }

    if (
        MessengerPSID !== undefined &&
        MessengerPSID !== null &&
        (
            typeof MessengerPSID !== "string" ||
            !MessengerPSID.trim() ||
            MessengerPSID.trim().length > 100
        )
    ) {
        return "MessengerPSID không hợp lệ!";
    }

    return null;
};

// Xử lý lỗi UNIQUE Email và MessengerPSID
const handleDatabaseError = (error, res) => {
    if (error.number === 2601 || error.number === 2627) {
        return res.status(409).json({
            success: false,
            message: "Email hoặc MessengerPSID đã tồn tại!"
        });
    }

    console.error("Customer database error:", error);

    return res.status(500).json({
        success: false,
        message: "Lỗi server khi xử lý khách hàng!"
    });
};

// 4. Thêm khách hàng
const createCustomer = async (req, res) => {
    try {
        const validationError = validateCustomer(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const customerData = {
            FullName: req.body.FullName.trim(),
            Email: req.body.Email?.trim() || null,
            Phone: req.body.Phone?.trim() || null,
            MessengerPSID: req.body.MessengerPSID?.trim() || null
        };

        const customer =
            await customerService.createCustomer(customerData);

        return res.status(201).json({
            success: true,
            message: "Thêm khách hàng thành công!",
            data: customer
        });
    } catch (error) {
        return handleDatabaseError(error, res);
    }
};

// 5. Cập nhật khách hàng
const updateCustomer = async (req, res) => {
    try {
        const id = parseCustomerId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "CustomerID không hợp lệ!"
            });
        }

        const validationError = validateCustomer(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const customerData = {
            FullName: req.body.FullName.trim(),
            Email: req.body.Email?.trim() || null,
            Phone: req.body.Phone?.trim() || null,
            MessengerPSID: req.body.MessengerPSID?.trim() || null
        };

        const customer =
            await customerService.updateCustomer(id, customerData);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khách hàng!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật khách hàng thành công!",
            data: customer
        });
    } catch (error) {
        return handleDatabaseError(error, res);
    }
};

// 6. Xóa khách hàng
const deleteCustomer = async (req, res) => {
    try {
        const id = parseCustomerId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "CustomerID không hợp lệ!"
            });
        }

        const result = await customerService.deleteCustomer(id);

        if (result.notFound) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khách hàng!"
            });
        }

        if (result.hasOrders) {
            return res.status(409).json({
                success: false,
                message: "Không thể xóa khách hàng đã có đơn hàng!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Xóa khách hàng thành công!"
        });
    } catch (error) {
        console.error("Delete customer error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa khách hàng!"
        });
    }
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    getCustomerByMessengerPSID,
    createCustomer,
    updateCustomer,
    deleteCustomer
};
