import { motion } from 'motion/react';
import { ArrowRight, Instagram, Sparkles, PenTool, Play } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { isVideoUrl, getGoogleDriveEmbedUrl } from '../lib/media';

interface HeroProps {
  language: Language;
  onNavigate: (sectionId: string) => void;
  isVisualEditMode?: boolean;
  onEditElement?: (type: 'text' | 'image' | 'portfolio' | 'faq', key: string, label?: string, data?: any) => void;
  introPhotos?: Array<{ url: string; labelEn: string; labelEs: string; mediaType?: 'image' | 'video' }>;
  customTranslations?: any;
}

export default function Hero({
  language,
  onNavigate,
  isVisualEditMode = false,
  onEditElement,
  introPhotos: introPhotosProp,
  customTranslations
}: HeroProps) {
  const t = customTranslations?.[language] || translations[language];

  // A curated selection of high-quality, high-contrast aesthetic photos of tattoo artwork & studio vibes
  const defaultIntroPhotos: Array<{ url: string; labelEn: string; labelEs: string; mediaType?: 'image' | 'video' }> = [
    {
      url: 'https://images.unsplash.com/photo-1542382156909-9ae3b0245754?auto=format&fit=crop&q=80&w=400',
      labelEn: 'Fine Line Art',
      labelEs: 'Arte Línea Fina',
    },
    {
      url: '/imagenes/618566702_17993600897909063_7495797081353944212_n.webp',
      labelEn: 'Ink Precision',
      labelEs: 'Precisión de Tinta',
    },
    {
      url: '/imagenes/670269533_18413738419193052_847837387206417634_n.webp',
      labelEn: 'Anime Craft',
      labelEs: 'Estilo Anime',
    },
    {
      url: '/imagenes/IMG_1449.JPG.jpeg',
      labelEn: 'Studio Space',
      labelEs: 'Espacio de Estudio',
    },
  ];

  const finalPhotos = introPhotosProp || defaultIntroPhotos;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FCFBFA] to-white pt-6 pb-10 sm:pt-10 sm:pb-14 border-b border-stone-100" id="hero">
      
      {/* Absolute background watermark */}
      <div className="absolute right-[-5%] top-[5%] text-[120px] sm:text-[180px] font-black text-[#1A1A1A]/[0.015] select-none pointer-events-none lowercase tracking-tighter z-0">
        hansttoo
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Main Content Layout */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-4 sm:space-y-5 mb-8 sm:mb-10">
          
          {/* Instagram Link only - no Private Studio references */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center"
            id="hero-header-meta"
          >
            {/* Highly Prominent Instagram Badge */}
            <a 
              href="https://instagram.com/hansttoo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-stone-850 hover:text-white text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] bg-white hover:bg-[#E53E3E] border border-stone-200 hover:border-[#E53E3E] shadow-sm px-5 py-2 rounded-full transition-all duration-350 transform hover:scale-105 active:scale-95"
              id="hero-insta-pill"
            >
              <Instagram className="w-3.5 h-3.5 text-[#E53E3E] group-hover:text-white" />
              <span>Instagram @hansttoo</span>
            </a>
          </motion.div>

          {/* Simple, Giant, Elegant Brand Name */}
          <div className="space-y-1.5">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-[#1A1A1A] lowercase leading-none"
              id="hero-main-title"
            >
              hansttoo<span className="text-[#E53E3E]">.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              onClick={() => {
                if (isVisualEditMode && onEditElement) {
                  onEditElement('text', 'brandSubtitle', 'Hero Tagline', {
                    en: customTranslations?.en?.brandSubtitle || 'FINE LINE • MICROREALISM • ANIME',
                    es: customTranslations?.es?.brandSubtitle || 'LÍNEA FINA • MICRORREALISMO • ANIME'
                  });
                }
              }}
              className={`text-xs sm:text-sm font-black tracking-[0.25em] text-[#1A1A1A]/40 uppercase inline-block ${
                isVisualEditMode ? 'cursor-pointer hover:underline text-amber-600' : ''
              }`}
              id="hero-styles-tagline"
            >
              {customTranslations?.[language]?.brandSubtitle || (language === 'en' ? 'FINE LINE • MICROREALISM • ANIME' : 'LÍNEA FINA • MICRORREALISMO • ANIME')}
            </motion.p>
          </div>

          {/* Subtitle - Reduced size & elegant (Made Editable!) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="w-full flex justify-center"
          >
            <p
              onClick={() => {
                if (isVisualEditMode) {
                  onEditElement?.('text', 'heroSubtitle', 'Hero Subtitle', {
                    en: customTranslations?.en?.heroSubtitle || t.heroSubtitle,
                    es: customTranslations?.es?.heroSubtitle || t.heroSubtitle
                  });
                }
              }}
              className={`text-xs sm:text-sm text-stone-500 font-medium max-w-2xl leading-relaxed transition-all duration-300 relative group p-1.5 ${
                isVisualEditMode
                  ? 'cursor-pointer border-2 border-dashed border-amber-400 p-3 rounded-2xl bg-amber-50/10 hover:bg-amber-50/30 hover:border-amber-600'
                  : ''
              }`}
              id="hero-tagline"
            >
              {isVisualEditMode && (
                <span className="absolute -top-3.5 right-4 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm z-20 group-hover:bg-amber-600 flex items-center space-x-1 animate-bounce">
                  <PenTool className="w-2.5 h-2.5" />
                  <span>Click to Edit Text</span>
                </span>
              )}
              {t.heroSubtitle}
            </p>
          </motion.div>

          {/* Clean, heavy solid CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto pt-1"
            id="hero-action-buttons"
          >
            <button
              onClick={() => onNavigate('booking')}
              className="group w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 bg-[#E53E3E] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-full transition-all duration-300 cursor-pointer shadow-lg shadow-rose-500/10 hover:bg-black hover:shadow-xl hover:shadow-stone-900/10 active:scale-[0.98]"
              id="hero-btn-book"
            >
              <span>{language === 'en' ? 'BOOK INQUIRY' : 'FORMULARIO DE CONSULTA'}</span>
              <ArrowRight className="w-4 h-4 ml-2.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('portfolio')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 bg-white text-stone-800 font-black uppercase tracking-[0.2em] text-[10px] rounded-full border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all duration-300 cursor-pointer shadow-sm active:scale-[0.98]"
              id="hero-btn-gallery"
            >
              {language === 'en' ? 'VIEW GALLERY' : 'VER GALERÍA'}
            </button>
          </motion.div>

        </div>

        {/* Curator Photo Grid: "unas cuantas fotos al inicial" */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          id="hero-photo-grid"
        >
          {finalPhotos.map((photo, idx) => {
            const photoLabel = language === 'en' ? (photo.labelEn || photo.labelEn === '' ? photo.labelEn : (photo as any).label) : (photo.labelEs || photo.labelEs === '' ? photo.labelEs : (photo as any).label);
            const isVideo = photo.mediaType === 'video' || isVideoUrl(photo.url);
            const driveEmbedUrl = getGoogleDriveEmbedUrl(photo.url);
            return (
              <div 
                key={idx}
                onClick={() => {
                  if (isVisualEditMode) {
                    onEditElement?.('image', `introPhoto-${idx}`, `Hero Grid Image #${idx + 1}`, {
                      url: photo.url,
                      mediaType: photo.mediaType,
                      labelEn: photo.labelEn || (photo as any).label || '',
                      labelEs: photo.labelEs || (photo as any).label || ''
                    });
                  }
                }}
                className={`relative aspect-[3/4] overflow-hidden rounded-2xl border bg-stone-50 shadow-md group transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5 ${
                  isVisualEditMode
                    ? 'cursor-pointer border-2 border-dashed border-amber-400 hover:border-amber-600'
                    : 'border-stone-100'
                }`}
                id={`hero-photo-container-${idx}`}
              >
                {isVideo ? (
                  driveEmbedUrl ? (
                    <iframe
                      src={driveEmbedUrl}
                      className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 pointer-events-none border-0"
                      title={photoLabel || 'Studio Artwork'}
                      allow="autoplay; encrypted-media"
                    />
                  ) : (
                    <video
                      src={photo.url}
                      className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 ease-in-out group-hover:scale-105"
                      autoPlay
                      loop
                      muted
                      playsInline
                      ref={(el) => {
                        if (el) {
                          el.muted = true;
                          el.play().catch(() => {});
                        }
                      }}
                    />
                  )
                ) : (
                  <img 
                    src={photo.url} 
                    alt={photoLabel || 'Studio Artwork'}
                    className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 ease-in-out group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* Floating Play Icon indicator for looping videos */}
                {isVideo && (
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-1.5 rounded-full z-10 shadow-sm border border-white/10">
                    <Play className="w-3 h-3 fill-current text-white" />
                  </div>
                )}
                
                {isVisualEditMode && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <span className="bg-amber-500 text-white text-[9px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-wider shadow-md flex items-center space-x-1">
                      <PenTool className="w-2.5 h-2.5" />
                      <span>{isVideo ? 'Change Video' : 'Change Image'}</span>
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                {/* Floating label overlay */}
                {photoLabel && (
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-widest shadow-sm">
                    {photoLabel}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
