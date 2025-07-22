
import { put, list } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define interface locally to avoid path resolution issues in serverless env
interface Photo {
  id: string;
  url: string;
  author: string;
}

// Interface for internal use to help with sorting
interface PhotoWithDate extends Photo {
  uploadedAt: Date;
}

const AUTHOR_SEPARATOR = '---';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({ error: 'Storage not configured on the server. Please set the BLOB_READ_WRITE_TOKEN environment variable.' });
    }

    if (req.method === 'GET') {
        try {
            const { blobs } = await list();
            
            const photos: Photo[] = blobs
                .map((blob): PhotoWithDate | null => {
                    const parts = blob.pathname.split(AUTHOR_SEPARATOR);
                    if (parts.length < 2) return null; // Invalid filename format, skip
                    
                    const authorEncoded = parts[0];
                    const author = decodeURIComponent(authorEncoded.replace(/_/g, ' '));
                    
                    return {
                        id: blob.url,
                        url: blob.url,
                        author: author || 'Anonymous',
                        uploadedAt: blob.uploadedAt,
                    };
                })
                .filter((p): p is PhotoWithDate => p !== null)
                .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()) // Sort by newest first
                .map(({ uploadedAt, ...rest }) => rest); // Remove uploadedAt before sending
            
            return res.status(200).json(photos);

        } catch (error) {
            console.error('Error listing photos:', error);
            const errorMessage = error instanceof Error ? `Failed to retrieve photos: ${error.message}` : 'An unknown error occurred while fetching photos.';
            return res.status(500).json({ error: errorMessage });
        }
    }

    if (req.method === 'POST') {
        const { url: dataUrl, author } = req.body;
        if (!dataUrl || !author) {
            return res.status(400).json({ error: 'Photo data URL and author are required.' });
        }

        try {
            const fileType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
            const extension = fileType.split('/')[1] || 'jpeg';
            const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            
            // Sanitize author for filename and use '---' as a separator to store metadata in the path
            const safeAuthor = encodeURIComponent(author.trim().replace(/ /g, '_'));
            const pathname = `${safeAuthor}${AUTHOR_SEPARATOR}${Date.now()}.${extension}`;

            const blob = await put(pathname, buffer, {
                access: 'public',
                contentType: fileType,
            });

            const newPhoto: Photo = {
                id: blob.url,
                url: blob.url,
                author,
            };
            
            return res.status(201).json(newPhoto);

        } catch (error) {
            console.error('Error uploading photo:', error);
            const errorMessage = error instanceof Error ? `Upload to Vercel Storage failed: ${error.message}` : 'An unknown error occurred during upload.';
            return res.status(500).json({ error: errorMessage });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}