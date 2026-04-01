# Project Status & Earned Value Analysis (EVA) - Lab 4

## 📊 Earned Value Analysis Overview

Earned Value Analysis (EVA) là phương pháp đo lường hiệu suất dự án bằng cách so sánh:
- **Planned Value (PV)**: Công việc dự kiến thực hiện
- **Earned Value (EV)**: Công việc thực tế đã hoàn thành
- **Actual Cost (AC)**: Chi phí thực tế đã phát sinh

---

## 🎯 Key Metrics

### 1. Planned Value (PV) - Giá trị Dự Kiến

**Definition**: Tổng giá trị của công việc dự kiến hoàn thành đến một thời điểm nhất định.

```text
PV tính đến tuần 8 = (Công việc dự kiến × Budget) = $25,000
```

### 2. Earned Value (EV) - Giá trị Đã Kiếm

**Definition**: Tổng giá trị của công việc thực tế đã hoàn thành.

```text
EV tính đến tuần 8 = (Công việc hoàn thành % × Budget) = $20,000
```

### 3. Actual Cost (AC) - Chi Phí Thực Tế

**Definition**: Tổng chi phí thực tế đã phát sinh cho công việc đã hoàn thành.

```text
AC tính đến tuần 8 = Lương + Tools + Infra = $22,000
```

---

## 📈 EVA Calculations

### Performance Indices

#### 1. Schedule Performance Index (SPI)
SPI = EV / PV

```text
SPI = $20,000 / $25,000 = 0.8

Interpretation:
SPI > 1.0: Ahead of schedule ✅
SPI = 1.0: On schedule
SPI < 1.0: Behind schedule ⚠️
0.8 = 80% progress = 20% behind schedule
```

#### 2. Cost Performance Index (CPI)
CPI = EV / AC

```text
CPI = $20,000 / $22,000 = 0.91

Interpretation:
CPI > 1.0: Under budget ✅
CPI = 1.0: On budget
CPI < 1.0: Over budget ⚠️
0.91 = 91% efficiency = 9% over budget
```

### Variance Analysis

#### 1. Schedule Variance (SV)
SV = EV - PV 

```text
SV = $20,000 - $25,000 = -$5,000

Negative = Behind schedule by $5,000 worth of work
```

#### 2. Cost Variance (CV)
CV = EV - AC 

```text
CV = $20,000 - $22,000 = -$2,000

Negative = Over budget by $2,000
```

---

## 📊 EVA Trend Chart

```text
Week:      1   2   3   4   5   6   7   8 
           |   |   |   |   |   |   |   | 
PV ───     4   8  12  16  20  24  28  25 (Planned) 
EV ─ ·     3   6   9  12  14  17  18  20 (Actual) 
AC - -     3.5 7  10  13  16  19  21  22 (Cost)
```

```text
    ╔════════════════════════════════════╗
    ║ Current Status (Week 8):           ║
    ║ SPI = 0.8  (20% behind schedule)   ║
    ║ CPI = 0.91 (9% over budget)        ║
    ╚════════════════════════════════════╝
```

---

## 🔮 Forecasting

### Estimate at Completion (EAC)

```text
Method 1: Based on CPI 
EAC = BAC / CPI 
EAC = $56,100 / 0.91 = $61,648

Method 2: Based on SPI & CPI 
EAC = BAC / (CPI × SPI) 
EAC = $56,100 / (0.91 × 0.8) = $77,203

More pessimistic estimate considering both cost & schedule
```

### Estimate to Complete (ETC)

```text
ETC = EAC - AC 
ETC = $61,648 - $22,000 = $39,648

Still need to spend $39,648 to complete the project
```

### Variance at Completion (VAC)

```text
VAC = BAC - EAC 
VAC = $56,100 - $61,648 = -$5,548

Projected cost overrun of $5,548
```

---

## 📋 EVA Status Report Template

```text
═══════════════════════════════════════════════════ 
PROJECT STATUS REPORT - WEEK 8 
═══════════════════════════════════════════════════

OVERALL STATUS: 🟡 YELLOW (At Risk)

─────────────────────────────────────────────────── 
SCHEDULE PERFORMANCE 
─────────────────────────────────────────────────── 
Planned Value (PV): $25,000 
Earned Value (EV): $20,000 
Schedule Variance (SV): -$5,000 
Schedule Perf Index (SPI): 0.80

Status: 20% BEHIND SCHEDULE ⚠️

─────────────────────────────────────────────────── 
COST PERFORMANCE 
─────────────────────────────────────────────────── 
Earned Value (EV): $20,000 
Actual Cost (AC): $22,000 
Cost Variance (CV): -$2,000 
Cost Perf Index (CPI): 0.91

Status: 9% OVER BUDGET ⚠️

─────────────────────────────────────────────────── 
FORECAST 
─────────────────────────────────────────────────── 
Budget at Completion (BAC): $56,100 
Estimate at Completion (EAC): $61,648 
Variance at Completion (VAC): -$5,548

Projected Completion Date: 2026-07-15 (+15 days)

─────────────────────────────────────────────────── 
ROOT CAUSES 
───────────────────────────────────────────────────
- Resource constraints (1 dev left team)
- Integration challenges (API delays)
- Increased scope creep (CCR-002 approved)

─────────────────────────────────────────────────── 
CORRECTIVE ACTIONS 
───────────────────────────────────────────────────
- Hire contractor for backend work (1 week)
- Rescope lower-priority features (save 3 days)
- Daily stand-ups on critical path items
- Implement strict change control
- Target: Return to schedule by Week 12
───────────────────────────────────────────────────
```

---

## 📊 Phase-wise EVA Tracking

| Phase | Budget | Week | PV | EV | AC | SPI | CPI | Status |
|-------|--------|------|----|----|----|----|-----|--------|
| Planning | $9,350 | W4 | $9.35K | $9.35K | $9.2K | 1.00 | 1.02 | ✅ |
| Dev | $37,400 | W12 | $25K | $20K | $22K | 0.80 | 0.91 | ⚠️ |
| Testing | $6,930 | W15 | TBD | TBD | TBD | TBD | TBD | ⚪ |
| Deploy | $2,420 | W16 | TBD | TBD | TBD | TBD | TBD | ⚪ |

---

## ✅ Status: [Pending/In Progress/Completed]
_Cập nhật lần cuối: 2026-04-01_
