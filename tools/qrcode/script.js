document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const urlsTextarea = document.getElementById('urls');
    const logoInput = document.getElementById('logo');
    const generateBtn = document.getElementById('generateBtn');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const downloadDropdown = document.getElementById('downloadDropdown');
    const qrCodesContainer = document.getElementById('qrCodesContainer');
    const resultsSection = document.getElementById('results');
    
    // Options Elements
    const marginInput = document.getElementById('margin');
    const dotColorInput = document.getElementById('dotColor');
    const dotTypeSelect = document.getElementById('dotType');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const cornerSquareTypeSelect = document.getElementById('cornerSquareType');
    const cornerDotTypeSelect = document.getElementById('cornerDotType');
    const correctionLevelSelect = document.getElementById('correctionLevel');
    const logoSizeInput = document.getElementById('logoSize');
    const logoOpacityInput = document.getElementById('logoOpacity');
    
    // Constants
    const QR_SIZE = 500; // Fixed size for vector quality
    
    // State
    let logoDataUrl = null;
    const generatedQRCodes = [];

    // Event Listeners
    logoInput.addEventListener('change', handleLogoUpload);
    generateBtn.addEventListener('click', generateQRCodes);
    
    // Download All Dropdown Toggle
    downloadAllBtn.addEventListener('click', (e) => {
        if (downloadAllBtn.disabled) return;
        e.stopPropagation();
        downloadAllBtn.classList.toggle('active');
        downloadDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!downloadAllBtn.contains(e.target) && !downloadDropdown.contains(e.target)) {
            downloadAllBtn.classList.remove('active');
            downloadDropdown.classList.remove('show');
        }
    });
    
    // Dropdown items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const format = item.getAttribute('data-format');
            downloadAllQRCodes(format);
            downloadAllBtn.classList.remove('active');
            downloadDropdown.classList.remove('show');
        });
    });
    
    // Handle Logo Upload
    function handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const maxDimension = 300;
                let width = img.width;
                let height = img.height;
                
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height / width) * maxDimension;
                        width = maxDimension;
                    } else {
                        width = (width / height) * maxDimension;
                        height = maxDimension;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                
                logoDataUrl = canvas.toDataURL('image/png');
            };
            
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }
    
    // Parse URL and filename from input
    function parseUrlInput(line) {
        const trimmed = line.trim();
        if (!trimmed) return null;
        
        // Check for separator (pipe character)
        if (trimmed.includes('|')) {
            const parts = trimmed.split('|');
            const url = parts[0].trim();
            const filename = parts[1].trim() || generateFilename(url);
            return { url, filename: sanitizeFilename(filename) };
        }
        
        // No separator - generate filename from URL
        return { url: trimmed, filename: generateFilename(trimmed) };
    }
    
    // Generate filename from URL
    function generateFilename(url) {
        try {
            const urlObj = new URL(url);
            let name = urlObj.hostname.replace(/^www\./, '').replace(/\./g, '-');
            if (urlObj.pathname && urlObj.pathname !== '/') {
                name += urlObj.pathname.replace(/\//g, '-').replace(/-$/, '');
            }
            return sanitizeFilename(name);
        } catch {
            return `qrcode-${Date.now()}`;
        }
    }
    
    // Sanitize filename
    function sanitizeFilename(filename) {
        return filename
            .replace(/[^a-zA-Z0-9\-_]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .toLowerCase()
            .substring(0, 50);
    }
    
    // Get QR Code Options
    function getQRCodeOptions() {
        const selectedCorrection = logoDataUrl ? 'H' : correctionLevelSelect.value;
        
        return {
            width: QR_SIZE,
            height: QR_SIZE,
            margin: parseInt(marginInput.value),
            type: 'svg', // Always generate as SVG for vector quality
            dotsOptions: {
                color: dotColorInput.value,
                type: dotTypeSelect.value,
            },
            backgroundOptions: {
                color: backgroundColorInput.value,
            },
            cornersSquareOptions: {
                type: cornerSquareTypeSelect.value,
                color: dotColorInput.value
            },
            cornersDotOptions: {
                type: cornerDotTypeSelect.value,
                color: dotColorInput.value
            },
            qrOptions: {
                typeNumber: 0,
                mode: 'Byte',
                errorCorrectionLevel: selectedCorrection
            },
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: 5,
                imageSize: parseFloat(logoSizeInput.value) / 100,
                hideBackgroundDots: true,
                imagePosition: 'center',
            }
        };
    }
    
    // Generate QR Codes
    function generateQRCodes() {
        const lines = urlsTextarea.value.trim().split('\n');
        const entries = lines.map(parseUrlInput).filter(Boolean);
        
        if (entries.length === 0) {
            alert('Please enter at least one URL');
            return;
        }
        
        // Clear previous
        qrCodesContainer.innerHTML = '';
        generatedQRCodes.length = 0;
        
        const options = getQRCodeOptions();
        
        entries.forEach((entry, index) => {
            generateQRCode(entry.url, entry.filename, index, options);
        });
        
        resultsSection.style.display = 'block';
        downloadAllBtn.disabled = entries.length <= 1;
    }
    
    // Generate Single QR Code
    function generateQRCode(url, filename, index, options) {
        const qrCodeItem = document.createElement('div');
        qrCodeItem.className = 'qr-code-item';
        
        const qrCodeCanvas = document.createElement('div');
        qrCodeCanvas.id = `qr-canvas-${index}`;
        qrCodeCanvas.className = 'qr-canvas';
        
        const filenameText = document.createElement('div');
        filenameText.className = 'qr-code-filename';
        filenameText.textContent = filename;
        
        const urlText = document.createElement('div');
        urlText.className = 'qr-code-url';
        urlText.textContent = url;
        urlText.title = url;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'qr-code-actions';
        
        // SVG Download Button
        const svgBtn = document.createElement('button');
        svgBtn.className = 'download-btn svg-btn';
        svgBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
            </svg>
            SVG
        `;
        svgBtn.onclick = () => downloadQRCode(index, 'svg');
        
        // PDF Download Button
        const pdfBtn = document.createElement('button');
        pdfBtn.className = 'download-btn pdf-btn';
        pdfBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
            </svg>
            PDF
        `;
        pdfBtn.onclick = () => downloadQRCode(index, 'pdf');
        
        actionsDiv.appendChild(svgBtn);
        actionsDiv.appendChild(pdfBtn);
        
        qrCodeItem.appendChild(qrCodeCanvas);
        qrCodeItem.appendChild(filenameText);
        qrCodeItem.appendChild(urlText);
        qrCodeItem.appendChild(actionsDiv);
        
        qrCodesContainer.appendChild(qrCodeItem);
        
        // Create QR Code with SVG type
        const finalOptions = {
            ...options,
            data: url,
            image: logoDataUrl,
        };
        
        const qrCode = new QRCodeStyling(finalOptions);
        
        generatedQRCodes.push({
            qrCode,
            url,
            filename
        });
        
        qrCode.append(qrCodeCanvas);
        
        // Fix SVG sizing for preview
        setTimeout(() => {
            const svg = qrCodeCanvas.querySelector('svg');
            if (svg) {
                const originalWidth = svg.getAttribute('width') || QR_SIZE;
                const originalHeight = svg.getAttribute('height') || QR_SIZE;
                svg.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
                svg.setAttribute('width', '180');
                svg.setAttribute('height', '180');
                svg.style.width = '180px';
                svg.style.height = '180px';
            }
        }, 100);
    }
    
    // Download QR Code
    async function downloadQRCode(index, format) {
        const { qrCode, filename } = generatedQRCodes[index];
        
        switch (format) {
            case 'svg':
                downloadAsSVG(qrCode, filename);
                break;
            case 'pdf':
                await downloadAsPDF(qrCode, filename);
                break;
        }
    }
    
    // Download as SVG (Vector)
    function downloadAsSVG(qrCode, filename) {
        qrCode.getRawData('svg').then(blob => {
            saveAs(blob, `${filename}.svg`);
        });
    }
    
    // Download as PDF (Vector) - Poster size 500x500mm
    async function downloadAsPDF(qrCode, filename) {
        const { jsPDF } = window.jspdf;
        
        // Get SVG data
        const svgBlob = await qrCode.getRawData('svg');
        const svgText = await svgBlob.text();
        
        // Parse SVG
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = svgDoc.querySelector('svg');
        
        // Fixed poster size: 300x300 mm (30x30 cm)
        const pdfWidth = 300; // mm
        const pdfHeight = 300; // mm
        
        // Add some padding
        const padding = 15; // mm
        const totalWidth = pdfWidth + (padding * 2);
        const totalHeight = pdfHeight + (padding * 2);
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [totalWidth, totalHeight]
        });
        
        // Use svg2pdf for true vector PDF
        await pdf.svg(svgElement, {
            x: padding,
            y: padding,
            width: pdfWidth,
            height: pdfHeight
        });
        
        pdf.save(`${filename}.pdf`);
    }
    
    // Download All QR Codes
    async function downloadAllQRCodes(format) {
        if (generatedQRCodes.length === 0) return;
        
        const zip = new JSZip();
        
        // Create folder for organization
        const folderName = format.toUpperCase();
        const folder = zip.folder(folderName);
        
        const promises = generatedQRCodes.map(async ({ qrCode, filename }) => {
            switch (format) {
                case 'svg':
                    const svgBlob = await qrCode.getRawData('svg');
                    folder.file(`${filename}.svg`, svgBlob);
                    break;
                    
                case 'pdf':
                    const pdfBlob = await generatePDFBlob(qrCode, filename);
                    folder.file(`${filename}.pdf`, pdfBlob);
                    break;
            }
        });
        
        await Promise.all(promises);
        
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `qrcodes-${format}.zip`);
    }
    
    // Generate PDF Blob for zip (Vector) - Poster size 500x500mm
    async function generatePDFBlob(qrCode, filename) {
        const { jsPDF } = window.jspdf;
        
        const svgBlob = await qrCode.getRawData('svg');
        const svgText = await svgBlob.text();
        
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = svgDoc.querySelector('svg');
        
        // Fixed poster size: 300x300 mm (30x30 cm)
        const pdfWidth = 300; // mm
        const pdfHeight = 300; // mm
        const padding = 15; // mm
        const totalWidth = pdfWidth + (padding * 2);
        const totalHeight = pdfHeight + (padding * 2);
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [totalWidth, totalHeight]
        });
        
        // Use svg2pdf for true vector PDF
        await pdf.svg(svgElement, {
            x: padding,
            y: padding,
            width: pdfWidth,
            height: pdfHeight
        });
        
        return pdf.output('blob');
    }
});
