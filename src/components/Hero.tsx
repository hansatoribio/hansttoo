import { ArrowDown, ArrowRight, MapPin } from 'lucide-react';
import { Language } from '../types';

interface HeroProps {
  language: Language;
  onNavigate: (section: string) => void;
}

const copy = {
  en: {
    eyebrow: 'HANSTTOO | HANS | NYC TATTOO ARTIST',
    title: 'Custom Anime, Microrealism & Fine Line Tattoos',
    body: 'Custom tattoos by Hans at Gara Art Studio in Midtown Manhattan. Send your idea, approximate size and placement to request availability.',
    primary: 'REQUEST A CONSULTATION',
    secondary: 'VIEW REAL WORK',
    trust: 'By appointment only · 240 W 40th St · Manhattan',
    resident: 'Independent tattoo artist · Resident artist at Gara Art Studio',
    city: '@HANSTTOO · NEW YORK CITY',
    styles: ['Anime', 'Microrealism', 'Fine line'],
  },
  es: {
    eyebrow: 'HANSTTOO | HANS | ARTISTA DEL TATUAJE EN NYC',
    title: 'Tatuajes personalizados de anime, microrrealismo y línea fina',
    body: 'Tatuajes personalizados por Hans en Gara Art Studio, Midtown Manhattan. Envía tu idea, tamaño aproximado y zona para solicitar disponibilidad.',
    primary: 'SOLICITAR UNA CONSULTA',
    secondary: 'VER TRABAJO REAL',
    trust: 'Solo con cita · 240 W 40th St · Manhattan',
    resident: 'Artista independiente · Artista residente en Gara Art Studio',
    city: '@HANSTTOO · NUEVA YORK',
    styles: ['Anime', 'Microrrealismo', 'Línea fina'],
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

        <div className="relative hidden min-h-[560px] min-w-0 overflow-hidden rounded-[2.25rem] border border-stone-300 bg-stone-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-16 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full border border-white/10" />
          <p className="relative font-mono text-xs tracking-[0.2em] text-stone-400">{t.city}</p>
          <div className="relative">
            <p className="text-[6rem] font-black leading-none tracking-[-0.09em]">H.</p>
            <p className="mt-5 max-w-xs text-sm leading-6 text-stone-300">{t.resident}</p>
          </div>
          <div className="relative grid grid-cols-3 gap-2 text-[9px] font-black uppercase xl:text-[10px]">
            {t.styles.map((style) => <span key={style} className="min-w-0 whitespace-nowrap rounded-full border border-white/15 px-2 py-2 text-center tracking-normal xl:tracking-wider">{style}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}
