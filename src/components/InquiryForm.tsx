import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown, ImagePlus, Loader2, LockKeyhole, Search, Trash2 } from 'lucide-react';
import { Inquiry, Language, TattooStyle } from '../types';

interface InquiryFormProps {
  language: Language;
  preselectedStyle: TattooStyle | null;
  onInquirySubmitted: (inquiry: Inquiry) => Promise<void>;
}

type ContactMethod = 'email' | 'instagram' | 'whatsapp';
type FormErrors = Record<string, string>;

interface CountryCode {
  code: string;
  country: string;
  countryEs: string;
  dial: string;
  flag: string;
}

const countryCodes: CountryCode[] = [
  { code: 'US', country: 'United States', countryEs: 'Estados Unidos', dial: '+1', flag: '🇺🇸' },
  { code: 'DO', country: 'Dominican Republic', countryEs: 'República Dominicana', dial: '+1', flag: '🇩🇴' },
  { code: 'PR', country: 'Puerto Rico', countryEs: 'Puerto Rico', dial: '+1', flag: '🇵🇷' },
  { code: 'CA', country: 'Canada', countryEs: 'Canadá', dial: '+1', flag: '🇨🇦' },
  { code: 'MX', country: 'Mexico', countryEs: 'México', dial: '+52', flag: '🇲🇽' },
  { code: 'ES', country: 'Spain', countryEs: 'España', dial: '+34', flag: '🇪🇸' },
  { code: 'CO', country: 'Colombia', countryEs: 'Colombia', dial: '+57', flag: '🇨🇴' },
  { code: 'VE', country: 'Venezuela', countryEs: 'Venezuela', dial: '+58', flag: '🇻🇪' },
  { code: 'EC', country: 'Ecuador', countryEs: 'Ecuador', dial: '+593', flag: '🇪🇨' },
  { code: 'PE', country: 'Peru', countryEs: 'Perú', dial: '+51', flag: '🇵🇪' },
  { code: 'AR', country: 'Argentina', countryEs: 'Argentina', dial: '+54', flag: '🇦🇷' },
  { code: 'CL', country: 'Chile', countryEs: 'Chile', dial: '+56', flag: '🇨🇱' },
  { code: 'BR', country: 'Brazil', countryEs: 'Brasil', dial: '+55', flag: '🇧🇷' },
  { code: 'UY', country: 'Uruguay', countryEs: 'Uruguay', dial: '+598', flag: '🇺🇾' },
  { code: 'PY', country: 'Paraguay', countryEs: 'Paraguay', dial: '+595', flag: '🇵🇾' },
  { code: 'BO', country: 'Bolivia', countryEs: 'Bolivia', dial: '+591', flag: '🇧🇴' },
  { code: 'PA', country: 'Panama', countryEs: 'Panamá', dial: '+507', flag: '🇵🇦' },
  { code: 'CR', country: 'Costa Rica', countryEs: 'Costa Rica', dial: '+506', flag: '🇨🇷' },
  { code: 'GT', country: 'Guatemala', countryEs: 'Guatemala', dial: '+502', flag: '🇬🇹' },
  { code: 'SV', country: 'El Salvador', countryEs: 'El Salvador', dial: '+503', flag: '🇸🇻' },
  { code: 'HN', country: 'Honduras', countryEs: 'Honduras', dial: '+504', flag: '🇭🇳' },
  { code: 'NI', country: 'Nicaragua', countryEs: 'Nicaragua', dial: '+505', flag: '🇳🇮' },
  { code: 'CU', country: 'Cuba', countryEs: 'Cuba', dial: '+53', flag: '🇨🇺' },
  { code: 'JM', country: 'Jamaica', countryEs: 'Jamaica', dial: '+1', flag: '🇯🇲' },
  { code: 'HT', country: 'Haiti', countryEs: 'Haití', dial: '+509', flag: '🇭🇹' },
  { code: 'TT', country: 'Trinidad and Tobago', countryEs: 'Trinidad y Tobago', dial: '+1', flag: '🇹🇹' },
  { code: 'GB', country: 'United Kingdom', countryEs: 'Reino Unido', dial: '+44', flag: '🇬🇧' },
  { code: 'FR', country: 'France', countryEs: 'Francia', dial: '+33', flag: '🇫🇷' },
  { code: 'IT', country: 'Italy', countryEs: 'Italia', dial: '+39', flag: '🇮🇹' },
  { code: 'DE', country: 'Germany', countryEs: 'Alemania', dial: '+49', flag: '🇩🇪' },
  { code: 'PT', country: 'Portugal', countryEs: 'Portugal', dial: '+351', flag: '🇵🇹' },
  { code: 'NL', country: 'Netherlands', countryEs: 'Países Bajos', dial: '+31', flag: '🇳🇱' },
  { code: 'CH', country: 'Switzerland', countryEs: 'Suiza', dial: '+41', flag: '🇨🇭' },
  { code: 'JP', country: 'Japan', countryEs: 'Japón', dial: '+81', flag: '🇯🇵' },
  { code: 'KR', country: 'South Korea', countryEs: 'Corea del Sur', dial: '+82', flag: '🇰🇷' },
  { code: 'CN', country: 'China', countryEs: 'China', dial: '+86', flag: '🇨🇳' },
  { code: 'IN', country: 'India', countryEs: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'AU', country: 'Australia', countryEs: 'Australia', dial: '+61', flag: '🇦🇺' },
];

const copy = {
  en: {
    eyebrow: 'CONSULTATION REQUEST',
    title: 'Tell Hans about your tattoo idea',
    subtitle: 'Share the essentials below. This is a request for availability, not a confirmed appointment.',
    name: 'Name',
    email: 'Email',
    instagram: 'Instagram username',
    phone: 'WhatsApp',
    countryCode: 'Country code',
    countrySearch: 'Search country or code',
    noCountries: 'No matching country found.',
    contact: 'Preferred contact method',
    contactHelp: 'Choose how Hans should reply. The matching field becomes required.',
    style: 'Style',
    size: 'Approximate width',
    placement: 'Placement',
    idea: 'Idea description',
    refs: 'Reference images (optional)',
    refsHelp: 'Up to 5 JPG, PNG, or WebP files · 5 MB each.',
    consent: 'I agree that Hans may use the information, optional images, and campaign source associated with this request to respond and measure consultation results.',
    privacy: 'Read the Privacy Policy',
    submit: 'REQUEST A CONSULTATION',
    sending: 'SENDING REQUEST…',
    required: 'Required',
    serverError: 'Your request could not be sent. Please try again. If the problem continues, contact @hansttoo on Instagram.',
    unavailable: 'Online consultation requests are not configured yet. Please contact @hansttoo on Instagram.',
    contactMethods: { email: 'Email', instagram: 'Instagram', whatsapp: 'WhatsApp' },
    styles: { anime: 'Anime / Manga', microrealism: 'Microrealism', fineline: 'Fine Line' },
    inches: 'inches',
    stepOne: 'YOUR IDEA',
    stepTwo: 'PROJECT DETAILS',
    continue: 'CONTINUE',
    back: 'BACK',
  },
  es: {
    eyebrow: 'SOLICITUD DE CONSULTA',
    title: 'Cuéntale a Hans tu idea de tatuaje',
    subtitle: 'Comparte lo esencial. Esta es una solicitud de disponibilidad, no una cita confirmada.',
    name: 'Nombre',
    email: 'Correo electrónico',
    instagram: 'Usuario de Instagram',
    phone: 'WhatsApp',
    countryCode: 'Código de país',
    countrySearch: 'Buscar país o código',
    noCountries: 'No se encontró ese país.',
    contact: 'Método de contacto preferido',
    contactHelp: 'Elige cómo debe responder Hans. El campo correspondiente será obligatorio.',
    style: 'Estilo',
    size: 'Ancho aproximado',
    placement: 'Zona',
    idea: 'Descripción de la idea',
    refs: 'Imágenes de referencia (opcionales)',
    refsHelp: 'Hasta 5 archivos JPG, PNG o WebP · 5 MB cada uno.',
    consent: 'Acepto que Hans use la información, las imágenes opcionales y el origen de campaña asociados con esta solicitud para responder y medir los resultados de las consultas.',
    privacy: 'Leer la Política de Privacidad',
    submit: 'SOLICITAR UNA CONSULTA',
    sending: 'ENVIANDO SOLICITUD…',
    required: 'Obligatorio',
    serverError: 'No se pudo enviar tu solicitud. Inténtalo de nuevo. Si el problema continúa, contacta a @hansttoo en Instagram.',
    unavailable: 'Las consultas en línea aún no están configuradas. Contacta a @hansttoo en Instagram.',
    contactMethods: { email: 'Correo', instagram: 'Instagram', whatsapp: 'WhatsApp' },
    styles: { anime: 'Anime / Manga', microrealism: 'Microrrealismo', fineline: 'Línea fina' },
    inches: 'pulgadas',
    stepOne: 'TU IDEA',
    stepTwo: 'DETALLES DEL PROYECTO',
    continue: 'CONTINUAR',
    back: 'ATRÁS',
  },
};

const inputClass = 'mt-2 min-h-12 w-full rounded-2xl border border-stone-300 bg-white px-4 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-950 focus:ring-2 focus:ring-stone-950/10';
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxFileBytes = 5 * 1024 * 1024;

function localeCountryCode() {
  if (typeof navigator === 'undefined') return 'US';
  const localeRegion = navigator.language.split('-')[1]?.toUpperCase();
  return countryCodes.some((country) => country.code === localeRegion) ? localeRegion : 'US';
}

function countryName(country: CountryCode, language: Language) {
  return language === 'en' ? country.country : country.countryEs;
}

function StylePicker({ language, value, onChange }: { language: Language; value: TattooStyle; onChange: (style: TattooStyle) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const options: { value: TattooStyle; label: string }[] = language === 'en'
    ? [
        { value: 'anime', label: 'Anime / Manga' },
        { value: 'microrealism', label: 'Microrealism' },
        { value: 'fineline', label: 'Fine Line' },
      ]
    : [
        { value: 'anime', label: 'Anime / Manga' },
        { value: 'microrealism', label: 'Microrrealismo' },
        { value: 'fineline', label: 'Línea fina' },
      ];
  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative mt-2" onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}>
      <button
        id="style"
        type="button"
        className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-stone-300 bg-white px-4 text-left text-base font-bold text-stone-950 outline-none transition hover:border-stone-500 focus:border-stone-950 focus:ring-2 focus:ring-stone-950/10"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="style-label style"
        onClick={() => setOpen((valueOpen) => !valueOpen)}
      >
        <span>{selected.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open ? (
        <div role="listbox" aria-label={language === 'en' ? 'Tattoo style' : 'Estilo de tatuaje'} className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-stone-200 bg-white p-1.5 shadow-2xl shadow-stone-950/15">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm font-bold transition ${value === option.value ? 'bg-stone-950 text-white' : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
              {value === option.value ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CountryCodePicker({ language, value, onChange }: { language: Language; value: CountryCode; onChange: (country: CountryCode) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredCountries = countryCodes.filter((country) => (
    !normalizedQuery
    || country.country.toLocaleLowerCase().includes(normalizedQuery)
    || country.countryEs.toLocaleLowerCase().includes(normalizedQuery)
    || country.code.toLocaleLowerCase().includes(normalizedQuery)
    || country.dial.includes(normalizedQuery)
  ));

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (open) window.setTimeout(() => searchRef.current?.focus(), 0);
    else setQuery('');
  }, [open]);

  return (
    <div ref={containerRef} className="relative mt-2" onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}>
      <button
        id="country-code"
        type="button"
        className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-stone-300 bg-white px-3 text-left text-base font-bold text-stone-950 outline-none transition hover:border-stone-500 focus:border-stone-950 focus:ring-2 focus:ring-stone-950/10"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${language === 'en' ? 'Country code' : 'Código de país'}: ${countryName(value, language)} ${value.dial}`}
        onClick={() => setOpen((valueOpen) => !valueOpen)}
      >
        <span className="inline-flex min-w-0 items-center gap-2"><span aria-hidden="true">{value.flag}</span><span>{value.dial}</span></span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open ? (
        <div className="absolute left-0 z-40 mt-2 w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl shadow-stone-950/20" role="dialog" aria-label={language === 'en' ? 'Choose country code' : 'Elegir código de país'}>
          <label className="relative block">
            <span className="sr-only">{language === 'en' ? 'Search country or code' : 'Buscar país o código'}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
            <input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === 'en' ? 'Search country or code' : 'Buscar país o código'} className="min-h-11 w-full rounded-xl border border-stone-300 bg-stone-50 pl-9 pr-3 text-sm outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/10" />
          </label>
          <div className="mt-2 max-h-64 overflow-y-auto overscroll-contain" role="listbox">
            {filteredCountries.length ? filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                role="option"
                aria-selected={country.code === value.code}
                className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition ${country.code === value.code ? 'bg-stone-950 font-bold text-white' : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'}`}
                onClick={() => {
                  onChange(country);
                  setOpen(false);
                }}
              >
                <span className="text-lg" aria-hidden="true">{country.flag}</span>
                <span className="min-w-0 flex-1 truncate">{countryName(country, language)}</span>
                <span className={country.code === value.code ? 'text-stone-300' : 'text-stone-500'}>{country.dial}</span>
                {country.code === value.code ? <Check className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
              </button>
            )) : <p className="px-3 py-5 text-center text-sm text-stone-500">{language === 'en' ? 'No matching country found.' : 'No se encontró ese país.'}</p>}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read image.'));
    reader.readAsDataURL(file);
  });
}

export default function InquiryForm({ language, preselectedStyle, onInquirySubmitted }: InquiryFormProps) {
  const t = copy[language];
  const formStartedAt = useRef(Date.now());
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState<CountryCode>(() => countryCodes.find((item) => item.code === localeCountryCode()) || countryCodes[0]);
  const [preferredContactMethod, setPreferredContactMethod] = useState<ContactMethod>('instagram');
  const [style, setStyle] = useState<TattooStyle>('anime');
  const [sizeInches, setSizeInches] = useState('4');
  const [placement, setPlacement] = useState('');
  const [description, setDescription] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (preselectedStyle) setStyle(preselectedStyle);
  }, [preselectedStyle]);

  const sizeCm = useMemo(() => {
    const inches = Number(sizeInches);
    return Number.isFinite(inches) ? Math.round(inches * 2.54 * 10) / 10 : 0;
  }, [sizeInches]);

  const phoneE164 = useMemo(() => {
    const nationalDigits = phone.replace(/\D/g, '');
    return nationalDigits ? `${country.dial}${nationalDigits}` : '';
  }, [country.dial, phone]);

  const handleWhatsAppChange = (value: string) => {
    if (!value.trim().startsWith('+')) {
      setPhone(value);
      return;
    }

    const digits = value.replace(/\D/g, '');
    const matchingDial = Array.from(new Set(countryCodes.map((item) => item.dial.replace(/\D/g, ''))))
      .sort((first, second) => second.length - first.length)
      .find((dialDigits) => digits.startsWith(dialDigits));
    if (!matchingDial) {
      setPhone(value);
      return;
    }

    const matches = countryCodes.filter((item) => item.dial.replace(/\D/g, '') === matchingDial);
    const detectedCountry = matches.find((item) => item.code === country.code) || matches[0];
    if (detectedCountry) setCountry(detectedCountry);
    setPhone(digits.slice(matchingDial.length));
  };

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files: File[] = event.target.files ? Array.from(event.target.files) : [];
    event.target.value = '';
    const remaining = 5 - referenceImages.length;
    const accepted = files.slice(0, remaining).filter((file) => allowedTypes.has(file.type) && file.size <= maxFileBytes);
    if (accepted.length !== files.slice(0, remaining).length || files.length > remaining) {
      setErrors((current) => ({ ...current, images: language === 'en' ? 'Choose up to 5 JPG, PNG, or WebP images no larger than 5 MB each.' : 'Elige hasta 5 imágenes JPG, PNG o WebP de no más de 5 MB cada una.' }));
    } else {
      setErrors((current) => {
        const next = { ...current };
        delete next.images;
        return next;
      });
    }
    try {
      const encoded = await Promise.all(accepted.map(fileToDataUrl));
      setReferenceImages((current) => [...current, ...encoded].slice(0, 5));
    } catch {
      setErrors((current) => ({ ...current, images: language === 'en' ? 'One of the selected images could not be read.' : 'No se pudo leer una de las imágenes seleccionadas.' }));
    }
  };

  const stepOneErrors = () => {
    const next: FormErrors = {};
    if (!fullName.trim()) next.fullName = language === 'en' ? 'Enter your name.' : 'Escribe tu nombre.';
    if (preferredContactMethod === 'email' && !email.trim()) next.email = language === 'en' ? 'Email is required for your selected contact method.' : 'El correo es obligatorio para el método elegido.';
    else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = language === 'en' ? 'Enter a valid email.' : 'Escribe un correo válido.';
    if (preferredContactMethod === 'instagram' && !instagram.trim()) next.instagram = language === 'en' ? 'Instagram username is required for your selected contact method.' : 'El usuario de Instagram es obligatorio para el método elegido.';
    else if (instagram.trim() && !/^@?[A-Za-z0-9._]{1,30}$/.test(instagram.trim())) next.instagram = language === 'en' ? 'Enter a valid Instagram username.' : 'Escribe un usuario de Instagram válido.';
    const whatsAppDigitCount = phoneE164.replace(/\D/g, '').length;
    if (preferredContactMethod === 'whatsapp' && !phone.trim()) next.phone = language === 'en' ? 'WhatsApp is required for your selected contact method.' : 'WhatsApp es obligatorio para el método elegido.';
    else if (phone.trim() && (whatsAppDigitCount < 7 || whatsAppDigitCount > 15)) next.phone = language === 'en' ? 'Enter a valid WhatsApp number.' : 'Escribe un número de WhatsApp válido.';
    if (description.trim().length < 15) next.description = language === 'en' ? 'Describe your idea in at least 15 characters.' : 'Describe tu idea con al menos 15 caracteres.';
    return next;
  };

  const continueToDetails = () => {
    const next = stepOneErrors();
    setErrors(next);
    setServerError('');
    if (Object.keys(next).length) {
      window.setTimeout(() => errorSummaryRef.current?.focus(), 0);
      return;
    }
    setCurrentStep(2);
    window.setTimeout(() => document.getElementById('booking-form-step')?.focus(), 0);
  };

  const validate = () => {
    const next: FormErrors = stepOneErrors();
    if (!placement.trim()) next.placement = language === 'en' ? 'Enter the placement.' : 'Escribe la zona.';
    if (!sizeCm || sizeCm < 1.3 || sizeCm > 127) next.size = language === 'en' ? 'Enter a size from 0.5 to 50 inches.' : 'Escribe un tamaño entre 0.5 y 50 pulgadas.';
    if (description.trim().length < 15) next.description = language === 'en' ? 'Describe your idea in at least 15 characters.' : 'Describe tu idea con al menos 15 caracteres.';
    if (!consent) next.consent = language === 'en' ? 'Consent is required to send the request.' : 'El consentimiento es obligatorio.';
    // Only surface the timing/honeypot check after the visitor-facing fields are valid.
    // This keeps the error summary useful for people who submit an incomplete form quickly.
    if (Object.keys(next).length === 0 && (honeypot || Date.now() - formStartedAt.current < 1500)) {
      next.spam = language === 'en' ? 'Please wait a moment and try again.' : 'Espera un momento e inténtalo de nuevo.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError('');
    if (!validate()) {
      if (Object.keys(stepOneErrors()).length) setCurrentStep(1);
      window.setTimeout(() => errorSummaryRef.current?.focus(), 0);
      return;
    }

    setIsSubmitting(true);
    const normalizedInstagram = instagram.trim() ? (instagram.trim().startsWith('@') ? instagram.trim() : '@' + instagram.trim()) : undefined;
    const inquiry: Inquiry = {
      id: 'inq-' + (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phoneE164,
      instagram: normalizedInstagram,
      preferredContactMethod,
      style,
      placement: placement.trim(),
      sizeCm,
      description: description.trim(),
      referenceImage: referenceImages[0] || null,
      referenceImages,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await onInquirySubmitted(inquiry);
    } catch (error) {
      const message = error instanceof Error && error.message.includes('not configured') ? t.unavailable : t.serverError;
      setServerError(message);
      window.setTimeout(() => errorSummaryRef.current?.focus(), 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldError = (key: string) => errors[key] ? <p id={key + '-error'} className="mt-2 flex items-center text-sm font-bold text-red-700"><AlertCircle className="mr-1.5 h-4 w-4" aria-hidden="true" />{errors[key]}</p> : null;

  return (
    <section id="booking" className="bg-[#F3F0EC] py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-black tracking-[0.24em] text-[#C9362B]">{t.eyebrow}</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-6xl">{t.title}</h2>
          <p className="mt-5 text-base leading-7 text-stone-600">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-10 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
          {(Object.keys(errors).length > 0 || serverError) ? (
            <div ref={errorSummaryRef} tabIndex={-1} role="alert" className="mb-7 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 outline-none">
              <p className="font-black">{serverError || (language === 'en' ? 'Please review the highlighted fields.' : 'Revisa los campos señalados.')}</p>
              {errors.spam ? <p className="mt-1">{errors.spam}</p> : null}
            </div>
          ) : null}

          <div id="booking-form-step" tabIndex={-1} className="outline-none">
            <div className="mb-8 flex items-center gap-3" aria-label={language === 'en' ? `Step ${currentStep} of 2` : `Paso ${currentStep} de 2`}>
              <span className="font-mono text-xs font-black text-[#C9362B]">0{currentStep} / 02</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200"><div className={`h-full rounded-full bg-[#E53E3E] transition-all ${currentStep === 1 ? 'w-1/2' : 'w-full'}`} /></div>
              <span className="text-xs font-black tracking-wider text-stone-600">{currentStep === 1 ? t.stepOne : t.stepTwo}</span>
            </div>

            {currentStep === 1 ? (
              <div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block text-sm font-black" htmlFor="full-name">{t.name} <span className="text-[#C9362B]">*</span>
                    <input id="full-name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'fullName-error' : undefined} />
                    {fieldError('fullName')}
                  </label>
                  <div className="block text-sm font-black">
                    <span id="style-label">{t.style} <span className="text-[#C9362B]">*</span></span>
                    <StylePicker language={language} value={style} onChange={setStyle} />
                  </div>
                </div>

                <fieldset className="mt-6">
                  <legend className="text-sm font-black">{t.contact} <span className="text-[#C9362B]">*</span></legend>
                  <p className="mt-1 text-sm text-stone-500">{t.contactHelp}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(['instagram', 'whatsapp', 'email'] as ContactMethod[]).map((method) => (
                      <label key={method} className={'cursor-pointer rounded-full border px-4 py-2 text-sm font-bold ' + (preferredContactMethod === method ? 'border-stone-950 bg-stone-950 text-white' : 'border-stone-300 bg-white text-stone-700')}>
                        <input type="radio" className="sr-only" name="preferred-contact" value={method} checked={preferredContactMethod === method} onChange={() => setPreferredContactMethod(method)} />
                        {t.contactMethods[method]}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="mt-6">
                  {preferredContactMethod === 'instagram' ? (
                    <label className="block text-sm font-black" htmlFor="instagram">{t.instagram} <span className="text-[#C9362B]">*</span>
                      <input id="instagram" autoComplete="off" required value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@yourusername" className={inputClass} aria-invalid={Boolean(errors.instagram)} aria-describedby={errors.instagram ? 'instagram-error' : undefined} />
                      {fieldError('instagram')}
                    </label>
                  ) : null}
                  {preferredContactMethod === 'email' ? (
                    <label className="block text-sm font-black" htmlFor="email">{t.email} <span className="text-[#C9362B]">*</span>
                      <input id="email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
                      {fieldError('email')}
                    </label>
                  ) : null}
                  {preferredContactMethod === 'whatsapp' ? (
                    <div className="block text-sm font-black">
                      <span>{t.phone} <span className="text-[#C9362B]">*</span></span>
                      <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-2">
                        <CountryCodePicker language={language} value={country} onChange={setCountry} />
                        <label className="block" htmlFor="phone"><span className="sr-only">{language === 'en' ? 'WhatsApp number' : 'Número de WhatsApp'}</span>
                          <input id="phone" type="tel" inputMode="tel" autoComplete="tel-national" required value={phone} onChange={(event) => handleWhatsAppChange(event.target.value)} placeholder="212 555 0123" className={inputClass} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : 'whatsapp-help'} />
                        </label>
                      </div>
                      <p id="whatsapp-help" className="mt-2 text-xs font-normal text-stone-500">{language === 'en' ? 'Paste an international number to detect its country code.' : 'Pega un número internacional para detectar su código de país.'}</p>
                      {fieldError('phone')}
                    </div>
                  ) : null}
                </div>

                <label className="mt-6 block text-sm font-black" htmlFor="description">{t.idea} <span className="text-[#C9362B]">*</span>
                  <textarea id="description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={language === 'en' ? 'Describe the subject, mood, details, and anything Hans should know.' : 'Describe el tema, ambiente, detalles y cualquier información importante.'} className={inputClass + ' py-3'} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'description-error' : undefined} />
                  {fieldError('description')}
                </label>
                <div className="mt-7 flex justify-end">
                  <button type="button" onClick={continueToDetails} className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#E53E3E] px-7 text-sm font-black tracking-wide text-white hover:bg-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9362B]">{t.continue}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></button>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block text-sm font-black" htmlFor="size">{t.size} <span className="text-[#C9362B]">*</span>
                    <div className="relative"><input id="size" type="number" min="0.5" max="50" step="0.25" inputMode="decimal" value={sizeInches} onChange={(e) => setSizeInches(e.target.value)} className={inputClass + ' pr-24'} aria-invalid={Boolean(errors.size)} aria-describedby="size-help" /><span className="pointer-events-none absolute right-4 top-[1.4rem] text-sm font-bold text-stone-500">{t.inches}</span></div>
                    <p id="size-help" className="mt-2 text-xs text-stone-500">≈ {sizeCm || 0} cm</p>{fieldError('size')}
                  </label>
                  <label className="block text-sm font-black" htmlFor="placement">{t.placement} <span className="text-[#C9362B]">*</span>
                    <input id="placement" value={placement} onChange={(e) => setPlacement(e.target.value)} placeholder={language === 'en' ? 'Example: inner forearm' : 'Ejemplo: antebrazo interno'} className={inputClass} aria-invalid={Boolean(errors.placement)} aria-describedby={errors.placement ? 'placement-error' : undefined} />{fieldError('placement')}
                  </label>
                </div>

                <div className="mt-8">
                  <label htmlFor="reference-images" className="text-sm font-black">{t.refs}</label>
                  <p className="mt-1 text-sm text-stone-500">{t.refsHelp}</p>
                  <label htmlFor="reference-images" className="mt-3 flex min-h-28 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-stone-400 bg-stone-50 px-4 text-center text-sm font-bold text-stone-600 hover:border-stone-950 hover:bg-white"><ImagePlus className="mr-2 h-5 w-5" aria-hidden="true" />{language === 'en' ? 'Choose reference images' : 'Elegir imágenes de referencia'}</label>
                  <input id="reference-images" type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} />
                  {fieldError('images')}
                  {referenceImages.length ? (
                    <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5" aria-label={language === 'en' ? 'Selected reference images' : 'Imágenes seleccionadas'}>
                      {referenceImages.map((image, index) => (
                        <li key={image.slice(-32) + index} className="relative aspect-square overflow-hidden rounded-xl border border-stone-200 bg-stone-100"><img src={image} alt={language === 'en' ? 'Reference preview ' + (index + 1) : 'Vista previa ' + (index + 1)} className="h-full w-full object-cover" /><button type="button" onClick={() => setReferenceImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-1 top-1 rounded-full bg-stone-950/85 p-2 text-white" aria-label={language === 'en' ? 'Remove reference image ' + (index + 1) : 'Eliminar imagen ' + (index + 1)}><Trash2 className="h-4 w-4" aria-hidden="true" /></button></li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-700" htmlFor="consent">
                  <input id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-stone-950" aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? 'consent-error' : undefined} />
                  <span>{t.consent} <a href={language === 'es' ? '/es/privacy' : '/privacy'} className="font-black underline underline-offset-2">{t.privacy}</a>.</span>
                </label>
                {fieldError('consent')}

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={() => setCurrentStep(1)} className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-300 px-5 text-sm font-black text-stone-700 hover:border-stone-950"><ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />{t.back}</button>
                  <button type="submit" disabled={isSubmitting} className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#E53E3E] px-7 text-sm font-black tracking-wide text-white hover:bg-stone-950 disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9362B]">{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />}{isSubmitting ? t.sending : t.submit}</button>
                </div>
                <p className="mt-4 inline-flex items-center text-xs text-stone-500"><LockKeyhole className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />{language === 'en' ? 'Your information is used to respond to this request.' : 'Tu información se usa para responder a esta solicitud.'}</p>
              </div>
            )}
          </div>

          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} hidden aria-hidden="true" />
          <div className="sr-only" aria-live="polite">{isSubmitting ? t.sending : ''}</div>
        </form>
      </div>
    </section>
  );
}
