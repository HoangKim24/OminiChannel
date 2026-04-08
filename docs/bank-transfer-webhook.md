# Bank Transfer Webhook – Hướng dẫn tích hợp

Tài liệu này mô tả cách cấu hình và sử dụng endpoint webhook để **tự động xác nhận chuyển khoản** trong hệ thống OminiChannel.

---

## Tổng quan

Khi khách hàng chuyển khoản với đúng số tiền và nội dung chứa `paymentCode` (dạng `BT-...`), nhà cung cấp dịch vụ biến động số dư (hoặc bạn có thể tự gọi thủ công để test) sẽ `POST` vào endpoint sau:

```
POST /api/payments/bank-transfer/webhook
```

Server sẽ:
1. Xác thực API key qua header `X-Webhook-Key`.
2. Parse `paymentCode` từ nội dung chuyển khoản (`Content`).
3. Tìm và đối soát `BankTransferPayment` tương ứng.
4. Nếu hợp lệ, cập nhật `payment.Status = "Paid"` và `order.Status = "Paid"`.
5. Frontend đang poll `/api/payments/bank-transfer/status/{paymentCode}` sẽ phát hiện trạng thái `Paid` và tự động hiện thông báo cảm ơn.

---

## 1. Cấu hình API Key

### Dùng user-secrets (development)

```bash
dotnet user-secrets set "BankTransferWebhook:ApiKey" "your-strong-secret-key"
```

### Dùng biến môi trường (production)

```bash
export BankTransferWebhook__ApiKey="your-strong-secret-key"
```

### Dùng `appsettings.json` (không khuyến khích cho production)

```json
{
  "BankTransferWebhook": {
    "ApiKey": "your-strong-secret-key"
  }
}
```

> **Lưu ý bảo mật:** Không commit API key vào source code. Luôn dùng user-secrets hoặc biến môi trường.

---

## 2. Payload webhook

### Request headers

| Header | Giá trị |
|--------|---------|
| `Content-Type` | `application/json` |
| `X-Webhook-Key` | `<secret key đã cấu hình>` |

### Request body (JSON)

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `amount` | `decimal` | ✅ | Số tiền giao dịch |
| `content` | `string` | ✅ | Nội dung chuyển khoản (phải chứa `paymentCode` dạng `BT-...`) |
| `destinationAccountNo` | `string` | ✅ | Số tài khoản nhận tiền |
| `transactionId` | `string?` | ❌ | Mã giao dịch của ngân hàng |
| `transactedAt` | `DateTime?` | ❌ | Thời gian giao dịch |
| `bankName` | `string?` | ❌ | Tên ngân hàng người gửi |
| `senderAccountNo` | `string?` | ❌ | Số tài khoản người gửi |

### Ví dụ payload

```json
{
  "amount": 500000,
  "content": "Thanh toan BT-20240408153000-AB12CD",
  "destinationAccountNo": "1234567890",
  "transactionId": "FT24098XYZ123",
  "transactedAt": "2024-04-08T15:30:00Z",
  "bankName": "Vietcombank",
  "senderAccountNo": "9876543210"
}
```

---

## 3. Ví dụ curl

```bash
curl -X POST https://your-domain.com/api/payments/bank-transfer/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Key: your-strong-secret-key" \
  -d '{
    "amount": 500000,
    "content": "Thanh toan BT-20240408153000-AB12CD",
    "destinationAccountNo": "1234567890",
    "transactionId": "FT24098XYZ123",
    "transactedAt": "2024-04-08T15:30:00Z"
  }'
```

---

## 4. Response mẫu

### Thành công (200 OK)

```json
{
  "message": "Xác nhận thanh toán thành công",
  "paymentCode": "BT-20240408153000-AB12CD",
  "orderId": 42,
  "paymentStatus": "Paid",
  "orderStatus": "Paid"
}
```

### Đã xử lý trước đó – idempotent (200 OK)

```json
{
  "message": "Already paid",
  "paymentCode": "BT-20240408153000-AB12CD",
  "orderId": 42
}
```

### Lỗi xác thực (401 Unauthorized)

```json
{
  "message": "API key không hợp lệ"
}
```

### Payload không hợp lệ (400 Bad Request)

```json
{
  "message": "Không tìm thấy mã thanh toán hợp lệ trong nội dung chuyển khoản"
}
```

```json
{
  "message": "Số tiền không khớp",
  "expected": 500000,
  "received": 400000
}
```

---

## 5. Test end-to-end (không cần nhà cung cấp thật)

1. Tạo yêu cầu chuyển khoản qua frontend (Checkout → BankTransfer) hoặc gọi:
   ```
   POST /api/payments/bank-transfer/request
   ```
2. Lấy `paymentCode` từ response (ví dụ: `BT-20240408153000-AB12CD`) và `accountNo`.
3. Gọi webhook bằng curl (xem mục 3) với đúng `amount`, `content` chứa `paymentCode`, và `destinationAccountNo` = `accountNo` từ bước 2.
4. Kiểm tra trạng thái:
   ```
   GET /api/payments/bank-transfer/status/{paymentCode}
   ```
   → `paymentStatus` sẽ là `"Paid"`.
5. Frontend đang poll mỗi 5 giây – khi thấy `isPaid = true` sẽ tự hiện toast "Cảm ơn" và chuyển trang.

---

## 6. Tích hợp nhà cung cấp thật

Sau khi chọn dịch vụ biến động số dư (ví dụ Casso, SePay, hoặc API ngân hàng):

1. Cấu hình webhook URL của nhà cung cấp trỏ về: `https://your-domain.com/api/payments/bank-transfer/webhook`
2. Set `X-Webhook-Key` (hoặc tương đương) trong cấu hình nhà cung cấp.
3. Map payload của họ vào các trường trong `BankTransferWebhookRequest`.
4. Nếu nhà cung cấp dùng HMAC signature thay vì API key, tạo thêm middleware/filter để verify signature trước khi xử lý logic.
