import { Language } from '../types';

interface TestimonialsProps { language: Language }

export default function Testimonials({ language }: TestimonialsProps) {
  return (
    <section className="bg-white py-12" aria-label={language === 'en' ? 'Client reviews' : 'Reseñas de clientes'}>
      <div className="mx-auto max-w-3xl px-4 text-center text-sm text-stone-600">
        {language === 'en'
          ? 'Verified client reviews will be published here after Hans provides an attributable source.'
          : 'Las reseñas verificadas se publicarán aquí cuando Hans proporcione una fuente atribuible.'}
      </div>
    </section>
  );
}
