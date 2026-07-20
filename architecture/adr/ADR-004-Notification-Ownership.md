# ADR-004 Notification Ownership

Status: Accepted

## Decision
Products decide WHEN notifications are required.
IELNex decides HOW notifications are delivered.

Products publish NotificationRequested events.
IELNex handles provider selection, retries, templates and delivery.
