# Strategic Context Map — KrishiOx

**Document ID:** ARC-009
**Version:** 0.1
**Status:** Draft
**Owner:** Domain Architect (to be assigned)
**Audience:** Founders, CTO, Product Owners, Architects, Engineers, AI Assistants
**Depends On:** ARC-000 – Architecture Philosophy, ARC-002 – IELNex, ARC-003 – KrishiOx, ARC-005 – Enterprise Capability Map, ARC-006 – Bounded Contexts, ARC-007 – Domain Model, ARC-008 – Business Discovery

Status markers, carried forward from ARC-006/007/008: 🟢 Operating · 🟡 Declared, not yet observed operating · 🔵 Aspirational.

---

# Purpose

This document exists to describe how KrishiOx's bounded contexts relate to one another, to IELNex, and to the external systems the business will eventually depend on.

ARC-006 defined what each bounded context is responsible for. ARC-007 modeled what each context contains. Neither describes how contexts should relate to each other in strategic terms — which context leads, which follows, which must be shielded from another's model, and which communications are safe to depend on long-term. This document closes that gap.

It defines strategic relationships, not technical ones. It answers questions such as: which context is upstream of which; where a translation boundary is required; where KrishiOx must simply accept an external model as given; and where two contexts are free to evolve independently without breaking each other. It does not answer how any of that gets built.

---

# Scope

## In Scope

- KrishiOx bounded contexts
- IELNex shared enterprise capabilities
- External integrations
- Relationship patterns
- Context ownership
- Communication styles

## Out of Scope

- Database design
- APIs
- Deployment
- Infrastructure
- Technology implementation

---

# Context Landscape

KrishiOx currently comprises six bounded contexts, all defined in ARC-006 and modeled in ARC-007. They are restated here at a strategic level only.

**Farmer** represents the person KrishiOx exists to serve, and holds what the business knows about them — contact details, location, and consent status against current policy terms. It is the identity that other contexts reference when a farmer initiates or must be reached.

**Booking** is the core transactional context. It captures a farmer's request for a specific service, at a specific place and time, and carries that request from submission through to a decision about fulfillment. Every other current context exists, directly or indirectly, in service of this one.

**Service Catalogue** defines what can be requested — the named, described set of services KrishiOx offers, each with its own unit of measure. It is the authoritative source Booking depends on for what a request may reference.

**Partner** represents the supply side of the business — equipment owners and fleet or agency operators — from initial interest through verification to being available to receive work.

**Dispatch** matches a submitted Booking to a capable fulfiller and tracks that match through to completion. It is the coordination point between demand, held in Booking, and supply, held in Partner.

**Communications** reaches farmers and partners with what a business event requires them to know, and receives inbound inquiries directed at the business. It reacts to events produced elsewhere and does not originate business meaning of its own.

---

# Context Ownership

## KrishiOx bounded contexts

| Context | Owner | Business Responsibility |
|---|---|---|
| Farmer | KrishiOx | Who the business serves, and what it knows about them |
| Booking | KrishiOx | Capturing and holding a farmer's request through to a fulfillment decision |
| Service Catalogue | KrishiOx | Defining what may be requested |
| Partner | KrishiOx | Who supplies services, and whether they are fit to |
| Dispatch | KrishiOx | Matching demand to supply |
| Communications | KrishiOx | Reaching the right person with the right business information |

## IELNex shared capabilities

| Capability | Owner | Business Responsibility |
|---|---|---|
| Identity | IELNex | Recognizing and authenticating a person or organization across any product |
| Notifications | IELNex | Delivering a message through whichever channel is appropriate, reliably |
| Workflow | IELNex | Executing a defined sequence of steps on a product's behalf |
| Audit | IELNex | Recording that something happened, for accountability and traceability |
| AI | IELNex | Providing shared intelligence services any product may draw on |
| Configuration | IELNex | Letting a product adapt platform behavior without modifying platform code |
| Integration | IELNex | Connecting to external systems on behalf of every product, once |

## Business ownership vs. platform capability ownership

These are two different kinds of ownership and must not be conflated.

**Business ownership** (KrishiOx, for the six contexts above) means owning *why* something happens, *what it means*, and *what the business rules are*. This ownership cannot move to IELNex under any circumstance — ARC-000 Principle 3 and ARC-002 §5 are explicit that business knowledge never belongs to the platform.

**Platform capability ownership** (IELNex, for the seven capabilities above) means owning *how* a reusable, business-agnostic function is delivered, consistently, to every product that needs it. IELNex owning Notifications does not mean IELNex decides when a farmer should be notified or what a message should say — only that IELNex is responsible for getting a message delivered once KrishiOx has decided one is needed. See "Integration Boundaries" below for the precise split.

---

# Context Relationships

```
  Service Catalogue                    Farmer
         │                                │
         │ Customer/Supplier              │ Customer/Supplier
         ▼                                ▼
   ┌─────────────────────────────────────────┐
   │                  Booking                   │
   └─────────────────────────────────────────┘
         │  Customer/Supplier (Booking Requested)
         ▼
   ┌─────────────────────────────────────────┐
   │                  Dispatch                   │◄── Partner
   └─────────────────────────────────────────┘   Customer/Supplier
         │  Customer/Supplier (Booking Acknowledged / Fulfilled)
         ▼
      Booking (status updated)

   Booking, Dispatch, Partner, Farmer
         │  Customer/Supplier, mediated by a Published Language
         ▼
   ┌─────────────────────────────────────────┐
   │               Communications                │
   └─────────────────────────────────────────┘
```

| Source Context | Target Context | Relationship Pattern | Reason |
|---|---|---|---|
| Service Catalogue | Booking | Customer/Supplier | Service Catalogue is upstream and defines what may be requested. Booking depends on it but never alters a catalogue definition, and takes a point-in-time snapshot so later catalogue changes never retroactively change a submitted request. |
| Farmer | Booking | Customer/Supplier | Farmer is the intended upstream source of who is making a request. Booking depends on that identity without owning or changing it. (ARC-007 records this as the intended relationship — current practice carries contact details directly rather than referencing Farmer; see ARC-007's Farmer notes.) |
| Booking | Dispatch | Customer/Supplier | Dispatch cannot begin matching until a Booking has been requested. Booking's request defines the work Dispatch must act on, and Dispatch conforms to Booking's shape rather than the reverse. |
| Dispatch | Booking | Customer/Supplier | Booking's own status (acknowledged, fulfilled) is driven by outcomes decided within Dispatch. Booking reflects those outcomes without directing how Dispatch reaches them. |
| Partner | Dispatch | Customer/Supplier | Partner determines who is verified and eligible to receive work. Dispatch depends on that determination when selecting a fulfiller but has no say in how Partner verifies anyone. |
| Service Catalogue | Partner | Customer/Supplier (🔵 aspirational) | A Partner's fulfillment capability is expected to be scoped to specific services. Not evidenced as an active relationship today. |
| Booking | Communications | Customer/Supplier, mediated by a Published Language | Communications reacts to Booking's events using the shared, named business-event vocabulary defined in ARC-006, and never depends on Booking's internal structure. |
| Dispatch | Communications | Customer/Supplier, mediated by a Published Language | As above, for Booking Acknowledged and Booking Fulfilled. |
| Partner | Communications | Customer/Supplier, mediated by a Published Language | As above, for Partner Interest Submitted. |
| Farmer | Communications | Customer/Supplier, mediated by a Published Language | As above, for consent-related notices. |

**No Shared Kernel exists, or is justified, among KrishiOx's bounded contexts.** Each context owns its own model in full; none share code, structure, or a common mutable object. Every relationship above is either a reference to another context's identity, or a reaction to a published business event — never a shared model.

**Anti-Corruption Layer** and **Conformist** are deliberately not used anywhere above: both are appropriate where a context must protect itself from — or has no choice but to accept — a foreign, differently-governed model. All six KrishiOx contexts are commonly owned and co-designed, so none currently needs protecting from another. These patterns do appear later in this document, at the boundary with IELNex and with external systems, where that condition genuinely holds.

---

# Communication Patterns

| Source | Target | Interaction Type | Purpose |
|---|---|---|---|
| Booking | Dispatch | Domain Event | Notify Dispatch that a new request needs matching |
| Dispatch | Booking | Domain Event | Update a Booking's status once acknowledged or fulfilled |
| Partner | Dispatch | Domain Event | Keep Dispatch's pool of eligible fulfillment candidates current |
| Booking | Communications | Domain Event | Trigger farmer-facing messaging for a new or cancelled request |
| Dispatch | Communications | Domain Event | Trigger status-update messaging once a request is acknowledged or fulfilled |
| Partner | Communications | Domain Event | Trigger acknowledgement messaging to a prospective partner |
| Farmer | Communications | Domain Event | Trigger consent-related notices |
| Booking | Farmer | Reference | Identify who is making a request |
| Booking | Service Catalogue | Reference | Identify what is being requested, as a snapshot taken at request time |
| Dispatch | Partner | Reference | Identify the fulfiller once one is selected |
| Communications | Farmer / Partner | Reference | Identify the recipient of a message |

Only **Domain Event** and **Reference** are evidenced in current KrishiOx context relationships. No context currently issues a **Command** to another context, and no context **Queries** another's state directly — see "Architectural Constraints," which is written to keep it that way by default rather than as an accident of current scale.

---

# Integration Boundaries

KrishiOx's bounded contexts never implement platform capabilities themselves, and IELNex never makes a business decision on KrishiOx's behalf. The boundary is exact:

**KrishiOx owns:**
- business meaning
- notification intent
- business events
- business decisions

**IELNex owns:**
- delivery
- workflow execution
- authentication
- audit
- channel adapters
- integration plumbing

Concretely: when Booking, Dispatch, Partner, or Farmer determines that a farmer or partner needs to know something, that decision — *that* a message is needed, *why*, and *what it should convey* — is entirely KrishiOx's, expressed through Communications. Everything after that — actually getting the message delivered, through whichever channel, retried if it fails, recorded for audit — belongs to IELNex.

IELNex acts as an **Open Host Service** toward KrishiOx: it publishes stable, reusable capabilities (Identity, Notifications, Workflow, Audit, AI, Configuration, Integration) that KrishiOx — and any future product — consumes on the same terms, without a bespoke integration negotiated per product. This is intentional and is what makes IELNex reusable at all (ARC-002 §6, "API First"). KrishiOx adapts IELNex's behavior through configuration, not by asking IELNex to change its model to fit KrishiOx's business vocabulary (ARC-002 §6, "Configuration Over Customization") — and correspondingly, IELNex must never absorb agricultural business meaning in order to serve KrishiOx specifically (ARC-002 §5).

Dependency direction is one-way: KrishiOx depends on IELNex; IELNex never depends on KrishiOx (ARC-002 §7). No KrishiOx bounded context calls an external system directly under any circumstance — see "External Systems" and "Architectural Constraints."

---

# External Systems

| External System | Purpose | Owner | Boundary | Expected Adapter |
|---|---|---|---|---|
| WhatsApp Cloud API | Deliver and receive farmer/partner messages on the channel currently in active use (ARC-008 §4) | WhatsApp / Meta | Reached only through IELNex's Integration and Notification capabilities | Anti-Corruption Layer within IELNex, translating WhatsApp's own message and delivery model into KrishiOx's notification-intent vocabulary |
| SMS Providers | Alternate or future messaging channel | Respective SMS provider | Reached only through IELNex | Anti-Corruption Layer within IELNex |
| Email Providers | Alternate or future messaging channel, including grievance/legal correspondence | Respective email provider | Reached only through IELNex | Anti-Corruption Layer within IELNex |
| Payment Gateway | 🔵 Aspirational — no payment is currently handled by the business (ARC-008 §9); named for future readiness | Respective payment provider | Would be reached only through IELNex | Anti-Corruption Layer within IELNex |
| Google Maps / Mapping Services | 🔵 Aspirational — structured location support beyond free-text village naming | Google / respective mapping provider | Would be reached only through IELNex | Anti-Corruption Layer within IELNex |
| Government APIs | 🔵 Aspirational — regulatory, compliance, or scheme-related interaction (ARC-008 Open Question 8) | Respective government agency | Would be reached only through IELNex | Anti-Corruption Layer within IELNex; the relationship itself is expected to be **Conformist** — KrishiOx has no ability to influence how a government system models its own data or process |
| Weather Providers | 🔵 Aspirational — supports Advisory Services (ARC-003 §10) | Respective weather provider | Would be reached only through IELNex | Anti-Corruption Layer within IELNex |

All external systems are accessed exclusively through IELNex's Integration capability. No KrishiOx bounded context calls, or is aware of the existence of, an external system directly. This keeps every external vendor a replaceable implementation detail (ARC-001 §4, Layer 3) rather than a dependency any business context has to know about.

---

# Future Context Landscape

The following are named business contexts KrishiOx's approved documents anticipate but do not yet operate (ARC-003 §4/§10, ARC-005 §5, ARC-008 §4). They are listed, not modeled — no aggregates, entities, or relationships are defined for any of them here.

| Future Context | Current Status | Activation Trigger | Reason |
|---|---|---|---|
| Farm | 🔵 Aspirational | Farmers need a persistent, multi-request view of their own operation rather than one-off bookings | Enables continuity across requests and farm-level planning; likely depends on the Farmer persistence gap (ARC-007) being closed first |
| Field | 🔵 Aspirational | Farm exists and needs sub-division into distinct plots | Supports operations that vary by plot rather than by farm as a whole |
| Crop | 🔵 Aspirational | Demand for crop-cycle-aware service timing, or Advisory needing something concrete to advise about | Booking currently captures only a preferred date, with no crop-cycle context behind it |
| Biomass | 🔵 Aspirational | Procurement or Collection Centers become active | No operating process currently touches biomass at all (ARC-008 §5) |
| Procurement | 🔵 Aspirational | The business begins sourcing produce or biomass from farmers, rather than only providing services to them | Named via the "Procurement Teams" actor (ARC-003 §7) with no evidenced process behind it (ARC-008 §5–§6) |
| Marketplace | 🔵 Aspirational | Farmers or partners need to transact directly through KrishiOx, beyond requesting a service | No evidenced marketplace transaction today (ARC-008 §5–§6) |
| Settlement | 🔵 Aspirational / not yet named in ARC-003 or ARC-005 | Any context (Booking, Marketplace, Procurement) begins requiring a financial settlement between parties | No context currently owns commercial or payment terms at all — an explicit gap named in both ARC-006 (Service Catalogue, Partner) and ARC-008 (Open Question 7) |
| Carbon | 🔵 Aspirational | A concrete sustainability or carbon program, or partner commitment, begins | Named with an intended stakeholder group (Sustainability Partners, ARC-003 §7) but no evidenced active program (ARC-008 Open Question 11) |
| Analytics | 🔵 Aspirational | Enough operating history accumulates across Booking, Dispatch, and Partner, and a defined set of success measures exists | ARC-003 §8's "Data Before Assumptions" principle implies this is wanted; ARC-008 Open Question 9 found no current measurement to build on |
| Advisory | 🔵 Aspirational | Crop and/or Farm exist to give advisory something concrete to reference, or a staffed/automated advisory function is stood up | Named as a capability (ARC-003 §4, ARC-005 §5) with no evidence of who would deliver it or how (ARC-008 §5, process 8) |

---

# Architectural Constraints

1. Contexts own their own data. No context reaches into another context's model to read or change it directly.
2. Aggregates never update aggregates in another context. Cross-context effects happen only through the receiving context reacting to what it is told.
3. Cross-context communication occurs through domain events or application services — never through one context directly manipulating another's internals.
4. External systems are never called directly by business contexts. Every external call passes through IELNex's Integration capability.
5. IELNex remains product-agnostic. It must never absorb agricultural (or any product's) business meaning in order to serve that product better.
6. Business events are immutable. Once published, a business event describes something that has already happened and is not revised.
7. Context ownership must remain explicit. Every capability, business or platform, has exactly one named owner (ARC-000 Principle 5, ARC-005 §8) — this document exists specifically to keep that visible as the landscape grows.
8. Dependency direction between KrishiOx and IELNex is one-way. KrishiOx depends on IELNex; IELNex never depends on KrishiOx (ARC-002 §7).
9. No Shared Kernel is introduced between bounded contexts, or between KrishiOx and IELNex, without explicit, documented justification recorded as an ADR.

---

# References

- ARC-000
- ARC-001
- ARC-002
- ARC-003
- ARC-005
- ARC-006
- ARC-007
- ARC-008
