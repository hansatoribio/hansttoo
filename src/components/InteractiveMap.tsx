import { ArrowUpRight, Building2, CalendarClock, MapPin } from 'lucide-react';
import { Language } from '../types';

interface InteractiveMapProps { language: Language }

const mapUrl = 'https://www.google.com/maps/search/?api=1&query=Gara%20Art%20Studio%20240%20W%2040th%20St%20New%20York%20NY%2010018';
const embedUrl = 'https://maps.google.com/maps?q=Gara%20Art%20Studio%20240%20W%2040th%20St%2C%20New%20York%2C%20NY%2010018&z=16&output=embed';

export default function InteractiveMap({ language }: InteractiveMapProps) {
  const isEnglish = language === 'en';
  return (
    <section id="location" className="border-t border-stone-200 bg-[#FCFBFA] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-stretch">
          <div className="rounded-[2rem] bg-stone-950 p-7 text-white sm:p-9">
            <p className="text-xs font-black tracking-[0.24em] text-rose-300">{isEnglish ? 'APPOINTMENT LOCATION' : 'LUGAR DE LA CITA'}</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.055em]">Gara Art Studio</h2>
            <div className="mt-8 grid gap-4 text-sm leading-6 text-stone-300">
              <p className="flex items-start"><MapPin className="mr-3 mt-1 h-4 w-4 shrink-0 text-rose-300" aria-hidden="true" />240 W 40th St<br />New York, NY 10018</p>
              <p className="flex items-start"><CalendarClock className="mr-3 mt-1 h-4 w-4 shrink-0 text-rose-300" aria-hidden="true" />{isEnglish ? 'Visits and tattoo sessions are by confirmed appointment only.' : 'Las visitas y sesiones son únicamente con cita confirmada.'}</p>
              <p className="flex items-start"><Building2 className="mr-3 mt-1 h-4 w-4 shrink-0 text-rose-300" aria-hidden="true" />{isEnglish ? 'Hans is an independent resident artist at Gara Art Studio.' : 'Hans es un artista residente independiente en Gara Art Studio.'}</p>
            </div>
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-white px-5 text-sm font-black text-stone-950 hover:bg-[#E53E3E] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              {isEnglish ? 'OPEN IN GOOGLE MAPS' : 'ABRIR EN GOOGLE MAPS'}<ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <div className="min-h-[360px] overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-100">
            <iframe src={embedUrl} title={isEnglish ? 'Gara Art Studio at 240 W 40th St in Manhattan' : 'Gara Art Studio en 240 W 40th St, Manhattan'} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full min-h-[360px] w-full border-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
