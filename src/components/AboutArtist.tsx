import { ArrowRight, MapPin, PenTool, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface AboutArtistProps {
  language: Language;
  onNavigate: (section: string) => void;
}

const copy = {
  en: {
    eyebrow: 'INDEPENDENT NYC TATTOO ARTIST',
    title: 'Meet Hans',
    body: 'Hans is an independent tattoo artist and resident artist at Gara Art Studio in Midtown Manhattan. His consultation process centers on the client’s idea, the placement, and a design direction suited to the requested style.',
    resident: 'Resident artist at Gara Art Studio',
    location: 'Appointments at 240 W 40th St, New York, NY 10018',
    craft: 'Custom anime and manga, microrealism, and fine-line work',
    cta: 'TELL HANS YOUR IDEA',
    city: 'New York City · By appointment',
  },
  es: {
    eyebrow: 'ARTISTA DEL TATUAJE INDEPENDIENTE EN NYC',
    title: 'Conoce a Hans',
    body: 'Hans es un artista del tatuaje independiente y artista residente en Gara Art Studio, Midtown Manhattan. Su proceso de consulta se centra en la idea del cliente, la zona y una dirección de diseño adecuada al estilo solicitado.',
    resident: 'Artista residente en Gara Art Studio',
    location: 'Citas en 240 W 40th St, New York, NY 10018',
    craft: 'Anime y manga personalizado, microrrealismo y línea fina',
    cta: 'CUÉNTALE TU IDEA A HANS',
    city: 'Nueva York · Solo con cita',
  },
};

export default function AboutArtist({ language, onNavigate }: AboutArtistProps) {
  const t = copy[language];
  const details = [
    [PenTool, t.resident],
    [MapPin, t.location],
    [Sparkles, t.craft],
  ] as const;

  return (
    <section id="about" className="bg-[#FCFBFA] py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
        <figure className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-stone-300 bg-stone-950 shadow-sm">
          <img
            src="/portfolio/hans-tattoo-artist-nyc.webp"
            width="901"
            height="1600"
            loading="lazy"
            decoding="async"
            alt={language === 'en' ? 'Hans working on a tattoo in New York City' : 'Hans trabajando en un tatuaje en Nueva York'}
            className="h-full w-full object-cover object-center"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-6 pb-6 pt-16 text-white">
            <span className="block font-mono text-xs tracking-[0.2em] text-stone-300">@HANSTTOO</span>
            <span className="mt-2 block text-sm font-bold">{t.city}</span>
          </figcaption>
        </figure>
        <div>
          <p className="text-xs font-black tracking-[0.24em] text-[#C9362B]">{t.eyebrow}</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.055em] sm:text-6xl">{t.title}</h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">{t.body}</p>
          <ul className="mt-8 grid gap-3">
            {details.map(([Icon, text]) => (
              <li key={text} className="flex items-start rounded-2xl border border-stone-200 bg-white p-4 text-sm font-bold text-stone-800">
                <Icon className="mr-3 mt-0.5 h-4 w-4 shrink-0 text-[#C9362B]" aria-hidden="true" />{text}
              </li>
            ))}
          </ul>
          <button onClick={() => onNavigate('booking')} className="mt-8 inline-flex min-h-12 items-center rounded-full bg-stone-950 px-6 text-sm font-black tracking-wide text-white hover:bg-[#E53E3E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-950">
            {t.cta}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
