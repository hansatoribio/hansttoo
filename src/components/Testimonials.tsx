import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Quote, CheckCircle2, ChevronLeft, ChevronRight, Sparkles, MessageSquare } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface TestimonialItem {
  id: string;
  clientName: string;
  location: string;
  rating: number;
  styleEn: string;
  styleEs: string;
  dateEn: string;
  dateEs: string;
  quoteEn: string;
  quoteEs: string;
  verified: boolean;
  avatarUrl: string;
}

interface TestimonialsProps {
  language: Language;
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'testi-1',
    clientName: 'Maya Lin',
    location: 'Manhattan, NY',
    rating: 5,
    styleEn: 'Fine Line & Microrealism',
    styleEs: 'Línea Fina y Microrrealismo',
    dateEn: 'June 2026',
    dateEs: 'Junio 2026',
    quoteEn: 'Hans is an absolute master of single-needle fine line work! The detail on my floral arm piece is beyond perfection. The healing was so smooth, and Gara Art Studio in NYC is incredibly clean and peaceful.',
    quoteEs: '¡Hans es un maestro absoluto del trabajo de línea fina con una sola aguja! El detalle de mi pieza floral en el brazo superó todas mis expectativas. La cicatrización fue perfecta y Gara Art Studio en Nueva York es impecable y súper tranquilo.',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'testi-2',
    clientName: 'Julian Rivera',
    location: 'Brooklyn, NY',
    rating: 5,
    styleEn: 'Custom Anime Manga Panel',
    styleEs: 'Panel de Manga Anime Personalizado',
    dateEn: 'May 2026',
    dateEs: 'Mayo 2026',
    quoteEn: 'I got a custom Berserk manga panel tattoo on my forearm. The linework is insanely crisp and identical to the original artwork. Hans took his time designing it with me during consultation. Best tattoo artist in NY!',
    quoteEs: 'Me hice un panel de manga personalizado de Berserk en el antebrazo. Las líneas son increíblemente nítidas e idénticas al arte original. Hans se tomó todo el tiempo para diseñarlo conmigo en la consulta. ¡El mejor tatuador de NY!',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'testi-3',
    clientName: 'Elena Vasilyev',
    location: 'Hoboken, NJ',
    rating: 5,
    styleEn: 'Microrealism Pet Portrait',
    styleEs: 'Retrato Microrrealista de Mascota',
    dateEn: 'July 2026',
    dateEs: 'Julio 2026',
    quoteEn: 'Hans tattooed a tiny portrait of my cat on my inner wrist. I still cannot believe how much detail he fit in such a small space! The studio location at 240 W 40th St was super easy to find and the session was virtually painless.',
    quoteEs: 'Hans me tatuó un pequeño retrato de mi gato en la cara interna de la muñeca. ¡Aún no puedo creer cuántos detalles logró capturar en un espacio tan pequeño! El estudio en 240 W 40th St fue fácil de ubicar y la sesión fue casi indolora.',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'testi-4',
    clientName: 'Marcus Vance',
    location: 'Queens, NY',
    rating: 5,
    styleEn: 'High-Contrast Cyberpunk Panel',
    styleEs: 'Panel Cyberpunk de Alto Contraste',
    dateEn: 'April 2026',
    dateEs: 'Abril 2026',
    quoteEn: 'From initial booking inquiry to final wrap, everything was top tier professional. The blackwork contrast is deep and sharp. If you want high-end tattoo art in Manhattan, book with Hans without hesitation.',
    quoteEs: 'Desde la consulta inicial hasta el vendaje final, todo fue de primer nivel profesional. El contraste del sombreado es profundo y definido. Si buscas arte de tatuaje de lujo en Manhattan, agenda con Hans sin dudarlo.',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'testi-5',
    clientName: 'Sophia Miller',
    location: 'Boston, MA',
    rating: 5,
    styleEn: 'Fine Line Script & Geometry',
    styleEs: 'Tipografía Fina y Geometría',
    dateEn: 'March 2026',
    dateEs: 'Marzo 2026',
    quoteEn: 'I traveled from Boston specifically to get tattooed by @hansttoo at Gara Art Studio. Worth every single minute of travel! My fine line geometric piece healed crisp without any blowouts or fading.',
    quoteEs: 'Viajé desde Boston específicamente para tatuarme con @hansttoo en Gara Art Studio. ¡Valió cada minuto del viaje! Mi pieza geométrica de línea fina cicatrizó nítida sin ningún tipo de expansión de tinta ni desgaste.',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  }
];

export default function Testimonials({ language }: TestimonialsProps) {
  const t = translations[language];
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % DEFAULT_TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + DEFAULT_TESTIMONIALS.length) % DEFAULT_TESTIMONIALS.length);
  };

  const current = DEFAULT_TESTIMONIALS[activeIndex];

  return (
    <section className="pt-16 sm:pt-20 pb-8 sm:pb-10 bg-[#FCFBFA] border-b border-stone-100 overflow-hidden relative" id="testimonials">
      
      {/* Decorative background watermark */}
      <div className="absolute left-[-2%] top-[20%] text-[100px] sm:text-[160px] font-black text-[#1A1A1A]/[0.015] select-none pointer-events-none lowercase tracking-tighter z-0">
        reviews
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-black tracking-[0.25em] text-[#E53E3E] uppercase flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {language === 'en' ? 'CLIENT TESTIMONIALS' : 'TESTIMONIOS DE CLIENTES'}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none">
            {language === 'en' ? 'CLIENT TRUST & EXPERIENCES' : 'CONFIANZA Y EXPERIENCIAS'}
            <span className="text-[#E53E3E]">.</span>
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm font-sans max-w-xl mx-auto leading-relaxed">
            {language === 'en' 
              ? 'Real reviews from clients who entrusted their skin to Hans Toribio at Gara Art Studio, 240 W 40th St, New York.'
              : 'Reseñas reales de clientes que confiaron su piel a Hans Toribio en Gara Art Studio, 240 W 40th St, Nueva York.'}
          </p>
        </div>

        {/* Featured Testimonial Carousel / Spotlight Card */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-10 shadow-xl shadow-stone-900/5 relative overflow-hidden">
            
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-stone-200 via-[#E53E3E] to-stone-200" />
            
            {/* Big Decorative Quote Icon */}
            <Quote className="absolute top-6 right-6 w-16 h-16 sm:w-24 sm:h-24 text-stone-100 -z-0 pointer-events-none opacity-60" />

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 space-y-6"
              >
                {/* Rating Stars & Style Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(current.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#E53E3E] text-[#E53E3E]" />
                    ))}
                    <span className="text-xs font-black text-[#1A1A1A] ml-2">5.0 / 5.0</span>
                  </div>

                  <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {language === 'en' ? current.styleEn : current.styleEs}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="text-stone-800 text-base sm:text-xl font-medium leading-relaxed italic">
                  "{language === 'en' ? current.quoteEn : current.quoteEs}"
                </p>

                {/* Client Profile Info */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <div className="flex items-center space-x-3.5">
                    <img 
                      src={current.avatarUrl} 
                      alt={current.clientName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-sm font-black text-[#1A1A1A]">{current.clientName}</h4>
                        {current.verified && (
                          <span className="inline-flex items-center text-emerald-600" title={language === 'en' ? 'Verified Client' : 'Cliente Verificado'}>
                            <CheckCircle2 className="w-4 h-4 fill-emerald-100 text-emerald-600" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 font-medium">
                        {current.location} • {language === 'en' ? current.dateEn : current.dateEs}
                      </p>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevTestimonial}
                      className="p-2.5 rounded-full border border-stone-200 hover:border-stone-900 bg-white hover:bg-stone-900 hover:text-white transition-all text-stone-700 cursor-pointer shadow-2xs active:scale-95"
                      title={language === 'en' ? 'Previous testimonial' : 'Testimonio anterior'}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextTestimonial}
                      className="p-2.5 rounded-full border border-stone-200 hover:border-stone-900 bg-white hover:bg-stone-900 hover:text-white transition-all text-stone-700 cursor-pointer shadow-2xs active:scale-95"
                      title={language === 'en' ? 'Next testimonial' : 'Siguiente testimonio'}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Small Grid Cards for all testimonials preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEFAULT_TESTIMONIALS.slice(0, 3).map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setActiveIndex(idx)}
              className={`p-6 rounded-2xl bg-white border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                activeIndex === idx 
                  ? 'border-[#E53E3E] ring-2 ring-rose-500/10' 
                  : 'border-stone-200/70 hover:border-stone-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-0.5">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#E53E3E] text-[#E53E3E]" />
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                    {language === 'en' ? item.styleEn : item.styleEs}
                  </span>
                </div>
                <p className="text-stone-600 text-xs line-clamp-3 italic leading-relaxed">
                  "{language === 'en' ? item.quoteEn : item.quoteEs}"
                </p>
              </div>

              <div className="flex items-center space-x-2.5 pt-2 border-t border-stone-100">
                <img 
                  src={item.avatarUrl} 
                  alt={item.clientName}
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="text-xs font-bold text-[#1A1A1A]">{item.clientName}</p>
                  <p className="text-[10px] text-stone-400">{item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
