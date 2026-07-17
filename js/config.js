/* ==========================================================================
   GOSPOLO — Global Config
   Edit these values to configure the deployment.
   ========================================================================== */

const GOSPOLO_CONFIG = {
  // WhatsApp business number in international format, no + or spaces.
  whatsappNumber: "919999999999",

  // Phone number for direct calling (tel: link)
  callNumber: "+919999999999",

  // Service area label shown across the app
  serviceArea: "सहारनपुर, उत्तर प्रदेश",

  // Support hours
  supportHours: "सुबह 6 बजे – रात 9 बजे (सातों दिन)",

  // --- Brand identity ---
  // Everything JS-rendered (header, footer, toasts) reads from here, so
  // changing the platform name only needs an edit here. Static SEO tags
  // (<title>, meta description, canonical, Open Graph, JSON-LD, manifest.json)
  // can't be JS-driven without hurting crawlers/link-preview bots that don't
  // execute JavaScript — use dev/rebrand.js to update those in one command.
  appName: "GOSPOLO",
  brandInitials: "GP",
  appTagline: "खेती की सेवाएँ, समय पर बुकिंग"
};

// Master service catalogue — used on Home, Services, and Booking pages.
const GOSPOLO_SERVICES = [
  {
    id: "tractor",
    nameHi: "ट्रैक्टर सेवा",
    nameEn: "Tractor Service",
    desc: "जुताई व अन्य खेत कार्यों के लिए ट्रैक्टर बुक करें",
    icon: "tractor",
    unit: "बीघा (Bigha)"
  },
  {
    id: "rotavator",
    nameHi: "रोटावेटर",
    nameEn: "Rotavator",
    desc: "मिट्टी भुरभुरी करने व बुवाई पूर्व तैयारी हेतु",
    icon: "rotavator",
    unit: "बीघा (Bigha)"
  },
  {
    id: "cultivator",
    nameHi: "कल्टीवेटर",
    nameEn: "Cultivator",
    desc: "गहरी जुताई व खरपतवार नियंत्रण के लिए",
    icon: "cultivator",
    unit: "बीघा (Bigha)"
  },
  {
    id: "laser-leveller",
    nameHi: "लेज़र लेवलर",
    nameEn: "Laser Leveller",
    desc: "खेत को समतल कर पानी व खाद की बचत करें",
    icon: "laser",
    unit: "बीघा (Bigha)"
  },
  {
    id: "harvesting",
    nameHi: "हार्वेस्टिंग",
    nameEn: "Harvesting",
    desc: "गेहूं, धान व अन्य फसल की कटाई सेवा",
    icon: "harvest",
    unit: "बीघा (Bigha)"
  },
  {
    id: "mini-loader",
    nameHi: "मिनी लोडर",
    nameEn: "Mini Loader",
    desc: "खाद, अनाज व सामान लोड-अनलोड हेतु",
    icon: "loader",
    unit: "घंटे (Hours)"
  },
  {
    id: "tractor-trolley",
    nameHi: "ट्रैक्टर ट्रॉली",
    nameEn: "Tractor Trolley",
    desc: "अनाज, खाद व सामान ढुलाई के लिए ट्रॉली",
    icon: "trolley",
    unit: "ट्रिप (Trips)"
  },
  {
    id: "transport",
    nameHi: "परिवहन सेवा",
    nameEn: "Transport",
    desc: "फसल व सामान को मंडी अथवा गोदाम तक पहुँचाएँ",
    icon: "transport",
    unit: "किलोमीटर (KM)"
  },
  {
    id: "irrigation",
    nameHi: "सिंचाई सेवा",
    nameEn: "Irrigation",
    desc: "पंप सेट व सिंचाई उपकरण सहायता",
    icon: "irrigation",
    unit: "बीघा (Bigha)"
  },
  {
    id: "farm-labour",
    nameHi: "कृषि श्रमिक",
    nameEn: "Farm Labour",
    desc: "बुवाई, निराई व अन्य कार्यों हेतु अनुभवी श्रमिक",
    icon: "labour",
    unit: "व्यक्ति (Workers)"
  },
  {
    id: "other",
    nameHi: "अन्य सेवा",
    nameEn: "Other Service",
    desc: "आपकी विशेष आवश्यकता — हमें विवरण भेजें",
    icon: "other",
    unit: "विवरण दें"
  }
];

// Common villages / areas around Saharanpur — shown as datalist suggestions.
const GOSPOLO_VILLAGES = [
  "बांदूखेड़ी (Bandukheri)",
  "फंदपुरी (Phandpuri)",
  "परसौली (Parasauli)",
  "बिजना खेड़ी (Bijna Kheri)",
  "दैद नौर (Daid Naur)",
  "ठाठ खेड़ी (Thath Kheri)",
  "खजूर हेड़ी (Khazoor Heri)",
  "चक मछेर हेड़ी (Chak Machher Heri)",
  "मच्छड़ हेड़ी (Machhar Heri)",
  "सुभानपुरा (Subhanpura)",
  "मोहिउद्दीनपुर (Mohiuddinpur)",
  "कालरी (Kalri)",
  "बुधन माजरा (Budhan Mazra)",
  "जजवा (Jajwa)",
  "चौखेड़ी (Chaukheri)",
  "जगेता नजीब (Jageta Najib)"
];

// Persist app-wide small state in localStorage safely.
const GospoloStore = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem("gospolo:" + key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem("gospolo:" + key, JSON.stringify(value));
    } catch (e) { /* storage unavailable — ignore */ }
  }
};
