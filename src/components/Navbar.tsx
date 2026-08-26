import { useState } from 'react';
import { Languages, Instagram, Menu, X, User, PenTool, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  onNavigate: (sectionId: string) => void;
  isAdminAuthorized?: boolean;
  isVisualEditMode?: boolean;
  setIsVisualEditMode?: (mode: boolean) => void;
  onLogout?: () => void;
}

export default function Navbar({
  language,
  setLanguage,
  isAdminMode,
  setIsAdminMode,
  onNavigate,
  isAdminAuthorized = false,
  isVisualEditMode = false,
  setIsVisualEditMode,
  onLogout
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[language];

  const menuItems = [
    { id: 'about', label: t.navAbout },
    { id: 'booking', label: t.navBook },
    { id: 'portfolio', label: t.navPortfolio },
    { id: 'testimonials', label: t.navReviews },
    { id: 'faq', label: t.navFAQ },
  ];

  const handleNavClick = (id: string) => {
    setIsOpen(false);
    if (isAdminMode) {
      setIsAdminMode(false); // return to client view to let navigation scroll work
    }
    setTimeout(() => {
      onNavigate(id);
    }, 100);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#FCFBFA]/95 backdrop-blur-md border-b border-[#E5E5E1] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick('hero')} 
            className="flex flex-col cursor-pointer group"
            id="nav-brand"
          >
            <div className="text-2xl font-black tracking-tighter text-[#1A1A1A] group-hover:opacity-80 transition-opacity">
              hansttoo<span className="text-[#E53E3E]">.</span>
            </div>
            <span className="text-[9px] tracking-[0.25em] text-stone-400 font-bold uppercase -mt-0.5">
              {t.brandSubtitle}
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8" id="nav-desktop-links">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="text-[#1A1A1A] hover:text-[#E53E3E] text-[11px] font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer"
                id={`nav-link-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Controls: Socials, Language, Admin Toggle, Book CTA */}
          <div className="hidden md:flex items-center space-x-4" id="nav-desktop-controls">
            {/* Instagram */}
            <a
              href="https://instagram.com/hansttoo"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 text-stone-600 hover:text-black rounded-full hover:bg-stone-100 transition-all duration-200"
              title="Instagram @hansttoo"
              id="nav-insta-desktop"
            >
              <Instagram className="w-4 h-4" />
            </a>

            {/* Language Selector Pill */}
            <div className="relative flex items-center bg-stone-100 text-stone-800 p-1 rounded-full text-[10px] font-bold tracking-[0.1em]" id="nav-lang-toggle">
              {/* Rotating tactile icon prefix */}
              <div className="pl-2 pr-1 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: language === 'en' ? 0 : 360 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16 }}
                >
                  <Languages className="w-3.5 h-3.5 text-stone-500" />
                </motion.div>
              </div>

              <button 
                onClick={() => setLanguage('en')} 
                className="relative z-10 px-3 py-1.5 rounded-full transition-colors cursor-pointer select-none"
              >
                <span className={language === 'en' ? 'text-stone-950 font-black' : 'text-stone-500 font-bold hover:text-stone-700'}>EN</span>
                {language === 'en' && (
                  <motion.span
                    layoutId="desktopActiveLang"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm border border-stone-200/40"
                  />
                )}
              </button>
              
              <button 
                onClick={() => setLanguage('es')} 
                className="relative z-10 px-3 py-1.5 rounded-full transition-colors cursor-pointer select-none"
              >
                <span className={language === 'es' ? 'text-stone-950 font-black' : 'text-stone-500 font-bold hover:text-stone-700'}>ES</span>
                {language === 'es' && (
                  <motion.span
                    layoutId="desktopActiveLang"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm border border-stone-200/40"
                  />
                )}
              </button>
            </div>

            {/* Live Visual Editor Toggle for Hans */}
            {isAdminAuthorized && !isAdminMode && (
              <button
                onClick={() => setIsVisualEditMode?.(!isVisualEditMode)}
                className={`flex items-center space-x-1.5 py-2 px-4 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border transition-all cursor-pointer ${
                  isVisualEditMode
                    ? 'bg-[#E53E3E] border-[#E53E3E] text-white font-black shadow-lg shadow-rose-500/20 animate-pulse'
                    : 'bg-transparent border-stone-200 text-[#E53E3E] hover:border-[#E53E3E] hover:bg-rose-50/50'
                }`}
                id="nav-visual-editor-toggle"
                title={language === 'en' ? 'Toggle In-Place Page Editor' : 'Activar Editor Visual en la Página'}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>{isVisualEditMode ? (language === 'en' ? 'Editor Active' : 'Editor Activo') : (language === 'en' ? 'Visual Editor' : 'Editor Visual')}</span>
              </button>
            )}

            {/* Artist Portal Mode Trigger - Only visible when Hans is logged in via URL */}
            {isAdminAuthorized && (
              <>
                <button
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`flex items-center space-x-1.5 py-2 px-4 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border transition-all cursor-pointer ${
                    isAdminMode 
                      ? 'bg-amber-500 border-amber-500 text-white font-black shadow-lg shadow-amber-500/20' 
                      : 'bg-stone-100 border-stone-200 text-stone-800 hover:border-stone-400'
                  }`}
                  id="nav-admin-toggle"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{isAdminMode ? t.portalModeToggleClient : t.navArtistPortal}</span>
                </button>

                {/* Secure Logout Button */}
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1.5 py-2 px-3.5 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer"
                  id="nav-logout-btn"
                  title={language === 'en' ? 'Log Out of Admin' : 'Cerrar Sesión de Admin'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Logout' : 'Salir'}</span>
                </button>
              </>
            )}


          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2" id="nav-mobile-controls">
            {/* Quick Language Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              className="px-3 py-1.5 text-stone-700 hover:text-black border border-stone-200 rounded-full font-bold text-[10px] tracking-wider cursor-pointer hover:bg-stone-50 flex items-center space-x-1.5 overflow-hidden min-w-[65px] justify-center"
              id="nav-lang-toggle-mobile"
            >
              <motion.div
                animate={{ rotate: language === 'en' ? 0 : 360 }}
                transition={{ type: "spring", stiffness: 220, damping: 16 }}
              >
                <Languages className="w-3.5 h-3.5 text-stone-400" />
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={language}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="block font-black"
                >
                  {language.toUpperCase()}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Quick Visual Editor Toggle Mobile */}
            {isAdminAuthorized && !isAdminMode && (
              <button
                onClick={() => setIsVisualEditMode?.(!isVisualEditMode)}
                className={`p-2 border rounded-full cursor-pointer transition-all ${
                  isVisualEditMode ? 'bg-[#E53E3E] border-[#E53E3E] text-white animate-pulse' : 'text-[#E53E3E] border-stone-200 hover:bg-rose-50'
                }`}
                id="nav-visual-editor-toggle-mobile"
                title="Visual Editor"
              >
                <PenTool className="w-4 h-4" />
              </button>
            )}

            {/* Quick Admin Toggle */}
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`p-2 border rounded-full cursor-pointer transition-all ${
                isAdminMode ? 'bg-amber-500 border-amber-500 text-white' : 'text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
              id="nav-admin-toggle-mobile"
              title="Artist Admin"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-[#1A1A1A] hover:bg-stone-100 rounded-full cursor-pointer"
              id="nav-hamburger"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-xl rounded-b-2xl mx-2 overflow-hidden animate-fadeIn absolute left-0 right-0 top-20 z-50" id="nav-mobile-menu">
          <div className="px-4 py-4 space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="block w-full text-left px-4 py-3 rounded-xl text-stone-850 hover:bg-stone-50 text-xs font-bold uppercase tracking-[0.15em] transition-colors"
                id={`nav-mobile-link-${item.id}`}
              >
                {item.label}
              </button>
            ))}



            {/* Mobile Admin Controls - Only visible when Hans is logged in */}
            {isAdminAuthorized && (
              <div className="pt-2 pb-1 border-t border-stone-100 mt-2 space-y-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsAdminMode(!isAdminMode);
                  }}
                  className="flex items-center space-x-2 w-full text-left px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold uppercase tracking-wider"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  <span>{isAdminMode ? (language === 'en' ? 'View as Client' : 'Ver como Cliente') : (language === 'en' ? 'Admin Dashboard' : 'Panel de Admin')}</span>
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout?.();
                  }}
                  className="flex items-center space-x-2 w-full text-left px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold uppercase tracking-wider"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{language === 'en' ? 'Log Out' : 'Cerrar Sesión'}</span>
                </button>
              </div>
            )}

            <div className="pt-3 flex items-center justify-between px-4 border-t border-stone-100 mt-2">
              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">INSTAGRAM</span>
              <a
                href="https://instagram.com/hansttoo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 text-stone-800 font-bold text-xs hover:text-[#E53E3E] transition-colors"
                id="nav-insta-mobile"
              >
                <Instagram className="w-4 h-4 text-[#E53E3E]" />
                <span>@hansttoo</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
