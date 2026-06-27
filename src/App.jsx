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
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] font-sans pb-16 relative">
      {/* Top Thin Border Line */}
      <div className="w-full h-[1px] bg-stone-300" />

      <div className="w-full max-w-5xl mx-auto px-6 py-10 sm:py-16">
        {/* Info Column & Section Detail */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4 space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-sm font-mono tracking-widest uppercase text-stone-600 mb-2">
                Instructions
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed font-serif">
                Select or capture a clear, high-quality image. The picture will be analyzed and all text content will be extracted automatically.
              </p>
            </div>

            {/* Steps & Progress */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-stone-200 py-2">
                <span className="text-stone-400">1. CAPTURE IMAGE</span>
                <span className={`px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase ${image ? 'bg-stone-200 text-stone-800' : 'bg-[#1C1917] text-[#FAF8F5]'}`}>
                  {image ? 'Completed' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-200 py-2">
                <span className="text-stone-400">2. EXTRACT TEXT</span>
                <span className="text-stone-400">WAITING</span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-200 py-2">
                <span className="text-stone-400">3. SAVE TO SHEETS</span>
                <span className="text-stone-400">WAITING</span>
              </div>
            </div>
          </div>

          {/* Main Ingest Area */}
          <div className="md:col-span-8">
            <div className="bg-white border border-[#1C1917] p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(28,25,23,0.06)] relative">
              {/* Corner Accent Label */}
              <div className="absolute top-0 left-6 -translate-y-1/2 bg-[#1C1917] text-[#FAF8F5] px-4 py-1 text-[10px] font-mono tracking-widest uppercase">
                Image
              </div>

              <div className="mt-2">
                <ImageCapture
                  onCapture={handleCaptureImage}
                  capturedImage={image}
                  onRetake={handleRetakeImage}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {image && (
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end items-stretch sm:items-center animate-fade-in">
                <button
                  onClick={handleResetAll}
                  disabled={isProcessing}
                  className={`px-6 py-3.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-mono tracking-widest uppercase text-xs transition-colors flex items-center justify-center gap-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset All
                </button>

                <button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className={`px-8 py-3.5 bg-[#1C1917] hover:bg-stone-800 text-[#FAF8F5] font-sans font-medium uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 ${isProcessing ? 'animate-pulse cursor-wait' : 'cursor-pointer shadow-sm'}`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Process Image
                      <span className="text-sm font-light">→</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Buttons */}
        <div className="mt-16 md:mt-24 border-t border-stone-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => window.open(import.meta.env.VITE_GOOGLE_SHEETS_URL, '_blank')}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 font-mono text-[10px] tracking-wider uppercase transition-colors duration-200 cursor-pointer"
            >
              View Sheets
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-stone-300 hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-stone-700 font-mono text-[10px] tracking-wider uppercase transition-colors duration-200 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
