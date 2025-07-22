
const getApiBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:3000';
    }
    return '';
};

const API_BASE = getApiBaseUrl();

export const generateBirthdayPoem = async (keyword: string): Promise<string> => {
    const response = await fetch(`${API_BASE}/api/poem`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred' }));
        throw new Error(errorData.error || 'Failed to generate poem');
    }

    const data = await response.json();
    return data.poem;
};
