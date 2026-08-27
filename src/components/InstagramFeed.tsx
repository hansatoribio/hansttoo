import { ArrowUpRight, Instagram } from 'lucide-react';
import { Language } from '../types';

interface InstagramFeedProps { language: Language; instagramUsername?: string }

export default function InstagramFeed({ language, instagramUsername = 'hansttoo' }: InstagramFeedProps) {
  return (
    <section className="bg-stone-950 py-12 text-white" aria-label={language === 'en' ? 'Instagram' : 'Instagram'}>
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center">
        <p className="inline-flex items-center text-sm text-stone-300"><Instagram className="mr-2 h-4 w-4" aria-hidden="true" />{language === 'en' ? 'See work published by Hans on Instagram.' : 'Mira el trabajo publicado por Hans en Instagram.'}</p>
        <a href={'https://instagram.com/' + instagramUsername} target="_blank" rel="noopener noreferrer" className="inline-flex items-center font-black hover:text-rose-300">@{instagramUsername}<ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" /></a>
      </div>
    </section>
  );
}
