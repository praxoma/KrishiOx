# ADR-003 Domain Events

Status: Accepted

## Decision
All cross-context communication is event-driven.

Rules:
- Events are immutable.
- Events are versioned.
- Producers own event schemas.
- Consumers remain loosely coupled.
- Commands are never used across bounded contexts.
