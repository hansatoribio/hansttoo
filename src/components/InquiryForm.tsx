import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, LockKeyhole, Trash2 } from 'lucide-react';
import { Inquiry, Language, TattooStyle } from '../types';

interface InquiryFormProps {
  language: Language;
  preselectedStyle: TattooStyle | null;
  onInquirySubmitted: (inquiry: Inquiry) => Promise<void>;
}

type ContactMethod = 'email' | 'instagram' | 'phone';
type FormErrors = Record<string, string>;

const copy = {
  en: {
    eyebrow: 'CONSULTATION REQUEST',
    title: 'Tell Hans about your tattoo idea',
    subtitle: 'Share the essentials below. This is a request for availability, not a confirmed appointment.',
    name: 'Name',
    email: 'Email',
    instagram: 'Instagram username',
    phone: 'Phone or WhatsApp',
    contact: 'Preferred contact method',
    contactHelp: 'Provide at least one contact option and select the one Hans should use first.',
    style: 'Style',
    size: 'Approximate width',
    placement: 'Placement',
    idea: 'Idea description',
    refs: 'Reference images (optional)',
    refsHelp: 'Up to 5 JPG, PNG, or WebP files · 5 MB each.',
    consent: 'I agree that Hans may use the information and optional images I submit to respond to this consultation request.',
    privacy: 'Read the Privacy Policy',
    submit: 'REQUEST A CONSULTATION',
    sending: 'SENDING REQUEST…',
    required: 'Required',
    serverError: 'Your request could not be sent. Please try again. If the problem continues, contact @hansttoo on Instagram.',
    unavailable: 'Online consultation requests are not configured yet. Please contact @hansttoo on Instagram.',
    contactMethods: { email: 'Email', instagram: 'Instagram', phone: 'Phone / WhatsApp' },
    styles: { anime: 'Anime / Manga', microrealism: 'Microrealism', fineline: 'Fine Line' },
    inches: 'inches',
  },
  es: {
    eyebrow: 'SOLICITUD DE CONSULTA',
    title: 'Cuéntale a Hans tu idea de tatuaje',
    subtitle: 'Comparte lo esencial. Esta es una solicitud de disponibilidad, no una cita confirmada.',
    name: 'Nombre',
    email: 'Correo electrónico',
    instagram: 'Usuario de Instagram',
    phone: 'Teléfono o WhatsApp',
    contact: 'Método de contacto preferido',
    contactHelp: 'Proporciona al menos una opción de contacto y elige cuál debe usar Hans primero.',
    style: 'Estilo',
    size: 'Ancho aproximado',
    placement: 'Zona',
    idea: 'Descripción de la idea',
    refs: 'Imágenes de referencia (opcionales)',
    refsHelp: 'Hasta 5 archivos JPG, PNG o WebP · 5 MB cada uno.',
    consent: 'Acepto que Hans use la información y las imágenes opcionales que envío para responder a esta solicitud de consulta.',
    privacy: 'Leer la Política de Privacidad',
    submit: 'SOLICITAR UNA CONSULTA',
    sending: 'ENVIANDO SOLICITUD…',
    required: 'Obligatorio',
    serverError: 'No se pudo enviar tu solicitud. Inténtalo de nuevo. Si el problema continúa, contacta a @hansttoo en Instagram.',
    unavailable: 'Las consultas en línea aún no están configuradas. Contacta a @hansttoo en Instagram.',
    contactMethods: { email: 'Correo', instagram: 'Instagram', phone: 'Teléfono / WhatsApp' },
    styles: { anime: 'Anime / Manga', microrealism: 'Microrrealismo', fineline: 'Línea fina' },
    inches: 'pulgadas',
  },
};

const inputClass = 'mt-2 min-h-12 w-full rounded-2xl border border-stone-300 bg-white px-4 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-950 focus:ring-2 focus:ring-stone-950/10';
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxFileBytes = 5 * 1024 * 1024;

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
  const [preferredContactMethod, setPreferredContactMethod] = useState<ContactMethod>('email');
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

  useEffect(() => {
    if (preselectedStyle) setStyle(preselectedStyle);
  }, [preselectedStyle]);

  const sizeCm = useMemo(() => {
    const inches = Number(sizeInches);
    return Number.isFinite(inches) ? Math.round(inches * 2.54 * 10) / 10 : 0;
  }, [sizeInches]);

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

  const validate = () => {
    const next: FormErrors = {};
    if (!fullName.trim()) next.fullName = language === 'en' ? 'Enter your name.' : 'Escribe tu nombre.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = language === 'en' ? 'Enter a valid email.' : 'Escribe un correo válido.';
    if (!email.trim() && !instagram.trim() && !phone.trim()) next.contact = language === 'en' ? 'Provide an email, Instagram username, or phone number.' : 'Proporciona un correo, usuario de Instagram o teléfono.';
    if (preferredContactMethod === 'email' && !email.trim()) next.preferredContact = language === 'en' ? 'Add an email or choose another contact method.' : 'Añade un correo o elige otro método.';
    if (preferredContactMethod === 'instagram' && !instagram.trim()) next.preferredContact = language === 'en' ? 'Add an Instagram username or choose another contact method.' : 'Añade un usuario de Instagram o elige otro método.';
    if (preferredContactMethod === 'phone' && !phone.trim()) next.preferredContact = language === 'en' ? 'Add a phone number or choose another contact method.' : 'Añade un teléfono o elige otro método.';
    if (!placement.trim()) next.placement = language === 'en' ? 'Enter the placement.' : 'Escribe la zona.';
    if (!sizeCm || sizeCm < 1.3 || sizeCm > 127) next.size = language === 'en' ? 'Enter a size from 0.5 to 50 inches.' : 'Escribe un tamaño entre 0.5 y 50 pulgadas.';
    if (description.trim().length < 15) next.description = language === 'en' ? 'Describe your idea in at least 15 characters.' : 'Describe tu idea con al menos 15 caracteres.';
    if (!consent) next.consent = language === 'en' ? 'Consent is required to send the request.' : 'El consentimiento es obligatorio.';
    if (honeypot || Date.now() - formStartedAt.current < 1500) next.spam = language === 'en' ? 'Please wait a moment and try again.' : 'Espera un momento e inténtalo de nuevo.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError('');
    if (!validate()) {
      window.setTimeout(() => errorSummaryRef.current?.focus(), 0);
      return;
    }

    setIsSubmitting(true);
    const normalizedInstagram = instagram.trim() ? (instagram.trim().startsWith('@') ? instagram.trim() : '@' + instagram.trim()) : undefined;
    const inquiry: Inquiry = {
      id: 'inq-' + (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
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

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-black" htmlFor="full-name">{t.name} <span className="text-[#C9362B]">*</span>
              <input id="full-name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'fullName-error' : undefined} />
              {fieldError('fullName')}
            </label>
            <label className="block text-sm font-black" htmlFor="email">{t.email}
              <input id="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
              {fieldError('email')}
            </label>
            <label className="block text-sm font-black" htmlFor="instagram">{t.instagram}
              <input id="instagram" autoComplete="off" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@yourusername" className={inputClass} />
            </label>
            <label className="block text-sm font-black" htmlFor="phone">{t.phone}
              <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 212 555 0123" className={inputClass} />
            </label>
          </div>
          {fieldError('contact')}

          <fieldset className="mt-6">
            <legend className="text-sm font-black">{t.contact} <span className="text-[#C9362B]">*</span></legend>
            <p className="mt-1 text-sm text-stone-500">{t.contactHelp}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(['email', 'instagram', 'phone'] as ContactMethod[]).map((method) => (
                <label key={method} className={'cursor-pointer rounded-full border px-4 py-2 text-sm font-bold ' + (preferredContactMethod === method ? 'border-stone-950 bg-stone-950 text-white' : 'border-stone-300 bg-white text-stone-700')}>
                  <input type="radio" className="sr-only" name="preferred-contact" value={method} checked={preferredContactMethod === method} onChange={() => setPreferredContactMethod(method)} />
                  {t.contactMethods[method]}
                </label>
              ))}
            </div>
            {fieldError('preferredContact')}
          </fieldset>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-black" htmlFor="style">{t.style} <span className="text-[#C9362B]">*</span>
              <select id="style" value={style} onChange={(e) => setStyle(e.target.value as TattooStyle)} className={inputClass}>
                <option value="anime">{t.styles.anime}</option>
                <option value="microrealism">{t.styles.microrealism}</option>
                <option value="fineline">{t.styles.fineline}</option>
              </select>
            </label>
            <label className="block text-sm font-black" htmlFor="size">{t.size} <span className="text-[#C9362B]">*</span>
              <div className="relative">
                <input id="size" type="number" min="0.5" max="50" step="0.25" inputMode="decimal" value={sizeInches} onChange={(e) => setSizeInches(e.target.value)} className={inputClass + ' pr-24'} aria-invalid={Boolean(errors.size)} aria-describedby="size-help" />
                <span className="pointer-events-none absolute right-4 top-[1.4rem] text-sm font-bold text-stone-500">{t.inches}</span>
              </div>
              <p id="size-help" className="mt-2 text-xs text-stone-500">≈ {sizeCm || 0} cm</p>
              {fieldError('size')}
            </label>
            <label className="block text-sm font-black sm:col-span-2" htmlFor="placement">{t.placement} <span className="text-[#C9362B]">*</span>
              <input id="placement" value={placement} onChange={(e) => setPlacement(e.target.value)} placeholder={language === 'en' ? 'Example: inner forearm' : 'Ejemplo: antebrazo interno'} className={inputClass} aria-invalid={Boolean(errors.placement)} aria-describedby={errors.placement ? 'placement-error' : undefined} />
              {fieldError('placement')}
            </label>
            <label className="block text-sm font-black sm:col-span-2" htmlFor="description">{t.idea} <span className="text-[#C9362B]">*</span>
              <textarea id="description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={language === 'en' ? 'Describe the subject, mood, details, and anything Hans should know.' : 'Describe el tema, ambiente, detalles y cualquier información importante.'} className={inputClass + ' py-3'} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'description-error' : undefined} />
              {fieldError('description')}
            </label>
          </div>

          <div className="mt-8">
            <label htmlFor="reference-images" className="text-sm font-black">{t.refs}</label>
            <p className="mt-1 text-sm text-stone-500">{t.refsHelp}</p>
            <label htmlFor="reference-images" className="mt-3 flex min-h-28 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-stone-400 bg-stone-50 px-4 text-center text-sm font-bold text-stone-600 hover:border-stone-950 hover:bg-white">
              <ImagePlus className="mr-2 h-5 w-5" aria-hidden="true" />
              {language === 'en' ? 'Choose reference images' : 'Elegir imágenes de referencia'}
            </label>
            <input id="reference-images" type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} />
            {fieldError('images')}
            {referenceImages.length ? (
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5" aria-label={language === 'en' ? 'Selected reference images' : 'Imágenes seleccionadas'}>
                {referenceImages.map((image, index) => (
                  <li key={image.slice(-32) + index} className="relative aspect-square overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                    <img src={image} alt={language === 'en' ? 'Reference preview ' + (index + 1) : 'Vista previa ' + (index + 1)} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setReferenceImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-1 top-1 rounded-full bg-stone-950/85 p-2 text-white" aria-label={language === 'en' ? 'Remove reference image ' + (index + 1) : 'Eliminar imagen ' + (index + 1)}><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} hidden aria-hidden="true" />

          <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-700" htmlFor="consent">
            <input id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-stone-950" aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? 'consent-error' : undefined} />
            <span>{t.consent} <a href={language === 'es' ? '/es/privacy' : '/privacy'} className="font-black underline underline-offset-2">{t.privacy}</a>.</span>
          </label>
          {fieldError('consent')}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex items-center text-xs text-stone-500"><LockKeyhole className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />{language === 'en' ? 'Your information is used to respond to this request.' : 'Tu información se usa para responder a esta solicitud.'}</p>
            <button type="submit" disabled={isSubmitting} className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#E53E3E] px-7 text-sm font-black tracking-wide text-white hover:bg-stone-950 disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9362B]">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />}
              {isSubmitting ? t.sending : t.submit}
            </button>
          </div>
          <div className="sr-only" aria-live="polite">{isSubmitting ? t.sending : ''}</div>
        </form>
      </div>
    </section>
  );
}
