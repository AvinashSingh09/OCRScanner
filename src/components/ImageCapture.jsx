import { useRef, useState } from 'react';

const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

const dataUrlFromBlob = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
});

const resizeImageDataUrl = (dataUrl) => new Promise((resolve) => {
    const image = new Image();

    image.onload = async () => {
        const scale = Math.min(
            MAX_IMAGE_DIMENSION / image.naturalWidth,
            MAX_IMAGE_DIMENSION / image.naturalHeight,
            1
        );

        if (scale === 1) {
            resolve(dataUrl);
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.naturalWidth * scale);
        canvas.height = Math.round(image.naturalHeight * scale);

        const context = canvas.getContext('2d');
        if (!context) {
            resolve(dataUrl);
            return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
            if (!blob) {
                resolve(dataUrl);
                return;
            }

            try {
                resolve(await dataUrlFromBlob(blob));
            } catch {
                resolve(dataUrl);
            }
        }, 'image/jpeg', JPEG_QUALITY);
    };

    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
});

const ImageCapture = ({ imageNumber, onCapture, capturedImage, onRetake }) => {
    const fileInputRef = useRef(null);
    const [isPreparingImage, setIsPreparingImage] = useState(false);
    const imageLabel = imageNumber ? `Image ${imageNumber}` : 'Image';

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('image/')) {
            return;
        }

        setIsPreparingImage(true);
        try {
            const dataUrl = await readFileAsDataUrl(file);
            const resizedDataUrl = await resizeImageDataUrl(dataUrl);
            onCapture(resizedDataUrl);
        } catch (error) {
            console.error('Failed to prepare image:', error);
            alert('Failed to prepare image. Please try again.');
        } finally {
            setIsPreparingImage(false);
        }
    };

    const handleCaptureClick = () => {
        fileInputRef.current?.click();
    };

    const handleRetake = () => {
        onRetake();
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (capturedImage) {
        return (
            <div className="relative group">
                <div className="relative border border-[#1C1917] p-3 bg-white shadow-sm">
                    <img
                        src={capturedImage}
                        alt={`Captured ${imageLabel}`}
                        className="w-full h-auto object-cover border border-stone-200"
                    />
                    
                    <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="font-mono text-[10px] tracking-wider text-stone-500 uppercase">
                            Captured Image
                        </div>
                        <button
                            onClick={handleRetake}
                            className="px-4 py-1.5 border border-red-300 hover:bg-red-50 text-red-800 font-mono text-[10px] uppercase tracking-wider transition-colors duration-200 cursor-pointer"
                        >
                            Retake Image
                        </button>
                    </div>
                </div>
                <div className="absolute -top-2.5 -right-2.5 bg-[#1C1917] text-[#FAF8F5] px-3 py-1 font-mono text-[10px] tracking-widest uppercase shadow-sm">
                    ✓ {imageLabel}
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="relative border border-[#1C1917] bg-[#FAF8F5]">
                {/* Camera placeholder */}
                <div className="w-full aspect-video flex flex-col items-center justify-center p-8 text-center">
                    <svg className="w-16 h-16 text-stone-400 mb-4 stroke-[1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-stone-700 font-serif italic text-lg mb-1">Ready to capture</p>
                    <p className="text-stone-400 font-mono text-[10px] tracking-widest uppercase">Click the button below to open camera</p>
                </div>

                {/* Camera overlay corners (Editorial bracket indicators) */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-3 left-3 w-8 h-8 border-t border-l border-[#1C1917]" />
                    <div className="absolute top-3 right-3 w-8 h-8 border-t border-r border-[#1C1917]" />
                    <div className="absolute bottom-3 left-3 w-8 h-8 border-b border-l border-[#1C1917]" />
                    <div className="absolute bottom-3 right-3 w-8 h-8 border-b border-r border-[#1C1917]" />
                </div>
            </div>

            {/* Hidden file input with camera capture */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Capture button */}
            <div className="mt-6 flex flex-col items-center space-y-3">
                <button
                    onClick={handleCaptureClick}
                    disabled={isPreparingImage}
                    className={`px-8 py-3.5 bg-[#1C1917] hover:bg-stone-800 text-[#FAF8F5] font-sans font-medium uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm ${isPreparingImage ? 'opacity-75 cursor-wait' : ''}`}
                >
                    {isPreparingImage ? (
                        <>
                            <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Preparing...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Take Picture
                        </>
                    )}
                </button>
                <p className="text-stone-400 font-mono text-[10px] tracking-wider uppercase">Opens your device camera</p>
            </div>
        </div>
    );
};

export default ImageCapture;
