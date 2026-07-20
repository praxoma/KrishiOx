# Business Discovery — KrishiOx

**Document ID:** ARC-008
**Version:** 0.1
**Status:** Draft (Discovery — not yet approved)
**Owner:** Business Analyst (to be assigned)
**Audience:** Founders, Product Owners, Architects, Engineers, AI Assistants
**Depends On:** ARC-000 – Architecture Philosophy
**Related:** ARC-001 – Enterprise Strategy, ARC-002 – IELNex, ARC-003 – KrishiOx, ARC-005 – Enterprise Capability Map, ARC-006 – Bounded Contexts

---

## Purpose

This document discovers and records the **business** behind KrishiOx — the people it serves, the value it creates, the work it performs, and the language it uses to describe that work.

It is deliberately not a design document. It does not describe systems, data structures, or technical solutions. Its only goal is to make the business itself legible, so that every future decision — architectural or otherwise — starts from a correct understanding of what KrishiOx actually is and does.

## Scope

In scope: KrishiOx as a business — its stakeholders, actors, goals, capabilities, processes, workflows, events, terminology, and rules, as evidenced by the approved enterprise architecture documents (ARC-000 through ARC-007) and by observable current operating practice.

Out of scope: Praxoma (referenced only where it usefully illustrates how the ecosystem separates one business from another) and any discussion of how KrishiOx is technically implemented.

## Ownership

This is a discovery artifact. It records what has been found, not what has been decided. Findings should be reviewed and either confirmed, corrected, or superseded by the business owner(s) of KrishiOx. Until that review happens, nothing in this document should be treated as approved fact — see the "Open Questions" section, which is the most load-bearing part of this document.

## Dependencies

This discovery depends on ARC-000 through ARC-007 for what the business *is intended to become*, and on observable current practice for what the business *is today*. Where the two disagree, this document says so explicitly rather than picking one silently.

---

## 0. Method and a first finding

Before working through the ten requested areas, one thing needs to be named because it shapes everything below: **the approved architecture describes a considerably larger business than the one currently operating.**

The Enterprise Capability Map (ARC-005) and the KrishiOx product document (ARC-003) describe a full agricultural value-chain business — farm management, crop management, biomass management, procurement, collection centers, transportation, inventory, a marketplace, advisory services, sustainability, and carbon initiatives. Current operating practice, by contrast, is a single, narrow slice of that: farmers in one district requesting farm-equipment and labour services in advance, coordinated through one communication channel, with no farmer accounts, no payments handled by the platform, and no visible operation yet in most of the domains listed above.

Neither of these is "wrong." A capability map is meant to describe where the business is *permitted to grow* under Principle 8 (Simplicity First) and Principle 9 (Evolution Over Rewrites) — it is not a claim that every capability is active today. But a discovery exercise has to say plainly which capabilities are **operating**, which are **declared but dormant**, and which are **aspirational**, because "business capabilities" and "business processes" read very differently depending on which bucket they're in. Sections 4 and 5 below mark each item accordingly:

- 🟢 **Operating** — evidenced in current practice.
- 🟡 **Declared, not yet observed operating** — named in approved documents; no evidence yet of live operation.
- 🔵 **Aspirational** — explicitly future-facing in the source documents (e.g. "Future Evolution" sections).

---

## 1. Primary Stakeholders

People and groups with an interest in KrishiOx succeeding, whether or not they use it day to day.

| Stakeholder | Interest |
|---|---|
| **Farmers** | The intended primary beneficiary. Interested in getting farm services reliably, on time, without complexity. |
| **Service/Equipment Partners** | The supply side — equipment owners and fleet operators. Interested in a steady stream of paying work with minimal overhead. |
| **Founders / Chief Architect** | Accountable for the ecosystem strategy (IELNex + products) that KrishiOx is built on. |
| **KrishiOx business/product owner** | Accountable for KrishiOx's outcomes specifically — presently unnamed in the approved documents (see Open Questions). |
| **Enterprises** (named in ARC-003 §7) | Larger organizations with an interest in sourcing from or transacting with the agricultural value chain KrishiOx intends to digitize. |
| **Government Agencies** (named in ARC-003 §7) | Regulatory and possibly programmatic interest (schemes, subsidies, compliance) — nature of the interest not yet documented. |
| **Sustainability Partners** (named in ARC-003 §7) | Interested in the Sustainability / Carbon Initiatives capabilities — currently aspirational (🔵). |
| **IELNex platform owners** | Interested in KrishiOx as a proof that shared enterprise capabilities (identity, notifications, workflow, etc.) are genuinely reusable, per the Enterprise Strategy's success criteria. |
| **Legal / compliance function** | Interested in how consent, data handling, and grievance redressal are managed — evidenced by current operating practice (terms, privacy, and consent handling exist today) even though this function isn't named in the architecture documents. |
| **Village-level trust networks / local intermediaries** | Not documented anywhere, but rural service adoption is frequently driven by word-of-mouth and local trust rather than the platform alone — flagged here as a likely stakeholder group worth confirming, not an assumption to build on. |

## 2. Business Actors

Roles that actively *do* something within KrishiOx's processes — the people or groups who take action, as distinct from stakeholders who merely have an interest.

| Actor | Role in the business | Status |
|---|---|---|
| **Farmer** | Requests a service; provides location, timing, and contact details; receives and confirms fulfillment arrangements. | 🟢 Operating |
| **Coordinator / support team** | Receives incoming service requests, matches them to a capable partner, and manages the conversation through to fulfillment. Not named as a role anywhere in the approved documents, but someone performs this function today — see Open Questions. | 🟢 Operating (unnamed) |
| **Service/Equipment Partner** | Fulfills a matched request — brings the equipment or labour to the farmer. | 🟡 Declared; onboarding pathway exists, active partner volume not documented |
| **Aggregator** (named in ARC-003 §7) | Role not defined beyond the name. Likely an intermediary who bundles farmer demand or partner supply, but this is inference, not fact. | 🔵 Undefined — see Open Questions |
| **Procurement Team, Collection Center, Warehouse, Transport Operator** (named in ARC-003 §7) | Presumed actors in a produce/biomass movement process implied by the capability names (Procurement, Collection Centers, Transportation Planning, Inventory Management). | 🔵 Aspirational |
| **Administrator** | Operates/configures the platform on behalf of the business. Scope of what an Administrator actually does is undocumented. | 🟡 Declared |
| **Government Agency representative** | Presumed counterpart in any compliance or scheme-related interaction. | 🔵 Undefined |
| **Sustainability/Carbon Partner** | Counterpart in carbon-initiative activity. | 🔵 Aspirational |

## 3. Business Goals

Synthesized from the Mission/Vision statements in ARC-003 and the Business Principles it lists.

1. **Simplify agricultural operations for farmers** — reduce the operational complexity farmers face when they need a service, equipment, or support (Farmer-Centric principle).
2. **Replace informal, uncertain arrangements with dependable advance booking** — a farmer should be able to secure a service ahead of time rather than hope one becomes available when needed, which matters because agricultural timing (sowing, harvest windows) is often unforgiving.
3. **Reach farmers regardless of connectivity** — the Offline Awareness principle states the platform should remain usable under limited or interrupted connectivity, implying a goal of *inclusion* for under-connected rural areas rather than assuming reliable infrastructure.
4. **Grow into the broader agricultural value chain incrementally** — the Modular Growth principle and ARC-003 §10 (Future Evolution) describe a deliberate path from a narrow starting point toward crop management, biomass, marketplace, advisory, and sustainability capabilities, without needing to re-found the business each time.
5. **Make decisions on evidence, not assumption** — the Data Before Assumptions principle commits the business to grounding decisions in real operational data as it accumulates.
6. **Contribute to, and benefit from, a reusable enterprise foundation** — per the Enterprise Strategy, KrishiOx's success is partly measured by whether it can reuse IELNex capabilities rather than rebuilding them, which is a stated *enterprise*-level goal that KrishiOx inherits.

## 4. Business Capabilities

Capabilities KrishiOx owns, per the Enterprise Capability Map (ARC-005 §5), with an operating-status estimate. This list is what KrishiOx is *responsible for* — not necessarily what is active today.

| Capability | Status | Note |
|---|---|---|
| Farmer Management | 🟢 Operating | Farmers are engaged and served today, though not as registered/managed accounts — see Open Questions. |
| Service Catalogue *(bounded context, not in the capability table itself)* | 🟢 Operating | A defined, named set of services is offered and browsable. |
| Booking *(bounded context)* | 🟢 Operating | The core, evidenced transaction of the business today. |
| Dispatch *(bounded context)* | 🟢 Operating, informally | Requests are matched to a fulfilling party, but there's no evidence yet of a formal, systematic dispatch capability distinct from direct coordination. |
| Communications *(bounded context)* | 🟢 Operating, single-channel | One channel is in active use; breadth of the "Communications" capability as documented is not yet evidenced. |
| Partner / Fleet management (implied by "Partner" bounded context) | 🟡 Declared | An onboarding pathway is presented to prospective partners; scale of actual active partners is undocumented. |
| Farm Management | 🔵 Aspirational | No evidence of farm-level (as opposed to single-request) management today. |
| Land & Field Management | 🔵 Aspirational | |
| Crop Management | 🔵 Aspirational | |
| Biomass Management | 🔵 Aspirational | |
| Harvest Planning | 🔵 Aspirational | |
| Procurement | 🔵 Aspirational | |
| Collection Centers | 🔵 Aspirational | |
| Transportation Planning | 🔵 Aspirational | Note: "Transport" appears today only as one *bookable service category*, which is a much narrower thing than a Transportation Planning capability. |
| Inventory Management | 🔵 Aspirational | |
| Marketplace | 🔵 Aspirational | |
| Advisory Services | 🔵 Aspirational | |
| Sustainability | 🔵 Aspirational | |
| Carbon Initiatives | 🔵 Aspirational | |
| Agricultural Analytics | 🔵 Aspirational | |

**Explicitly not KrishiOx capabilities** (owned by IELNex, per ARC-002/ARC-005 — listed here because knowing the boundary is itself a discovery finding): Identity & Authentication, Authorization, User/Organization/Role Management, Workflow Engine, Notification Framework, Audit & Activity Logging, Configuration Management, Scheduling, Document Management, Search, Reporting, Integration Framework, API Gateway, Event Bus, AI Services, Feature Management, Monitoring, Health Checks, Security Services. Under the approved principles, KrishiOx should never build its own version of any of these — it should consume them.

**External capabilities KrishiOx integrates with, but does not own** (per ARC-005 §7): a messaging/communication platform (evidenced in current operation as the sole active channel), and — as declared, not yet evidenced — SMS, email, payment, mapping, weather, government, and ERP providers.

## 5. Business Processes

End-to-end flows of business value, each spanning multiple actors.

1. **Service discovery and request** 🟢 — a farmer learns what services are available and initiates a request for one.
2. **Booking fulfillment** 🟢 — a farmer's request is captured with enough detail (service, location, timing, contact) to be actionable, then handed to whoever fulfills it.
3. **Partner onboarding** 🟡 — a prospective equipment owner or fleet operator expresses interest in supplying services and is brought into a state where they can receive work.
4. **Policy consent and re-consent** 🟢 — a farmer (or any user) is asked to accept the terms under which their information is used, and is asked again if those terms change materially.
5. **Support and inquiry handling** 🟢 — a person with a question reaches the business and gets a response, through the same channel used for booking.
6. **Produce/biomass procurement and collection** 🔵 — implied by the Procurement and Collection Centers capabilities; no observed instance of this process operating yet.
7. **Marketplace transaction** 🔵 — implied by the Marketplace capability; not evidenced.
8. **Advisory delivery** 🔵 — implied by the Advisory Services capability; not evidenced.
9. **Sustainability / carbon program participation** 🔵 — implied by the Sustainability and Carbon Initiatives capabilities; not evidenced.

## 6. Major Workflows

More granular, step-level detail underneath the processes above — the ones evidenced in current operation are described at the level a business owner would recognize, not at a technical level.

**Booking workflow** 🟢
1. Farmer selects a service from the catalogue.
2. Farmer specifies where the service is needed (village/area).
3. Farmer specifies how much is needed (quantity/area, or a free description for a service that doesn't fit the catalogue).
4. Farmer specifies when the service is needed.
5. Farmer optionally provides a name, a callback number, and any remarks.
6. Farmer reviews and confirms the request.
7. The request is delivered to the business's coordination point.
8. A human coordinator (or the partner directly) picks up the conversation to confirm and arrange fulfillment.
9. *(Undocumented)* the service is delivered, and — as far as can be determined — nothing in the business today formally records that fulfillment happened.

**Partner interest workflow** 🟡
1. A prospective partner expresses interest and shares information about their equipment/fleet.
2. *(Undocumented)* some verification step is implied ("Verification" is referenced at the product-vision level) but its owner and criteria aren't recorded.
3. *(Undocumented)* a service area is assigned.
4. *(Undocumented)* the partner begins receiving referred requests.

**Consent workflow** 🟢
1. A user is presented with current terms when their stored acceptance is missing or out of date.
2. The user reviews and accepts.
3. Acceptance (and its version) is recorded against that person for future reference.

## 7. Business Events

Occurrences that matter to the business — things it should notice and may need to react to.

- A farmer submits a service request.
- A request is picked up / acknowledged by a coordinator or partner.
- A request is fulfilled.
- A request is cancelled or its timing changes.
- A new partner expresses interest in joining.
- A partner is approved to receive work (🟡 — approval criteria undocumented).
- A partner's service area changes.
- The service catalogue changes (a service is added, removed, or redefined).
- The operating area expands (a new village/district is served).
- Policy terms change, triggering re-consent.
- 🔵 Produce or biomass is collected at a collection point.
- 🔵 A marketplace transaction completes.
- 🔵 A sustainability/carbon milestone is reached.

## 8. Business Terminology

A shared glossary, so "the business" means the same thing to everyone reading these documents.

| Term | Meaning |
|---|---|
| **Farmer** | The primary person KrishiOx exists to serve; requests services. |
| **Partner** | A supplier of a service — an equipment owner or a fleet/agency operator. |
| **Booking** | A farmer's request for a specific service, at a specific place and time. |
| **Service Catalogue** | The defined, named set of services a farmer can request. |
| **Dispatch** | The act of matching a booking to whoever will fulfill it. |
| **Coordinator** | The (currently unnamed in approved documents) role that mediates between a farmer's request and a partner's fulfillment. |
| **Aggregator** | Named as a KrishiOx user group; meaning not yet defined — see Open Questions. |
| **Collection Center** | An operational point where produce or biomass is gathered (🔵 aspirational). |
| **Biomass** | Agricultural residue or organic material treated as a managed business domain (🔵 aspirational). |
| **Advisory** | Guidance provided to farmers (🔵 aspirational; nature and delivery undefined). |
| **Carbon Initiative** | A sustainability program tied to agricultural practice (🔵 aspirational). |
| **Enterprise Capability** | A reusable, business-agnostic function provided by IELNex to every product. |
| **Product Capability** | A capability specific to one business (KrishiOx or Praxoma) and owned exclusively by it. |
| **External Capability** | A function provided by an outside party (a communication channel, a payment provider, etc.) that the business integrates with but never owns. |
| **Bounded Context** | A distinct area of business meaning within KrishiOx — currently named as Booking, Farmer, Service Catalogue, Partner, Dispatch, and Communications. |

## 9. Business Rules

Rules are labeled by source: **[Approved]** — stated directly in ARC-000–ARC-007; **[Observed]** — evidenced by current operating practice; **[Inferred]** — a reasonable reading that has not been confirmed and should be checked.

1. **[Approved]** Every capability has exactly one owner; ownership is never shared or duplicated (ARC-000 Principle 5, ARC-005 §8).
2. **[Approved]** KrishiOx must never build its own version of a reusable enterprise capability (identity, notifications, workflow, audit, scheduling, etc.) — these must be consumed from IELNex (ARC-002 §5, ARC-003 §6).
3. **[Approved]** All agricultural business rules, terminology, and workflow ownership stay inside KrishiOx; IELNex must never encode agriculture-specific logic (ARC-000 Principle 3, ARC-002 §5).
4. **[Approved]** KrishiOx must be independently operable without depending on another product such as Praxoma (ARC-001 §5).
5. **[Approved]** A capability should only move from KrishiOx into IELNex once multiple products genuinely need it — not merely because it sounds reusable (ARC-002 §9, ARC-005 §9).
6. **[Observed]** A booking is not considered complete without a selected service, a stated location, and a stated timing.
7. **[Observed]** A callback phone number is optional at the point of booking; a name is not.
8. **[Observed]** No advance payment is collected by the business as part of placing a booking.
9. **[Observed]** A user must accept current policy terms; if terms change materially, prior acceptance no longer counts and must be renewed.
10. **[Inferred]** Service fulfillment appears to depend on a human coordinator's judgment for matching, rather than an automatic or rules-based assignment — this should be confirmed, since it has real implications for how "Dispatch" is actually meant to work as a capability.

## 10. Open Questions

These are the gaps this discovery could not close from the available documents and observed practice. They matter more than any single answer above, because several other findings depend on them.

1. **Sequencing** — Of the sixteen KrishiOx capabilities named in the Capability Map, only a handful appear to be operating. What is the intended order and timeline for activating the rest (Crop Management, Biomass, Procurement, Marketplace, Advisory, Sustainability, Carbon)? Is there a roadmap, or is the capability map purely a long-range boundary?
2. **Undefined actors** — What does "Aggregator" mean in practice? Who are "Procurement Teams," "Collection Centers," and "Warehouses" today — do any of these roles currently exist, or are they placeholders for a future state?
3. **The coordination role** — Someone performs the matching/dispatch function today. Is this a formal role with defined responsibilities and capacity, or an ad hoc function? Does it have an owner?
4. **Partner lifecycle** — What does "verification" of a partner actually involve? Who performs it, against what criteria, and how many partners are active today versus merely invited?
5. **Ownership** — Who is the named business/product owner for KrishiOx specifically, distinct from the enterprise-level Chief Architect role?
6. **Geography** — What is the current operating area, and what determines where the business expands next?
7. **Value capture** — How does the business derive revenue or value from a booking, a partnership, or (in future) a marketplace transaction? This isn't addressed anywhere in the approved documents.
8. **Government relationship** — What is the actual nature of the Government Agencies stakeholder relationship — regulatory, programmatic, both, or something else?
9. **Success measurement** — What does the business currently track to know whether it's succeeding (volume, fulfillment rate, farmer satisfaction, partner retention, something else)? Principle "Data Before Assumptions" implies this should exist.
10. **Communications scope** — The "Communications" bounded context is broader than the single channel currently in evident use. Is multi-channel communication a near-term goal, and if so, which channels and for which purposes?
11. **Sustainability/Carbon timing** — Are the Sustainability and Carbon Initiatives capabilities connected to any external program, scheme, or partner commitment already in motion, or are they purely exploratory at this stage?
12. **Village-level trust** — Does the business rely on, or plan to formally engage, local intermediaries or trusted community figures to drive adoption, or is engagement expected to be direct farmer-to-platform?

---

## Decisions

None. This document records findings and open questions; it makes no business decisions. Decisions belong to the KrishiOx business owner(s), informed by this discovery.

## References

- ARC-000 – Architecture Philosophy
- ARC-001 – Enterprise Strategy
- ARC-002 – IELNex
- ARC-003 – KrishiOx
- ARC-004 – Praxoma (referenced for contrast only)
- ARC-005 – Enterprise Capability Map
- ARC-006 – Bounded Contexts
- ARC-007 – Domain Model (High Level)
- Current KrishiOx operating practice, as observed independently of these documents
