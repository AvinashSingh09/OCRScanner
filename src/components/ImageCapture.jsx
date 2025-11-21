import { useRef } from 'react';

const ImageCapture = ({ imageNumber, onCapture, capturedImage, onRetake }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onCapture(reader.result);
            };
            reader.readAsDataURL(file);
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
                <div className="relative overflow-hidden rounded-2xl border-2 border-purple-500/30 shadow-2xl backdrop-blur-sm bg-white/5">
                    <img
                        src={capturedImage}
                        alt={`Captured Image ${imageNumber}`}
                        className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button
                            onClick={handleRetake}
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
                        >
                            Retake Image {imageNumber}
                        </button>
                    </div>
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    ✓ Image {imageNumber}
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border-2 border-purple-500/50 shadow-2xl backdrop-blur-sm bg-white/5">
                {/* Camera placeholder */}
                <div className="w-full aspect-video flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <svg className="w-24 h-24 text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-purple-300 text-lg font-semibold mb-2">Ready to capture</p>
                    <p className="text-purple-400/70 text-sm">Click the button below to open camera</p>
                </div>

                {/* Camera overlay corners */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-purple-400 rounded-tl-2xl" />
                    <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-purple-400 rounded-tr-2xl" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-purple-400 rounded-bl-2xl" />
                    <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-purple-400 rounded-br-2xl" />
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
            <div className="mt-6 flex flex-col items-center space-y-4">
                <button
                    onClick={handleCaptureClick}
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Take Picture {imageNumber}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                <p className="text-purple-300 text-sm">Opens your device camera</p>
            </div>
        </div>
    );
};

export default ImageCapture;
