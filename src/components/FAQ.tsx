import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, HelpCircle, PenTool, Plus, Trash2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface FAQProps {
  language: Language;
  faqList: Array<{ id: string; qEn: string; qEs: string; aEn: string; aEs: string }>;
  isVisualEditMode?: boolean;
  onEditElement?: (type: 'text' | 'image' | 'portfolio' | 'faq' | 'new-faq', key: string, label?: string, data?: any) => void;
  customTranslations?: any;
}

export default function FAQ({ 
  language,
  faqList,
  isVisualEditMode = false,
  onEditElement,
  customTranslations
}: FAQProps) {
  const t = customTranslations?.[language] || translations[language] || translations.en;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="pt-8 sm:pt-12 pb-20 sm:pb-28 bg-[#FCFBFA] border-b border-stone-100" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
          <span
            onClick={() => {
              if (isVisualEditMode && onEditElement) {
                onEditElement('text', 'faqBadge', 'FAQ Section Badge', {
                  en: customTranslations?.en?.faqBadge || 'COMMON QUESTIONS',
                  es: customTranslations?.es?.faqBadge || 'PREGUNTAS COMUNES'
                });
              }
            }}
            className={`text-[10px] font-black tracking-[0.25em] text-[#E53E3E] uppercase inline-flex items-center justify-center gap-1 ${
              isVisualEditMode ? 'cursor-pointer hover:underline' : ''
            }`}
          >
            {isVisualEditMode && <PenTool className="w-3.5 h-3.5" />}
            {customTranslations?.[language]?.faqBadge || (language === 'en' ? 'COMMON QUESTIONS' : 'PREGUNTAS COMUNES')}
          </span>
          <h2
            onClick={() => {
              if (isVisualEditMode && onEditElement) {
                onEditElement('text', 'faqTitle', 'FAQ Section Title', {
                  en: customTranslations?.en?.faqTitle || translations.en.faqTitle,
                  es: customTranslations?.es?.faqTitle || translations.es.faqTitle
                });
              }
            }}
            className={`text-3xl sm:text-5xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none ${
              isVisualEditMode ? 'cursor-pointer border border-dashed border-amber-400 p-2 rounded-xl bg-amber-50/20' : ''
            }`}
          >
            {t.faqTitle || translations[language].faqTitle}<span className="text-[#E53E3E]">.</span>
          </h2>
          <p
            onClick={() => {
              if (isVisualEditMode && onEditElement) {
                onEditElement('text', 'faqSubtitle', 'FAQ Section Subtitle', {
                  en: customTranslations?.en?.faqSubtitle || translations.en.faqSubtitle,
                  es: customTranslations?.es?.faqSubtitle || translations.es.faqSubtitle
                });
              }
            }}
            className={`text-stone-500 text-sm mt-3 leading-relaxed font-sans ${
              isVisualEditMode ? 'cursor-pointer border border-dashed border-amber-400 p-1.5 rounded-lg bg-amber-50/20' : ''
            }`}
          >
            {t.faqSubtitle || translations[language].faqSubtitle}
          </p>
        </div>

        {/* Collapsible Accordion Grid */}
        <div className="space-y-4" id="faq-accordion">
          {faqList.map((item, idx) => {
            const isOpen = openIndex === idx;
            const questionText = language === 'en' ? item.qEn : item.qEs;
            const answerText = language === 'en' ? item.aEn : item.aEs;

            return (
              <div 
                key={item.id} 
                className={`border rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative ${
                  isVisualEditMode
                    ? 'border-dashed border-amber-400 hover:border-amber-600'
                    : 'border-stone-100'
                }`}
                id={`faq-item-${item.id}`}
              >
                {/* Header click bar */}
                <button
                  type="button"
                  onClick={() => {
                    if (isVisualEditMode) {
                      onEditElement?.('faq', 'item', 'Edit FAQ Question', item);
                    } else {
                      handleToggle(idx);
                    }
                  }}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-stone-50/55 transition-colors cursor-pointer"
                  id={`faq-btn-${item.id}`}
                >
                  <div className="flex items-start space-x-3 pr-4">
                    <HelpCircle className="w-5 h-5 text-[#E53E3E] mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-md font-bold text-[#1A1A1A] uppercase tracking-tight leading-snug">
                      {questionText}
                    </span>
                  </div>
                  <div className="text-stone-400">
                    {isVisualEditMode ? (
                      <div className="flex items-center space-x-1 bg-amber-500 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-sm z-10">
                        <PenTool className="w-2.5 h-2.5" />
                        <span>Edit</span>
                      </div>
                    ) : isOpen ? (
                      <ChevronUp className="w-4 h-4 text-stone-800" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-800" />
                    )}
                  </div>
                </button>

                {/* Collapsible Content */}
                <AnimatePresence initial={false}>
                  {isOpen && !isVisualEditMode && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-2 border-t border-stone-100 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans bg-stone-50/30">
                        {answerText}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Add New FAQ Action Button when Visual Edit Mode is Active */}
          {isVisualEditMode && (
            <button
              onClick={() => onEditElement?.('new-faq', 'new-faq-item', 'Add FAQ Question', {})}
              className="w-full py-4.5 border-2 border-dashed border-[#E53E3E] rounded-2xl bg-rose-50/10 hover:bg-rose-50/30 text-stone-850 hover:text-[#E53E3E] flex items-center justify-center space-x-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              id="faq-add-new-btn"
            >
              <Plus className="w-4 h-4 text-[#E53E3E]" />
              <span>{language === 'en' ? 'Add New FAQ Question' : 'Añadir Pregunta FAQ'}</span>
            </button>
          )}
        </div>

      </div>
    </section>
  );
}
