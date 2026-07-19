/* ==========================================================================
   KrishiOx — Booking Wizard (Booking Form)
   Single responsibility: the 6-step booking wizard's state machine — the
   "Booking Form" stage of the booking engine pipeline:

     Booking Form -> Booking Object -> Validation -> Booking Serializer
       -> Delivery Adapter -> WhatsApp

   This file only collects raw field values into `state` and renders each
   step; it does not know how a booking is validated, formatted, or
   delivered. On the final step it hands `state` to
   `js/booking/engine.js`'s `submitBooking()`, which runs the rest of the
   pipeline and reports back a result — see that file for the engine
   itself, and js/booking/ for its individual stages.

   No exports: this module is entirely self-contained and boots itself on
   DOMContentLoaded, exactly like the other page-specific inline scripts.
   Only meaningful on booking.html, since it targets DOM element IDs that
   only exist on that page.
   ========================================================================== */

import { KRISHIOX_SERVICES } from "./services.js";
import { KRISHIOX_VILLAGES } from "./villages.js";
import { krishiOxIcon } from "./icons.js";
import { KrishiOxStore } from "./storage.js";
import { showToast } from "./ui.js";
import { escapeHtml, isoDate, formatDateHi, copyToClipboard } from "./utils.js";
import { submitBooking } from "./booking/engine.js";

const TOTAL_STEPS = 6;

const state = {
  step: 1,
  serviceId: null,
  village: "",
  qty: 1,
  otherDetails: "",
  date: "",
  dateLabel: "",
  name: "",
  phone: "",
  remarks: ""
};

function getService() {
  return KRISHIOX_SERVICES.find(function (s) { return s.id === state.serviceId; }) || null;
}

/* ---------------- Draft persistence (survives a dropped connection, killed tab, or reload) ---------------- */
const DRAFT_KEY = "bookingDraft";

function saveDraft() {
  KrishiOxStore.set(DRAFT_KEY, state);
}

function clearDraft() {
  KrishiOxStore.set(DRAFT_KEY, null);
}

function restoreDraftIfAny() {
  const draft = KrishiOxStore.get(DRAFT_KEY, null);
  if (!draft || typeof draft !== "object" || !draft.step || draft.step <= 1) return false;
  Object.assign(state, draft);
  if (state.step > TOTAL_STEPS) state.step = TOTAL_STEPS;
  return true;
}

/* ---------------- Progress bar ---------------- */
function renderProgress() {
  const wrap = document.getElementById("wizardProgress");
  let html = "";
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    let cls = "seg";
    if (i < state.step) cls += " done";
    if (i === state.step) cls += " active";
    html += '<div class="' + cls + '"></div>';
  }
  wrap.innerHTML = html;
}

/* ---------------- Step 1: Service grid ---------------- */
function renderServiceGrid() {
  const grid = document.getElementById("bookingServiceGrid");
  let html = "";
  KRISHIOX_SERVICES.forEach(function (s) {
    const sel = s.id === state.serviceId ? " selected" : "";
    html += '<button type="button" class="service-card' + sel + '" data-service="' + s.id + '">' +
      '<span class="check-badge">' + krishiOxIcon("check") + '</span>' +
      '<span class="icon-wrap">' + krishiOxIcon(s.icon) + '</span>' +
      '<span class="s-name-hi">' + s.nameHi + '</span>' +
      '<span class="s-name-en">' + s.nameEn + '</span>' +
    '</button>';
  });
  grid.innerHTML = html;
  grid.querySelectorAll(".service-card").forEach(function (card) {
    card.addEventListener("click", function () {
      state.serviceId = card.getAttribute("data-service");
      saveDraft();
      renderServiceGrid();
      updateNextButtonState();
      setTimeout(function () { goNext(); }, 220);
    });
  });
}

/* ---------------- Step 2: Village ---------------- */
function renderVillageStep() {
  const dl = document.getElementById("villageList");
  dl.innerHTML = KRISHIOX_VILLAGES.map(function (v) { return '<option value="' + v + '">'; }).join("");

  const chipsWrap = document.getElementById("villageChips");
  let chipHtml = "";
  KRISHIOX_VILLAGES.slice(0, 6).forEach(function (v) {
    chipHtml += '<button type="button" class="chip" data-village="' + v + '">' + v.split(" (")[0] + "</button>";
  });
  chipsWrap.innerHTML = chipHtml;

  const input = document.getElementById("villageInput");
  input.value = state.village;
  input.addEventListener("input", function () {
    state.village = input.value.trim();
    saveDraft();
    syncVillageChips();
    updateNextButtonState();
  });

  chipsWrap.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      const v = chip.getAttribute("data-village");
      input.value = v;
      state.village = v;
      saveDraft();
      syncVillageChips();
      updateNextButtonState();
    });
  });
  syncVillageChips();
}

function syncVillageChips() {
  document.querySelectorAll("#villageChips .chip").forEach(function (chip) {
    chip.classList.toggle("selected", chip.getAttribute("data-village") === state.village);
  });
}

/* ---------------- Step 3: Quantity / Other details ---------------- */
function renderQuantityStep() {
  const svc = getService();
  const isOther = state.serviceId === "other";
  document.getElementById("quantityTitle").textContent = isOther ? "कार्य का विवरण दें" : "कितनी मात्रा चाहिए?";
  document.getElementById("quantityLabel").textContent = svc ? (svc.nameHi + " — मात्रा") : "मात्रा चुनें";
  document.getElementById("qtyUnit").textContent = svc ? svc.unit : "";
  document.getElementById("qtyValue").textContent = state.qty;

  const qtyStepperEl = document.querySelector(".qty-stepper");
  qtyStepperEl.style.display = isOther ? "none" : "flex";
  document.getElementById("otherDetailsGroup").style.display = isOther ? "block" : "none";

  const otherInput = document.getElementById("otherDetailsInput");
  otherInput.value = state.otherDetails;
  otherInput.oninput = function () {
    state.otherDetails = otherInput.value.trim();
    saveDraft();
    updateNextButtonState();
  };

  document.getElementById("qtyMinus").onclick = function () {
    state.qty = Math.max(1, state.qty - 1);
    document.getElementById("qtyValue").textContent = state.qty;
    saveDraft();
  };
  document.getElementById("qtyPlus").onclick = function () {
    state.qty = Math.min(999, state.qty + 1);
    document.getElementById("qtyValue").textContent = state.qty;
    saveDraft();
  };
}

/* ---------------- Step 4: Date ---------------- */
function renderDateStep() {
  const dateInput = document.getElementById("dateInput");
  const today = new Date();
  dateInput.min = isoDate(today);
  if (state.date) dateInput.value = state.date;

  const chipsWrap = document.getElementById("dateChips");
  const options = [
    { label: "आज", offset: 0 },
    { label: "कल", offset: 1 },
    { label: "2 दिन बाद", offset: 2 },
    { label: "अगले सप्ताह", offset: 7 }
  ];
  let chipHtml = "";
  options.forEach(function (opt) {
    chipHtml += '<button type="button" class="chip" data-offset="' + opt.offset + '">' + opt.label + "</button>";
  });
  chipsWrap.innerHTML = chipHtml;

  chipsWrap.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      const offset = parseInt(chip.getAttribute("data-offset"), 10);
      const d = new Date();
      d.setDate(d.getDate() + offset);
      state.date = isoDate(d);
      state.dateLabel = formatDateHi(d);
      dateInput.value = state.date;
      saveDraft();
      syncDateChips();
      updateNextButtonState();
    });
  });

  dateInput.addEventListener("change", function () {
    state.date = dateInput.value;
    if (state.date) {
      const parts = state.date.split("-");
      state.dateLabel = formatDateHi(new Date(parts[0], parts[1] - 1, parts[2]));
    }
    saveDraft();
    syncDateChips();
    updateNextButtonState();
  });

  syncDateChips();
}

function syncDateChips() {
  document.querySelectorAll("#dateChips .chip").forEach(function (chip) {
    const offset = parseInt(chip.getAttribute("data-offset"), 10);
    const d = new Date();
    d.setDate(d.getDate() + offset);
    chip.classList.toggle("selected", isoDate(d) === state.date);
  });
}

/* ---------------- Step 5: Remarks + contact ---------------- */
function renderRemarksStep() {
  const nameInput = document.getElementById("nameInput");
  const phoneInput = document.getElementById("phoneInput");
  const remarksInput = document.getElementById("remarksInput");
  nameInput.value = state.name;
  phoneInput.value = state.phone;
  remarksInput.value = state.remarks;

  nameInput.oninput = function () {
    state.name = nameInput.value.trim();
    saveDraft();
    updateNextButtonState();
  };
  phoneInput.oninput = function () {
    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
    state.phone = phoneInput.value;
    saveDraft();
    updateNextButtonState();
  };
  remarksInput.oninput = function () { state.remarks = remarksInput.value.trim(); saveDraft(); };
}

/* ---------------- Step 6: Summary ---------------- */
function renderSummary() {
  const svc = getService();
  const list = document.getElementById("summaryList");
  let rows = [];
  rows.push(row("सेवा", svc ? svc.nameHi + " (" + svc.nameEn + ")" : "—", 1));
  rows.push(row("गाँव / क्षेत्र", state.village || "—", 2));
  if (state.serviceId === "other") {
    rows.push(row("विवरण", state.otherDetails || "—", 3));
  } else {
    rows.push(row("मात्रा", state.qty + " " + (svc ? svc.unit : ""), 3));
  }
  rows.push(row("तारीख", state.dateLabel || state.date || "—", 4));
  if (state.name) rows.push(row("नाम", state.name, 5));
  if (state.phone) rows.push(row("मोबाइल", state.phone, 5));
  if (state.remarks) rows.push(row("टिप्पणी", state.remarks, 5));
  list.innerHTML = rows.join("");

  list.querySelectorAll("[data-edit]").forEach(function (el) {
    el.addEventListener("click", function () {
      goToStep(parseInt(el.getAttribute("data-edit"), 10));
    });
  });
}

function row(label, value, editStep) {
  return '<div class="summary-row">' +
    '<span class="s-label">' + label + '</span>' +
    '<span class="s-value">' + escapeHtml(value) + '<br><a class="s-edit" data-edit="' + editStep + '">बदलें</a></span>' +
  '</div>';
}

/* ---------------- Navigation ---------------- */
function validStep(step) {
  switch (step) {
    case 1: return !!state.serviceId;
    case 2: return state.village.trim().length > 0;
    case 3:
      if (state.serviceId === "other") return state.otherDetails.trim().length > 0;
      return state.qty > 0;
    case 4: return !!state.date;
    case 5: return state.name.trim().length > 0 && (state.phone.length === 0 || state.phone.length === 10);
    default: return true;
  }
}

function updateNextButtonState() {
  const btn = document.getElementById("btnNext");
  btn.disabled = !validStep(state.step);
}

function showStep(step) {
  document.querySelectorAll(".wizard-step").forEach(function (el) {
    el.classList.toggle("active", parseInt(el.getAttribute("data-step"), 10) === step);
  });
  const activeStepEl = document.querySelector('.wizard-step[data-step="' + step + '"]');
  if (activeStepEl) activeStepEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function goToStep(step) {
  state.step = Math.min(TOTAL_STEPS, Math.max(1, step));
  saveDraft();
  renderProgress();
  showStep(state.step);
  renderCurrentStepContent();
  updateStepLabels();
  updateNavButtons();
  updateNextButtonState();
}

function goNext() {
  if (!validStep(state.step)) {
    showToast("कृपया आवश्यक जानकारी भरें");
    return;
  }
  if (state.step === TOTAL_STEPS) {
    confirmBooking();
    return;
  }
  goToStep(state.step + 1);
}

function goBack() {
  if (state.step === 1) {
    window.location.href = "services.html";
    return;
  }
  goToStep(state.step - 1);
}

function renderCurrentStepContent() {
  if (state.step === 1) renderServiceGrid();
  if (state.step === 2) renderVillageStep();
  if (state.step === 3) renderQuantityStep();
  if (state.step === 4) renderDateStep();
  if (state.step === 5) renderRemarksStep();
  if (state.step === 6) renderSummary();
}

function updateStepLabels() {
  document.querySelectorAll(".wizard-step-label").forEach(function (el, idx) {
    el.textContent = "Step " + (idx + 1) + " / " + TOTAL_STEPS;
  });
}

function updateNavButtons() {
  const nextBtn = document.getElementById("btnNext");
  nextBtn.textContent = state.step === TOTAL_STEPS ? "WhatsApp पर बुक करें" : "आगे बढ़ें";
}

function confirmBooking() {
  // Runs the booking engine's full pipeline (Booking Object -> Validation
  // -> Serializer -> Delivery Adapter -> WhatsApp) — see js/booking/engine.js.
  // `result.errors` should be unreachable in normal use: every field the
  // engine's validator checks is already gated by validStep() before the
  // wizard lets a farmer reach this step. It's a defensive boundary check,
  // not a new user-facing rule — see js/booking/validator.js.
  const result = submitBooking(state);
  if (!result.ok) {
    showToast("कृपया आवश्यक जानकारी भरें");
    return;
  }

  document.getElementById("successIcon").innerHTML = krishiOxIcon("checkCircle");
  const waBtn = document.getElementById("successWaBtn");
  waBtn.href = (result.delivery && result.delivery.url) || "#";
  waBtn.innerHTML = krishiOxIcon("whatsapp") + " WhatsApp पर भेजें";

  const copyBtn = document.getElementById("copyMessageBtn");
  if (copyBtn) {
    copyBtn.onclick = function () {
      copyToClipboard(result.payload.text).then(function (ok) {
        showToast(ok
          ? "मैसेज कॉपी हो गया — नेटवर्क आने पर पेस्ट करके भेजें"
          : "कॉपी नहीं हो सका, कृपया दोबारा प्रयास करें");
      });
    };
  }

  document.getElementById("wizardWrap").style.display = "none";
  document.getElementById("successWrap").style.display = "block";

  // Persist last booking locally (for future "my bookings" expansion)
  const history = KrishiOxStore.get("bookingHistory", []);
  history.unshift({
    service: state.serviceId,
    village: state.village,
    date: state.date,
    ts: Date.now()
  });
  KrishiOxStore.set("bookingHistory", history.slice(0, 20));
  clearDraft();
}

/* ---------------- Init ---------------- */
function initFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const svc = params.get("service");
  if (svc && KRISHIOX_SERVICES.some(function (s) { return s.id === svc; })) {
    state.serviceId = svc;
    state.step = 2;
    return true;
  }
  return false;
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("confirmInfoIcon").innerHTML = krishiOxIcon("info");
  const explicitStart = initFromQuery();
  if (explicitStart) {
    clearDraft();
  } else if (restoreDraftIfAny()) {
    showToast("आपकी पिछली अधूरी बुकिंग वापस लाई गई है");
  }
  renderProgress();
  showStep(state.step);
  renderCurrentStepContent();
  updateStepLabels();
  updateNavButtons();
  updateNextButtonState();

  document.getElementById("btnNext").addEventListener("click", goNext);
  document.getElementById("btnBack").addEventListener("click", goBack);
});
