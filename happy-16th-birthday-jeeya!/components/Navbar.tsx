
import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { navLinks, SectionId } from '../constants.tsx';

interface NavbarProps {
  activeSection: SectionId;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    // Hide navbar if scrolling down and past a 150px threshold
    if (previous !== undefined && latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, id: SectionId) => {
    event.preventDefault();
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
  };
  
  const desktopNavVariants = {
    visible: { y: 0, opacity: 1 },
    hidden: { y: '-150%', opacity: 0 },
  };

  const mobileNavVariants = {
    visible: { y: 0, opacity: 1 },
    hidden: { y: '150%', opacity: 0 },
  };


  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        variants={desktopNavVariants}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="hidden md:flex fixed top-4 inset-x-0 z-40 justify-center"
      >
        <ul
          className="flex items-center gap-2 bg-neutral-900/60 backdrop-blur-xl rounded-full p-2 shadow-lg border border-white/10"
        >
          {navLinks.map((link) => (
            <li key={link.id} className="relative">
              <a
                href={`#${link.id}`}
                onClick={(e) => handleLinkClick(e, link.id)}
                className={`block px-4 py-2 text-sm rounded-full transition-colors ${activeSection === link.id ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                {link.title}
              </a>
              {activeSection === link.id && (
                <motion.div
                  layoutId="desktop-nav-highlight"
                  className="absolute inset-0 bg-neutral-700/80 rounded-full z-[-1]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </li>
          ))}
        </ul>
      </motion.nav>

      {/* Mobile Navbar */}
      <motion.nav
        variants={mobileNavVariants}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="md:hidden flex fixed bottom-4 inset-x-0 z-40 justify-center"
      >
        <ul
          className="flex items-center gap-1 bg-neutral-900/70 backdrop-blur-xl rounded-full p-2 shadow-lg border border-white/10"
        >
          {navLinks.map((link) => (
            <li key={link.id} className="relative">
              <a
                href={`#${link.id}`}
                onClick={(e) => handleLinkClick(e, link.id)}
                className={`flex flex-col items-center justify-center gap-1 rounded-full transition-colors w-12 h-12 ${activeSection === link.id ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
              >
              {link.icon}
              <span className="text-[10px] leading-tight">{link.title}</span>
              </a>
                {activeSection === link.id && (
                    <motion.div
                    layoutId="mobile-nav-highlight"
                    className="absolute inset-0 bg-neutral-700/80 rounded-full z-[-1]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                )}
            </li>
          ))}
        </ul>
      </motion.nav>
    </>
  );
};

export default Navbar;
