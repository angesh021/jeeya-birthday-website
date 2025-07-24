
import { createClient, type RedisClientType } from 'redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// --- Vercel Storage Configuration Guide ---
// This function connects to Vercel Redis for storing wishes.
// It relies on the REDIS_URL environment variable, which is AUTOMATICALLY set when you
// link a Redis store to your project in the Vercel Dashboard.
//
// TROUBLESHOOTING:
// - If you get errors, go to your project's "Storage" tab on Vercel and ensure Redis is linked.
// - For local development, you MUST use the `vercel dev` command to load this variable.

const WISHES_KEY = 'wishes';

// It's a good practice to have a single client instance for a serverless function instance.
let redis: RedisClientType | undefined;

async function getRedisClient() {
    if (!process.env.REDIS_URL) {
        throw new Error('REDIS_URL environment variable is not set. Please link Vercel Redis to your project.');
    }
    if (!redis) {
       redis = createClient({
            url: process.env.REDIS_URL,
        });
       // Optional: Log errors for debugging
       redis.on('error', (err) => console.error('Redis Client Error', err));
    }
    if (!redis.isOpen) {
        // This will connect the client if it's not already connected.
        await redis.connect();
    }
    return redis;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!process.env.REDIS_URL) {
        const errorMessage = 'Redis storage is not configured. The `REDIS_URL` environment variable is missing. Please link a Vercel Redis store to your project.';
        console.error(errorMessage);
        return res.status(500).json({ error: errorMessage });
    }

    try {
        const redisClient = await getRedisClient();

        if (req.method === 'GET') {
            // Fetch wish IDs from a sorted set, newest first
            const wishIds = await redisClient.zRange(WISHES_KEY, 0, -1, { REV: true });
            
            if (wishIds.length === 0) {
                return res.status(200).json([]);
            }
            
            // Use a pipeline to fetch all wish data efficiently
            const multi = redisClient.multi();
            wishIds.forEach(id => multi.hGetAll(`wish:${id}`));
            const wishesData = (await multi.exec()) as unknown as Record<string, string>[];

            // hGetAll returns string values, so parse createdAt back to a number.
            const validWishes = wishesData
                .filter(wish => wish && Object.keys(wish).length > 0)
                .map(wish => ({
                    ...wish,
                    createdAt: wish.createdAt ? parseInt(wish.createdAt, 10) : 0,
                    likes: wish.likes ? parseInt(wish.likes, 10) : 0,
                }));

            return res.status(200).json(validWishes);
        }

        if (req.method === 'POST') {
            const { name, message } = req.body;
            if (!name || !message || typeof name !== 'string' || typeof message !== 'string') {
                return res.status(400).json({ error: 'Name and message are required and must be strings.' });
            }

            const createdAt = Date.now();
            const id = `${createdAt}-${Math.random().toString(36).slice(2)}`;
            
            // Data to be stored in Redis. All values in a hash should be strings.
            const wishToStore = { 
                id, 
                name, 
                message, 
                createdAt: createdAt.toString(),
                likes: '0',
            };
            
            // Data to be returned to the client.
            const wishToReturn = {
                ...wishToStore,
                createdAt, // return as a number
                likes: 0,
            }

            const multi = redisClient.multi();
            multi.hSet(`wish:${id}`, wishToStore);
            multi.zAdd(WISHES_KEY, { score: createdAt, value: id });
            await multi.exec();

            return res.status(201).json(wishToReturn);
        }

        if (req.method === 'PATCH') {
            const { id } = req.query;
            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: 'A wish ID is required.' });
            }

            const newLikes = await redisClient.hIncrBy(`wish:${id}`, 'likes', 1);

            return res.status(200).json({ likes: newLikes });
        }


        res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    } catch (error) {
        console.error('Wishes API Redis Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return res.status(500).json({ error: `Could not access wish storage. ${errorMessage}` });
    }
}
