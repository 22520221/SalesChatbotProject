
# SalesChatbotProject

Website bán hàng tích hợp Chatbot Facebook Messenger.

## 1. Công nghệ sử dụng

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: Microsoft SQL Server
- Chatbot: Facebook Messenger Platform
- API: RESTful API

## 2. Cấu trúc dự án

```text
SalesChatbotProject/
├── backend/
│   ├── src/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
└── README.md
```

## 3. Khởi chạy Backend

Di chuyển vào thư mục backend:

```bash
cd backend
```

Cài đặt dependencies:

```bash
npm install
```

Tạo file `.env` dựa trên `.env.example` và điền thông tin SQL Server.

Khởi chạy:

```bash
npm run dev
```

## 4. API kiểm tra

- GET /api/health
- GET /api/health/db

## 5. Database

Database: SalesChatbotDB

Hệ quản trị: Microsoft SQL Server

## 6. Tiến độ dự án

- [x] Thiết kế Database
- [x] Khởi tạo Backend Node.js + Express
- [x] Kết nối SQL Server
- [x] Xây dựng Categories API
- [x] Xây dựng Products API
- [x] Xây dựng Customers API
- [x] Xây dựng Addresses API
- [ ] Xây dựng Orders API
- [ ] Xây dựng Website React
- [ ] Xây dựng Admin Dashboard
- [ ] Chatbot Messenger mô phỏng
- [ ] Tích hợp Messenger thật
