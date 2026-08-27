import React from 'react';
import { motion } from 'motion/react';
import { Instagram, ExternalLink, Heart, MessageCircle, Sparkles, Play, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface InstagramFeedProps {
  language: Language;
  instagramUsername?: string;
  instagramWidgetUrl?: string;
  isVisualEditMode?: boolean;
  onEditElement?: (type: 'text' | 'image' | 'portfolio' | 'faq', key: string, label?: string, data?: any) => void;
  customTranslations?: any;
}

interface CuratedPost {
  id: string;
  url: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  captionEn: string;
  captionEs: string;
  likes: number;
  comments: number;
}

const DEFAULT_POSTS: CuratedPost[] = [
  {
    id: 'post-1',
    url: 'https://instagram.com/hansttoo',
    mediaUrl: '/imagenes/618566702_17993600897909063_7495797081353944212_n.webp',
    mediaType: 'image',
    captionEn: 'Fine line floral arm piece with single-needle botanical details.',
    captionEs: 'Pieza floral de línea fina con detalles botánicos de aguja única.',
    likes: 342,
    comments: 28
  },
  {
    id: 'post-2',
    url: 'https://instagram.com/hansttoo',
    mediaUrl: '/imagenes/670269533_18413738419193052_847837387206417634_n.webp',
    mediaType: 'image',
    captionEn: 'Custom Anime Manga panel tattoo. Crisp high-contrast blackwork.',
    captionEs: 'Tatuaje de panel de manga anime personalizado. Blackwork nítido de alto contraste.',
    likes: 519,
    comments: 44
  },
  {
    id: 'post-3',
    url: 'https://instagram.com/hansttoo',
    mediaUrl: '/imagenes/652855471_18094892003010550_8622873735825164680_n.webp',
    mediaType: 'image',
    captionEn: 'Microrealism timepiece with soft grey-wash gradient shading.',
    captionEs: 'Reloj en microrrealismo con degradados suaves en escala de grises.',
    likes: 412,
    comments: 31
  },
  {
    id: 'post-4',
    url: 'https://instagram.com/hansttoo',
    mediaUrl: '/imagenes/IMG_1450.JPG.jpeg',
    mediaType: 'image',
    captionEn: 'Geometric single-needle spine alignment at Gara Art Studio NYC.',
    captionEs: 'Alineación geométrica de aguja única en columna en Gara Art Studio NYC.',
    likes: 628,
    comments: 53
  },
  {
    id: 'post-5',
    url: 'https://instagram.com/hansttoo',
    mediaUrl: '/imagenes/IMG_1451.JPG.jpeg',
    mediaType: 'image',
    captionEn: 'Delicate fine line script and organic floral contours.',
    captionEs: 'Caligrafía delicada de línea fina y contornos botánicos orgánicos.',
    likes: 287,
    comments: 19
  },
  {
    id: 'post-6',
    url: 'https://instagram.com/hansttoo',
    mediaUrl: '/imagenes/IMG_1449.JPG.jpeg',
    mediaType: 'image',
    captionEn: 'Studio vibes & custom flash designs ready for booking.',
    captionEs: 'Ambiente en el estudio y diseños flash personalizados listos para agendar.',
    likes: 476,
    comments: 39
  }
];

export default function InstagramFeed({
  language,
  instagramUsername = 'hansttoo',
  instagramWidgetUrl = '',
  isVisualEditMode = false,
  onEditElement,
  customTranslations
}: InstagramFeedProps) {
  const t = customTranslations?.[language] || translations[language] || translations.en;

  const sectionBadge = t.instagramBadge || (language === 'en' ? 'INSTAGRAM COMMUNITY' : 'COMUNIDAD DE INSTAGRAM');
  const sectionTitle = t.instagramTitle || (language === 'en' ? 'Live Instagram Feed' : 'Feed de Instagram en Vivo');
  const rawSubtitle = t.instagramSubtitle || (language === 'en'
    ? 'Follow @{username} for live session updates, fresh sketches, and behind-the-scenes tattoo process videos.'
    : 'Sigue a @{username} para ver actualizaciones de sesiones en vivo, bocetos frescos y videos del proceso de tatuaje detrás de escena.');
  const sectionSubtitle = rawSubtitle.replace('{username}', instagramUsername);
  const followBtnText = (t.instagramFollowBtn || (language === 'en' ? 'Follow @{username}' : 'Seguir a @{username}')).replace('{username}', instagramUsername);

  const artistAvatar = customTranslations?.artistPhoto || localStorage.getItem('hans_custom_artist_photo') || '/imagenes/IMG_1453.JPG.jpeg';

  // Check if user provided an iframe or embed URL
  const isEmbedCode = instagramWidgetUrl && (
    instagramWidgetUrl.includes('<iframe') || 
    instagramWidgetUrl.includes('behold.so') || 
    instagramWidgetUrl.includes('lightwidget') || 
    instagramWidgetUrl.includes('elfsight') || 
    instagramWidgetUrl.includes('snapwidget') ||
    instagramWidgetUrl.startsWith('http')
  );

  const getCleanIframeSrc = (input: string) => {
    if (input.includes('<iframe')) {
      const match = input.match(/src=["']([^"']+)["']/);
      if (match && match[1]) return match[1];
    }
    return input;
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FCFBFA] border-b border-stone-200/80 relative overflow-hidden" id="instagram-feed">
      {/* Background Subtle Watermark */}
      <div className="absolute left-[-2%] bottom-[5%] text-[90px] sm:text-[140px] font-black text-[#1A1A1A]/[0.015] select-none pointer-events-none lowercase tracking-tighter z-0">
        @hansttoo
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-50 text-[#E53E3E] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] border border-rose-100"
            onClick={() => {
              if (isVisualEditMode && onEditElement) {
                onEditElement('text', 'instagramBadge', 'Instagram Section Badge', {
                  en: customTranslations?.en?.instagramBadge || translations.en.instagramTitle,
                  es: customTranslations?.es?.instagramBadge || translations.es.instagramTitle
                });
              }
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className={isVisualEditMode ? 'cursor-pointer hover:underline' : ''}>{sectionBadge}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => {
              if (isVisualEditMode && onEditElement) {
                onEditElement('text', 'instagramTitle', 'Instagram Section Title', {
                  en: customTranslations?.en?.instagramTitle || translations.en.instagramTitle,
                  es: customTranslations?.es?.instagramTitle || translations.es.instagramTitle
                });
              }
            }}
            className={`text-3xl sm:text-5xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none ${
              isVisualEditMode ? 'cursor-pointer border border-dashed border-amber-400 p-2 rounded-xl bg-amber-50/20' : ''
            }`}
          >
            {sectionTitle}<span className="text-[#E53E3E]">.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => {
              if (isVisualEditMode && onEditElement) {
                onEditElement('text', 'instagramSubtitle', 'Instagram Section Subtitle', {
                  en: customTranslations?.en?.instagramSubtitle || translations.en.instagramSubtitle,
                  es: customTranslations?.es?.instagramSubtitle || translations.es.instagramSubtitle
                });
              }
            }}
            className={`text-xs sm:text-sm font-medium text-stone-500 max-w-xl mx-auto ${
              isVisualEditMode ? 'cursor-pointer border border-dashed border-amber-400 p-2 rounded-xl bg-amber-50/20' : ''
            }`}
          >
            {sectionSubtitle}
          </motion.p>
        </div>

        {/* Profile Card Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-6 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden ring-3 ring-[#E53E3E] ring-offset-2 bg-stone-900 shadow-md">
                <img
                  src={artistAvatar}
                  alt={instagramUsername}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/imagenes/IMG_1453.JPG.jpeg';
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-[#E53E3E] to-rose-400 text-white p-1 rounded-full shadow-sm">
                <Instagram className="w-3 h-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">@{instagramUsername}</h3>
                <CheckCircle2 className="w-4 h-4 text-[#E53E3E] fill-current" />
              </div>
              <p className="text-xs text-stone-500 font-medium">
                {language === 'en' ? 'Hans Toribio • NYC Resident Artist @ Gara Art Studio' : 'Hans Toribio • Artista Residente NYC @ Gara Art Studio'}
              </p>
              <div className="flex items-center space-x-3 text-[11px] font-bold text-stone-400 pt-1 font-mono">
                <span>NYC • TIMES SQUARE</span>
                <span>•</span>
                <span className="text-emerald-600 font-bold">{language === 'en' ? '● OPEN FOR BOOKING' : '● AGENDA ABIERTA'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#E53E3E] to-rose-600 hover:from-black hover:to-black text-white rounded-full font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 group"
            >
              <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{followBtnText}</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-75" />
            </a>
          </div>
        </motion.div>

        {/* Dynamic Content: Live Embed or High-Res Curated Feed */}
        {isEmbedCode ? (
          <div className="rounded-3xl overflow-hidden border border-stone-200 bg-white p-4 shadow-sm min-h-[380px]">
            <iframe
              src={getCleanIframeSrc(instagramWidgetUrl)}
              className="w-full min-h-[480px] border-0 rounded-2xl"
              title="Instagram Live Widget"
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {DEFAULT_POSTS.map((post, idx) => {
              const caption = language === 'en' ? post.captionEn : post.captionEs;
              return (
                <motion.a
                  key={post.id}
                  href={`https://instagram.com/${instagramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group relative aspect-square overflow-hidden rounded-2xl bg-stone-900 border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-500 block"
                >
                  <img
                    src={post.mediaUrl}
                    alt={caption}
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110 filter group-hover:contrast-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/imagenes/IMG_1453.JPG.jpeg';
                    }}
                  />

                  {/* Dark Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 text-white">
                    <div className="flex items-center justify-between">
                      <Instagram className="w-4 h-4 text-[#E53E3E]" />
                      <ExternalLink className="w-3.5 h-3.5 text-stone-300" />
                    </div>

                    <p className="text-[10px] font-medium leading-tight line-clamp-3 text-stone-200">
                      {caption}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-bold text-white pt-1 border-t border-white/15">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3 text-rose-500 fill-current" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3 text-stone-300" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        )}

        {/* Footer CTA */}
        <div className="text-center mt-8">
          <a
            href={`https://instagram.com/${instagramUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-stone-600 hover:text-[#E53E3E] transition-colors py-2 px-4 rounded-full border border-stone-200 hover:border-[#E53E3E]/40 bg-white shadow-2xs"
          >
            <Instagram className="w-3.5 h-3.5 text-[#E53E3E]" />
            <span>{language === 'en' ? 'View more designs on @hansttoo' : 'Ver más diseños en @hansttoo'}</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>

      </div>
    </section>
  );
}
