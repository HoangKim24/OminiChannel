# Omnichannel

Nền tảng thương mại điện tử đa kênh cho ngành nước hoa, gồm backend ASP.NET Core và frontend React/Vite.

## Tổng quan

Omnichannel cung cấp:

1. Quản lý sản phẩm, danh mục, đơn hàng, voucher.
2. Xác thực JWT và phân quyền người dùng/admin.
3. Thanh toán (bao gồm luồng mô phỏng và tích hợp VNPay sandbox).
4. Dashboard quản trị, thống kê, đồng bộ dữ liệu nền.
5. Bộ kiểm thử unit và integration.

## Kiến trúc kỹ thuật

1. Backend: ASP.NET Core 8, EF Core 8, SQL Server.
2. Frontend: React 18, Vite 5, Zustand.
3. Auth: JWT Bearer.
4. Job nền: Hangfire.
5. Test: xUnit, Moq, ASP.NET Core integration testing.

## Cấu trúc thư mục chính

1. Controllers: API endpoints.
2. Services: business logic.
3. Repositories + Infrastructure: truy cập dữ liệu, Unit of Work, DbContext.
4. Models: entity và DTO.
5. frontend: ứng dụng React.
6. Omnichannel.Tests: test project.
7. docs: tài liệu theo từng lab quản lý dự án.

## Yêu cầu môi trường

1. .NET SDK 8.0+
2. Node.js 18+ và npm 9+
3. SQL Server

## Cấu hình local an toàn

Không đặt secret trực tiếp trong source code. Dùng User Secrets hoặc biến môi trường.

Tại thư mục gốc dự án, chạy:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=YOUR_SERVER;Database=Omnichannel;User Id=sa;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
dotnet user-secrets set "Jwt:Key" "REPLACE_WITH_32PLUS_CHAR_SECRET_KEY"
dotnet user-secrets set "Jwt:Issuer" "Omnichannel"
dotnet user-secrets set "Jwt:Audience" "Omnichannel.Client"
dotnet user-secrets set "VNPay:TmnCode" "YOUR_TMN_CODE"
dotnet user-secrets set "VNPay:HashSecret" "YOUR_HASH_SECRET"
dotnet user-secrets set "VNPay:BaseUrl" "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
dotnet user-secrets set "VNPay:ReturnUrl" "https://localhost:7111/api/payment/vnpay-return"
dotnet user-secrets set "Frontend:BaseUrl" "http://localhost:5173"
```

Lưu ý: Jwt:Key là bắt buộc và nên có độ dài ít nhất 32 ký tự.

## Khởi tạo database

```bash
dotnet ef database update
```

Migration hiện tại có seed dữ liệu demo cơ bản (user, category, perfume, kênh bán).

## Cách chạy dự án

### Cách 1: Chạy backend phục vụ luôn frontend đã build sẵn

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\run-dev.ps1
```

Ứng dụng sẽ chạy tại: http://localhost:5285

### Cách 2: Build frontend rồi chạy full stack bằng script

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\build-and-run.ps1
```

Script này sẽ:

1. Cài dependency frontend nếu thiếu.
2. Build frontend và sync vào wwwroot.
3. Chạy backend.

### Cách 3: Dev mode tách backend và frontend (hot reload frontend)

Terminal 1:

```bash
dotnet run --launch-profile http -p:SkipFrontendBuild=true
```

Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server mặc định: http://localhost:5173

## Test và chất lượng

Chạy test .NET:

```bash
dotnet test
```

Lint frontend:

```bash
cd frontend
npm run lint
```

## API docs

Khi backend chạy ở profile http, có thể truy cập Swagger tại endpoint swagger của ứng dụng.

## Tài liệu quản lý dự án

Tham khảo các thư mục trong docs:

1. docs/01_Lab_Initiation
2. docs/02_Lab_Planning
3. docs/03_Lab_Execution
4. docs/04_Lab_Controlling
5. docs/05_Lab_Closing

Ngoài ra có tài liệu tổng hợp tại docs/README.md.

## Một số lỗi thường gặp

1. Lỗi thiếu Jwt:Key khi khởi động: cấu hình lại User Secrets cho Jwt:Key.
2. Frontend không cập nhật khi chạy backend-only: dùng Cách 3 hoặc chạy lại build frontend để sync vào wwwroot.
3. Lỗi lock file khi build trên Windows: dừng tiến trình Omnichannel cũ trước khi chạy lại script.

## Liên hệ

Maintainer: HoangKim24
