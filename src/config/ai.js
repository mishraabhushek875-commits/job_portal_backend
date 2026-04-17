import { GoogleGenerativeAI } from '@google/generative-ai';

const getGeminiModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing hai .env mein");
  }

  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genai.getGenerativeModel({ model: 'gemini-2.0-flash' });
};

export default getGeminiModel;