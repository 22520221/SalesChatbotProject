
const categoryService = require("../services/categoryService");

// =====================================
// VALIDATE CATEGORY ID
// =====================================

const parseCategoryId = (value) => {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return null;
    }

    return id;
};

// =====================================
// GET ALL CATEGORIES
// =====================================

const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();

        return res.status(200).json({
            success: true,
            message: "Get categories successfully!",
            data: categories
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
};

// =====================================
// GET CATEGORY BY ID
// =====================================

const getCategoryById = async (req, res) => {
    try {
        const id = parseCategoryId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID!"
            });
        }

        const category = await categoryService.getCategoryById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Get category successfully!",
            data: category
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
};

// =====================================
// CREATE CATEGORY
// =====================================

const createCategory = async (req, res) => {
    try {
        const { CategoryName, Description } = req.body || {};

        if (
            typeof CategoryName !== "string" ||
            CategoryName.trim().length === 0 ||
            CategoryName.trim().length > 150
        ) {
            return res.status(400).json({
                success: false,
                message: "CategoryName is required and must not exceed 150 characters!"
            });
        }

        if (
            Description !== undefined &&
            Description !== null &&
            typeof Description !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Description must be a string or null!"
            });
        }

        try {
            const category = await categoryService.createCategory({
                CategoryName: CategoryName.trim(),
                Description: Description?.trim() || null
            });

            return res.status(201).json({
                success: true,
                message: "Category created successfully!",
                data: category
            });

        } catch (error) {
            if (error.number === 2601 || error.number === 2627) {
                return res.status(409).json({
                    success: false,
                    message: "Category name already exists!"
                });
            }

            throw error;
        }

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
};

// =====================================
// UPDATE CATEGORY
// =====================================

const updateCategory = async (req, res) => {
    try {
        const id = parseCategoryId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID!"
            });
        }

        const { CategoryName, Description, IsActive } = req.body || {};

        if (
            typeof CategoryName !== "string" ||
            CategoryName.trim().length === 0 ||
            CategoryName.trim().length > 150
        ) {
            return res.status(400).json({
                success: false,
                message: "CategoryName is required and must not exceed 150 characters!"
            });
        }

        if (
            Description !== undefined &&
            Description !== null &&
            typeof Description !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Description must be a string or null!"
            });
        }

        if (
            IsActive !== undefined &&
            typeof IsActive !== "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message: "IsActive must be a boolean!"
            });
        }

        const category = await categoryService.updateCategory(id, {
            CategoryName: CategoryName.trim(),
            Description: Description?.trim() || null,
            IsActive: IsActive ?? true
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category updated successfully!",
            data: category
        });

    } catch (error) {
        if (error.number === 2601 || error.number === 2627) {
            return res.status(409).json({
                success: false,
                message: "Category name already exists!"
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
};

// =====================================
// DELETE CATEGORY
// =====================================

const deleteCategory = async (req, res) => {
    try {
        const id = parseCategoryId(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID!"
            });
        }

        const result = await categoryService.deleteCategory(id);

        if (result.notFound) {
            return res.status(404).json({
                success: false,
                message: "Category not found!"
            });
        }

        if (result.hasProducts) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete category because it has products!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully!"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
};

// =====================================
// EXPORT
// =====================================

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
