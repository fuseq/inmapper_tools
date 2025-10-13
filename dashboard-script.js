document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard loaded successfully');
    
    // Tüm tool kartlarını seçelim
    const toolCards = document.querySelectorAll('.tool-card');
    const tagButtons = document.querySelectorAll('.tag-btn');
    
    // Her karta tıklama olayı ekleyelim - kart tıklandığında ilgili tool'a git
    toolCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Link elementini bul
            const link = card.querySelector('a');
            if (link && link.getAttribute('href') && link.getAttribute('href') !== '#') {
                window.location.href = link.getAttribute('href');
            }
        });
        
        // Hover efekti için
        card.addEventListener('mouseenter', () => {
            card.style.cursor = 'pointer';
        });
    });
    
    // Tag filtreleme sistemi
    tagButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Tüm butonlardan active class'ını kaldır
            tagButtons.forEach(b => b.classList.remove('active'));
            
            // Tıklanan butona active class ekle
            btn.classList.add('active');
            
            // Filtre değerini al
            const filter = btn.getAttribute('data-filter');
            
            // Kartları filtrele
            toolCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all') {
                    card.classList.remove('hidden');
                } else if (category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
});
