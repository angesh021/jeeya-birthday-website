
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'buffer';

const PHOTOS_ZSET_KEY = 'photos_by_date';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;

    if (!blobToken || !kvUrl || !kvToken) {
        return res.status(500).json({ error: 'Storage services are not configured. Please link Vercel Blob and KV to your project in the Vercel dashboard and ensure environment variables are set.' });
    }

    if (req.method === 'GET') {
        try {
            const photoIds = await kv.zrange<string[]>(PHOTOS_ZSET_KEY, 0, -1, { rev: true });
            if (photoIds.length === 0) {
                return res.status(200).json([]);
            }
            
            const pipeline = kv.pipeline();
            photoIds.forEach(id => pipeline.hgetall(`photo:${id}`));
            const photosData = await pipeline.exec();
            
            const validPhotos = photosData.filter(photo => photo !== null);

            return res.status(200).json(validPhotos);

        } catch (error) {
            console.error('Error listing photos from KV:', error);
            return res.status(500).json({ error: 'Failed to retrieve photos.' });
        }
    }

    if (req.method === 'POST') {
        const { url: dataUrl, author, description } = req.body;
        if (!dataUrl || !author) {
            return res.status(400).json({ error: 'Photo data URL and author are required.' });
        }

        try {
            // 1. Upload image to Vercel Blob
            const fileType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
            const extension = fileType.split('/')[1] || 'jpeg';
            const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            const pathname = `photogallery/${Date.now()}.${extension}`;

            const blob = await put(pathname, buffer, {
                access: 'public',
                contentType: fileType,
            });

            // 2. Store metadata in Vercel KV
            const photoData = {
                id: blob.url,
                url: blob.url,
                author,
                description: description || '', // Ensure description is a string
                uploadedAt: new Date().toISOString(),
            };

            const pipeline = kv.pipeline();
            pipeline.hset(`photo:${blob.url}`, photoData);
            pipeline.zadd(PHOTOS_ZSET_KEY, { score: Date.now(), member: blob.url });
            await pipeline.exec();
            
            return res.status(201).json(photoData);

        } catch (error) {
            console.error('Error uploading photo or saving metadata:', error);
            const errorMessage = error instanceof Error ? `Operation failed: ${error.message}` : 'An unknown error occurred.';
            return res.status(500).json({ error: errorMessage });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}