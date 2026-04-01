# Omnichannel (.NET 8 + React Vite)

Nền tảng bán hàng đa kênh cho nước hoa, gồm backend ASP.NET Core 8, database SQL Server, frontend React (Vite), thanh toán giả lập + VNPay sandbox, JWT auth, seed data, swagger, unit test và integration test.

## Mục tiêu hiện trạng
1. Chạy được full-stack bằng một lệnh dotnet run.
2. Cấu hình nhạy cảm không nằm trong appsettings tracked by git.
3. Có migration + seed cho môi trường local.
4. Có auth JWT, validation, middleware xử lý lỗi thống nhất.

## Tech Stack
1. Backend: ASP.NET Core 8, EF Core 8, FluentValidation, JWT Bearer.
2. Frontend: React 18, Vite 5, Zustand.
3. Database: SQL Server.
4. Test: xUnit, Moq, ASP.NET Core integration testing.

## Cấu hình bảo mật
Không commit secret vào mã nguồn. Dùng User Secrets hoặc biến môi trường.

### Backend secrets (khuyến nghị cho local)
Chạy tại thư mục gốc:

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

### Env templates
1. Sao chép file mẫu backend: .env.example
2. Sao chép file mẫu frontend: frontend/.env.example

## Khởi tạo database

```bash
dotnet ef database update
```

Migration đã seed dữ liệu demo:
1. User admin và user demo.
2. Categories.
3. Perfumes demo.
4. Sales channels demo.

Tài khoản seed mặc định:
1. Username: admin
2. Password: password

## Chạy ứng dụng

### Cách 1: Chạy full-stack bằng dotnet run

```bash
dotnet run --launch-profile http
```

Ứng dụng sẽ chạy tại:
1. http://localhost:5285/

Lưu ý: project đã cấu hình tự build và sync frontend vào wwwroot trước khi build backend, nên dotnet run là đủ để lên UI mới nhất.

### Cách 2: Dev frontend hot-reload
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

## Scripts hữu ích

### Backend
```bash
dotnet build
dotnet test
dotnet ef database update
```

### Frontend
```bash
cd frontend
npm install
npm run dev
npm run build
npm run build:sync
```

## API và tài liệu
1. Swagger: /swagger (môi trường Development).
2. Postman collection: postman/Omnichannel.postman_collection.json

Sau khi login, lấy accessToken để truyền header:

```text
Authorization: Bearer <token>
```

## Kiến trúc thư mục chính
```text
Omnichannel/
|- Controllers/
|- Infrastructure/
|- Migrations/
|- Models/
|- Repositories/
|- Services/
|- Validators/
|- Middleware/
|- Omnichannel.Tests/
|- frontend/
|- wwwroot/
```

## Troubleshooting nhanh
1. Lỗi address already in use ở port 5285: tắt process cũ đang chiếm cổng.
2. Lỗi DB connection: kiểm tra lại User Secrets ConnectionStrings:DefaultConnection.
3. Không thấy UI mới khi chạy backend: chạy lại dotnet run hoặc npm run build:sync.
