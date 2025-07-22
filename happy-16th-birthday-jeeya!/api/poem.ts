
import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { keyword } = req.body;

  if (!keyword || typeof keyword !== 'string') {
    return res.status(400).json({ error: 'Keyword is required and must be a string.' });
  }
  
  if (!process.env.API_KEY) {
      return res.status(500).json({ error: 'API key not configured on the server.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Write a beautiful, heartfelt, and uplifting short poem for a 16th birthday celebration for a person named Jeeya. The poem should be about the joy of turning sixteen, celebrating memories, and looking forward to the future with excitement. It should feel personal and magical. Incorporate the following theme or keyword: "${keyword}". The poem must be elegant, consisting of 3-4 short stanzas. Do not use any markdown formatting or titles.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            temperature: 0.8,
            topP: 1,
            topK: 1,
            // Disable thinking for a faster response to avoid serverless timeouts
            thinkingConfig: { thinkingBudget: 0 }
        }
    });

    const poemText = response.text;
    
    return res.status(200).json({ poem: poemText });

  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: 'Failed to generate poem. The magical ink seems to be dry!' });
  }
}