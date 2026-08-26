import { motion } from 'motion/react';
import { Sparkles, MapPin, Instagram, PenTool, Layers, Compass, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

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

  const pillars = [
    {
      id: 'fineline',
      icon: PenTool,
      title: t.aboutPillar1Title || (language === 'en' ? 'Fine Line Mastery' : 'Dominio de Línea Fina'),
      desc: t.aboutPillar1Desc || (language === 'en' ? 'Delicate single-needle execution for weightless botanicals, fine script, and organic geometric flows.' : 'Ejecución delicada con aguja única para botánica ingrávida, caligrafía fina y trazos geométricos orgánicos.')
    },
    {
      id: 'anime',
      icon: Layers,
      title: t.aboutPillar2Title || (language === 'en' ? 'Anime & Manga Craft' : 'Arte Anime y Manga'),
      desc: t.aboutPillar2Desc || (language === 'en' ? 'Authentic panel adaptations, character portraits, and dynamic hand-hatched line weights honoring original comic art.' : 'Adaptaciones fieles de paneles, retratos de personajes y tramas manuales dinámicas que honran el arte original.')
    },
    {
      id: 'microrealism',
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
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-stone-100 text-[#E53E3E] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] border border-stone-200/60"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.aboutBadge || (language === 'en' ? 'Meet the Artist' : 'Conoce al Artista')}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none"
          >
            {t.aboutTitle || 'Hans Toribio'}<span className="text-[#E53E3E]">.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xs sm:text-sm font-bold tracking-[0.2em] text-stone-500 uppercase"
          >
            {t.aboutSubtitle || (language === 'en' ? 'Fine Line • Microrealism • Custom Anime Specialist' : 'Especialista en Línea Fina • Microrrealismo • Anime Personalizado')}
          </motion.p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Side: Portrait & Studio Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative rounded-2xl overflow-hidden border border-stone-200/80 bg-stone-900 shadow-xl shadow-stone-900/5 group w-full aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] max-h-[420px]">
              <img
                src={customTranslations?.artistPhoto || localStorage.getItem('hans_custom_artist_photo') || "/imagenes/IMG_1453.JPG.jpeg"}
                alt="Hans Toribio - Tattoo Artist"
                className={`w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 ${
                  isVisualEditMode ? 'cursor-pointer hover:opacity-85 ring-4 ring-amber-400' : ''
                }`}
                onClick={() => {
                  if (isVisualEditMode && onEditElement) {
                    onEditElement('image', 'artistPhoto', 'Foto de Hans Toribio', {
                      url: customTranslations?.artistPhoto || localStorage.getItem('hans_custom_artist_photo') || "/imagenes/IMG_1453.JPG.jpeg",
                      labelEn: 'Hans Toribio',
                      labelEs: 'Hans Toribio'
                    });
                  }
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-90" />

              {/* Floating Studio Overlay Badge */}
              <div className="absolute bottom-4 left-4 right-4 space-y-2 text-white">
                <div className="inline-flex items-center space-x-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/20">
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
                      en: customTranslations?.en?.aboutBioP1 || t.aboutBioP1,
                      es: customTranslations?.es?.aboutBioP1 || t.aboutBioP1
                    });
                  }
                }}
                className={`text-stone-800 text-sm sm:text-[15px] leading-relaxed font-sans ${
                  isVisualEditMode ? 'cursor-pointer border border-dashed border-amber-400 p-2 rounded-lg bg-amber-50/20' : ''
                }`}
              >
                {t.aboutBioP1}
              </p>

              <p
                onClick={() => {
                  if (isVisualEditMode) {
                    onEditElement?.('text', 'aboutBioP2', 'About Bio Paragraph 2', {
                      en: customTranslations?.en?.aboutBioP2 || t.aboutBioP2,
                      es: customTranslations?.es?.aboutBioP2 || t.aboutBioP2
                    });
                  }
                }}
                className={`text-stone-600 text-xs sm:text-sm leading-relaxed font-sans ${
                  isVisualEditMode ? 'cursor-pointer border border-dashed border-amber-400 p-2 rounded-lg bg-amber-50/20' : ''
                }`}
              >
                {t.aboutBioP2}
              </p>
            </div>

            {/* 3 Pillars of Expertise Cards */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 pl-1">
                {language === 'en' ? 'ARTISTIC SPECIALIZATION' : 'ESPECIALIZACIÓN ARTÍSTICA'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {pillars.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.id}
                      className="p-4 bg-white border border-stone-200/80 rounded-2xl hover:border-[#E53E3E]/50 hover:shadow-md transition-all duration-300 group flex flex-col justify-between space-y-2"
                    >
                      <div className="space-y-1.5">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#E53E3E] flex items-center justify-center group-hover:bg-[#E53E3E] group-hover:text-white transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <h5 className="text-xs font-black text-[#1A1A1A] uppercase tracking-wide">
                          {pillar.title}
                        </h5>
                        <p className="text-[11px] text-stone-500 leading-snug">
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
