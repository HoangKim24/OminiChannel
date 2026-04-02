# Mapping 10 Design Pattern - Omnichannel

Tai lieu nay tong hop 10 Design Pattern dang co trong du an, kem bang chung code va endpoint lien quan de phuc vu bao cao/cham diem.

## 1) Repository Pattern
- Muc tieu: Tach data access ra khoi business logic.
- Bang chung code:
  - `Repositories/IRepository.cs`
  - `Repositories/SqlPerfumeRepository.cs`
  - `Repositories/SqlOrderRepository.cs`
  - `Repositories/SqlCommentRepository.cs`
- Endpoint lien quan:
  - `GET /api/perfumes`
  - `GET /api/orders/{id}`
  - `GET /api/comments/perfume/{perfumeId}`

## 2) Unit of Work Pattern
- Muc tieu: Quan ly transaction va commit dong bo nhieu repository.
- Bang chung code:
  - `Infrastructure/IUnitOfWork.cs`
  - `Infrastructure/SqlUnitOfWork.cs`
- Endpoint lien quan:
  - `POST /api/orders` (qua `OrderFacade` + `_unitOfWork.CompleteAsync()`)
  - `PUT /api/orders/{id}/status`
  - CRUD trong `PerfumesController`

## 3) Strategy Pattern
- Muc tieu: Hoan doi thuat toan thanh toan.
- Bang chung code:
  - `Services/PaymentStrategies.cs`
  - `IPaymentStrategy`, `CreditCardPayment`, `EWalletPayment`, `VNPayStrategy`
- Endpoint/luong lien quan:
  - `POST /api/orders` -> `OrderFacade.PlaceOrderAsync()` goi `_paymentStrategy.ProcessPaymentAsync(order)`

## 4) Adapter Pattern
- Muc tieu: Chuan hoa interface dong bo ton kho qua cac kenh (Shopee/TikTok/Lazada).
- Bang chung code:
  - `Services/OmnichannelAdapters.cs`
  - `IOmnichannelAdapter`, `ShopeeAdapter`, `TikTokAdapter`, `LazadaAdapter`
- Endpoint/luong lien quan:
  - Sau khi dat hang/doi ton kho, Observer day job Hangfire -> `OmnichannelBackgroundSyncService` goi danh sach adapters.

## 5) Observer Pattern
- Muc tieu: Phat su kien ton kho thay doi va notify cac observer.
- Bang chung code:
  - `Services/InventoryObserver.cs`
  - `InventorySubject`, `IInventoryObserver`, `OmnichannelSyncObserver`
  - `Program.cs` phan attach observer luc startup
- Endpoint/luong lien quan:
  - `POST /api/orders` -> `OrderFacade` cap nhat ton kho va `NotifyAsync(perfume)`

## 6) Facade Pattern
- Muc tieu: Gop nhieu buoc dat hang thanh 1 API don gian.
- Bang chung code:
  - `Services/OrderFacade.cs`
- Endpoint lien quan:
  - `POST /api/orders`
  - Facade xu ly: kiem tra ton -> tao order -> thanh toan -> tru kho -> notify observer.

## 7) Proxy Pattern
- Muc tieu: Kiem soat quyen truoc khi goi service that.
- Bang chung code:
  - `Services/AdminServiceProxy.cs`
  - `SecurityProxy : IAdminService`
- Endpoint lien quan:
  - `POST /api/perfumes`
  - `PUT /api/perfumes/{id}`
  - `DELETE /api/perfumes/{id}`

## 8) Template Method Pattern
- Muc tieu: Dinh nghia skeleton tao report, cac subclass override cac buoc.
- Bang chung code:
  - `Services/ReportGenerator.cs`
  - `SalesReportGenerator`, `StockReportGenerator`
- Endpoint lien quan:
  - `GET /api/statistics/sales`
  - `GET /api/statistics/stock`

## 9) Command Pattern (MediatR)
- Muc tieu: Dong goi request thanh command/query object.
- Bang chung code:
  - `Features/Comments/Commands/CreateCommentCommand.cs`
  - `Controllers/CommentsController.cs` su dung `_sender.Send(command)`
- Endpoint lien quan:
  - `POST /api/comments`
  - `GET /api/comments/perfume/{perfumeId}` (Query pattern cung MediatR)

## 10) Decorator Pattern
- Muc tieu: Bo sung hanh vi tinh gia theo lop (discount/tax) ma khong sua strategy goc.
- Bang chung code:
  - `Services/PricingPatterns.cs`
  - `PricingDecorator`, `DiscountDecorator`, `TaxDecorator`
- Endpoint lien quan:
  - Hien tai chua gan truc tiep vao controller endpoint (dang la thanh phan mo rong service layer).

---

## Ghi chu bo sung
- Du an con co them cac pattern sau:
  - Factory: `Services/PerfumeFactory.cs`
  - Singleton: `Services/ConfigurationManager.cs`
- Danh gia muc do ap dung:
  - Ap dung truc tiep vao API flow: Repository, UnitOfWork, Strategy, Adapter, Observer, Facade, Proxy, Template Method, Command.
  - Co san trong service layer nhung chua noi endpoint chinh: Decorator (PricingPatterns), Factory, Singleton.
