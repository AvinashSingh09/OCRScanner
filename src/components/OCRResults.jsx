import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const OCRResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { image, fullText } = location.state || {};

    const [extractedText, setExtractedText] = useState('');
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
    const hasSaved = useRef(false); // Track if we've already saved

    useEffect(() => {
        if (!image) {
            navigate('/');
            return;
        }

        const text = fullText || '';
        setExtractedText(text);

        // Auto-save to Sheets immediately (only once)
        const autoSave = async () => {
            // Prevent duplicate saves in React Strict Mode
            if (hasSaved.current) {
                console.log('Already saved, skipping duplicate save');
                return;
            }

            hasSaved.current = true;

            const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

            if (!scriptUrl || scriptUrl === 'your_google_apps_script_url_here') {
                console.warn('Google Script URL not configured');
                return;
            }

            try {
                // Step 1: Upload image to Cloudinary
                console.log('Uploading image to Cloudinary...');
                const { uploadImageToCloudinary } = await import('../services/cloudinaryService.js');

                const timestamp = Date.now();
                const imageUrl = await uploadImageToCloudinary(image, `ocr_image_${timestamp}`);

                console.log('Image uploaded:', imageUrl);

                // Step 2: Save full OCR text to Sheets with image URL
                await fetch(scriptUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fullText: text,
                        imageUrl
                    })
                });

                setSaveStatus('success');
                setTimeout(() => setSaveStatus(null), 3000);
            } catch (error) {
                console.error('Error auto-saving to sheets:', error);
                setSaveStatus('error');
                // Show error message to user
                alert(`Failed to save: ${error.message}\n\nPlease check your Cloudinary configuration in .env file.`);
            }
        };

        autoSave();
    }, [image, fullText, navigate]);

    const handleTextChange = (value) => {
        setExtractedText(value);
    };


    const handleStartOver = () => {
        navigate('/');
    };

    if (!image) return null;

    return (
        <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] font-sans pb-16 relative">
            {/* Top Border Line */}
            <div className="w-full h-[1px] bg-stone-300" />

            <div className="w-full max-w-7xl mx-auto px-6 py-10 sm:py-16">
                {/* Combined Grid Spread */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-10">
                    
                    {/* Left Column: Image Gallery Frame (lg:col-span-7) */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="bg-white border border-[#1C1917] p-4 shadow-sm relative">
                            {/* Accent badge */}
                            <div className="absolute top-0 left-6 -translate-y-1/2 bg-[#1C1917] text-[#FAF8F5] px-3 py-0.5 text-[9px] font-mono tracking-widest uppercase">
                                Image
                            </div>
                            
                            <div className="border border-stone-100 overflow-hidden bg-stone-50">
                                <img 
                                    src={image} 
                                    alt="Captured document source" 
                                    className="w-full h-auto object-contain mx-auto max-h-[65vh]" 
                                />
                            </div>
                        </div>

                        {/* Image Metadata Ledger */}
                        <div className="border border-stone-200 bg-white p-4 font-mono text-[11px] text-stone-600 space-y-2">
                            <div className="flex justify-between border-b border-stone-100 pb-1.5">
                                <span>METADATA FIELD</span>
                                <span className="text-[#1C1917] font-semibold">RECORD VALUE</span>
                            </div>
                            <div className="flex justify-between border-b border-stone-100 py-1">
                                <span className="text-stone-400">SOURCE</span>
                                <span className="text-stone-700">IMAGE</span>
                            </div>
                            <div className="flex justify-between border-b border-stone-100 py-1">
                                <span className="text-stone-400">CAPTURED AT</span>
                                <span className="text-stone-700">{new Date().toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Ledger Textarea (lg:col-span-5) */}
                    <div className="lg:col-span-5">
                        <div className="bg-white border border-[#1C1917] p-6 shadow-sm relative h-full flex flex-col justify-between">
                            {/* Accent badge */}
                            <div className="absolute top-0 left-6 -translate-y-1/2 bg-[#1C1917] text-[#FAF8F5] px-3 py-0.5 text-[9px] font-mono tracking-widest uppercase">
                                Extracted Text
                            </div>

                            <div className="space-y-4 flex-grow flex flex-col">
                                <div className="border-b border-stone-200 pb-2">
                                    <h3 className="font-serif italic text-stone-700 text-base">
                                        Full Text
                                    </h3>
                                </div>

                                <div className="flex-grow relative flex flex-col">
                                    <textarea
                                        value={extractedText}
                                        onChange={(e) => handleTextChange(e.target.value)}
                                        className="w-full flex-grow min-h-[350px] lg:min-h-[420px] p-4 bg-[#FAF6F0] border border-stone-300 text-stone-800 font-mono text-xs focus:outline-none focus:border-[#1C1917] transition-all resize-none ruled-paper"
                                        placeholder="Extracted text will appear here"
                                    />
                                </div>

                                {/* Auto-save Status */}
                                {saveStatus && (
                                    <div className={`w-full py-2.5 px-4 font-mono text-[10px] tracking-wider uppercase text-center border transition-all duration-300 ${
                                        saveStatus === 'success'
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                            : 'bg-red-50 border-red-200 text-red-800'
                                    }`}>
                                        {saveStatus === 'success' ? (
                                            <span className="flex items-center justify-center gap-1.5">
                                                ✓ Auto-Saved to Sheets!
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-1.5">
                                                ✕ Auto-save Failed
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={handleStartOver}
                        className="px-8 py-3.5 bg-[#1C1917] hover:bg-stone-800 text-[#FAF8F5] font-sans font-medium uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                        <span className="text-sm font-light">←</span>
                        Capture New Image
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OCRResults;
