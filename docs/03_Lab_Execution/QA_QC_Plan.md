# Quality Assurance & Quality Control Plan - Lab 3

## 🎯 QA/QC Strategy

**Quality Assurance (QA)**: Process-focused, ensures processes are followed  
**Quality Control (QC)**: Product-focused, ensures product meets standards

---

## 📋 Quality Standards

### Code Quality Standards

**Backend (C#/.NET)**
- [ ] Code coverage: ≥ 80% with unit tests
- [ ] SonarQube rating: A (blocker/critical issues = 0)
- [ ] Code style: Follow Microsoft C# coding conventions
- [ ] Documentation: All public methods documented
- [ ] SOLID principles compliance

**Frontend (JavaScript/React)**
- [ ] Code coverage: ≥ 75% with unit tests
- [ ] ESLint errors: 0
- [ ] Code style: Follow Airbnb JS style guide
- [ ] Component documentation: All components have JSDoc
- [ ] Performance: Bundle size < 500KB (gzipped)

---

## 🧪 Test Strategy

### Test Levels

```text
┌──────────────────────────────┐ 
│ System Testing (UAT)         │ 
│ - End-to-end workflows       │ 
│ - Load testing               │ 
│ - Security testing           │ 
└──────────────────────────────┘ 
               ▲ 
               │ 
┌──────────────────────────────┐ 
│ Integration Testing          │ 
│ - API ↔ Database             │ 
│ - Service ↔ Service          │ 
│ - Component ↔ Component      │ 
└──────────────────────────────┘ 
               ▲ 
               │ 
┌──────────────────────────────┐ 
│ Unit Testing                 │ 
│ - Individual functions       │ 
│ - Edge cases                 │ 
│ - Error handling             │ 
└──────────────────────────────┘
```

---

### Test Coverage Requirements

| Component | Coverage | Tools |
|-----------|----------|-------|
| Backend APIs | ≥ 80% | xUnit, Moq |
| Frontend Components | ≥ 75% | Jest, React Testing Library |
| Database Logic | ≥ 85% | Database unit tests |
| **Overall** | **≥ 80%** | SonarQube |

---

### Testing Schedule

| Phase | Type | Duration | Start | End | Owner |
|-------|------|----------|-------|-----|-------|
| During Dev | Unit Testing | Ongoing | W5 | W12 | Dev Team |
| During Dev | Code Review | Ongoing | W5 | W12 | Tech Lead |
| W12-W13 | Integration Test | 2 weeks | W12 | W13 | QA Team |
| W13-W14 | System Test | 2 weeks | W13 | W14 | QA Team |
| W14-W15 | UAT | 2 weeks | W14 | W15 | QA + Sponsor |

---

## 🔍 Quality Metrics

### Code Quality Metrics

```text
Metric                   Target      Formula 
──────────────────────────────────────────── 
Code Coverage            ≥80%        (Lines tested / Total lines) × 100 
Cyclomatic Complexity    <10         Branch points in code 
Defect Density           <3/KLOC     Defects per 1000 lines of code 
Comment Ratio            ≥30%        Comment lines / Total lines 
Duplication              <5%         Duplicate code lines / Total lines 
Technical Debt Ratio     <5%         (Effort to fix issues / Dev cost) × 100
```

### Testing Metrics

```text
Metric                           Target 
───────────────────────────────────────── 
Test Case Creation Rate          10 cases/day 
Test Execution Rate              50 cases/day 
Defect Detection Rate            >80% of bugs 
Critical/Blocker Issues          0 at release 
P1 Issues (High)                 <5 at release 
P2 Issues (Medium)               <20 at release 
Defect Escape Rate               <2% post-release 
Test Case Effectiveness          >80% 
```

---

## 🐛 Defect Management

### Defect Classification

| Severity | Impact | Example | Fix Time | Release Block? |
|----------|--------|---------|----------|---------------|
| Critical/Blocker | System down, data loss | App crashes | 24hrs | YES |
| High/Major | Major feature broken | Payment fails | 48hrs | YES |
| Medium | Minor feature impact | UI alignment | 1 week | NO |
| Low/Minor | Cosmetic issue | Button color | 2 weeks | NO |

### Defect Log

| ID | Title | Severity | Status | Found | Fixed | Closed |
|----|-------|----------|--------|-------|-------|--------|
| BUG-001 | Login fails | Critical | Fixed | W6 | W7 | W7 |
| BUG-002 | Cart total wrong | High | Fixed | W8 | W9 | W9 |
| BUG-003 | Font rendering | Low | Open | W10 | - | - |

---

## ✅ Quality Gate Checklist

### Pre-Testing Gate
- [ ] All code peer-reviewed
- [ ] Code coverage ≥ 80%
- [ ] All unit tests passing
- [ ] No SonarQube blocker issues
- [ ] Database schema reviewed
- [ ] API documentation complete

### Pre-Production Gate
- [ ] All test cases executed
- [ ] Zero critical/blocker bugs
- [ ] Performance testing passed
- [ ] Security audit passed
- [ ] UAT sign-off obtained
- [ ] Deployment checklist verified

---

## 📊 QA Sign-off

| Phase | Ready for Next Phase | Approval | Date |
|-------|---------------------|----------|------|
| Unit Testing | [ ] Yes [ ] No | QA Lead | |
| Integration Test | [ ] Yes [ ] No | QA Lead | |
| System Test | [ ] Yes [ ] No | QA Lead | |
| UAT | [ ] Yes [ ] No | PM + Client | |
| Production Release | [ ] Yes [ ] No | QA Lead + PM | |

---

## ✅ Status: [Pending/In Progress/Completed]
_Cập nhật lần cuối: 2026-04-01_
