import { GoogleGenerativeAI, Part } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(API_KEY || ''); // Allow initialization with empty key for graceful error handling

async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: (await base64EncodedDataPromise).split(',')[1],
      mimeType: file.type
    }
  };
}

export async function chatWithGemini(message: string, imageFile?: File): Promise<string> {
  if (!API_KEY) {
    throw new Error('Missing Gemini API key. Please add VITE_GEMINI_API_KEY to your .env file');
  }

  if (!message.trim()) {
    throw new Error('Message cannot be empty');
  }

  try {
    if (imageFile) {
      // For image and text input, use the gemini-pro-vision model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const imagePart = await fileToGenerativePart(imageFile);
      const result = await model.generateContent([message, imagePart]);
      const response = await result.response;
      return response.text();
    } else {
      // For text-only input, use the gemini-pro model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`Hey bestie! Gue mau lu jawab pake bahasa gaul jaksel ya. Jadi lu harus sering pake kata-kata kek 'literally', 'basically', 'which is', 'I mean', 'somehow', 'end up', 'prefer', dan kata-kata inggris yang di mix sama bahasa indonesia. Terus juga jangan lupa pake 'sih', 'dong', 'deh', 'tuh'. Intinya lu harus ngomong kayak anak jaksel banget yang super casual dan friendly. Okay? Here's what they asked: ${message}`);
      const response = await result.response;
      return response.text();
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    if (error instanceof Error) {
      // Pass through the error message
      throw error;
    }
    
    throw new Error('An unexpected error occurred while communicating with Gemini');
  }
}