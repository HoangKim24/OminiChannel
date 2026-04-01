# OmniChannel - Software Project Management & Perfume Store Platform

Nền tảng bán hàng đa kênh cho nước hoa, gồm backend ASP.NET Core 8, database SQL Server, frontend React (Vite), thanh toán giả lập + VNPay sandbox, JWT auth, seed data, swagger, unit test và integration test.

---

## 📌 Tổng Quan Dự Án (Project Management)

Đây là dự án **toàn bộ quy trình quản lý dự án phần mềm** chia thành **5 Labs** tương ứng với 5 giai đoạn của dự án:

1. **Lab 1: Project Initiating** - Khởi động & xác định dự án
2. **Lab 2: Project Planning** - Lên kế hoạch chi tiết
3. **Lab 3: Project Executing** - Thực hiện dự án
4. **Lab 4: Project Controlling** - Theo dõi & kiểm soát
5. **Lab 5: Project Closing** - Đóng dự án & rút kinh nghiệm

---

## 🚀 Technical Implementation (Hướng dẫn kỹ thuật)

### Tech Stack
1. **Backend**: ASP.NET Core 8, EF Core 8, FluentValidation, JWT Bearer.
2. **Frontend**: React 18, Vite 5, Zustand.
3. **Database**: SQL Server.
4. **Test**: xUnit, Moq, ASP.NET Core integration testing.

### Cấu hình bảo mật
Không commit secret vào mã nguồn. Dùng User Secrets hoặc biến môi trường.

#### Backend secrets (khuyến nghị cho local)
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

### Khởi tạo database

```bash
dotnet ef database update
```

Migration đã seed dữ liệu demo:
1. User admin và user demo.
2. Categories.
3. Perfumes demo.
4. Sales channels demo.

### Chạy ứng dụng

#### Cách 1: Chạy full-stack bằng dotnet run

```bash
dotnet run --launch-profile http
```

Hoặc trên Windows dùng script ổn định:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\run-backend.ps1
```

#### Cách 2: Dev frontend hot-reload
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

---

## 📊 Lab Management Details

### 📊 Lab 1: Project Initiating
**Thời gian**: Tuần 1-2 | **Trạng thái**: 📋 In Progress | **Due Date**: 2026-03-31

- [📄 Stakeholder Analysis](./docs/01_Lab_Initiation/Stakeholders.md)
- [📄 SOW](./docs/01_Lab_Initiation/SOW.md)
- [📄 Risk Management](./docs/01_Lab_Initiation/Risks.md)

### 📋 Lab 2: Project Planning
**Thời gian**: Tuần 3-4 | **Trạng thái**: ⚪ Not Started | **Due Date**: 2026-04-14

- [📄 WBS](./docs/02_Lab_Planning/WBS.md)
- [📄 Schedule](./docs/02_Lab_Planning/Schedule.md)
- [📄 Budget](./docs/02_Lab_Planning/Budget.md)

### 🔨 Lab 3: Project Execution
**Thời gian**: Tuần 5-12 | **Trạng thái**: ⚪ Not Started | **Due Date**: 2026-05-05

- [📄 Change Control](./docs/03_Lab_Execution/Change_Control.md)
- [📄 QA/QC Plan](./docs/03_Lab_Execution/QA_QC_Plan.md)

### 🏁 Lab 5: Project Closing
**Thời gian**: Tuần 16 | **Trạng thái**: ⚪ Not Started | **Due Date**: 2026-06-02

---

## 📈 Dashboard & Status

| Lab | Status | Completion | Issues | Due Date |
|-----|--------|-----------|--------|----------|
| Lab 1 - Initiating | 📋 In Progress | 20% | 6 | 2026-03-31 |
| Lab 2 - Planning | ⚪ Not Started | 0% | 6 | 2026-04-14 |
| Lab 3 - Execution | ⚪ Not Started | 0% | 5 | 2026-05-05 |
| Lab 4 - Controlling | ⚪ Not Started | 0% | 3 | 2026-05-19 |
| Lab 5 - Closing | ⚪ Not Started | 0% | 4 | 2026-06-02 |
| **TOTAL** | **📋 In Progress** | **4%** | **24** | **2026-06-02** |

---

## 👥 Team

| Role | Name | GitHub | Email |
|------|------|--------|-------|
| Project Manager | HoangKim24 | [HoangKim24](https://github.com/HoangKim24) | [email] |

---

**Last Updated**: 2026-04-01
