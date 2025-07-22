
import { useEffect, useRef } from 'react';

export const useFocusTrap = (ref: React.RefObject<HTMLElement>, isOpen: boolean) => {
    const firstFocusableElement = useRef<HTMLElement | null>(null);
    const lastFocusableElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen && ref.current) {
            const focusableElements = ref.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (focusableElements.length > 0) {
                firstFocusableElement.current = focusableElements[0];
                lastFocusableElement.current = focusableElements[focusableElements.length - 1];

                // Focus the first element when the modal opens
                firstFocusableElement.current.focus();

                const handleKeyDown = (e: KeyboardEvent) => {
                    if (e.key !== 'Tab') {
                        return;
                    }

                    if (e.shiftKey) { // Shift+Tab
                        if (document.activeElement === firstFocusableElement.current) {
                            lastFocusableElement.current?.focus();
                            e.preventDefault();
                        }
                    } else { // Tab
                        if (document.activeElement === lastFocusableElement.current) {
                            firstFocusableElement.current?.focus();
                            e.preventDefault();
                        }
                    }
                };

                document.addEventListener('keydown', handleKeyDown);
                return () => {
                    document.removeEventListener('keydown', handleKeyDown);
                };
            }
        }
    }, [isOpen, ref]);
};
