
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Photo } from '../constants.tsx';
import { addPhoto } from '../services/photoService.ts';
import { useFocusTrap } from './shared/useFocusTrap.ts';

interface GalleryProps {
  photos: Photo[];
  onNewPhoto: (photo: Photo) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const DemoModeBanner = () => (
    <div className="text-center bg-brand-accent/10 p-4 rounded-lg mb-8 border border-brand-accent/30">
        <p className="font-bold text-brand-accent">Demo Mode</p>
        <p className="text-sm text-brand-text/80">Live gallery is offline. Connect Vercel Blob &amp; KV in your project settings to enable photo uploads.</p>
    </div>
);

const UploadModal: React.FC<{ onClose: () => void, onUpload: (photo: Photo) => void }> = ({ onClose, onUpload }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef, true);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);
    
    const processFile = (selectedFile: File) => {
        if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
            setError('File is too large. Max 5MB.');
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(selectedFile.type)) {
            setError('Invalid file type. Please use JPG, PNG, GIF, or WEBP.');
            return;
        }
        setError('');
        setFile(selectedFile);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(selectedFile));
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) processFile(selectedFile);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) processFile(droppedFile);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !author.trim() || !description.trim() || isUploading) return;
        
        setIsUploading(true);
        setError('');

        try {
            const newPhoto = await addPhoto({ file, author, description });
            onUpload(newPhoto);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <motion.div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <motion.div 
                ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="upload-modal-title"
                className="bg-brand-surface p-8 rounded-lg w-full max-w-md relative"
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-3xl leading-none">&times;</button>
                <h3 id="upload-modal-title" className="text-2xl font-bold mb-4">Upload a Memory</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div 
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-text/30'}`}
                    >
                        <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <p className="text-brand-text/70">{isDragging ? 'Drop the image here!' : 'Drag & drop an image or'}</p>
                            <span className="font-bold text-brand-accent hover:underline">choose a file</span>
                        </label>
                        {preview && <img src={preview} alt="Preview" className="mt-4 rounded-lg max-h-40 mx-auto"/>}
                    </div>
                    <div>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add a fun description..." className="w-full bg-brand-background p-3 rounded-md border border-white/20 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition" rows={3} required />
                    </div>
                    <div>
                        <input type="text" id="author" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Your Name" className="w-full bg-brand-background p-3 rounded-md border border-white/20 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition" required />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                    <button type="submit" disabled={isUploading || !file || !author.trim() || !description.trim()} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-full disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                        {isUploading ? 'Uploading...' : 'Add Memory'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

const Carousel: React.FC<{ photos: Photo[], selectedIndex: number, onClose: () => void }> = ({ photos, selectedIndex, onClose }) => {
    const [[page, direction], setPage] = useState([selectedIndex, 0]);
    
    const paginate = useCallback((newDirection: number) => {
        const newIndex = (page + newDirection + photos.length) % photos.length;
        setPage([newIndex, newDirection]);
    }, [page, photos.length]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') paginate(1);
            if (e.key === 'ArrowLeft') paginate(-1);
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [paginate, onClose]);
    
    const carouselVariants = {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
    };
    
    const photo = photos[page];

    return (
        <motion.div
            className="fixed inset-0 bg-brand-background/50 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} role="dialog" aria-modal="true"
        >
             <button onClick={(e) => { e.stopPropagation(); paginate(-1); }} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 text-3xl transition-colors">&lt;</button>
             <button onClick={(e) => { e.stopPropagation(); paginate(1); }} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 text-3xl transition-colors">&gt;</button>
             <button onClick={onClose} className="absolute top-4 right-4 text-5xl text-white/50 hover:text-white transition-colors z-20">&times;</button>
             
             <div 
                className="w-full h-full flex flex-col items-center justify-center gap-6"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
             >
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={carouselVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="w-full flex-grow flex items-center justify-center relative pt-16 pb-8"
                    >
                        <motion.img
                            // Use layoutId only for the initially selected image to prevent animation jumpiness when navigating
                            layoutId={page === selectedIndex ? photo.id : undefined}
                            src={photo.url}
                            alt={photo.description || `A memory from ${photo.author}`}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </motion.div>
                </AnimatePresence>
                 
                <motion.div
                    key={`${page}-details`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="flex-shrink-0 w-full max-w-4xl text-center pb-8"
                >
                    <p className="font-serif text-3xl text-white mb-2 drop-shadow-md">"{photo.description}"</p>
                    <p className="text-brand-accent/80 text-lg">Shared by {photo.author}</p>
               </motion.div>
             </div>
        </motion.div>
    );
};

// Helper to assign different grid sizes for a collage effect
const getCollageItemClasses = (index: number): string => {
    const pattern = index % 11;
    switch (pattern) {
        case 0: return 'md:col-span-2 md:row-span-2';
        case 5: return 'md:row-span-2';
        case 9: return 'md:row-span-2';
        default: return 'col-span-1 row-span-1';
    }
};

const Gallery: React.FC<GalleryProps> = ({ photos, onNewPhoto, isLoading, error, onRetry }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const isDemoMode = error === 'DEMO_MODE';

  return (
    <div className="py-16">
      <motion.h2 className="text-4xl md:text-6xl font-bold text-center mb-4" initial={{ opacity: 0, y: -50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        Memory Gallery
      </motion.h2>
      <motion.div className="text-center mb-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
        <button onClick={() => setUploadModalOpen(true)} className="px-6 py-3 bg-brand-accent text-brand-background font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform disabled:bg-gray-500 disabled:cursor-not-allowed disabled:transform-none" disabled={isDemoMode} title={isDemoMode ? "Uploads are disabled in demo mode" : "Upload a Memory"}>
            + Upload a Memory
        </button>
      </motion.div>
      
      {isDemoMode && <DemoModeBanner />}
      
      {isLoading && (
        <div className="text-center py-10">
            <div className="flex items-center justify-center gap-2 text-lg text-brand-text/80">
                <span className="w-3 h-3 bg-brand-primary rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="w-3 h-3 bg-brand-primary rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="w-3 h-3 bg-brand-primary rounded-full animate-pulse"></span>
                <p className="ml-2">Loading memories from the cloud...</p>
            </div>
        </div>
      )}
      
      {error && !isDemoMode && !isLoading && (
         <motion.div className="text-center bg-brand-surface/40 backdrop-blur-sm p-8 rounded-2xl max-w-2xl mx-auto border border-brand-primary/20 shadow-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mx-auto mb-4 w-16 h-16 text-brand-primary/70"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg></div>
            <h3 className="font-serif text-3xl font-bold text-white mb-2">A Glitch in the Gallery</h3>
            <p className="text-brand-text/70 mb-6 max-w-md mx-auto">{error}</p>
            <button onClick={onRetry} className="px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-brand-primary/50">Try Again</button>
        </motion.div>
      )}

      {!isLoading && !error && photos.length === 0 && (
        <div className="text-center bg-brand-surface/30 p-8 rounded-lg mt-8 max-w-2xl mx-auto">
            <p className="text-2xl font-bold font-serif text-brand-accent">The Memory Book is Open!</p>
            <p className="text-brand-text/80 mt-2">The gallery is currently empty. Be the first to add a cherished memory for Jeeya.</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[250px] grid-flow-dense gap-4 mt-8">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: index * 0.05 }}
            className={`relative rounded-lg overflow-hidden group cursor-pointer shadow-lg ${getCollageItemClasses(index)}`}
            onClick={() => setSelectedIdx(index)}
          >
            <motion.div layoutId={photo.id} className="w-full h-full">
              <img src={photo.url} alt={photo.description || `A memory from ${photo.author}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 w-full">
                  {photo.description && <p className="font-serif text-lg leading-tight mb-1 truncate">"{photo.description}"</p>}
                  <p className="text-sm opacity-80">- {photo.author}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedIdx !== null && (
          <Carousel photos={photos} selectedIndex={selectedIdx} onClose={() => setSelectedIdx(null)} />
        )}
        {isUploadModalOpen && (
            <UploadModal onClose={() => setUploadModalOpen(false)} onUpload={onNewPhoto} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
