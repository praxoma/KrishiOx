# Enterprise Capability Map

**Document ID:** ARC-005  
**Version:** 0.9  
**Status:** Draft  
**Owner:** Chief Architect  
**Audience:** Founders, Architects, Engineers, AI Assistants  
**Depends On:** ARC-000 – Architecture Philosophy  
**Related:** ARC-001 – Enterprise Strategy  
**Related:** ARC-002 – IELNex  
**Related:** ARC-003 – KrishiOx  
**Related:** ARC-004 – Praxoma

---

# 1. Purpose

This document defines the enterprise capabilities within the ecosystem and identifies which platform owns each capability.

Its objectives are to:

- eliminate ownership ambiguity
- prevent duplicated functionality
- guide future architectural decisions
- support consistent product development
- prepare the foundation for bounded contexts

---

# 2. What is an Enterprise Capability?

A capability is a stable business or technical function that provides value to one or more products.

Capabilities describe **what** the ecosystem can do.

They do not describe **how** the capability is implemented.

---

# 3. Capability Classification

Capabilities belong to one of three categories.

## Enterprise Capability

Reusable across multiple products.

Owned by IELNex.

Examples:

- Authentication
- Notifications
- Workflow Engine

---

## Product Capability

Specific to a business domain.

Owned by the product.

Examples:

- Crop Management
- Patient Management

---

## External Capability

Provided by external partners.

Examples:

- WhatsApp
- Payment Gateway
- SMS Provider
- Government APIs

These are integrated but never owned.

---

# 4. Enterprise Capability Inventory

| Capability | Owner | Used By |
|------------|-------|---------|
| Identity & Authentication | IELNex | All Products |
| Authorization | IELNex | All Products |
| User Management | IELNex | All Products |
| Organization Management | IELNex | All Products |
| Role Management | IELNex | All Products |
| Workflow Engine | IELNex | All Products |
| Notification Framework | IELNex | All Products |
| Audit & Activity Logging | IELNex | All Products |
| Configuration Management | IELNex | All Products |
| Scheduling | IELNex | All Products |
| Document Management | IELNex | All Products |
| Search Framework | IELNex | All Products |
| Reporting Framework | IELNex | All Products |
| Integration Framework | IELNex | All Products |
| API Gateway | IELNex | All Products |
| Event Bus | IELNex | All Products |
| AI Services | IELNex | All Products |
| Feature Management | IELNex | All Products |
| Monitoring | IELNex | All Products |
| Health Checks | IELNex | All Products |
| Security Services | IELNex | All Products |

---

# 5. KrishiOx Capability Inventory

| Capability | Owner |
|------------|-------|
| Farmer Management | KrishiOx |
| Farm Management | KrishiOx |
| Land Management | KrishiOx |
| Crop Management | KrishiOx |
| Biomass Management | KrishiOx |
| Procurement | KrishiOx |
| Collection Centers | KrishiOx |
| Transportation Planning | KrishiOx |
| Inventory Management | KrishiOx |
| Marketplace | KrishiOx |
| Sustainability | KrishiOx |
| Carbon Initiatives | KrishiOx |
| Agricultural Advisory | KrishiOx |
| Agricultural Analytics | KrishiOx |

---

# 6. Praxoma Capability Inventory

| Capability | Owner |
|------------|-------|
| Patient Management | Praxoma |
| Provider Management | Praxoma |
| Diagnostic Management | Praxoma |
| Appointment Management | Praxoma |
| Test Catalogue | Praxoma |
| Test Booking | Praxoma |
| Sample Collection | Praxoma |
| Prescription Management | Praxoma |
| Medical Reports | Praxoma |
| Care Coordination | Praxoma |
| Healthcare Packages | Praxoma |
| Pharmacy Coordination | Praxoma |
| Healthcare Analytics | Praxoma |

---

# 7. External Capability Inventory

The ecosystem integrates with external capabilities rather than implementing them internally.

Examples include:

- WhatsApp Business Platform
- SMS Providers
- Email Providers
- Payment Providers
- Mapping Services
- Weather Providers
- Government Services
- ERP Systems
- AI Providers
- Cloud Storage Providers

External providers may change without affecting business ownership.

---

# 8. Capability Ownership Rules

Every capability has one owner.

Ownership implies responsibility for:

- business rules
- lifecycle
- evolution
- documentation
- quality

Consumers may use a capability but must not redefine it.

---

# 9. Capability Evolution

A capability may move from a product into IELNex only when:

- multiple products require it
- it contains no domain-specific business rules
- central ownership improves consistency
- migration reduces duplication

Capabilities should never move simply because another product has a similar name.

---

# 10. Capability Dependencies

Dependencies should always follow this direction:

```text
Business Product
        │
        ▼
Enterprise Capability
        │
        ▼
Infrastructure
```

Products should not depend directly on other products.

Enterprise capabilities should not depend on product-specific capabilities.

---

# 11. Decision Checklist

Before creating a new capability, answer:

1. Is this business-specific?
2. Can another product reuse it?
3. Who owns the business rules?
4. Is there an existing capability?
5. Would central ownership reduce duplication?
6. Is this actually an integration rather than a capability?

Only after answering these questions should a new capability be introduced.

---

# 12. Success Criteria

The capability map succeeds when:

- every capability has exactly one owner
- duplicated functionality is minimized
- products remain independent
- IELNex remains business-agnostic
- new products can quickly identify reusable services
- architectural decisions become easier and more consistent

---

# 13. Final Principle

Capabilities define responsibilities.

Responsibilities define ownership.

Ownership defines architecture.