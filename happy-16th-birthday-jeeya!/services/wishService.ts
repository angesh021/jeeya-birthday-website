
import type { Wish } from '../constants.tsx';

const getApiBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:3000';
    }
    return '';
};

const API_BASE = getApiBaseUrl();

export const getWishes = async (): Promise<Wish[]> => {
    const response = await fetch(`${API_BASE}/api/wishes`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Could not load wishes.');
    }
    return response.json();
};

export const addWish = async (wishData: { name: string; message: string }): Promise<Wish> => {
    const response = await fetch(`${API_BASE}/api/wishes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(wishData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Could not send your wish.');
    }
    return response.json();
};

export const likeWish = async (id: string): Promise<{ likes: number }> => {
    const response = await fetch(`${API_BASE}/api/wishes?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Could not like the wish.');
    }
    return response.json();
}
