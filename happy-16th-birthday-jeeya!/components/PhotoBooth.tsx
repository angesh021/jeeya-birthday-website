
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { stickers, Sticker as StickerType } from '../constants.tsx';
import { addPhoto } from '../services/photoService.ts';

type CameraStatus = 'idle' | 'initializing' | 'ready' | 'denied' | 'error' | 'capturing' | 'captured';
type PlacedSticker = StickerType & {
    x: number;
    y: number;
    renderId: number;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const CameraFocusAnimation: React.FC = () => (
    <div className="h-[480px] flex flex-col items-center justify-center gap-4">
        <div className="relative w-40 h-40">
            <div className="absolute inset-0 rounded-full border-brand-primary/50 animate-focus-ring" style={{ animationDelay: '0s' }}></div>
            <div className="absolute inset-0 rounded-full border-brand-accent/50 animate-focus-ring" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute inset-8 rounded-full bg-brand-primary/20"></div>
        </div>
        <p className="text-brand-text/80">Warming up the camera...</p>
    </div>
);

const PhotoStripDevelopingAnimation: React.FC = () => {
    const Polaroid = ({ delay }: { delay: number }) => (
        <motion.div
            className="w-24 h-28 bg-white shadow-lg p-2"
            initial={{ y: 100, opacity: 0, rotate: Math.random() * 30 - 15 }}
            animate={{
                y: 0,
                opacity: 1,
                x: [0, -3, 3, -3, 3, 0], // Shake animation
            }}
            transition={{
                y: { type: 'spring', stiffness: 100, delay },
                opacity: { duration: 0.5, delay },
                x: {
                    delay: delay + 0.8,
                    duration: 0.7,
                    repeat: 2,
                    ease: 'easeInOut',
                },
            }}
        >
            <div className="w-full h-full bg-gray-800 flex items-center justify-center overflow-hidden">
                <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        </motion.div>
    );

    return (
        <div className="flex flex-col items-center gap-4 my-12">
            <div className="flex -space-x-8">
                <Polaroid delay={0} />
                <Polaroid delay={0.2} />
                <Polaroid delay={0.4} />
            </div>
            <p className="text-brand-text/70 mt-4">Assembling your masterpiece...</p>
        </div>
    );
};


const PhotoBooth: React.FC<{ onNewPhoto: (photo: any) => void }> = ({ onNewPhoto }) => {
    const [status, setStatus] = useState<CameraStatus>('idle');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
    const [overlayMessage, setOverlayMessage] = useState<string>('');
    const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
    const [finalPhotoStrip, setFinalPhotoStrip] = useState<string | null>(null);
    const [flash, setFlash] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const photoStripCanvasRef = useRef<HTMLCanvasElement>(null);
    const stickerContainerRef = useRef<HTMLDivElement>(null);

    const startCamera = useCallback(async () => {
        setStatus('initializing');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, aspectRatio: 1 } });
                setStream(mediaStream);
                setStatus('ready');
            } catch (err) {
                console.error("Error accessing camera:", err);
                setStatus('denied');
            }
        } else {
            setStatus('error');
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        if (status === 'ready' && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [status, stream]);

    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    const addStickerToCanvas = (sticker: StickerType) => {
        setPlacedStickers(prev => [...prev, { ...sticker, x: 50, y: 50, renderId: Date.now() }]);
    };
    
    const handleDragEnd = <T,>(event: MouseEvent | TouchEvent | PointerEvent, info: any, stickerId: number) => {
        setPlacedStickers(stickers => stickers.map(s => 
            s.renderId === stickerId ? { ...s, x: info.point.x, y: info.point.y } : s
        ));
    };

    const capturePhoto = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || !stickerContainerRef.current) return null;
    
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const videoRect = video.getBoundingClientRect();
        canvas.width = videoRect.width;
        canvas.height = videoRect.height;
    
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        const stickerPromises = placedStickers.map(sticker => {
            return new Promise<void>(resolve => {
                const stickerElement = document.getElementById(`sticker-img-${sticker.renderId}`) as HTMLImageElement;
                if (!stickerElement) return resolve();
                
                const stickerRect = stickerElement.getBoundingClientRect();
                const containerRect = stickerContainerRef.current!.getBoundingClientRect();
                
                const x = stickerRect.left - containerRect.left;
                const y = stickerRect.top - containerRect.top;

                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = stickerElement.src;
                img.onload = () => {
                    ctx.drawImage(img, x, y, stickerRect.width, stickerRect.height);
                    resolve();
                };
                img.onerror = () => resolve();
            });
        });
    
        await Promise.all(stickerPromises);
        return canvas.toDataURL('image/jpeg');
    }, [placedStickers]);


    const startCaptureSequence = async () => {
        setStatus('capturing');
        const photos: string[] = [];
    
        const messages = [
            { pre: "Get Ready...", capture: "Photo 1 of 3", post: "Amazing Shot!" },
            { pre: "Ready for the next one?", capture: "Photo 2 of 3", post: "Awesome!" },
            { pre: "Last one, make it count!", capture: "Photo 3 of 3", post: "Perfect! 🎉" },
        ];
    
        await sleep(300);
    
        for (const msg of messages) {
            setOverlayMessage(msg.pre);
            await sleep(2000);
    
            setOverlayMessage(msg.capture);
            await sleep(1500);
    
            setFlash(true);
            setOverlayMessage('');
            const photoData = await capturePhoto();
            if (photoData) photos.push(photoData);
            await sleep(500); 
            setFlash(false);
    
            setOverlayMessage(msg.post);
            await sleep(2000);
        }
    
        setOverlayMessage("Creating your masterpiece...");
        await sleep(1000);
    
        setCapturedPhotos(photos);
        setStatus('captured');
        setOverlayMessage('');
        stopCamera();
    };

    const createPhotoStrip = useCallback(() => {
        if (capturedPhotos.length < 3 || !photoStripCanvasRef.current) return;
    
        const canvas = photoStripCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const canvasWidth = 800;
        const canvasHeight = 1100;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        const cx = canvasWidth / 2;
        const cy = canvasHeight / 2;

        const bgGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvasWidth * 0.8);
        bgGradient.addColorStop(0, '#3a327a');
        bgGradient.addColorStop(1, '#0f0c29');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        const confettiColors = ['#e94560', '#ff7675', '#fdcb6e', '#a29bfe', '#81ecec'];
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * canvasWidth;
            const y = Math.random() * canvasHeight;
            const width = Math.random() * 8 + 4;
            const height = Math.random() * 15 + 5;
            const rotation = Math.random() * Math.PI * 2;
            const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            const alpha = Math.random() * 0.6 + 0.4;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.fillRect(-width / 2, -height / 2, width, height);
            ctx.restore();
        }
        ctx.globalAlpha = 1;
        
        const titles = ["Happy Sweet 16!", "Party Time!", "Making Memories", "Sixteen & Sparkling", "Jeeya's Big Day!"];
        const randomTitle = titles[Math.floor(Math.random() * titles.length)];

        ctx.font = "bold 60px 'Playfair Display', serif";
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#f0f0f0';
        ctx.fillText(randomTitle, canvasWidth / 2, 100);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#e94560';
        ctx.fillText(randomTitle, canvasWidth / 2, 100);

        const drawPolaroid = (img: HTMLImageElement, x: number, y: number, rotation: number) => {
            const pWidth = 320;
            const pHeight = 380;
            const photoAreaWidth = 280;
            const photoAreaHeight = 280;
            const photoOffsetX = (pWidth - photoAreaWidth) / 2;
            const photoOffsetY = 20;
            const captionY = photoOffsetY + photoAreaHeight + 45;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation * Math.PI / 180);
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 25;
            ctx.shadowOffsetX = 10;
            ctx.shadowOffsetY = 10;
            
            ctx.fillStyle = '#fdfdfd';
            ctx.fillRect(-pWidth / 2, -pHeight / 2, pWidth, pHeight);
            
            ctx.shadowColor = 'transparent';

            ctx.drawImage(
                img, 0, 0, img.naturalWidth, img.naturalHeight,
                -pWidth / 2 + photoOffsetX, -pHeight / 2 + photoOffsetY,
                photoAreaWidth, photoAreaHeight
            );
            
            ctx.fillStyle = '#555';
            ctx.font = "24px 'Dancing Script', cursive";
            ctx.textAlign = 'center';
            ctx.fillText("Jeeya B-Day Memories", 0, -pHeight / 2 + captionY);

            ctx.restore();
        };

        const imageLoadPromises = capturedPhotos.map(src => {
            return new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.style.objectFit = 'cover';
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        });

        Promise.all(imageLoadPromises).then(images => {
            const positions = [
                { x: canvasWidth / 2, y: 320, rot: -6 },
                { x: canvasWidth / 2 - 180, y: 680, rot: 8 },
                { x: canvasWidth / 2 + 180, y: 700, rot: -3 },
            ];

            images.forEach((img, index) => {
                if (positions[index]) {
                    drawPolaroid(img, positions[index].x, positions[index].y, positions[index].rot);
                }
            });
            
            setFinalPhotoStrip(canvas.toDataURL('image/jpeg', 0.95));
        }).catch(err => {
            console.error("Failed to load captured images for strip creation:", err);
        });
    }, [capturedPhotos]);


    useEffect(() => {
        if (status === 'captured' && capturedPhotos.length > 0) {
            createPhotoStrip();
        }
    }, [status, capturedPhotos, createPhotoStrip]);

    const handleRetake = () => {
        setCapturedPhotos([]);
        setFinalPhotoStrip(null);
        setPlacedStickers([]);
        setStatus('idle');
    };

    const handleDownload = () => {
        if (!finalPhotoStrip) return;
        const link = document.createElement('a');
        link.href = finalPhotoStrip;
        link.download = `jeeya-sweet16-photobooth.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAddToGallery = async () => {
        if (!finalPhotoStrip) return;
        try {
            const response = await fetch(finalPhotoStrip);
            const blob = await response.blob();
            const file = new File([blob], `photobooth-memory-${Date.now()}.jpeg`, { type: 'image/jpeg' });
            
            const newPhotoData = await addPhoto({ 
                file: file, 
                author: 'Photo Booth Fun', 
                description: 'Created in the Virtual Photo Booth!' 
            });

            onNewPhoto(newPhotoData);
            alert('Photo added to gallery!');
            handleRetake();
        } catch (error) {
            console.error("Error adding photobooth picture to gallery:", error);
            alert('Could not add photo to gallery. Please try again.');
        }
    };


    return (
        <div className="py-16 text-center">
            <motion.h2 className="text-4xl md:text-6xl font-bold text-center mb-8">Virtual Photo Booth</motion.h2>
            
            <div className="w-full max-w-4xl mx-auto bg-brand-surface p-4 rounded-xl shadow-2xl min-h-[550px] flex flex-col justify-center">
                {status === 'idle' && (
                    <div className="h-[480px] flex flex-col items-center justify-center">
                        <h3 className="text-2xl mb-4">Ready for your closeup?</h3>
                        <button onClick={startCamera} className="px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform">
                            Start Camera
                        </button>
                    </div>
                )}
                
                {status === 'initializing' && <CameraFocusAnimation />}
                {status === 'denied' && <div className="h-[480px] flex items-center justify-center"><p className="text-red-400">Camera access denied. Please enable it in your browser settings.</p></div>}
                {status === 'error' && <div className="h-[480px] flex items-center justify-center"><p className="text-red-400">Camera not found. Please ensure one is connected.</p></div>}
                
                <AnimatePresence>
                    {(status === 'ready' || status === 'capturing') && (
                        <motion.div
                            initial={{ opacity: 0, rotate: -5, scale: 0.9 }}
                            animate={{ opacity: 1, rotate: -2, scale: 1 }}
                            exit={{ opacity: 0, rotate: -5, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                            className="relative w-full max-w-md mx-auto bg-white p-4 pb-20 shadow-2xl rounded-md"
                        >
                            <div className="relative w-full aspect-square overflow-hidden rounded-sm bg-black" ref={stickerContainerRef}>
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100"></video>
                                
                                <AnimatePresence>
                                    {status === 'ready' && (
                                         <motion.div
                                            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/10 flex flex-col items-center justify-center text-center p-4"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <h3 className="font-bold text-3xl text-brand-accent mb-6 font-serif tracking-wide drop-shadow-lg">Get Ready!</h3>
                                            <div className="text-white space-y-3 text-lg">
                                                <p><strong className="text-brand-secondary font-bold mr-2">1.</strong> Drag fun stickers onto the screen.</p>
                                                <p><strong className="text-brand-secondary font-bold mr-2">2.</strong> Click 'Take Photos' when you're set.</p>
                                                <p><strong className="text-brand-secondary font-bold mr-2">3.</strong> Smile for 3 pictures! ✨</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                
                                {placedStickers.map(sticker => (
                                    <motion.div key={sticker.renderId} drag dragMomentum={false} onDragEnd={(e,i) => handleDragEnd(e,i,sticker.renderId)} className="absolute cursor-grab active:cursor-grabbing" style={{ x: sticker.x, y: sticker.y }}>
                                        <img id={`sticker-img-${sticker.renderId}`} src={sticker.src} alt={sticker.alt} className="w-20 h-20 pointer-events-none" crossOrigin="anonymous"/>
                                    </motion.div>
                                ))}
                               
                                <AnimatePresence>
                                    {overlayMessage && (
                                        <motion.div
                                            key={overlayMessage}
                                            className="absolute inset-0 flex items-center justify-center text-center p-4 pointer-events-none"
                                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                                        >
                                            <p className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg font-script">
                                                {overlayMessage}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {flash && <div className="absolute inset-0 bg-white animate-flash"></div>}
                            </div>
                            <p className="absolute bottom-6 left-0 right-0 text-center font-script text-2xl text-gray-800 select-none">Jeeya B-Day Memories</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                {status === 'captured' && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-4">
                        {!finalPhotoStrip ? (
                             <PhotoStripDevelopingAnimation />
                        ) : (
                            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                                <img src={finalPhotoStrip} alt="Your photo strip" className="rounded-lg shadow-lg max-w-md w-full object-contain"/>
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-3xl font-bold">Lookin' Good!</h3>
                                    <button onClick={handleAddToGallery} className="px-6 py-3 bg-brand-primary text-white font-bold rounded-full transition-transform hover:scale-105">Add to Gallery</button>
                                    <button onClick={handleDownload} className="px-6 py-3 bg-brand-accent text-brand-background font-bold rounded-full transition-transform hover:scale-105">Download</button>
                                    <button onClick={handleRetake} className="px-6 py-3 bg-gray-500 text-white font-bold rounded-full transition-transform hover:scale-105">Retake</button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
                </AnimatePresence>

                {(status === 'ready' || status === 'capturing') && (
                    <div className="mt-8">
                        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 max-w-md mx-auto">
                            <div className="flex gap-2 bg-brand-background p-2 rounded-full">
                                {stickers.map(s => <img key={s.id} src={s.src} alt={s.alt} className="w-10 h-10 sm:w-12 sm:h-12 cursor-pointer hover:scale-110 transition-transform" onClick={() => addStickerToCanvas(s)}/>)}
                            </div>
                            <button onClick={startCaptureSequence} disabled={status === 'capturing'} className="px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-full shadow-lg disabled:opacity-50">
                                {status === 'capturing' ? 'Capturing...' : 'Take Photos'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <canvas ref={photoStripCanvasRef} className="hidden"></canvas>
        </div>
    );
};

export default PhotoBooth;
