import {
    renderFromToEvents,
    renderFromToEventsByStart,
    renderSearchedEvents,
    renderTop5SearchedTerms,
    renderDailyEvents,
    renderHourlyEvents,
    renderOperatingSystemDistribution,
    renderLanguageDistribution,
    renderStoreCategoriesDonutChart,
    summarizeTitlesWithDetails,
    summarizeTopStoresByCategory,
    categorizeEventsByDayAndCategory,
    cleanCampaignData,
    getTotalActionsByFloor,
    findEventFloor,
    renderTopUnitsTable,
    renderTopStoresTable,
    summarizeTopFoodStoresByCategory,
    summarizeTopServicesByCategory,
    renderFoodPlacesTable,
    renderServicesTable,
    renderFloorsTable,
    renderKiosksTable,
    renderStoreCategoriesAreaChart,
    categorizeTitlesWithJson,
    // Yeni fonksiyonları ekleyin
    renderMatchedSearches,
    renderUnmatchedSearches
} from './dataHandlers.js';

let globalSiteId = ''; // 🌐 Varsayılan site ID


document.addEventListener('DOMContentLoaded', () => {

    // Sayfa yüklendiğinde selectedSiteId'yi kontrol et
    const storedSiteId = localStorage.getItem('selectedSiteId');
    if (storedSiteId) {
        globalSiteId = storedSiteId;
        // Eğer startDate ve endDate mevcutsa, onları al
        const storedStartDate = localStorage.getItem('startDate');
        const storedEndDate = localStorage.getItem('endDate');
        if (storedStartDate && storedEndDate) {
            fetchAllData(storedStartDate, storedEndDate);
        } else {
            // Eğer startDate ve endDate yoksa, selectedRange değerini al ve verileri yükle
            const selectedRange = localStorage.getItem('selectedRange');
            if (selectedRange) {
                handleQuickRange(parseInt(selectedRange));
            }
        }
    }

    // globalSiteId değiştiğinde form elemanlarını aktif hale getirme
    function enableFormElements() {
        const inputs = document.querySelectorAll('#date-form input, #date-form button');
        inputs.forEach(input => {
            input.disabled = false;
        });
    }





    const form = document.getElementById('date-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        localStorage.setItem('startDate', startDate);
        localStorage.setItem('endDate', endDate);
        localStorage.removeItem('selectedRange');

        fetchAllData(startDate, endDate);
    });

    // Hızlı seçim butonları
    document.getElementById('btn-1g').addEventListener('click', () => {
        localStorage.setItem('selectedRange', '1');
        localStorage.removeItem('startDate');
        localStorage.removeItem('endDate');
        handleQuickRange(1);
    });

    document.getElementById('btn-1h').addEventListener('click', () => {
        localStorage.setItem('selectedRange', '7');
        localStorage.removeItem('startDate');
        localStorage.removeItem('endDate');
        handleQuickRange(7);
    });

    document.getElementById('btn-1a').addEventListener('click', () => {
        localStorage.setItem('selectedRange', '30');
        localStorage.removeItem('startDate');
        localStorage.removeItem('endDate');
        handleQuickRange(30);
    });

    document.getElementById('btn-1y').addEventListener('click', () => {
        localStorage.setItem('selectedRange', '365');
        localStorage.removeItem('startDate');
        localStorage.removeItem('endDate');
        handleQuickRange(365);
    });

    const dropdownContent = document.getElementById('site-dropdown');

    // API'den site verilerini almak
    fetch('https://backend-etuy.onrender.com/api/sites')
        .then(response => response.json())
        .then(sites => {
            sites.forEach(site => {
                const siteItem = document.createElement('a');
                siteItem.href = '#';
                siteItem.textContent = site.name;

                // Stil sınıfı ekleyin (isteğe bağlı, CSS kısmı aşağıda)
                siteItem.classList.add('dropdown-item');

                siteItem.addEventListener('click', function () {
                    // Önce tüm item'lardan 'selected' sınıfını kaldır
                    document.querySelectorAll('.dropdown-item').forEach(item => {
                        item.classList.remove('selected');
                    });

                    // Tıklanan elemana 'selected' sınıfı ekle
                    siteItem.classList.add('selected');

                    localStorage.setItem('selectedSiteId', site.id);
                    localStorage.removeItem('startDate');
                    localStorage.removeItem('endDate');
                    localStorage.removeItem('selectedRange');

                    globalSiteId = site.id;
                    enableFormElements();

                    const startDate = document.getElementById('startDate').value;
                    const endDate = document.getElementById('endDate').value;
                    fetchAllData(startDate, endDate);
                });

                dropdownContent.appendChild(siteItem);
            });
        })
        .catch(error => {
            console.error('Veri alırken bir hata oluştu:', error);
        });

    const dropdownBtn = document.querySelector('.dropdown-btn');
    dropdownBtn.addEventListener('click', function () {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    window.addEventListener('click', function (event) {
        if (!event.target.matches('.dropdown-btn')) {
            dropdownContent.style.display = 'none';
        }
    });
});




function handleQuickRange(days) {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    let startDate, endDate;

    const today = new Date();

    if (days === 30) {
        // Bugünün bulunduğu ayın ilk günü
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        // Ayın son günü: bir sonraki ayın 0. günü (yani bir önceki ayın son günü)
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (days === 365) {
        // Yılın ilk ve son günü
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
    } else if (days) {
        // Günlük/haftalık gibi normal aralıklar
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - days + 1);
    } else {
        // days undefined veya 0 ise inputları temizle
        startDateInput.value = '';
        endDateInput.value = '';
        fetchAllData();
        return;
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    startDateInput.value = startStr;
    endDateInput.value = endStr;

    fetchAllData(startStr, endStr);
}

function fetchAllData(startDate, endDate, siteId = globalSiteId) {
    const params = startDate && endDate
        ? `?startDate=${startDate}&endDate=${endDate}&siteId=${siteId}`
        : `?siteId=${siteId}`;

    fetch(`https://backend-etuy.onrender.com/api/user-statistics${params}`)
        .then(res => res.json())
        .then(data => {

            localStorage.setItem("totalVisits", data.totalVisits);
            localStorage.setItem("bounceRate", data.bounceRate);
            localStorage.setItem("mostVisitedDeviceType", data.mostVisitedDeviceType);
            localStorage.setItem("avgTimeOnPage", data.avgTimeOnPage);

            renderStatistics(data);
        })
        .catch(() => {
            document.getElementById('user-statistics').innerText = 'Veri alınamadı';
        });

    fetch(`https://backend-etuy.onrender.com/api/events/from-to-names${params}`)
        .then(res => res.json())
        .then(data => renderFromToEvents(data, 'from-to-events'));

    fetch(`https://backend-etuy.onrender.com/api/events/from-to-names${params}`)
        .then(res => res.json())
        .then(data => renderFromToEventsByStart(data, 'start-to-end-events'));

    fetch(`https://backend-etuy.onrender.com/api/events/searched${params}`)
        .then(res => res.json())
        .then(data => renderSearchedEvents(data, 'searched-events'));

    fetch(`https://backend-etuy.onrender.com/api/events/searched${params}`)
        .then(res => res.json())
        .then(data => renderTop5SearchedTerms(data, 'top-searchs'));

    fetch(`https://backend-etuy.onrender.com/api/search-keyword-mapping${params}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(async data => {
        if (data) {
            console.log('Arama eşleştirmeleri:', data);
            
            // Eşleşen aramalar için tablo oluştur
            renderMatchedSearches(data, 'matched-searches-container');
            
            // Eşleşmeyen aramalar için fuzzy matching ile tablo oluştur
            await renderUnmatchedSearches(data, 'unmatched-searches-container');
        }
    })
    .catch(error => {
        console.error('Arama eşleştirmeleri alınırken hata oluştu:', error);
    });

    fetch(`https://backend-etuy.onrender.com/api/os-distribution${params}`)
        .then(async res => {
            const text = await res.text();
            console.log("Gelen response (ham hali):", text);

            try {
                const data = JSON.parse(text);
                renderOperatingSystemDistribution(data, 'operating-systems');
                renderOperatingSystemDistribution(data, 'pdf-operating-systems');
            } catch (err) {
                console.error("JSON parse hatası:", err);
            }
        })
        .catch(err => {
            console.error("Fetch hatası:", err);
        });
    fetch(`https://backend-etuy.onrender.com/api/events/summary-counts${params}`)
        .then(res => res.json())
        .then(data => {
            // Gelen veriyi localStorage'a her birini ayrı kaydediyoruz
            localStorage.setItem('fromTo', data.fromTo);
            localStorage.setItem('searched', data.searched);
            localStorage.setItem('touched', data.touched);
            localStorage.setItem('initialized', data.initialized);
            localStorage.setItem('total', data.total);

            // Veriyi render et
            renderEventSummary(data);
        })
        .catch(err => {
            console.error('Etkinlik verisi alınırken hata oluştu:', err);
            document.getElementById('event-summary').innerText = 'Veri alınamadı';
        });

    fetch(`https://backend-etuy.onrender.com/api/user-language-distribution${params}`)
        .then(async res => {
            const text = await res.text();
            console.log("Gelen response (ham hali):", text);

            try {
                const data = JSON.parse(text);

                // Sort the data by value in descending order
                const sortedData = Object.entries(data)
                    .sort(([, a], [, b]) => b - a)  // Sorting by value (descending)


                // Create an object with the top 5 data, including language counts
                const topLanguages = Object.fromEntries(sortedData);

                // Store it in localStorage with both the language and count
                localStorage.setItem('topLanguages', JSON.stringify(topLanguages));

                renderLanguageDistribution(topLanguages, 'language-distribution');
            } catch (err) {
                console.error("JSON parse hatası:", err);
            }
        })
        .catch(err => {
            console.error("Fetch hatası:", err);
        });

    const apiEndpoint = `https://backend-etuy.onrender.com/api/events/daily-count${params}`;

    fetch(apiEndpoint)
        .then(res => {
            // Yanıtın başarılı olup olmadığını kontrol edin
            if (!res.ok) {
                throw new Error(`API isteği başarısız oldu, durum: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            // Gelen verinin formatını kontrol edin (örneğin, boş dizi olup olmadığını)
            if (!Array.isArray(data) || data.length === 0) {
                console.warn('API\'den boş veya geçersiz veri döndü.');
                const dailyEventsElement = document.getElementById('daily-events');
                if (dailyEventsElement) {
                    dailyEventsElement.innerText = 'Veri bulunamadı veya geçersiz format.';
                } else {
                    console.error('Hata veya veri bulunamadı mesajını gösterecek HTML elementi (id="daily-events") bulunamadı.');
                }
                return; // İşlemi durdur
            }

            // Veriyi tarihe göre artan sırada sırala (en eskiden en yeniye)
            data.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Tüm günlerin ortalama etkinlik sayısını hesapla
            const totalEventsSum = data.reduce((sum, currentDay) => sum + currentDay.totalEvents, 0);
            const averageEventCount = totalEventsSum / data.length;

            const significantIncreaseDates = []; // Önemli artış gösteren tarihleri saklayacak dizi

            // Yapılandırılabilir eşikler (thresholds)
            const minPercentageIncrease = 20; // Minimum yüzde artış oranı (% olarak)

            // Veri üzerinde döngü yap, her günü kontrol et
            data.forEach(dayData => {
                const currentCount = dayData.totalEvents;

                // Yüzde artışı hesapla (ortalama ile karşılaştır)
                const rawPercentageIncrease = (currentCount > 0) ? ((currentCount - averageEventCount) / averageEventCount) * 100 : 0;

                // Eğer yüzde artışı belirli bir eşiği geçiyorsa, significant increase olarak kabul et
                if (rawPercentageIncrease >= minPercentageIncrease) {
                    // Yüzdeyi iki ondalık basamağa yuvarla
                    const percentageIncreaseFormatted = rawPercentageIncrease.toFixed(2);

                    significantIncreaseDates.push({
                        date: dayData.date, // Artışın yaşandığı gün (güncel tarih)
                        currentCount: currentCount,
                        averageEventCount: averageEventCount,
                        increasePercentage: percentageIncreaseFormatted // Yüzde artış oranı (% olarak, formatlı)
                    });
                }
            });

            // Sonuçları konsola yazdır ve localStorage'a kaydet
            if (significantIncreaseDates.length > 0) {
                console.log('Ortalama etkinlik sayısına göre aşırı YÜKSELME olan tarihler:', significantIncreaseDates);
                localStorage.setItem('significantIncreaseDates', JSON.stringify(significantIncreaseDates));
            } else {
                console.log('Ortalama etkinlik sayısına göre aşırı etkinlik yükselmesi olan tarih bulunamadı.');
                // Eğer daha önce kaydedilmiş veri varsa temizle
                localStorage.removeItem('significantIncreaseDates');
            }

            // En çok etkinlik yapılan günü tespit et ve localStorage'a kaydet
            const mostEventsData = data.reduce((prev, current) => {
                return (prev.totalEvents > current.totalEvents) ? prev : current;
            });

            const mostEvents = {
                date: mostEventsData.date,
                totalEvents: mostEventsData.totalEvents
            };

            // Store the most events data in localStorage
            localStorage.setItem('mostEventsData', JSON.stringify(mostEvents));

            renderDailyEvents(data, 'daily-events');

        })
        .catch(err => {
            console.error('Günlük etkinlik verisi alınırken hata oluştu:', err);
            // Hata durumunda kullanıcıya bilgi verin
            const dailyEventsElement = document.getElementById('daily-events');
            if (dailyEventsElement) {
                dailyEventsElement.innerText = 'Veri alınamadı.';
            } else {
                console.error('Hata mesajını gösterecek HTML elementi (id="daily-events") bulunamadı.');
            }
        });

    function analyzeHourlyVisits(hourlyVisits) {
        // Toplam ve ortalama hesapla
        const totalVisits = hourlyVisits.reduce((sum, val) => sum + val, 0);
        const average = totalVisits / hourlyVisits.length;
        const roundedAverage = Math.ceil(average);

        // Ortalamanın üzerindekileri filtrele
        const aboveAverage = hourlyVisits
            .map((value, hour) => ({ hour, value }))
            .filter(item => item.value > average);

        // En yüksek 3 saat
        const top3AboveAverage = [...aboveAverage]
            .sort((a, b) => b.value - a.value)
            .slice(0, 3)
            .map(({ hour, value }) => ({
                hour,
                visits: Math.ceil(value)
            }));

        // En yüksek saat
        const maxValue = Math.max(...hourlyVisits);
        const peakHour = hourlyVisits.indexOf(maxValue);
        const roundedMax = Math.ceil(maxValue);

        // Kaydedilecek veri
        const result = {
            totalVisits: Math.ceil(totalVisits),
            roundedAverage,
            top3AboveAverage,
            peakHour,
            peakValue: roundedMax
        };

        // localStorage'a kaydet
        localStorage.setItem('hourlyVisitAnalysis', JSON.stringify(result));

        // Konsola yaz
        console.log(`📈 Total Visits: ${Math.ceil(totalVisits)}`);
        console.log(`📊 Average visits/hour (rounded): ${roundedAverage}`);
        console.log("🔥 Top 3 hours above average:");
        top3AboveAverage.forEach(({ hour, visits }) => {
            console.log(`  - ${hour}:00 → ${visits} visits`);
        });
        console.log(`🚀 Peak Hour: ${peakHour}:00 with ${roundedMax} visits`);

        return result;
    }

    // Örnek kullanım
    fetch(`https://backend-etuy.onrender.com/api/hourly-visits${params}`)
        .then(res => res.json())
        .then(data => {
            console.log('saatlik Yanıtı:', data);
            if (data.success) {
                renderHourlyEvents(data.hourlyVisits, 'hourly-events');

                // 📈 Analiz işlemi burada
                analyzeHourlyVisits(data.hourlyVisits);
            } else {
                console.error('API başarısız:', data.message);
            }
        })
        .catch(err => {
            console.error('API isteği sırasında bir hata oluştu:', err);
        });


    console.log("🔍 Fetch başlatılıyor: ", `https://backend-etuy.onrender.com/api/events/searched${params}`);

    fetch(`https://backend-etuy.onrender.com/api/events/searched${params}`)
        .then(response => response.json())
        .then(async data => {
            const titles = [];

            data.forEach(item => {
                const labelParts = item.label.split('->');
                if (labelParts.length > 1) {
                    const eventName = labelParts[1].trim();
                    titles.push(eventName);
                }
            });

            // Kategorize etme işlemi
            const categoryData = await categorizeTitlesWithJson(titles, `./assets/${globalSiteId}.json`);

            console.log("Kategoriler ve Etkinlik Sayıları:", categoryData);
            // En çok kullanılan kategoriyi bul
            let maxCategory = null;
            let maxCount = 0;

            categoryData.forEach(category => {
                if (category.nb_events > maxCount) {
                    maxCount = category.nb_events;
                    maxCategory = category.label;
                }
            });

            // Sadece kategoriyi localStorage'a kaydet
            if (maxCategory) {
                localStorage.setItem('mostUsedCategory', maxCategory);
            }

            // Donut chart'ı render etme
            renderStoreCategoriesDonutChart(categoryData, "donut-container");
        })
        .catch(error => {
            console.error("Hata oluştu:", error);
        });

    fetch(`https://backend-etuy.onrender.com/api/events/searched${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(async searchedData => {
            const titleEventsMap = {};

            // Searched verisini işle
            searchedData.forEach(item => {
                const labelParts = item.label.split('->');
                if (labelParts.length > 1) {
                    const eventName = labelParts[1].trim();
                    const nbEvents = item.nb_events || 0;
                    titleEventsMap[eventName] = (titleEventsMap[eventName] || 0) + nbEvents;
                }
            });

            console.log("Title Event Map (Searched):", titleEventsMap);

            // touched verisini al
            const touchedResponse = await fetch(`https://backend-etuy.onrender.com/api/events/touched${params}`);
            if (!touchedResponse.ok) {
                throw new Error(`HTTP error! status: ${touchedResponse.status}`);
            }
            const touchedData = await touchedResponse.json();

            // initialized verisini al
            const initializedResponse = await fetch(`https://backend-etuy.onrender.com/api/events/initialized${params}`);
            if (!initializedResponse.ok) {
                throw new Error(`HTTP error! status: ${initializedResponse.status}`);
            }
            const initializedData = await initializedResponse.json();

            // Verileri birleştir
            const mergedMap = { ...titleEventsMap };

            for (const [title, count] of Object.entries(touchedData)) {
                mergedMap[title] = (mergedMap[title] || 0) + count;
            }

            for (const [title, count] of Object.entries(initializedData)) {
                mergedMap[title] = (mergedMap[title] || 0) + count;
            }

            console.log("Birleşmiş Veri (Başlık -> Toplam Sayı):", mergedMap);

            const combinedTotalEvents = Object.values(mergedMap).reduce((sum, count) => sum + count, 0);
            console.log("Birleşmiş Toplam Etkinlik Sayısı (Searched + Touched + Initialized):", combinedTotalEvents);

            const sortedMergedUnits = Object.keys(mergedMap)
                .map(unit => ({ unit: unit, count: mergedMap[unit] }))
                .sort((a, b) => b.count - a.count);

            // En çok işlem yapılan ilk 5 birimi localStorage'a kaydet
            const filteredUnits = sortedMergedUnits.filter(item => !item.unit.includes("Direct?"));

            // En çok işlem yapılan ilk 5 temizlenmiş birimi localStorage'a kaydet
            const top5Units = filteredUnits.slice(0, 5);

            localStorage.setItem("topProcessedUnits", JSON.stringify(top5Units));
            console.log("En çok işlem yapılan ilk 5 birim (Direct? hariç):", top5Units);


            // Kategori verisini hazırla ve tabloyu render et
            const categoryData = await summarizeTitlesWithDetails(
                mergedMap,
                `./assets/${globalSiteId}.json`,
                combinedTotalEvents
            );

            renderTopUnitsTable(categoryData, "top-units-table-container", combinedTotalEvents);
        })
        .catch(error => {
            console.error("Hata oluştu:", error);
            localStorage.removeItem("topProcessedUnits");
        });


    fetch(`https://backend-etuy.onrender.com/api/events/searched${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(async searchedData => {
            const titleEventsMap = {}; // { 'storeName': toplamEventSayısı }
            let totalEvents = 0;

            // Process searched data
            searchedData.forEach(item => {
                const labelParts = item.label.split('->');
                if (labelParts.length > 1) {
                    const eventName = labelParts[1].trim();
                    const nbEvents = item.nb_events || 0;
                    titleEventsMap[eventName] = (titleEventsMap[eventName] || 0) + nbEvents;
                    totalEvents += nbEvents;
                }
            });

            // Fetch touched data
            const touchedResponse = await fetch(`https://backend-etuy.onrender.com/api/events/touched${params}`);
            if (!touchedResponse.ok) {
                throw new Error(`HTTP error! status: ${touchedResponse.status}`);
            }
            const touchedData = await touchedResponse.json();

            // Add touched data to titleEventsMap
            for (const [title, count] of Object.entries(touchedData)) {
                titleEventsMap[title] = (titleEventsMap[title] || 0) + count;
                totalEvents += count;
            }

            // Fetch initialized data
            const initializedResponse = await fetch(`https://backend-etuy.onrender.com/api/events/initialized${params}`);
            if (!initializedResponse.ok) {
                throw new Error(`HTTP error! status: ${initializedResponse.status}`);
            }
            const initializedData = await initializedResponse.json();

            // Add initialized data to titleEventsMap
            for (const [title, count] of Object.entries(initializedData)) {
                titleEventsMap[title] = (titleEventsMap[title] || 0) + count;
                totalEvents += count;
            }

            console.log("Store-Toplam Etkinlik Sayısı (Searched + Touched + Initialized):", totalEvents);
            console.log("Birleştirilmiş titleEventsMap:", titleEventsMap);

            // Kategorilere göre özetle
            const categoryData = await summarizeTopStoresByCategory(titleEventsMap, `./assets/${globalSiteId}.json`, totalEvents);
            console.log("cat-data", categoryData);

            // --- Extracting and saving top 3 units from categoryData ---
            if (categoryData && Array.isArray(categoryData)) {
                const top3CombinedUnits = categoryData
                    .map(item => ({
                        unit: item.Title || 'Bilinmeyen Birim',
                        count: item.Count || 0
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 3);

                if (top3CombinedUnits.length > 0) {
                    localStorage.setItem('top3CombinedUnits', JSON.stringify(top3CombinedUnits));
                    console.log('En çok kullanılan 3 birim (categoryData\'dan) localStoragea kaydedildi:', top3CombinedUnits);
                } else {
                    localStorage.removeItem("top3CombinedUnits");
                    console.warn('Kaydedilecek en çok kullanılan 3 birim (categoryData\'dan) bulunamadı.');
                }
            } else {
                localStorage.removeItem("top3CombinedUnits");
                console.warn('categoryData boş, tanımsız veya beklenen dizi formatında değil.');
            }
            // --- End of extracting and saving top 3 units ---

            renderTopStoresTable(categoryData, 'top-stores-container', totalEvents);
        })
        .catch(error => {
            console.error("Hata oluştu:", error);
            localStorage.removeItem("top3CombinedUnits"); // Clear localStorage on error
        });


    fetch(`https://backend-etuy.onrender.com/api/events/searched${params}`)
        .then(response => response.json())
        .then(async searchedData => {
            console.log("Gelen event verileri (searched):", searchedData);

            const titleEventCountMap = {};
            let totalEvents = 0;

            // Searched verisini işle
            searchedData.forEach(item => {
                const labelParts = item.label.split('->');
                if (labelParts.length > 1) {
                    const eventName = labelParts[1].trim();
                    const nbEvents = item.nb_events;

                    titleEventCountMap[eventName] = (titleEventCountMap[eventName] || 0) + nbEvents;
                    totalEvents += nbEvents;
                }
            });

            // Touched verisini al
            const touchedResponse = await fetch(`https://backend-etuy.onrender.com/api/events/touched${params}`);
            const touchedData = await touchedResponse.json();
            console.log("Gelen event verileri (touched):", touchedData);

            // Touched verisini işle
            for (const [eventName, count] of Object.entries(touchedData)) {
                titleEventCountMap[eventName] = (titleEventCountMap[eventName] || 0) + count;
                totalEvents += count;
            }

            // Initialized verisini al
            const initializedResponse = await fetch(`https://backend-etuy.onrender.com/api/events/initialized${params}`);
            const initializedData = await initializedResponse.json();
            console.log("Gelen event verileri (initialized):", initializedData);

            // Initialized verisini işle
            for (const [eventName, count] of Object.entries(initializedData)) {
                titleEventCountMap[eventName] = (titleEventCountMap[eventName] || 0) + count;
                totalEvents += count;
            }

            // titleEventCountMap’i titlesWithCounts formatına çevir
            const titlesWithCounts = Object.entries(titleEventCountMap).map(([eventName, nbEvents]) => ({
                eventName,
                nbEvents
            }));

            console.log("Toplam Etkinlik Sayısı (Searched + Touched + Initialized):", totalEvents);
            console.log("titlesWithCounts:", titlesWithCounts);

            // Kategorize etme işlemi
            const categoryData = await summarizeTopFoodStoresByCategory(titlesWithCounts, `./assets/${globalSiteId}.json`, totalEvents);
            console.log("food-data", categoryData);

            if (categoryData.length > 0) {
                const topFoodPlace = categoryData.reduce((max, current) =>
                    current.Count > max.Count ? current : max
                );


            }

            renderFoodPlacesTable(categoryData, 'food-places-container', totalEvents);
        })
        .catch(error => {
            console.error("Hata oluştu:", error);
        });

    fetch(`https://backend-etuy.onrender.com/api/events/searched${params}`)
        .then(response => response.json())
        .then(async searchedData => {
            console.log("Gelen event verileri (searched):", searchedData);

            const titleEventCountMap = {};
            let totalEvents = 0;

            // Searched verisini işle
            searchedData.forEach(item => {
                const labelParts = item.label.split('->');
                if (labelParts.length > 1) {
                    const eventName = labelParts[1].trim();
                    const nbEvents = item.nb_events;

                    titleEventCountMap[eventName] = (titleEventCountMap[eventName] || 0) + nbEvents;
                    totalEvents += nbEvents;
                }
            });

            // Touched verisini al
            const touchedResponse = await fetch(`https://backend-etuy.onrender.com/api/events/touched${params}`);
            const touchedData = await touchedResponse.json();
            console.log("Gelen event verileri (touched):", touchedData);

            // Touched verisini işle
            for (const [eventName, count] of Object.entries(touchedData)) {
                titleEventCountMap[eventName] = (titleEventCountMap[eventName] || 0) + count;
                totalEvents += count;
            }

            // Initialized verisini al
            const initializedResponse = await fetch(`https://backend-etuy.onrender.com/api/events/initialized${params}`);
            const initializedData = await initializedResponse.json();
            console.log("Gelen event verileri (initialized):", initializedData);

            // Initialized verisini işle
            for (const [eventName, count] of Object.entries(initializedData)) {
                titleEventCountMap[eventName] = (titleEventCountMap[eventName] || 0) + count;
                totalEvents += count;
            }

            // titleEventCountMap’i titlesWithCounts formatına çevir
            const titlesWithCounts = Object.entries(titleEventCountMap).map(([eventName, nbEvents]) => ({
                eventName,
                nbEvents
            }));

            console.log("Toplam Etkinlik Sayısı (Searched + Touched + Initialized):", totalEvents);
            console.log("titlesWithCounts-service:", titlesWithCounts);

            // Kategorize etme işlemi
            const categoryData = await summarizeTopServicesByCategory(titlesWithCounts, `./assets/${globalSiteId}.json`, totalEvents);
            console.log("cat-data-services", categoryData);

            renderServicesTable(categoryData, 'services-container', totalEvents);
        })
        .catch(error => {
            console.error("Hata oluştu:", error);
        });



    fetch(`https://backend-etuy.onrender.com/api/campaigns${params}`)
        .then(res => res.json())
        .then(data => {
            // Kampanya verisini temizleyelim
            const cleanedData = cleanCampaignData(data);
            console.log('Kiosk Verisi:', cleanedData);

            // Eğer veri boşsa işlemleri iptal et
            if (!cleanedData || cleanedData.length === 0) {
                // LocalStorage temizle
                localStorage.removeItem('mostUsedKioskId');
                localStorage.removeItem('usagePercentage');

                // Kiosk container'ı temizle
                const container = document.getElementById("kiosks-container");
                if (container) container.innerHTML = "";
                console.warn("Kiosk verisi boş, işlem yapılmadı.");
                return;
            }

            // Kiosk verisi içinde "web" veya "mobile-android" varsa tabloyu render etme
            const isExcludedKiosk = cleanedData.some(kiosk => kiosk.kiosk === "web" || kiosk.kiosk === "mobile-android");
            if (isExcludedKiosk) {
                console.warn("Kiosk verisi 'web' veya 'mobile-android' içeriyor, işlem yapılmadı.");
                return;
            }

            // Toplam kullanım sayısını hesapla
            const totalActions = cleanedData.reduce((total, kiosk) => total + kiosk.actions, 0);

            // En çok kullanılan kiosku bul
            const mostUsedKiosk = cleanedData.reduce((max, kiosk) => kiosk.actions > max.actions ? kiosk : max, cleanedData[0]);

            // En çok kullanılan kioskun ID'si ve yüzdesi
            const mostUsedKioskId = mostUsedKiosk.kiosk;
            const usagePercentage = ((mostUsedKiosk.actions / totalActions) * 100).toFixed(2);

            // Veriyi localStorage'a kaydet
            localStorage.setItem('mostUsedKioskId', mostUsedKioskId);
            localStorage.setItem('usagePercentage', usagePercentage);

            console.log(`En çok kullanılan kiosk: ${mostUsedKioskId}, Kullanım Yüzdesi: ${usagePercentage}%`);
            renderKiosksTable(cleanedData, "kiosks-container");
        })
        .catch(error => {
            console.error("Kampanya verisi alınırken hata oluştu:", error);
        });


    let ccpoResult = null;
    let eventResult = null;

    // Katlar
    const allFloors = [-3, -2, -1, 0, 1, 2, 3];

    // Tek seferlik kontrol
function checkAndMerge() {
    console.log("checkAndMerge çağrıldı - ccpoResult:", ccpoResult, "eventResult:", eventResult);
    
    if (ccpoResult !== null && eventResult !== null) {
        const mergedResults = [];
        
        // Tüm katları birleştir (hem ccpoResult hem de eventResult'tan)
        const allFloors = [...new Set([
            ...Object.keys(ccpoResult),
            ...Object.keys(eventResult)
        ])];
        
        console.log("Tespit edilen tüm katlar:", allFloors);
        
        // Toplamları hesapla
        const totalCCPO = Object.values(ccpoResult).reduce((sum, val) => sum + val, 0);
        const totalEvents = Object.values(eventResult).reduce((sum, val) => sum + val, 0);
        
        console.log(`Toplam CCPO (Kiosk Kullanımı): ${totalCCPO}`);
        console.log(`Toplam Events (Birim Aranma): ${totalEvents}`);
        
        // Her kat için yüzdeleri hesapla
        allFloors.forEach(floor => {
            const ccpo = ccpoResult?.[floor] || 0;
            const events = eventResult?.[floor] || 0;
            
            // Eğer toplam değerler 0 ise NaN olmasını önlemek için kontrol ekle
            const kioskUsagePercent = totalCCPO > 0 ? ((ccpo / totalCCPO) * 100).toFixed(2) : '0.00';
            const unitSearchPercent = totalEvents > 0 ? ((events / totalEvents) * 100).toFixed(2) : '0.00';
            
            mergedResults.push({
                floor,
                kioskUsagePercent,
                unitSearchPercent
            });
        });
        
        // Yüzdelerin toplamını kontrol et (debug için)
        const totalKioskPercent = mergedResults.reduce((sum, item) => sum + parseFloat(item.kioskUsagePercent), 0);
        const totalUnitPercent = mergedResults.reduce((sum, item) => sum + parseFloat(item.unitSearchPercent), 0);
        
        console.log(`Toplam Kiosk Kullanım Yüzdesi: ${totalKioskPercent.toFixed(2)}%`);
        console.log(`Toplam Birim Aranma Yüzdesi: ${totalUnitPercent.toFixed(2)}%`);
        
        // 🔥 Tabloyu render et
        renderFloorsTable(mergedResults, 'floors-container');
    } else {
        console.warn("checkAndMerge çağrıldı fakat ccpoResult veya eventResult null!");
    }
}

    // Kampanya verisini al
    fetch(`https://backend-etuy.onrender.com/api/campaigns${params}`)
        .then(res => res.json())
        .then(data => {
            ccpoResult = getTotalActionsByFloor(data,globalSiteId);
            console.log("CCPO bak", ccpoResult);

            // Tüm değerlerin 0 olup olmadığını kontrol et
            const allZeros = Object.values(ccpoResult).every(value => value === 0);

            if (allZeros) {
                console.log("Gelen tüm veri 0. checkAndMerge() çağrılmıyor ve floors-container temizleniyor.");
                const floorsContainer = document.getElementById('floors-container');
                if (floorsContainer) {
                    floorsContainer.innerHTML = '';
                }
            } else {
                checkAndMerge();
            }
        })
        .catch(error => {
            console.error("Kampanya verisi alınırken hata oluştu:", error);
        });

    // Etkinlik verisini al
    fetch(`https://backend-etuy.onrender.com/api/events/searched${params}`)
        .then(response => response.json())
        .then(async data => {
            console.log("Gelen event verileri:", data);

            const titlesWithCounts = data
                .filter(item => item.label.includes('->'))
                .map(item => {
                    const eventName = item.label.split('->')[1].trim();
                    return { eventName, nbEvents: item.nb_events };
                });

            const filepath = `./assets/${globalSiteId}.json`;
            eventResult = await findEventFloor(titlesWithCounts, filepath);
            console.log("Etkinlik ve Kat Bilgileri:", eventResult);

            const maxEventFloor = Object.entries(eventResult).reduce((max, [floor, nbEvents]) => {
                if (nbEvents > max.nbEvents) {
                    return { floor, nbEvents };
                }
                return max;
            }, { floor: null, nbEvents: 0 });

            // En çok işlem yapılan kat ve işlem sayısını localStorage'a kaydet
            if (maxEventFloor.floor !== null) {
                localStorage.setItem("maxEventFloor", maxEventFloor.floor);
                localStorage.setItem("maxEventNbEvents", maxEventFloor.nbEvents);
                console.log("En çok işlem yapılan kat:", maxEventFloor.floor);
                console.log("İşlem sayısı:", maxEventFloor.nbEvents);
            }

            // Eğer birden fazla kat varsa checkAndMerge çağrılır
            const floorCount = Object.keys(eventResult).length;
            if (floorCount > 1) {
                checkAndMerge();
            } else {
                localStorage.removeItem("maxEventFloor");
                localStorage.removeItem("maxEventNbEvents");
                const floorsContainer = document.getElementById('floors-container');
                floorsContainer.innerHTML = '';
                console.log("Yalnızca tek kat bulundu, checkAndMerge çağrılmayacak.");
            }
        })
        .catch(error => {
            console.error("Etkinlik verisi alınırken hata oluştu:", error);
        });



    fetch(`https://backend-etuy.onrender.com/api/events/searched-daily${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Veriler alınırken bir hata oluştu.');
            }
            return response.json();
        })
        .then(data => {
            console.log('Daily Gelen Veri:', data);

            // JSON dosyasını yükleyelim
            const jsonFilePath = `./assets/${globalSiteId}.json`;

            categorizeEventsByDayAndCategory(data, jsonFilePath)
                .then(categorizedData => {
                    console.log('Günlük Kategorize Edilmiş Veriler:', categorizedData);
                    renderStoreCategoriesAreaChart(categorizedData, "area-chart-container");
                    // Burada, kategorize edilmiş verileri kullanarak gerekli işlemleri yapabilirsiniz
                })
                .catch(error => {
                    console.error('Kategorize etme sırasında hata oluştu:', error);
                });
        })
        .catch(error => {
            console.error('Hata:', error);
        });





}



const deviceMap = {
    desktop: 'Masaüstü',
    mobile: 'Mobil',
    tablet: 'Tablet',
    other: 'Diğer'
};

function renderStatistics(data) {
    const totalVisits = document.getElementById('total-visits');
    const bounceRate = document.getElementById('bounce-rate');
    const mostVisitedDevice = document.getElementById('most-visited-device');
    const avgTime = document.getElementById('avg-time');

    totalVisits.innerHTML = `
    <div class="card text-white mb-3" style="background-color: #8ac9c9; mb-3">
        <div class="card-body">
            <h5 class="card-title">Toplam Ziyaret</h5>
            <p class="card-text">${data.totalVisits}</p>
        </div>
    </div>
`;

    mostVisitedDevice.innerHTML = `
    <div class="card text-white mb-3" style="background-color: #e0b8b8; mb-3">
        <div class="card-body">
            <h5 class="card-title">En Çok Kullanılan Cihaz</h5>
            <p class="card-text">${deviceMap[data.mostVisitedDeviceType?.toLowerCase()] || data.mostVisitedDeviceType}</p>
        </div>
    </div>
`;

    avgTime.innerHTML = `
    <div class="card text-white mb-3" style="background-color: #c6b4d7; mb-3">
        <div class="card-body">
            <h5 class="card-title">Sayfada Ortalama Kalma Süresi</h5>
            <p class="card-text">${data.avgTimeOnPage} saniye</p>
        </div>
    </div>
`;

    bounceRate.innerHTML = `
    <div class="card text-white mb-3" style="background-color: #8396d0; mb-3">
        <div class="card-body">
            <h5 class="card-title">Ziyaretçi İlgisi</h5>
            <p class="card-text">
                ${data.bounceRate
            ? (() => {
                const rate = parseFloat(data.bounceRate);
                if (rate < 30) {
                    return 'Mükemmel';
                } else if (rate >= 30 && rate < 50) {
                    return 'İyi';
                } else if (rate >= 50 && rate < 70) {
                    return 'Ortalama';
                } else {
                    return 'Yüksek';
                }
            })()
            : 'Veri mevcut değil'
        }
            </p>
        </div>
    </div>
`;
}

function populateSummaryData() {
    // localStorage'dan verileri al ve sayı olarak parse et
    const fromTo = parseInt(localStorage.getItem("fromTo") || "0");
    const searched = parseInt(localStorage.getItem("searched") || "0");
    const touched = parseInt(localStorage.getItem("touched") || "0");
    const initialized = parseInt(localStorage.getItem("initialized") || "0");
    // Toplam kullanım sayısını hesapla
    const total = fromTo + searched + touched + initialized;
    let date = ""; // Burada let kullanıyoruz çünkü sonrasında değiştireceğiz
    const selectedRange = localStorage.getItem("selectedRange");
    const startDateStr = localStorage.getItem("startDate");
    const endDateStr = localStorage.getItem("endDate");
    const formatDate = (date) => {
        return date.toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getDayName = (date) => {
        return date.toLocaleDateString("tr-TR", { weekday: "long" });
    };

    const now = new Date();

    // selectedRange'e göre tarih formatını belirleyin
    if (selectedRange) {
        const range = parseInt(selectedRange);
        let text = "";

        if (range === 1) {
            // Günlük tarih aralığı
            const dayName = getDayName(now);
            text = `${formatDate(now)} - ${dayName}, Günlük`;
        } else if (range === 7) {
            // Haftalık tarih aralığı
            const past = new Date(now);
            past.setDate(now.getDate() - 6);
            text = `${formatDate(past)} - ${formatDate(now)}, Haftalık`;
        } else if (range === 30) {
            // Aylık tarih aralığı
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const year = now.getFullYear();
            text = `${month}/${year}, Aylık`;
        } else if (range === 365) {
            // Yıllık tarih aralığı
            const year = now.getFullYear();
            text = `${year}, Yıllık`;
        }

        date = text;
    } else if (startDateStr && endDateStr) {
        // Eğer startDateStr ve endDateStr varsa
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        date = `${formatDate(start)} - ${formatDate(end)}`;
    } else {
        date = "Tarih aralığı bulunamadı.";
    }

    // En çok kullanılan tarihi localStorage'dan al


    // HTML elemanlarına erişim
    const summary1Element = document.getElementById("summary-1");
    const summary2Element = document.getElementById("summary-2");
    const summary3Element = document.getElementById("summary-3");
    /* const summary4Element = document.getElementById("summary-4"); */
    const summary5Element = document.getElementById("summary-5");
    /*  const summary6Element = document.getElementById("summary-6"); */
    const summary7Element = document.getElementById("summary-7");
    const summary8Element = document.getElementById("summary-8");
    const summary9Element = document.getElementById("summary-9");
    /* const summary10Element = document.getElementById("summary-10");
     const summary11Element = document.getElementById("summary-11");*/
    const summary12Element = document.getElementById("summary-12");
    const summary13Element = document.getElementById("summary-13");
    const summary14Element = document.getElementById("summary-14");
    const summary15Element = document.getElementById("summary-15");
    /* const summary16Element = document.getElementById("summary-16"); */
    const summary17Element = document.getElementById("summary-17");
    /*  const summary18Element = document.getElementById("summary-18"); */

    if (summary1Element && summary2Element) {
        // localStorage'dan totalVisits değerini al
        const totalVisits = localStorage.getItem('totalVisits');

        // totalVisits verisi var mı kontrol et
        if (totalVisits) {
            // İlk özet cümlesini güncelle
            summary1Element.innerHTML = `
            Fuar süresince (${date})
            <strong>${parseInt(totalVisits).toLocaleString("tr-TR")}</strong> ziyaretçi,
            <strong>${total.toLocaleString("tr-TR")}</strong> etkinlik (harita çağırım, rotalama, arama, tıklama) gerçekleştirmiştir.`;
        } else {
            // Eğer localStorage'da totalVisits verisi yoksa bir hata mesajı göster
            summary1Element.innerHTML = `
            Fuar süresince (${date})
            <strong>Veri bulunamadı.</strong> Ziyaretçi sayısı yüklenemedi.`;
        }

        // İkinci özet cümlesini güncelle
        summary2Element.innerHTML = `Kullanım sayıları <strong>${fromTo.toLocaleString("tr-TR")}</strong> rota çizdirme, <strong>${searched.toLocaleString("tr-TR")}</strong> arama, <strong>${touched.toLocaleString("tr-TR")}</strong> tıklama ve <strong>${initialized.toLocaleString("tr-TR")}</strong> harita çağrım olarak dağılım göstermiştir.`;

        // Üçüncü özet cümlesini temizle
        if (summary3Element) {
            summary3Element.textContent = '';
        }
    }

    /*   const mostUsedCategory = localStorage.getItem("mostUsedCategory");
       summary4Element.textContent = "";
   
       if (mostUsedCategory === "Stand") {
           summary4Element.style.display = "none";
       } else if (mostUsedCategory) {
           summary4Element.style.display = "block"; // Eğer daha önce gizlendiyse yeniden göster
           summary4Element.innerHTML = `Kullanıcılar arasında en çok ilgi gören kategori <strong>${mostUsedCategory}</strong> olmuştur.`;
       }
           */

    summary5Element.textContent = "";

    const topProcessedUnitsData = localStorage.getItem("topProcessedUnits");

    if (topProcessedUnitsData) {
        const parsedData = JSON.parse(topProcessedUnitsData);

        if (Array.isArray(parsedData) && parsedData.length > 0) {
            let htmlContent = "Kullanıcılar tarafından en çok işlem yapılan birimler:<ul style='margin-top: 5px;'>";

            parsedData.forEach((item, index) => {
                htmlContent += `<li><strong>${index + 1}.</strong> ${item.unit} – <strong>${item.count.toLocaleString("tr-TR")}</strong> işlem</li>`;
            });

            htmlContent += "</ul>";
            summary5Element.innerHTML = htmlContent;
        } else {
            summary5Element.textContent = "İşlem verisi bulunamadı.";
        }
    } else {
        summary5Element.textContent = "En çok işlem yapılan birim verisi mevcut değil.";
    }



    const mostEventsData = JSON.parse(localStorage.getItem('mostEventsData'));
    summary3Element.textContent = "";

    // Ensure mostEventsData exists before trying to access its properties
    if (mostEventsData) {
        const mostEventsCount = mostEventsData.totalEvents;
        const mostEventsDate = new Date(mostEventsData.date);

        // Format the date to display in the desired format (e.g., "dd MMMM yyyy")
        const mostEventsFormattedDate = mostEventsDate.toLocaleDateString("tr-TR", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Get the day name (e.g., "Monday", "Tuesday")
        const mostEventsDayName = mostEventsDate.toLocaleDateString("tr-TR", { weekday: 'long' });

        // summary3 cümlesini oluştur
        summary3Element.innerHTML = `En çok işlem yapılan gün <strong>${mostEventsCount.toLocaleString("tr-TR")}</strong> kez ile <strong>${mostEventsFormattedDate}</strong> <strong>${mostEventsDayName}</strong> günü olmuştur.`;
    } else {
        console.error("mostEventsData bulunamadı.");
    }

    // 7. özet: Cihaz türü
    const iosTotal = parseFloat(localStorage.getItem('iosTotal'));
    const androidTotal = parseFloat(localStorage.getItem('androidTotal'));
    const webTotal = parseFloat(localStorage.getItem('webTotal'));

    summary7Element.textContent = "";

    // Cümle olarak işletim sistemleri ve sayılarını bold yaparak göster
    summary7Element.innerHTML = `
    <strong>Android</strong> üzerinden <strong>${androidTotal}</strong>, <strong>iOS</strong> üzerinden <strong>${iosTotal}</strong>, <strong>Web</strong> üzerinden <strong>${webTotal}</strong> ziyaret gerçekleşmiştir.
`;

    // 8. özet: Toplam ziyaret sayısı
    const totalVisits = localStorage.getItem("totalVisits");
    summary8Element.textContent = "";

    if (totalVisits) {
        summary8Element.innerHTML = `Toplam <strong>${parseInt(totalVisits).toLocaleString("tr-TR")}</strong> kez ziyaret gerçekleşmiştir.`;
    }

    const bounceRate = localStorage.getItem("bounceRate");
    summary9Element.textContent = "";

    if (bounceRate) {
        const rate = parseFloat(bounceRate);
        const description = `Ziyaretçilerin <strong>%${100 - rate}</strong> kadarı içeriklerle ilgilenmiş, sitede vakit geçirmiş ve tekrar ziyaret etmiştir.`;

        summary9Element.innerHTML = description;
    }

    // 10. özet: Ortalama sayfada kalma süresi
    /* const avgTimeOnPage = localStorage.getItem("avgTimeOnPage");
     summary10Element.textContent = "";
 
     if (avgTimeOnPage) {
         const seconds = parseInt(avgTimeOnPage);
         const minutes = Math.floor(seconds / 60);
         const remainingSeconds = seconds % 60;
 
         summary10Element.innerHTML = `Kullanıcılar sayfada ortalama <strong>${minutes}</strong> dakika <strong>${remainingSeconds}</strong> saniye kalmıştır.`;
     } */

    /*  // 11. özet: En çok işlem yapılan kat ve işlem sayısı
      const maxEventFloor = localStorage.getItem("maxEventFloor");
      const maxEventNbEvents = localStorage.getItem("maxEventNbEvents");
  
      summary11Element.textContent = "";
  
      if (maxEventFloor && maxEventNbEvents) {
          summary11Element.style.display = "block"; // görünür yap
          summary11Element.innerHTML = `En çok işlem yapılan kat, <strong>${maxEventFloor}</strong> olup toplamda <strong>${maxEventNbEvents}</strong> işlem gerçekleştirilmiştir.`;
      } else {
          summary11Element.style.display = "none"; // gizle
      }
          */

    const mostUsedKioskId = localStorage.getItem('mostUsedKioskId');
    const usagePercentage = localStorage.getItem('usagePercentage');

    summary12Element.textContent = '';

    if (mostUsedKioskId && usagePercentage) {
        summary12Element.style.display = 'block'; // görünür yap
        summary12Element.innerHTML = `<li>En çok kullanılan kiosk <strong>${mostUsedKioskId}</strong> olup, kullanım yüzdesi <strong>${usagePercentage}%</strong> olarak ölçülmüştür.</li>`;
    } else {
        summary12Element.style.display = 'none'; // gizle
    }
    const hourlyVisitAnalysis = JSON.parse(localStorage.getItem("hourlyVisitAnalysis"));
    summary13Element.textContent = "";

    if (hourlyVisitAnalysis && hourlyVisitAnalysis.roundedAverage) {
        const roundedAverage = hourlyVisitAnalysis.roundedAverage;
        summary13Element.innerHTML = `Saatlik ortalama ziyaret sayısı <strong>${roundedAverage}</strong> olarak hesaplanmıştır.`;
    }
    summary14Element.textContent = "";

    if (hourlyVisitAnalysis && hourlyVisitAnalysis.top3AboveAverage && hourlyVisitAnalysis.peakHour !== undefined) {
        const top3AboveAverage = hourlyVisitAnalysis.top3AboveAverage;
        const peakHour = hourlyVisitAnalysis.peakHour;
        const peakValue = hourlyVisitAnalysis.peakValue;

        summary14Element.style.display = 'block'; // görünür yap

        summary14Element.innerHTML = `
       <li> En çok ziyaret edilen saatler:
        <ul>
            ${top3AboveAverage.map(({ hour, visits }) => `<li><strong>${hour}:00</strong> - ${Math.ceil(visits)} ziyaret</li>`).join('')}
        </ul></li>`;
    } else {
        summary14Element.style.display = 'none'; // gizle
    }

    const significantIncreaseDates = JSON.parse(localStorage.getItem('significantIncreaseDates')) || [];

    summary15Element.textContent = "";

    // significantIncreaseDates'i artış yüzdesine göre azalan sırayla sıralayalım
    const sortedIncreaseDates = significantIncreaseDates.sort((a, b) => parseFloat(b.increasePercentage) - parseFloat(a.increasePercentage));

    // İlk 3 öğeyi al
    const top3SignificantIncreases = sortedIncreaseDates.slice(0, 3);

    // summary15 elementini temizle
    summary15Element.textContent = "";

    // Eğer significantIncreaseDates verisi varsa, summary15 elementini güncelle
    if (top3SignificantIncreases.length > 0) {
        summary15Element.style.display = 'block'; // Görünür yap

        summary15Element.innerHTML = `
        <li>Kullanımda sıçrama olan tarihler:
            <ul>
                ${top3SignificantIncreases.map(({ date, increasePercentage }) => `
                    <li>
                        <strong>${date}</strong> tarihinde ortalamaya göre %${increasePercentage} artış
                    </li>`).join('')}
            </ul>
        </li>`;
    } else {
        summary15Element.style.display = 'none'; // Gizle
    }

    const top3CombinedUnits = JSON.parse(localStorage.getItem("top3CombinedUnits"));

    // summary16Element'in içeriğini temizle
    /*   summary16Element.textContent = "";
   
       // top3CombinedUnits'in var olup olmadığını ve bir dizi olup olmadığını kontrol et
       if (top3CombinedUnits && Array.isArray(top3CombinedUnits) && top3CombinedUnits.length > 0) {
           // Dizideki her bir öğeyi alıp 'unit (count kez)' formatına dönüştürerek bir dizi oluştur
           const formattedUnits = top3CombinedUnits.map((item, index) => {
               // unit ve count değerlerinin string olduğundan emin ol, hata durumunda varsayılan değer kullan
               const unitName = String(item.unit || 'Bilinmeyen Birim');
               const count = String(item.count || 0);
   
               return `<strong>${unitName}</strong> (${count} kez)`;
           });
   
           // Oluşturulan formatlı birimleri virgülle ayırarak birleştir ve cümleyi oluştur
           const sentence = `Kullanıcılar arasında en çok ilgi gören ilk 3 birim sırasıyla: ${formattedUnits.join(", ")}.`;
   
           // Oluşturulan cümleyi HTML elementine yazdır
           summary16Element.innerHTML = sentence;
       } else {
           // Veri yoksa veya uygun formatta değilse alternatif mesajı göster
           summary16Element.textContent = "Henüz bir kombinasyon verisi bulunmamaktadır.";
       } */

    summary17Element.textContent = ""; // Önce içeriği temizle

    const topLanguages = JSON.parse(localStorage.getItem('topLanguages'));

    function normalizeLanguageKey(languageKey) {
        const match = languageKey.match(/^(.+?) - (.+?) \((.+?)\)$/);
        if (match) {
            const base = match[1].trim();
            const region = match[2].trim();
            const code = match[3].trim();
            return `${base} (${region}) (${code})`;
        }
        return languageKey;
    }

    // Dil kodları için base -> detaylı eşleme (örnek: en -> en-gb)
    const languageRedirectMap = {
        "en": "English - United Kingdom (en-gb)",
        "de": "German - Germany (de-de)",
        "es": "Spanish - Spain (es-es)",
        "fr": "French - France (fr-fr)",
        "hr": "Croatian - Croatia (hr-hr)",
        "it": "Italian - Italy (it-it)",
        "ms": "Malay - Malaysia (ms-my)",
        "nl": "Dutch - Netherlands (nl-nl)",
        "pt": "Portuguese - Portugal (pt-pt)",
        "qu": "Quechua - Peru (qu-pe)",
        "se": "Sami - Norway (se-no)",
        "sr": "Serbian - Serbia (sr-rs)",
        "sv": "Swedish - Sweden (sv-se)",
        "zh": "Chinese - China (zh-cn)"
    };

    fetch('assets/languageFlags.json')
        .then(response => response.json())
        .then(languageFlags => {
            if (topLanguages && Object.keys(topLanguages).length > 0) {

                // Base dil kodlarını detaylı versiyona aktar
                for (const baseCode in languageRedirectMap) {
                    const baseLabel = Object.keys(topLanguages).find(key => key.endsWith(`(${baseCode})`));
                    const detailedKey = languageRedirectMap[baseCode];

                    if (baseLabel && baseLabel !== detailedKey) {
                        const count = topLanguages[baseLabel] || 0;
                        if (count > 0) {
                            topLanguages[detailedKey] = (topLanguages[detailedKey] || 0) + count;
                            delete topLanguages[baseLabel];
                        }
                    }
                }

                const top5Languages = Object.entries(topLanguages)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([language, count]) => {
                        const normalizedKey = normalizeLanguageKey(language);
                        const flagClass = languageFlags[normalizedKey] || "flag-icon";

                        // Dil adını sadece isim ve ülke ile göster (kod kısmını çıkar)
                        const displayName = language.replace(/\s*\(([^)]+)\)\s*$/, "").trim();

                        return `<li><span class="flag-icon ${flagClass}"></span> <strong>${displayName}</strong> (${count} kez)</li>`;
                    })
                    .join("");

                summary17Element.innerHTML = `
                <p>Kullanıcıların ülkelere göre dağılımı :</p>
                <ul>${top5Languages}</ul>
            `;
            } else {
                summary17Element.textContent = "Henüz bir dil verisi bulunmamaktadır.";
            }
        })
        .catch(error => {
            console.error("languageFlags.json yüklenirken hata oluştu:", error);
            summary17Element.textContent = "Veri yüklenemedi.";
        });

    /*    const highlightedEntries = JSON.parse(localStorage.getItem("highlightedEntries"));
        summary18Element.textContent = ""; // Önce içeriği temizle
    
        if (highlightedEntries && Array.isArray(highlightedEntries) && highlightedEntries.length > 0) {
            // 🔢 Count'a göre azalan sırala ve ilk 5 elemanı al
            const top5 = highlightedEntries
                .sort((a, b) => b.Count - a.Count)
                .slice(0, 5);
    
            // 🔹 Liste HTML'si oluştur
            const listItems = top5
                .map(item => `<li><strong>${item.Title}</strong> (${item.Count} kez)</li>`)
                .join("");
    
            summary18Element.innerHTML = `
            <p>Premium birimlerin işlem sayısı(ilk 5):</p>
            <ul>${listItems}</ul>
        `;
        } else {
            summary18Element.textContent = "Henüz Stand, Premium kategorisinde öne çıkan başlık bulunmamaktadır.";
        }
            */
}

function normalizeLanguageKey(languageKey) {
    const match = languageKey.match(/^(.+?) - (.+?) \((.+?)\)$/);
    if (match) {
        const base = match[1].trim();
        const region = match[2].trim();
        const code = match[3].trim();
        return `${base} (${region}) (${code})`;
    }
    return languageKey; // Eşleşmezse orijinalini döndür
}




window.addEventListener("DOMContentLoaded", function () {
    populateSummaryData();
});
