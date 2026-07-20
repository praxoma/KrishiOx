# Praxoma

**Document ID:** ARC-004  
**Version:** 0.9  
**Status:** Draft  
**Owner:** Chief Architect  
**Audience:** Founders, Architects, Engineers, AI Assistants  
**Depends On:** ARC-000 – Architecture Philosophy  
**Related:** ARC-001 – Enterprise Strategy  
**Related:** ARC-002 – IELNex

---

# 1. Purpose

Praxoma is a healthcare coordination platform designed to simplify the interaction between patients, healthcare providers, diagnostic laboratories, pharmacies, hospitals, and healthcare partners.

Its purpose is to improve healthcare coordination through digital workflows while remaining independent of enterprise infrastructure concerns.

Praxoma owns healthcare business knowledge.

---

# 2. Mission

Enable connected healthcare by providing digital services that improve accessibility, coordination, operational efficiency, and patient experience.

Praxoma exists to solve healthcare problems.

Not enterprise infrastructure problems.

---

# 3. Vision

Build a healthcare coordination platform capable of supporting the complete patient journey.

The platform should evolve from an initial diagnostics-focused solution into a broader healthcare ecosystem while preserving its architectural foundations.

---

# 4. Business Domains

Praxoma owns healthcare-specific domains.

Examples include:

- Patient Management
- Healthcare Provider Management
- Diagnostic Laboratory Management
- Appointment Management
- Test Catalogue
- Test Booking
- Sample Collection
- Prescription Management
- Medical Reports
- Healthcare Packages
- Home Collection
- Pharmacy Coordination
- Healthcare Analytics
- Patient Communication
- Care Coordination

These domains belong exclusively to Praxoma.

---

# 5. Responsibilities

Praxoma is responsible for:

- healthcare workflows
- patient journeys
- clinical coordination
- healthcare terminology
- healthcare-specific reporting
- product-specific integrations
- customer experience

All healthcare knowledge remains inside Praxoma.

---

# 6. What Praxoma Does Not Own

Praxoma does not own reusable enterprise capabilities.

Examples include:

- Authentication
- Authorization
- Notifications
- Workflow Engine
- Configuration
- Audit
- AI Platform
- Scheduling Framework
- Integration Framework
- Observability

These capabilities are provided by IELNex.

---

# 7. Users

Praxoma may serve multiple user groups.

Examples include:

- Patients
- Diagnostic Laboratories
- Doctors
- Clinics
- Hospitals
- Pharmacies
- Sample Collection Agents
- Healthcare Coordinators
- Administrators
- Healthcare Partners

Additional healthcare participants may be introduced without changing the architecture.

---

# 8. Business Principles

## Patient-Centric

Every feature should improve the patient experience while supporting healthcare professionals.

---

## Coordination First

Healthcare involves multiple participants.

Praxoma should simplify collaboration rather than operate as an isolated system.

---

## Workflow Driven

Features should support complete healthcare workflows.

Avoid disconnected functionality.

---

## Data Integrity

Healthcare data must remain accurate, traceable, and consistently managed.

---

## Privacy by Design

Healthcare information should be protected through secure design, appropriate access control, and auditability.

Compliance requirements may evolve, but privacy principles remain constant.

---

# 9. Relationship with IELNex

Praxoma consumes enterprise capabilities.

Examples:

Authentication

↓

Provided by IELNex

Patient Management

↓

Owned by Praxoma

Notifications

↓

Provided by IELNex

Diagnostic Booking

↓

Owned by Praxoma

Workflow Engine

↓

Provided by IELNex

Sample Collection

↓

Owned by Praxoma

Business ownership always remains inside Praxoma.

---

# 10. Future Evolution

Praxoma should evolve according to healthcare needs rather than technology trends.

Potential future capabilities include:

- Telemedicine
- Electronic Health Records Integration
- Insurance Coordination
- Hospital Management Integration
- AI Clinical Assistance
- Preventive Healthcare
- Chronic Care Management
- Wellness Programs
- Remote Patient Monitoring
- Population Health Analytics

The architecture should accommodate these capabilities without fundamental redesign.

---

# 11. Success Criteria

Praxoma succeeds when:

- Patient care coordination improves.
- Healthcare workflows become simpler.
- Providers collaborate more efficiently.
- Enterprise capabilities are reused from IELNex.
- Healthcare knowledge remains independent from enterprise infrastructure.

---

# 12. Non-Goals

Praxoma is not:

- an enterprise platform
- an agriculture platform
- an identity provider
- an integration platform
- a general-purpose CRM

Its responsibility is healthcare coordination.

Nothing more.

---

# 13. Final Principle

Praxoma owns healthcare knowledge.

IELNex provides enterprise capabilities.

Neither should assume the responsibilities of the other.