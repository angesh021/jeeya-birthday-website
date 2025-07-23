
import { GoogleGenAI } from "@google/genai";
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'buffer';

const GIFT_IMAGE_KEY = 'gift-image:jeeya-sweet-16';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.API_KEY || !process.env.BLOB_READ_WRITE_TOKEN || !process.env.KV_REST_API_URL) {
        return res.status(500).json({ error: 'Server configuration is incomplete. API key, Blob, or KV storage is missing.' });
    }

    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'A prompt is required to generate an image.' });
    }

    try {
        // 1. Check if image URL already exists in KV
        const storedImageUrl = await kv.get<string>(GIFT_IMAGE_KEY);
        if (storedImageUrl) {
            return res.status(200).json({ imageUrl: storedImageUrl });
        }

        // 2. Generate image with Imagen
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const fullPrompt = `A sleek, professional product shot of the following item: "${prompt}". The item should look elegant, futuristic, and magical. It should be displayed on a clean, dark, ethereal background with soft, glowing particles. High-resolution, photorealistic, 8k.`;
        
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });
        
        const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
        if (!base64ImageBytes) {
            throw new Error('Image generation failed to return image data.');
        }

        // 3. Upload image to Vercel Blob
        const buffer = Buffer.from(base64ImageBytes, 'base64');
        const pathname = `gifts/jeeya-sweet-16-gift.jpeg`;

        const blob = await put(pathname, buffer, {
            access: 'public',
            contentType: 'image/jpeg',
        });

        // 4. Store Blob URL in KV
        await kv.set(GIFT_IMAGE_KEY, blob.url, { ex: 60 * 60 * 24 * 30 }); // Cache for 30 days

        return res.status(200).json({ imageUrl: blob.url });

    } catch (error) {
        console.error('Error in /api/gift-image:', error);
        return res.status(500).json({ error: 'Failed to illustrate the gift. The artist is on a break.' });
    }
}
