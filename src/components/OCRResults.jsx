import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const OCRResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { image1, image2, text1, text2 } = location.state || {};

    // State for merged data
    const [mergedData, setMergedData] = useState({});
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
    const hasSaved = useRef(false); // Track if we've already saved

    // Parse and merge JSON on mount
    useEffect(() => {
        if (!image1 || !image2) {
            navigate('/');
            return;
        }

        const parseData = (text) => {
            try {
                return JSON.parse(text);
            } catch (e) {
                console.warn('Failed to parse JSON, using raw text', e);
                return {};
            }
        };

        const data1 = parseData(text1);
        const data2 = parseData(text2);

        // Clean phone number by removing spaces
        const cleanPhone = (phone) => {
            return phone ? phone.replace(/\s+/g, '') : '';
        };

        // Merge strategy: prefer non-empty values
        const merged = {
            name: data1.name || data2.name || '',
            jobTitle: data1.jobTitle || data2.jobTitle || '',
            company: data1.company || data2.company || '',
            email: data1.email || data2.email || '',
            phone: cleanPhone(data1.phone || data2.phone || ''),
            website: data1.website || data2.website || '',
            address: data1.address || data2.address || ''
        };

        setMergedData(merged);

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
                // Step 1: Upload images to Cloudinary
                console.log('Uploading images to Cloudinary...');
                const { uploadImagesToCloudinary } = await import('../services/cloudinaryService.js');

                const timestamp = Date.now();
                const imageUrls = await uploadImagesToCloudinary([
                    { dataUrl: image1, fileName: `card_front_${timestamp}` },
                    { dataUrl: image2, fileName: `card_back_${timestamp}` }
                ]);

                console.log('Images uploaded:', imageUrls);

                // Step 2: Save to Sheets with image URLs
                await fetch(scriptUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...merged,
                        imageUrl1: imageUrls[0],
                        imageUrl2: imageUrls[1]
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
    }, [image1, image2, text1, text2, navigate]);

    const handleInputChange = (field, value) => {
        setMergedData(prev => ({ ...prev, [field]: value }));
    };

    const handleStartOver = () => {
        navigate('/');
    };

    const fields = [
        { key: 'name', label: 'Name' },
        { key: 'jobTitle', label: 'Job Title' },
        { key: 'company', label: 'Company' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'website', label: 'Website' },
        { key: 'address', label: 'Address' }
    ];

    if (!image1 || !image2) return null;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-7xl">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">
                        OCR Results
                    </h1>
                    <p className="text-green-300 text-lg sm:text-xl">
                        Review your extracted data
                    </p>
                </div>

                {/* Combined Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
                    {/* Image Previews Side by Side */}
                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                        {/* Image 1 */}
                        <div className="relative">
                            <div className="absolute -top-3 left-4 z-10">
                                <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-xs font-bold shadow-lg">
                                    Front
                                </span>
                            </div>
                            <div className="p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
                                <div className="rounded-xl overflow-hidden border-2 border-green-500/30">
                                    <img src={image1} alt="Front" className="w-full h-auto object-cover" />
                                </div>
                            </div>
                        </div>

                        {/* Image 2 */}
                        <div className="relative">
                            <div className="absolute -top-3 left-4 z-10">
                                <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-xs font-bold shadow-lg">
                                    Back
                                </span>
                            </div>
                            <div className="p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
                                <div className="rounded-xl overflow-hidden border-2 border-green-500/30">
                                    <img src={image2} alt="Back" className="w-full h-auto object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Merged Form */}
                    <div className="lg:col-span-1">
                        <div className="relative">
                            <div className="absolute -top-3 left-4 z-10">
                                <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-bold shadow-lg">
                                    Combined Data
                                </span>
                            </div>
                            <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
                                <div className="space-y-4">
                                    {fields.map(({ key, label }) => (
                                        <div key={key}>
                                            <label className="block text-xs font-medium text-green-300/70 mb-1 uppercase tracking-wider">
                                                {label}
                                            </label>
                                            <input
                                                type="text"
                                                value={mergedData[key] || ''}
                                                onChange={(e) => handleInputChange(key, e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-black/20 border border-green-500/20 text-white placeholder-green-500/20 focus:outline-none focus:border-green-500/50 transition-all text-sm"
                                                placeholder={`Enter ${label.toLowerCase()}`}
                                            />
                                        </div>
                                    ))}

                                    {/* Auto-save Status */}
                                    {saveStatus && (
                                        <div className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${saveStatus === 'success'
                                                ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                                                : 'bg-red-500/20 border border-red-500/50 text-red-300'
                                            }`}>
                                            {saveStatus === 'success' ? (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Auto-Saved to Sheets!
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Auto-save Failed
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={handleStartOver}
                        className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-3"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Capture New Images
                    </button>
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center text-green-400/60 text-sm">
                    <p>✨ Powered by Google Gemini AI</p>
                </div>
            </div>
        </div>
    );
};

export default OCRResults;
