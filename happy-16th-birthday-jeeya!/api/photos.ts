
import { put } from '@vercel/blob';
import { createClient, type RedisClientType } from 'redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// --- Vercel Storage Configuration Guide ---
// This function connects to Vercel Blob for image storage and Vercel Redis for metadata.
// It relies on environment variables that are AUTOMATICALLY set when you link storage
// to your project in the Vercel Dashboard.
//
// 1. BLOB_READ_WRITE_TOKEN: Connects to your Blob store.
// 2. REDIS_URL: The connection string for your Redis store.
//
// TROUBLESHOOTING:
// - If you get errors, go to your project's "Storage" tab on Vercel and ensure both Blob and Redis are linked.
// - For local development, you MUST use the `vercel dev` command to load these variables.

// Disable Vercel's default body parser to handle raw file uploads.
export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper function to buffer the request body stream
async function buffer(readable: VercelRequest): Promise<Buffer> {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

const PHOTOS_ZSET_KEY = 'photos_by_date';

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
       redis.on('error', (err: Error) => console.error('Redis Client Error', err));
    }
    if (!redis.isOpen) {
        // This will connect the client if it's not already connected.
        await redis.connect();
    }
    return redis;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        const errorMessage = "Vercel Blob store not connected. The 'BLOB_READ_WRITE_TOKEN' environment variable is missing. Please link a Blob store to your project in the Vercel dashboard.";
        console.error(errorMessage);
        return res.status(500).json({ error: errorMessage });
    }
    if (!process.env.REDIS_URL) {
        const errorMessage = "Vercel Redis store not connected. The 'REDIS_URL' environment variable is missing. Please link a Redis store to your project in the Vercel dashboard.";
        console.error(errorMessage);
        return res.status(500).json({ error: errorMessage });
    }

    try {
        const redisClient = await getRedisClient();

        if (req.method === 'GET') {
            const photoIds = await redisClient.zRange(PHOTOS_ZSET_KEY, 0, -1, { REV: true });
            if (photoIds.length === 0) {
                return res.status(200).json([]);
            }
            
            const multi = redisClient.multi();
            photoIds.forEach((id: string) => multi.hGetAll(`photo:${id}`));
            const photosData = await multi.exec() as unknown as Record<string, string>[];
            
            const validPhotos = photosData.filter(photo => photo && Object.keys(photo).length > 0);

            return res.status(200).json(validPhotos);
        }

        if (req.method === 'POST') {
            const { author, description, filename } = req.query;
            const contentType = req.headers['content-type'];

            // User-facing validation
            if (!author || typeof author !== 'string' || author.trim() === '') {
                return res.status(400).json({ error: 'Your name is required to submit a memory.' });
            }
            if (!description || typeof description !== 'string' || description.trim() === '') {
                return res.status(400).json({ error: 'A description is required for the memory.' });
            }
            
            // Technical validation
            if (!filename || typeof filename !== 'string') {
                return res.status(400).json({ error: 'The image file must have a valid name.' });
            }
            if (!contentType) {
                return res.status(400).json({ error: 'The request is missing the required content-type header for the image.' });
            }
            
            const fileBody = await buffer(req);
            if (!fileBody || fileBody.length === 0) {
                return res.status(400).json({ error: 'No image file was received by the server.' });
            }

            // 1. Upload image to Vercel Blob
            const uniqueFilename = `${Date.now()}-${filename}`;
            const pathname = `photogallery/${uniqueFilename}`;

            const blob = await put(pathname, fileBody, {
                access: 'public',
                contentType: contentType,
            });

            // 2. Store metadata in Vercel KV (Redis)
            const photoData = {
                id: blob.url,
                url: blob.url,
                author,
                description,
                uploadedAt: new Date().toISOString(),
            };

            const multi = redisClient.multi();
            multi.hSet(`photo:${blob.url}`, photoData);
            multi.zAdd(PHOTOS_ZSET_KEY, { score: Date.now(), value: blob.url });
            await multi.exec();
            
            return res.status(201).json(photoData);
        }

        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    } catch (error) {
        console.error('Photos API Redis Error:', error);
        const errorMessage = error instanceof Error ? `Operation failed: ${error.message}` : 'An unknown error occurred.';
        if (errorMessage.toLowerCase().includes('token')) {
             return res.status(500).json({ error: `Storage operation failed. This usually means Vercel Blob is not correctly linked to your project or the BLOB_READ_WRITE_TOKEN is missing. Please check your project's integration settings on the Vercel dashboard.` });
        }
        return res.status(500).json({ error: `Could not access photo storage. ${errorMessage}` });
    }
}
