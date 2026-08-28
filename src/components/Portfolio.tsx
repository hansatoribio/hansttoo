import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Language, TattooStyle } from '../types';

interface PortfolioProps {
  language: Language;
  onInquireSimilar: (style: TattooStyle) => void;
}

interface PortfolioPiece {
  id: string;
  style: TattooStyle;
  image: string;
  width: number;
  height: number;
  titleEn: string;
  titleEs: string;
  altEn: string;
  altEs: string;
  fit?: 'cover' | 'contain';
}

const specialties = [
  { id: 'anime' as const, en: 'Anime & Manga', es: 'Anime y Manga' },
  { id: 'microrealism' as const, en: 'Microrealism', es: 'Microrrealismo' },
  { id: 'fineline' as const, en: 'Fine Line', es: 'Línea Fina' },
];

const portfolioPieces: PortfolioPiece[] = [
  {
    id: 'anime-hero', style: 'anime', image: '/portfolio/anime-my-hero-tattoo-nyc.webp', width: 1067, height: 1600,
    titleEn: 'Anime character tattoo', titleEs: 'Tatuaje de personaje de anime',
    altEn: 'Detailed black and grey anime character tattoo by Hans', altEs: 'Tatuaje detallado de personaje de anime en negro y gris realizado por Hans',
  },
  {
    id: 'anime-madara', style: 'anime', image: '/portfolio/anime-madara-tattoo-nyc.webp', width: 1200, height: 1600,
    titleEn: 'Madara Uchiha tattoo', titleEs: 'Tatuaje de Madara Uchiha',
    altEn: 'Black and grey Madara Uchiha anime tattoo by Hans in NYC', altEs: 'Tatuaje de anime de Madara Uchiha en negro y gris realizado por Hans en NYC',
  },
  {
    id: 'anime-panel', style: 'anime', image: '/portfolio/anime-manga-panel-tattoo-nyc.webp', width: 1067, height: 1600,
    titleEn: 'Manga panel tattoo', titleEs: 'Tatuaje de panel de manga',
    altEn: 'Black ink manga panel tattoo with fine detail by Hans', altEs: 'Tatuaje de panel de manga en tinta negra y detalle fino realizado por Hans',
  },
  {
    id: 'anime-dragon-ball', style: 'anime', image: '/portfolio/anime-dragon-ball-tattoo-nyc.webp', width: 1066, height: 1600,
    titleEn: 'Dragon Ball character tattoo', titleEs: 'Tatuaje de personajes de Dragon Ball',
    altEn: 'Black and grey Dragon Ball anime character tattoo by Hans', altEs: 'Tatuaje de personajes de anime Dragon Ball en negro y gris realizado por Hans',
  },
  {
    id: 'anime-mushroom-girl', style: 'anime', image: '/portfolio/anime-mushroom-girl-tattoo-nyc.webp', width: 1067, height: 1600,
    titleEn: 'Mushroom character tattoo', titleEs: 'Tatuaje de personaje entre hongos',
    altEn: 'Anime-style character and mushroom leg tattoo by Hans', altEs: 'Tatuaje de pierna con personaje estilo anime y hongos realizado por Hans',
  },
  {
    id: 'anime-akaza', style: 'anime', image: '/portfolio/anime-akaza-tattoo-nyc.webp', width: 1200, height: 1600,
    titleEn: 'Akaza anime tattoo', titleEs: 'Tatuaje de anime de Akaza',
    altEn: 'Black and grey Akaza anime tattoo by Hans in NYC', altEs: 'Tatuaje de anime de Akaza en negro y gris realizado por Hans en NYC',
  },
  {
    id: 'micro-empire-state', style: 'microrealism', image: '/portfolio/microrealism-empire-state-tattoo-nyc.webp', width: 1067, height: 1600,
    titleEn: 'Empire State microrealism', titleEs: 'Microrrealismo del Empire State',
    altEn: 'Small-scale Empire State Building microrealism tattoo by Hans', altEs: 'Tatuaje de microrrealismo a pequeña escala del Empire State realizado por Hans',
  },
  {
    id: 'micro-skeleton', style: 'microrealism', image: '/portfolio/microrealism-skeleton-tattoo-nyc.webp', width: 1067, height: 1600,
    titleEn: 'Smoking skeleton microrealism', titleEs: 'Esqueleto en microrrealismo',
    altEn: 'Black and grey smoking skeleton microrealism tattoo by Hans', altEs: 'Tatuaje de esqueleto en microrrealismo negro y gris realizado por Hans',
  },
  {
    id: 'micro-melting-clock', style: 'microrealism', image: '/portfolio/microrealism-melting-clock-tattoo-nyc.webp', width: 1067, height: 1600,
    titleEn: 'Melting clock microrealism', titleEs: 'Reloj derretido en microrrealismo',
    altEn: 'Fine-detail melting clock microrealism tattoo by Hans in NYC', altEs: 'Tatuaje de reloj derretido en microrrealismo y detalle fino realizado por Hans en NYC', fit: 'contain',
  },
  {
    id: 'micro-sea-turtle', style: 'microrealism', image: '/portfolio/microrealism-sea-turtle-tattoo-nyc.webp', width: 1067, height: 1600,
    titleEn: 'Sea turtle microrealism', titleEs: 'Tortuga marina en microrrealismo',
    altEn: 'Detailed black and grey sea turtle tattoo by Hans', altEs: 'Tatuaje detallado de tortuga marina en negro y gris realizado por Hans',
  },
  {
    id: 'micro-praying-hands', style: 'microrealism', image: '/portfolio/microrealism-praying-hands-tattoo-nyc.webp', width: 1067, height: 1600,
    titleEn: 'Praying hands microrealism', titleEs: 'Manos en oración en microrrealismo',
    altEn: 'Black and grey praying hands tattoo with rays by Hans', altEs: 'Tatuaje de manos en oración con rayos en negro y gris realizado por Hans',
  },
  {
    id: 'micro-skeleton-hand', style: 'microrealism', image: '/portfolio/microrealism-skeleton-hand-rose-tattoo-nyc.webp', width: 1067, height: 1600,
    titleEn: 'Skeleton hand & rose', titleEs: 'Mano esquelética y rosa',
    altEn: 'Detailed skeleton hand holding a rose tattoo by Hans', altEs: 'Tatuaje detallado de mano esquelética sosteniendo una rosa realizado por Hans',
  },
  {
    id: 'fine-line-hummingbird', style: 'fineline', image: '/portfolio/fine-line-hummingbird-tattoo-nyc.webp', width: 1067, height: 1600,
    titleEn: 'Hummingbird & flower', titleEs: 'Colibrí y flor',
    altEn: 'Fine-line hummingbird and flower tattoo by Hans', altEs: 'Tatuaje de línea fina de colibrí y flor realizado por Hans',
  },
  {
    id: 'fine-line-lotus', style: 'fineline', image: '/portfolio/fine-line-geometric-lotus-tattoo-nyc.webp', width: 1067, height: 1600,
    titleEn: 'Geometric portrait & lotus', titleEs: 'Retrato geométrico y loto',
    altEn: 'Geometric portrait and lotus fine-line tattoo by Hans', altEs: 'Tatuaje de línea fina de retrato geométrico y loto realizado por Hans',
  },
  {
    id: 'fine-line-botanical', style: 'fineline', image: '/portfolio/fine-line-botanical-tattoo-nyc.webp', width: 1067, height: 1600,
    titleEn: 'Botanical fine line', titleEs: 'Botánica en línea fina',
    altEn: 'Delicate botanical fine-line tattoo on the forearm by Hans', altEs: 'Tatuaje botánico delicado de línea fina en el antebrazo realizado por Hans',
  },
  {
    id: 'fine-line-heart', style: 'fineline', image: '/portfolio/fine-line-botanical-heart-tattoo-nyc.webp', width: 1067, height: 1600,
    titleEn: 'Botanical anatomical heart', titleEs: 'Corazón anatómico botánico',
    altEn: 'Fine-line anatomical heart with flowers tattoo by Hans', altEs: 'Tatuaje de línea fina de corazón anatómico con flores realizado por Hans',
  },
  {
    id: 'fine-line-couple', style: 'fineline', image: '/portfolio/fine-line-couple-tattoo-nyc.webp', width: 1067, height: 1600,
    titleEn: 'Couple linework tattoo', titleEs: 'Tatuaje lineal de pareja',
    altEn: 'Red and black fine-line couple tattoo by Hans', altEs: 'Tatuaje de pareja en línea fina roja y negra realizado por Hans',
  },
  {
    id: 'fine-line-octopus', style: 'fineline', image: '/portfolio/fine-line-octopus-tattoo-nyc.webp', width: 1067, height: 1600,
    titleEn: 'Ornamental octopus', titleEs: 'Pulpo ornamental',
    altEn: 'Ornamental fine-line octopus tattoo across the foot by Hans', altEs: 'Tatuaje ornamental de pulpo en línea fina sobre el pie realizado por Hans',
  },
];

export default function Portfolio({ language, onInquireSimilar }: PortfolioProps) {
  const [filter, setFilter] = useState<'all' | TattooStyle>('all');
  const visible = filter === 'all' ? portfolioPieces : portfolioPieces.filter((item) => item.style === filter);
  const isEnglish = language === 'en';

  return (
    <section id="portfolio" className="bg-stone-950 py-16 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black tracking-[0.24em] text-rose-300">{isEnglish ? 'SELECTED WORK' : 'TRABAJO SELECCIONADO'}</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.05em] sm:text-6xl">{isEnglish ? 'Real tattoos by Hans.' : 'Tatuajes reales de Hans.'}</h2>
            <p className="mt-4 max-w-2xl leading-7 text-stone-300">
              {isEnglish
                ? 'Six selected pieces in each specialty. Every image below is an authentic tattoo from Hans’s portfolio.'
                : 'Seis piezas seleccionadas por especialidad. Cada imagen pertenece al portafolio auténtico de Hans.'}
            </p>
          </div>
          <a href="https://instagram.com/hansttoo" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center self-start rounded-full border border-white/25 px-5 text-sm font-black hover:bg-white hover:text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            {isEnglish ? 'More work on Instagram' : 'Más trabajos en Instagram'}<ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label={isEnglish ? 'Filter portfolio by tattoo style' : 'Filtrar portafolio por estilo de tatuaje'}>
          <button onClick={() => setFilter('all')} aria-pressed={filter === 'all'} className={'min-h-11 rounded-full px-4 text-xs font-black uppercase tracking-wider ' + (filter === 'all' ? 'bg-white text-stone-950' : 'border border-white/20 text-white hover:border-white/60')}>
            {isEnglish ? 'All work' : 'Todos'}
          </button>
          {specialties.map((item) => (
            <button key={item.id} onClick={() => setFilter(item.id)} aria-pressed={filter === item.id} className={'min-h-11 rounded-full px-4 text-xs font-black uppercase tracking-wider ' + (filter === item.id ? 'bg-white text-stone-950' : 'border border-white/20 text-white hover:border-white/60')}>
              {isEnglish ? item.en : item.es}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {visible.map((item) => {
            const specialty = specialties.find((entry) => entry.id === item.style);
            return (
              <figure key={item.id} className="group overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] [contain-intrinsic-size:600px] [content-visibility:auto]">
                <div className="aspect-[3/4] overflow-hidden bg-black">
                  <img
                    src={item.image}
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    decoding="async"
                    alt={isEnglish ? item.altEn : item.altEs}
                    className={`h-full w-full transition duration-500 group-hover:scale-[1.02] ${item.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                  />
                </div>
                <figcaption className="flex items-end justify-between gap-4 p-5">
                  <div>
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-rose-300">{isEnglish ? specialty?.en : specialty?.es}</p>
                    <h3 className="mt-2 text-lg font-black">{isEnglish ? item.titleEn : item.titleEs}</h3>
                  </div>
                  <button onClick={() => onInquireSimilar(item.style)} aria-label={isEnglish ? `Ask about ${item.titleEn}` : `Consultar sobre ${item.titleEs}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 hover:bg-white hover:text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
