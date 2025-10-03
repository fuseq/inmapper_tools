document.addEventListener('DOMContentLoaded', () => {

    const urlsTextarea = document.getElementById('urls');
    const logoInput = document.getElementById('logo');
    const generateBtn = document.getElementById('generateBtn');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const qrCodesContainer = document.getElementById('qrCodesContainer');
    const resultsSection = document.getElementById('results');
    
   
    const sizeInput = document.getElementById('size');
    const marginInput = document.getElementById('margin');
    const dotColorInput = document.getElementById('dotColor');
    const dotTypeSelect = document.getElementById('dotType');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const cornerSquareTypeSelect = document.getElementById('cornerSquareType');
    const cornerDotTypeSelect = document.getElementById('cornerDotType');
    const correctionLevelSelect = document.getElementById('correctionLevel');
    const logoSizeInput = document.getElementById('logoSize');
    const logoOpacityInput = document.getElementById('logoOpacity');
    
   
    let logoDataUrl = null;
    const generatedQRCodes = [];

    logoInput.addEventListener('change', handleLogoUpload);
    generateBtn.addEventListener('click', generateQRCodes);
    downloadAllBtn.addEventListener('click', downloadAllQRCodes);
    
    
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
    
    // Generate QR Codes
    function generateQRCodes() {
        const urls = urlsTextarea.value.trim().split('\n').filter(url => url.trim() !== '');
        
        if (urls.length === 0) {
            alert('Please enter at least one URL');
            return;
        }
        

        qrCodesContainer.innerHTML = '';
        generatedQRCodes.length = 0;
        

        const options = getQRCodeOptions();
        

        urls.forEach((url, index) => {
            generateQRCode(url, index, options);
        });
        

        resultsSection.style.display = 'block';
        

        downloadAllBtn.disabled = urls.length <= 1;
    }
    

    function getQRCodeOptions() {

        const selectedCorrection = logoDataUrl ? 'H' : correctionLevelSelect.value;
        
        return {
            width: parseInt(sizeInput.value),
            height: parseInt(sizeInput.value),
            margin: parseInt(marginInput.value),
            dotsOptions: {
                color: dotColorInput.value,
                type: dotTypeSelect.value,
                gradient: {
                    type: 'linear',
                    rotation: 0,
                    colorStops: [
                        { offset: 0, color: dotColorInput.value }
                    ]
                }
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
            correctionLevel: selectedCorrection,
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: 5,
                imageSize: parseFloat(logoSizeInput.value) / 100,
                hideBackgroundDots: true,
                imagePosition: 'center',
                opacity: parseFloat(logoOpacityInput.value)
            }
        };
    }
    
    
    function generateQRCode(url, index, options) {
      
        const qrCodeItem = document.createElement('div');
        qrCodeItem.className = 'qr-code-item';
        
       
        const qrCodeCanvas = document.createElement('div');
        qrCodeCanvas.id = `qr-canvas-${index}`;
        
        
        const urlText = document.createElement('div');
        urlText.className = 'qr-code-url';
        urlText.textContent = url;
        
      
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.textContent = 'Download';
        downloadBtn.onclick = () => downloadQRCode(index);
        
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'qr-code-actions';
        actionsDiv.appendChild(downloadBtn);
        
       
        qrCodeItem.appendChild(qrCodeCanvas);
        qrCodeItem.appendChild(urlText);
        qrCodeItem.appendChild(actionsDiv);
        
        
        qrCodesContainer.appendChild(qrCodeItem);
        
       
        const finalOptions = {
            ...options,
            width: options.width * 2, 
            height: options.height * 2,
            data: url,
            image: logoDataUrl,
            qrOptions: {
                typeNumber: 0,
                mode: 'Byte',
                errorCorrectionLevel: options.correctionLevel
            }
        };
        
        const qrCode = new QRCodeStyling(finalOptions);
        
        
        generatedQRCodes.push({
            qrCode,
            url,
            filename: `qrcode-${index + 1}.png`
        });
        
       
        qrCode.append(qrCodeCanvas);
    }
    
    
    function downloadQRCode(index) {
        const { qrCode, url, filename } = generatedQRCodes[index];
        
        
        qrCode.download({
            name: filename,
            extension: 'png',
            quality: 1.0 
        });
    }
    
 
    async function downloadAllQRCodes() {
        if (generatedQRCodes.length === 0) return;
        
        
        const zip = new JSZip();
        
       
        let processed = 0;
        
     
        const promises = generatedQRCodes.map(({ qrCode, url, filename }, index) => {
            return new Promise(resolve => {
                qrCode.getRawData('png').then(blob => {
                    zip.file(filename, blob);
                    processed++;
                    resolve();
                });
            });
        });
        
      
        await Promise.all(promises);
        
       
        zip.generateAsync({ type: 'blob' }).then(content => {
        
            saveAs(content, 'qrcodes.zip');
        });
    }
}); 