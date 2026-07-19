# DOMAIN_MODEL.md — KrishiOx

> Documentation-only artifact. This document introduces a **conceptual domain model** for
> KrishiOx using Domain-Driven Design (DDD) vocabulary. It does **not** redesign the existing
> application, does **not** introduce a backend, and no code was changed to produce it.
>
> KrishiOx today is a static, backend-free app (see [ARCHITECTURE.md](ARCHITECTURE.md)) where
> a "booking" is a WhatsApp message, not a database row. Most of the objects below therefore do
> **not** exist as code entities yet — they are named, bounded, and related here so that a
> future backend (already anticipated in ARCHITECTURE.md §12 "Future extension points" and the
> README's "Built for future expansion" table) has a coherent domain to implement against,
> instead of ad hoc tables invented at that time. Every entity's **Current mapping** field
> states plainly what does or doesn't exist today, so this document cannot be mistaken for a
> description of current behavior.

## How to read this document

For each of the 13 domain objects requested:

- **Purpose** — why this concept exists in the domain, in one or two sentences.
- **Responsibilities** — what it knows and what it's accountable for (DDD: an entity/value
  object's behavior and invariants, not just its data).
- **Relationships** — its connections to other domain objects, with cardinality.
- **Current mapping** — where (if anywhere) this concept already exists in the KrishiOx
  codebase today, so the model stays honest about the gap between "documented domain" and
  "implemented system."
- **Future backend mapping** — how this would materialize if/when a backend is built (entity
  vs. value object, aggregate placement, indicative storage shape). Marked *future* throughout
  — nothing here is being built now.
- **JSON representation** — a proposed shape for this object in a future API/persistence
  layer. These are **illustrative schemas**, not data pulled from any existing store.

## Ubiquitous language

The app's UI is Hindi-first; the domain model uses English terms for cross-team/backend
consistency, but every domain term maps to the Hindi term a farmer or partner would recognize.
Keeping this mapping explicit is itself a DDD practice — the model's vocabulary should trace
back to the language the business actually uses.

| Domain term | Hindi (as used in the app) | Where seen today |
|---|---|---|
| Booking | बुकिंग | Booking wizard, WhatsApp message |
| Farmer | किसान | Implicit throughout — no explicit label in UI |
| Partner | पार्टनर | `partners.html` |
| Service | सेवा | Home, Services, Booking step 1 |
| Village | गाँव | Booking step 2 |
| Date (→ Availability/Booking) | तारीख | Booking step 4 |
| Quantity (→ Booking line detail) | मात्रा | Booking step 3 |
| Confirm (→ Booking submission) | पुष्टि करें | Booking step 6 |
| Service area (→ Region/District) | सेवा क्षेत्र | `js/config.js` `serviceArea` |

## Bounded contexts

Grouping the 13 objects into bounded contexts — a DDD structure for keeping each part of the
domain's language and rules self-consistent, and for suggesting where a future backend might
draw service/module boundaries:

```
┌────────────────────────────┐   ┌────────────────────────────┐
│   Booking Context           │   │   Party Context              │
│   - Booking (aggregate root)│──▶│   - Farmer (aggregate root)   │
│   - Booking Status           │   │   - Partner (aggregate root)  │
│   - Availability              │   └───────────────┬────────────┘
└──────────────┬───────────────┘                    │
               │                                     │
               ▼                                     ▼
┌────────────────────────────┐   ┌────────────────────────────┐
│   Catalog Context            │   │   Location Context            │
│   - Service (aggregate root) │   │   - Region (reference)         │
│   - Machine Category          │   │   - District (reference)        │
│   - Machine (entity, under      │   - Village (reference)          │
│     Partner in future)        │   └────────────────────────────┘
└────────────────────────────┘
┌────────────────────────────┐   ┌────────────────────────────┐
│   Communication Context      │   │   Platform Context            │
│   - Notification              │   │   - Configuration               │
└────────────────────────────┘   └────────────────────────────┘
```

A Booking references a Farmer, a Service, a Village, and (once dispatch becomes
machine-specific) a Machine/Partner/Availability slot — it is the aggregate that ties the other
contexts together, which is why it's listed first both here and by the user.

---

## 1. Booking

**Purpose**: Represents a farmer's request for a farm service on a given date, at a given
location — the central transaction of the domain, from intent through fulfillment.

**Responsibilities**:
- Capture *what* (Service), *where* (Village), *when* (date), *who* (Farmer contact details),
  and *how much* (quantity/unit, or free-text detail for "other" services).
- Own its lifecycle via Booking Status and the timestamped history of transitions.
- Enforce its own creation invariants: a service must be selected; a village must be
  non-empty; a date must be present and not in the past; a name is required, a phone number
  if present must be exactly 10 digits (all already enforced client-side today, see
  DATA_FLOW.md §2).
- Produce the human-readable confirmation message (today: the WhatsApp text itself).

**Relationships**:
- Booking → Farmer: many-to-one (one farmer may place many bookings over time).
- Booking → Service: many-to-one.
- Booking → Village: many-to-one.
- Booking → Machine: zero-or-one-to-one (*future* — once dispatch assigns a specific unit).
- Booking → Partner: zero-or-one-to-one (*future* — the assigned fulfiller).
- Booking → Availability: zero-or-one-to-one (*future* — the slot it claims).
- Booking → Booking Status: one-to-one (current state) plus one-to-many (transition history).
- Booking → Notification: one-to-many (each status change may trigger one).

**Current mapping**: The closest thing to a Booking entity today is the in-memory `state`
object in `js/booking.js`, mirrored to `localStorage` under `krishiox:bookingDraft` while
in-progress (see DATA_FLOW.md §2.3). On submission it is passed through the internal booking
engine (`js/booking/` — Booking Object → Validation → Serializer → Delivery Adapter, see
ARCHITECTURE.md §5) and turned into a WhatsApp message string (`serializeBooking()` in
`js/booking/serializer.js`), still never stored as structured data server-side — there is no
server, and the engine's `Booking` object (`js/booking/model.js`) lives only for the duration
of one submission call, not persisted anywhere. A stripped summary (`{service, village, date,
ts}`, capped at 20 entries) is appended to `krishiox:bookingHistory` purely for the farmer's
own device. **No status field exists at all today** — see §11 Booking Status.

**Future backend mapping**: Aggregate root of the Booking bounded context. Table `bookings`
with foreign keys to `farmers`, `services`, `villages`, and nullable `machines`/`partners`;
a separate `booking_status_events` table for the audit trail (see §11).

**JSON representation** *(proposed, future)*:
```json
{
  "id": "bkg_01HZX3QK9F",
  "farmerId": "frm_9015579855",
  "serviceId": "tractor",
  "machineId": null,
  "partnerId": null,
  "villageId": "vlg_bandukheri",
  "quantity": { "value": 3, "unit": "बीघा (Bigha)" },
  "otherDetails": null,
  "date": "2026-07-22",
  "contact": { "name": "सुरेश कुमार", "phone": "9812345670" },
  "remarks": "सुबह जल्दी चाहिए",
  "status": "submitted",
  "createdAt": "2026-07-19T10:32:00+05:30",
  "source": "whatsapp-wizard"
}
```

---

## 2. Farmer

**Purpose**: Represents the person requesting a service — a reusable identity across bookings,
distinct from a one-off form submission.

**Responsibilities**:
- Hold contact identity (name, phone number) and, optionally, a home Village.
- Accumulate a booking history (in a future backend, server-side and durable, rather than
  per-device).
- Hold consent/legal-acceptance state tied to a real identity rather than a browser.

**Relationships**:
- Farmer → Booking: one-to-many.
- Farmer → Village: zero-or-one-to-one (home village, optional).
- Farmer → Notification: one-to-many (recipient).

**Current mapping**: **Not modeled as an entity today.** Name and phone are plain text fields
typed fresh into booking wizard step 5 (`js/booking.js` `renderRemarksStep()`), never
persisted independently of that one booking draft, and not linked across separate bookings —
two bookings from the same person today produce two unrelated, uncorrelated records. The
`krishiox:legalConsent` key (§13-adjacent, see DATA_FLOW.md §4) is tied to a *browser/device*,
not to a farmer identity — clearing browser storage or switching devices loses it, and it
cannot answer "has this phone number consented."

**Future backend mapping**: Aggregate root of the Party bounded context. Table `farmers`,
natural/unique key on phone number (WhatsApp identity is already phone-number-based, so this
avoids inventing a separate login/username scheme).

**JSON representation** *(proposed, future)*:
```json
{
  "id": "frm_9812345670",
  "phone": "9812345670",
  "name": "सुरेश कुमार",
  "homeVillageId": "vlg_bandukheri",
  "consent": { "version": "2026-07-18.2", "acceptedAt": "2026-07-19T10:15:00+05:30" },
  "createdAt": "2026-07-19T10:15:00+05:30"
}
```

---

## 3. Partner

**Purpose**: Represents an equipment owner or fleet operator who supplies Machines and
fulfills Bookings — the supply side of the marketplace the README already names as a future
direction ("Vendor dashboard" / "Equipment tracking").

**Responsibilities**:
- Own one or more Machines.
- Declare a coverage area (one or more Districts/Villages it services).
- Receive Booking assignments and report fulfillment.
- Maintain Availability for its Machines.

**Relationships**:
- Partner → Machine: one-to-many.
- Partner → District/Village: many-to-many (coverage area).
- Partner → Booking: one-to-many (fulfilled bookings).
- Partner → Notification: one-to-many (recipient, e.g. "new booking assigned").

**Current mapping**: **Not modeled at all.** `partners.html` is a static lead-generation page
— copy aimed at equipment owners, with a WhatsApp CTA to express interest in *becoming* a
partner. There is no partner account, no partner-specific data, no assignment or dispatch
logic anywhere in the codebase; any "partner" today is a person the business team messages
manually outside the app entirely.

**Future backend mapping**: Aggregate root of the Party bounded context (sibling to Farmer).
Table `partners`; likely needs its own lightweight auth once a "vendor dashboard" (already
named in ARCHITECTURE.md §12) exists for partners to see assigned bookings.

**JSON representation** *(proposed, future)*:
```json
{
  "id": "ptr_7000112233",
  "name": "राम सिंह इक्विपमेंट",
  "phone": "7000112233",
  "coverage": { "districtIds": ["dst_saharanpur"], "villageIds": ["vlg_bandukheri", "vlg_phandpuri"] },
  "machineIds": ["mch_tractor_017"],
  "status": "active",
  "onboardedAt": "2026-08-01T00:00:00+05:30"
}
```

---

## 4. Machine

**Purpose**: Represents one specific physical unit of equipment (a particular tractor, a
particular harvester) owned by a Partner — the level of granularity needed once dispatch
assigns a real, individually-schedulable asset to a Booking, rather than an abstract service
category.

**Responsibilities**:
- Belong to exactly one Partner and one Machine Category.
- Hold identifying details (registration/asset number, capacity notes).
- Own an Availability calendar.
- Be assignable to at most one active Booking per date.

**Relationships**:
- Machine → Partner: many-to-one.
- Machine → Machine Category: many-to-one.
- Machine → Availability: one-to-many.
- Machine → Booking: one-to-many (over its lifetime; zero-or-one active at a time per date).

**Current mapping**: **Not modeled.** The app has no inventory of individual equipment units
at all — `KRISHIOX_SERVICES` (see §6 Service) describes service *categories* ("Tractor
Service"), not specific machines. There is no ownership tracking, no per-unit identifier, and
no way today to know how many tractors exist or which one would fulfill a given booking — that
matching happens entirely inside the human WhatsApp conversation.

**Future backend mapping**: Entity, likely modeled as a child entity within the Partner
aggregate (a Machine's lifecycle is meaningless without an owning Partner) or as its own
aggregate root in a dedicated Dispatch bounded context if fleet operations grow complex enough
to warrant independent transactions (e.g., a machine changing owners). Table `machines`.

**JSON representation** *(proposed, future)*:
```json
{
  "id": "mch_tractor_017",
  "partnerId": "ptr_7000112233",
  "categoryId": "cat_tractor",
  "label": "महिंद्रा 575 DI",
  "registrationNumber": "UP11AB1234",
  "status": "active"
}
```

---

## 5. Machine Category

**Purpose**: Classifies equipment types (Tractor, Rotavator, Cultivator, Harvester, Mini
Loader, ...) as reusable reference data — shared taxonomy that both Machines (physical units)
and Services (bookable offerings) hang off of.

**Responsibilities**:
- Canonical bilingual name (Hindi/English) and icon.
- Group Machines of the same kind for capacity/availability queries ("any tractor free on
  this date," not just one specific unit).

**Relationships**:
- Machine Category → Machine: one-to-many.
- Machine Category → Service: zero-or-one-to-many (a Service *may* be fulfilled by a
  category of machine; some Services have none — see below).

**Current mapping**: **Conflated with Service today, not separately modeled.** Every entry in
`KRISHIOX_SERVICES` (`js/config.js`) currently plays double duty as both "the bookable
offering shown to the farmer" and "the equipment category" — e.g. the single record `id:
"tractor"` carries the service's Hindi/English name *and* implicitly stands in for the
equipment category "Tractor." This works today only because the app never needs to
distinguish "the offering the farmer picked" from "the piece of equipment that will actually
show up" — WhatsApp-mediated dispatch papers over the difference. It stops working once
Machines exist as individually schedulable units: `farm-labour` and `other` are Services with
**no** corresponding equipment category at all (labour and free-text requests aren't
machines), which is exactly the kind of distinction a domain model needs to make explicit
before a Machine/Availability layer can be built.

**Future backend mapping**: Reference/lookup entity, table `machine_categories`, seeded
initially from today's `KRISHIOX_SERVICES` icon+name pairs for the categories that do
correspond to equipment (tractor, rotavator, cultivator, laser-leveller, harvesting,
mini-loader, tractor-trolley, irrigation) — explicitly excluding `farm-labour`, `transport`,
and `other`, which remain Services without a Machine Category.

**JSON representation** *(proposed, future)*:
```json
{
  "id": "cat_tractor",
  "nameHi": "ट्रैक्टर",
  "nameEn": "Tractor",
  "icon": "tractor"
}
```

---

## 6. Service

**Purpose**: Represents a bookable offering shown to the farmer in the catalogue and the
booking wizard — *what* is being requested, independent of which physical Machine (if any)
ultimately fulfills it.

**Responsibilities**:
- Bilingual display name, description, icon, and unit of measure (बीघा/घंटे/ट्रिप/किलोमीटर/
  व्यक्ति) used to label the quantity stepper.
- Optionally reference a Machine Category (see §5 for the services that have none).

**Relationships**:
- Service → Machine Category: zero-or-one-to-many.
- Service → Booking: one-to-many.

**Current mapping**: This is one of the few objects that **already exists directly** in code:
`KRISHIOX_SERVICES` in `js/config.js` (11 entries — tractor, rotavator, cultivator,
laser-leveller, harvesting, mini-loader, tractor-trolley, transport, irrigation, farm-labour,
other), each with `id`, `nameHi`, `nameEn`, `desc`, `icon`, `unit`. Consumed by Home (first 6,
`index.html`), Services (`services.html`, full list), and Booking step 1
(`renderServiceGrid()` in `js/booking.js`). It is the single source of truth today for the
service catalogue across all three pages (see ARCHITECTURE.md §8, DECISIONS.md §D13).

**Future backend mapping**: Reference/catalog entity in the Catalog bounded context. Table
`services`, `categoryId` nullable per §5's note. Later could support per-Partner pricing
overrides without changing this shape (a `partner_service_offerings` join table).

**JSON representation** *(reflects current `KRISHIOX_SERVICES` shape closely; future-store
version adds an id-referenced category)*:
```json
{
  "id": "tractor",
  "categoryId": "cat_tractor",
  "nameHi": "ट्रैक्टर सेवा",
  "nameEn": "Tractor Service",
  "desc": "जुताई व अन्य खेत कार्यों के लिए ट्रैक्टर बुक करें",
  "icon": "tractor",
  "unit": "बीघा (Bigha)"
}
```

---

## 7. Region

**Purpose**: The broadest level of the location hierarchy — the overall operating area (today,
effectively "Saharanpur and surroundings, Uttar Pradesh") that groups Districts and could hold
region-level configuration once the business operates in more than one place.

**Responsibilities**:
- Group Districts.
- Hold region-scoped overrides (e.g., a different WhatsApp/support number per region, once
  multi-region operation exists).

**Relationships**:
- Region → District: one-to-many.
- Region → Configuration: zero-or-one-to-many (*future* override).

**Current mapping**: **Not modeled.** `KRISHIOX_CONFIG.serviceArea` (`js/config.js`) is a
single hardcoded string, `"सहारनपुर, उत्तर प्रदेश"`, used as display copy in the header and
footer — there is exactly one implicit, unstructured "region" today, with no representation
that would let a second one be added without inventing new config keys from scratch.

**Future backend mapping**: Reference entity, table `regions` — only becomes necessary once
KrishiOx expands to a second operating area with independent contact numbers/support hours;
until then, a single-row table is sufficient and the app's current single-`Configuration`
model (§13) remains valid.

**JSON representation** *(proposed, future)*:
```json
{ "id": "reg_up_west", "nameHi": "पश्चिमी उत्तर प्रदेश", "nameEn": "Western Uttar Pradesh" }
```

---

## 8. District

**Purpose**: The administrative subdivision within a Region at which service coverage and
Partner assignment are practically decided — a Partner realistically covers a district's worth
of villages, not an arbitrary scattered set.

**Responsibilities**:
- Group Villages.
- Scope Partner coverage declarations and, eventually, Availability/dispatch matching queries
  ("which partners cover this district").

**Relationships**:
- District → Region: many-to-one.
- District → Village: one-to-many.
- District → Partner: many-to-many (*future* coverage).

**Current mapping**: **Not modeled as a distinct level today**, and notably the two places
that *do* list place names in the codebase aren't linked to each other: `index.html`'s
`Service` JSON-LD `areaServed` block lists towns/tehsils (Saharanpur, Roorkee, Nakur, Gangoh,
Bandukheri, Rampur Maniharan, Deoband, Behat, Sarsawa, Nagal, Punwarka, Muzaffarabad,
Chutmalpur, Ambehta, Sadhauli Qadim) as flat SEO metadata, while `KRISHIOX_VILLAGES`
(`js/config.js`) is a separate flat list of 16 villages for the booking wizard — nothing in
code declares that, say, "Bandukheri" (a village in the booking list) sits within "Saharanpur"
(a place in the SEO list). A District layer is exactly what would relate these two currently-
disconnected lists.

**Future backend mapping**: Reference entity, table `districts`, foreign key to `regions`.

**JSON representation** *(proposed, future)*:
```json
{ "id": "dst_saharanpur", "regionId": "reg_up_west", "nameHi": "सहारनपुर", "nameEn": "Saharanpur" }
```

---

## 9. Village

**Purpose**: The most granular location a farmer actually identifies with — where the service
is physically needed. Deliberately kept farmer-friendly (free-text-capable) rather than a
strict closed list, given the long tail of hamlet names in rural India.

**Responsibilities**:
- Bilingual display name.
- Belong to a District (once that layer exists).
- Be offered as an autocomplete suggestion and quick-select chip during booking.

**Relationships**:
- Village → District: many-to-one (*future*).
- Village → Booking: one-to-many.
- Village → Farmer: one-to-many (as a home village).

**Current mapping**: **Already exists directly**, but as a flat list with no hierarchy:
`KRISHIOX_VILLAGES` in `js/config.js` — 16 entries, each a single `"नाम (English)"` string
(e.g. `"बांदूखेड़ी (Bandukheri)"`), consumed by booking step 2's `<datalist>` and the first-6
quick-select chips (`renderVillageStep()` in `js/booking.js`). Critically, this list is
**suggestions only, not a closed set** — a farmer can type any village name freely and it is
accepted as-is (`state.village = input.value.trim()`); nothing validates it against
`KRISHIOX_VILLAGES` or any authoritative list.

**Future backend mapping**: Reference entity, table `villages`, foreign key to `districts`. A
future backend should preserve today's free-text tolerance — e.g. store an optional
`villageId` foreign key alongside a required free-text `villageName`, resolving to a known
Village when it matches, but never *rejecting* an unrecognized name — to avoid regressing the
current flexibility for villages not yet catalogued.

**JSON representation** *(reflects current data closely; future-store version adds an id and
district link)*:
```json
{
  "id": "vlg_bandukheri",
  "districtId": "dst_saharanpur",
  "nameHi": "बांदूखेड़ी",
  "nameEn": "Bandukheri"
}
```

---

## 10. Availability

**Purpose**: Represents whether a Machine (or, before per-machine dispatch exists, a Partner's
aggregate capacity) is bookable on a given date — the concept that prevents double-booking once
fulfillment becomes a real scheduling problem rather than a WhatsApp conversation.

**Responsibilities**:
- Hold a date + Machine (or Partner) + slot state (free / held / booked).
- Support the date-selection step of a future automated (non-conversational) booking flow by
  answering "is anything free on this date" before a Booking is created, not after.
- Prevent two Bookings from claiming the same Machine on the same date.

**Relationships**:
- Availability → Machine: many-to-one (or → Partner, pre-per-machine-dispatch).
- Availability → Booking: zero-or-one-to-one (once claimed by a confirmed Booking).

**Current mapping**: **Does not exist in any form today.** Booking wizard step 4
(`renderDateStep()` in `js/booking.js`) offers quick-date chips (आज / कल / 2 दिन बाद / अगले
सप्ताह) purely as *input convenience* — there is zero capacity or conflict checking anywhere
in the app. A farmer can select any date at all, including a date where every relevant machine
is already committed; the app has no way to know that, because all real capacity negotiation
happens after the WhatsApp message is sent, inside the human conversation. This is the
single biggest gap between "what the app captures" and "what fulfillment actually requires,"
and is precisely why Availability is worth naming now even though nothing implements it yet.

**Future backend mapping**: Entity in the Booking bounded context (or a dedicated Dispatch
context if scheduling logic grows complex). Table `availability_slots`, unique constraint on
`(machine_id, date)`.

**JSON representation** *(proposed, future)*:
```json
{
  "id": "avl_mch017_20260722",
  "machineId": "mch_tractor_017",
  "date": "2026-07-22",
  "state": "held",
  "bookingId": "bkg_01HZX3QK9F"
}
```

---

## 11. Booking Status

**Purpose**: Represents the current stage of a Booking's lifecycle — the concept that turns a
Booking from a fire-and-forget message into a tracked business object with a state machine,
audit trail, and the ability to trigger Notifications.

**Responsibilities**:
- Define the valid state set and which transitions between them are legal.
- Timestamp every transition for audit/history.
- Be the trigger condition for outbound Notifications (§12).

**Relationships**:
- Booking Status → Booking: one-to-one (current state).
- Booking Status → Booking (history): one-to-many (each past transition is a record).
- Booking Status transition → Notification: zero-or-many (a transition *may* fire one or more
  notifications).

**Current mapping**: **Does not exist in any form today.** A submitted booking has no status
field anywhere in the system — `krishiox:bookingHistory` (see DATA_FLOW.md §7) records only
that a WhatsApp message was *opened* (`{service, village, date, ts}`), never whether the
partner replied, confirmed, started, or completed the job, let alone rejected or cancelled it.
All of that state lives entirely inside the human WhatsApp conversation, invisible to the app
and unqueryable by the business (e.g., "how many bookings this week are still unconfirmed" has
no answer today short of manually reading chat threads).

**Future backend mapping**: Value object / enum on the Booking aggregate, backed by an
event-sourced `booking_status_events` table for history. Proposed state set:

```
Draft → Submitted → Acknowledged → Confirmed → InProgress → Completed
                 ↘        ↘           ↘            ↘
                  Cancelled  Cancelled   Cancelled    (Cancelled not valid once InProgress
                                                        without an explicit override reason)
                 ↘
                  Rejected  (Partner/business declines before Acknowledged)
```

**JSON representation** *(proposed, future — current status plus a transition log entry)*:
```json
{
  "bookingId": "bkg_01HZX3QK9F",
  "current": "confirmed",
  "history": [
    { "status": "submitted", "at": "2026-07-19T10:32:00+05:30", "by": "farmer" },
    { "status": "acknowledged", "at": "2026-07-19T10:41:00+05:30", "by": "partner" },
    { "status": "confirmed", "at": "2026-07-19T11:05:00+05:30", "by": "partner" }
  ]
}
```

---

## 12. Notification

**Purpose**: Represents an outbound message to a Farmer or Partner triggered by a domain event
(booking submitted, status changed, reminder) — the mechanism for keeping both sides informed
without relying on someone remembering to follow up manually.

**Responsibilities**:
- Know its channel (WhatsApp / SMS / push), recipient, template/content, and delivery state.
- Be triggered by a Booking Status transition (or a scheduled reminder, in the future).

**Relationships**:
- Notification → Booking: zero-or-one (the triggering booking, if any).
- Notification → Farmer or Partner: one-to-one (recipient).
- Notification → Booking Status transition: zero-or-one (the trigger, if status-driven).

**Current mapping**: **No Notification entity exists.** Two unrelated things in the codebase
share the word informally, and it's worth being precise about the difference: (1) the
booking-confirmation WhatsApp message itself (built by `serializeBooking()` in
`js/booking/serializer.js` and sent via `js/booking/whatsapp-delivery-adapter.js`) is the
**entire booking submission**, not a follow-up notification about one — it's sent by the
farmer, not to them; and (2) `js/ui.js`'s `showToast()` / `window.krishiOxToast` is
purely local, ephemeral UI feedback (e.g. "टेक्स्ट का आकार: 115%", "KrishiOx अपडेट हो गया है
✓") that never leaves the device and has nothing to do with booking status. The `bell` icon
defined in `KRISHIOX_ICONS` (`js/icons.js`) is currently **unused by any page** — the closest
thing to evidence that a notification affordance was anticipated but never wired up. Notably,
the booking engine's `DeliveryAdapter` contract (`js/booking/delivery-adapter.js`, see
ARCHITECTURE.md §5) is the extension point a future Notification implementation would most
naturally reuse — a "notify the partner" adapter is structurally the same shape as "deliver the
booking," just triggered by a different event.

**Future backend mapping**: Entity (arguably an aggregate root of its own) in a dedicated
Notification/Communication bounded context. Table `notifications`, with `channel`,
`templateId`, `status` (`queued`/`sent`/`delivered`/`failed`), and foreign keys to the
triggering booking and recipient. This is the concept that would formalize today's entirely
manual "partner replies on WhatsApp whenever they get to it" step into a tracked, and
eventually automatable, status-change message (e.g. "आपकी बुकिंग की पुष्टि हो गई है" sent back
to the farmer automatically on `Confirmed`).

**JSON representation** *(proposed, future)*:
```json
{
  "id": "ntf_01HZX4",
  "bookingId": "bkg_01HZX3QK9F",
  "recipientType": "farmer",
  "recipientId": "frm_9812345670",
  "channel": "whatsapp",
  "templateId": "booking_confirmed",
  "status": "sent",
  "sentAt": "2026-07-19T11:05:05+05:30"
}
```

---

## 13. Configuration

**Purpose**: Represents deployment-level settings that control how the app presents itself and
where bookings/contact requests are routed — the single source of operational truth for a
given deployment.

**Responsibilities**:
- Hold contact numbers (WhatsApp, call), branding (name, initials, tagline), service-area
  copy, support hours, and legal metadata (`legalVersion`, `legalContactEmail`).
- Be readable at runtime by every page that renders the header/footer/WhatsApp links.

**Relationships**:
- Configuration → Region: zero-or-many (*future* — a per-region override once multi-region
  operation exists; see §7).
- Configuration is otherwise a singleton relative to the rest of the domain — it doesn't
  belong to any other aggregate, it configures the *system* the other aggregates operate
  within.

**Current mapping**: **Already exists directly and fully**, but as static, build-time,
single-tenant data, not a runtime-editable entity: `KRISHIOX_CONFIG` in `js/config.js`
(`whatsappNumber`, `callNumber`, `serviceArea`, `supportHours`, `appName`, `brandInitials`,
`appTagline`, `legalVersion`, `legalContactEmail`). It is edited by hand and shipped via a
normal commit + GitHub Pages deploy (see ARCHITECTURE.md §8, DECISIONS.md §D3) — there is no
admin UI, no per-environment override mechanism, and exactly one configuration exists at any
time (no concept of "staging config" vs "production config" beyond whatever is currently
committed to `main`).

**Future backend mapping**: If a backend is introduced (explicitly *not* being proposed here),
Configuration becomes a small admin-editable settings table/service — possibly one row per
Region (§7) once multi-region operation exists — rather than a file requiring a code deploy to
change. Until then, the current static-file model remains completely adequate and should not
be changed on the strength of this document alone.

**JSON representation** *(reflects current `KRISHIOX_CONFIG` shape closely)*:
```json
{
  "whatsappNumber": "919015579855",
  "callNumber": "+919015579855",
  "serviceArea": "सहारनपुर, उत्तर प्रदेश",
  "supportHours": "सुबह 6 बजे – रात 9 बजे (सातों दिन)",
  "appName": "KrishiOx",
  "brandInitials": "KO",
  "appTagline": "खेती की सेवाएँ, समय पर बुकिंग",
  "legalVersion": "2026-07-18.2",
  "legalContactEmail": "legal@krishiox.in"
}
```

---

## Aggregate summary

| Aggregate root | Contains / owns | Bounded context |
|---|---|---|
| **Booking** | Booking Status (current + history) | Booking |
| **Farmer** | — | Party |
| **Partner** | Machine (child entity) | Party / Catalog |
| **Service** | — (references Machine Category) | Catalog |
| **Notification** | — | Communication |
| **Configuration** | — (singleton) | Platform |

Reference/lookup entities (not aggregate roots — no independent lifecycle transitions, just
looked up and referenced): **Machine Category**, **Region**, **District**, **Village**,
**Availability** (a borderline case — modeled here as an entity with a small state machine of
its own, but always accessed through a Machine, never independently).

## What this document is not

- Not a schema migration, not a database, not an API — no backend was introduced.
- Not a change to `js/config.js`, `KRISHIOX_SERVICES`, `KRISHIOX_VILLAGES`, or any other file
  — every "Current mapping" section above was verified by reading the code as it exists today
  and nothing was edited.
- Not a redesign of the booking wizard or WhatsApp flow — the UI, business behavior, and
  WhatsApp-native fulfillment model described in ARCHITECTURE.md and DATA_FLOW.md remain
  exactly as they are.
- A conceptual reference for **future** work — most directly useful the day a "vendor
  dashboard," "equipment tracking," or "analytics" feature (all already named in
  ARCHITECTURE.md §12) is actually scoped and a backend becomes necessary.

---

Related documents: [ARCHITECTURE.md](ARCHITECTURE.md), [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md),
[COMPONENTS.md](COMPONENTS.md), [DATA_FLOW.md](DATA_FLOW.md), [DECISIONS.md](DECISIONS.md).
