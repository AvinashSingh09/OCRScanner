import { useRef, useEffect, useState } from 'react';

const ImageCapture = ({ imageNumber, onCapture, capturedImage, onRetake }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState(null);
    const [showFlash, setShowFlash] = useState(false);

    useEffect(() => {
        if (!capturedImage) {
            startCamera();
        }

        return () => {
            stopCamera();
        };
    }, [capturedImage]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
                setError(null);
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('Camera access denied. Please allow camera permissions.');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsStreaming(false);
        }
    };

    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const imageData = canvas.toDataURL('image/png');

        // Show flash effect
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 200);

        // Stop camera and call parent callback
        stopCamera();
        onCapture(imageData);
    };

    const handleRetake = () => {
        onRetake();
        startCamera();
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
                {error ? (
                    <div className="w-full aspect-video flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-red-500/20 to-pink-500/20">
                        <svg className="w-20 h-20 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-red-300 mb-4 text-lg">{error}</p>
                        <button
                            onClick={startCamera}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-auto object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Flash effect */}
                        {showFlash && (
                            <div className="absolute inset-0 bg-white animate-pulse" />
                        )}

                        {/* Camera overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-purple-400 rounded-tl-2xl" />
                            <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-purple-400 rounded-tr-2xl" />
                            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-purple-400 rounded-bl-2xl" />
                            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-purple-400 rounded-br-2xl" />
                        </div>
                    </>
                )}
            </div>

            {isStreaming && !error && (
                <div className="mt-6 flex flex-col items-center space-y-4">
                    <button
                        onClick={captureImage}
                        className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Capture Image {imageNumber}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                    <p className="text-purple-300 text-sm">Position yourself in the frame</p>
                </div>
            )}
        </div>
    );
};

export default ImageCapture;
