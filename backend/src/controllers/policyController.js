
const policyService = require("../services/policyService");

// GET all policies
const getAllPolicies = async (req, res) => {
    try {
        const filters = {};

        if (req.query.policyType !== undefined) {
            filters.policyType = req.query.policyType;
        }

        if (req.query.isActive !== undefined) {
            if (req.query.isActive !== "0" &&
                req.query.isActive !== "1") {
                return res.status(400).json({
                    success: false,
                    message: "isActive chỉ được nhận giá trị 0 hoặc 1!"
                });
            }

            filters.isActive = req.query.isActive === "1";
        }

        const policies = await policyService.getAllPolicies(filters);

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách chính sách thành công!",
            data: policies
        });

    } catch (error) {
        console.error("Get all policies error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi lấy danh sách chính sách!"
        });
    }
};

// GET policy by ID
const getPolicyById = async (req, res) => {
    try {
        const policyId = Number(req.params.id);

        if (!Number.isInteger(policyId) || policyId <= 0) {
            return res.status(400).json({
                success: false,
                message: "PolicyID phải là số nguyên dương!"
            });
        }

        const policy = await policyService.getPolicyById(policyId);

        if (!policy) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy chính sách!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin chính sách thành công!",
            data: policy
        });

    } catch (error) {
        console.error("Get policy error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi lấy thông tin chính sách!"
        });
    }
};

// POST create policy
const createPolicy = async (req, res) => {
    try {
        const { PolicyType, Title, Content } = req.body;

        if (typeof PolicyType !== "string" ||
            !PolicyType.trim() ||
            PolicyType.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: "PolicyType không được để trống và tối đa 50 ký tự!"
            });
        }

        if (typeof Title !== "string" ||
            !Title.trim() ||
            Title.trim().length > 200) {
            return res.status(400).json({
                success: false,
                message: "Title không được để trống và tối đa 200 ký tự!"
            });
        }

        if (typeof Content !== "string" ||
            !Content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Content không được để trống!"
            });
        }

        const policy = await policyService.createPolicy({
            PolicyType: PolicyType.trim(),
            Title: Title.trim(),
            Content: Content.trim()
        });

        return res.status(201).json({
            success: true,
            message: "Tạo chính sách thành công!",
            data: policy
        });

    } catch (error) {
        console.error("Create policy error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi tạo chính sách!"
        });
    }
};

// PUT update policy
const updatePolicy = async (req, res) => {
    try {
        const policyId = Number(req.params.id);

        if (!Number.isInteger(policyId) || policyId <= 0) {
            return res.status(400).json({
                success: false,
                message: "PolicyID phải là số nguyên dương!"
            });
        }

        const { PolicyType, Title, Content, IsActive } = req.body;

        if (typeof PolicyType !== "string" ||
            !PolicyType.trim() ||
            PolicyType.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: "PolicyType không được để trống và tối đa 50 ký tự!"
            });
        }

        if (typeof Title !== "string" ||
            !Title.trim() ||
            Title.trim().length > 200) {
            return res.status(400).json({
                success: false,
                message: "Title không được để trống và tối đa 200 ký tự!"
            });
        }

        if (typeof Content !== "string" ||
            !Content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Content không được để trống!"
            });
        }

        if (IsActive !== true && IsActive !== false &&
            IsActive !== 0 && IsActive !== 1) {
            return res.status(400).json({
                success: false,
                message: "IsActive chỉ được nhận boolean hoặc 0/1!"
            });
        }

        const policy = await policyService.updatePolicy(policyId, {
            PolicyType: PolicyType.trim(),
            Title: Title.trim(),
            Content: Content.trim(),
            IsActive: IsActive === true || IsActive === 1
        });

        if (!policy) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy chính sách!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật chính sách thành công!",
            data: policy
        });

    } catch (error) {
        console.error("Update policy error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi cập nhật chính sách!"
        });
    }
};

// DELETE soft delete policy
const deletePolicy = async (req, res) => {
    try {
        const policyId = Number(req.params.id);

        if (!Number.isInteger(policyId) || policyId <= 0) {
            return res.status(400).json({
                success: false,
                message: "PolicyID phải là số nguyên dương!"
            });
        }

        const policy = await policyService.deletePolicy(policyId);

        if (!policy) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy chính sách hoặc chính sách đã bị vô hiệu hóa!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Vô hiệu hóa chính sách thành công!",
            data: policy
        });

    } catch (error) {
        console.error("Delete policy error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi vô hiệu hóa chính sách!"
        });
    }
};

module.exports = {
    getAllPolicies,
    getPolicyById,
    createPolicy,
    updatePolicy,
    deletePolicy
};
