# Risk Management Plan - Lab 1

## 🚨 Risk Register

| ID | Risk Description | Category | Probability | Impact | Score | Mitigation Strategy | Owner | Status |
|----|------------------|----------|-------------|--------|-------|---------------------|-------|--------|
| R1 | Thiếu nhân sự có kỹ năng .NET | Resource | High | High | 9 | Tuyển dụng trước, ngoài đó training | PM | Active |
| R2 | Thay đổi yêu cầu từ khách hàng | Scope | Medium | High | 6 | Change Control Process, Communication Plan | PM | Active |
| R3 | Chậm trễ trong phát triển | Schedule | Medium | High | 6 | Detailed schedule, buffer time, daily standup | Tech Lead | Active |
| R4 | Vấn đề kết nối database | Technical | Low | High | 3 | Load testing, database optimization | DB Admin | Monitor |
| R5 | Bảo mật dữ liệu | Security | Medium | High | 6 | Security audit, encryption, code review | Tech Lead | Active |
| R6 | Performance bottleneck | Technical | Low | Medium | 2 | Performance testing, optimization | Tech Lead | Monitor |
| R7 | Third-party API delays | External | Medium | Medium | 4 | Early integration testing, backup plan | Integration Lead | Monitor |
| R8 | Budget overrun | Budget | Low | High | 3 | Detailed estimation, weekly tracking | PM | Active |

## 📊 Risk Matrix

```text
    IMPACT
     HIGH
      ^
      | R2, R3, R5
      |      R1 ★
      |
      | R4, R8
  MEDIUM
      |      R7
      |
      |    R6
    LOW |_________________ PROBABILITY
         L    M    H
```

## 🔍 Risk Response Strategies

### R1: Thiếu nhân sự (HIGH PRIORITY)
- **Strategy**: Mitigate
- **Actions**:
  - Tuyển dụng fullstack developer ngay từ tuần 1
  - Thuê consultant freelance nếu cần
  - Tập training cho junior developers
- **Owner**: PM
- **Due Date**: 2026-03-15

### R2: Thay đổi yêu cầu
- **Strategy**: Mitigate + Adapt
- **Actions**:
  - Thiết lập Change Control Process
  - Weekly requirements review
  - Scope creep prevention
- **Owner**: PM
- **Due Date**: Ongoing

### R3: Chậm trễ timeline
- **Strategy**: Mitigate
- **Actions**:
  - Detailed project schedule
  - 1 week buffer for each phase
  - Daily standup meetings
- **Owner**: Tech Lead
- **Due Date**: Ongoing

### R5: Bảo mật dữ liệu
- **Strategy**: Mitigate
- **Actions**:
  - Security code review
  - OWASP compliance check
  - Data encryption (in transit + at rest)
  - Regular security testing
- **Owner**: Tech Lead
- **Due Date**: Before go-live

## ✅ Status: [Pending/In Progress/Completed]
_Cập nhật lần cuối: 2026-04-01_
