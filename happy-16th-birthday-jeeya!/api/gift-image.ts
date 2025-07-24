
import type { VercelRequest, VercelResponse } from '@vercel/node';

// This API is no longer used as the gift feature has been simplified to a static display.
export default function handler(req: VercelRequest, res: VercelResponse) {
    res.status(404).json({ error: 'This feature is no longer available.' });
}
