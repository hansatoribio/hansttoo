import { useState } from 'react';
import { ArrowUpRight, ImageOff } from 'lucide-react';
import { Language, TattooStyle } from '../types';

interface PortfolioProps {
  language: Language;
  onInquireSimilar: (style: TattooStyle) => void;
}

const specialties = [
  { id: 'anime' as const, en: 'Anime & Manga', es: 'Anime y Manga', number: '01' },
  { id: 'microrealism' as const, en: 'Microrealism', es: 'Microrrealismo', number: '02' },
  { id: 'fineline' as const, en: 'Fine Line', es: 'Línea Fina', number: '03' },
];

export default function Portfolio({ language, onInquireSimilar }: PortfolioProps) {
  const [filter, setFilter] = useState<'all' | TattooStyle>('all');
  const visible = filter === 'all' ? specialties : specialties.filter((item) => item.id === filter);
  const isEnglish = language === 'en';

  return (
    <section id="portfolio" className="bg-stone-950 py-16 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black tracking-[0.24em] text-rose-300">{isEnglish ? 'SELECTED WORK' : 'TRABAJO SELECCIONADO'}</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.05em] sm:text-6xl">{isEnglish ? 'See the work Hans publishes.' : 'Mira el trabajo que publica Hans.'}</h2>
          </div>
          <a href="https://instagram.com/hansttoo" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center self-start rounded-full border border-white/25 px-5 text-sm font-black hover:bg-white hover:text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            {isEnglish ? '@hansttoo on Instagram' : '@hansttoo en Instagram'}<ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-10 rounded-3xl border border-amber-200/25 bg-amber-100/5 p-5 sm:p-6" role="note">
          <div className="flex items-start gap-3">
            <ImageOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" />
            <p className="max-w-3xl text-sm leading-6 text-stone-300">
              {isEnglish
                ? 'The portfolio files supplied with this website cannot currently be rendered reliably. To avoid presenting stock or unverified images as tattoo work, this page links to Hans’s artist-published Instagram until verified originals are added.'
                : 'Los archivos de portafolio incluidos con este sitio no se pueden mostrar de forma fiable. Para no presentar imágenes de stock o no verificadas como tatuajes, esta página enlaza al Instagram publicado por Hans hasta que se añadan originales verificados.'}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label={isEnglish ? 'Filter specialties' : 'Filtrar especialidades'}>
          <button onClick={() => setFilter('all')} aria-pressed={filter === 'all'} className={'min-h-11 rounded-full px-4 text-xs font-black uppercase tracking-wider ' + (filter === 'all' ? 'bg-white text-stone-950' : 'border border-white/20 text-white hover:border-white/60')}>
            {isEnglish ? 'All styles' : 'Todos'}
          </button>
          {specialties.map((item) => (
            <button key={item.id} onClick={() => setFilter(item.id)} aria-pressed={filter === item.id} className={'min-h-11 rounded-full px-4 text-xs font-black uppercase tracking-wider ' + (filter === item.id ? 'bg-white text-stone-950' : 'border border-white/20 text-white hover:border-white/60')}>
              {isEnglish ? item.en : item.es}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3" aria-live="polite">
          {visible.map((item) => (
            <article key={item.id} className="group flex min-h-64 flex-col justify-between rounded-3xl border border-white/15 bg-white/[0.035] p-6 transition hover:border-white/35">
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs text-stone-500">{item.number}</span>
                <span className="h-2 w-2 rounded-full bg-[#E53E3E]" />
              </div>
              <div>
                <h3 className="text-2xl font-black">{isEnglish ? item.en : item.es}</h3>
                <button onClick={() => onInquireSimilar(item.id)} className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-stone-300 hover:text-white">
                  {isEnglish ? 'Ask about this style' : 'Consultar sobre este estilo'}<ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
