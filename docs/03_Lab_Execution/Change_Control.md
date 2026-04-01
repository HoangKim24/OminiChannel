# Change Control System - Lab 3

## 📋 Change Control Process Overview

Change Control Process là hệ thống để quản lý, đánh giá và phê duyệt tất cả các thay đổi trong phạm vi dự án, ngân sách, hoặc timeline.

---

## 🔄 Change Control Process Steps

```text
┌─────────────────┐ 
│ 1. Change Request │ (CCR Form) 
└────────┬────────┘ 
         │ 
         ▼ 
┌─────────────────┐ 
│ 2. Initial Review │ 
│ - Completeness    │ 
│ - Priority        │ 
└────────┬────────┘ 
         │ 
         ▼ 
┌─────────────────┐ 
│ 3. Impact Analysis │ 
│ - Scope impact     │ 
│ - Schedule impact  │ 
│ - Budget impact    │ 
│ - Risk impact      │ 
└────────┬────────┘ 
         │ 
         ▼ 
┌─────────────────┐ 
│ 4. CCB Review     │ 
│ (Change Control   │ 
│ Board)            │ 
└────────┬────────┘ 
         │ 
    ┌────┴─────┐ 
    │          │ 
    ▼          ▼ 
 APPROVED    REJECTED 
    │          │ 
    ▼          ▼ 
┌──────┐    ┌─────────┐ 
│ 5A.  │    │ 5B.     │ 
│ Impl │    │ Notify  │ 
│      │    │Requester│ 
└──────┘    └─────────┘ 
    │ 
    ▼ 
┌─────────────────┐ 
│ 6. Implementation │ 
│ & Tracking        │ 
└────────┬────────┘ 
         │ 
         ▼ 
┌─────────────────┐ 
│ 7. Verification   │ 
│ & Closure         │ 
└─────────────────┘
```

---

## 📋 Change Control Request (CCR) Form

### Form Template

```text
═══════════════════════════════════════════════════════
CHANGE CONTROL REQUEST (CCR) FORM
═══════════════════════════════════════════════════════

CR ID: [Auto-generated, e.g., CCR-001]
Date Submitted: [Date]
Submitted By: [Name] | Role: [Role]
Priority: [ ] Critical | [ ] High | [ ] Medium | [ ] Low

───────────────────────────────────────────────────────
SECTION 1: CHANGE DESCRIPTION
───────────────────────────────────────────────────────

Change Title: [Brief title of the change]

Detailed Description: [What needs to be changed and why?]
Current state:
Desired state:
Business justification:

Affected Work Packages: [ ] Planning [ ] Design [ ] Development [ ] Testing [ ] Deployment

───────────────────────────────────────────────────────
SECTION 2: IMPACT ANALYSIS
───────────────────────────────────────────────────────

Scope Impact: [ ] In Scope [ ] Out of Scope
Details: ___________________________________________

Schedule Impact:
Days added to timeline: _____ days
New delivery date (if changed): _____________

Budget Impact:
Additional cost: $ _______
Revised budget: $ _______

Risk Impact:
New risks introduced:
Risk 1: ________________
Risk 2: ________________

Quality Impact: [ ] Improves quality [ ] Neutral [ ] Reduces quality
Details: ___________________________________________

───────────────────────────────────────────────────────
SECTION 3: IMPLEMENTATION PLAN
───────────────────────────────────────────────────────

Resource Requirements:
Personnel: ______________
Tools/Materials: _________
Budget: $ _______________

Implementation Steps:
Expected Completion Date: ______________

───────────────────────────────────────────────────────
SECTION 4: APPROVAL
───────────────────────────────────────────────────────

[ ] APPROVED [ ] APPROVED WITH MODIFICATION [ ] REJECTED

Change Control Board (CCB) Comments:

CCB Members Signature:
PM: _________________ Date: _______
Tech Lead: __________ Date: _______
Client/Sponsor: _____ Date: _______

───────────────────────────────────────────────────────
SECTION 5: IMPLEMENTATION TRACKING
───────────────────────────────────────────────────────

Status: [ ] Not Started [ ] In Progress [ ] Completed

Implementation Start Date: ___________
Implementation End Date: ____________
Actual Cost: $ ________________
Verification Completed: [ ] Yes [ ] No

Signed: _________________ Date: _______
```

---

## 📊 Change Control Log

| CR ID | Title | Status | Submitted | CCB Decision | Impact | Impl Date | Closed |
|-------|-------|--------|-----------|--------------|--------|-----------|--------|
| CCR-001 | Add payment method | Open | 2026-04-10 | Pending | Medium | - | - |
| CCR-002 | Database schema update | Approved | 2026-04-15 | Approved | High | 2026-04-17 | 2026-04-18 |
| CCR-003 | UI redesign | Rejected | 2026-04-20 | Rejected | High | - | 2026-04-21 |

---

## 🎯 Change Control Board (CCB)

**CCB Composition**:
- **Chair**: Project Manager
- **Members**:
  - Technical Lead
  - Client/Product Owner
  - QA Lead
  - Finance Representative (for budget changes)

**CCB Meeting Schedule**: 
- Weekly on Wednesday 2:00 PM
- Or as-needed for urgent changes

**CCB Decision Criteria**:
1. Impact on schedule & timeline
2. Impact on budget
3. Impact on scope & deliverables
4. Impact on quality & risks
5. Business value vs. cost

---

## 📈 Change Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Avg CCR processing time | 3 days | |
| % of CCRs approved | 70% | |
| Avg schedule impact per CCR | 2 days | |
| Avg budget impact per CCR | $500 | |

---

## ✅ Status: [Pending/In Progress/Completed]
_Cập nhật lần cuối: 2026-04-01_
