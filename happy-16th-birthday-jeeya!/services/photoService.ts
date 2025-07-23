
import type { Photo } from '../constants.tsx';

const getApiBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:3000';
    }
    return '';
};

const API_BASE = getApiBaseUrl();

export const getPhotos = async (): Promise<Photo[]> => {
    const response = await fetch(`${API_BASE}/api/photos`);
    if (!response.ok) {
        console.error('Failed to fetch photos:', response.statusText);
        let errorMsg = 'Could not load the photo gallery. Please try again later.';
        try {
            const errorData = await response.json();
            if (errorData.error) {
                errorMsg = errorData.error;
            }
        } catch (e) {
            // Ignore if response is not JSON, use the default message.
        }
        throw new Error(errorMsg);
    }
    return response.json();
};

export const addPhoto = async (photoData: { url: string; author: string; description: string }): Promise<Photo> => {
    const response = await fetch(`${API_BASE}/api/photos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(photoData),
    });
    if (!response.ok) {
        console.error('Failed to add photo:', response.statusText);
        let errorMsg = 'Could not upload your memory. Please try again.';
        try {
            const errorData = await response.json();
            if (errorData.error) {
                errorMsg = errorData.error;
            }
        } catch (e) {
            // Ignore if response is not JSON, use the default message.
        }
        throw new Error(errorMsg);
    }
    return response.json();
};