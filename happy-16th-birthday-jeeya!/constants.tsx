
import React from 'react';

// --- INTERFACES ---

export interface Photo {
  id: string;
  url: string;
  author: string;
  description?: string;
}

export interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt?: number;
  likes?: number;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface Sticker {
  id: string;
  src: string;
  alt: string;
}

export type SectionId = 'home' | 'timeline' | 'gallery' | 'wishes' | 'photobooth' | 'poem';


// --- SVG ICONS ---

export const BabyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a5 5 0 00-5 5v2H5a2 2 0 00-2 2v5a2 2 0 002 2h14a2 2 0 002-2v-5a2 2 0 00-2-2h-2V7a5 5 0 00-5-5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12a2.5 2.5 0 00-2.5 2.5V17h5v-2.5A2.5 2.5 0 0012 12z" /></svg>;
export const SchoolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" /></svg>;
export const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>;
export const CakeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.24a2 2 0 01-2 1.76H5a2 2 0 01-2-1.76V11a2 2 0 012-2h14a2 2 0 012 2v4.24zM8 11V7a4 4 0 118 0v4M12 3v2" /></svg>;
export const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;
export const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
export const GalleryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
export const WishesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>;
export const PhotoBoothIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
export const PoemIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;


// --- STATIC DATA ---

export const timelineEvents: TimelineEvent[] = [
  { year: '2009', title: 'A Star is Born', description: 'The world became a little brighter. Welcome, Jeeya!', icon: <BabyIcon /> },
  { year: '2014', title: 'First Day of School', description: 'New adventures, new friends, and a lifetime of learning begins.', icon: <SchoolIcon /> },
  { year: '2022', title: 'Becoming a Teen', description: "New rules. New routes. New you.", icon: <HeartIcon /> },
  { year: '2025', title: 'Sweet Sixteen!', description: 'Sixteen candles, a world of dreams. This is your year to shine!', icon: <CakeIcon /> },
];

export const stickers: Sticker[] = [
  { id: 'sticker-1', src: 'https://em-content.zobj.net/source/microsoft-teams/363/partying-face_1f973.png', alt: 'Partying Face' },
  { id: 'sticker-2', src: 'https://em-content.zobj.net/source/microsoft-teams/363/birthday-cake_1f382.png', alt: 'Birthday Cake' },
  { id: 'sticker-3', src: 'https://em-content.zobj.net/source/microsoft-teams/363/star-struck_1f929.png', alt: 'Star Struck' },
  { id: 'sticker-4', src: 'https://em-content.zobj.net/source/microsoft-teams/363/red-heart_2764-fe0f.png', alt: 'Heart' },
  { id: 'sticker-5', src: 'https://em-content.zobj.net/source/microsoft-teams/363/crown_1f451.png', alt: 'Crown' },
  { id: 'sticker-6', src: 'https://em-content.zobj.net/source/microsoft-teams/363/sunglasses_1f576-fe0f.png', alt: 'Sunglasses' },
];

export const navLinks: { id: SectionId; title: string, icon: React.ReactNode }[] = [
    { id: 'home', title: 'Home', icon: <HomeIcon />},
    { id: 'timeline', title: 'Timeline', icon: <SchoolIcon /> },
    { id: 'gallery', title: 'Gallery', icon: <GalleryIcon /> },
    { id: 'wishes', title: 'Wishes', icon: <WishesIcon /> },
    { id: 'photobooth', title: 'Booth', icon: <PhotoBoothIcon /> },
    { id: 'poem', title: 'Poem', icon: <PoemIcon /> },
];

// --- DEMO DATA FOR FALLBACK ---

export const demoPhotos: Photo[] = [
    { id: 'demo-1', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800', author: 'A Friend', description: 'That time we decorated for the party!' },
    { id: 'demo-2', url: 'https://images.unsplash.com/photo-1504196606610-a2cd6894585e?q=80&w=800', author: 'Cousin Mia', description: 'Happy memories from last summer\'s trip.' },
    { id: 'demo-3', url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800', author: 'The Crew', description: 'Best concert ever!' },
    { id: 'demo-4', url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800', author: 'Party People', description: 'Remember this amazing celebration?' },
    { id: 'demo-5', url: 'https://images.unsplash.com/photo-1559809386-8239b0d19688?q=80&w=800', author: 'Your Family', description: 'A beautiful day with everyone.' },
    { id: 'demo-6', url: 'https://images.unsplash.com/photo-1519211974-681561726a8d?q=80&w=800', author: 'BFFs', description: 'So much laughter and fun!' },
];

export const demoWishes: Wish[] = [
    { id: 'demo-wish-1', name: 'Your Bestie', message: 'Happy Sweet 16, Jeeya! Cannot believe how fast time has flown. Here\'s to many more years of laughter, adventures, and being amazing. Love you!', createdAt: Date.now() - 100000, likes: 27 },
    { id: 'demo-wish-2', name: 'Mom & Dad', message: 'To our dearest daughter, watching you grow into the incredible person you are has been our greatest joy. Happy 16th birthday. We love you more than words can say.', createdAt: Date.now() - 200000, likes: 42 },
    { id: 'demo-wish-3', name: 'A Cool Aunt', message: 'Happy Birthday! Welcome to 16 - it\'s a blast. Always remember to be yourself and chase your dreams. So proud of you!', createdAt: Date.now() - 300000, likes: 18 },
    { id: 'demo-wish-4', name: 'The Quiet Cousin', message: 'Happy birthday, Jeeya. Hope you have a great day.', createdAt: Date.now() - 400000, likes: 5 },
];
