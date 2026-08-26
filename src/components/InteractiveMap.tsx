import { useState, useEffect } from 'react';
import { MapPin, Clock, Navigation, Calendar, Copy, Check, ExternalLink, Moon, Sun, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { translations } from '../translations';

interface InteractiveMapProps {
  language: Language;
}

type MapTheme = 'dark' | 'silver' | 'standard';

export default function InteractiveMap({ language }: InteractiveMapProps) {
  const t = translations[language];
  const [mapTheme, setMapTheme] = useState<MapTheme>('dark');
  const [copied, setCopied] = useState(false);
  
  // Real-time local status state
  const [studioStatus, setStudioStatus] = useState({
    isOpen: false,
    text: '',
    nyTimeStr: '',
    currentDay: 0 // 0 = Sunday, 1 = Monday, etc.
  });

  const fullAddress = "Gara Art Studio, 240 W 40th St, New York, NY 10018, USA";
  const googleMapsUrl = "https://maps.app.goo.gl/VNY6iiixsNeAKxUDA";
  const embedMapUrl = "https://maps.google.com/maps?q=Gara%20Art%20Studio%20240%20W%2040th%20St,%20New%20York,%20NY%2010018&t=&z=16&ie=UTF8&iwloc=&output=embed";

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

      // Open Mon-Sun, 11:00 AM to 5:00 PM (11 to 17)
      const currentMinutes = hours * 60 + minutes;
      const openMinutes = 11 * 60; // 11:00 AM
      const closeMinutes = 17 * 60; // 5:00 PM

      const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

      let statusText = '';
      if (isOpen) {
        statusText = language === 'en' 
          ? 'Open Now • Closes at 5:00 PM' 
          : 'Abierto Ahora • Cierra a las 5:00 PM';
      } else {
        statusText = language === 'en'
          ? 'Closed Now • Opens at 11:00 AM'
          : 'Cerrado Ahora • Abre a las 11:00 AM';
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
  }, [language]);

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

  // Compute CSS filter class based on map theme
  const getFilterStyle = () => {
    switch (mapTheme) {
      case 'dark':
        // Dark high-contrast studio mode with dark slate roads & crimson accent tone
        return 'invert-[0.92] hue-rotate-[180deg] contrast-[1.25] brightness-[0.88] saturate-[0.75]';
      case 'silver':
        // Clean monochrome silver
        return 'grayscale-[0.98] contrast-[1.15] brightness-[0.96]';
      case 'standard':
      default:
        return 'contrast-[1.02] saturate-[0.9]';
    }
  };

  return (
    <section className="py-16 bg-white border-t border-[#E5E5E1]" id="studio-location">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-[#E53E3E] text-[10px] font-black uppercase tracking-[0.25em]">
            {language === 'en' ? 'PRIVATE STUDIO' : 'ESTUDIO PRIVADO'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1A1A1A]">
            {t.mapTitle}
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm font-sans max-w-xl mx-auto">
            {t.mapSubtitle}
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
                  {t.mapStatus}
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

              {/* Dynamic Weekly Schedule Grid */}
              <div className="space-y-3">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-stone-400 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#E53E3E]" />
                  {t.mapHoursTitle}
                </h4>
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
                          11:00 AM - 5:00 PM
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Location details with Copy option */}
              <div className="space-y-3 pt-3 border-t border-stone-200/60">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2.5">
                    <div className="p-2 bg-rose-50 text-[#E53E3E] rounded-xl shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#1A1A1A]">Gara Art Studio • 240 W 40th St</p>
                      <p className="text-[11px] text-stone-500 font-medium">Manhattan, NY 10018, United States</p>
                    </div>
                  </div>

                  <button
                    onClick={handleCopyAddress}
                    className="p-2 text-stone-400 hover:text-stone-800 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-xs transition-all flex items-center space-x-1 cursor-pointer shrink-0 shadow-2xs"
                    title={language === 'en' ? 'Copy full address' : 'Copiar dirección completa'}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[9px] font-bold text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                      </>
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
              
              {/* Studio Address Badge */}
              <div className="bg-stone-900/90 backdrop-blur-md text-white border border-white/10 px-3.5 py-2 rounded-2xl shadow-lg flex items-center space-x-2.5 pointer-events-auto">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E53E3E]" />
                </span>
                <div>
                  <p className="text-[10px] font-black tracking-wider uppercase text-white leading-none">Gara Art Studio</p>
                  <p className="text-[9px] font-mono text-stone-300 leading-tight mt-0.5">240 W 40th St, NY 10018</p>
                </div>
              </div>

              {/* Theme Switcher Pills */}
              <div className="bg-stone-900/90 backdrop-blur-md border border-white/10 p-1 rounded-2xl shadow-lg flex items-center space-x-1 pointer-events-auto">
                <button
                  onClick={() => setMapTheme('dark')}
                  className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1 ${
                    mapTheme === 'dark'
                      ? 'bg-[#E53E3E] text-white shadow-xs'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Dark Luxury Theme"
                >
                  <Moon className="w-3 h-3" />
                  <span className="hidden sm:inline">Dark</span>
                </button>
                
                <button
                  onClick={() => setMapTheme('silver')}
                  className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1 ${
                    mapTheme === 'silver'
                      ? 'bg-stone-100 text-stone-900 shadow-xs'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Silver Monochrome Theme"
                >
                  <Layers className="w-3 h-3" />
                  <span className="hidden sm:inline">Silver</span>
                </button>

                <button
                  onClick={() => setMapTheme('standard')}
                  className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1 ${
                    mapTheme === 'standard'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Standard Map Theme"
                >
                  <Sun className="w-3 h-3" />
                  <span className="hidden sm:inline">Map</span>
                </button>
              </div>
            </div>

            {/* Map Iframe with custom filter */}
            <iframe
              src={embedMapUrl}
              className={`w-full h-full border-0 absolute inset-0 transition-all duration-500 ease-in-out ${getFilterStyle()}`}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer"
              title="Hans Tattoo Studio 240 W 40th St New York"
              id="google-maps-iframe"
            />

            {/* Bottom Overlay Action Bar */}
            <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex justify-end">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-stone-900/90 hover:bg-[#E53E3E] backdrop-blur-md text-white border border-white/10 hover:border-transparent px-4 py-2 rounded-2xl shadow-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 flex items-center space-x-2 pointer-events-auto cursor-pointer active:scale-95"
              >
                <span>{language === 'en' ? 'Open in Google Maps' : 'Abrir en Google Maps'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
