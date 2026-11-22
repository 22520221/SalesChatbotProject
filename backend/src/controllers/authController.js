
const authService = require("../services/authService");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate Email
        if (
            !email ||
            typeof email !== "string" ||
            !email.trim() ||
            email.length > 150
        ) {
            return res.status(400).json({
                success: false,
                message: "Email không được để trống và tối đa 150 ký tự!"
            });
        }

        // Validate Password
        if (
            !password ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Password không được để trống!"
            });
        }

        const result = await authService.login(
            email.trim(),
            password
        );

        return res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            data: result
        });

    } catch (error) {
        if (error.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng!"
            });
        }

        if (error.message === "ACCOUNT_DISABLED") {
            return res.status(403).json({
                success: false,
                message: "Tài khoản đã bị vô hiệu hóa!"
            });
        }

        if (error.message === "JWT_SECRET_MISSING") {
            return res.status(500).json({
                success: false,
                message: "Chưa cấu hình JWT_SECRET!"
            });
        }

        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi đăng nhập!"
        });
    }
};

const getMe = async (req, res) => {
    try {
        const admin = await authService.getAdminById(
            req.admin.adminId
        );

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tài khoản Admin!"
            });
        }

        if (!admin.IsActive) {
            return res.status(403).json({
                success: false,
                message: "Tài khoản đã bị vô hiệu hóa!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin Admin thành công!",
            data: admin
        });

    } catch (error) {
        console.error("Get admin error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi lấy thông tin Admin!"
        });
    }
};

module.exports = {
    login,
    getMe
};
