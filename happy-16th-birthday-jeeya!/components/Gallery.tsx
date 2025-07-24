
import React, { useState, useRef, useEffect } from 'react';
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

    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef, true);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File is too large. Max 5MB.');
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/gif'].includes(selectedFile.type)) {
                setError('Invalid file type. Please use JPG, PNG, or GIF.');
                return;
            }
            setError('');
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
            <motion.div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="upload-modal-title"
                className="bg-brand-surface p-8 rounded-lg w-full max-w-md relative"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-3xl leading-none">&times;</button>
                <h3 id="upload-modal-title" className="text-2xl font-bold mb-4">Upload a Memory</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="file-upload" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/20 file:text-brand-primary hover:file:bg-brand-primary/30 cursor-pointer flex items-center">
                            <span className="bg-brand-primary text-white font-bold py-2 px-4 rounded-full transition-colors mr-4">Choose File</span>
                            <span className="text-brand-text/70">{file ? file.name : 'No file selected...'}</span>
                        </label>
                        <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" required/>
                        {preview && <img src={preview} alt="Preview" className="mt-4 rounded-lg max-h-40 mx-auto"/>}
                    </div>
                    <div>
                        <label htmlFor="description" className="sr-only">Description</label>
                         <textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Add a fun description..."
                            className="w-full bg-brand-background p-3 rounded-md border border-white/20 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                            rows={3}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="author" className="sr-only">Your Name</label>
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


const Gallery: React.FC<GalleryProps> = ({ photos, onNewPhoto, isLoading, error, onRetry }) => {
  const [selectedImg, setSelectedImg] = useState<Photo | null>(null);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const isDemoMode = error === 'DEMO_MODE';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setSelectedImg(null);
        }
    };
    if (selectedImg) {
        document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
}, [selectedImg]);


  return (
    <div className="py-16">
      <motion.h2 
        className="text-4xl md:text-6xl font-bold text-center mb-4"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Memory Gallery
      </motion.h2>
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <button 
            onClick={() => setUploadModalOpen(true)} 
            className="px-6 py-3 bg-brand-accent text-brand-background font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform disabled:bg-gray-500 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isDemoMode}
            title={isDemoMode ? "Uploads are disabled in demo mode" : "Upload a Memory"}
        >
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
        <motion.div 
            className="text-center bg-brand-surface/40 backdrop-blur-sm p-8 rounded-2xl max-w-2xl mx-auto border border-brand-primary/20 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="mx-auto mb-4 w-16 h-16 text-brand-primary/70">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="font-serif text-3xl font-bold text-white mb-2">A Glitch in the Gallery</h3>
            <p className="text-brand-text/70 mb-6 max-w-md mx-auto">{error}</p>
            <button 
                onClick={onRetry} 
                className="px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-brand-primary/50"
            >
                Try Again
            </button>
        </motion.div>
      )}

      {!isLoading && !error && photos.length === 0 && (
        <div className="text-center bg-brand-surface/30 p-8 rounded-lg mt-8 max-w-2xl mx-auto">
            <p className="text-2xl font-bold font-serif text-brand-accent">The Memory Book is Open!</p>
            <p className="text-brand-text/80 mt-2">The gallery is currently empty. Be the first to add a cherished memory for Jeeya.</p>
        </div>
      )}
      
      <div className="columns-2 md:columns-3 gap-4 space-y-4 mt-8">
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
            layout
            className="break-inside-avoid"
          >
            <motion.div 
                className="bg-brand-surface/40 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden cursor-pointer border border-white/10"
                whileHover={{ scale: 1.03, y: -5, boxShadow: '0 10px 20px rgba(233, 69, 96, 0.15)' }}
                onClick={() => setSelectedImg(photo)}
            >
                <img src={photo.url} alt={photo.description || `A memory from ${photo.author}`} className="w-full h-auto" />
                <div className="p-3 text-left">
                    {photo.description && <p className="text-sm text-brand-text/90 mb-2 italic">"{photo.description}"</p>}
                    <p className="font-semibold text-sm text-brand-secondary text-right">- {photo.author}</p>
                </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedImg && (
          <motion.div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
          >
            <motion.img
              layoutId={selectedImg.id}
              src={selectedImg.url}
              alt={selectedImg.description || `A memory from ${selectedImg.author}`}
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
             <motion.div 
                className="absolute bottom-10 left-10 right-10 text-center bg-black/60 p-4 rounded-xl backdrop-blur-sm border border-white/20"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
             >
                {selectedImg.description && <p className="text-lg text-white font-serif mb-1">"{selectedImg.description}"</p>}
                <p className="text-md text-white/80">Uploaded by {selectedImg.author}</p>
             </motion.div>
          </motion.div>
        )}
        {isUploadModalOpen && (
            <UploadModal onClose={() => setUploadModalOpen(false)} onUpload={onNewPhoto} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;