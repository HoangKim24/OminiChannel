# Decision Making Authority - Lab 3

## 🎯 Decision Authority Matrix

Định nghĩa rõ ràng ai có quyền quyết định những vấn đề gì trong dự án.

---

## 📊 Decision Authority Levels

### Level 1: PM Authority (Decision ≤ $1,000 impact or ≤ 2 days delay)

**Authority**: Project Manager

**Decisions**:
- [ ] Minor scope adjustments (within 10% of work package)
- [ ] Resource reassignment between teams
- [ ] Schedule adjustments (≤ 2 days)
- [ ] Tool/library selections
- [ ] Coding standards clarifications
- [ ] Minor database schema changes

**Process**: 
1. Consult with relevant stakeholders
2. Document decision
3. Notify team within 24 hours
4. Update project records

**Example**: 
- Deciding to use Library X vs Library Y for frontend
- Moving a non-critical task 1 day earlier/later

---

### Level 2: Technical Steering Committee (Decision $1,000-$10,000 or 2-5 days delay)

**Authority**: PM + Tech Lead + Client Representative

**Decisions**:
- [ ] Major architecture changes
- [ ] Technology stack modifications
- [ ] Schedule changes (2-5 days)
- [ ] Budget increase (≤ $10,000)
- [ ] Feature scope adjustments
- [ ] Team composition changes
- [ ] Testing strategy modifications

**Process**:
1. PM prepares impact analysis
2. Committee reviews & discusses
3. Vote on decision (majority wins)
4. Document with rationale
5. Communicate to stakeholders within 48 hours

**Meeting Schedule**: Weekly Wednesday 2:00 PM

**Example**:
- Deciding to switch from Vue to React
- Adding 3 days to testing phase
- Budget increase for cloud infrastructure

---

### Level 3: Executive Steering Committee (Decision >$10,000 or >5 days delay)

**Authority**: Executive Sponsor + Client CEO + PM + Tech Lead

**Decisions**:
- [ ] Major project scope changes
- [ ] Budget overruns (>$10,000)
- [ ] Schedule delay (>5 days)
- [ ] Major risk response strategies
- [ ] Project cancellation/termination
- [ ] Vendor/partner changes
- [ ] Go/No-Go decisions for phases

**Process**:
1. PM prepares comprehensive impact analysis
2. Present to Steering Committee
3. Committee debates & decides
4. Vote on decision (unanimous preferred)
5. Executive approval & sign-off
6. Board-level communication

**Meeting Schedule**: Monthly or as-needed

**Example**:
- Delaying go-live by 2 weeks
- Budget increase by $15,000
- Changing primary vendor

---

## 🏛️ Decision Authority Hierarchy

```text
┌─────────────────────────────┐ 
│ Executive Steering          │ 
│ Committee                   │ 
│ (Large decisions)           │ 
└────────────────┬────────────┘ 
                 │ 
        ┌────────┴────────┐ 
        │                 │ 
   ┌────▼─────┐     ┌────▼──────┐ 
   │Technical │     │Executive  │ 
   │Committee │     │Sponsor    │ 
   │(Medium)  │     │           │ 
   └────┬─────┘     └───────────┘ 
        │ 
   ┌────▼──────────────────┐ 
   │Project Manager        │ 
   │(Daily/Minor decisions)│ 
   └───────────────────────┘ 
        │ 
   ┌────▼──────────────────┐ 
   │Project Team           │ 
   │(Work-level decisions) │ 
   └───────────────────────┘
```

---

## 📋 Decision Log Template

| Decision ID | Decision | Decision Maker | Date | Impact | Rationale | Status |
|-------------|----------|----------------|------|--------|-----------|--------|
| D-001 | Use React for frontend | Tech Committee | 2026-03-15 | Schedule +2d | Performance, team expertise | Implemented |
| D-002 | Add payment gateway | PM + Client | 2026-04-01 | Budget +$2K | Customer requirement | Approved |
| D-003 | Extend testing phase | Steering Committee | 2026-05-15 | Schedule +5d | Quality assurance | Approved |

---

## 🔔 Escalation Path

**If decision cannot be made at current level:**

```text
Work Issue 
   │ 
   ▼ 
PM Decision? 
   │ 
   ├─ YES → Implement 
   │ 
   └─ NO → Escalate to Technical Committee 
         │ 
         ▼ 
Committee Decision? 
         │ 
         ├─ YES → Implement 
         │ 
         └─ NO → Escalate to Executive Steering 
               │ 
               ▼ 
Executive Decision (FINAL)
```

---

## ✅ Status: [Pending/In Progress/Completed]
_Cập nhật lần cuối: 2026-04-01_
