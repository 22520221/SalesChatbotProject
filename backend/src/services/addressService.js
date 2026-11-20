
const { sql, connectDB } = require("../config/database");

// Lấy danh sách địa chỉ
const getAllAddresses = async (customerId = null) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("customerId", sql.Int, customerId)
        .query(`
            SELECT
                AddressID,
                CustomerID,
                RecipientName,
                Phone,
                AddressDetail,
                Ward,
                District,
                Province,
                IsDefault
            FROM Addresses
            WHERE @customerId IS NULL
                OR CustomerID = @customerId
            ORDER BY AddressID DESC
        `);

    return result.recordset;
};

// Lấy địa chỉ theo ID
const getAddressById = async (id) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            SELECT
                AddressID,
                CustomerID,
                RecipientName,
                Phone,
                AddressDetail,
                Ward,
                District,
                Province,
                IsDefault
            FROM Addresses
            WHERE AddressID = @id
        `);

    return result.recordset[0] || null;
};

// Lấy danh sách địa chỉ theo khách hàng
const getAddressesByCustomerId = async (customerId) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("customerId", sql.Int, customerId)
        .query(`
            SELECT
                AddressID,
                CustomerID,
                RecipientName,
                Phone,
                AddressDetail,
                Ward,
                District,
                Province,
                IsDefault
            FROM Addresses
            WHERE CustomerID = @customerId
            ORDER BY IsDefault DESC, AddressID DESC
        `);

    return result.recordset;
};

// Tạo địa chỉ mới
const createAddress = async (addressData) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("customerId", sql.Int, addressData.CustomerID)
        .input("recipientName", sql.NVarChar(150), addressData.RecipientName)
        .input("phone", sql.NVarChar(20), addressData.Phone)
        .input("addressDetail", sql.NVarChar(500), addressData.AddressDetail)
        .input("ward", sql.NVarChar(100), addressData.Ward)
        .input("district", sql.NVarChar(100), addressData.District)
        .input("province", sql.NVarChar(100), addressData.Province)
        .input("isDefault", sql.Bit, addressData.IsDefault)
        .query(`
            INSERT INTO Addresses (
                CustomerID,
                RecipientName,
                Phone,
                AddressDetail,
                Ward,
                District,
                Province,
                IsDefault
            )
            OUTPUT INSERTED.AddressID
            VALUES (
                @customerId,
                @recipientName,
                @phone,
                @addressDetail,
                @ward,
                @district,
                @province,
                @isDefault
            )
        `);

    return await getAddressById(result.recordset[0].AddressID);
};

// Cập nhật địa chỉ
const updateAddress = async (id, addressData) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id", sql.Int, id)
        .input("customerId", sql.Int, addressData.CustomerID)
        .input("recipientName", sql.NVarChar(150), addressData.RecipientName)
        .input("phone", sql.NVarChar(20), addressData.Phone)
        .input("addressDetail", sql.NVarChar(500), addressData.AddressDetail)
        .input("ward", sql.NVarChar(100), addressData.Ward)
        .input("district", sql.NVarChar(100), addressData.District)
        .input("province", sql.NVarChar(100), addressData.Province)
        .input("isDefault", sql.Bit, addressData.IsDefault)
        .query(`
            UPDATE Addresses
            SET
                CustomerID = @customerId,
                RecipientName = @recipientName,
                Phone = @phone,
                AddressDetail = @addressDetail,
                Ward = @ward,
                District = @district,
                Province = @province,
                IsDefault = @isDefault
            WHERE AddressID = @id
        `);

    if (result.rowsAffected[0] === 0) {
        return null;
    }

    return await getAddressById(id);
};

// Xóa địa chỉ
const deleteAddress = async (id) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            DELETE FROM Addresses
            WHERE AddressID = @id
        `);

    return result.rowsAffected[0] > 0;
};

module.exports = {
    getAllAddresses,
    getAddressById,
    getAddressesByCustomerId,
    createAddress,
    updateAddress,
    deleteAddress
};
