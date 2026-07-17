<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>GOSPOLO - आधुनिक खेती सेवाएं</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#111827">
    <!-- Apple PWA Meta -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="GOSPOLO">
</head>
<body>

    <!-- Top App Bar -->
    <header class="app-bar">
        <div class="logo-container" onclick="app.navigate('home')">
            <span class="logo-text">GOSPOLO</span>
            <span class="tagline">सहारनपुर कृषि सेवा</span>
        </div>
        <div class="offline-badge" id="offlineBadge">ऑफ़लाइन मोड (Offline)</div>
    </header>

    <!-- Main View Container -->
    <main id="appContent">

        <!-- HOME VIEW -->
        <section id="view-home" class="view active">
            <div class="hero-card">
                <h1>उन्नत कृषि सेवाएं, अब आपके शेड्यूल पर</h1>
                <p>बिना किसी एडवांस पेमेंट के अपनी खेती की बुकिंग सीधे व्हाट्सएप पर कन्फर्म करें।</p>
                <button class="btn btn-primary" onclick="app.navigate('services')">सेवाएं चुनें / Book Service →</button>
            </div>

            <div class="section-title-container">
                <h2>मुख्य सेवाएं (Core Services)</h2>
                <span class="link-action" onclick="app.navigate('services')">सभी देखें</span>
            </div>
            
            <div class="grid grid-2" id="featuredServices">
                <!-- Injected via JS -->
            </div>

            <div class="promo-banner" onclick="app.navigate('partners')">
                <h3>हमारे पार्टनर बनें (Become a Partner)</h3>
                <p>यदि आपके पास ट्रैक्टर या कृषि मशीनरी है, तो हमारे साथ जुड़कर कमाई बढ़ाएं।</p>
            </div>
        </section>

        <!-- SERVICES VIEW -->
        <section id="view-services" class="view">
            <h2>कृषि सेवाओं की सूची</h2>
            <p class="subtitle">अपनी जरूरत की सेवा पर टैप करें और बुकिंग आगे बढ़ाएं</p>
            <div class="grid grid-2" id="allServicesList">
                <!-- Injected via JS -->
            </div>
        </section>

        <!-- BOOKING VIEW -->
        <section id="view-booking" class="view">
            <div class="booking-header">
                <button class="btn-back" onclick="app.navigate('services')">← वापस</button>
                <h2>बुक करें: <span id="selectedServiceName" class="highlight">सेवा</span></h2>
            </div>

            <form id="bookingForm" onsubmit="app.handleBookingSubmit(event)">
                <div class="form-group">
                    <label>आपका गाँव (Select Village) *</label>
                    <div class="chips-container" id="villageChips">
                        <!-- Chips injected via JS -->
                    </div>
                </div>

                <div class="form-group">
                    <label for="inputArea">कुल जमीन माप (Area in Acres) *</label>
                    <div class="input-with-unit">
                        <input type="number" id="inputArea" required min="0.5" step="0.5" placeholder="उदाहरण: 2.5">
                        <span class="unit-label">Acre (एकड़)</span>
                    </div>
                </div>

                <div class="form-group">
                    <label for="inputDate">काम की तारीख (Schedule Date) *</label>
                    <input type="date" id="inputDate" required>
                </div>

                <div class="form-group">
                    <label for="inputRemarks">अन्य जानकारी (Any Instructions)</label>
                    <textarea id="inputRemarks" rows="2" placeholder="कोई विशेष निर्देश या लैंडमार्क यहाँ लिखें..."></textarea>
                </div>

                <button type="submit" class="btn btn-whatsapp">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397 0 11.944 0c3.176.001 6.16 1.238 8.403 3.484 2.243 2.246 3.479 5.23 3.477 8.407-.003 6.549-5.34 11.896-11.886 11.896-.001 0-.002 0-.003 0-2.001-.001-3.968-.507-5.713-1.464L0 24zm6.066-3.447c1.652.98 3.516 1.497 5.424 1.498h.005c5.447 0 9.877-4.426 9.88-9.874.001-2.639-1.023-5.121-2.883-6.983C16.687 3.332 14.208 2.3 11.571 2.3c-5.451 0-9.88 4.426-9.883 9.875-.001 1.97.513 3.894 1.49 5.61l-.964 3.52 3.606-.946zm11.381-4.721c-.301-.151-1.784-.88-2.056-.979-.273-.099-.472-.148-.671.151-.198.298-.766.979-.939 1.178-.173.199-.347.223-.648.073-.302-.151-1.272-.469-2.423-1.496-.895-.798-1.5-1.784-1.676-2.085-.176-.301-.019-.464.132-.613.135-.134.301-.352.451-.528.151-.176.201-.301.302-.503.101-.201.05-.377-.025-.528-.075-.151-.671-1.617-.92-2.214-.242-.58-.488-.501-.671-.51l-.571-.01c-.199 0-.522.075-.796.377-.273.301-1.043 1.021-1.043 2.491 0 1.471 1.069 2.891 1.218 3.091.149.2 2.105 3.214 5.099 4.506.712.308 1.268.493 1.701.631.716.227 1.368.195 1.883.118.574-.085 1.784-.73 2.032-1.435.248-.704.248-1.308.174-1.436-.074-.128-.272-.201-.573-.352z"/></svg>
                    व्हाट्सएप पर बुकिंग भेजें (Confirm on WhatsApp)
                </button>
            </form>
        </section>

        <!-- PARTNERS VIEW -->
        <section id="view-partners" class="view">
            <h2>हमारे साथ जुड़ें (Partner Registration)</h2>
            <p class="subtitle">क्या आपके पास कृषि मशीनरी या ट्रैक्टर है? आज ही कमाई शुरू करें।</p>
            <div class="card bg-charcoal text-ivory">
                <h4>साझेदारी के लाभ:</h4>
                <ul>
                    <li>नियमित बुकिंग की गारंटी</li>
                    <li>कोई छुपी हुई फीस नहीं</li>
                    <li>गाँव के पास ही काम की सुविधा</li>
                </ul>
                <button class="btn btn-whatsapp" onclick="app.sendPartnerInquiry()">
                    व्हाट्सएप पार्टनर इन्क्वायरी शुरू करें
                </button>
            </div>
        </section>

        <!-- ABOUT VIEW -->
        <section id="view-about" class="view">
            <h2>हमारे बारे में (About GOSPOLO)</h2>
            <div class="card">
                <p><strong>GOSPOLO</strong> सहारनपुर (उत्तर प्रदेश) के किसान भाइयों के लिए समर्पित एक अत्याधुनिक और प्रीमियम शेड्यूलिंग प्लेटफॉर्म है।</p>
                <p>हमारा उद्देश्य पारंपरिक कृषि और आधुनिक तकनीक का मेल कराकर, सही समय पर उन्नत उपकरणों की उपलब्धता सुनिश्चित करना है। यह कोई रेंटल मार्केटप्लेस नहीं है, बल्कि एक समयबद्ध, विश्वसनीय कृषि सेवा नेटवर्क है।</p>
            </div>
        </section>

        <!-- CONTACT VIEW -->
        <section id="view-contact" class="view">
            <h2>संपर्क करें (Contact Us)</h2>
            <div class="card text-center">
                <p>मुख्य कार्यालय: सहारनपुर, उत्तर प्रदेश</p>
                <p>किसी भी सहायता या प्रश्न के लिए हमें नीचे दिए बटन द्वारा मैसेज भेजें।</p>
                <button class="btn btn-primary" onclick="window.open('https://wa.me/919999999999?text=Hello%20Gospolo%20Support', '_blank')">💬 कस्टमर केयर सपोर्ट</button>
            </div>
        </section>

    </main>

    <!-- Bottom Navigation Bar -->
    <nav class="bottom-nav">
        <button class="nav-item active" data-view="home" onclick="app.navigate('home')">
            <span class="icon">🏠</span>
            <span class="nav-label">होम</span>
        </button>
        <button class="nav-item" data-view="services" onclick="app.navigate('services')">
            <span class="icon">🚜</span>
            <span class="nav-label">सेवाएं</span>
        </button>
        <button class="nav-item" data-view="partners" onclick="app.navigate('partners')">
            <span class="icon">🤝</span>
            <span class="nav-label">पार्टनर</span>
        </button>
        <button class="nav-item" data-view="about" onclick="app.navigate('about')">
            <span class="icon">ℹ️</span>
            <span class="nav-label">परिचय</span>
        </button>
        <button class="nav-item" data-view="contact" onclick="app.navigate('contact')">
            <span class="icon">📞</span>
            <span class="nav-label">संपर्क</span>
        </button>
    </nav>

    <script src="app.js"></script>
</body>
</html>
  
