import { BarChart3, ShieldCheck, X } from 'lucide-react';
import type { Language } from '../types';
import type { TrackingConsent } from '../lib/tracking';

interface ConsentBannerProps {
  language: Language;
  open: boolean;
  onClose: () => void;
  onSelect: (choice: TrackingConsent) => void;
}

const copy = {
  en: {
    eyebrow: 'YOUR PRIVACY CHOICES',
    title: 'Help improve this website',
    body: 'With your permission, analytics and advertising measurement help Hans understand which campaigns lead to real consultation requests. Form details and reference images are never sent to Google or Meta.',
    privacy: 'Read the Privacy Policy',
    necessary: 'Necessary only',
    allow: 'Allow measurement',
    close: 'Close privacy choices',
  },
  es: {
    eyebrow: 'TUS OPCIONES DE PRIVACIDAD',
    title: 'Ayuda a mejorar este sitio',
    body: 'Con tu permiso, la analítica y la medición publicitaria ayudan a Hans a saber qué campañas generan solicitudes de consulta reales. Los datos del formulario y las imágenes nunca se envían a Google ni a Meta.',
    privacy: 'Leer la Política de Privacidad',
    necessary: 'Solo lo necesario',
    allow: 'Permitir medición',
    close: 'Cerrar opciones de privacidad',
  },
};

export default function ConsentBanner({ language, open, onClose, onSelect }: ConsentBannerProps) {
  if (!open) return null;
  const t = copy[language];
  const privacyPath = language === 'es' ? '/es/privacy' : '/privacy';

  return (
    <aside aria-labelledby="privacy-choices-title" className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-5 shadow-2xl sm:bottom-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="hidden rounded-2xl bg-rose-50 p-3 text-[#C9362B] sm:block"><BarChart3 className="h-5 w-5" aria-hidden="true" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black tracking-[0.2em] text-[#C9362B]">{t.eyebrow}</p>
          <h2 id="privacy-choices-title" className="mt-1 text-xl font-black tracking-tight">{t.title}</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">{t.body}</p>
          <a className="mt-2 inline-flex items-center text-sm font-black underline underline-offset-2" href={privacyPath}><ShieldCheck className="mr-1.5 h-4 w-4" aria-hidden="true" />{t.privacy}</a>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => onSelect('denied')} className="min-h-11 rounded-full border border-stone-300 px-5 text-sm font-black hover:border-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9362B]">{t.necessary}</button>
            <button type="button" onClick={() => onSelect('granted')} className="min-h-11 rounded-full bg-stone-950 px-5 text-sm font-black text-white hover:bg-[#C9362B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9362B]">{t.allow}</button>
          </div>
        </div>
        <button type="button" onClick={onClose} className="-mr-2 -mt-2 rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-950" aria-label={t.close}><X className="h-5 w-5" aria-hidden="true" /></button>
      </div>
    </aside>
  );
}
