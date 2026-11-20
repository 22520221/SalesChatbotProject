
const addressService = require("../services/addressService");

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
    console.error("Address API Error:", error);

    if (error.number === 547) {
        return res.status(409).json({
            success: false,
            message: "Khách hàng không tồn tại hoặc địa chỉ đang được sử dụng!"
        });
    }

    return res.status(500).json({
        success: false,
        message: "Lỗi server!",
        error: error.message
    });
};

// GET /api/addresses
// GET /api/addresses?customerId=1
const getAllAddresses = async (req, res) => {
    try {
        let customerId = null;

        if (req.query.customerId !== undefined) {
            customerId = parseId(req.query.customerId);

            if (!customerId) {
                return res.status(400).json({
                    success: false,
                    message: "CustomerID không hợp lệ!"
                });
            }
        }

        const addresses = await addressService.getAllAddresses(customerId);

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách địa chỉ thành công!",
            data: addresses
        });
    } catch (error) {
        return handleDatabaseError(res, error);
    }
};

// GET /api/addresses/:id
const getAddressById = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "AddressID không hợp lệ!"
            });
        }

        const address = await addressService.getAddressById(id);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy địa chỉ!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin địa chỉ thành công!",
            data: address
        });
    } catch (error) {
        return handleDatabaseError(res, error);
    }
};

// GET /api/addresses/customer/:customerId
const getAddressesByCustomerId = async (req, res) => {
    try {
        const customerId = parseId(req.params.customerId);

        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: "CustomerID không hợp lệ!"
            });
        }

        const addresses = await addressService.getAddressesByCustomerId(customerId);

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách địa chỉ của khách hàng thành công!",
            data: addresses
        });
    } catch (error) {
        return handleDatabaseError(res, error);
    }
};

// Kiểm tra dữ liệu địa chỉ
const validateAddress = (body) => {
    const {
        CustomerID,
        RecipientName,
        Phone,
        AddressDetail,
        Ward,
        District,
        Province,
        IsDefault
    } = body;

    const customerId = parseId(CustomerID);

    if (!customerId) {
        return "CustomerID phải là số nguyên dương!";
    }

    if (
        typeof RecipientName !== "string" ||
        !RecipientName.trim() ||
        RecipientName.trim().length > 150
    ) {
        return "RecipientName không được để trống và tối đa 150 ký tự!";
    }

    if (
        typeof Phone !== "string" ||
        !Phone.trim() ||
        Phone.trim().length > 20
    ) {
        return "Phone không được để trống và tối đa 20 ký tự!";
    }

    if (
        typeof AddressDetail !== "string" ||
        !AddressDetail.trim() ||
        AddressDetail.trim().length > 500
    ) {
        return "AddressDetail không được để trống và tối đa 500 ký tự!";
    }

    const optionalFields = [
        { name: "Ward", value: Ward, max: 100 },
        { name: "District", value: District, max: 100 },
        { name: "Province", value: Province, max: 100 }
    ];

    for (const field of optionalFields) {
        if (
            field.value !== undefined &&
            field.value !== null &&
            (typeof field.value !== "string" || field.value.length > field.max)
        ) {
            return `${field.name} không hợp lệ hoặc vượt quá ${field.max} ký tự!`;
        }
    }

    if (
        IsDefault !== undefined &&
        typeof IsDefault !== "boolean" &&
        IsDefault !== 0 &&
        IsDefault !== 1
    ) {
        return "IsDefault phải là true, false, 0 hoặc 1!";
    }

    return null;
};

// POST /api/addresses
const createAddress = async (req, res) => {
    try {
        const validationError = validateAddress(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const addressData = {
            CustomerID: parseId(req.body.CustomerID),
            RecipientName: req.body.RecipientName.trim(),
            Phone: req.body.Phone.trim(),
            AddressDetail: req.body.AddressDetail.trim(),
            Ward: req.body.Ward?.trim() || null,
            District: req.body.District?.trim() || null,
            Province: req.body.Province?.trim() || null,
            IsDefault: req.body.IsDefault === undefined
                ? false
                : Boolean(req.body.IsDefault)
        };

        const address = await addressService.createAddress(addressData);

        return res.status(201).json({
            success: true,
            message: "Tạo địa chỉ thành công!",
            data: address
        });
    } catch (error) {
        return handleDatabaseError(res, error);
    }
};

// PUT /api/addresses/:id
const updateAddress = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "AddressID không hợp lệ!"
            });
        }

        const validationError = validateAddress(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const addressData = {
            CustomerID: parseId(req.body.CustomerID),
            RecipientName: req.body.RecipientName.trim(),
            Phone: req.body.Phone.trim(),
            AddressDetail: req.body.AddressDetail.trim(),
            Ward: req.body.Ward?.trim() || null,
            District: req.body.District?.trim() || null,
            Province: req.body.Province?.trim() || null,
            IsDefault: req.body.IsDefault === undefined
                ? false
                : Boolean(req.body.IsDefault)
        };

        const address = await addressService.updateAddress(id, addressData);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy địa chỉ!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật địa chỉ thành công!",
            data: address
        });
    } catch (error) {
        return handleDatabaseError(res, error);
    }
};

// DELETE /api/addresses/:id
const deleteAddress = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "AddressID không hợp lệ!"
            });
        }

        const deleted = await addressService.deleteAddress(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy địa chỉ!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Xóa địa chỉ thành công!"
        });
    } catch (error) {
        return handleDatabaseError(res, error);
    }
};

module.exports = {
    getAllAddresses,
    getAddressById,
    getAddressesByCustomerId,
    createAddress,
    updateAddress,
    deleteAddress
};
