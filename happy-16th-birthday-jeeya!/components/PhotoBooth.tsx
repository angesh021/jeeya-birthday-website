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

const PhotoBooth: React.FC<{ onNewPhoto: (photo: any) => void }> = ({ onNewPhoto }) => {
    const [status, setStatus] = useState<CameraStatus>('idle');
    const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
    const [countdown, setCountdown] = useState<number | null>(null);
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
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setStatus('ready');
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setStatus('denied');
            }
        } else {
            setStatus('error');
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }, []);

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
        for (let i = 0; i < 4; i++) {
            await new Promise(resolve => {
                setCountdown(3);
                const timer = setInterval(() => setCountdown(c => (c as number) - 1), 1000);
                setTimeout(() => clearInterval(timer), 3000);
                setTimeout(resolve, 3000);
            });
            setCountdown(null);
            setFlash(true);
            const photoData = await capturePhoto();
            if (photoData) photos.push(photoData);
            setTimeout(() => setFlash(false), 500);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        setCapturedPhotos(photos);
        setStatus('captured');
        stopCamera();
    };

    const createPhotoStrip = useCallback(() => {
        if (capturedPhotos.length < 4 || !photoStripCanvasRef.current) return;
        
        const canvas = photoStripCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const stripWidth = 400;
        const photoHeight = 300;
        const padding = 20;
        const stripHeight = (photoHeight * 4) + (padding * 5);
        
        canvas.width = stripWidth;
        canvas.height = stripHeight;

        ctx.fillStyle = '#1c1642';
        ctx.fillRect(0, 0, stripWidth, stripHeight);
        
        ctx.font = "bold 32px 'Playfair Display', serif";
        ctx.fillStyle = '#e94560';
        ctx.textAlign = 'center';
        ctx.fillText("Jeeya's Sweet 16", stripWidth / 2, padding * 2.5);

        capturedPhotos.forEach((photoSrc, index) => {
            const img = new Image();
            img.src = photoSrc;
            img.onload = () => {
                const yPos = (padding * (index + 2)) + (photoHeight * index) - padding*2;
                ctx.drawImage(img, padding, yPos, stripWidth - (padding * 2), photoHeight);
            };
        });

        setTimeout(() => setFinalPhotoStrip(canvas.toDataURL('image/jpeg')), 500); // give images time to draw
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
            const newPhotoData = await addPhoto({ url: finalPhotoStrip, author: 'Photo Booth Fun' });
            onNewPhoto(newPhotoData);
            alert('Photo added to gallery!');
            handleRetake();
        } catch (error) {
            alert('Could not add photo to gallery. Please try again.');
        }
    };


    return (
        <div className="py-16 text-center">
            <motion.h2 className="text-4xl md:text-6xl font-bold text-center mb-4">Virtual Photo Booth</motion.h2>
            <motion.p className="text-brand-text/80 mb-8 max-w-2xl mx-auto">Get ready to strike a pose! Drag stickers onto the camera view and capture your moment.</motion.p>
            
            <div className="w-full max-w-4xl mx-auto bg-brand-surface p-4 rounded-xl shadow-2xl">
                {status === 'idle' && (
                    <div className="h-[480px] flex flex-col items-center justify-center">
                        <h3 className="text-2xl mb-4">Ready for your closeup?</h3>
                        <button onClick={startCamera} className="px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform">
                            Start Camera
                        </button>
                    </div>
                )}
                
                {status === 'initializing' && <div className="h-[480px] flex items-center justify-center"><p>Warming up the camera...</p></div>}
                {status === 'denied' && <div className="h-[480px] flex items-center justify-center"><p className="text-red-400">Camera access denied. Please enable it in your browser settings.</p></div>}
                {status === 'error' && <div className="h-[480px] flex items-center justify-center"><p className="text-red-400">Camera not found. Please ensure one is connected.</p></div>}
                
                <AnimatePresence>
                    {(status === 'ready' || status === 'capturing') && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full aspect-video" ref={stickerContainerRef}>
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full rounded-lg object-cover transform -scale-x-100"></video>
                            {placedStickers.map(sticker => (
                                <motion.div key={sticker.renderId} drag dragMomentum={false} onDragEnd={(e,i) => handleDragEnd(e,i,sticker.renderId)} className="absolute cursor-grab active:cursor-grabbing" style={{ x: sticker.x, y: sticker.y }}>
                                    <img id={`sticker-img-${sticker.renderId}`} src={sticker.src} alt={sticker.alt} className="w-20 h-20 pointer-events-none" crossOrigin="anonymous"/>
                                </motion.div>
                            ))}
                            {countdown !== null && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-9xl font-bold text-white">
                                    {countdown}
                                </div>
                            )}
                            {flash && <div className="absolute inset-0 bg-white animate-flash"></div>}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                {status === 'captured' && finalPhotoStrip && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col md:flex-row gap-8 items-center justify-center">
                        <img src={finalPhotoStrip} alt="Your photo strip" className="rounded-lg shadow-lg max-w-sm w-full"/>
                        <div className="flex flex-col gap-4">
                            <h3 className="text-3xl font-bold">Lookin' Good!</h3>
                            <button onClick={handleAddToGallery} className="px-6 py-3 bg-brand-primary text-white font-bold rounded-full">Add to Gallery</button>
                            <button onClick={handleDownload} className="px-6 py-3 bg-brand-accent text-brand-background font-bold rounded-full">Download</button>
                            <button onClick={handleRetake} className="px-6 py-3 bg-gray-500 text-white font-bold rounded-full">Retake</button>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>

                {(status === 'ready' || status === 'capturing') && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2 bg-brand-background p-2 rounded-full">
                                {stickers.map(s => <img key={s.id} src={s.src} alt={s.alt} className="w-12 h-12 cursor-pointer hover:scale-110 transition-transform" onClick={() => addStickerToCanvas(s)}/>)}
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