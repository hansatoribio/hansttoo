import { ArrowLeft } from 'lucide-react';
import { Language } from '../types';

interface PrivacyPolicyProps { language: Language; onBack: () => void }

const sections = {
  en: [
    ['Information collected', 'The consultation form may collect your name, email address, phone or WhatsApp number, Instagram username, preferred contact method, tattoo style, approximate size, placement, idea description, and any reference images you choose to upload. When you submit a request, the site may also attach allow-listed campaign parameters (such as UTM values) and Google or Meta click identifiers present in the landing URL.'],
    ['How information is used', 'Hans uses this information to review your idea, decide whether the project is a fit, respond to your request, discuss availability and pricing, and plan an appointment if you choose to proceed.'],
    ['Service providers and measurement', 'Form information may be processed and stored by the website’s database and file-storage provider, Supabase. After you allow measurement, the site also stores random browser and session identifiers, the visited page, language, broad device category, and broad traffic channel to produce aggregate visitor statistics in the private administrator panel. It does not store an IP address, exact location, full referrer URL, query string, or full user agent in these records. Campaign source, medium, campaign name, ad content, search term, landing path, and supported click identifiers may be kept with a consultation so Hans can understand which advertising produced qualified requests. Google tags use Consent Mode v2 and Meta Pixel loads only after you allow measurement. Google may receive limited cookieless consent and event signals when optional storage is denied. The form does not send your name, contact details, tattoo description, or uploaded images to advertising platforms.'],
    ['Retention and security', 'Consultation information is kept only as long as reasonably needed to respond, manage a potential appointment, maintain business records, and meet applicable obligations. Reasonable safeguards are used, but no internet transmission or storage system can be guaranteed completely secure.'],
    ['Your choices', 'Reference images are optional. You can allow or deny analytics and advertising measurement and change that choice from the “Privacy choices” link in the footer. You may request access, correction, or deletion of your consultation information by contacting Hans through the official @hansttoo Instagram account. Requests may be limited where records must be retained for legal or legitimate business reasons.'],
    ['Not medical care', 'Do not submit medical records or highly sensitive health information through the initial consultation form. Any health or eligibility questions needed before tattooing should be discussed directly during the booking process.'],
  ],
  es: [
    ['Información recopilada', 'El formulario puede recopilar tu nombre, correo, teléfono o WhatsApp, usuario de Instagram, método de contacto preferido, estilo, tamaño aproximado, zona, descripción de la idea y las imágenes de referencia que decidas subir. Al enviar una solicitud, el sitio también puede adjuntar parámetros de campaña permitidos (como valores UTM) e identificadores de clic de Google o Meta presentes en la URL de entrada.'],
    ['Cómo se usa la información', 'Hans usa esta información para revisar tu idea, decidir si el proyecto encaja, responder a tu solicitud, hablar de disponibilidad y precio, y planificar una cita si decides continuar.'],
    ['Proveedores y medición', 'La información del formulario puede ser procesada y almacenada por Supabase, proveedor de base de datos y archivos del sitio. Después de que permitas la medición, el sitio también guarda identificadores aleatorios del navegador y la sesión, la página visitada, el idioma, la categoría general del dispositivo y el canal general de tráfico para producir estadísticas agregadas en el panel privado. Estos registros no guardan dirección IP, ubicación exacta, URL completa de referencia, cadena de consulta ni el agente de usuario completo. El origen, medio, nombre de campaña, contenido del anuncio, término de búsqueda, página de entrada e identificadores de clic compatibles pueden guardarse con la consulta para que Hans entienda qué publicidad genera solicitudes calificadas. Las etiquetas de Google usan Consent Mode v2 y Meta Pixel solo se carga después de que permitas la medición. Google puede recibir señales limitadas y sin cookies sobre el consentimiento y los eventos cuando se rechaza el almacenamiento opcional. El nombre, los datos de contacto, la descripción y las imágenes no se envían a plataformas publicitarias.'],
    ['Conservación y seguridad', 'La información se conserva solo durante el tiempo razonablemente necesario para responder, gestionar una posible cita, mantener registros comerciales y cumplir obligaciones aplicables. Se usan medidas razonables, pero ningún sistema de internet es completamente seguro.'],
    ['Tus opciones', 'Las imágenes de referencia son opcionales. Puedes permitir o rechazar la analítica y la medición publicitaria, y cambiar esa decisión desde “Opciones de privacidad” en el pie de página. Puedes solicitar acceso, corrección o eliminación contactando a Hans mediante la cuenta oficial de Instagram @hansttoo. Algunas solicitudes pueden limitarse cuando exista una obligación legal o comercial legítima de conservar registros.'],
    ['No es atención médica', 'No envíes expedientes médicos ni información de salud altamente sensible en el formulario inicial. Cualquier pregunta de salud o elegibilidad necesaria antes de tatuar debe tratarse directamente durante la reserva.'],
  ],
};

export default function PrivacyPolicy({ language, onBack }: PrivacyPolicyProps) {
  return (
    <main className="min-h-screen bg-[#FCFBFA] px-4 py-10 text-stone-950 sm:px-6 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <button onClick={onBack} className="inline-flex min-h-11 items-center rounded-full border border-stone-300 bg-white px-4 text-sm font-black hover:border-stone-950"><ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />{language === 'en' ? 'Back to website' : 'Volver al sitio'}</button>
        <p className="mt-12 text-xs font-black tracking-[0.24em] text-[#C9362B]">HANSTTOO</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] sm:text-6xl">{language === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}</h1>
        <p className="mt-4 text-sm text-stone-500">{language === 'en' ? 'Effective August 27, 2026' : 'Vigente desde el 27 de agosto de 2026'}</p>
        <p className="mt-8 text-base leading-7 text-stone-700">{language === 'en' ? 'This policy explains how Hans, an independent tattoo artist using the public name “Hans | NYC Tattoo Artist” and @hansttoo, handles information submitted through this website.' : 'Esta política explica cómo Hans, artista del tatuaje independiente con el nombre público “Hans | NYC Tattoo Artist” y @hansttoo, gestiona la información enviada mediante este sitio.'}</p>
        <div className="mt-10 space-y-9">
          {sections[language].map(([title, body]) => (
            <section key={title}>
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-3 leading-7 text-stone-600">{body}</p>
            </section>
          ))}
        </div>
        <section className="mt-10 rounded-3xl bg-stone-950 p-6 text-white">
          <h2 className="text-xl font-black">{language === 'en' ? 'Contact' : 'Contacto'}</h2>
          <p className="mt-3 leading-7 text-stone-300">{language === 'en' ? 'For privacy questions or requests, contact Hans through the official Instagram account' : 'Para preguntas o solicitudes de privacidad, contacta a Hans mediante la cuenta oficial de Instagram'} <a className="font-black text-white underline" href="https://instagram.com/hansttoo" target="_blank" rel="noopener noreferrer">@hansttoo</a>.</p>
        </section>
      </article>
    </main>
  );
}
