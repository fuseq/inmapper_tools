document.addEventListener('DOMContentLoaded', () => {
    // Dashboard'da yapılacak işlemler için hazırlık
    console.log('Dashboard loaded successfully');
    
    // Tüm tool kartlarını seçelim
    const toolCards = document.querySelectorAll('.tool-card');
    
    // Her karta tıklama olayı ekleyelim
    toolCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Eğer tıklanan element buton değilse, butona tıklanmış gibi işlem yapalım
            if (!e.target.classList.contains('btn')) {
                // Kartın içindeki buton elementini bulalım
                const btn = card.querySelector('.btn');
                if (btn && btn.getAttribute('href') !== '#') {
                    window.location.href = btn.getAttribute('href');
                }
            }
        });
    });
});