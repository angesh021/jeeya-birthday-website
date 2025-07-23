
import { GoogleGenAI, Type } from "@google/genai";
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const GIFT_KEY = 'gift:jeeya-sweet-16';

const giftSchema = {
    type: Type.OBJECT,
    properties: {
        name: {
            type: Type.STRING,
            description: "A cool, catchy name for a futuristic, magical gift. e.g., 'The Dreamweaver Locket'."
        },
        description: {
            type: Type.STRING,
            description: "A one-sentence, exciting description of the gift. e.g., 'A device that captures your dreams and turns them into holographic art'."
        },
        features: {
            type: Type.ARRAY,
            description: "A list of 3-4 fantastical features of the gift.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the feature." },
                    description: { type: Type.STRING, description: "A brief, magical explanation of what the feature does." }
                },
                required: ["name", "description"]
            }
        },
    },
    required: ["name", "description", "features"]
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.API_KEY || !process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        return res.status(500).json({ error: 'Server configuration is incomplete. API key or KV storage is missing.' });
    }

    try {
        // 1. Check if gift concept already exists in KV
        const storedGift = await kv.get(GIFT_KEY);
        if (storedGift) {
            return res.status(200).json(storedGift);
        }

        // 2. If not, generate a new gift concept with Gemini
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Invent a unique, futuristic, and magical tech gift for a creative and smart person named Jeeya who is celebrating her 16th birthday. It should be something that inspires wonder and creativity. Provide a name, a short description, and a list of 3-4 amazing features.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.9,
                responseMimeType: "application/json",
                responseSchema: giftSchema,
            }
        });

        const giftJsonText = response.text.trim();
        const newGift = JSON.parse(giftJsonText);
        
        // 3. Store the new gift concept in KV for future requests
        await kv.set(GIFT_KEY, newGift, { ex: 60 * 60 * 24 * 30 }); // Cache for 30 days
        
        return res.status(200).json(newGift);

    } catch (error) {
        console.error('Error in /api/gift:', error);
        return res.status(500).json({ error: 'Failed to conjure a gift. The magical workshop is busy.' });
    }
}
