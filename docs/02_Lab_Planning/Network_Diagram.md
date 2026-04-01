# Network Diagram & Project Schedule Network - Lab 2

## 📊 Project Network Diagram (PERT/CPM)

```text
                    ┌─────────┐
                    │  Start  │
                    └────┬────┘
                         │
                ┌────────┴────────┐
                │                 │
          ┌─────▼─────┐      ┌────▼─────┐
          │  Task 1   │      │  Task 2  │
          │Requirements│      │ Design   │
          │ (4 weeks)  │      │(3 weeks) │
          └─────┬─────┘      └────┬─────┘
                │                 │
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │  Task 3         │
                │  Development    │
                │  (8 weeks)      │
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │  Task 4         │
                │  Testing        │
                │  (3 weeks)      │
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │  Task 5         │
                │  Deployment     │
                │  (1 week)       │
                └────────┬────────┘
                         │
                    ┌────▼─────┐
                    │    End   │
                    └──────────┘
```

## 🔗 Dependency Matrix

| Activity | Duration | Predecessor | Early Start | Early Finish | Late Start | Late Finish | Float |
|----------|----------|-------------|------------|--------------|-----------|-------------|-------|
| 1. Requirements | 4w | Start | 0 | 4 | 0 | 4 | 0 |
| 2. Design | 3w | Start | 0 | 3 | 1 | 4 | 1 |
| 3. Development | 8w | 1,2 | 4 | 12 | 4 | 12 | 0 |
| 4. Testing | 3w | 3 | 12 | 15 | 12 | 15 | 0 |
| 5. Deployment | 1w | 4 | 15 | 16 | 15 | 16 | 0 |

## ⭐ Critical Path

**Critical Path**: 1 → 3 → 4 → 5  
**Total Duration**: 16 weeks  
**Slack/Float**: 0 weeks (no buffer for critical path activities)

---

## 📈 Gantt Chart

```text
Week: 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16

REQ [=============]
DES [=========]
DEV [==========================]
TST [=========]
DEP [=]
```

## ✅ Status: [Pending/In Progress/Completed]
_Cập nhật lần cuối: 2026-04-01_
