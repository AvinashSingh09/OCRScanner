import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageCapture from './components/ImageCapture';
import { extractTextFromImage } from './services/geminiService';
import './App.css';

function App() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCaptureImage = (imageData) => {
    setImage(imageData);
  };

  const handleProcessImage = async () => {
    if (!image) return;

    setIsProcessing(true);
    try {
      const fullText = await extractTextFromImage(image);
      navigate('/results', {
        state: {
          image,
          fullText
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

  const handleRetakeImage = () => {
    setImage(null);
  };

  const handleResetAll = () => {
    setImage(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            Image Capture Studio
          </h1>
          <p className="text-purple-300 text-lg sm:text-xl">
            Capture one high-quality image and save all extracted text
          </p>

          {/* Progress Indicator */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 backdrop-blur-xl border ${image ? 'bg-green-500/20 border-green-500/30 text-green-300' : 'bg-purple-500/30 border-purple-500/50 shadow-lg shadow-purple-500/50 scale-110 text-purple-200'
              }`}>
              {image ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="w-5 h-5 flex items-center justify-center font-bold">1</span>
              )}
              <span className="font-semibold">Image</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute -top-3 left-4 z-10">
              <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-bold shadow-lg">
                Image
              </span>
            </div>
            <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
              <ImageCapture
                onCapture={handleCaptureImage}
                capturedImage={image}
                onRetake={handleRetakeImage}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {image && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <button
              onClick={handleResetAll}
              disabled={isProcessing}
              className={`group px-8 py-4 backdrop-blur-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-3 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset All
            </button>

            <button
              onClick={handleProcessImage}
              disabled={isProcessing}
              className={`px-8 py-4 backdrop-blur-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-3 ${isProcessing ? 'animate-pulse cursor-wait' : ''}`}
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
                  Process Image
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer with Buttons */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => window.open(import.meta.env.VITE_GOOGLE_SHEETS_URL, '_blank')}
              className="px-4 py-2 backdrop-blur-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg font-medium shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Sheets
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 backdrop-blur-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg font-medium shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
          <p className="text-purple-400/60 text-sm">✨ Powered by Gemini AI</p>
        </div>
      </div>
    </div>
  );
}

export default App;
