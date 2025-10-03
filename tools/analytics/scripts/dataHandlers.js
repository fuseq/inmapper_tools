// Ziyaretçi verisini çeker ve bar chart oluşturur

const generatePastelColorScale = (count) => {
    const baseHueStart = 180;   // Başlangıç tonu (cyan-mavi)
    const baseHueEnd = 360;     // Bitiş tonu (kırmızı-mor)
    const saturation = 40;      // Daha yüksek doygunluk (Daha belirgin pastel)
    const lightnessStart = 60;  // Başlangıçta daha koyu renkler
    const lightnessEnd = 80;    // Bitiş noktasında daha açık ancak kontrastlı renkler

    return Array.from({ length: count }, (_, i) => {
        const hue = baseHueStart + (baseHueEnd - baseHueStart) * (i / (count - 1)); // Tonu farklı yapıyoruz
        const lightness = lightnessStart + ((lightnessEnd - lightnessStart) * (i / (count - 1))); // Açıklığı çeşitlendiriyoruz
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });
};

export const renderFromToEvents = (data, containerId) => {
    const startPoints = {};
    const endPoints = {};

    // Veriyi başlangıç ve bitiş noktalarına göre organize et
    data.forEach(item => {
        const [start, end] = item.label.split('->');
        startPoints[start.trim()] = (startPoints[start.trim()] || 0) + item.nb_events;
        endPoints[end.trim()] = (endPoints[end.trim()] || 0) + item.nb_events;
    });

    // En çok kullanılan 5 başlangıç ve bitiş noktalarını al
    const topStartPoints = Object.entries(startPoints).sort((a, b) => b[1] - a[1]);
    const topEndPoints = Object.entries(endPoints).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // X ekseni için bitiş noktalarına dayalı etiketler oluştur
    const startLabels = topStartPoints.map(([start]) => start);
    const endLabels = topEndPoints.map(([end]) => end);

    // Pastel renkleri generatePastelColorScale ile al
    const backgroundColors = generatePastelColorScale(topStartPoints.length);

    // Başlangıç noktalarına göre ve ilgili bitiş noktalarıyla datasetler oluştur
    const datasets = topStartPoints.map(([start, startCount], i) => {
        return {
            label: start,
            data: topEndPoints.map(([end]) => {
                // Bu başlangıç noktası için ilgili bitiş noktasının sayısını hesapla
                return data.filter(item => {
                    const [itemStart, itemEnd] = item.label.split('->');
                    return itemStart.trim() === start && itemEnd.trim() === end;
                }).reduce((sum, item) => sum + item.nb_events, 0);
            }),
            backgroundColor: backgroundColors[i],  // Pastel rengini burada kullanıyoruz
            stack: 'fromTo',
        };
    });

    // Grafiği oluştur
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Mevcut grafiği temizle

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: endLabels, // X ekseninde bitiş noktaları
            datasets: datasets,
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'En Çok Gidilen Yerler ve Nerelerden Gidildiği',
                },
                legend: {
                    display: false, // Legend'ı kaldırıyoruz
                },
                datalabels: {
                    color: 'white',
                    anchor: 'center',
                    align: 'center',
                    formatter: (value, context) => {
                        if (value > 0) {
                            let label = context.dataset.label;
                            if (label.length > 15) {
                                return label.slice(0, 18) + '...'; // Örneğin 12 karaktere kadar göster
                            }
                            return label;
                        }
                        return '';
                    },
                    font: {
                        weight: 'bold',
                        size: 12,
                    },
                },
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Bitiş Noktaları',
                    },
                    ticks: {
                        display: true,
                        callback: function (value, index, ticks) {
                            const label = this.getLabelForValue(value);
                            return label.length > 15 ? label.slice(0, 20) + '...' : label;
                        },
                        maxRotation: 30,  // Etiketleri hafif döndürmek için
                        minRotation: 0
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Toplam Seçim Sayısı',
                    },
                    beginAtZero: true,
                },
            },
        },
        plugins: [ChartDataLabels], // Verileri etiketle göster
    });
};


export const renderFromToEventsByStart = (data, containerId) => {
    const startPoints = {};
    const endPoints = {};

    // Veriyi başlangıç ve bitiş noktalarına göre organize et
    data.forEach(item => {
        const [start, end] = item.label.split('->');
        startPoints[start.trim()] = (startPoints[start.trim()] || 0) + item.nb_events;
        endPoints[end.trim()] = (endPoints[end.trim()] || 0) + item.nb_events;
    });

    const hydrogenAndCoData = data.filter(item => {
        const [start] = item.label.split('->');
        return start.trim() === 'HYDROGEN AND CO';
    });
    console.log('HYDROGEN AND CO ile ilişkili veriler:', hydrogenAndCoData);
    const h2StageCount = endPoints['H2 Sahnesi / H2 Stage'];
    console.log('H2 Sahnesi / H2 Stage toplam sayısı:', h2StageCount);

    // En çok kullanılan 5 başlangıç ve bitiş noktalarını al
    const topStartPoints = Object.entries(startPoints).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topEndPoints = Object.entries(endPoints)
        .sort((a, b) => b[1] - a[1]);
    console.log('Top 5 hedef noktalar (endPoints):', topEndPoints.map(e => e[0]));
    // X ekseni için başlangıç noktalarına dayalı etiketler oluştur
    const startLabels = topStartPoints.map(([start]) => start);
    const endLabels = topEndPoints.map(([end]) => end);

    // Pastel renkleri generatePastelColorScale ile al
    const backgroundColors = generatePastelColorScale(topEndPoints.length);

    // Bitiş noktalarına göre ve ilgili başlangıç noktalarıyla datasetler oluştur
    const datasets = topEndPoints.map(([end, endCount], i) => {
        return {
            label: end,
            data: topStartPoints.map(([start]) => {
                // Bu bitiş noktası için ilgili başlangıç noktasının sayısını hesapla
                return data.filter(item => {
                    const [itemStart, itemEnd] = item.label.split('->');
                    return itemEnd.trim() === end && itemStart.trim() === start;
                }).reduce((sum, item) => sum + item.nb_events, 0);
            }),
            backgroundColor: backgroundColors[i],  // Pastel rengini burada kullanıyoruz
            stack: 'fromTo',
        };
    });

    // Grafiği oluştur
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Mevcut grafiği temizle

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: startLabels, // X ekseninde başlangıç noktaları
            datasets: datasets,
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Başlangıç Noktalarına Göre Hedef Dağılımı',
                },
                legend: {
                    display: false, // Legend'ı kaldırıyoruz
                },
                datalabels: {
                    color: 'white',
                    anchor: 'center',
                    align: 'center',
                    formatter: (value, context) => {
                        if (value > 0) {
                            let label = context.dataset.label;
                            if (label.length > 15) {
                                return label.slice(0, 12) + '...'; // Örneğin 12 karaktere kadar göster
                            }
                            return label;
                        }
                        return '';
                    },
                    font: {
                        weight: 'bold',
                        size: 12,
                    },
                },
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Başlangıç Noktaları',
                    },
                    ticks: {
                        display: true,
                        callback: function (value, index, ticks) {
                            const label = this.getLabelForValue(value);
                            return label.length > 15 ? label.slice(0, 20) + '...' : label;
                        },
                        maxRotation: 30,  // Etiketleri hafif döndürmek için
                        minRotation: 0
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Toplam Seçim Sayısı',
                    },
                    beginAtZero: true,
                },
            },
        },
        plugins: [ChartDataLabels], // Verileri etiketle göster
    });
};




export const renderSearchedEvents = (data, containerId) => {
    const placeMap = {};

    data.forEach(item => {
        let [searchTerm, selectedPlace] = item.label.split('->').map(str => str.trim());

        // Eğer searchTerm boşsa, "Doğrudan Seçim" olarak etiketle
        if (!searchTerm) {
            searchTerm = "Doğrudan Seçim";
        }

        if (!placeMap[selectedPlace]) {
            placeMap[selectedPlace] = {};
        }

        placeMap[selectedPlace][searchTerm] =
            (placeMap[selectedPlace][searchTerm] || 0) + item.nb_events;
    });

    // 🔽 Calculate total events per place and get top 10
    const placeTotals = Object.entries(placeMap).map(([place, terms]) => {
        const total = Object.values(terms).reduce((sum, count) => sum + count, 0);
        return { place, total };
    });

    const topPlaces = placeTotals
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map(entry => entry.place);

    const labels = topPlaces;

    // 🔽 Get unique search terms from only top 10 places
    const allSearchTermsSet = new Set();
    labels.forEach(place => {
        const terms = placeMap[place];
        if (terms) {
            Object.keys(terms).forEach(term => allSearchTermsSet.add(term));
        }
    });

    const allSearchTerms = Array.from(allSearchTermsSet);

    // 🔽 Generate pastel colors for each search term
    const pastelColors = generatePastelColorScale(allSearchTerms.length);

    const datasets = allSearchTerms.map((term, index) => ({
        label: term,
        data: labels.map(place => placeMap[place][term] || 0),
        backgroundColor: pastelColors[index],
        stack: 'search'
    }));

    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'En Çok Seçilen Yerler ve Arama Kaynakları (İlk 5)'
                },
                legend: {
                    display: false // Set display to false to hide the legend
                },
                datalabels: {
                    color: 'white',
                    anchor: 'center',
                    align: 'center',
                    formatter: (value, context) => {
                        if (value > 0) {
                            let label = context.dataset.label;
                            if (label.length > 15) {
                                return label.slice(0, 12) + '...';
                            }
                            return label;
                        }
                        return '';
                    },
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Seçilen Yer'
                    },
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0,
                        callback: function (value, index, values) {
                            let label = this.getLabelForValue(value);
                            return label.length > 20 ? label.slice(0, 20) + '...' : label;
                        }
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Toplam Seçim Sayısı'
                    },
                    beginAtZero: true
                }
            }
        },
        plugins: [ChartDataLabels]
    });
};


export const renderTop5SearchedTerms = (data, containerId) => {
    const searchTermMap = {};

    data.forEach(item => {
        const [searchTerm] = item.label.split('->').map(str => str.trim());

        // 🔍 Sadece gerçekten bir şey yazılmışsa (arama terimi varsa) dahil et
        if (!searchTerm) return;

        searchTermMap[searchTerm] =
            (searchTermMap[searchTerm] || 0) + item.nb_events;
    });

    // Arama terimlerini toplam seçim sayısına göre azalan sırayla sıralıyoruz
    const sortedSearchTerms = Object.entries(searchTermMap)
        .sort((a, b) => b[1] - a[1]) // Azalan sıralama
        .slice(0, 5); // En çok yapılan 5 aramayı alıyoruz

    const labels = sortedSearchTerms.map(([term]) => term);
    const dataValues = sortedSearchTerms.map(([, count]) => count);

    // Pastel renkler için fonksiyonu kullanıyoruz
    const pastelColors = generatePastelColorScale(labels.length);

    const datasets = [{
        label: 'En Çok Yapılan Aramalar',
        data: dataValues,
        backgroundColor: pastelColors,
    }];

    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'En Çok Yapılan 5 Arama'
                },
                legend: {
                    display: false
                },
                datalabels: {
                    display: true,
                    color: '#fff',
                    font: {
                        weight: 'normal',
                        size: 14
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function (tooltipItems) {
                            const index = tooltipItems[0].dataIndex;
                            return tooltipItems[0].chart.data.labels[index]; // Tam etiketi göster
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Arama Terimi'
                    },
                    ticks: {
                        callback: function (value, index, ticks) {
                            const label = this.getLabelForValue(value);
                            return label.length > 15 ? label.slice(0, 12) + '...' : label;
                        },
                        maxRotation: 30,
                        minRotation: 0
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Toplam Seçim Sayısı'
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        },
        plugins: [ChartDataLabels]
    });
};

export const renderTouchedEvents = (data, containerId) => {
    const table = document.createElement('table');
    table.border = 1;
    table.style.marginTop = '10px';
    table.style.borderCollapse = 'collapse';
    table.innerHTML = "<tr><th>Harita Üzerinden En Çok Seçilen</th><th>Seçim Sayısı</th></tr>";

    data.forEach(item => {
        table.innerHTML += `
            <tr>
                <td style="padding:5px">${item.label}</td>
                <td style="padding:5px">${item.nb_events}</td>
            </tr>
        `;
    });

    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.appendChild(table);
};

export const renderDailyEvents = (data, containerId) => {
    console.log("Gelen Veriler:", data); // Veriyi konsola yazdır

    // Günlük etkinliklerin düzenlenmesi
    const dailyData = {};

    data.forEach(item => {
        const date = item.date; // Tarih bilgisini al
        dailyData[date] = (dailyData[date] || 0) + item.totalEvents; // totalEvents kullanın
    });

    // Tarihler ve etkinlik sayıları için etiketler
    const labels = Object.keys(dailyData);
    const eventCounts = Object.values(dailyData);

    console.log("Düzenlenmiş Etkinlik Verisi:", dailyData); // Düzenlenmiş veriyi konsola yazdır

    // Grafik için canvas elementini oluştur
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container '${containerId}' bulunamadı.`);
        return; // Fonksiyonu burada sonlandır
    }

    container.innerHTML = ''; // Container'ı temizle

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    // Chart.js kullanarak line chart oluştur
    new Chart(canvas, {
        type: 'line', // Bar yerine line tipi seçtik
        data: {
            labels, // Tarih etiketleri
            datasets: [{
                label: 'Etkinlik Sayısı',
                data: eventCounts, // Etkinlik sayıları
                fill: false, // Dolgu yapılmasın
                borderColor: 'rgba(75, 192, 192, 1)', // Çizgi rengi
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Yarı şeffaf alan
                borderWidth: 2,
                tension: 0.1 // Yumuşak geçişler için
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Etkinlik Sayıları',
                },
                legend: {
                    display: true, // Legend'ı gösterebiliriz
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tarihler'
                    },
                    ticks: {
                        autoSkip: true, // Eğer tarihler çok sıkışıyorsa, otomatik olarak kaydır
                        maxTicksLimit: 7 // Max 7 etiket gösterebiliriz
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Etkinlik Sayısı'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}
export const renderHourlyEvents = (hourlyVisits, containerId) => {
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: hours,
            datasets: [{
                label: 'Ziyaret Sayısı',
                data: hourlyVisits,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Saatlik Ziyaret Dağılımı'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Saatler'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Ziyaret Sayısı'
                    }
                }
            }
        }
    });
};


export const renderOperatingSystemDistribution = (data, containerId) => {
    const labels = data.map(item => item.osFamily);
    const values = data.map(item => item.visits);

    const backgroundColors = generatePastelColorScale(labels.length);

    const total = values.reduce((a, b) => a + b, 0);

    // iOS, Android ve Web dışındaki toplam değer
    let iosTotal = 0;
    let androidTotal = 0;
    let webTotal = 0;

    labels.forEach((label, i) => {
        const value = values[i];
        if (label.toLowerCase().includes('ios')) {
            iosTotal += value;
        } else if (label.toLowerCase().includes('android')) {
            androidTotal += value;
        } else if (label.toLowerCase().includes('web')) {
            webTotal += value;
        } else {
            webTotal += value; // Web'e diğerlerini dahil et
        }
    });

    // Verileri localStorage'a kaydet
    localStorage.setItem('iosTotal', iosTotal);
    localStorage.setItem('androidTotal', androidTotal);
    localStorage.setItem('webTotal', webTotal);

    // Konsolda yazdırma
    console.log(`iOS: ${iosTotal}`);
    console.log(`Android: ${androidTotal}`);
    console.log(`Web: ${webTotal}`); // Web'e diğerlerini dahil ediyoruz

    const datasets = [{
        label: 'İşletim Sistemi Dağılımı',
        data: values,
        backgroundColor: backgroundColors,
    }];

    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'İşletim Sistemi Dağılımı'
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        generateLabels: function (chart) {
                            const data = chart.data;
                            const dataset = data.datasets[0];

                            return data.labels.map((label, i) => {
                                const value = dataset.data[i];
                                const percentage = ((value / total) * 100).toFixed(1);

                                // Yüzde %0.1'in altında olanları gizle
                                if (percentage < 0.1) {
                                    return null; // Bu durumda, ilgili öğeyi gizle
                                }

                                return {
                                    text: `${label} (%${percentage})`,
                                    fillStyle: dataset.backgroundColor[i],
                                    strokeStyle: dataset.backgroundColor[i],
                                    lineWidth: 1,
                                    hidden: isNaN(dataset.data[i]) || chart.getDatasetMeta(0).data[i].hidden,
                                    index: i
                                };
                            }).filter(label => label !== null); // null olanları filtrele
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    formatter: (value, context) => {
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);

                        // Yüzde %0.1'in altında olanları gizle
                        if (percentage < 0.1) {
                            return ''; // Boş döndür, bu durumda etiketi gizler
                        }
                        return `${percentage}%`;
                    },
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
};

let others = [];

export const renderLanguageDistribution = (data, containerId) => {
    const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);

    const top5 = sortedEntries.slice(0, 5);
    const others = sortedEntries.slice(5); // Local değişken

    const labels = top5.map(([language]) => language.split(' (')[0]);
    const values = top5.map(([, value]) => value);

    if (others.length > 0) {
        const otherTotal = others.reduce((sum, [, value]) => sum + value, 0);
        labels.push('Diğer');
        values.push(otherTotal);
    }

    const backgroundColors = generatePastelColorScale(labels.length);
    const total = values.reduce((a, b) => a + b, 0);

    const datasets = [{
        label: 'Dil Dağılımı',
        data: values,
        backgroundColor: backgroundColors,
    }];

    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Dil Dağılımı (Top 5 + Diğer)'
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        generateLabels: function (chart) {
                            const data = chart.data;
                            const dataset = data.datasets[0];

                            return data.labels.map((label, i) => {
                                const value = dataset.data[i];
                                const percentage = ((value / total) * 100).toFixed(1);

                                return {
                                    text: `${label} (%${percentage})`,
                                    fillStyle: dataset.backgroundColor[i],
                                    strokeStyle: dataset.backgroundColor[i],
                                    lineWidth: 1,
                                    hidden: isNaN(value) || chart.getDatasetMeta(0).data[i].hidden,
                                    index: i
                                };
                            });
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const label = tooltipItem.label;
                            const value = tooltipItem.raw;

                            if (label === 'Diğer') {
                                const otherLabels = others.map(([lang]) => lang.split(' (')[0]);
                                return [`${label}: ${value}`, ...otherLabels.map(l => `• ${l}`)];
                            }

                            return `${label}: ${value}`;
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    formatter: (value, context) => {
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${percentage}%`;
                    },
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
};

export async function categorizeTitlesWithJson(titles, jsonFilePath) {
    try {
        console.log(`📁 JSON dosyası yükleniyor: ${jsonFilePath}`);
        const response = await fetch(jsonFilePath);
        if (!response.ok) {
            throw new Error(`Dosya yüklenemedi: ${response.status}`);
        }

        const excelData = await response.json();
        console.log("✅ JSON verisi başarıyla alındı:", excelData);

        const result = {};

        // Başlıkların ID'lerini ve Cat_TR kategorilerini eşleştirelim
        titles.forEach(title => {
            const matched = excelData.find(item => item.Title === title); // Başlıkları JSON'da arıyoruz
            if (matched) {
                const category = matched.Cat_TR; // Kategoriyi alıyoruz

                if (category) {
                    if (!result[category]) {
                        result[category] = []; // Eğer kategori yoksa, yeni bir kategori oluşturuyoruz
                    }

                    result[category].push({ id: matched.ID, title: matched.Title }); // Kategorize edilen başlıkları ekliyoruz
                    console.log(`✅ "${matched.Title}" (${matched.ID}) kategorize edildi: ${category}`);
                } else {
                    console.warn(`⚠️ "${matched.Title}" başlığının kategorisi bulunamadı!`);
                }
            } else {
                console.warn(`⚠️ "${title}" başlığı JSON içinde bulunamadı!`);
            }
        });

        console.log("🗂️ Kategorize edilmiş veriler:", result);

        // Kategorilerin sayısını hesapla
        const categoryData = Object.entries(result).map(([category, items]) => ({
            label: category,
            nb_events: items.length
        }));

        console.log("📊 Kategoriler ve Etkinlik Sayıları:", categoryData);

        return categoryData; // Kategorileri döndürüyoruz
    } catch (error) {
        console.error("💥 Hata:", error);
        return [];
    }
}

export async function summarizeTitlesWithDetails(titleCountMap, jsonFilePath, totalEvents) {
    try {
        console.log(`📁 JSON dosyası yükleniyor: ${jsonFilePath}`);
        const response = await fetch(jsonFilePath);
        if (!response.ok) {
            throw new Error(`Dosya yüklenemedi: ${response.status}`);
        }

        const jsonData = await response.json();
        console.log("✅ JSON verisi başarıyla alındı:", jsonData);

        const result = [];
        const highlighted = []; // 🔸 Stand,Premium olanlar burada toplanacak

        Object.entries(titleCountMap).forEach(([title, count]) => {
            const matched = jsonData.find(item => item.Title === title);

            if (matched) {
                const category = matched.Cat_TR || "Kategori Yok";
                const description = matched.Description || "Açıklama Yok";

                const entry = {
                    Title: matched.Title,
                    Count: count,
                    Cat_TR: category,
                    Description: description
                };

                result.push(entry);

                console.log(`✅ "${matched.Title}" (${count} kez) → Kategori: ${category}, Açıklama: ${description}`);

                const highlightedCategories = ["Stand,Premium", "Premium Stant"];

                if (highlightedCategories.includes(category)) {
                    console.log(`⭐️ ${matched.Title} → Öne Çıkan Kategori: ${category}`);
                    highlighted.push(entry);
                }
            } else {
                console.warn(`⚠️ "${title}" başlığı JSON içinde bulunamadı!`);
            }
        });

        // 💾 Stand,Premium olanları localStorage'a kaydet
        localStorage.setItem("highlightedEntries", JSON.stringify(highlighted));
        console.log("💾 Stand,Premium olanlar localStorage'a kaydedildi:", highlighted);

        console.log("📊 Özetlenen Başlıklar:", result);
        return result;
    } catch (error) {
        console.error("💥 Hata:", error);
        return [];
    }
}

export async function summarizeTopStoresByCategory(titleEventsMap, jsonFilePath) {
    try {
        console.log(`📁 JSON dosyası yükleniyor: ${jsonFilePath}`);
        const response = await fetch(jsonFilePath);
        if (!response.ok) {
            throw new Error(`Dosya yüklenemedi: ${response.status}`);
        }

        const jsonData = await response.json();
        console.log("✅ JSON verisi başarıyla alındı:", jsonData);

        const categoriesToInclude = [
            "Mağaza", "Giyim", "Ayakkabı & Çanta", "Aksesuar & Mücevher", "Elektronik", "Çocuk",
            "Kozmetik & Sağlık", "Ev & Dekorasyon", "Lokum & Şekerleme", "Spor",
            "Market", "Kültür & Eğlence", "Stand", "Stant", "Stand,Premium", "Premium Stant", "Sahne"
        ];

        const filteredResults = [];

        Object.entries(titleEventsMap).forEach(([title, count]) => {
            const matched = jsonData.find(item => item.Title === title && categoriesToInclude.includes(item.Cat_TR));
            if (matched) {
                filteredResults.push({
                    Title: matched.Title,
                    Count: count,
                    Cat_TR: matched.Cat_TR,
                    Description: matched.Description || "Açıklama Yok"
                });


            } else {

            }
        });

        const topResults = filteredResults
            .sort((a, b) => b.Count - a.Count)
            .slice(0, 10);

        return topResults;
    } catch (error) {
        console.error("💥 Hata:", error);
        return [];
    }
}

export async function categorizeEventsByDayAndCategory(dailyData, jsonFilePath) {
    try {
        console.log(`📁 JSON dosyası yükleniyor: ${jsonFilePath}`);

        // JSON dosyasını yükleme
        const response = await fetch(jsonFilePath);
        if (!response.ok) {
            throw new Error(`Dosya yüklenemedi: ${response.status}`);
        }

        // JSON verisini alma
        const jsonData = await response.json();
        console.log("✅ JSON verisi başarıyla alındı:", jsonData);

        // Kategorilere dahil etmek istediğimiz kategoriler
        const categoriesToInclude = [
            "Mağaza", "Giyim", "Ayakkabı & Çanta", "Aksesuar & Mücevher", "Elektronik", "Çocuk",
            "Kozmetik & Sağlık", "Ev & Dekorasyon", "Lokum & Şekerleme", "Spor",
            "Market", "Kültür & Eğlence", "Hizmet", "Otopark", "Stand", "Stant", "Stand,Premium", "Premium Stant", "Sahne", "Wc", "Yiyecek", "Atm"
        ];

        // Günlük verileri tutacak nesne
        const categorizedData = {};

        // Her gün için işlem yapalım
        Object.entries(dailyData).forEach(([date, events]) => {
            const dailyCategories = {};

            // Gelen her etkinliği kontrol et
            events.forEach(event => {
                const title = event.label;
                const count = event.total_nb_events;

                // JSON dosyasındaki kategoriye uygun item'leri bulma
                const matched = jsonData.find(item => item.Title === title && categoriesToInclude.includes(item.Cat_TR));

                if (matched) {
                    // Kategorilere göre verileri gruplayalım
                    const category = matched.Cat_TR;

                    if (!dailyCategories[category]) {
                        dailyCategories[category] = 0;
                    }
                    dailyCategories[category] += count;
                }
            });

            // Gün için kategorize edilmiş veriyi kaydedelim
            categorizedData[date] = dailyCategories;
        });

        console.log("📊 Günlük kategorize edilmiş etkinlik verileri:", categorizedData);
        return categorizedData;
    } catch (error) {
        console.error("💥 Hata:", error);
        return {};
    }
}

export async function summarizeTopFoodStoresByCategory(titlesWithCounts, jsonFilePath) {
    try {
        console.log(`📁 JSON dosyası yükleniyor: ${jsonFilePath}`);
        const response = await fetch(jsonFilePath);
        if (!response.ok) {
            throw new Error(`Dosya yüklenemedi: ${response.status}`);
        }

        const jsonData = await response.json();
        console.log("✅ JSON verisi başarıyla alındı:", jsonData);

        // Başlık sayacı: titlesWithCounts içindeki aynı başlıkları toplamak için
        const combinedTitles = titlesWithCounts.reduce((accumulator, currentItem) => {
            // Eğer title zaten accumulator içinde varsa, nbEvents'ini arttır
            if (accumulator[currentItem.eventName]) {
                accumulator[currentItem.eventName] += currentItem.nbEvents;
            } else {
                accumulator[currentItem.eventName] = currentItem.nbEvents;
            }
            return accumulator;
        }, {});

        // Toplanan etkinliklerin toplam sayısını görmek için
        console.log("Toplanan etkinlikler:", combinedTitles);

        // JSON'dan filtrelenen sonuçları bul
        const categoriesToInclude = [
            "Restoran & Cafe",
            "Fast Food",
            "Yiyecek"
        ];

        const filteredResults = [];

        Object.entries(combinedTitles).forEach(([eventName, totalEvents]) => {
            const matched = jsonData.find(item => item.Title === eventName && categoriesToInclude.includes(item.Cat_TR));

            if (matched) {
                filteredResults.push({
                    Title: matched.Title,
                    Count: totalEvents,
                    Cat_TR: matched.Cat_TR,
                    Description: matched.Description || "Açıklama Yok"
                });


            } else {

            }
        });

        // Kategorilere göre en yüksek 10 birimi al
        const topResults = filteredResults
            .sort((a, b) => b.Count - a.Count)  // Sayıya göre azalan sırala
            .slice(0, 10);  // İlk 10 elemanı al

        console.log("📊 En Yüksek 10 Başlık:", topResults);
        return topResults;

    } catch (error) {
        console.error("💥 Hata:", error);
        return [];
    }
}

export async function summarizeTopServicesByCategory(titlesWithCounts, jsonFilePath) {
    try {
        console.log(`📁 JSON dosyası yükleniyor: ${jsonFilePath}`);
        const response = await fetch(jsonFilePath);
        if (!response.ok) {
            throw new Error(`Dosya yüklenemedi: ${response.status}`);
        }

        const jsonData = await response.json();
        console.log("✅ JSON verisi başarıyla alındı:", jsonData);

        const combinedTitles = titlesWithCounts.reduce((accumulator, currentItem) => {
            if (accumulator[currentItem.eventName]) {
                accumulator[currentItem.eventName] += currentItem.nbEvents;
            } else {
                accumulator[currentItem.eventName] = currentItem.nbEvents;
            }
            return accumulator;
        }, {});

        console.log("servis Toplanan etkinlikler:", combinedTitles);

        const categoriesToInclude = [
            "Hizmetler",
            "Hizmet Mağazaları",
            "Hizmet",
            "Otopark",
            "Wc",
            "WC",
            "Giriş",
            "Atm",
            "Diğer"
        ];

        const filteredResults = [];

        Object.entries(combinedTitles).forEach(([eventName, totalEvents]) => {
            const matched = jsonData.find(item => item.Title === eventName && categoriesToInclude.includes(item.Cat_TR));

            if (matched) {
                filteredResults.push({
                    Title: matched.Title,
                    Count: totalEvents,
                    Cat_TR: matched.Cat_TR,
                    Description: matched.Description || "Açıklama Yok"
                });
            }
        });

        let topResults = filteredResults
            .sort((a, b) => b.Count - a.Count)
            .slice(0, 10);

        // Özel durum: "Car Park (Hall 7-8)" -> "Otopark (Hall 7-8)"
        const carParkIndex = topResults.findIndex(item => item.Title === "Car Park (Hall 7-8)");
        const otoparkIndex = topResults.findIndex(item => item.Title === "Otopark (Hall 7-8)");

        if (carParkIndex !== -1) {
            const carParkItem = topResults[carParkIndex];

            if (otoparkIndex !== -1) {
                topResults[otoparkIndex].Count += carParkItem.Count;
            } else {
                topResults.push({
                    ...carParkItem,
                    Title: "Otopark (Hall 7-8)",
                    Cat_TR: "Otopark"
                });
            }

            topResults.splice(carParkIndex, 1);
        }

        const hall11Index = topResults.findIndex(item => item.Title === "Entrance (Hall 11A)");
        const hall11turkishIndex = topResults.findIndex(item => item.Title === "Giriş (Hall 11A)");

        if (hall11Index !== -1) {
            const hall11Item = topResults[hall11Index];

            if (hall11turkishIndex !== -1) {
                topResults[hall11turkishIndex].Count += hall11Item.Count;
            } else {
                topResults.push({
                    ...hall11Item,
                    Title: "Giriş (Hall 11A)",
                    Cat_TR: "Giriş"
                });
            }

            topResults.splice(carParkIndex, 1);
        }

        // İsim düzeltmeleri: İngilizce kısımları çıkar
        topResults = topResults.map(item => {
            if (item.Title === "Mescid - Masjid") {
                return { ...item, Title: "Mescid" };
            }
            if (item.Title === "Kaynak Uygulama Özel Alanı - Welding Application Special Area") {
                return { ...item, Title: "Kaynak Uygulama Özel Alanı" };
            }
            if (item.Title === "Medya Köşesi - Media Corner") {
                return { ...item, Title: "Medya Köşesi" };
            }
            if (item.Title === "Hidrojen ve Yakıt Hücreleri Özel Alanı - Hydrogen and Fuel Cells Special Area") {
                return { ...item, Title: "Hidrojen ve Yakıt Hücreleri Özel Alanı" };
            }
            if (item.Title === "Entrance (Hall 11)") {
                return { ...item, Title: "Giriş  (Hall 11)" };
            }
            if (item.Title === "Car Park Batı") {
                return { ...item, Title: "Otopark Batı" };
            }
            if (item.Title === "Entrance (Atrium)") {
                return { ...item, Title: "Giriş (Atrium)" };
            }
            if (item.Title === "Entrance (Hall 11A)") {
                return { ...item, Title: "Giriş (Hall 11A)" };
            }
            return item;
        });

        // Tekrar sıralama
        topResults = topResults
            .sort((a, b) => b.Count - a.Count)
            .slice(0, 10);

        console.log("📊 En Yüksek 10 servis (düzenlenmiş):", topResults);
        return topResults;

    } catch (error) {
        console.error("💥 Hata:", error);
        return [];
    }
}
export function cleanCampaignData(data) {
    const floorMap = {
        "-3": "-3. kat",
        "-2": "-2. kat",
        "-1": "-1. kat",
        "0": "0. kat",
        "1": "1. kat",
        "2": "2. kat",
        "3": "3. kat"
    };

    return data.map(item => {
        const label = item.label;
        const nb_actions = item.nb_actions;

        // kattan sonra gelen sayı değerini alalım
        const match = label.match(/k-?(\d+)/i);
        let number = match ? parseInt(match[1], 10) : null;

        // Kat belirleme
        let floorKey;
        if (label.includes('-')) {
            // Negatif katlar
            floorKey = number >= 300 ? "-3"
                : number >= 200 ? "-2"
                    : number >= 100 ? "-1"
                        : "-1"; // default
        } else {
            // Pozitif katlar
            floorKey = number < 100 ? "0"
                : number < 200 ? "1"
                    : number < 300 ? "2"
                        : "3";
        }

        const floor = floorMap[floorKey] || "Bilinmeyen kat";

        return {
            kiosk: label,
            actions: nb_actions,
            floor: floor
        };
    });
}

export function getTotalActionsByFloor(data, siteId) {
    console.log(`%c getTotalActionsByFloor Çağrıldı - SiteId: ${siteId} %c`,
        'background: #2ecc71; color: white; padding: 3px; border-radius: 3px;',
        'background: none;');
    console.log("Gelen veri:", data);

    // Önce kampanya verilerini yükle
    return fetch(`./assets/${siteId}_campaign.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`${siteId}_campaigns.json dosyası bulunamadı. HTTP hata kodu: ${response.status}`);
            }
            return response.json();
        })
        .then(campaignData => {
            console.log(`%c ${siteId}_campaigns.json yüklendi %c`,
                'background: #3498db; color: white; padding: 3px; border-radius: 3px;',
                'background: none;');
            console.log("JSON içeriği:", campaignData);

            // Title'ları kat bilgileriyle eşleyen bir harita oluştur
            const titleFloorMap = {};
            campaignData.campaigns.forEach(campaign => {
                titleFloorMap[campaign.title] = campaign.floor;
            });

            console.log("%c Title-Floor Eşleştirme Haritası %c",
                'background: #9b59b6; color: white; padding: 3px; border-radius: 3px;',
                'background: none;');
            console.table(titleFloorMap);

            // Katlara göre toplam kullanım sayısını tutacak bir obje
            const totalActionsByFloor = {};

            // Eşleşme detayları
            const matchDetails = {
                matched: [],
                unmatched: []
            };

            // Veriyi işle
            data.forEach(item => {
                const label = item.label; // API'den gelen label (qr1, qr2, ...)
                const nb_actions = item.nb_actions || 0; // İlgili aksiyonların sayısı

                // Doğrudan eşleştirme dene
                if (titleFloorMap[label]) {
                    const floor = titleFloorMap[label];

                    // İlgili kat için toplam değeri başlat veya artır
                    if (!totalActionsByFloor[floor]) {
                        totalActionsByFloor[floor] = 0;
                    }

                    totalActionsByFloor[floor] += nb_actions;

                    // Eşleşme detaylarını kaydet
                    matchDetails.matched.push({
                        label,
                        floor,
                        nb_actions,
                        matchType: "direct"
                    });
                } else {
                    // Eşleşmeyen durumlar için
                    matchDetails.unmatched.push({
                        label,
                        nb_actions,
                        possibleMatches: Object.keys(titleFloorMap).filter(title =>
                            title.includes(label) || label.includes(title))
                    });

                    console.warn(`⚠️ Eşleşmeyen label: "${label}" (${nb_actions} actions)`);
                }
            });

            window.matchDetails = matchDetails;
            // Eşleşme istatistiklerini göster
            const totalLabels = data.length;
            const matchedLabels = matchDetails.matched.length;
            const unmatchedLabels = matchDetails.unmatched.length;

            const matchRate = (matchedLabels / totalLabels * 100).toFixed(2);

            console.log(`%c Eşleşme Analizi %c`,
                'background: #f39c12; color: white; padding: 3px; border-radius: 3px;',
                'background: none;');
            console.log(`Toplam Etiket: ${totalLabels}`);
            console.log(`Eşleşen Etiket: ${matchedLabels} (${matchRate}%)`);
            console.log(`Eşleşmeyen Etiket: ${unmatchedLabels} (${(100 - matchRate)}%)`);

            if (matchedLabels > 0) {
                console.log("%c ✅ EŞLEŞEN ETİKETLER %c",
                    'background: #27ae60; color: white; padding: 3px; border-radius: 3px;',
                    'background: none;');
                console.table(matchDetails.matched);
            }

            if (unmatchedLabels > 0) {
                console.log("%c ❌ EŞLEŞMEYEN ETİKETLER %c",
                    'background: #e74c3c; color: white; padding: 3px; border-radius: 3px;',
                    'background: none;');
                console.table(matchDetails.unmatched);
            }

            // Kat bazında toplam aksiyonları göster
            console.log("%c 📊 KAT BAZINDA TOPLAM AKSİYONLAR %c",
                'background: #16a085; color: white; padding: 3px; border-radius: 3px;',
                'background: none;');
            console.table(totalActionsByFloor);

            // Eğer hiç eşleşme yoksa veya veri yoksa boş bir obje döndür
            if (Object.keys(totalActionsByFloor).length === 0) {
                console.warn("⚠️ Hiç eşleşme bulunamadı veya işlenecek veri yok!");
                return {};
            }

            return totalActionsByFloor;
        })
        .catch(error => {
            console.error("❌ Kampanya verileri işlenirken hata oluştu:", error);
            return {}; // Hata durumunda boş obje döndür
        });
}


export function findEventFloor(titlesWithCounts, filepath) {
    // JSON dosyasındaki kat bilgilerini almak için fetch işlemi yapılıyor
    return fetch(filepath)
        .then(response => response.json())
        .then(floorData => {
            // Kat verilerini bir objeye dönüştürerek, etkinlik ismi ile ilişkilendiriyoruz
            const eventFloorMap = floorData.reduce((acc, item) => {
                // Title'ı düzgün bir şekilde alıyoruz
                const title = item.Title.trim(); // Title'ı temizliyoruz (boşlukları kaldırıyoruz)
                const floor = item.Floor; // Floor bilgisini alıyoruz
                acc[title] = floor; // Eşleme yapıyoruz
                return acc;
            }, {});

            console.log("Event Floor Map:", eventFloorMap); // Kat bilgileri haritasını kontrol edelim

            // Sonuçları toplamak için bir dizi oluşturuyoruz
            const results = titlesWithCounts.map(item => {
                const eventName = item.eventName.trim(); // eventName'in başındaki ve sonundaki boşlukları temizliyoruz

                // eventName ile eşleşen kat bilgisini eventFloorMap'ten alıyoruz
                const floor = eventFloorMap[eventName] || "Bilinmiyor"; // Kat bilgisi bulunmazsa "Bilinmiyor" döndürüyoruz

                return {
                    eventName: item.eventName,
                    floor: floor,
                    nbEvents: item.nbEvents
                };
            });

            // "Bilinmiyor" olan floor'ları temizliyoruz
            const filteredResults = results.filter(item => item.floor !== "Bilinmiyor");

            console.log("Filtered Results (without unknown floors):", filteredResults); // "Bilinmiyor" olanları temizledikten sonra veriyi kontrol edelim

            // Aynı eventName'lere sahip olanları birleştiriyoruz
            const mergedResults = filteredResults.reduce((acc, item) => {
                // Eğer eventName zaten acc içinde varsa, nbEvents'i topluyoruz
                const existingItem = acc.find(i => i.eventName === item.eventName);
                if (existingItem) {
                    existingItem.nbEvents += item.nbEvents; // nbEvents'i topluyoruz
                } else {
                    acc.push(item); // Yoksa yeni bir öğe ekliyoruz
                }
                return acc;
            }, []);

            // Total events per floor calculation
            const totalEventsByFloor = mergedResults.reduce((acc, item) => {
                // Kat bilgisi ile eşleşen nbEvents'i ekliyoruz
                const floor = item.floor;
                const nbEvents = item.nbEvents;

                if (!acc[floor]) {
                    acc[floor] = 0; // Kat yoksa başlatıyoruz
                }

                acc[floor] += nbEvents; // Katın toplam etkinlik sayısını ekliyoruz
                return acc;
            }, {});

            console.log("Total Events by Floor:", totalEventsByFloor); // Her kat için toplam etkinlik sayısını yazdıralım

            // Sonuçları döndürüyoruz
            return totalEventsByFloor;
        })
        .catch(error => {
            console.error("Hata oluştu:", error);
        });
}





export const renderStoreCategoriesDonutChart = (data, containerId) => {
    const categoryMap = {};

    // Kategori bazlı toplamları hesapla
    data.forEach(item => {
        const category = item.label.trim();
        categoryMap[category] = (categoryMap[category] || 0) + item.nb_events;
    });

    // Toplam etkinlik sayısını hesapla
    const totalEvents = Object.values(categoryMap).reduce((sum, count) => sum + count, 0);

    // 5%'in altındaki kategorileri "Diğer" olarak topla
    const updatedCategoryMap = {};
    let otherCategoryCount = 0;

    Object.keys(categoryMap).forEach(category => {
        const categoryCount = categoryMap[category];
        const percentage = (categoryCount / totalEvents) * 100;

        if (percentage < 5) {
            otherCategoryCount += categoryCount;  // %5'ten az olanları topluyoruz
        } else {
            updatedCategoryMap[category] = categoryCount;  // %5'ten büyük olanları olduğu gibi bırakıyoruz
        }
    });

    // "Diğer" kategorisini ekliyoruz
    if (otherCategoryCount > 0) {
        updatedCategoryMap["Diğer"] = otherCategoryCount;
    }

    // Grafikte kullanılacak veriyi oluştur
    const labels = Object.keys(updatedCategoryMap);
    const dataValues = Object.values(updatedCategoryMap);

    // Pastel renklerini generatePastelColorScale ile al
    const backgroundColors = generatePastelColorScale(labels.length);

    const datasets = [{
        data: dataValues,
        backgroundColor: backgroundColors,
        borderWidth: 1
    }];

    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Var olan grafiği temizle

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Ana Kategorilere Göre Dağılım'
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 20,
                        padding: 15
                    }
                },
                datalabels: {
                    color: 'white',
                    formatter: (value, context) => {
                        const total = dataValues.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${percentage}%`;
                    },
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
};
export const renderStoreCategoriesAreaChart = (data, containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Var olan grafiği temizle

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    // Veriyi kategori ve tarihe göre grupla
    const categoryDateMap = {};
    const dateSet = new Set();

    // Data içindeki kategoriyi ve tarihi analiz et
    Object.entries(data).forEach(([date, categories]) => {
        dateSet.add(date);

        Object.entries(categories).forEach(([category, count]) => {
            if (!categoryDateMap[category]) categoryDateMap[category] = {};
            categoryDateMap[category][date] = (categoryDateMap[category][date] || 0) + count;
        });
    });

    // Tüm tarihleri sırala
    const sortedDates = Array.from(dateSet).sort();

    // Pastel renkleri generatePastelColorScale ile al
    const backgroundColors = generatePastelColorScale(Object.keys(categoryDateMap).length);

    // Datasetleri hazırla
    const datasets = Object.keys(categoryDateMap).map((category, i) => {
        const dataPoints = sortedDates.map(date => categoryDateMap[category][date] || 0);
        return {
            label: category,
            data: dataPoints,
            fill: true,
            backgroundColor: backgroundColors[i],  // Pastel rengini burada kullanıyoruz
            borderColor: backgroundColors[i],     // Border rengi olarak da aynı pastel rengini kullanıyoruz
            tension: 0.3
        };
    });

    // Chart.js ile çizim yap
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Kategorilere Göre Zamanla Etkinlik Dağılımı'
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 20,
                        padding: 15
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tarih'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Etkinlik Sayısı'
                    }
                }
            }
        }
    });
};







export const renderTopUnitsTable = (data, containerId, totalEvents) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const top20 = data.sort((a, b) => b.Count - a.Count).slice(0, 15);

    // Başlık ekle
    const title = document.createElement('h3');
    title.innerText = 'En Çok Etkinlik Gösteren Birimler';
    title.classList.add('text-xl', 'font-semibold', 'mb-4');
    container.appendChild(title);

    const table = document.createElement('table');
    table.classList.add('min-w-full', 'bg-white', 'border', 'border-gray-200', 'shadow-md', 'rounded-lg', 'overflow-hidden');

    const thead = document.createElement('thead');
    thead.classList.add('bg-gray-200', 'text-gray-700');

    const headerRow = document.createElement('tr');
    ['Sıra', 'İsim', 'Kategori', 'Yüzde'].forEach(text => {
        const th = document.createElement('th');
        th.innerText = text;
        th.classList.add('py-3', 'px-6', 'border-b', 'text-left', 'font-medium');
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    top20.forEach((item, index) => {
        const row = document.createElement('tr');
        const percent = totalEvents ? ((item.Count / totalEvents) * 100).toFixed(1) + '%' : '0%';

        // Alt kategori: ilk virgülden önceki kelime, ilk harfi büyük
        let subCategory = '—';
        if (item.Description) {
            const firstWord = item.Description.split(',')[0].trim();
            subCategory = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
        }

        const values = [
            index + 1,
            item.Title,
            item.Cat_TR,
            percent
        ];

        values.forEach(val => {
            const td = document.createElement('td');
            td.innerText = val;
            td.classList.add('py-3', 'px-6', 'border-b', 'text-left');
            row.appendChild(td);
        });

        table.appendChild(row);
    });

    container.appendChild(table);
};



export const renderTopStoresTable = (data, containerId, totalEvents) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Toplam etkinlik sayısını konsola yazdır
    console.log('Store-Toplam Etkinlik Sayısı:', totalEvents);

    // Her bir başlık için etkinlik sayısını yazdır
    data.forEach(item => {
        console.log(`${item.Title}: ${item.Count} store-etkinlik`); // Count kullanıyoruz
    });

    const table = document.createElement('table');
    table.classList.add('min-w-full', 'bg-white', 'border', 'border-gray-200', 'shadow-md', 'rounded-lg', 'overflow-hidden');

    const thead = document.createElement('thead');
    thead.classList.add('bg-gray-200', 'text-gray-700');

    const title = document.createElement('h3');
    title.innerText = 'Birimlere Göre Dağılım';
    title.classList.add('text-xl', 'font-semibold', 'mb-4');
    container.appendChild(title);

    const headerRow = document.createElement('tr');
    ['Sıra', 'İsim', 'Kategori', 'Yüzde'].forEach(text => {
        const th = document.createElement('th');
        th.innerText = text;
        th.classList.add('py-3', 'px-6', 'border-b', 'text-left', 'font-medium');
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        const percent = ((item.Count / totalEvents) * 100).toFixed(1) + '%';

        [index + 1, item.Title, item.Cat_TR, percent].forEach(val => {
            const td = document.createElement('td');
            td.innerText = val;
            td.classList.add('py-3', 'px-6', 'border-b', 'text-left');
            row.appendChild(td);
        });

        table.appendChild(row);
    });

    container.appendChild(table);
};


export const renderFoodPlacesTable = (data, containerId, totalEvents) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Toplam etkinlik sayısını konsola yazdır
    console.log('Toplam Etkinlik Sayısı:', totalEvents);

    // Her bir başlık için etkinlik sayısını yazdır
    data.forEach(item => {
        console.log(`${item.Title}: ${item.Count} etkinlik`); // Count kullanıyoruz
    });

    // Veriyi en çok etkinlik sayısına göre sırala
    const top10 = data.sort((a, b) => b.Count - a.Count).slice(0, 10); // Count ile sıralıyoruz

    const table = document.createElement('table');
    table.classList.add('min-w-full', 'bg-white', 'border', 'border-gray-200', 'shadow-md', 'rounded-lg', 'overflow-hidden');
    const thead = document.createElement('thead');
    thead.classList.add('bg-gray-200', 'text-gray-700');
    const title = document.createElement('h3');
    title.innerText = 'Yiyecek & İçecek Yerlerine Göre Dağılım';
    title.classList.add('text-xl', 'font-semibold', 'mb-4');
    container.appendChild(title);

    const headerRow = document.createElement('tr');
    ['Sıra', 'İsim', 'Kategori', 'Yüzde'].forEach(text => {
        const th = document.createElement('th');
        th.innerText = text;
        th.classList.add('py-3', 'px-6', 'border-b', 'text-left', 'font-medium');
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    top10.forEach((item, index) => {
        const row = document.createElement('tr');

        // Yüzdeyi toplam etkinlik sayısına göre güvenli bir şekilde hesapla
        const percent = totalEvents > 0 ? ((item.Count / totalEvents) * 100).toFixed(1) + '%' : '0%'; // Count ile yüzdelik hesaplama

        // Verileri tablo satırına ekle
        [index + 1, item.Title, item.Cat_TR, percent].forEach(val => {
            const td = document.createElement('td');
            td.innerText = val;
            td.classList.add('py-3', 'px-6', 'border-b', 'text-left');
            row.appendChild(td);
        });

        table.appendChild(row);
    });

    container.appendChild(table);
};

export const renderServicesTable = (data, containerId, totalEvents) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Toplam etkinlik sayısını konsola yazdır
    console.log('Toplam Etkinlik Sayısı:', totalEvents);

    // Her bir başlık için etkinlik sayısını yazdır
    data.forEach(item => {
        console.log(`${item.Title}: ${item.Count} etkinlik service`); // Count kullanıyoruz
    });

    // Veriyi en çok etkinlik sayısına göre sırala
    const top10 = data.sort((a, b) => b.Count - a.Count).slice(0, 10); // Count ile sıralıyoruz

    const table = document.createElement('table');
    table.classList.add('min-w-full', 'bg-white', 'border', 'border-gray-200', 'shadow-md', 'rounded-lg', 'overflow-hidden');
    const thead = document.createElement('thead');
    thead.classList.add('bg-gray-200', 'text-gray-700');
    const title = document.createElement('h3');
    title.innerText = 'Hizmetlere Göre Dağılım';
    title.classList.add('text-xl', 'font-semibold', 'mb-4');
    container.appendChild(title);

    const headerRow = document.createElement('tr');
    ['Sıra', 'İsim', 'Kategori', 'Yüzde'].forEach(text => {
        const th = document.createElement('th');
        th.innerText = text;
        th.classList.add('py-3', 'px-6', 'border-b', 'text-left', 'font-medium');
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    top10.forEach((item, index) => {
        const row = document.createElement('tr');

        // Her zaman bir üste yuvarlanmış yüzdeyi hesapla
        const rawPercent = (item.Count / totalEvents) * 100;
        const roundedPercent = Math.ceil(rawPercent * 10) / 10;
        const percent = totalEvents > 0 ? `${roundedPercent.toFixed(1)}%` : '0%';

        // Verileri tablo satırına ekle
        [index + 1, item.Title, item.Cat_TR, percent].forEach(val => {
            const td = document.createElement('td');
            td.innerText = val;
            td.classList.add('py-3', 'px-6', 'border-b', 'text-left');
            row.appendChild(td);
        });

        table.appendChild(row);
    });

    container.appendChild(table);
};

export const renderFloorsTable = (data, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`"${containerId}" ID'li container bulunamadı!`);
        return;
    }
    
    container.innerHTML = '';
    
    console.log("renderFloorsTable çağrıldı, veri:", data);
    
    // Kat bazında aksiyon yüzdelerini hesapla (eşleşme detaylarından)
    const floorActionPercents = {};
    
    if (window.matchDetails && window.matchDetails.matched) {
        // Kat bazında eşleşme sayılarını hesapla
        const floorCounts = {};
        window.matchDetails.matched.forEach(match => {
            if (!floorCounts[match.floor]) {
                floorCounts[match.floor] = {
                    count: 0,
                    actions: 0
                };
            }
            floorCounts[match.floor].count += 1;
            floorCounts[match.floor].actions += match.nb_actions;
        });
        
        // Toplam aksiyonları hesapla
        const totalActions = Object.values(floorCounts).reduce((sum, data) => sum + data.actions, 0);
        
        // Her kat için aksiyon yüzdesini hesapla
        Object.keys(floorCounts).forEach(floor => {
            const actionPercent = ((floorCounts[floor].actions / totalActions) * 100).toFixed(2);
            floorActionPercents[floor] = actionPercent;
        });
    }
    
    // Verileri Floor değerine göre sırala 
    // (sayısal sıralama için Floor'u sayıya dönüştür)
    data.sort((a, b) => {
        const floorA = Number(a.floor) || 0;
        const floorB = Number(b.floor) || 0;
        return floorA - floorB;
    });
    
    const table = document.createElement('table');
    table.classList.add('min-w-full', 'bg-white', 'border', 'border-gray-200', 'shadow-md', 'rounded-lg', 'overflow-hidden');

    const thead = document.createElement('thead');
    thead.classList.add('bg-gray-200', 'text-gray-700');

    const title = document.createElement('h3');
    title.innerText = 'Katlara Göre Dağılım';
    title.classList.add('text-xl', 'font-semibold', 'mb-4');
    container.appendChild(title);

    const headerRow = document.createElement('tr');
    ['Kat', 'Tetikleyici Kullanım Yüzdesi', 'Birim Aranma Yüzdesi'].forEach(text => {
        const th = document.createElement('th');
        th.innerText = text;
        th.classList.add('py-3', 'px-6', 'border-b', 'text-left', 'font-medium');
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Tabloya eklenecek body'yi oluştur
    const tbody = document.createElement('tbody');

    data.forEach(item => {
        const row = document.createElement('tr');
        
        // Kat hücresi
        const floorCell = document.createElement('td');
        floorCell.innerText = item.floor;
        floorCell.classList.add('py-3', 'px-6', 'border-b', 'text-left');
        row.appendChild(floorCell);
        
        // Kiosk kullanım yüzdesi hücresi (aksiyon yüzdesi ile değiştir)
        const kioskCell = document.createElement('td');
        kioskCell.innerText = `${floorActionPercents[item.floor] || '0.00'}%`;
        kioskCell.classList.add('py-3', 'px-6', 'border-b', 'text-left');
        row.appendChild(kioskCell);
        
        // Birim aranma yüzdesi hücresi
        const unitCell = document.createElement('td');
        unitCell.innerText = `${item.unitSearchPercent}%`;
        unitCell.classList.add('py-3', 'px-6', 'border-b', 'text-left');
        row.appendChild(unitCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // Eşleşme bilgileri kutusu
    if (window.matchDetails && window.matchDetails.matched) {
        const matchedCount = window.matchDetails.matched.length;
        const totalCount = matchedCount + (window.matchDetails.unmatched ? window.matchDetails.unmatched.length : 0);
        const matchRate = ((matchedCount / totalCount) * 100).toFixed(2);
        

    }
};


export const renderKiosksTable = (data, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    const table = document.createElement('table');
    table.classList.add('min-w-full', 'bg-white', 'border', 'border-gray-200', 'shadow-md', 'rounded-lg', 'overflow-hidden');

    const title = document.createElement('h3');
    title.innerText = 'Tetikleyicilere Göre Dağılım';
    title.classList.add('text-xl', 'font-semibold', 'mb-4');
    container.appendChild(title);

    const thead = document.createElement('thead');
    thead.classList.add('bg-gray-200', 'text-gray-700');
    const headerRow = document.createElement('tr');
    
    // Tablo başlıklarını güncelle (Tetiklenme Sayısı sütununu ekle)
    ['Tetikleyici ID', 'Kat', 'Tetiklenme Sayısı', 'Yüzde'].forEach(text => {
        const th = document.createElement('th');
        th.innerText = text;
        th.classList.add('py-3', 'px-6', 'border-b', 'text-left', 'font-medium');
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    // Toplam action sayısını hesaplayalım
    const totalActions = data.reduce((total, kiosk) => total + kiosk.actions, 0);

    // Kat bilgilerini al - siteId kullanarak JSON dosyasını yükle
    const siteId = window.globalSiteId || localStorage.getItem('selectedSiteId');
    
    if (siteId) {
        // Siteye özgü campaign dosyasını yükle
        fetch(`./assets/${siteId}_campaign.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`${siteId}_campaign.json dosyası bulunamadı.`);
                }
                return response.json();
            })
            .then(campaignData => {
                // QR kodlarını ve kat bilgilerini haritala
                const qrFloorMap = {};
                campaignData.campaigns.forEach(campaign => {
                    qrFloorMap[campaign.title] = campaign.floor;
                });
                
                console.log("QR-Floor Map:", qrFloorMap);
                
                // Eşleşmeyen QR kodlarını filtrele ve sadece eşleşenleri dahil et
                const matchedData = data.filter(item => qrFloorMap[item.kiosk] !== undefined);
                
                // Eşleşmeyen QR kodlarını logla
                const unmatchedData = data.filter(item => qrFloorMap[item.kiosk] === undefined);
                if (unmatchedData.length > 0) {
                    console.warn(`${unmatchedData.length} kiosk etiketi eşleşmedi ve tabloya dahil edilmedi:`, unmatchedData);
                }
                
                // Tablonun oluşturulacağı container boşsa veya matchedData boşsa, mesaj göster ve işlemi sonlandır
                if (matchedData.length === 0) {
                    const noDataMsg = document.createElement('div');
                    noDataMsg.classList.add('p-4', 'text-gray-500', 'text-center');
                    noDataMsg.innerText = 'Gösterilecek eşleşen kiosk verisi bulunamadı.';
                    container.appendChild(noDataMsg);
                    return; // Fonksiyondan çık
                }
                
                // Eşleşen kioskların toplam aksiyonunu hesapla
                const matchedTotalActions = matchedData.reduce((total, item) => total + item.actions, 0);
                
                // Yüzdelik orana göre sıralama işlemi
                const sortedData = matchedData.map(item => {
                    // Yüzdeyi hesapla (eşleşen toplam üzerinden)
                    const percentage = ((item.actions / matchedTotalActions) * 100).toFixed(2);
                    
                    // item.kiosk değerini kullanarak kat bilgisini bul
                    const floor = `${qrFloorMap[item.kiosk]}. kat`;
                    
                    return { 
                        ...item, 
                        percentage: parseFloat(percentage),
                        floor: floor
                    };
                }).sort((a, b) => b.percentage - a.percentage); // Yüzdelik oranına göre büyükten küçüğe sıralama
                
                // Tabloyu oluştur
                sortedData.forEach(item => {
                    const row = document.createElement('tr');
                    
                    // Tetikleyici ID hücresi
                    const idCell = document.createElement('td');
                    idCell.innerText = item.kiosk;
                    idCell.classList.add('py-3', 'px-6', 'border-b', 'text-left');
                    row.appendChild(idCell);
                    
                    // Kat hücresi
                    const floorCell = document.createElement('td');
                    floorCell.innerText = item.floor;
                    floorCell.classList.add('py-3', 'px-6', 'border-b', 'text-left');
                    row.appendChild(floorCell);
                    
                    // Tetiklenme Sayısı hücresi (YENİ)
                    const actionsCell = document.createElement('td');
                    actionsCell.innerText = item.actions.toLocaleString('tr-TR');
                    actionsCell.classList.add('py-3', 'px-6', 'border-b', 'text-left');
                    row.appendChild(actionsCell);
                    
                    // Yüzde hücresi
                    const percentCell = document.createElement('td');
                    percentCell.innerText = `${item.percentage}%`;
                    percentCell.classList.add('py-3', 'px-6', 'border-b', 'text-left');
                    row.appendChild(percentCell);

                    tbody.appendChild(row);
                });
                
                table.appendChild(tbody);
                container.appendChild(table);
            })
            .catch(error => {
                console.error(`Kiosk tablosu için kat bilgileri alınamadı: ${error.message}`);
                
                // Hata durumunda bilgi mesajı göster
                const errorMsg = document.createElement('div');
                errorMsg.classList.add('p-4', 'text-red-500', 'text-center');
                errorMsg.innerText = `Kiosk bilgileri yüklenemedi: ${error.message}`;
                container.appendChild(errorMsg);
            });
    } else {
        // SiteId yoksa bilgi mesajı göster
        const noSiteMsg = document.createElement('div');
        noSiteMsg.classList.add('p-4', 'text-gray-500', 'text-center');
        noSiteMsg.innerText = 'Site ID bulunamadığı için kiosk bilgileri yüklenemedi.';
        container.appendChild(noSiteMsg);
    }
};

export function renderMatchedSearches(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    const title = document.createElement('h3');
    title.innerText = 'Arama Sonrası Seçilen Birimler';
    title.classList.add('text-xl', 'font-semibold', 'mb-4');
    container.appendChild(title);
    
    if (!data || !data.matched || Object.keys(data.matched).length === 0) {
        const noData = document.createElement('p');
        noData.innerText = 'Eşleşen arama verisi bulunamadı.';
        noData.classList.add('text-gray-500', 'text-center', 'py-4');
        container.appendChild(noData);
        return;
    }
    
    const table = document.createElement('table');
    table.classList.add('min-w-full', 'bg-white', 'border', 'border-gray-200', 'shadow-md', 'rounded-lg', 'overflow-hidden');
    
    const thead = document.createElement('thead');
    thead.classList.add('bg-gray-200', 'text-gray-700');
    
    const headerRow = document.createElement('tr');
    ['Aranan Kelime', 'Ziyaret Sayısı', 'Seçilen Birimler'].forEach(text => {
        const th = document.createElement('th');
        th.innerText = text;
        th.classList.add('py-3', 'px-6', 'border-b', 'text-left', 'font-medium');
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    
    // Matched verileri sırala (ziyaret sayısına göre)
    const sortedMatches = Object.entries(data.matched)
        .sort(([, a], [, b]) => b.nb_visits - a.nb_visits);
    
    sortedMatches.forEach(([keyword, info]) => {
        const row = document.createElement('tr');
        
        // Aranan kelime hücresi
        const keywordCell = document.createElement('td');
        keywordCell.innerText = keyword;
        keywordCell.classList.add('py-3', 'px-6', 'border-b', 'text-left', 'font-medium');
        row.appendChild(keywordCell);
        
        // Ziyaret sayısı hücresi
        const visitsCell = document.createElement('td');
        visitsCell.innerText = info.nb_visits;
        visitsCell.classList.add('py-3', 'px-6', 'border-b', 'text-left');
        row.appendChild(visitsCell);
        
        // Seçilen birimler hücresi
        const unitsCell = document.createElement('td');
        unitsCell.innerText = info.units.join(', ');
        unitsCell.classList.add('py-3', 'px-6', 'border-b', 'text-left');
        row.appendChild(unitsCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
}

// Eşleşmeyen arama sonuçlarını fuzzy matching ile render etmek için
export async function renderUnmatchedSearches(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    const title = document.createElement('h3');
    title.innerText = 'Aranıp Bulunamayan Olası Birimler';
    title.classList.add('text-xl', 'font-semibold', 'mb-4');
    container.appendChild(title);
    
    if (!data || !data.unmatched || data.unmatched.length === 0) {
        const noData = document.createElement('p');
        noData.innerText = 'Eşleşmeyen arama verisi bulunamadı.';
        noData.classList.add('text-gray-500', 'text-center', 'py-4');
        container.appendChild(noData);
        return;
    }
    
    // all-stores.json dosyasını yükle
    let allStores = [];
    try {
        const response = await fetch('./assets/all-stores.json');
        if (!response.ok) {
            throw new Error('Mağaza verileri yüklenemedi');
        }
        allStores = await response.json();
        console.log('Tüm mağazalar yüklendi:', allStores);
    } catch (error) {
        console.error('Mağaza verileri yüklenirken hata oluştu:', error);
        const errorMsg = document.createElement('p');
        errorMsg.innerText = 'Mağaza verileri yüklenemedi.';
        errorMsg.classList.add('text-red-500', 'text-center', 'py-4');
        container.appendChild(errorMsg);
        return;
    }
    
    const table = document.createElement('table');
    table.classList.add('min-w-full', 'bg-white', 'border', 'border-gray-200', 'shadow-md', 'rounded-lg', 'overflow-hidden');
    
    const thead = document.createElement('thead');
    thead.classList.add('bg-gray-200', 'text-gray-700');
    
    const headerRow = document.createElement('tr');
    ['Aranan Kelime', 'Arama Sayısı', 'Olası Eşleşmeler'].forEach(text => {
        const th = document.createElement('th');
        th.innerText = text;
        th.classList.add('py-3', 'px-6', 'border-b', 'text-left', 'font-medium');
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    
    // Filtreleme: Anlamsız veya özel karakterler içeren aramaları kaldır
    const filteredUnmatched = data.unmatched.filter(item => {
        const label = item.label || '';
        
        // Filtreleme kriterleri:
        // 1. Boş, null veya undefined değerler
        if (!label || label.trim() === '') return false;
        
        // 2. Sadece % işareti ve/veya "All" gibi anlamsız kelimeler içeren aramalar
        if (label.includes('%%') || label === '%All' || label === '%%All') return false;
        
        // 3. Çok kısa aramalar (1 karakter)
        if (label.length < 2) return false;
        
        // 4. Sadece rakamlardan oluşan aramalar
        if (/^\d+$/.test(label)) return false;
        
        // Diğer durumlar için aramayı kabul et
        return true;
    });
    
    // Unmatched verileri sırala (ziyaret sayısına göre)
    filteredUnmatched.sort((a, b) => b.nb_visits - a.nb_visits);
    
    // Geliştirilmiş fuzzy matching fonksiyonu
    function improvedFuzzyMatch(needle, haystack) {
        // İkisi de lowercase yapılır
        needle = needle.toLowerCase();
        haystack = haystack.toLowerCase();
        
        // Haystack'i kelimelere ayır
        const words = haystack.split(/\s+/);
        
        // Herhangi bir kelime needle ile başlıyorsa yüksek puan ver
        for (const word of words) {
            if (word.startsWith(needle)) {
                return 0.95; // Bir kelime needle ile başlıyorsa çok yüksek skor
            }
        }
        
        // Herhangi bir kelime needle'ı içeriyorsa (ancak kelimenin başında değilse) daha düşük puan ver
        for (const word of words) {
            if (word.includes(needle) && needle.length >= 3) {
                return 0.7; // Bir kelime needle'ı içeriyorsa ve needle en az 3 karakter ise orta skor
            }
        }
        
        // Eğer aranan kelime çok kısaysa (3 karakter veya daha az) sadece kelime başı eşleşmelerini kabul et
        if (needle.length <= 3) {
            return 0; // Kısa needle için kelime başı eşleşmesi yoksa 0 dön
        }
        
        // Tüm haystack needle ile başlıyorsa yüksek puan
        if (haystack.startsWith(needle)) {
            return 0.9;
        }
        
        // Needle haystack içinde tam olarak geçiyorsa orta puan
        if (haystack.includes(` ${needle} `)) {
            return 0.85;
        }
        
        // Levenshtein Distance hesapla
        function levenshteinDistance(a, b) {
            const matrix = [];
            
            // Matrisi ilklendirme
            for (let i = 0; i <= b.length; i++) {
                matrix[i] = [i];
            }
            
            for (let j = 0; j <= a.length; j++) {
                matrix[0][j] = j;
            }
            
            // Minimum maliyet hesaplama
            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    if (b.charAt(i-1) === a.charAt(j-1)) {
                        matrix[i][j] = matrix[i-1][j-1];
                    } else {
                        matrix[i][j] = Math.min(
                            matrix[i-1][j-1] + 1, // değiştir
                            matrix[i][j-1] + 1,   // ekle
                            matrix[i-1][j] + 1    // çıkar
                        );
                    }
                }
            }
            
            return matrix[b.length][a.length];
        }
        
        // Levenshtein mesafesini hesapla
        const distance = levenshteinDistance(needle, haystack);
        
        // Normalize edilmiş benzerlik skoru
        const maxDistance = Math.max(needle.length, haystack.length);
        const similarity = 1 - (distance / maxDistance);
        
        // Kelime başı eşleşmesi olmayan ve kısa needle'lar için daha yüksek bir eşik değeri kullan
        if (needle.length <= 5 && similarity < 0.8) {
            return 0;
        }
        
        // Uzun metinler için normal eşleşme (minimum %60 benzerlik)
        if (similarity < 0.6) {
            return 0;
        }
        
        return similarity * 0.8; // Tam kelime eşleşmesi olmadığı için puanı biraz düşür
    }
    
    // Her unmatched kelime için fuzzy matching yap
    filteredUnmatched.forEach(item => {
        const row = document.createElement('tr');
        
        // Aranan kelime hücresi
        const keywordCell = document.createElement('td');
        keywordCell.innerText = item.label;
        keywordCell.classList.add('py-3', 'px-6', 'border-b', 'text-left', 'font-medium');
        row.appendChild(keywordCell);
        
        // Ziyaret sayısı hücresi
        const visitsCell = document.createElement('td');
        visitsCell.innerText = item.nb_visits;
        visitsCell.classList.add('py-3', 'px-6', 'border-b', 'text-left');
        row.appendChild(visitsCell);
        
        // Olası eşleşmeler hücresi
        const matchesCell = document.createElement('td');
        
        // Fuzzy matching ile olası eşleşmeleri bul
        const possibleMatches = allStores
            .map(store => {
                const score = improvedFuzzyMatch(item.label, store);
                return { store, score };
            })
            .filter(match => match.score > 0) // Skorları filtrele - 0 skorlar çıkarılır
            .sort((a, b) => b.score - a.score) // En yüksek skora göre sırala
            .slice(0, 3); // İlk 3 eşleşmeyi al
        
        if (possibleMatches.length > 0) {
            const matchesList = document.createElement('ul');
            matchesList.classList.add('list-disc', 'pl-5');
            
            possibleMatches.forEach(match => {
                const listItem = document.createElement('li');
                listItem.innerText = `${match.store} (${Math.round(match.score * 100)}% eşleşme)`;
                matchesList.appendChild(listItem);
            });
            
            matchesCell.appendChild(matchesList);
        } else {
            matchesCell.innerText = 'Eşleşme bulunamadı';
        }
        
        matchesCell.classList.add('py-3', 'px-6', 'border-b', 'text-left');
        row.appendChild(matchesCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
}
