import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Language } from '../types';

interface FAQProps { language: Language }

const questions = {
  en: [
    ['Is submitting the form a confirmed booking?', 'No. It is a consultation and availability request. Hans will review the project and contact you if it is a fit. An appointment is confirmed only after you agree on the details directly.'],
    ['What information should I send?', 'Include the tattoo idea, preferred style, placement, and approximate width. Reference images are helpful but optional at this first step.'],
    ['How is pricing determined?', 'Pricing depends on the design, size, placement, color, detail, and estimated session time. Hans will discuss a quote after reviewing enough project information.'],
    ['Where are appointments held?', 'Appointments are at Gara Art Studio, 240 W 40th St, New York, NY 10018. Hans works there as an independent resident artist and does not own the studio.'],
    ['Can I request a custom anime or manga design?', 'Yes. You can share the character, panel, visual direction, placement, and size you have in mind. Final design details are discussed during the consultation.'],
  ],
  es: [
    ['¿Enviar el formulario confirma una cita?', 'No. Es una solicitud de consulta y disponibilidad. Hans revisará el proyecto y te contactará si encaja. La cita solo queda confirmada después de acordar los detalles directamente.'],
    ['¿Qué información debo enviar?', 'Incluye la idea, estilo, zona y ancho aproximado. Las imágenes de referencia ayudan, pero son opcionales en este primer paso.'],
    ['¿Cómo se determina el precio?', 'El precio depende del diseño, tamaño, zona, color, detalle y tiempo estimado. Hans hablará del presupuesto después de revisar suficiente información del proyecto.'],
    ['¿Dónde se realizan las citas?', 'Las citas son en Gara Art Studio, 240 W 40th St, New York, NY 10018. Hans trabaja allí como artista residente independiente y no es dueño del estudio.'],
    ['¿Puedo solicitar un diseño personalizado de anime o manga?', 'Sí. Comparte el personaje, panel, dirección visual, zona y tamaño que tienes en mente. Los detalles finales se hablan durante la consulta.'],
  ],
};

export default function FAQ({ language }: FAQProps) {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <section id="faq" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <p className="text-xs font-black tracking-[0.24em] text-[#C9362B]">{language === 'en' ? 'FAQ' : 'PREGUNTAS FRECUENTES'}</p>
        <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-6xl">{language === 'en' ? 'Before you request.' : 'Antes de solicitar.'}</h2>
        <div className="mt-10 divide-y divide-stone-200 border-y border-stone-200">
          {questions[language].map(([question, answer], index) => {
            const isOpen = openIndex === index;
            return (
              <div key={question}>
                <h3>
                  <button onClick={() => setOpenIndex(isOpen ? -1 : index)} className="flex min-h-16 w-full items-center justify-between gap-6 py-4 text-left text-base font-black sm:text-lg" aria-expanded={isOpen} aria-controls={'faq-panel-' + index}>
                    {question}<ChevronDown className={'h-5 w-5 shrink-0 transition-transform ' + (isOpen ? 'rotate-180' : '')} aria-hidden="true" />
                  </button>
                </h3>
                <div id={'faq-panel-' + index} hidden={!isOpen} className="pb-5 pr-10 text-sm leading-6 text-stone-600 sm:text-base">
                  {answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
