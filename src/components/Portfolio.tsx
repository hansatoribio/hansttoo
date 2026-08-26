import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PortfolioItem, Language, TattooStyle } from '../types';
import { translations } from '../translations';
import { X, Plus, PenTool, Play } from 'lucide-react';
import { isVideoUrl, getGoogleDriveEmbedUrl } from '../lib/media';

interface PortfolioCardProps {
  key?: string;
  item: PortfolioItem;
  language: Language;
  isVisualEditMode: boolean;
  onEditElement?: (type: 'text' | 'image' | 'portfolio' | 'faq' | 'new-portfolio', key: string, label?: string, data?: any) => void;
  setActiveItem: React.Dispatch<React.SetStateAction<PortfolioItem | null>>;
  copiedId: string | null;
  onShare: (e: React.MouseEvent, item: PortfolioItem) => void;
}

function PortfolioCard({
  item,
  language,
  isVisualEditMode,
  onEditElement,
  setActiveItem,
  copiedId,
  onShare
}: PortfolioCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoadComplete = () => {
    setIsLoaded(true);
  };

  const isVideo = item.mediaType === 'video' || isVideoUrl(item.imageUrl);
  const driveEmbedUrl = getGoogleDriveEmbedUrl(item.imageUrl);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`group relative aspect-square overflow-hidden rounded-2xl bg-stone-50 border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-2xl ${
        isVisualEditMode 
          ? 'border-dashed border-amber-400 hover:border-amber-600'
          : 'border-stone-100/40 hover:border-stone-200'
      }`}
      onClick={() => {
        if (isVisualEditMode) {
          onEditElement?.('portfolio', 'item', 'Edit Portfolio Design', item);
        } else {
          setActiveItem(item);
        }
      }}
      id={`portfolio-card-${item.id}`}
    >
      {/* Subtle skeleton loader overlay */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-stone-100 flex flex-col items-center justify-center z-5"
          >
            {/* Elegant pulse skeleton */}
            <div className="absolute inset-0 bg-stone-200/40 animate-pulse" />
            
            {/* Ink drop / loading indicator inside the skeleton */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin" />
              <span className="text-[8px] font-black tracking-widest text-stone-400 uppercase mt-1">
                {language === 'en' ? 'LOADING' : 'CARGANDO'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render Media */}
      <div className={`w-full h-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {isVideo ? (
          driveEmbedUrl ? (
            <div className="w-full h-full relative">
              <iframe
                src={driveEmbedUrl}
                onLoad={handleLoadComplete}
                className="w-full h-full object-cover border-0 pointer-events-none filter grayscale hover:grayscale-0 transition-all duration-700"
                title={language === 'en' ? item.titleEn : item.titleEs}
              />
              {/* Floating Play Indicator Badge */}
              <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md border border-white/20 text-white p-1.5 rounded-full z-10">
                <Play className="w-3 h-3 fill-current text-white" />
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative">
              <video
                src={item.imageUrl}
                onLoadedData={handleLoadComplete}
                onError={handleLoadComplete}
                className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 filter grayscale hover:grayscale-0"
                muted
                loop
                playsInline
                autoPlay
              />
              {/* Floating Play Indicator Badge */}
              <div className="absolute top-3 right-3 bg-[#E53E3E] text-white p-1.5 rounded-full z-10 shadow-md">
                <Play className="w-3 h-3 fill-current text-white" />
              </div>
            </div>
          )
        ) : (
          <img
            src={item.imageUrl}
            alt={language === 'en' ? item.titleEn : item.titleEs}
            onLoad={handleLoadComplete}
            onError={handleLoadComplete}
            className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 filter grayscale hover:grayscale-0"
            referrerPolicy="no-referrer"
            id={`portfolio-img-${item.id}`}
          />
        )}
      </div>
      
      {/* Visual indicator overlay - Only in admin visual edit mode */}
      {isVisualEditMode && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <div className="bg-amber-500 text-white text-[10px] font-black px-3.5 py-2 rounded-xl shadow-md flex items-center space-x-1.5 uppercase tracking-wider transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <PenTool className="w-3.5 h-3.5" />
            <span>Edit Artwork</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface PortfolioProps {
  language: Language;
  onInquireSimilar: (style: TattooStyle, title?: string) => void;
  portfolioItems: PortfolioItem[];
  isVisualEditMode?: boolean;
  onEditElement?: (type: 'text' | 'image' | 'portfolio' | 'faq' | 'new-portfolio', key: string, label?: string, data?: any) => void;
}

export default function Portfolio({ 
  language, 
  onInquireSimilar, 
  portfolioItems,
  isVisualEditMode = false,
  onEditElement
}: PortfolioProps) {
  const t = translations[language];
  const [selectedFilter, setSelectedFilter] = useState<TattooStyle | 'all'>('all');
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Deep linking to portfolio items on mount and URL changes
  useEffect(() => {
    const handleUrlCheck = () => {
      const params = new URLSearchParams(window.location.search);
      const designId = params.get('design');
      if (designId) {
        const item = portfolioItems.find((p) => p.id === designId);
        if (item) {
          setActiveItem(item);
          // Smooth scroll to portfolio section
          setTimeout(() => {
            const portfolioSec = document.getElementById('portfolio');
            if (portfolioSec) {
              portfolioSec.scrollIntoView({ behavior: 'smooth' });
            }
          }, 300);
        } else {
          setActiveItem(null);
        }
      } else {
        setActiveItem(null);
      }
    };

    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    return () => window.removeEventListener('popstate', handleUrlCheck);
  }, [portfolioItems]);

  // Sync state to URL and metadata tags
  useEffect(() => {
    // 1. Update URL search query
    const currentUrl = new URL(window.location.href);
    const urlDesignId = currentUrl.searchParams.get('design');
    
    if (activeItem) {
      if (urlDesignId !== activeItem.id) {
        currentUrl.searchParams.set('design', activeItem.id);
        window.history.pushState({ designId: activeItem.id }, '', currentUrl.toString());
      }
    } else {
      if (urlDesignId !== null) {
        currentUrl.searchParams.delete('design');
        window.history.pushState({}, '', currentUrl.toString());
      }
    }

    // 2. Dynamic SEO metadata injection (Open Graph & Twitter Card tags)
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Store original metadata if not already done
    const win = window as any;
    if (!win.__defaultMeta) {
      win.__defaultMeta = {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
        ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
        ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
        ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute('content') || '',
        twitterTitle: document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || '',
        twitterDescription: document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || '',
        twitterImage: document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || '',
      };
    }

    if (activeItem) {
      const title = language === 'en' ? activeItem.titleEn : activeItem.titleEs;
      const desc = language === 'en' ? activeItem.storyEn : activeItem.storyEs;
      const image = activeItem.imageUrl;
      const shareUrl = `${window.location.origin}${window.location.pathname}?design=${activeItem.id}`;

      // Update title
      document.title = `${title} | Hans Tattoo NYC`;

      // Update Open Graph tags
      setMetaTag('description', desc);
      setMetaTag('og:title', `${title} | Hans Tattoo NYC`, true);
      setMetaTag('og:description', desc, true);
      setMetaTag('og:image', image, true);
      setMetaTag('og:url', shareUrl, true);

      // Update Twitter Card tags
      setMetaTag('twitter:title', `${title} | Hans Tattoo NYC`);
      setMetaTag('twitter:description', desc);
      setMetaTag('twitter:image', image);
    } else {
      // Revert to default metadata
      const def = win.__defaultMeta;
      if (def) {
        document.title = def.title;
        setMetaTag('description', def.description);
        setMetaTag('og:title', def.ogTitle, true);
        setMetaTag('og:description', def.ogDescription, true);
        setMetaTag('og:image', def.ogImage, true);
        setMetaTag('og:url', def.ogUrl, true);

        setMetaTag('twitter:title', def.twitterTitle);
        setMetaTag('twitter:description', def.twitterDescription);
        setMetaTag('twitter:image', def.twitterImage);
      }
    }
  }, [activeItem, language]);

  const handleShare = (e: React.MouseEvent, item: PortfolioItem) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?design=${item.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy to clipboard, falling back to image URL:', err);
        navigator.clipboard.writeText(item.imageUrl).then(() => {
          setCopiedId(item.id);
          setTimeout(() => setCopiedId(null), 2000);
        });
      });
  };

  // Lock body scroll when lightbox is active
  useEffect(() => {
    if (activeItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeItem]);

  const filters: { id: TattooStyle | 'all'; label: string }[] = [
    { id: 'all', label: t.filterAll },
    { id: 'fineline', label: t.filterFineline },
    { id: 'microrealism', label: t.filterMicrorealism },
    { id: 'anime', label: t.filterAnime },
  ];

  const filteredItems = selectedFilter === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => item.style === selectedFilter);

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-stone-100" id="portfolio">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[10px] font-black tracking-[0.25em] text-[#E53E3E] uppercase flex items-center justify-center gap-1">
            {isVisualEditMode && <PenTool className="w-3.5 h-3.5" />}
            {language === 'en' ? 'SELECTED RECENT INK' : 'RECIENTES SELECCIONADOS'}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#1A1A1A] tracking-tighter uppercase mt-2 leading-none">
            {t.portfolioTitle}<span className="text-[#E53E3E]">.</span>
          </h2>
          <p className="text-stone-500 text-sm mt-3 leading-relaxed font-sans">
            {t.portfolioSubtitle}
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-2xl mx-auto px-1" id="portfolio-filters">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-[11px] font-black tracking-[0.08em] sm:tracking-[0.1em] uppercase transition-all duration-300 cursor-pointer border active:scale-95 ${
                  selectedFilter === filter.id
                    ? 'bg-stone-900 border-stone-900 text-white shadow-md shadow-stone-900/15'
                    : 'bg-stone-50 border-stone-200/60 text-stone-700 hover:bg-stone-100 hover:border-stone-300'
                }`}
                id={`filter-btn-${filter.id}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Grid */}
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          id="portfolio-grid"
        >
          {/* Add New Design Card for Hans when Visual Editor is Active */}
          {isVisualEditMode && (
            <motion.div
              layout
              onClick={() => onEditElement?.('new-portfolio', 'new-item', 'New Portfolio Item', {})}
              className="aspect-square flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E53E3E] bg-rose-50/5 hover:bg-rose-50/20 hover:border-black transition-all cursor-pointer group p-6"
              id="portfolio-add-new-card"
            >
              <div className="h-12 w-12 rounded-full border border-[#E53E3E]/30 bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-3 shadow-sm">
                <Plus className="w-6 h-6 text-[#E53E3E]" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-stone-850 group-hover:text-[#E53E3E]">
                {language === 'en' ? 'Add New Design' : 'Añadir Diseño'}
              </span>
              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider mt-1 text-center">
                {language === 'en' ? 'Upload Image & Details' : 'Subir Imagen y Detalles'}
              </span>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <PortfolioCard
                key={item.id}
                item={item}
                language={language}
                isVisualEditMode={isVisualEditMode}
                onEditElement={onEditElement}
                setActiveItem={setActiveItem}
                copiedId={copiedId}
                onShare={handleShare}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* No items fallback */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-stone-400 font-bold uppercase tracking-widest text-xs">
            {language === 'en' ? 'No items available in this category.' : 'No hay diseños disponibles en esta categoría.'}
          </div>
        )}

        {/* Clean, Fullscreen Lightbox Image Viewer - Rendered in a Portal */}
        {createPortal(
          <AnimatePresence>
            {activeItem && (
              <div 
                className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none" 
                id="portfolio-modal-wrapper"
              >
                {/* Dark Ambient Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveItem(null)}
                  className="fixed inset-0 bg-black/90 backdrop-blur-md cursor-zoom-out"
                />

                {/* Lightbox Container */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="relative max-w-4xl max-h-[90vh] w-full bg-stone-950/80 rounded-2xl sm:rounded-3xl border border-stone-800/80 shadow-2xl overflow-hidden z-[101] flex flex-col items-center justify-center p-2 sm:p-4 cursor-default"
                  id="portfolio-detail-modal"
                >
                  {/* Top Floating Close Button */}
                  <button
                    onClick={() => setActiveItem(null)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-black/70 hover:bg-black text-stone-200 hover:text-white transition-colors cursor-pointer z-20 border border-white/10"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Center: Full photo / video display */}
                  <div className="w-full flex items-center justify-center overflow-hidden relative min-h-[250px] max-h-[82vh]">
                    {activeItem.mediaType === 'video' || isVideoUrl(activeItem.imageUrl) ? (
                      getGoogleDriveEmbedUrl(activeItem.imageUrl) ? (
                        <iframe
                          src={getGoogleDriveEmbedUrl(activeItem.imageUrl)!}
                          className="w-full h-full min-h-[350px] max-h-[80vh] border-0 rounded-xl"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          title={language === 'en' ? activeItem.titleEn : activeItem.titleEs}
                        />
                      ) : (
                        <video
                          src={activeItem.imageUrl}
                          controls
                          autoPlay
                          className="max-w-full max-h-[80vh] object-contain rounded-xl"
                          id={`portfolio-lightbox-video-${activeItem.id}`}
                        />
                      )
                    ) : (
                      <img
                        src={activeItem.imageUrl}
                        alt={language === 'en' ? activeItem.titleEn : activeItem.titleEs}
                        className="max-w-full max-h-[82vh] object-contain rounded-xl select-none"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      </div>
    </section>
  );
}
