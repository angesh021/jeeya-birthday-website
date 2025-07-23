

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Photo, SectionId } from './constants.tsx';
import * as photoService from './services/photoService.ts';

import InteractiveBackground from './components/shared/InteractiveBackground.tsx';
import MagicCursor from './components/shared/MagicCursor.tsx';
import Section from './components/shared/Section.tsx';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import Hero from './components/Hero.tsx';
import Timeline from './components/Timeline.tsx';
import Gallery from './components/Gallery.tsx';
import Wishes from './components/Wishes.tsx';
import PhotoBooth from './components/PhotoBooth.tsx';
import PoemGenerator from './components/PoemGenerator.tsx';
import SecretMessage from './components/SecretMessage.tsx';


const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [isSecretMessageOpen, setSecretMessageOpen] = useState(false);

  const fetchInitialPhotos = useCallback(async () => {
    setIsGalleryLoading(true);
    setGalleryError(null);
    try {
      const fetchedPhotos = await photoService.getPhotos();
      // On success, set the photos directly. The Gallery component will handle the empty case.
      setPhotos(fetchedPhotos);
    } catch (error) {
      console.error("Photo fetching error:", error);
      let specificErrorMessage = 'A mysterious error occurred while fetching memories.';
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        specificErrorMessage = "Could not connect to the photo API. Please ensure the local development server (`vercel dev`) is running and try again.";
      } else if (error instanceof Error) {
        specificErrorMessage = error.message;
      }
      
      setGalleryError(specificErrorMessage);
      // On error, we'll show an empty gallery with an error message.
      setPhotos([]);
    } finally {
      setIsGalleryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialPhotos();
  }, [fetchInitialPhotos]);

  const handleNewPhotoAdded = useCallback((newPhoto: Photo) => {
    // Optimistically add the new photo to the start of the list.
    setPhotos(prevPhotos => [newPhoto, ...prevPhotos]);
    // Optional: scroll to gallery to see the change
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleInView = useCallback((id: string) => {
    setActiveSection(id as SectionId);
  }, []);

  return (
    <>
      <MagicCursor />
      <InteractiveBackground />
      <Navbar activeSection={activeSection} />

      <main className="overflow-x-hidden pb-24 md:pb-0">
        {/* The Hero component is no longer inside a Section wrapper to allow its background to fill the screen. */}
        {/* We use motion.div here to attach the onViewportEnter event for the navbar state. */}
        <motion.div id="home" onViewportEnter={() => handleInView('home')}>
            <Hero />
        </motion.div>
        
        {/* Other sections remain within the Section wrapper for consistent padding and max-width. */}
        <Section id="timeline" onInView={handleInView} className="bg-brand-background/50 backdrop-blur-sm">
          <Timeline />
        </Section>
        <Section id="gallery" onInView={handleInView}>
          <Gallery 
            photos={photos} 
            onNewPhoto={handleNewPhotoAdded} 
            isLoading={isGalleryLoading} 
            error={galleryError}
            onRetry={fetchInitialPhotos} 
          />
        </Section>
        <Section id="wishes" onInView={handleInView} className="bg-brand-surface/70">
          <Wishes />
        </Section>
        <Section id="photobooth" onInView={handleInView}>
          <PhotoBooth onNewPhoto={handleNewPhotoAdded} />
        </Section>
        <Section id="poem" onInView={handleInView} className="bg-brand-surface/70">
          <PoemGenerator />
        </Section>
      </main>
      
      <Footer onSecretClick={() => setSecretMessageOpen(true)} />

      <SecretMessage isOpen={isSecretMessageOpen} onClose={() => setSecretMessageOpen(false)} />
    </>
  );
};

export default App;