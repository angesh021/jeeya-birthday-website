
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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
        const { author, description, filename } = req.query;
        const contentType = req.headers['content-type'];

        if (!author || !filename || !req.body || !contentType) {
            return res.status(400).json({ error: 'Author, filename, content-type header, and file body are required.' });
        }
        
        if (typeof author !== 'string' || typeof filename !== 'string') {
            return res.status(400).json({ error: 'Author and filename must be strings.' });
        }

        try {
            // 1. Upload image to Vercel Blob
            const uniqueFilename = `${Date.now()}-${filename}`;
            const pathname = `photogallery/${uniqueFilename}`;

            const blob = await put(pathname, req.body, {
                access: 'public',
                contentType: contentType,
            });

            // 2. Store metadata in Vercel KV
            const photoData = {
                id: blob.url,
                url: blob.url,
                author,
                description: (description as string) || '',
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
            if (errorMessage.toLowerCase().includes('not configured') || errorMessage.toLowerCase().includes('token')) {
                 return res.status(500).json({ error: `Storage operation failed. This usually means Vercel Blob is not correctly linked to your project or the BLOB_READ_WRITE_TOKEN is missing. Please check your project's integration settings on the Vercel dashboard.` });
            }
            return res.status(500).json({ error: errorMessage });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
