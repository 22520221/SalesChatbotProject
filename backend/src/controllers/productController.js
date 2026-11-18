
const productService = require("../services/productService");

// Kiểm tra ProductID trên URL
const parseProductId = (id) => {
    const productId = Number(id);

    if (!Number.isSafeInteger(productId) || productId <= 0) {
        return null;
    }

    return productId;
};

// Chuyển đổi giá trị boolean từ query string
const parseBoolean = (value) => {
    if (value === undefined) return null;
    if (value === "true" || value === "1") return true;
    if (value === "false" || value === "0") return false;
    return undefined;
};

// Kiểm tra dữ liệu sản phẩm
const validateProduct = (data) => {
    const { CategoryID, ProductName, Price, StockQuantity } = data;

    if (
        CategoryID === undefined ||
        !Number.isSafeInteger(Number(CategoryID)) ||
        Number(CategoryID) <= 0
    ) {
        return "CategoryID phải là số nguyên dương!";
    }

    if (
        typeof ProductName !== "string" ||
        ProductName.trim().length === 0
    ) {
        return "ProductName không được để trống!";
    }

    if (ProductName.trim().length > 200) {
        return "ProductName không được vượt quá 200 ký tự!";
    }

    if (
        Price === undefined ||
        Price === null ||
        Price === "" ||
        !Number.isFinite(Number(Price)) ||
        Number(Price) < 0 ||
        !/^\d+(\.\d{1,2})?$/.test(String(Price))
    ) {
        return "Price phải là số không âm và tối đa 2 chữ số thập phân!";
    }

    if (
        StockQuantity === undefined ||
        !Number.isSafeInteger(Number(StockQuantity)) ||
        Number(StockQuantity) < 0
    ) {
        return "StockQuantity phải là số nguyên không âm!";
    }

    if (
        data.Description !== undefined &&
        data.Description !== null &&
        typeof data.Description !== "string"
    ) {
        return "Description phải là chuỗi hoặc null!";
    }

    if (
        data.ImageURL !== undefined &&
        data.ImageURL !== null &&
        typeof data.ImageURL !== "string"
    ) {
        return "ImageURL phải là chuỗi hoặc null!";
    }

    if (
        typeof data.ImageURL === "string" &&
        data.ImageURL.length > 500
    ) {
        return "ImageURL không được vượt quá 500 ký tự!";
    }

    if (
        data.IsActive !== undefined &&
        typeof data.IsActive !== "boolean"
    ) {
        return "IsActive phải có giá trị true hoặc false!";
    }

    return null;
};

// 1. Lấy danh sách sản phẩm
const getAllProducts = async (req, res) => {
    try {
        const { search, categoryId, isActive } = req.query;

        if (search !== undefined && search.length > 200) {
            return res.status(400).json({
                success: false,
                message: "Từ khóa tìm kiếm không được vượt quá 200 ký tự!"
            });
        }

        let parsedCategoryId = null;

        if (categoryId !== undefined) {
            parsedCategoryId = Number(categoryId);

            if (
                !Number.isSafeInteger(parsedCategoryId) ||
                parsedCategoryId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "categoryId phải là số nguyên dương!"
                });
            }
        }

        const parsedIsActive = parseBoolean(isActive);

        if (parsedIsActive === undefined) {
            return res.status(400).json({
                success: false,
                message: "isActive chỉ nhận true, false, 1 hoặc 0!"
            });
        }

        const products = await productService.getAllProducts({
            search: search?.trim() || null,
            categoryId: parsedCategoryId,
            isActive: parsedIsActive
        });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách sản phẩm thành công!",
            data: products
        });
    } catch (error) {
        console.error("getAllProducts error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách sản phẩm!"
        });
    }
};

// 2. Lấy sản phẩm theo ID
const getProductById = async (req, res) => {
    try {
        const id = parseProductId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ProductID không hợp lệ!"
            });
        }

        const product = await productService.getProductById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin sản phẩm thành công!",
            data: product
        });
    } catch (error) {
        console.error("getProductById error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thông tin sản phẩm!"
        });
    }
};

// 3. Thêm sản phẩm
const createProduct = async (req, res) => {
    try {
        const validationError = validateProduct(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const productData = {
            ...req.body,
            CategoryID: Number(req.body.CategoryID),
            ProductName: req.body.ProductName.trim(),
            Price: Number(req.body.Price),
            StockQuantity: Number(req.body.StockQuantity),
            Description: req.body.Description?.trim() || null,
            ImageURL: req.body.ImageURL?.trim() || null
        };

        const product = await productService.createProduct(productData);

        return res.status(201).json({
            success: true,
            message: "Thêm sản phẩm thành công!",
            data: product
        });
    } catch (error) {
        console.error("createProduct error:", error);

        if (error.number === 547) {
            return res.status(400).json({
                success: false,
                message: "CategoryID không tồn tại!"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi thêm sản phẩm!"
        });
    }
};

// 4. Cập nhật sản phẩm
const updateProduct = async (req, res) => {
    try {
        const id = parseProductId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ProductID không hợp lệ!"
            });
        }

        const validationError = validateProduct(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const productData = {
            ...req.body,
            CategoryID: Number(req.body.CategoryID),
            ProductName: req.body.ProductName.trim(),
            Price: Number(req.body.Price),
            StockQuantity: Number(req.body.StockQuantity),
            Description: req.body.Description?.trim() || null,
            ImageURL: req.body.ImageURL?.trim() || null,
            IsActive: req.body.IsActive ?? true
        };

        const product = await productService.updateProduct(id, productData);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm cần cập nhật!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật sản phẩm thành công!",
            data: product
        });
    } catch (error) {
        console.error("updateProduct error:", error);

        if (error.number === 547) {
            return res.status(400).json({
                success: false,
                message: "CategoryID không tồn tại!"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật sản phẩm!"
        });
    }
};

// 5. Xóa mềm sản phẩm
const deleteProduct = async (req, res) => {
    try {
        const id = parseProductId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ProductID không hợp lệ!"
            });
        }

        const deleted = await productService.deleteProduct(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm cần xóa!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Ngừng kinh doanh sản phẩm thành công!"
        });
    } catch (error) {
        console.error("deleteProduct error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa sản phẩm!"
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
