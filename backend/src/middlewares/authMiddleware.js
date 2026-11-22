
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Vui lòng cung cấp JWT Token!"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.admin = {
            adminId: decoded.adminId,
            role: decoded.role
        };

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "JWT Token không hợp lệ hoặc đã hết hạn!"
        });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (!req.admin || req.admin.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Bạn không có quyền truy cập chức năng này!"
        });
    }

    next();
};

module.exports = {
    verifyToken,
    authorizeAdmin
};
