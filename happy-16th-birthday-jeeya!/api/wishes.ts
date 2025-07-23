
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const WISHES_KEY = 'wishes';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        return res.status(500).json({ error: 'KV storage is not configured. Please link Vercel KV to your project in the Vercel dashboard.' });
    }

    if (req.method === 'GET') {
        try {
            const wishIds = await kv.zrange<string[]>(WISHES_KEY, 0, -1, { rev: true });
            if (wishIds.length === 0) {
                return res.status(200).json([]);
            }
            
            const pipeline = kv.pipeline();
            wishIds.forEach(id => pipeline.hgetall(`wish:${id}`));
            const wishesData = await pipeline.exec();

            const validWishes = wishesData.filter(wish => wish !== null);

            return res.status(200).json(validWishes);
        } catch (error) {
            console.error('Error fetching wishes:', error);
            return res.status(500).json({ error: 'Could not retrieve wishes from storage.' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { name, message } = req.body;
            if (!name || !message || typeof name !== 'string' || typeof message !== 'string') {
                return res.status(400).json({ error: 'Name and message are required and must be strings.' });
            }

            const createdAt = Date.now();
            const id = `${createdAt}-${Math.random().toString(36).slice(2)}`;
            
            // Explicitly type `newWish` as a Record to match the `hset` function's expectation.
            const newWish: Record<string, string | number> = { 
                id, 
                name, 
                message, 
                createdAt 
            };

            const pipeline = kv.pipeline();
            pipeline.hset(`wish:${id}`, newWish);
            pipeline.zadd(WISHES_KEY, { score: createdAt, member: id });
            await pipeline.exec();

            return res.status(201).json(newWish);
        } catch (error) {
            console.error('Error adding wish:', error);
            return res.status(500).json({ error: 'Could not add your wish to storage.' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
