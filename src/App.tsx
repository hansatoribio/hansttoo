import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowRight, Instagram, MapPin, MessageCircle, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import AboutArtist from './components/AboutArtist';
import ConsentBanner from './components/ConsentBanner';
import FAQ from './components/FAQ';
import Hero from './components/Hero';
import InquiryForm from './components/InquiryForm';
import InteractiveMap from './components/InteractiveMap';
import MobileBottomNav from './components/MobileBottomNav';
import Navbar from './components/Navbar';
import Portfolio from './components/Portfolio';
import PrivacyPolicy from './components/PrivacyPolicy';
import ThankYou from './components/ThankYou';
import { readLeadAttribution } from './lib/attribution';
import { getStoredTrackingConsent, initTracking, trackLeadConversion, updateTrackingConsent } from './lib/tracking';
import type { TrackingConsent } from './lib/tracking';
import { localizedPath, updatePageMetadata } from './lib/seo';
import { Inquiry, Language, TattooStyle } from './types';

const copy = {
  en: {
    processEyebrow: 'WHAT HAPPENS NEXT',
    processTitle: 'A clear consultation process',
    steps: [
      ['Send the essentials', 'Share your idea, style, placement, and approximate size. Reference images are optional.'],
      ['Hans reviews the request', 'If the project is a good fit, Hans will reply through your preferred contact method with questions and availability.'],
      ['Plan the appointment', 'Design direction, timing, and pricing are confirmed before an appointment at Gara Art Studio.'],
    ],
    footerText: 'Independent NYC tattoo artist. Resident artist at Gara Art Studio.',
    privacy: 'Privacy Policy',
    privacyChoices: 'Privacy choices',
    instagram: 'View @hansttoo on Instagram',
    address: 'Appointments at 240 W 40th St, New York, NY 10018',
  },
  es: {
    processEyebrow: 'QUÉ SUCEDE DESPUÉS',
    processTitle: 'Un proceso de consulta claro',
    steps: [
      ['Envía lo esencial', 'Comparte tu idea, estilo, zona y tamaño aproximado. Las imágenes de referencia son opcionales.'],
      ['Hans revisa la solicitud', 'Si el proyecto encaja, Hans responderá por tu medio de contacto preferido con preguntas y disponibilidad.'],
      ['Planifica la cita', 'La dirección del diseño, el tiempo y el precio se confirman antes de una cita en Gara Art Studio.'],
    ],
    footerText: 'Artista del tatuaje independiente en NYC. Artista residente en Gara Art Studio.',
    privacy: 'Política de Privacidad',
    privacyChoices: 'Opciones de privacidad',
    instagram: 'Ver @hansttoo en Instagram',
    address: 'Citas en 240 W 40th St, New York, NY 10018',
  },
};

const AdminPage = lazy(() => import('./components/AdminPage'));

type PageKind = 'home' | 'privacy' | 'thank-you' | 'admin';

function resolveRoute(pathname: string): { language: Language; page: PageKind } {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  const language: Language = normalized === '/es' || normalized.startsWith('/es/') ? 'es' : 'en';
  if (normalized === '/admin' || normalized === '/es/admin') return { language, page: 'admin' };
  if (normalized === '/privacy' || normalized === '/es/privacy') return { language, page: 'privacy' };
  if (normalized === '/thank-you' || normalized === '/es/thank-you') return { language, page: 'thank-you' };
  return { language, page: 'home' };
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [preselectedStyle, setPreselectedStyle] = useState<TattooStyle | null>(null);
  const [consentOpen, setConsentOpen] = useState(() => getStoredTrackingConsent() === null);
  const [leadAttribution] = useState(() => readLeadAttribution());
  const { language, page: currentPage } = resolveRoute(path);

  useEffect(() => {
    initTracking();
  }, []);

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname);
    window.addEventListener('popstate', updatePath);
    return () => window.removeEventListener('popstate', updatePath);
  }, []);

  useEffect(() => {
    updatePageMetadata(language, currentPage);
  }, [currentPage, language]);

  const navigateRoute = (nextPath: string) => {
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSection = (sectionId: string) => {
    const homePath = localizedPath(language, 'home');
    if (resolveRoute(path).page !== 'home') {
      window.history.pushState({}, '', homePath);
      setPath(homePath);
      window.setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }), 50);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const changeLanguage = (nextLanguage: Language) => {
    const nextPath = localizedPath(nextLanguage, resolveRoute(path).page);
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  };

  const chooseTrackingConsent = (choice: TrackingConsent) => {
    updateTrackingConsent(choice);
    setConsentOpen(false);
  };

  const submitInquiry = async (inquiry: Inquiry) => {
    const { saveInquiryToSupabase } = await import('./lib/supabase');
    const attributedInquiry = { ...inquiry, attribution: leadAttribution };
    const result = await saveInquiryToSupabase(attributedInquiry);
    if (!result.success) {
      throw result.error instanceof Error ? result.error : new Error('The consultation service is unavailable.');
    }

    trackLeadConversion({
      style: inquiry.style,
      placement: inquiry.placement,
      size: inquiry.sizeCm,
    });
    const thankYouPath = localizedPath(language, 'thank-you');
    window.history.pushState({}, '', thankYouPath);
    setPath(thankYouPath);
    window.scrollTo({ top: 0 });
  };

  if (currentPage === 'admin') {
    return (
      <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#F3F0EC] text-sm font-bold text-stone-600">Loading secure admin…</main>}>
        <AdminPage />
      </Suspense>
    );
  }

  if (currentPage === 'privacy') {
    return (
      <>
        <PrivacyPolicy language={language} onBack={() => navigateRoute(localizedPath(language, 'home'))} />
        <ConsentBanner language={language} open={consentOpen} onClose={() => setConsentOpen(false)} onSelect={chooseTrackingConsent} />
      </>
    );
  }

  if (currentPage === 'thank-you') {
    return (
      <>
        <ThankYou language={language} onBack={() => navigateRoute(localizedPath(language, 'home'))} />
        <ConsentBanner language={language} open={consentOpen} onClose={() => setConsentOpen(false)} onSelect={chooseTrackingConsent} />
      </>
    );
  }

  const t = copy[language];

  return (
    <div className="min-h-screen bg-[#FCFBFA] text-stone-950">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg">
        {language === 'en' ? 'Skip to content' : 'Saltar al contenido'}
      </a>
      <Navbar language={language} onLanguageChange={changeLanguage} onNavigate={navigateToSection} />

      <main id="main-content">
        <Hero language={language} onNavigate={navigateToSection} />
        <Portfolio
          language={language}
          onInquireSimilar={(style) => {
            setPreselectedStyle(style);
            navigateToSection('booking');
          }}
        />
        <AboutArtist language={language} onNavigate={navigateToSection} />

        <section id="process" className="border-y border-stone-200 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-xs font-black tracking-[0.24em] text-[#C9362B]">{t.processEyebrow}</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.04em] sm:text-5xl">{t.processTitle}</h2>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {t.steps.map(([title, description], index) => (
                <li key={title} className="rounded-3xl border border-stone-200 bg-[#FCFBFA] p-6">
                  <span className="font-mono text-xs font-bold text-[#C9362B]">0{index + 1}</span>
                  <h3 className="mt-5 text-xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <InquiryForm language={language} preselectedStyle={preselectedStyle} onInquirySubmitted={submitInquiry} />
        <FAQ language={language} />
        <InteractiveMap language={language} />

        <section className="bg-stone-950 py-14 text-white">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 sm:px-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-black tracking-[0.22em] text-rose-300">HANS | NYC TATTOO ARTIST</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">{language === 'en' ? 'Have an idea in mind?' : '¿Tienes una idea en mente?'}</h2>
            </div>
            <button onClick={() => navigateToSection('booking')} className="inline-flex min-h-12 items-center rounded-full bg-[#E53E3E] px-6 text-sm font-black tracking-wide hover:bg-white hover:text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              {language === 'en' ? 'REQUEST A CONSULTATION' : 'SOLICITAR CONSULTA'}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-[#FCFBFA] pb-24 pt-10 md:pb-10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-2xl font-black tracking-[-0.06em]">hansttoo.</p>
            <p className="mt-2 max-w-md text-sm text-stone-600">{t.footerText}</p>
          </div>
          <div className="flex flex-col gap-3 text-sm font-bold">
            <a className="inline-flex items-center hover:text-[#C9362B]" href="https://instagram.com/hansttoo" target="_blank" rel="noopener noreferrer"><Instagram className="mr-2 h-4 w-4" aria-hidden="true" />{t.instagram}</a>
            <a className="inline-flex items-center hover:text-[#C9362B]" href="https://www.google.com/maps/search/?api=1&query=Gara%20Art%20Studio%20240%20W%2040th%20St%20New%20York%20NY%2010018" target="_blank" rel="noopener noreferrer"><MapPin className="mr-2 h-4 w-4" aria-hidden="true" />{t.address}</a>
            <button className="inline-flex items-center text-left hover:text-[#C9362B]" onClick={() => navigateRoute(localizedPath(language, 'privacy'))}><ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />{t.privacy}</button>
            <button className="inline-flex items-center text-left hover:text-[#C9362B]" onClick={() => setConsentOpen(true)}><SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />{t.privacyChoices}</button>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-stone-200 px-4 pt-6 text-xs text-stone-500 sm:px-6">
          <span>© {new Date().getFullYear()} Hans Toribio / @hansttoo</span>
          <span className="inline-flex items-center"><MessageCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />{language === 'en' ? 'English · Español available' : 'Español · English available'}</span>
        </div>
      </footer>

      <MobileBottomNav language={language} onNavigate={navigateToSection} />
      <ConsentBanner language={language} open={consentOpen} onClose={() => setConsentOpen(false)} onSelect={chooseTrackingConsent} />
    </div>
  );
}
