import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const OCRResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { image1, image2, text1, text2 } = location.state || {};
    const [copiedIndex, setCopiedIndex] = useState(null);

    // If no data, redirect back to capture
    if (!image1 || !image2) {
        navigate('/');
        return null;
    }

    const handleCopyText = async (text, index) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    const handleDownload = (text, imageNumber) => {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `extracted-text-${imageNumber}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleStartOver = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-7xl">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">
                        OCR Results
                    </h1>
                    <p className="text-green-300 text-lg sm:text-xl">
                        Text extracted from your images
                    </p>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
                    {/* Image 1 Results */}
                    <div className="relative">
                        <div className="absolute -top-3 left-4 z-10">
                            <span className="px-4 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-bold shadow-lg">
                                Image 1
                            </span>
                        </div>
                        <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
                            {/* Image Preview */}
                            <div className="mb-4 rounded-xl overflow-hidden border-2 border-green-500/30">
                                <img
                                    src={image1}
                                    alt="Captured Image 1"
                                    className="w-full h-auto object-cover"
                                />
                            </div>

                            {/* Extracted Text */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Extracted Text
                                </h3>
                                <div className="p-4 bg-black/30 rounded-xl border border-green-500/20 max-h-64 overflow-y-auto">
                                    <pre className="text-white/90 whitespace-pre-wrap text-sm font-mono">{text1}</pre>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleCopyText(text1, 1)}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        {copiedIndex === 1 ? (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                </svg>
                                                Copy
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDownload(text1, 1)}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image 2 Results */}
                    <div className="relative">
                        <div className="absolute -top-3 left-4 z-10">
                            <span className="px-4 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-bold shadow-lg">
                                Image 2
                            </span>
                        </div>
                        <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
                            {/* Image Preview */}
                            <div className="mb-4 rounded-xl overflow-hidden border-2 border-green-500/30">
                                <img
                                    src={image2}
                                    alt="Captured Image 2"
                                    className="w-full h-auto object-cover"
                                />
                            </div>

                            {/* Extracted Text */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Extracted Text
                                </h3>
                                <div className="p-4 bg-black/30 rounded-xl border border-green-500/20 max-h-64 overflow-y-auto">
                                    <pre className="text-white/90 whitespace-pre-wrap text-sm font-mono">{text2}</pre>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleCopyText(text2, 2)}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        {copiedIndex === 2 ? (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                </svg>
                                                Copy
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDownload(text2, 2)}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download
                                    </button>
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
