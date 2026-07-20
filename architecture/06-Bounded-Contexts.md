# Bounded Contexts — KrishiOx

**Document ID:** ARC-006
**Version:** 0.2
**Status:** Draft
**Owner:** Business Analyst (to be assigned)
**Audience:** Founders, Product Owners, Architects, Engineers, AI Assistants
**Depends On:** ARC-003 – KrishiOx, ARC-005 – Enterprise Capability Map, ARC-008 – Business Discovery

Status markers carried forward from ARC-008: 🟢 Operating · 🟡 Declared, not yet observed operating · 🔵 Aspirational.

---

## KrishiOx

### Booking

**Status:** 🟢 Operating

**Purpose**
Capture a farmer's request for a service and hold it through to fulfillment.

**Responsibilities**
- Accept a farmer's request for a specific service, location, and timing.
- Require the minimum information needed to act on a request: a service, a location, a timing, and a name; a phone number is optional.
- Hold a request's details until it is handed off for fulfillment.
- Track a request's status, to the extent this is currently possible — see ARC-008 §6, which found no evidence that fulfillment is formally recorded once a request leaves this context.

**Core entities owned**
- Booking — service requested, location, quantity or free-text description, timing, contact details, remarks.

**Business events produced**
- Booking Requested
- Booking Cancelled

**Business events consumed**
- Booking Acknowledged (from Dispatch)
- Booking Fulfilled (from Dispatch)
- Service Catalogue Changed (from Service Catalogue)

**Relationships with other bounded contexts**
- Farmer — a Booking carries a farmer's contact details.
- Service Catalogue — a Booking references one defined service.
- Dispatch — a submitted Booking is handed off for matching to a fulfiller.
- Communications — a Booking's details are the basis for what gets sent to a farmer.

**Explicitly outside this context**
- Deciding who fulfills a request (Dispatch).
- Farmer identity or history beyond a single request (Farmer).
- Defining what services exist (Service Catalogue).
- Sending or tracking any message (Communications).
- Partner onboarding or verification (Partner).

---

### Farmer

**Status:** 🟢 Operating, partially — see note below

**Purpose**
Represent the person KrishiOx exists to serve, and hold what the business knows about them.

**Responsibilities**
- Hold a farmer's contact details (name, phone) as known to the business.
- Hold a farmer's village or location, where known.
- Hold a farmer's consent status against currently published policy terms, and require renewed consent when those terms change materially.
- Note: ARC-008 found no evidence of a persistent farmer identity carried across multiple requests — today, contact details appear to be captured fresh with each Booking rather than referencing an established Farmer record. This context's scope is written as intended, not as confirmed current behavior; see ARC-008 Open Question 1.

**Core entities owned**
- Farmer — name, contact number, village/location, consent record.

**Business events produced**
- Farmer Consent Recorded

**Business events consumed**
- Policy Terms Changed (source context not yet identified — see "Explicitly outside this context" below)

**Relationships with other bounded contexts**
- Booking — a Booking is associated with a Farmer's contact details.
- Communications — consent-related notices are delivered through Communications.

**Explicitly outside this context**
- Publishing or changing policy terms — no context currently owns this; it is presently treated as an external input to Farmer, not a KrishiOx-owned responsibility. Flagged for confirmation.
- Anything about a request itself (Booking).
- Anything about a Partner (Partner).

---

### Service Catalogue

**Status:** 🟢 Operating

**Purpose**
Define and maintain the set of services a farmer can request.

**Responsibilities**
- Name and describe each service offered.
- Define the unit a service is requested in (area, hours, trips, distance, workers — or a free description for a request that doesn't fit the defined set).
- Add, retire, or redefine services as the offering changes.
- Present the current offering for browsing and selection.

**Core entities owned**
- Service — name, description, unit of measure.

**Business events produced**
- Service Catalogue Changed

**Business events consumed**
- None identified. The catalogue is treated as authoritative and does not appear to depend on events from elsewhere.

**Relationships with other bounded contexts**
- Booking — every Booking references one Service.
- Partner — 🔵 a Partner's ability to fulfill work is presumably scoped to specific services, but this link is not evidenced today.

**Explicitly outside this context**
- Whether a specific request can actually be fulfilled (Dispatch, Partner).
- Pricing or commercial terms — not owned by any context today; see ARC-008 Open Question 7.
- Farm, crop, or biomass detail — aspirational KrishiOx capabilities (ARC-003 §4) not yet reflected in any operating context.

---

### Partner

**Status:** 🟡 Declared, not yet observed operating

**Purpose**
Represent equipment owners and fleet/agency operators who supply services, from initial interest through to being available to receive work.

**Responsibilities**
- Capture a prospective partner's interest and the equipment or fleet information they provide.
- Verify a partner before they can receive work — criteria and owner of this step are undocumented (ARC-008 Open Question 4).
- Hold a partner's assigned service area.
- Make verified partners visible to Dispatch as fulfillment candidates.

**Core entities owned**
- Partner — equipment owner or fleet/agency identity, equipment/fleet information, service area, verification status.

**Business events produced**
- Partner Interest Submitted
- Partner Approved
- Partner Service Area Changed

**Business events consumed**
- None identified.

**Relationships with other bounded contexts**
- Dispatch — an approved Partner is a candidate for fulfilling a Booking.
- Service Catalogue — 🔵 a Partner's capability is presumably scoped to specific services; not evidenced today.

**Explicitly outside this context**
- Matching a specific Booking to a specific Partner (Dispatch).
- Farmer-side information (Farmer).
- Any commercial or payment arrangement with a Partner — not owned by any context today; see ARC-008 Open Question 7.

---

### Dispatch

**Status:** 🟢 Operating, informally — see note below

**Purpose**
Match a submitted Booking to whoever will fulfill it, and track that match through to completion.

**Responsibilities**
- Receive a submitted Booking.
- Identify a capable, available fulfiller for it.
- Acknowledge a Booking once a fulfiller is identified.
- Record that a Booking has been fulfilled.
- Note: ARC-008 found this matching function operating today, but without evidence of a formal, systematic process distinct from direct coordination — see ARC-008 Open Question 3 on whether this is a defined role with defined capacity, or an ad hoc function.

**Core entities owned**
- The match between a Booking and a fulfiller. ARC-008 could not confirm this is held as a distinct, named record today rather than existing only inside a conversation.

**Business events produced**
- Booking Acknowledged
- Booking Fulfilled

**Business events consumed**
- Booking Requested (from Booking)
- Partner Approved, Partner Service Area Changed (from Partner)

**Relationships with other bounded contexts**
- Booking — receives every submitted Booking and reports status back to it.
- Partner — draws on approved partners as fulfillment candidates.
- Communications — an acknowledged or fulfilled Booking is what a farmer needs to be told about.

**Explicitly outside this context**
- Deciding what a farmer requested (Booking).
- Approving or onboarding a Partner (Partner).
- Composing or sending any message (Communications).

---

### Communications

**Status:** 🟢 Operating, single channel

**Purpose**
Reach a farmer, partner, or other party with what a business event requires them to know.

**Responsibilities**
- Compose a message appropriate to a business event (a new request, a confirmation, a support inquiry).
- Deliver that message through the channel(s) currently in use — one channel is in active use today (ARC-008 §4).
- Handle inbound inquiries directed at the business through that same channel.

**Core entities owned**
- Message — recipient, content, channel. ARC-008 found no evidence this is retained as a record rather than existing only within the channel itself.

**Business events produced**
- None identified. This context reacts to events; it does not originate business-meaningful ones of its own.

**Business events consumed**
- Booking Requested, Booking Acknowledged, Booking Fulfilled (from Booking, Dispatch)
- Partner Interest Submitted (from Partner)
- Farmer Consent Recorded / policy-change notices (from Farmer)

**Relationships with other bounded contexts**
- Booking, Dispatch — supply the events that need to reach a farmer.
- Partner — supplies the events that need to reach a prospective or active partner.
- Farmer — the party most communications are addressed to.

**Explicitly outside this context**
- Deciding what happened — that belongs to whichever context produced the event.
- Whether to expand beyond the current single channel — an open business question, ARC-008 Open Question 10.

---

## IELNex

Bounded contexts within IELNex (Identity, Workflow, Notifications, Audit, Integrations, AI) are owned and defined by the enterprise platform, not by KrishiOx. ARC-008 discovered the KrishiOx business specifically and did not re-discover IELNex's internal contexts; they are listed here only as the reusable capabilities the contexts above may draw on (per ARC-002, ARC-005), not as detailed or confirmed by this document.

- Identity
- Workflow
- Notifications
- Audit
- Integrations
- AI

---

## References

- ARC-003 – KrishiOx
- ARC-005 – Enterprise Capability Map
- ARC-008 – Business Discovery
