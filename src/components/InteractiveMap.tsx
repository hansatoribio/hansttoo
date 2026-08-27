import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Navigation, Calendar, Copy, Check, ExternalLink, Moon, Sun, Layers, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { translations } from '../translations';

interface InteractiveMapProps {
  language: Language;
  isVisualEditMode?: boolean;
  onEditElement?: (type: 'text' | 'image' | 'portfolio' | 'faq', key: string, label?: string, data?: any) => void;
  customTranslations?: any;
}

type MapTheme = 'dark' | 'silver' | 'standard';

export default function InteractiveMap({
  language,
  isVisualEditMode = false,
  onEditElement,
  customTranslations
}: InteractiveMapProps) {
  const t = customTranslations?.[language] || translations[language] || translations.en;
  const [mapTheme, setMapTheme] = useState<MapTheme>('dark');
  const [copied, setCopied] = useState(false);
  
  // Custom Configurable Hours & Address
  const openHour = Number(customTranslations?.mapOpenHour ?? 11);
  const closeHour = Number(customTranslations?.mapCloseHour ?? 17);
  const scheduleDisplayText = customTranslations?.[language]?.mapScheduleText || t.mapScheduleText || '11:00 AM - 5:00 PM';
  const addressLine1 = customTranslations?.[language]?.mapAddressLine1 || t.mapAddressLine1 || 'Gara Art Studio • 240 W 40th St';
  const addressLine2 = customTranslations?.[language]?.mapAddressLine2 || t.mapAddressLine2 || 'Manhattan, NY 10018, United States';
  const fullAddress = `${addressLine1}, ${addressLine2}`;
  const googleMapsUrl = customTranslations?.mapGoogleMapsUrl || "https://maps.app.goo.gl/VNY6iiixsNeAKxUDA";
  const embedMapUrl = customTranslations?.mapEmbedUrl || "https://maps.google.com/maps?q=Gara%20Art%20Studio%20240%20W%2040th%20St,%20New%20York,%20NY%2010018&t=&z=16&ie=UTF8&iwloc=&output=embed";

  // Real-time local status state
  const [studioStatus, setStudioStatus] = useState({
    isOpen: false,
    text: '',
    nyTimeStr: '',
    currentDay: 0 // 0 = Sunday, 1 = Monday, etc.
  });

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      
      // Determine time in New York (EST/EDT)
      let nyTimeStr = '';
      try {
        nyTimeStr = now.toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch (e) {
        nyTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      }

      // Extract details relative to New York timezone
      let nyDate = new Date();
      try {
        const nyDateStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
        nyDate = new Date(nyDateStr);
      } catch (e) {
        // Fallback to local browser if timezone conversion fails
      }
      
      const day = nyDate.getDay(); // 0 is Sunday, 6 is Saturday
      const hours = nyDate.getHours();
      const minutes = nyDate.getMinutes();

      // Dynamic calculation based on configured open/close hours
      const currentMinutes = hours * 60 + minutes;
      const openMinutes = openHour * 60;
      const closeMinutes = closeHour * 60;

      const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

      const formatHour = (h: number) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        return `${displayH}:00 ${period}`;
      };

      let statusText = '';
      if (isOpen) {
        statusText = language === 'en' 
          ? `Open Now • Closes at ${formatHour(closeHour)}` 
          : `Abierto Ahora • Cierra a las ${formatHour(closeHour)}`;
      } else {
        statusText = language === 'en'
          ? `Closed Now • Opens at ${formatHour(openHour)}`
          : `Cerrado Ahora • Abre a las ${formatHour(openHour)}`;
      }

      setStudioStatus({
        isOpen,
        text: statusText,
        nyTimeStr,
        currentDay: day
      });
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [language, openHour, closeHour]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const daysOfWeekEn = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  const daysOfWeekEs = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ];
  const currentDaysList = language === 'en' ? daysOfWeekEn : daysOfWeekEs;

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-[#E5E5E1] relative" id="studio-location">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span
            onClick={() => {
              if (isVisualEditMode && onEditElement) {
                onEditElement('text', 'mapBadge', 'Map Section Badge', {
                  en: customTranslations?.en?.mapBadge || 'PRIVATE STUDIO',
                  es: customTranslations?.es?.mapBadge || 'ESTUDIO PRIVADO'
                });
              }
            }}
            className={`text-[#E53E3E] text-[10px] font-black uppercase tracking-[0.25em] inline-block ${
              isVisualEditMode ? 'cursor-pointer hover:underline' : ''
            }`}
          >
            {customTranslations?.[language]?.mapBadge || (language === 'en' ? 'PRIVATE STUDIO' : 'ESTUDIO PRIVADO')}
          </span>

          <h2
            onClick={() => {
              if (isVisualEditMode && onEditElement) {
                onEditElement('text', 'mapTitle', 'Map Section Title', {
                  en: customTranslations?.en?.mapTitle || translations.en.mapTitle,
                  es: customTranslations?.es?.mapTitle || translations.es.mapTitle
                });
              }
            }}
            className={`text-2xl sm:text-4xl font-black tracking-tight text-[#1A1A1A] uppercase ${
              isVisualEditMode ? 'cursor-pointer border border-dashed border-amber-400 p-2 rounded-xl bg-amber-50/20' : ''
            }`}
          >
            {t.mapTitle || translations[language].mapTitle}
          </h2>

          <p
            onClick={() => {
              if (isVisualEditMode && onEditElement) {
                onEditElement('text', 'mapSubtitle', 'Map Section Subtitle', {
                  en: customTranslations?.en?.mapSubtitle || translations.en.mapSubtitle,
                  es: customTranslations?.es?.mapSubtitle || translations.es.mapSubtitle
                });
              }
            }}
            className={`text-stone-500 text-xs sm:text-sm font-sans max-w-xl mx-auto ${
              isVisualEditMode ? 'cursor-pointer border border-dashed border-amber-400 p-1.5 rounded-lg bg-amber-50/20' : ''
            }`}
          >
            {t.mapSubtitle || translations[language].mapSubtitle}
          </p>
        </div>

        {/* Dynamic Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="location-grid">
          
          {/* Left Column: Interactive Schedule & Location Specs */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-stone-50 border border-stone-200/60 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm" id="location-details-box">
            
            {/* Visual background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-10 pointer-events-none" />

            <div className="space-y-6 relative z-10">
              
              {/* Dynamic Live Status Tag */}
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                  {t.mapStatus || translations[language].mapStatus}
                </span>
                <div className="flex items-center space-x-3">
                  <span className="flex h-3 w-3 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${studioStatus.isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${studioStatus.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  </span>
                  <span className="text-sm font-black tracking-tight text-[#1A1A1A]">
                    {studioStatus.text}
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 font-bold font-mono">
                  {language === 'en' ? 'NEW YORK LOCAL TIME:' : 'HORA LOCAL EN NUEVA YORK:'} {studioStatus.nyTimeStr}
                </p>
              </div>

              {/* Dynamic Weekly Schedule Grid (Editable in Visual Mode) */}
              <div
                onClick={() => {
                  if (isVisualEditMode && onEditElement) {
                    onEditElement('text', 'mapScheduleText', 'Studio Schedule Text', {
                      en: customTranslations?.en?.mapScheduleText || scheduleDisplayText,
                      es: customTranslations?.es?.mapScheduleText || scheduleDisplayText
                    });
                  }
                }}
                className={`space-y-3 ${
                  isVisualEditMode ? 'cursor-pointer border-2 border-dashed border-amber-400 p-3 rounded-2xl bg-amber-50/20 hover:bg-amber-50/40' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-stone-400 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#E53E3E]" />
                    {t.mapHoursTitle || (language === 'en' ? 'Opening Hours' : 'Horario de Atención')}
                  </h4>
                  {isVisualEditMode && (
                    <span className="text-[8px] font-black text-amber-600 uppercase bg-amber-100 px-2 py-0.5 rounded">
                      {language === 'en' ? 'Edit Hours' : 'Editar Horario'}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5" id="weekly-schedule-list">
                  {currentDaysList.map((dayName, idx) => {
                    const isToday = studioStatus.currentDay === idx;
                    return (
                      <div 
                        key={idx}
                        className={`flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                          isToday 
                            ? 'bg-[#1A1A1A] text-white shadow-sm font-bold scale-[1.01]' 
                            : 'text-stone-600 hover:bg-stone-100/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {isToday && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                          <span>{dayName}</span>
                        </div>
                        <span className={isToday ? 'text-white font-mono' : 'text-stone-500 font-mono'}>
                          {scheduleDisplayText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Location details with Copy option (Editable in Visual Mode) */}
              <div
                onClick={() => {
                  if (isVisualEditMode && onEditElement) {
                    onEditElement('text', 'mapAddressLine1', 'Studio Address Line 1', {
                      en: customTranslations?.en?.mapAddressLine1 || addressLine1,
                      es: customTranslations?.es?.mapAddressLine1 || addressLine1
                    });
                  }
                }}
                className={`space-y-3 pt-3 border-t border-stone-200/60 ${
                  isVisualEditMode ? 'cursor-pointer border-2 border-dashed border-amber-400 p-3 rounded-2xl bg-amber-50/20' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2.5">
                    <div className="p-2 bg-rose-50 text-[#E53E3E] rounded-xl shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#1A1A1A]">{addressLine1}</p>
                      <p className="text-[11px] text-stone-500 font-medium">{addressLine2}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyAddress();
                    }}
                    className="p-2 text-stone-400 hover:text-stone-800 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-xs transition-all flex items-center space-x-1 cursor-pointer shrink-0 shadow-2xs"
                    title={language === 'en' ? 'Copy full address' : 'Copiar dirección completa'}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[9px] font-bold text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Direct Link button */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full px-5 py-3 rounded-full bg-[#1A1A1A] text-white hover:bg-[#E53E3E] text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 shadow-md shadow-stone-950/5 hover:shadow-lg hover:shadow-rose-500/15 active:scale-95 group"
              id="maps-directions-cta"
            >
              <Navigation className="w-3.5 h-3.5 mr-2 group-hover:translate-x-0.5 transition-transform" />
              <span>{language === 'en' ? 'Get Directions (Google Maps)' : 'Cómo llegar (Google Maps)'}</span>
            </a>
          </div>

          {/* Right Column: Custom Styled Google Map Container */}
          <div className="lg:col-span-7 rounded-3xl border border-stone-200/80 overflow-hidden bg-stone-900 shadow-xl h-[420px] lg:h-auto relative flex flex-col justify-between group" id="location-iframe-box">
            
            {/* Top Bar Floating Controls */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-2 pointer-events-none">
              <div className="inline-flex items-center space-x-2 bg-stone-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-[10px] font-bold tracking-wider shadow-lg">
                <MapPin className="w-3.5 h-3.5 text-[#E53E3E]" />
                <span>{addressLine1}</span>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto inline-flex items-center space-x-1 bg-white hover:bg-stone-100 text-stone-900 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <span>{language === 'en' ? 'Open in Maps' : 'Abrir Mapa'}</span>
                <ExternalLink className="w-3 h-3 text-[#E53E3E]" />
              </a>
            </div>

            {/* Google Map Iframe */}
            <iframe
              src={embedMapUrl}
              className="w-full h-full min-h-[360px] border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hans Toribio Gara Art Studio Location NYC"
            />
          </div>

        </div>

      </div>
    </section>
  );
}
