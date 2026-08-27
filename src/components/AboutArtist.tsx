import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, MapPin, Instagram, PenTool, Layers, Compass, ArrowRight, CheckCircle2, Play, Upload } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { isVideoUrl, getGoogleDriveEmbedUrl } from '../lib/media';

interface AboutArtistProps {
  language: Language;
  onNavigate: (sectionId: string) => void;
  isVisualEditMode?: boolean;
  onEditElement?: (type: 'text' | 'image' | 'portfolio' | 'faq', key: string, label?: string, data?: any) => void;
  customTranslations?: any;
}

export default function AboutArtist({
  language,
  onNavigate,
  isVisualEditMode = false,
  onEditElement,
  customTranslations
}: AboutArtistProps) {
  const t = customTranslations?.[language] || translations[language] || translations.en;

  const artistPhotoUrl = customTranslations?.artistPhoto || localStorage.getItem('hans_custom_artist_photo') || "/imagenes/IMG_1453.JPG.jpeg";
  const artistMediaType = customTranslations?.artistMediaType || localStorage.getItem('hans_custom_artist_media_type') || (isVideoUrl(artistPhotoUrl) ? 'video' : 'image');
  const isVideo = artistMediaType === 'video' || isVideoUrl(artistPhotoUrl);
  const driveEmbedUrl = getGoogleDriveEmbedUrl(artistPhotoUrl);

  const pillars = [
    {
      id: 'fineline',
      titleKey: 'aboutPillar1Title',
      descKey: 'aboutPillar1Desc',
      icon: PenTool,
      title: t.aboutPillar1Title || (language === 'en' ? 'Fine Line Mastery' : 'Dominio de Línea Fina'),
      desc: t.aboutPillar1Desc || (language === 'en' ? 'Delicate single-needle execution for weightless botanicals, fine script, and organic geometric flows.' : 'Ejecución delicada con aguja única para botánica ingrávida, caligrafía fina y trazos geométricos orgánicos.')
    },
    {
      id: 'anime',
      titleKey: 'aboutPillar2Title',
      descKey: 'aboutPillar2Desc',
      icon: Layers,
      title: t.aboutPillar2Title || (language === 'en' ? 'Anime & Manga Craft' : 'Arte Anime y Manga'),
      desc: t.aboutPillar2Desc || (language === 'en' ? 'Authentic panel adaptations, character portraits, and dynamic hand-hatched line weights honoring original comic art.' : 'Adaptaciones fieles de paneles, retratos de personajes y tramas manuales dinámicas que honran el arte original.')
    },
    {
      id: 'microrealism',
      titleKey: 'aboutPillar3Title',
      descKey: 'aboutPillar3Desc',
      icon: Compass,
      title: t.aboutPillar3Title || (language === 'en' ? 'Microrealism Precision' : 'Precisión en Microrrealismo'),
      desc: t.aboutPillar3Desc || (language === 'en' ? 'High-definition miniature portraiture and metallic gear mechanisms rendered with soft grey-wash gradients.' : 'Retratos en miniatura de alta definición y mecanismos metálicos renderizados con suaves escalas de grises.')
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FCFBFA] border-b border-stone-200/70 relative overflow-hidden" id="about">
      {/* Background Watermark */}
      <div className="absolute right-[-3%] top-[10%] text-[100px] sm:text-[160px] font-black text-[#1A1A1A]/[0.015] select-none pointer-events-none lowercase tracking-tighter z-0">
        artist
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onClick={() => {
              if (isVisualEditMode && onEditElement) {
                onEditElement('text', 'aboutBadge', 'About Badge', {
                  en: customTranslations?.en?.aboutBadge || translations.en.aboutBadge,
                  es: customTranslations?.es?.aboutBadge || translations.es.aboutBadge
                });
              }
            }}
            className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-stone-100 text-[#E53E3E] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] border border-stone-200/60 ${
              isVisualEditMode ? 'cursor-pointer hover:border-amber-400 hover:bg-amber-50' : ''
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.aboutBadge || (language === 'en' ? 'Meet the Artist' : 'Conoce al Artista')}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => {
              if (isVisualEditMode && onEditElement) {
                onEditElement('text', 'aboutTitle', 'About Section Title', {
                  en: customTranslations?.en?.aboutTitle || translations.en.aboutTitle,
                  es: customTranslations?.es?.aboutTitle || translations.es.aboutTitle
                });
              }
            }}
            className={`text-4xl sm:text-6xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none ${
              isVisualEditMode ? 'cursor-pointer border border-dashed border-amber-400 p-2 rounded-xl bg-amber-50/20' : ''
            }`}
          >
            {t.aboutTitle || 'Hans Toribio'}<span className="text-[#E53E3E]">.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => {
              if (isVisualEditMode && onEditElement) {
                onEditElement('text', 'aboutSubtitle', 'About Section Subtitle', {
                  en: customTranslations?.en?.aboutSubtitle || translations.en.aboutSubtitle,
                  es: customTranslations?.es?.aboutSubtitle || translations.es.aboutSubtitle
                });
              }
            }}
            className={`text-xs sm:text-sm font-bold tracking-[0.2em] text-stone-500 uppercase ${
              isVisualEditMode ? 'cursor-pointer border border-dashed border-amber-400 p-1.5 rounded-lg bg-amber-50/20' : ''
            }`}
          >
            {t.aboutSubtitle || (language === 'en' ? 'Fine Line • Microrealism • Custom Anime Specialist' : 'Especialista en Línea Fina • Microrrealismo • Anime Personalizado')}
          </motion.p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Side: Portrait & Studio Card (Supports Photo AND Video) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div
              onClick={() => {
                if (isVisualEditMode && onEditElement) {
                  onEditElement('image', 'artistPhoto', 'Foto o Video de Hans Toribio', {
                    url: artistPhotoUrl,
                    mediaType: isVideo ? 'video' : 'image',
                    labelEn: 'Hans Toribio',
                    labelEs: 'Hans Toribio'
                  });
                }
              }}
              className={`relative rounded-3xl overflow-hidden border bg-stone-900 shadow-xl shadow-stone-900/5 group w-full aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] max-h-[440px] ${
                isVisualEditMode ? 'cursor-pointer border-2 border-dashed border-amber-400 ring-4 ring-amber-400/20' : 'border-stone-200/80'
              }`}
            >
              {isVideo ? (
                driveEmbedUrl ? (
                  <iframe
                    src={driveEmbedUrl}
                    className="w-full h-full object-cover pointer-events-none border-0"
                    title="Hans Toribio Artist Video"
                    allow="autoplay; encrypted-media"
                  />
                ) : (
                  <video
                    src={artistPhotoUrl}
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
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
                  src={artistPhotoUrl}
                  alt="Hans Toribio - Tattoo Artist"
                  className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/imagenes/IMG_1453.JPG.jpeg";
                  }}
                />
              )}

              {/* Floating Play Indicator for Video */}
              {isVideo && (
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-2 rounded-full z-10 shadow-sm border border-white/20">
                  <Play className="w-3.5 h-3.5 fill-current text-white" />
                </div>
              )}

              {/* Visual Edit Helper Badge */}
              {isVisualEditMode && (
                <div className="absolute top-3 left-3 bg-amber-500 text-stone-950 font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1 z-20">
                  <Upload className="w-3 h-3" />
                  <span>{language === 'en' ? 'Click to Change Photo/Video' : 'Click para Cambiar Foto/Video'}</span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-90 pointer-events-none" />

              {/* Floating Studio Overlay Badge */}
              <div className="absolute bottom-4 left-4 right-4 space-y-2 text-white z-10">
                <div
                  onClick={(e) => {
                    if (isVisualEditMode && onEditElement) {
                      e.stopPropagation();
                      onEditElement('text', 'aboutStudioLocation', 'Studio Location Tag', {
                        en: customTranslations?.en?.aboutStudioLocation || translations.en.aboutStudioLocation,
                        es: customTranslations?.es?.aboutStudioLocation || translations.es.aboutStudioLocation
                      });
                    }
                  }}
                  className={`inline-flex items-center space-x-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/20 ${
                    isVisualEditMode ? 'cursor-pointer hover:bg-white/30' : ''
                  }`}
                >
                  <MapPin className="w-3 h-3 text-[#E53E3E]" />
                  <span>{t.aboutStudioLocation || (language === 'en' ? 'Times Square, New York • Gara Art Studio' : 'Times Square, Nueva York • Gara Art Studio')}</span>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">Hans Toribio</h3>
                    <p className="text-[10px] font-medium text-stone-300">
                      {language === 'en' ? 'Resident Tattoo Artist' : 'Artista Residente de Tatuajes'}
                    </p>
                  </div>

                  <a
                    href="https://instagram.com/hansttoo"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white text-stone-900 hover:bg-[#E53E3E] hover:text-white rounded-full transition-all duration-300 shadow-lg font-black text-xs group/ig"
                    title="Follow @hansttoo on Instagram"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#E53E3E] group-hover/ig:text-white transition-colors" />
                    <span>@hansttoo</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Professional Biography & Specialty Pillars */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Bio Text */}
            <div className="space-y-3.5 py-1">
              <p
                onClick={() => {
                  if (isVisualEditMode) {
                    onEditElement?.('text', 'aboutBioP1', 'About Bio Paragraph 1', {
                      en: customTranslations?.en?.aboutBioP1 || translations.en.aboutBioP1,
                      es: customTranslations?.es?.aboutBioP1 || translations.es.aboutBioP1
                    });
                  }
                }}
                className={`text-stone-800 text-sm sm:text-[15px] leading-relaxed font-sans ${
                  isVisualEditMode ? 'cursor-pointer border-2 border-dashed border-amber-400 p-3 rounded-2xl bg-amber-50/30 hover:bg-amber-50/50' : ''
                }`}
              >
                {t.aboutBioP1 || (language === 'en' ? translations.en.aboutBioP1 : translations.es.aboutBioP1)}
              </p>

              <p
                onClick={() => {
                  if (isVisualEditMode) {
                    onEditElement?.('text', 'aboutBioP2', 'About Bio Paragraph 2', {
                      en: customTranslations?.en?.aboutBioP2 || translations.en.aboutBioP2,
                      es: customTranslations?.es?.aboutBioP2 || translations.es.aboutBioP2
                    });
                  }
                }}
                className={`text-stone-600 text-xs sm:text-sm leading-relaxed font-sans ${
                  isVisualEditMode ? 'cursor-pointer border-2 border-dashed border-amber-400 p-3 rounded-2xl bg-amber-50/30 hover:bg-amber-50/50' : ''
                }`}
              >
                {t.aboutBioP2 || (language === 'en' ? translations.en.aboutBioP2 : translations.es.aboutBioP2)}
              </p>
            </div>

            {/* 3 Pillars of Expertise Cards (Fully Editable in Visual Edit Mode) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pl-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                  {language === 'en' ? 'ARTISTIC SPECIALIZATION' : 'ESPECIALIZACIÓN ARTÍSTICA'}
                </h4>
                {isVisualEditMode && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {language === 'en' ? 'Click card to edit' : 'Click en cuadro para editar'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {pillars.map((pillar, idx) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.id}
                      onClick={() => {
                        if (isVisualEditMode && onEditElement) {
                          // Allow editing the pillar
                          onEditElement('text', pillar.titleKey, `Pillar #${idx + 1} (${pillar.title})`, {
                            en: customTranslations?.en?.[pillar.titleKey] || (translations.en as any)[pillar.titleKey],
                            es: customTranslations?.es?.[pillar.titleKey] || (translations.es as any)[pillar.titleKey]
                          });
                        }
                      }}
                      className={`p-4 bg-white border rounded-2xl transition-all duration-300 group flex flex-col justify-between space-y-2 ${
                        isVisualEditMode
                          ? 'cursor-pointer border-2 border-dashed border-amber-400 bg-amber-50/15 hover:bg-amber-50/40 hover:border-amber-600'
                          : 'border-stone-200/80 hover:border-[#E53E3E]/50 hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#E53E3E] flex items-center justify-center group-hover:bg-[#E53E3E] group-hover:text-white transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <h5 className="text-xs font-black text-[#1A1A1A] uppercase tracking-wide">
                          {pillar.title}
                        </h5>
                        <p
                          onClick={(e) => {
                            if (isVisualEditMode && onEditElement) {
                              e.stopPropagation();
                              onEditElement('text', pillar.descKey, `Pillar #${idx + 1} Description`, {
                                en: customTranslations?.en?.[pillar.descKey] || (translations.en as any)[pillar.descKey],
                                es: customTranslations?.es?.[pillar.descKey] || (translations.es as any)[pillar.descKey]
                              });
                            }
                          }}
                          className={`text-[11px] text-stone-500 leading-snug ${
                            isVisualEditMode ? 'hover:text-amber-800' : ''
                          }`}
                        >
                          {pillar.desc}
                        </p>
                      </div>

                      <div className="pt-1.5 flex items-center text-[9px] font-bold text-[#E53E3E] uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3 mr-1 shrink-0" />
                        <span>{language === 'en' ? 'Custom Designed' : 'Diseño Exclusivo'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                onClick={() => onNavigate('booking')}
                className="group w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 bg-[#E53E3E] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-full shadow-lg shadow-rose-500/10 hover:bg-black hover:shadow-xl hover:shadow-stone-900/10 transition-all duration-300 cursor-pointer active:scale-[0.98]"
              >
                <span>{t.aboutCTABook || (language === 'en' ? 'Book Consultation' : 'Consulta con Hans')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('portfolio')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 bg-white text-stone-800 font-black uppercase tracking-[0.2em] text-[10px] rounded-full border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all duration-300 cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                {t.aboutCTAGallery || (language === 'en' ? 'View Gallery' : 'Ver Galería')}
              </button>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
