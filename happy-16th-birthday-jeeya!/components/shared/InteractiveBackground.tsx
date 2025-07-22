
import React, { useEffect, useMemo } from 'react';
import type { IOptions, RecursivePartial } from '@tsparticles/engine';

declare global {
    interface Window {
        tsParticles: any;
    }
}

const InteractiveBackground: React.FC = () => {
    useEffect(() => {
        if (typeof window !== 'undefined' && window.tsParticles) {
            const options: RecursivePartial<IOptions> = {
                background: {
                    color: {
                        value: '#0f0c29',
                    },
                },
                fpsLimit: 60,
                interactivity: {
                    events: {
                        onHover: {
                            enable: true,
                            mode: 'repulse',
                        },
                    },
                    modes: {
                        repulse: {
                            distance: 100,
                            duration: 0.4,
                        },
                    },
                },
                particles: {
                    color: {
                        value: ['#ffffff', '#e94560', '#ff7675'],
                    },
                    links: {
                        color: '#ffffff',
                        distance: 150,
                        enable: true,
                        opacity: 0.1,
                        width: 1,
                    },
                    move: {
                        direction: 'none',
                        enable: true,
                        outModes: {
                            default: 'bounce',
                        },
                        random: false,
                        speed: 1,
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                        },
                        value: 50,
                    },
                    opacity: {
                        value: {min: 0.1, max: 0.5},
                    },
                    shape: {
                        type: 'circle',
                    },
                    size: {
                        value: { min: 1, max: 3 },
                    },
                },
                detectRetina: true,
            };

            window.tsParticles.load({ id: 'tsparticles', options });
        }
    }, []);

    return <div id="tsparticles" className="fixed top-0 left-0 w-full h-full z-[-1]" />;
};

export default React.memo(InteractiveBackground);
