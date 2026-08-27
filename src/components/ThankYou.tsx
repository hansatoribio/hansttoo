import { ArrowLeft, CheckCircle2, Instagram } from 'lucide-react';
import { Language } from '../types';

interface ThankYouProps { language: Language; onBack: () => void }

export default function ThankYou({ language, onBack }: ThankYouProps) {
  return (
    <main className="flex min-h-screen items-center bg-stone-950 px-4 py-16 text-white sm:px-6" aria-live="polite">
      <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-white/15 bg-white/[0.04] p-7 text-center sm:p-12">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" aria-hidden="true" />
        <p className="mt-7 text-xs font-black tracking-[0.24em] text-rose-300">{language === 'en' ? 'REQUEST RECEIVED' : 'SOLICITUD RECIBIDA'}</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-6xl">{language === 'en' ? 'Thank you for your idea.' : 'Gracias por compartir tu idea.'}</h1>
        <p className="mx-auto mt-6 max-w-xl leading-7 text-stone-300">{language === 'en' ? 'Your consultation request was sent successfully. Hans will review the details and reply through your preferred contact method if the project is a fit. This message does not confirm an appointment.' : 'Tu solicitud se envió correctamente. Hans revisará los detalles y responderá por tu medio preferido si el proyecto encaja. Este mensaje no confirma una cita.'}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={onBack} className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-stone-950 hover:bg-rose-100"><ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />{language === 'en' ? 'BACK TO WEBSITE' : 'VOLVER AL SITIO'}</button>
          <a href="https://instagram.com/hansttoo" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-5 text-sm font-black hover:border-white"><Instagram className="mr-2 h-4 w-4" aria-hidden="true" />@hansttoo</a>
        </div>
      </div>
    </main>
  );
}
