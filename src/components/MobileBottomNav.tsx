import { useState, useEffect } from 'react';
import { Home, Grid, Sparkles, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Language } from '../types';
import { translations } from '../translations';

interface MobileBottomNavProps {
  language: Language;
  onNavigate: (sectionId: string) => void;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
}

export default function MobileBottomNav({
  language,
  onNavigate,
  isAdminMode,
  setIsAdminMode,
}: MobileBottomNavProps) {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<string>('hero');

  // Track scroll position to update active tab highlight dynamically
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      
      const faqEl = document.getElementById('faq');
      const portfolioEl = document.getElementById('portfolio');
      const bookingEl = document.getElementById('booking');

      if (faqEl && scrollPos >= faqEl.offsetTop - 150) {
        setActiveTab('faq');
      } else if (portfolioEl && scrollPos >= portfolioEl.offsetTop - 150) {
        setActiveTab('portfolio');
      } else if (bookingEl && scrollPos >= bookingEl.offsetTop - 150) {
        setActiveTab('booking');
      } else {
        setActiveTab('hero');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (id: string) => {
    if (isAdminMode) {
      setIsAdminMode(false);
    }
    setActiveTab(id);
    setTimeout(() => {
      onNavigate(id);
    }, 50);
  };

  const navTabs = [
    {
      id: 'hero',
      label: t.tabHome || 'Home',
      icon: Home,
    },
    {
      id: 'portfolio',
      label: t.tabGallery || 'Gallery',
      icon: Grid,
    },
    {
      id: 'booking',
      label: t.tabBook || 'Book',
      icon: Sparkles,
    },
    {
      id: 'faq',
      label: t.tabFAQ || 'FAQ',
      icon: HelpCircle,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200/70 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] pb-safe transition-all duration-300">
      <div className="flex items-center justify-around px-2 py-1 max-w-md mx-auto">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleTabClick(tab.id)}
              className="flex flex-col items-center justify-center flex-1 py-0.5 px-1 cursor-pointer select-none transition-colors"
              id={`mobile-tab-${tab.id}`}
            >
              <Icon
                className={`w-[18px] h-[18px] transition-all duration-200 ${
                  isActive
                    ? 'text-stone-900 scale-105 stroke-[2.25px]'
                    : 'text-stone-400 hover:text-stone-600 stroke-[1.75px]'
                }`}
              />
              <span
                className={`text-[8.5px] uppercase tracking-wider transition-colors mt-0.5 ${
                  isActive ? 'text-stone-900 font-extrabold' : 'text-stone-400 font-medium'
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

