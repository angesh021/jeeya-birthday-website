
export interface GiftFeature {
    name: string;
    description: string;
}

export interface GiftConcept {
    name: string;
    description: string;
    features: GiftFeature[];
}

const getApiBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:3000';
    }
    return '';
};

const API_BASE = getApiBaseUrl();

export const getGiftConcept = async (): Promise<GiftConcept> => {
    const response = await fetch(`${API_BASE}/api/gift`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Could not get gift concept.');
    }
    return response.json();
};

export const getGiftImage = async (prompt: string): Promise<{ imageUrl: string }> => {
    const response = await fetch(`${API_BASE}/api/gift-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Could not generate gift image.');
    }
    return response.json();
};
