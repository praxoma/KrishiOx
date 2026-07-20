# ADR-002 Platform Boundary

Status: Accepted

## Decision
IELNex is an enterprise platform providing reusable capabilities.
Business products consume platform capabilities through published contracts.

## Platform Owns
- Identity
- Notifications
- Workflow engine
- Audit
- Integration
- Scheduling capability
- Communication capability

## Products Own
- Business rules
- Domain models
- Product workflows
- Customer experience

Products never depend on another product directly.
