import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
  console.warn('⚠️ Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
}

const genAI = API_KEY && API_KEY !== 'your_gemini_api_key_here'
  ? new GoogleGenerativeAI(API_KEY)
  : null;

/**
 * Extract text from an image using Gemini Vision API
 * @param {string} imageDataUrl - Base64 encoded image data URL
 * @returns {Promise<string>} Extracted text from the image (JSON string)
 */
export async function extractTextFromImage(imageDataUrl) {
  if (!genAI) {
    throw new Error(
      'Gemini API key is not configured. Please add your API key to the .env file.\n' +
      'Get your API key from: https://aistudio.google.com/app/apikey'
    );
  }

  try {
    // List of models to try in order of preference
    const modelsToTry = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-flash-latest'];

    let lastError = null;

    // Convert data URL to the format Gemini expects
    const base64Data = imageDataUrl.split(',')[1];
    const mimeType = imageDataUrl.split(';')[0].split(':')[1];

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const prompt = `Extract business card details from this image. Return ONLY a valid JSON object with the following fields:
    - name (string): Full name of the person
    - jobTitle (string): Job title or position
    - company (string): Company name
    - email (string): Email address
    - phone (string): Phone number
    - website (string): Website URL
    - address (string): Physical address
    - fullText (string): All text found on the card
    
    If a field is not found, use an empty string. Do not include markdown formatting (like \`\`\`json) in the response.`;

    // Try each model until one works
    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting OCR with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Validate JSON
        try {
          JSON.parse(text);
          return text; // Return the JSON string
        } catch (e) {
          console.warn('Failed to parse JSON from model response, returning raw text wrapped in JSON structure');
          // Fallback: wrap raw text in a basic structure if JSON parsing fails
          return JSON.stringify({
            name: '',
            jobTitle: '',
            company: '',
            email: '',
            phone: '',
            website: '',
            address: '',
            fullText: text
          });
        }
      } catch (error) {
        console.warn(`Failed with model ${modelName}:`, error.message);
        lastError = error;

        // If it's not a 404 (Not Found), it might be a permission/quota issue, so we shouldn't just skip it
        // unless we want to be very aggressive. For now, we'll continue on 404s.
        if (!error.message.includes('404') && !error.message.includes('not found')) {
          throw error;
        }
      }
    }

    // If we get here, all models failed
    if (lastError) throw lastError;
    throw new Error('Failed to extract text with all available models.');

  } catch (error) {
    console.error('Error extracting text from image:', error);

    // Provide more specific error messages
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Gemini API key. Please check your API key in the .env file.');
    } else if (error.message?.includes('API_KEY_IP_ADDRESS_BLOCKED') || error.message?.includes('violates this restriction')) {
      throw new Error('API Key IP Restriction: Your API key is restricted to specific IP addresses. Please update your API key settings in Google AI Studio/Cloud Console to allow your current IP.');
    } else if (error.message?.includes('404') && error.message?.includes('not found')) {
      throw new Error('Model not found. This usually means the specific Gemini model version is not available for your API key or region. Please try using a different model.');
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      throw new Error('Permission denied. Please ensure your API key has the necessary permissions.');
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('API quota exceeded. Please check your Gemini API usage limits.');
    } else {
      throw new Error(`Failed to extract text: ${error.message || 'Unknown error occurred'}`);
    }
  }
}

/**
 * Extract text from multiple images
 * @param {string[]} imageDataUrls - Array of base64 encoded image data URLs
 * @returns {Promise<string[]>} Array of extracted texts
 */
export async function extractTextFromImages(imageDataUrls) {
  const promises = imageDataUrls.map(imageUrl => extractTextFromImage(imageUrl));
  return Promise.all(promises);
}
