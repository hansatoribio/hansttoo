import { useState } from 'react';
import { Instagram, Menu, X } from 'lucide-react';
import { Language } from '../types';

interface NavbarProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onNavigate: (section: string) => void;
}

const labels = {
  en: { work: 'Work', about: 'About', process: 'Process', faq: 'FAQ', location: 'Location', consult: 'Consultation', nav: 'Primary navigation', language: 'Language selector', home: 'Hansttoo home', instagram: 'Open @hansttoo on Instagram', open: 'Open menu', close: 'Close menu' },
  es: { work: 'Trabajos', about: 'Sobre Hans', process: 'Proceso', faq: 'Preguntas', location: 'Ubicación', consult: 'Consulta', nav: 'Navegación principal', language: 'Selector de idioma', home: 'Inicio de Hansttoo', instagram: 'Abrir @hansttoo en Instagram', open: 'Abrir menú', close: 'Cerrar menú' },
};

export default function Navbar({ language, onLanguageChange, onNavigate }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const t = labels[language];
  const links = [
    ['portfolio', t.work],
    ['about', t.about],
    ['process', t.process],
    ['faq', t.faq],
    ['location', t.location],
  ];

  const go = (id: string) => {
    setOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#FCFBFA]/95 backdrop-blur-xl">
      <nav aria-label={t.nav} className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button onClick={() => go('home')} className="text-2xl font-black tracking-[-0.07em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9362B]" aria-label={t.home}>
          hansttoo<span className="text-[#E53E3E]">.</span>
        </button>

        <div className="hidden items-center gap-6 lg:flex">
          {links.map(([id, label]) => (
            <button key={id} onClick={() => go(id)} className="text-xs font-bold uppercase tracking-[0.14em] text-stone-600 hover:text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9362B]">
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-stone-200 bg-white p-1" aria-label={t.language}>
            {(['en', 'es'] as Language[]).map((item) => (
              <button key={item} onClick={() => onLanguageChange(item)} aria-pressed={language === item} className={'rounded-full px-2.5 py-1 text-[11px] font-black uppercase ' + (language === item ? 'bg-stone-950 text-white' : 'text-stone-500 hover:text-stone-950')}>
                {item}
              </button>
            ))}
          </div>
          <a href="https://instagram.com/hansttoo" target="_blank" rel="noopener noreferrer" className="hidden rounded-full p-2 text-stone-700 hover:bg-white sm:inline-flex" aria-label={t.instagram}>
            <Instagram className="h-5 w-5" aria-hidden="true" />
          </a>
          <button onClick={() => go('booking')} className="hidden min-h-10 rounded-full bg-[#E53E3E] px-4 text-xs font-black tracking-wide text-white hover:bg-stone-950 sm:block">
            {t.consult}
          </button>
          <button onClick={() => setOpen((value) => !value)} className="rounded-full p-2 hover:bg-white lg:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? t.close : t.open}>
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div id="mobile-menu" className="border-t border-stone-200 bg-[#FCFBFA] px-4 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map(([id, label]) => (
              <button key={id} onClick={() => go(id)} className="min-h-12 rounded-xl px-4 text-left text-sm font-bold hover:bg-white">
                {label}
              </button>
            ))}
            <button onClick={() => go('booking')} className="mt-2 min-h-12 rounded-xl bg-[#E53E3E] px-4 text-left text-sm font-black text-white">
              {t.consult}
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
