const translations = {
    en: {
        title: 'Tools',
        subtitle: 'Internal tools and utilities for the inMapper platform',
        searchPlaceholder: 'Search tools...',
        filterAll: 'All',
        filterAnalytics: 'Analytics',
        filterManagement: 'Management',
        filterEditor: 'Editor/Generator',
        filterSvg: 'SVG/Map Positioning',
        filterAi: 'AI/ML',
        qrcode_title: 'QR Code Generator',
        qrcode_desc: 'Creating and customizing QR codes from URLs',
        maptool_title: 'Map Position Tool',
        maptool_desc: 'Tool for placing visuals and setting coordinates on the map',
        analytics_title: 'Analytics Dashboard',
        analytics_desc: 'Tool for viewing detailed usage and route statistics',
        kiosk_title: 'Kiosk Manager',
        kiosk_desc: 'Kiosk device and landing page management panel',
        svgvalidator_title: 'SVG Validator',
        svgvalidator_desc: 'Routing map SVG validation and analysis tool',
        idassigner_title: 'ID Assigner',
        idassigner_desc: 'SVG element ID assignment and management tool',
        badgeEditor: 'Editor / Generator',
        badgeAnalytics: 'Analytics',
        badgeManagement: 'Management',
        badgeSvg: 'SVG / Map Positioning',
        comingSoon: 'Coming Soon',
        comingSoonTitle: 'More Tools',
        comingSoonDesc: 'New tools are being developed'
    },
    tr: {
        title: 'Araçlar',
        subtitle: 'inMapper platformu için dahili araç ve yardımcılar',
        searchPlaceholder: 'Araç ara...',
        filterAll: 'Tümü',
        filterAnalytics: 'Analitik',
        filterManagement: 'Yönetim',
        filterEditor: 'Editör/Oluşturucu',
        filterSvg: 'SVG/Harita Konumlama',
        filterAi: 'AI/ML',
        qrcode_title: 'QR Kod Oluşturucu',
        qrcode_desc: 'URL\'lerden QR kod oluşturma ve özelleştirme',
        maptool_title: 'Harita Konumlama',
        maptool_desc: 'Harita üzerinde görsel yerleştirme ve koordinat ayarlama aracı',
        analytics_title: 'Analitik Paneli',
        analytics_desc: 'Detaylı kullanım ve rota istatistikleri görüntüleme aracı',
        kiosk_title: 'Kiosk Yönetici',
        kiosk_desc: 'Kiosk cihaz ve açılış sayfası yönetim paneli',
        svgvalidator_title: 'SVG Doğrulayıcı',
        svgvalidator_desc: 'Yönlendirme haritası SVG doğrulama ve analiz aracı',
        idassigner_title: 'ID Atayıcı',
        idassigner_desc: 'SVG eleman ID atama ve yönetim aracı',
        badgeEditor: 'Editör / Oluşturucu',
        badgeAnalytics: 'Analitik',
        badgeManagement: 'Yönetim',
        badgeSvg: 'SVG / Harita Konumlama',
        comingSoon: 'Yakında',
        comingSoonTitle: 'Daha Fazla Araç',
        comingSoonDesc: 'Yeni araçlar geliştiriliyor'
    }
};

/* ── Theme ── */

function getPreferredTheme() {
    const stored = localStorage.getItem('inmapper-theme');
    if (stored) return stored;
    return 'light';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('inmapper-theme', theme);
}

/* ── Language ── */

function getPreferredLang() {
    const stored = localStorage.getItem('inmapper-lang');
    if (stored) return stored;
    return 'en';
}

function applyLanguage(lang) {
    const t = translations[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) {
            el.textContent = t[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key] !== undefined) {
            el.placeholder = t[key];
        }
    });

    document.documentElement.lang = lang;
    localStorage.setItem('inmapper-lang', lang);
}

/* ── Search ── */

function filterCards() {
    const searchInput = document.getElementById('searchInput');
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

    const activeTag = document.querySelector('.tag-btn.active');
    const tagFilter = activeTag ? activeTag.getAttribute('data-filter') : 'all';

    document.querySelectorAll('.tool-card').forEach(card => {
        const title = (card.querySelector('h3') || {}).textContent || '';
        const desc = (card.querySelector('p') || {}).textContent || '';
        const category = card.getAttribute('data-category') || '';

        const matchesSearch = !query ||
            title.toLowerCase().includes(query) ||
            desc.toLowerCase().includes(query);

        const matchesTag = tagFilter === 'all' || category === tagFilter;

        if (matchesSearch && matchesTag) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

/* ── Init ── */

document.addEventListener('DOMContentLoaded', () => {
    const toolCards = document.querySelectorAll('.tool-card');
    const tagButtons = document.querySelectorAll('.tag-btn');
    const themeToggle = document.getElementById('themeToggle');
    const langToggle = document.getElementById('langToggle');
    const searchInput = document.getElementById('searchInput');

    // Apply saved preferences immediately
    applyTheme(getPreferredTheme());

    const currentLang = getPreferredLang();
    applyLanguage(currentLang);

    // Set active lang button
    langToggle.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });

    // Card click
    toolCards.forEach(card => {
        if (card.classList.contains('coming-soon')) return;

        card.addEventListener('click', () => {
            const link = card.querySelector('a');
            if (!link || !link.getAttribute('href') || link.getAttribute('href') === '#') return;

            if (link.getAttribute('target') === '_blank') {
                window.open(link.href, '_blank');
            } else {
                window.location.href = link.href;
            }
        });
    });

    // Tag filter
    tagButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tagButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterCards();
        });
    });

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    // Language toggle
    if (langToggle) {
        langToggle.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                langToggle.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyLanguage(lang);
                filterCards();
            });
        });
    }

});
