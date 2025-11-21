import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageCapture from './components/ImageCapture';
import { extractTextFromImages } from './services/geminiService';
import './App.css';

function App() {
  const navigate = useNavigate();
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCaptureImage1 = (imageData) => {
    setImage1(imageData);
    setCurrentStep(2);
  };

  const handleCaptureImage2 = (imageData) => {
    setImage2(imageData);
  };

  const handleProcessImages = async () => {
    if (!image1 || !image2) return;

    setIsProcessing(true);
    try {
      const [text1, text2] = await extractTextFromImages([image1, image2]);
      navigate('/results', {
        state: {
          image1,
          image2,
          text1,
          text2
        }
      });
    } catch (error) {
      console.error('OCR Failed:', error);
      alert(error.message || 'Failed to extract text from images');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const handleRetakeImage1 = () => {
    setImage1(null);
    if (!image2) {
      setCurrentStep(1);
    }
  };

  const handleRetakeImage2 = () => {
    setImage2(null);
    setCurrentStep(2);
  };

  const handleResetAll = () => {
    setImage1(null);
    setImage2(null);
    setCurrentStep(1);
  };

  const bothImagesCaptured = image1 && image2;

  return <div className="min-h-screen relative overflow-hidden">
    {/* Header with Buttons - Responsive */}
    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 flex flex-col sm:flex-row gap-2">
      <button
        onClick={() => window.open(import.meta.env.VITE_GOOGLE_SHEETS_URL, '_blank')}
        className="px-3 py-2 sm:px-4 sm:py-2 backdrop-blur-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg font-medium shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 text-xs sm:text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="hidden sm:inline">View Sheets</span>
        <span className="sm:hidden">Sheets</span>
      </button>
      <button
        onClick={handleLogout}
        className="px-3 py-2 sm:px-4 sm:py-2 backdrop-blur-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg font-medium shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 text-xs sm:text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    </div>

    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
          Image Capture Studio
        </h1>
        <p className="text-purple-300 text-lg sm:text-xl">
          Capture two high-quality images with ease
        </p>

        {/* Progress Indicator */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${currentStep === 1 ? 'bg-purple-600 shadow-lg shadow-purple-500/50 scale-110' : image1 ? 'bg-green-600' : 'bg-gray-700'
            }`}>
            {image1 ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="w-5 h-5 flex items-center justify-center font-bold">1</span>
            )}
            <span className="font-semibold">Image 1</span>
          </div>

          <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />

          <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${currentStep === 2 ? 'bg-purple-600 shadow-lg shadow-purple-500/50 scale-110' : image2 ? 'bg-green-600' : 'bg-gray-700'
            }`}>
            {image2 ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="w-5 h-5 flex items-center justify-center font-bold">2</span>
            )}
            <span className="font-semibold">Image 2</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Image 1 Capture */}
        <div className="relative">
          <div className="absolute -top-3 left-4 z-10">
            <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-bold shadow-lg">
              Image 1
            </span>
          </div>
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
            <ImageCapture
              imageNumber={1}
              onCapture={handleCaptureImage1}
              capturedImage={image1}
              onRetake={handleRetakeImage1}
            />
          </div>
        </div>

        {/* Image 2 Capture */}
        <div className="relative">
          <div className="absolute -top-3 left-4 z-10">
            <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-bold shadow-lg">
              Image 2
            </span>
          </div>
          <div className={`p-6 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl transition-all duration-500 ${!image1 ? 'opacity-50 pointer-events-none scale-95' : 'opacity-100 scale-100'
            }`}>
            {!image1 ? (
              <div className="aspect-video flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-purple-500/30 rounded-2xl">
                <svg className="w-20 h-20 text-purple-400/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-purple-400/70 text-lg font-semibold">
                  Capture Image 1 first
                </p>
              </div>
            ) : (
              <ImageCapture
                imageNumber={2}
                onCapture={handleCaptureImage2}
                capturedImage={image2}
                onRetake={handleRetakeImage2}
              />
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {bothImagesCaptured && (
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
          <button
            onClick={handleResetAll}
            disabled={isProcessing}
            className={`group px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-3 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset All
          </button>

          <button
            onClick={handleProcessImages}
            disabled={isProcessing}
            className={`px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-3 ${isProcessing ? 'animate-pulse cursor-wait' : ''}`}
          >
            {isProcessing ? (
              <>
                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Process Images
              </>
            )}
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-12 text-center text-purple-400/60 text-sm">
        <p>✨ Built with React & Tailwind CSS</p>
      </div>
    </div>
  </div>
  );
}

export default App;
