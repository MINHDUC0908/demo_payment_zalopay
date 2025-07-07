# 💳 Demo Payment - ZaloPay & MoMo (ExpressJS)

Dự án Node.js sử dụng Express để tích hợp thanh toán với **ZaloPay** và **MoMo**.

---

## 📁 Cấu trúc thư mục

```bash
demo-payment/
├── zalo/
│   └── server.js               # Xử lý thanh toán với ZaloPay
├── momo/
│   └── server.js               # Xử lý thanh toán với MoMo
├── config.js                   # File config cho MoMo (nếu có)
├── package.json
└── README.md
## 🚀 Cài đặt

```bash
npm install
▶️ Khởi chạy server
🔹 ZaloPay
bash
Sao chép
Chỉnh sửa
node zalo/server.js
🌐 Server ZaloPay chạy tại: http://localhost:8888
🔹 MoMo
bash
Sao chép
Chỉnh sửa
node momo/server.js
🌐 Server MoMo chạy tại: http://localhost:5000
