import { Images, MapPin, MessageSquareText } from 'lucide-react';
import { Language } from '../types';

interface MobileBottomNavProps {
  language: Language;
  onNavigate: (section: string) => void;
}

export default function MobileBottomNav({ language, onNavigate }: MobileBottomNavProps) {
  const items = [
    { id: 'portfolio', icon: Images, en: 'Work', es: 'Trabajos' },
    { id: 'booking', icon: MessageSquareText, en: 'Consult', es: 'Consulta', primary: true },
    { id: 'location', icon: MapPin, en: 'Location', es: 'Ubicación' },
  ];

  return (
    <nav aria-label={language === 'en' ? 'Mobile quick navigation' : 'Navegación rápida móvil'} className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-stone-200 bg-white/95 p-2 shadow-2xl backdrop-blur-xl md:hidden pb-safe">
      <div className="grid grid-cols-3 gap-1">
        {items.map(({ id, icon: Icon, en, es, primary }) => (
          <button key={id} onClick={() => onNavigate(id)} className={'flex min-h-12 flex-col items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-wide ' + (primary ? 'bg-[#E53E3E] text-white' : 'text-stone-700 hover:bg-stone-100')}>
            <Icon className="mb-1 h-4 w-4" aria-hidden="true" />{language === 'en' ? en : es}
          </button>
        ))}
      </div>
    </nav>
  );
}
