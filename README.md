# KP Luxury Perfume - Omnichannel Platform (v2.0)

Trang web bán hàng đa kênh cao cấp cho thương hiệu nước hoa **KP Luxury**. Dự án kết hợp giữa kiến trúc backend mạnh mẽ (áp dụng 10 Design Patterns) và giao diện quản trị chuyên nghiệp, mang lại trải nghiệm vận hành và mua sắm đẳng cấp.

---

## 🎨 Giao diện & Trải nghiệm

### 1. Luxury Storefront (Dành cho khách hàng)
- **Thiết kế Luxury Dark Mode**: Tông màu Vàng kim (Gold) và Đen (Black) sang trọng.
- **Trải nghiệm mua sắm mượt mà**: 
  - Hiệu ứng Glassmorphism hiện đại.
  - Fragrance Finder: Công cụ tìm kiếm mùi hương phù hợp.
  - In-store Pickup: Đặt hàng nhận tại showroom nhanh chóng.
- **Chi tiết sản phẩm trực quan**: Hiển thị tháp tầng hương (Top/Middle/Base notes) sống động.

### 2. Professional Admin Dashboard (Dành cho quản trị)
- **Bố cục Grid-based chuẩn**: Sidebar cố định bên trái, tách biệt hoàn toàn với không gian làm việc.
- **9 Module quản trị cốt lõi**:
  - **Dashboard**: Tổng quan doanh thu, đơn hàng và biểu đồ xu hướng.
  - **Sản phẩm (Product)**: Quản lý thuộc tính cao cấp (nhóm mùi, dung tích, tầng hương).
  - **Đơn hàng (Order)**: Quy trình xử lý đơn hàng đa trạng thái.
  - **Kho hàng (Inventory)**: Theo dõi tồn kho đa chi nhánh.
  - **Khách hàng (CRM)**: Quản lý hồ sơ và lịch sử mua sắm.
  - **Marketing, CMS, RBAC, Settings**: Các module bổ trợ chuyên sâu.

---

## 🏗 Kiến trúc & Công nghệ

### Tech Stack
-   **Backend**: ASP.NET Core 8.0, Entity Framework Core.
-   **Database**: SQL Server (Schema đã tối ưu cho Omnichannel).
-   **Frontend**: React.js 18 (Vite), Vanilla CSS (Modern Luxury UI).

### 10 Design Patterns đã áp dụng
1.  **Repository Pattern**: Tách biệt logic truy cập dữ liệu.
2.  **Unit of Work**: Quản lý Transaction dữ liệu nhất quán.
3.  **Dependency Injection**: Linh hoạt trong việc mở rộng và bảo trì.
4.  **Facade Pattern**: Đơn giản hóa quy trình đặt hàng phức tạp.
5.  **Strategy Pattern**: Tùy biến linh hoạt phương thức thanh toán.
6.  **Decorator Pattern**: Tính toán giá động và khuyến mãi.
7.  **Adapter Pattern**: Chuẩn hóa dữ liệu từ Shopee, Lazada... về hệ thống.
8.  **Observer Pattern**: Tự động đồng bộ tồn kho thời gian thực.
9.  **Factory Method**: Khởi tạo thực thể sản phẩm chuẩn xác.
10. **Singleton Pattern**: Quản lý cấu hình thương hiệu duy nhất.

---

## ⚙️ Hướng dẫn khởi chạy

Dự án đã được cấu hình để chạy đồng nhất trên một cổng duy nhất thông qua ASP.NET Core Static Files.

### 1. Cấu hình Database
- Đảm bảo SQL Server đang chạy.
- Chạy script `sample_data.sql` để khởi tạo dữ liệu mẫu và schema cần thiết.

### 2. Khởi chạy hệ thống
Mở terminal tại thư mục gốc và chạy:
```bash
dotnet run
```
Hệ thống sẽ khả dụng tại:
- **Trang bán hàng**: `http://localhost:5285/`
- **Trang Quản trị (Admin)**: `http://localhost:5285/Admin`

Neu thay doi frontend, chay nhanh 1 lenh trong thu muc `frontend`:
```bash
npm run build:sync
```
Lenh nay se build Vite va tu dong dong bo file moi sang `wwwroot`.

---

## 📁 Cấu trúc thư mục chính
```text
Omnichannel/
├── Controllers/       # API Endpoints (Perfumes, Orders, Statistics...)
├── Infrastructure/    # DbContext, UnitOfWork, Identity.
├── Models/            # Entity Framework Models & DTOs.
├── Repositories/      # Data Access Layer (Sql Repositories).
├── Services/          # Business Logic (Design Patterns implementations).
├── wwwroot/           # Production Build của Frontend (đã deploy).
└── frontend/          # Mã nguồn React UI (Vite dev environment).
```

---
**KP Luxury Perfume** - *Nâng tầm đẳng cấp vận hành đa kênh.*
