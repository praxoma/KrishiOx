# Domain Model — KrishiOx

**Document ID:** ARC-007
**Version:** 0.1
**Status:** Draft
**Owner:** Business Analyst / Domain Architect (to be assigned)
**Audience:** Founders, Product Owners, Architects, Engineers, AI Assistants
**Depends On:** ARC-003 – KrishiOx, ARC-005 – Enterprise Capability Map, ARC-006 – Bounded Contexts, ARC-008 – Business Discovery

Status markers, carried forward from ARC-006/ARC-008: 🟢 Operating · 🟡 Declared, not yet observed operating · 🔵 Aspirational.

---

## Purpose

This document models the aggregates, entities, value objects, invariants, and lifecycles that make up each KrishiOx bounded context defined in ARC-006, and shows how those aggregates relate to one another across context boundaries.

## Scope

In scope: the domain model for the six KrishiOx bounded contexts (Booking, Farmer, Service Catalogue, Partner, Dispatch, Communications). Out of scope: IELNex's internal domain model (owned by the platform, not by this document — see ARC-002, ARC-005) and any technical realization of this model. This document ends where implementation begins.

## Ownership

Each aggregate below is owned by exactly one bounded context, matching ARC-006's ownership assignments. No aggregate is jointly owned. Where this document's model is more complete than current observed practice (per ARC-008), that gap is stated explicitly rather than implied away.

---

## Aggregate ownership — quick reference

| Aggregate | Bounded Context | Status |
|---|---|---|
| Booking | Booking | 🟢 Operating |
| Farmer | Farmer | 🟢 Operating, partially — see context notes |
| Service | Service Catalogue | 🟢 Operating |
| Partner | Partner | 🟡 Declared |
| Assignment | Dispatch | 🟢 Operating, informally |
| Message | Communications | 🟢 Operating, single channel |

Each bounded context currently resolves to exactly one aggregate root. Several value objects recur in more than one aggregate (Contact Details, Location); each owning context holds its own copy rather than sharing one mutable instance across a context boundary — see "Cross-context relationships" for why this matters here specifically.

---

## Booking

### Aggregate Roots
**Booking** — the sole aggregate in this context. A Booking has identity from the moment it is requested and is the unit of consistency for everything about one request.

### Entities
None beyond the aggregate root. Nothing inside a Booking currently has independent identity or its own lifecycle separate from the Booking itself.

### Value Objects
- **Requested Service** — a snapshot of the service name and unit of measure at the time of request (not a live link that changes if the catalogue entry later changes).
- **Location** — the village/area the service is needed in.
- **Extent** — the quantity requested, in the requested service's unit, or a free-text description for a request that doesn't fit the catalogue.
- **Preferred Timing** — the date the service is needed.
- **Contact Details** — name, and optionally a phone number, as given for this request.
- **Remarks** — optional free text.

### Business Invariants
- A Booking cannot exist without a Requested Service, a Location, and a Preferred Timing.
- A Booking requires a name; a phone number is optional.
- A Booking references exactly one Requested Service.
- Once Cancelled, a Booking cannot move to Acknowledged or Fulfilled.
- No payment is associated with a Booking (ARC-008 §9).

### Relationships between aggregates
- References **Farmer** — today, as a self-contained Contact Details snapshot rather than a link to a persistent Farmer aggregate (see Farmer context notes).
- References **Service** — as a snapshot taken at request time, not a live reference.
- Is referenced by **Assignment** (Dispatch) once submitted.
- Is referenced by **Message** (Communications) as the trigger for what a farmer needs to be told.

### Aggregate ownership
Booking bounded context. No other context may create or change a Booking directly — Dispatch and Communications react to it through events, not by modifying it.

### Domain Events affecting the aggregate
- **Produced:** Booking Requested (birth of the aggregate); Booking Cancelled (terminal).
- **Consumed:** Booking Acknowledged, Booking Fulfilled (both from Dispatch — advance this aggregate's status even though Dispatch owns the matching work itself).

### Lifecycle
```
(in progress, not yet an aggregate)
        │  farmer completes and confirms a request
        ▼
    Requested  ──────────────► Cancelled  (terminal)
        │
        │  Booking Acknowledged (from Dispatch)
        ▼
    Acknowledged ─────────────► Cancelled  (terminal)
        │
        │  Booking Fulfilled (from Dispatch)
        ▼
    Fulfilled  (terminal)
```
The in-progress state before submission is not the aggregate itself — the aggregate is born at Requested.

---

## Farmer

### Aggregate Roots
**Farmer** — represents one person the business knows about.

### Entities
None beyond the aggregate root.

### Value Objects
- **Contact Details** — name, phone number.
- **Location** — home village/area, where known.
- **Consent Record** — the policy version accepted, and when.

### Business Invariants
- A Consent Record must reference a specific policy version.
- If the current published policy version differs from a Farmer's recorded Consent Record, that Farmer is not considered consented and must re-consent before further engagement (ARC-008 §9).

### Relationships between aggregates
- Referenced by **Booking** — see the caveat below.
- Referenced by **Message** (Communications) as a recipient.

**Model-vs-practice gap:** ARC-008 found no evidence that a Farmer aggregate is actually created and persisted across multiple Bookings today. As modeled here, a Booking should reference a Farmer by identity; in current practice, a Booking instead carries its own Contact Details snapshot with no link back to a shared Farmer record. This section describes the intended aggregate boundary, not confirmed current behavior — closing this gap (or confirming it's intentional) is the single highest-value follow-up to this domain model.

### Aggregate ownership
Farmer bounded context.

### Domain Events affecting the aggregate
- **Produced:** Farmer Consent Recorded.
- **Consumed:** a policy-terms-changed occurrence, whose owning context is not yet identified (see ARC-006's "Explicitly outside this context" note for Farmer) — until that's resolved, this is an unowned external trigger rather than a proper cross-context event.

### Lifecycle
```
Unknown ──► Known (contact details captured) ──► Consented
                                                     │
                                     policy changes  │
                                                     ▼
                                              Consent Lapsed
                                                     │
                                          re-consents │
                                                     ▼
                                                Consented
```
No evidenced closed/deactivated state.

---

## Service Catalogue

### Aggregate Roots
**Service** — each service in the catalogue is its own aggregate instance. There is no single "Catalogue" aggregate encompassing all services — the catalogue is a collection of independently-managed Service aggregates, not one object that must change as a whole every time one service changes.

### Entities
None beyond the aggregate root.

### Value Objects
- **Name** — in the language(s) the business operates in.
- **Description**
- **Unit of Measure** — how a request against this service is quantified.

### Business Invariants
- A Service must have a Name and a Unit of Measure before it can be offered.
- A Service should be retired rather than removed outright once any Booking has referenced it, so historical requests remain meaningful — recommended given the Booking aggregate's use of a point-in-time snapshot; not confirmed as an enforced rule today.

### Relationships between aggregates
- Referenced by **Booking** as a snapshot at request time.
- 🔵 Referenced by **Partner** — aspirational; a Partner's fulfillment capability would logically be scoped to specific services, but this link is not evidenced today.

### Aggregate ownership
Service Catalogue bounded context. This is the sole source of truth for what a Booking may request.

### Domain Events affecting the aggregate
- **Produced:** Service Catalogue Changed — the general event named in ARC-006; at the level of an individual aggregate instance this manifests as a Service being introduced, retired, or redefined.
- **Consumed:** none identified.

### Lifecycle
```
Proposed ──► Active (offered) ──┬──► Redefined (remains Active)
                                 │
                                 └──► Retired (terminal; existing Booking
                                      snapshots that reference it remain valid)
```

---

## Partner

### Aggregate Roots
**Partner** — represents one equipment owner or fleet/agency operator, from first interest through to being an active fulfillment candidate.

### Entities
None beyond the aggregate root. Individual pieces of equipment are not currently modeled as separately identified entities — a Partner's equipment/fleet is described, not itemized, per ARC-003/ARC-005/ARC-006, none of which name equipment-level tracking as an established capability.

### Value Objects
- **Equipment/Fleet Description** — what the partner brings.
- **Service Area** — the geography this partner covers.
- **Verification Status**

### Business Invariants
- A Partner cannot receive work before being Approved.
- A Partner must have a Service Area before being eligible for matching.

### Relationships between aggregates
- Referenced by **Assignment** (Dispatch) as a candidate, and later as the assigned fulfiller.
- 🔵 References **Service** — aspirational; which services this partner can fulfill is not evidenced as tracked today.
- Referenced by **Message** (Communications) as a recipient.

### Aggregate ownership
Partner bounded context.

### Domain Events affecting the aggregate
- **Produced:** Partner Interest Submitted (birth of the aggregate); Partner Approved; Partner Service Area Changed.
- **Consumed:** none identified.

### Lifecycle
```
Interested ──► Under Verification ──► Approved ──► Service Area Changed
                      │                                (remains Approved)
                      ▼
                 (Rejected / Suspended — named here as plausible states;
                  neither is evidenced in current practice — ARC-008 Open
                  Question 4)
```

---

## Dispatch

### Aggregate Roots
**Assignment** — represents the matching of one Booking to whoever will fulfill it, and that match's progress.

### Entities
None beyond the aggregate root.

### Value Objects
- **Fulfiller Reference** — points to a Partner once one is identified. ARC-006 notes today's fulfiller may in practice be an untracked human coordinator rather than a Partner aggregate instance — the model below describes the intended shape.
- **Status** — Acknowledged or Fulfilled.

### Business Invariants
- An Assignment cannot be created for a Booking that has not been Requested.
- An Assignment cannot be Fulfilled without first being Acknowledged.

### Relationships between aggregates
- References **Booking** — the request being matched.
- References **Partner** — the fulfiller identified (or, in current practice, an untracked stand-in for this reference).
- Is referenced by **Message** (Communications) as a trigger.

**Model-vs-practice gap:** ARC-006 could not confirm this aggregate is instantiated as a distinct, tracked record today, as opposed to existing only inside a conversation between the business and a farmer or partner. As with Farmer, this section describes the intended aggregate, not confirmed current practice.

### Aggregate ownership
Dispatch bounded context. Dispatch is the only context permitted to move a Booking from Requested to Acknowledged or Fulfilled — it does so by emitting events that Booking consumes, not by altering the Booking aggregate directly.

### Domain Events affecting the aggregate
- **Produced:** Booking Acknowledged, Booking Fulfilled.
- **Consumed:** Booking Requested (from Booking — creates the Assignment); Partner Approved, Partner Service Area Changed (from Partner — determine which partners are eligible candidates).

### Lifecycle
```
Unmatched ──► Acknowledged ──► Fulfilled  (terminal)
     │
     └──► (Abandoned, if the originating Booking is Cancelled — a logical
           consequence, not a formally named event in ARC-006; flagged for
           confirmation rather than asserted)
```

---

## Communications

### Aggregate Roots
**Message** — one outbound communication triggered by a business event, or one inbound inquiry received.

### Entities
None beyond the aggregate root.

### Value Objects
- **Recipient Reference** — a Farmer or a Partner, by identity.
- **Content** — composed according to the triggering event.
- **Channel** — one channel is in active use today (ARC-008 §4).

### Business Invariants
- A Message must be triggered by an event from another context — Communications does not originate business-meaningful content of its own (ARC-006).

### Relationships between aggregates
- References **Farmer** or **Partner** as Recipient.
- Triggered by events from **Booking**, **Dispatch**, **Partner**, and **Farmer**.

**Model-vs-practice gap:** whether a Message is retained as a record at all, versus existing only transiently within the channel used to send it, is not confirmed (ARC-006/ARC-008).

### Aggregate ownership
Communications bounded context.

### Domain Events affecting the aggregate
- **Produced:** none identified — this context is a consumer of events, not a producer of business-meaningful ones.
- **Consumed:** Booking Requested, Booking Acknowledged, Booking Fulfilled; Partner Interest Submitted; Farmer Consent Recorded / policy-change notices.

### Lifecycle
```
Triggered (an event occurs) ──► Composed ──► Sent
```
Whether Delivered/Read status is tracked beyond Sent is unconfirmed.

---

## Cross-context relationships

```
   Farmer                                   Service
     │  (contact reference —                  │  (requested-service
     │   currently a snapshot,                 │   snapshot, not a
     │   not a live link;                      │   live link)
     │   see Farmer notes)                     │
     ▼                                         ▼
  ┌───────────────────────────────────────────────┐
  │                    Booking                      │
  └───────────────────────────────────────────────┘
                        │
                        │  Booking Requested
                        ▼
  ┌───────────────────────────────────────────────┐
  │                   Assignment                     │  ◄── Partner
  │                  (Dispatch)                       │     (fulfiller
  └───────────────────────────────────────────────┘      reference)
                        │
                        │  Booking Acknowledged / Booking Fulfilled
                        ▼
  ┌───────────────────────────────────────────────┐
  │                    Message                       │  ──► Farmer / Partner
  │                (Communications)                   │      (recipient)
  └───────────────────────────────────────────────┘
```

| Aggregate | Context | References (by identity/snapshot, never by containment) | Referenced by |
|---|---|---|---|
| Farmer | Farmer | — | Booking (contact), Message (recipient) |
| Service | Service Catalogue | — | Booking (snapshot), Partner (🔵) |
| Booking | Booking | Farmer, Service | Assignment, Message |
| Partner | Partner | Service (🔵) | Assignment, Message |
| Assignment | Dispatch | Booking, Partner | Message |
| Message | Communications | Farmer or Partner | — |

No aggregate contains another aggregate. Every cross-context relationship above is a reference by identity (or, where noted, a point-in-time snapshot), never one aggregate holding another's full record — each bounded context remains free to change its own aggregate's internal shape without breaking another context, as long as the identity/snapshot it exposes stays stable. This is consistent with ARC-000 Principle 6 (Loose Coupling) and Principle 3 (Products own their own business knowledge) applied one level down, between contexts within KrishiOx rather than between products.

The two **model-vs-practice gaps** called out above (Farmer, Assignment) are the ones that matter most here: this diagram shows Booking referencing a persistent Farmer and Dispatch operating through a tracked Assignment, because that is the coherent target model — ARC-008 found neither is confirmed as operating that way today. Treat those two links as the design intent, not as verified fact, until confirmed.

---

## Decisions

None. This document models the domain as discovered and intended; it makes no implementation or technology decisions.

## References

- ARC-003 – KrishiOx
- ARC-005 – Enterprise Capability Map
- ARC-006 – Bounded Contexts
- ARC-008 – Business Discovery
