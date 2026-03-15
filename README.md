# KP Luxury Perfume - Omnichannel Platform

Trang web bán hàng đa kênh cao cấp cho thương hiệu nước hoa **KP Luxury**. Dự án kết hợp giữa kiến trúc backend mạnh mẽ (áp dụng 10 Design Patterns) và giao diện frontend sang trọng, mang lại trải nghiệm mua sắm đẳng cấp.

## 🚀 Tính năng nổi bật

-   **Giao diện Luxury Dark Mode**: Thiết kế sang trọng với tông màu Vàng kim (Gold) và Đen (Black), tối ưu trải nghiệm thị giác cho dòng sản phẩm cao cấp.
-   **Trải nghiệm Đa kênh (Omnichannel)**: 
    -   Đồng bộ hóa sản phẩm và đơn hàng giữa Website, Shopee, TikTok và Lazada.
    -   **In-store Pickup**: Lựa chọn nhận hàng trực tiếp tại cửa hàng giúp khách hàng tiết kiệm thời gian và phí vận chuyển.
-   **Chi tiết Sản phẩm Chuyên sâu**: 
    -   Thông tin đầy đủ về Tầng hương (Top, Middle, Base notes), Xuất xứ, Nồng độ và Câu chuyện thương hiệu.
    -   Chọn dung tích (ML) linh hoạt với giá cập nhật theo thời gian thực.
-   **Hệ thống Đánh giá (Reviews)**: Phần bình luận và đánh giá sao được lưu trữ bền vững tại backend, giúp tăng độ tin cậy cho sản phẩm.
-   **Thông báo Toast**: Hệ thống thông báo tinh tế thay thế cho các alert mặc định, mang lại cảm giác mượt mà.

## 🛠 Công nghệ sử dụng

-   **Backend**: ASP.NET Core Web API 8.0 (C#)
-   **Database**: SQL Server (với Entity Framework Core)
-   **Frontend**: React.js 18 + Vite
-   **Styling**: Vanilla CSS (Custom Glassmorphism & Jewelry Theme)
-   **API**: RESTful API với tích hợp Swagger để kiểm thử.

## 🏗 10 Design Patterns đã áp dụng

Hệ thống được xây dựng dựa trên các nguyên lý kiến trúc phần mềm hiện đại để đảm bảo sự linh hoạt:

1.  **Repository Pattern**: Tách biệt logic truy cập dữ liệu thông qua các interface.
2.  **Unit of Work**: Đảm bảo tính nhất quán của dữ liệu (Transaction) khi thực hiện nhiều thao tác cùng lúc.
3.  **Dependency Injection**: Tăng cường khả năng kiểm thử và bảo trì hệ thống.
4.  **Facade Pattern**: Đơn giản hóa các quy trình phức tạp thông qua lớp `OrderFacade`.
5.  **Strategy Pattern**: Xử lý linh hoạt các phương thức thanh toán (Credit Card, COD, etc.).
6.  **Decorator Pattern**: Tính toán giá sản phẩm động (Cộng thêm thuế, áp dụng giảm giá).
7.  **Adapter Pattern**: Chuẩn hóa dữ liệu từ các nền tảng khác nhau (Shopee, TikTok, Lazada) về hệ thống chung.
8.  **Observer Pattern**: Tự động thông báo và đồng bộ hóa tồn kho khi có sự thay đổi.
9.  **Factory Method**: Khởi tạo sản phẩm theo phân loại chuẩn xác (`PerfumeFactory`).
10. **Singleton Pattern**: Quản lý cấu hình toàn cục và cài đặt thương hiệu một cách duy nhất.

## 📁 Cấu trúc thư mục

```text
Omnichannel/
├── Controllers/       # Các API Endpoints (Perfumes, Orders, Comments...)
├── Infrastructure/    # Triển khai DbContext, Unit of Work, Security Proxy
├── Models/            # Các thực thể (Entity) và DTOs
├── Repositories/      # Logic truy xuất dữ liệu (Sql repositories)
├── Services/          # Implement các Design Patterns (Facade, Adapter...)
├── frontend/          # Mã nguồn React UI (Vite)
│   ├── src/           # Components, Logic và Styles (CSS Modular)
│   └── public/        # Tài nguyên tĩnh
└── Program.cs         # Cấu hình Services và Pipeline
```

## ⚙️ Hướng dẫn cài đặt

### 1. Chạy Backend
- Mở file `Omnichannel.sln` bằng Visual Studio.
- Đảm bảo database đã được khởi tạo (có thể chạy script `omnichannel_tables.sql` nếu cần).
- Nhấn **F5** để chạy API. Cổng mặc định thường là `http://localhost:5285`.

### 2. Chạy Frontend
- Di chuyển vào thư mục frontend: `cd frontend`
- Cài đặt thư viện: `npm install`
- Chạy ứng dụng: `npm run dev`
- Truy cập: `http://localhost:5173`

## 📞 Liên hệ
**KP Luxury Perfume** - *Tinh hoa nghệ thuật mùi hương vượt thời gian.*
