/* ==========================================================================
   GOSPOLO — Icon Library
   Lightweight inline SVGs (stroke-based, currentColor friendly).
   No external icon fonts/dependencies.
   ========================================================================== */

const GOSPOLO_ICONS = {
  tractor: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17" cy="17.5" r="3.5"/><path d="M9 17.5h5.5"/><path d="M4 13l1.5-5h6l1 3h3.5a2 2 0 0 1 2 2v2.5"/><path d="M11.5 8V5h3"/><path d="M2 13h3"/></svg>`,
  rotavator: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="2"/><path d="M12 8v4"/><path d="M5 20l2-8h10l2 8"/><path d="M5 20h14"/><path d="M8 20v-3M12 20v-3M16 20v-3"/></svg>`,
  cultivator: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l4 4"/><path d="M20 4l-4 4"/><path d="M12 3v6"/><path d="M6 10h12l-2 10H8L6 10z"/><path d="M9 14h6"/></svg>`,
  laser: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="15" width="18" height="4" rx="1"/><path d="M7 15V9a5 5 0 0 1 10 0v6"/><path d="M12 4V2"/><circle cx="12" cy="6" r="1.2" fill="currentColor" stroke="none"/></svg>`,
  harvest: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c4-1 6-3 7-7"/><path d="M14 3c-4 1-7 4-7 9 0 3 2 5 5 5 5 0 8-4 9-13-3 1-5 0-7-1z"/></svg>`,
  loader: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="12" width="7" height="6" rx="1"/><path d="M9 15h4l4-5h3l-2 5"/><circle cx="6" cy="19.5" r="1.5"/><circle cx="16" cy="19.5" r="1.5"/></svg>`,
  trolley: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="14" height="7" rx="1"/><path d="M16 12h4l2 2v2h-3"/><circle cx="6" cy="19" r="1.6"/><circle cx="13" cy="19" r="1.6"/></svg>`,
  transport: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="7" width="13" height="9" rx="1"/><path d="M14 10h4l3 3v3h-2"/><circle cx="5.5" cy="18.5" r="1.6"/><circle cx="16.5" cy="18.5" r="1.6"/></svg>`,
  irrigation: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s5 6 5 10a5 5 0 0 1-10 0c0-4 5-10 5-10z"/><path d="M4 20h16"/></svg>`,
  labour: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="6" r="2.4"/><path d="M4 20v-2a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v2"/><circle cx="18" cy="8" r="1.8"/><path d="M15.5 20v-1.5a4 4 0 0 1 4-4h1"/></svg>`,
  other: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>`,

  // UI icons
  home: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>`,
  grid: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M2 20v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1"/><circle cx="18" cy="8" r="2.4"/><path d="M16 13.2A5 5 0 0 1 22 18v1"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-5"/><circle cx="12" cy="8.2" r="0.6" fill="currentColor" stroke="none"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 3a2 2 0 0 1-.5 2L8 10a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2-.5c1 .3 2 .5 3 .6a2 2 0 0 1 1.7 2z"/></svg>`,
  whatsapp: `<svg viewBox="0 0 32 32" fill="currentColor"><path d="M16.02 2.67C8.65 2.67 2.67 8.65 2.67 16.02c0 2.5.68 4.85 1.86 6.87L2.67 29.33l6.6-1.83a13.3 13.3 0 0 0 6.75 1.84c7.37 0 13.35-5.98 13.35-13.35S23.4 2.67 16.02 2.67zm0 24.2c-2.13 0-4.16-.58-5.93-1.66l-.42-.25-4.4 1.22 1.18-4.3-.28-.44a11.13 11.13 0 0 1-1.75-6.02c0-6.15 5-11.15 11.15-11.15 6.15 0 11.15 5 11.15 11.15 0 6.16-5 11.15-11.15 11.15z"/><path d="M22.07 18.87c-.33-.17-1.94-.96-2.24-1.07-.3-.11-.52-.17-.74.17-.22.33-.85 1.07-1.04 1.29-.19.22-.38.25-.71.08-.33-.17-1.4-.51-2.66-1.63-.98-.88-1.65-1.96-1.84-2.29-.19-.33-.02-.51.15-.68.15-.15.33-.38.5-.58.17-.19.22-.33.33-.55.11-.22.06-.41-.03-.58-.08-.17-.74-1.78-1.01-2.44-.27-.64-.54-.55-.74-.56l-.63-.01c-.22 0-.58.08-.88.41s-1.15 1.12-1.15 2.74 1.18 3.18 1.34 3.4c.17.22 2.32 3.54 5.62 4.97.79.34 1.4.54 1.88.69.79.25 1.51.22 2.08.13.63-.09 1.94-.79 2.22-1.56.27-.77.27-1.42.19-1.56-.08-.14-.3-.22-.63-.39z"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M9.5 18a2.5 2.5 0 0 0 5 0"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9"/></svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>`,
  rupee: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12M6 8h12M6 8c4 0 7 1.5 7 4.5S15 17 10 17l7 5"/></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3l6 2 5-2v16l-5 2-6-2-5 2V5l5-2z"/><path d="M9 3v16M15 5v16"/></svg>`,
  target: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none"/></svg>`,
  handshake: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12l4-4 4 3 3-3 4 4"/><path d="M6 8l3 3-2 2-3-3z"/><path d="M22 12l-3 3-2-2 3-3z"/></svg>`,
  chat: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v12H8l-4 4V4z"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8l-6.2 3.3 1.2-6.9-5-4.9 6.9-1z"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`,
  location: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
  future: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
  install: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13"/><path d="M7 11l5 5 5-5"/><path d="M4 19h16"/></svg>`
};

/**
 * Returns inline SVG markup for a given icon key.
 */
function gospoloIcon(name) {
  return GOSPOLO_ICONS[name] || GOSPOLO_ICONS.other;
}
