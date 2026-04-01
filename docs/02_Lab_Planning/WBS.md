# Work Breakdown Structure (WBS) - Lab 2

## 📊 WBS Tree

```text
OmniChannel E-Commerce Platform (1.0) 
│ 
├─ 1.0 Project Management 
│ ├─ 1.1 Project Planning & Charter 
│ ├─ 1.2 Stakeholder Management 
│ ├─ 1.3 Risk Management 
│ ├─ 1.4 Change Management 
│ └─ 1.5 Project Monitoring & Reporting 
│ 
├─ 2.0 Requirements & Analysis 
│ ├─ 2.1 Business Requirements Gathering 
│ ├─ 2.2 Functional Requirements Documentation 
│ ├─ 2.3 Non-Functional Requirements (Performance, Security) 
│ └─ 2.4 Requirements Validation with Stakeholders 
│ 
├─ 3.0 System Design 
│ ├─ 3.1 System Architecture Design 
│ │ ├─ 3.1.1 High-level architecture diagram 
│ │ ├─ 3.1.2 Microservices design 
│ │ └─ 3.1.3 API design & documentation 
│ │ 
│ ├─ 3.2 Database Design 
│ │ ├─ 3.2.1 ER (Entity-Relationship) Diagram 
│ │ ├─ 3.2.2 Database schema design 
│ │ ├─ 3.2.3 Indexing strategy 
│ │ └─ 3.2.4 Backup & recovery plan 
│ │ 
│ ├─ 3.3 UI/UX Design 
│ │ ├─ 3.3.1 Wireframes 
│ │ ├─ 3.3.2 High-fidelity mockups 
│ │ ├─ 3.3.3 Design system 
│ │ └─ 3.3.4 Mobile responsive design 
│ │ 
│ └─ 3.4 Security Design 
│ ├─ 3.4.1 Authentication mechanism 
│ ├─ 3.4.2 Authorization & access control 
│ ├─ 3.4.3 Data encryption strategy 
│ └─ 3.4.4 Security threat modeling 
│ 
├─ 4.0 Backend Development 
│ ├─ 4.1 Infrastructure Setup 
│ │ ├─ 4.1.1 Cloud environment setup (Azure/AWS) 
│ │ ├─ 4.1.2 CI/CD pipeline configuration 
│ │ └─ 4.1.3 Development environment setup 
│ │ 
│ ├─ 4.2 Core API Development 
│ │ ├─ 4.2.1 User Management APIs 
│ │ ├─ 4.2.2 Product Catalog APIs 
│ │ ├─ 4.2.3 Shopping Cart APIs 
│ │ ├─ 4.2.4 Order Management APIs 
│ │ └─ 4.2.5 Payment Integration APIs 
│ │ 
│ ├─ 4.3 Database Implementation 
│ │ ├─ 4.3.1 Database creation & configuration 
│ │ ├─ 4.3.2 Stored procedures & triggers 
│ │ └─ 4.3.3 Data migration scripts 
│ │ 
│ └─ 4.4 Integration Services 
│ ├─ 4.4.1 Third-party payment gateway integration 
│ ├─ 4.4.2 Email notification service 
│ ├─ 4.4.3 Analytics service integration 
│ └─ 4.4.4 Logging & monitoring setup 
│ 
├─ 5.0 Frontend Development 
│ ├─ 5.1 Project Setup & Configuration 
│ │ ├─ 5.1.1 React project initialization 
│ │ ├─ 5.1.2 Dependencies installation 
│ │ └─ 5.1.3 Build & deployment configuration 
│ │ 
│ ├─ 5.2 UI Components Development 
│ │ ├─ 5.2.1 Common components (Button, Input, Modal, etc.) 
│ │ ├─ 5.2.2 Layout components (Header, Footer, Navbar) 
│ │ └─ 5.2.3 Form components with validation 
│ │ 
│ ├─ 5.3 Feature Development 
│ │ ├─ 5.3.1 Home page & product listing 
│ │ ├─ 5.3.2 Product detail page 
│ │ ├─ 5.3.3 Shopping cart & checkout 
│ │ ├─ 5.3.4 User account & profile 
│ │ ├─ 5.3.5 Order history & tracking 
│ │ └─ 5.3.6 Admin dashboard 
│ │ 
│ ├─ 5.4 API Integration 
│ │ ├─ 5.4.1 API client setup 
│ │ ├─ 5.4.2 State management (Redux/Context) 
│ │ └─ 5.4.3 Error handling & interceptors 
│ │ 
│ ├─ 5.5 Responsive Design 
│ │ ├─ 5.5.1 Mobile layout optimization 
│ │ ├─ 5.5.2 Tablet layout optimization 
│ │ └─ 5.5.3 Cross-browser testing 
│ │ 
│ └─ 5.6 Performance Optimization 
│ ├─ 5.6.1 Code splitting & lazy loading 
│ ├─ 5.6.2 Image optimization 
│ ├─ 5.6.3 Bundle size optimization 
│ └─ 5.6.4 Caching strategy 
│ 
├─ 6.0 Testing 
│ ├─ 6.1 Unit Testing 
│ │ ├─ 6.1.1 Backend unit tests (xUnit) 
│ │ ├─ 6.1.2 Frontend unit tests (Jest) 
│ │ └─ 6.1.3 Test coverage report (>80%) 
│ │ 
│ ├─ 6.2 Integration Testing 
│ │ ├─ 6.2.1 API integration testing 
│ │ ├─ 6.2.2 Database integration testing 
│ │ └─ 6.2.3 Third-party integration testing 
│ │ 
│ ├─ 6.3 System Testing 
│ │ ├─ 6.3.1 End-to-end testing 
│ │ ├─ 6.3.2 Performance testing 
│ │ ├─ 6.3.3 Load testing 
│ │ ├─ 6.3.4 Security testing (SAST & DAST) 
│ │ └─ 6.3.5 Accessibility testing 
│ │ 
│ ├─ 6.4 User Acceptance Testing (UAT) 
│ │ ├─ 6.4.1 UAT test case preparation 
│ │ ├─ 6.4.2 UAT execution with stakeholders 
│ │ ├─ 6.4.3 UAT defect resolution 
│ │ └─ 6.4.4 UAT sign-off 
│ │ 
│ └─ 6.5 Regression Testing 
│ └─ 6.5.1 Automated regression test suite 
│ 
├─ 7.0 Deployment 
│ ├─ 7.1 Pre-deployment Activities 
│ │ ├─ 7.1.1 Production environment setup 
│ │ ├─ 7.1.2 Production data preparation 
│ │ ├─ 7.1.3 Deployment procedure documentation 
│ │ └─ 7.1.4 Rollback plan preparation 
│ │ 
│ ├─ 7.2 Deployment Execution 
│ │ ├─ 7.2.1 Code deployment to production 
│ │ ├─ 7.2.2 Database migration & seeding 
│ │ ├─ 7.2.3 Configuration & environment setup 
│ │ └─ 7.2.4 Service validation 
│ │ 
│ ├─ 7.3 Post-deployment 
│ │ ├─ 7.3.1 Smoke testing in production 
│ │ ├─ 7.3.2 Performance monitoring 
│ │ ├─ 7.3.3 User support & training 
│ │ └─ 7.3.4 Issue resolution 
│ │ 
│ └─ 7.4 Cutover 
│ ├─ 7.4.1 Old system shutdown (if applicable) 
│ └─ 7.4.2 Data migration from legacy system 
│ 
├─ 8.0 Documentation 
│ ├─ 8.1 Technical Documentation 
│ │ ├─ 8.1.1 System architecture document 
│ │ ├─ 8.1.2 API documentation (Swagger/OpenAPI) 
│ │ ├─ 8.1.3 Database documentation 
│ │ ├─ 8.1.4 Deployment guide 
│ │ └─ 8.1.5 Operations manual 
│ │ 
│ ├─ 8.2 User Documentation 
│ │ ├─ 8.2.1 User guide / Help documentation 
│ │ ├─ 8.2.2 FAQ document 
│ │ ├─ 8.2.3 Tutorial videos 
│ │ └─ 8.2.4 Release notes 
│ │ 
│ ├─ 8.3 Training Materials 
│ │ ├─ 8.3.1 Admin training documentation 
│ │ ├─ 8.3.2 Support staff training 
│ │ └─ 8.3.3 End-user training materials 
│ │ 
│ └─ 8.4 Project Documentation 
│ ├─ 8.4.1 Project charter 
│ ├─ 8.4.2 Lessons learned report 
│ ├─ 8.4.3 Final project report 
│ └─ 8.4.4 Post-implementation review 
│ 
└─ 9.0 Project Closure 
├─ 9.1 Resource Release 
├─ 9.2 Archive project documents 
├─ 9.3 Final financial closure 
└─ 9.4 Stakeholder closeout meeting
```

## 📋 WBS Summary Table

| Code | Work Package | Type | Responsible | Effort (hrs) | Status |
|------|--------------|------|-------------|-------------|--------|
| 1.0 | Project Management | Mgmt | PM | 320 | |
| 2.0 | Requirements & Analysis | Analysis | BA | 160 | |
| 3.0 | System Design | Design | Tech Lead | 240 | |
| 4.0 | Backend Development | Dev | Dev Team | 1200 | |
| 5.0 | Frontend Development | Dev | Frontend Team | 1000 | |
| 6.0 | Testing | QA | QA Team | 400 | |
| 7.0 | Deployment | Ops | DevOps | 160 | |
| 8.0 | Documentation | Doc | Tech Writer | 320 | |
| 9.0 | Project Closure | Mgmt | PM | 80 | |
| **TOTAL** | | | | **3,880 hrs** | |

## ✅ Status: [Pending/In Progress/Completed]
_Cập nhật lần cuối: 2026-04-01_
