/* ==========================================================================
   KrishiOx — Service Catalogue Configuration
   Single responsibility: the master list of bookable services. Used on
   Home (quick grid), Services (full catalogue), and Booking (step 1 +
   step 3's unit label) — the single source of truth so adding, removing,
   or relabeling a service only needs an edit here.
   ========================================================================== */

/**
 * Master service catalogue.
 * @type {Array<{id: string, nameHi: string, nameEn: string, desc: string, icon: string, unit: string}>}
 */
export const KRISHIOX_SERVICES = [
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
