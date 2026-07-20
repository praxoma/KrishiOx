# ADR-001 Booking and Assignment Ownership

Status: Accepted

## Decision
Booking owns the customer booking lifecycle.
Dispatch owns the assignment lifecycle.

## Rules
- Booking is authoritative for booking state.
- Dispatch is authoritative for assignment state.
- Communication occurs through domain events.
- Neither context updates the other's aggregate.

## Booking Events
- BookingRequested
- BookingConfirmed
- BookingCancelled
- BookingCompleted

## Dispatch Events
- AssignmentCreated
- AssignmentAccepted
- AssignmentRejected
- AssignmentCompleted
