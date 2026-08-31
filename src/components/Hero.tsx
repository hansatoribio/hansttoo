import { ArrowDown, ArrowRight, MapPin } from 'lucide-react';
import { Language } from '../types';

interface HeroProps {
  language: Language;
  onNavigate: (section: string) => void;
}

const copy = {
  en: {
    eyebrow: 'HANSTTOO | HANS | NYC TATTOO ARTIST',
    title: 'Custom Tattoos in NYC',
    body: 'Anime, microrealism, and fine line work by Hans in Midtown Manhattan. Tell me your idea and I’ll personally reply with fit, availability, and next steps.',
    primary: 'REQUEST A CONSULTATION',
    secondary: 'VIEW REAL WORK',
    trust: 'By appointment only · 240 W 40th St · Manhattan',
    realWork: 'REAL WORK BY HANS',
    galleryLabel: 'Selected tattoo work by Hans',
  },
  es: {
    eyebrow: 'HANSTTOO | HANS | ARTISTA DEL TATUAJE EN NYC',
    title: 'Tatuajes personalizados en NYC',
    body: 'Anime, microrrealismo y línea fina por Hans en Midtown Manhattan. Cuéntame tu idea y te responderé personalmente con disponibilidad y próximos pasos.',
    primary: 'SOLICITAR UNA CONSULTA',
    secondary: 'VER TRABAJO REAL',
    trust: 'Solo con cita · 240 W 40th St · Manhattan',
    realWork: 'TRABAJO REAL DE HANS',
    galleryLabel: 'Selección de tatuajes realizados por Hans',
  },
};

export default function Hero({ language, onNavigate }: HeroProps) {
  const t = copy[language];
  return (
    <section id="home" className="relative overflow-hidden border-b border-stone-200 bg-[#FCFBFA]">
      <div className="pointer-events-none absolute inset-0 tattoo-grid-bg opacity-45" />
      <div className="relative mx-auto grid max-w-7xl items-start gap-10 px-4 py-10 sm:min-h-[calc(100svh-4rem)] sm:items-center sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(420px,500px)] lg:py-20">
        <div className="min-w-0 max-w-4xl">
          <p className="text-[11px] font-black tracking-[0.28em] text-[#C9362B] sm:text-xs">{t.eyebrow}</p>
          <h1 className={`mt-5 font-black text-stone-950 ${language === 'es' ? 'text-[clamp(3rem,8vw,6.8rem)] leading-[0.9] tracking-[-0.075em] lg:text-[clamp(4.6rem,6vw,5.75rem)] lg:leading-[0.92] lg:tracking-[-0.065em]' : 'text-[clamp(3rem,8vw,6.8rem)] leading-[0.9] tracking-[-0.075em]'}`}>
            {t.title}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">{t.body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => onNavigate('booking')} className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#E53E3E] px-7 text-sm font-black tracking-wide text-white shadow-lg shadow-rose-900/10 hover:-translate-y-0.5 hover:bg-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9362B]">
              {t.primary}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </button>
            <button onClick={() => onNavigate('portfolio')} className="inline-flex min-h-14 items-center justify-center rounded-full border border-stone-300 bg-white px-7 text-sm font-black tracking-wide text-stone-950 hover:-translate-y-0.5 hover:border-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-950">
              {t.secondary}<ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-6 flex items-center text-sm font-bold text-stone-700"><MapPin className="mr-2 h-4 w-4 text-[#C9362B]" aria-hidden="true" />{t.trust}</p>
        </div>

        <div className="relative min-w-0" aria-label={t.galleryLabel}>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <figure className="relative row-span-2 min-h-[340px] overflow-hidden rounded-[2rem] bg-stone-200 sm:min-h-[520px]">
              <img src="/portfolio/anime-my-hero-tattoo-nyc.webp" alt="Anime tattoo created by Hans in NYC" className="h-full w-full object-cover" width="900" height="1200" loading="eager" fetchPriority="high" decoding="async" />
            </figure>
            <figure className="relative min-h-[164px] overflow-hidden rounded-[1.5rem] bg-stone-200 sm:min-h-[252px]">
              <img src="/portfolio/microrealism-empire-state-tattoo-nyc.webp" alt="Empire State microrealism tattoo created by Hans in NYC" className="h-full w-full object-cover" width="900" height="900" loading="eager" decoding="async" />
            </figure>
            <figure className="relative min-h-[164px] overflow-hidden rounded-[1.5rem] bg-stone-200 sm:min-h-[252px]">
              <img src="/portfolio/fine-line-hummingbird-tattoo-nyc.webp" alt="Fine line hummingbird tattoo created by Hans in NYC" className="h-full w-full object-cover" width="900" height="900" loading="eager" decoding="async" />
            </figure>
          </div>
          <p className="absolute bottom-4 left-4 rounded-full bg-stone-950/90 px-4 py-2 text-[10px] font-black tracking-[0.16em] text-white backdrop-blur sm:text-xs">{t.realWork}</p>
        </div>
      </div>
    </section>
  );
}
