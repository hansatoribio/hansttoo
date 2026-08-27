import { useState, useEffect, lazy, Suspense } from 'react';
import { Language, Inquiry, InquiryStatus, TattooStyle, PortfolioItem } from './types';
import { initialDemoLeads, initialPortfolioItems } from './data';
import { translations } from './translations';
import { Check, AlertCircle, Info, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Core Landing Page Components (Eager loaded for instant first paint)
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutArtist from './components/AboutArtist';
import Portfolio from './components/Portfolio';
import InquiryForm from './components/InquiryForm';
import FAQ from './components/FAQ';
import AdminLoginModal from './components/AdminLoginModal';
import InteractiveMap from './components/InteractiveMap';
import Testimonials from './components/Testimonials';
import InstagramFeed from './components/InstagramFeed';
import MobileBottomNav from './components/MobileBottomNav';

// Code-split heavy admin & editor components (Only loaded when Hans accesses admin)
const Dashboard = lazy(() => import('./components/Dashboard'));
const VisualElementEditorModal = lazy(() => import('./components/VisualElementEditorModal'));

import { trackLeadConversion, initTracking } from './lib/tracking';
import { 
  isSupabaseConfigured, 
  saveInquiryToSupabase, 
  fetchInquiriesFromSupabase, 
  updateInquiryStatusInSupabase,
  updateInquiryNotesInSupabase,
  deleteInquiryFromSupabase,
  saveSubscriberToSupabase,
  fetchSubscribersFromSupabase,
  deleteSubscriberFromSupabase,
  fetchAdminSettingsFromSupabase
} from './lib/supabase';

export default function App() {
  // Toast Notifications State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' }[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Language State - Default English or auto-detected browser language, synced with LocalStorage
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('hans_language');
    if (stored === 'en' || stored === 'es') {
      return stored as Language;
    }
    // Auto-detect browser preferred language
    try {
      const browserLang = navigator.language || (navigator as any).userLanguage || '';
      if (browserLang.toLowerCase().startsWith('es')) {
        return 'es';
      }
    } catch (e) {
      console.warn("Could not auto-detect browser language", e);
    }
    return 'en';
  });

  // Leads/Inquiries State - Synced with LocalStorage and loaded directly from Supabase (Cleaned of mock data)
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const stored = localStorage.getItem('hans_inquiries');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out dummy/mock test data to ensure clean workspace
          return parsed.filter((i: Inquiry) => 
            !i.id?.startsWith('lead-') && 
            !i.email?.includes('example.com') &&
            i.fullName !== 'Clara Ross' &&
            i.fullName !== 'Marc Evans' &&
            i.fullName !== 'Yuki Tanaka'
          );
        }
      } catch (e) {
        console.error("Failed to parse stored inquiries", e);
      }
    }
    return [];
  });

  // Artist Admin Workspace Mode & Access Control States
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(() => {
    return localStorage.getItem('hans_admin_authorized') === 'true';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Sync admin authorization state
  useEffect(() => {
    if (isAdminAuthorized) {
      localStorage.setItem('hans_admin_authorized', 'true');
    }
  }, [isAdminAuthorized]);

  // --- VISUAL EDITOR CMS STATE ---
  const [isVisualEditMode, setIsVisualEditMode] = useState<boolean>(false);
  const [editingElement, setEditingElement] = useState<{
    type: 'text' | 'image' | 'portfolio' | 'faq' | 'new-portfolio' | 'new-faq';
    key?: string;
    id?: string;
    data?: any;
  } | null>(null);

  const [customTranslations, setCustomTranslations] = useState(() => {
    const stored = localStorage.getItem('hans_custom_translations');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return translations;
  });

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() => {
    const stored = localStorage.getItem('hans_custom_portfolio');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return initialPortfolioItems;
  });

  const [introPhotos, setIntroPhotos] = useState(() => {
    const stored = localStorage.getItem('hans_custom_intro_photos');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      {
        url: 'https://images.unsplash.com/photo-1542382156909-9ae3b0245754?auto=format&fit=crop&q=80&w=400',
        labelEn: 'Fine Line Art',
        labelEs: 'Arte Línea Fina',
      },
      {
        url: '/imagenes/618566702_17993600897909063_7495797081353944212_n.webp',
        labelEn: 'Ink Precision',
        labelEs: 'Precisión de Tinta',
      },
      {
        url: '/imagenes/670269533_18413738419193052_847837387206417634_n.webp',
        labelEn: 'Anime Craft',
        labelEs: 'Estilo Anime',
      },
      {
        url: '/imagenes/IMG_1449.JPG.jpeg',
        labelEn: 'Studio Space',
        labelEs: 'Espacio de Estudio',
      },
    ];
  });

  const [faqList, setFaqList] = useState(() => {
    const stored = localStorage.getItem('hans_custom_faqs');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      { id: 'faq-1', qEn: translations.en.faqQ1, qEs: translations.es.faqQ1, aEn: translations.en.faqA1, aEs: translations.es.faqA1 },
      { id: 'faq-2', qEn: translations.en.faqQ2, qEs: translations.es.faqQ2, aEn: translations.en.faqA2, aEs: translations.es.faqA2 },
      { id: 'faq-3', qEn: translations.en.faqQ3, qEs: translations.es.faqQ3, aEn: translations.en.faqA3, aEs: translations.es.faqA3 },
      { id: 'faq-4', qEn: translations.en.faqQ4, qEs: translations.es.faqQ4, aEn: translations.en.faqA4, aEs: translations.es.faqA4 },
    ];
  });

  // Sync Custom CMS State with LocalStorage
  useEffect(() => {
    localStorage.setItem('hans_custom_translations', JSON.stringify(customTranslations));
  }, [customTranslations]);

  useEffect(() => {
    localStorage.setItem('hans_custom_portfolio', JSON.stringify(portfolioItems));
  }, [portfolioItems]);

  useEffect(() => {
    localStorage.setItem('hans_custom_intro_photos', JSON.stringify(introPhotos));
  }, [introPhotos]);

  useEffect(() => {
    localStorage.setItem('hans_custom_faqs', JSON.stringify(faqList));
  }, [faqList]);

  // Section Dynamic Reordering System (Move blocks in real time)
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    const stored = localStorage.getItem('hans_section_order');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.includes('instagram')) {
            const aboutIdx = parsed.indexOf('about');
            if (aboutIdx !== -1) {
              parsed.splice(aboutIdx + 1, 0, 'instagram');
            } else {
              parsed.push('instagram');
            }
          }
          return parsed;
        }
      } catch (e) {}
    }
    return ['hero', 'about', 'instagram', 'booking', 'portfolio', 'testimonials', 'faq', 'location'];
  });

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setSectionOrder(newOrder);
    localStorage.setItem('hans_section_order', JSON.stringify(newOrder));
    showToast(
      language === 'en' ? 'Section block order updated in real time!' : '¡Orden del bloque actualizado en tiempo real!',
      'success'
    );
  };

  // Run tracking and Supabase initializations on mount
  useEffect(() => {
    initTracking();

    if (isSupabaseConfigured) {
      fetchInquiriesFromSupabase().then((supabaseInquiries) => {
        if (supabaseInquiries && supabaseInquiries.length > 0) {
          const cleanItems = supabaseInquiries.filter(i => 
            !i.id?.startsWith('lead-') && 
            !i.email?.includes('example.com') &&
            i.fullName !== 'Clara Ross' &&
            i.fullName !== 'Marc Evans' &&
            i.fullName !== 'Yuki Tanaka'
          );
          setInquiries((prev) => {
            const existingIds = new Set(prev.map(i => i.id));
            const freshItems = cleanItems.filter(i => !existingIds.has(i.id));
            return [...freshItems, ...prev];
          });
        }
      }).catch((err) => {
        console.error('Error loading leads from Supabase:', err);
      });
    }
  }, []);

  // Listen to #admin, /admin, or ?admin=true in URL to open admin panel
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (
        hash === '#admin' || 
        hash.includes('admin') || 
        pathname === '/admin' || 
        pathname.endsWith('/admin') || 
        search.includes('admin=true') || 
        search.includes('admin=1')
      ) {
        if (isAdminAuthorized) {
          setIsAdminMode(true);
        } else {
          setIsLoginModalOpen(true);
        }
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);
    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
    };
  }, [isAdminAuthorized]);

  // Preselected Style from Portfolio Inquire CTA
  const [preselectedStyle, setPreselectedStyle] = useState<TattooStyle | null>(null);
  const [preselectedDescription, setPreselectedDescription] = useState<string | null>(null);

  // Instagram Configuration State
  const [instagramUsername, setInstagramUsername] = useState<string>(() => {
    return localStorage.getItem('hans_instagram_username') || 'hansttoo';
  });
  const [instagramWidgetUrl, setInstagramWidgetUrl] = useState<string>(() => {
    return localStorage.getItem('hans_instagram_widget') || '';
  });

  // SEO Configuration State
  const [seoTitle, setSeoTitle] = useState<string>(() => {
    return localStorage.getItem('hans_seo_title') || 'Hans Tattoo | Fine Line, Microrealism & Anime Tattoo Artist Times Square, New York';
  });
  const [seoDescription, setSeoDescription] = useState<string>(() => {
    return localStorage.getItem('hans_seo_description') || 'Exclusive private tattoo studio in Times Square, New York. Precision fine-line, detailed microrealism, and custom manga/anime tattoo designs by Hans Toribio (@hansttoo).';
  });
  const [seoKeywords, setSeoKeywords] = useState<string>(() => {
    return localStorage.getItem('hans_seo_keywords') || 'Hans Tattoo, tattoo artist New York, fine line tattoo NY, microrealism tattoo, anime tattoo Times Square, tattoo studio NYC';
  });

  // Subscribers / Waiting List State - Synced with LocalStorage (Cleaned of mock data)
  const [subscribers, setSubscribers] = useState<string[]>(() => {
    const stored = localStorage.getItem('hans_subscribers');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((sub: string) => 
            !sub.includes('example.com') &&
            sub !== 'clara.ross@example.com' &&
            sub !== 'marc.evans@example.com' &&
            sub !== 'yuki.t@example.com'
          );
        }
      } catch (e) {
        console.error("Failed to parse stored subscribers", e);
      }
    }
    return [];
  });

  // Fetch subscribers and settings from Supabase on mount
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchSubscribersFromSupabase().then((remoteSubs) => {
        if (remoteSubs && remoteSubs.length > 0) {
          const clean = remoteSubs.filter(s => !s.includes('example.com'));
          setSubscribers((prev) => {
            const merged = Array.from(new Set([...prev, ...clean]));
            return merged;
          });
        }
      }).catch(() => {});

      fetchAdminSettingsFromSupabase().catch(() => {});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hans_subscribers', JSON.stringify(subscribers));
  }, [subscribers]);

  const handleSubscribe = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    setSubscribers((prev) => {
      if (prev.includes(cleanEmail)) return prev;
      return [cleanEmail, ...prev];
    });
    if (isSupabaseConfigured) {
      saveSubscriberToSupabase(cleanEmail).catch(() => {});
    }
  };

  const handleRemoveSubscriber = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    setSubscribers((prev) => prev.filter((sub) => sub !== cleanEmail));
    if (isSupabaseConfigured) {
      deleteSubscriberFromSupabase(cleanEmail).catch(() => {});
    }
  };

  // Sync Language with LocalStorage
  useEffect(() => {
    localStorage.setItem('hans_language', language);
  }, [language]);

  // Sync Inquiries with LocalStorage
  useEffect(() => {
    localStorage.setItem('hans_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  // Sync Instagram with LocalStorage
  useEffect(() => {
    localStorage.setItem('hans_instagram_username', instagramUsername);
  }, [instagramUsername]);

  useEffect(() => {
    localStorage.setItem('hans_instagram_widget', instagramWidgetUrl);
  }, [instagramWidgetUrl]);

  // Dynamically update document headers for Search Engine Optimization (SEO)
  useEffect(() => {
    document.title = seoTitle;
    localStorage.setItem('hans_seo_title', seoTitle);
    
    // Update or create Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seoDescription);
    localStorage.setItem('hans_seo_description', seoDescription);

    // Update or create Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', seoKeywords);
    localStorage.setItem('hans_seo_keywords', seoKeywords);

    // Update or create Open Graph Tags
    const updateOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOgTag('og:title', seoTitle);
    updateOgTag('og:description', seoDescription);
    updateOgTag('og:url', window.location.href);

    // Update Local Business JSON-LD Script
    const ldScript = document.getElementById('json-ld-local-seo');
    if (ldScript) {
      try {
        ldScript.textContent = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TattooParlor",
          "name": "Hans Tattoo",
          "image": "https://images.unsplash.com/photo-1598104358204-87cefc7c5986?auto=format&fit=crop&q=80&w=600",
          "description": seoDescription,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Times Square",
            "addressLocality": "New York",
            "addressRegion": "NY",
            "postalCode": "10036",
            "addressCountry": "US"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "40.7580",
            "longitude": "-73.9855"
          },
          "url": window.location.origin,
          "telephone": "+12120000000",
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
              ],
              "opens": "11:00",
              "closes": "17:00"
            }
          ],
          "sameAs": [
            `https://instagram.com/${instagramUsername}`
          ]
        }, null, 2);
      } catch (err) {
        console.error("Error setting JSON-LD schema", err);
      }
    }
  }, [seoTitle, seoDescription, seoKeywords, instagramUsername]);

  // Smooth scroll helper
  const handleNavigate = (sectionId: string) => {
    // If we are in admin dashboard, first return to client view
    if (isAdminMode) {
      setIsAdminMode(false);
    }

    // Give react brief moment to mount client section, then scroll
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  // Callback: User submits an inquiry
  const handleInquirySubmitted = (newInquiry: Inquiry) => {
    setInquiries((prev) => [newInquiry, ...prev]);
    
    // Save to Supabase (Database + Storage for reference images)
    if (isSupabaseConfigured) {
      saveInquiryToSupabase(newInquiry).catch((err) => {
        console.error('Failed to sync inquiry to Supabase:', err);
      });
    }

    // Fire advertising pixel/Google Analytics lead conversion events
    try {
      trackLeadConversion({
        style: newInquiry.style,
        placement: newInquiry.placement,
        size: newInquiry.sizeCm
      });
    } catch (err) {
      console.error('Failed to trigger tracking pixels:', err);
    }

    // Trigger Success Toast
    showToast(
      language === 'en'
        ? 'Your consultation request has been received! Check your inbox soon.'
        : '¡Tu solicitud de consulta ha sido recibida! Revisa tu bandeja de entrada pronto.',
      'success'
    );

    // Reset preselected style
    setPreselectedStyle(null);
  };

  // Callback: Artist updates an inquiry's status
  const handleUpdateStatus = (id: string, status: InquiryStatus) => {
    setInquiries((prev) => 
      prev.map((inq) => {
        if (inq.id === id) {
          const currentHistory = inq.statusHistory || [
            { status: 'pending', timestamp: inq.createdAt }
          ];
          const updatedHistory = [
            ...currentHistory,
            { status, timestamp: new Date().toISOString() }
          ];
          return { ...inq, status, statusHistory: updatedHistory };
        }
        return inq;
      })
    );

    if (isSupabaseConfigured) {
      updateInquiryStatusInSupabase(id, status).catch((err) => {
        console.error('Failed to update status in Supabase:', err);
      });
    }

    showToast(
      language === 'en'
        ? `Status updated to ${status}`
        : `Estado actualizado a ${status}`,
      'info'
    );
  };

  // Callback: Artist updates medical/health notes
  const handleUpdateMedicalNotes = (id: string, medicalNotes: string) => {
    setInquiries((prev) => 
      prev.map((inq) => inq.id === id ? { ...inq, medicalNotes } : inq)
    );
    showToast(
      language === 'en'
        ? 'Health & medical notes saved securely'
        : 'Notas médicas y de salud guardadas de forma segura',
      'success'
    );
  };

  // Callback: Artist updates internal notes
  const handleUpdateNotes = (id: string, artistNotes: string) => {
    setInquiries((prev) => 
      prev.map((inq) => inq.id === id ? { ...inq, artistNotes } : inq)
    );
    if (isSupabaseConfigured) {
      updateInquiryNotesInSupabase(id, artistNotes).catch(() => {});
    }
    showToast(
      language === 'en'
        ? 'Artist notes saved successfully'
        : 'Notas del artista guardadas correctamente',
      'success'
    );
  };

  // Callback: Artist deletes an inquiry
  const handleDeleteInquiry = (id: string) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    if (isSupabaseConfigured) {
      deleteInquiryFromSupabase(id).catch(() => {});
    }
    showToast(
      language === 'en'
        ? 'Inquiry deleted successfully'
        : 'Consulta eliminada correctamente',
      'info'
    );
  };

  // Callback: Artist purges all test/demo data to start 100% clean
  const handleClearAllTestData = () => {
    setInquiries([]);
    localStorage.removeItem('hans_inquiries');
    localStorage.setItem('hans_inquiries', '[]');
    setSubscribers([]);
    localStorage.removeItem('hans_subscribers');
    localStorage.setItem('hans_subscribers', '[]');
    localStorage.removeItem('hans_synced_inquiry_ids');
    showToast(
      language === 'en'
        ? 'Database cleaned! All demo/test inquiries and subscribers removed.'
        : '¡Base de datos limpia! Se han eliminado todas las consultas y suscriptores de prueba.',
      'success'
    );
  };

  // Callback: Artist imports / loads initial demo leads
  const handleLoadDemoData = () => {
    // Merge existing custom entries with default demo entries, avoiding duplicate IDs
    setInquiries((prev) => {
      const existingIds = new Set(prev.map(i => i.id));
      const demoToAdd = initialDemoLeads.filter(d => !existingIds.has(d.id));
      if (demoToAdd.length > 0) {
        showToast(
          language === 'en'
            ? `Successfully loaded ${demoToAdd.length} demo inquiries!`
            : `¡Se cargaron con éxito ${demoToAdd.length} consultas de demostración!`,
          'success'
        );
      } else {
        showToast(
          language === 'en'
            ? 'All demo inquiries are already loaded!'
            : '¡Todas las consultas de demostración ya están cargadas!',
          'info'
        );
      }
      return [...demoToAdd, ...prev];
    });
  };

  // Inquire Similar click handler: pre-fills style in the booking form
  const handleInquireSimilar = (style: TattooStyle, title?: string) => {
    setPreselectedStyle(style);
    if (title) {
      const descEn = `Hi Hans, I'm interested in requesting a custom design inspired by your "${title}" portfolio piece!`;
      const descEs = `¡Hola Hans! Me interesa solicitar un diseño personalizado inspirado en tu obra de portafolio "${title}".`;
      setPreselectedDescription(language === 'en' ? descEn : descEs);
    } else {
      setPreselectedDescription(null);
    }
    // Smooth scroll straight to booking wizard
    setTimeout(() => {
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Guard Artist Portal access behind login credentials
  const handleAdminToggle = (val: boolean) => {
    if (!val) {
      setIsAdminMode(false);
    } else {
      if (isAdminAuthorized) {
        setIsAdminMode(true);
      } else {
        setIsLoginModalOpen(true);
      }
    }
  };

  // Callback: Save visual edits from live page CMS
  const handleSaveVisualElement = (updatedData: any) => {
    if (!editingElement) return;

    const { type, key, id } = editingElement;

    if (type === 'text' && key) {
      setCustomTranslations((prev: any) => {
        const next = { ...prev };
        next.en = { ...next.en, [key]: updatedData.en };
        next.es = { ...next.es, [key]: updatedData.es };
        return next;
      });
      showToast(
        language === 'en' ? 'Website text updated successfully!' : '¡Texto de la web actualizado con éxito!',
        'success'
      );
    } else if (type === 'image' && key) {
      if (key === 'artistPhoto') {
        const mediaType = updatedData.mediaType || 'image';
        setCustomTranslations((prev: any) => ({
          ...prev,
          artistPhoto: updatedData.url,
          artistMediaType: mediaType
        }));
        localStorage.setItem('hans_custom_artist_photo', updatedData.url);
        localStorage.setItem('hans_custom_artist_media_type', mediaType);
        showToast(
          language === 'en' ? 'Artist bio media (photo/video) updated!' : '¡Foto/Video del artista actualizado con éxito!',
          'success'
        );
      } else if (key === 'newIntroPhoto') {
        setIntroPhotos((prev: any) => [
          ...prev,
          {
            url: updatedData.url,
            mediaType: updatedData.mediaType || 'image',
            labelEn: updatedData.labelEn || 'New Artwork',
            labelEs: updatedData.labelEs || 'Nueva Imagen'
          }
        ]);
        showToast(
          language === 'en' ? 'New photo added to hero carousel!' : '¡Nueva imagen añadida al carrusel!',
          'success'
        );
      } else if (key.startsWith('introPhoto-')) {
        const idx = parseInt(key.split('-')[1]);
        setIntroPhotos((prev: any) => {
          const next = [...prev];
          next[idx] = {
            url: updatedData.url,
            mediaType: updatedData.mediaType,
            labelEn: updatedData.labelEn,
            labelEs: updatedData.labelEs
          };
          return next;
        });
        showToast(
          language === 'en' ? 'Section content updated!' : '¡Contenido de sección actualizado!',
          'success'
        );
      }
    } else if (type === 'portfolio' && id) {
      setPortfolioItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
      );
      showToast(language === 'en' ? 'Tattoo portfolio design updated!' : '¡Diseño de portafolio actualizado!', 'success');
    } else if (type === 'new-portfolio') {
      const newItem: any = {
        id: `p-${Date.now()}`,
        titleEn: updatedData.titleEn || 'New Tattoo Design',
        titleEs: updatedData.titleEs || 'Nuevo Diseño de Tatuaje',
        style: updatedData.style || 'fineline',
        imageUrl: updatedData.imageUrl || 'https://images.unsplash.com/photo-1542382156909-9ae3b0245754?auto=format&fit=crop&q=80&w=600',
        mediaType: updatedData.mediaType || 'image',
        size: updatedData.size || '10 cm x 10 cm',
        duration: updatedData.duration || '2.0 hrs',
        recoveryDays: updatedData.recoveryDays || 10,
        placementEn: updatedData.placementEn || 'Forearm',
        placementEs: updatedData.placementEs || 'Antebrazo',
        storyEn: updatedData.storyEn || '',
        storyEs: updatedData.storyEs || '',
        artistNotesEn: updatedData.artistNotesEn || '',
        artistNotesEs: updatedData.artistNotesEs || ''
      };
      setPortfolioItems((prev) => [newItem, ...prev]);
      showToast(language === 'en' ? 'New tattoo design added to portfolio!' : '¡Nuevo tatuaje añadido al portafolio!', 'success');
    } else if (type === 'faq') {
      setFaqList((prev) =>
        prev.map((faq) =>
          faq.id === id
            ? { ...faq, qEn: updatedData.qEn, qEs: updatedData.qEs, aEn: updatedData.aEn, aEs: updatedData.aEs }
            : faq
        )
      );
      showToast(language === 'en' ? 'FAQ updated!' : '¡Pregunta frecuente actualizada!', 'success');
    } else if (type === 'new-faq') {
      const newFaq = {
        id: `faq-${Date.now()}`,
        qEn: updatedData.qEn || 'New Question',
        qEs: updatedData.qEs || 'Nueva Pregunta',
        aEn: updatedData.aEn || 'Answer details...',
        aEs: updatedData.aEs || 'Detalles de la respuesta...'
      };
      setFaqList((prev) => [...prev, newFaq]);
      showToast(language === 'en' ? 'New FAQ added!' : '¡Nueva pregunta frecuente añadida!', 'success');
    }

    setEditingElement(null);
  };

  // Callback: Delete visual elements
  const handleDeleteVisualElement = () => {
    if (!editingElement) return;
    const { type, id } = editingElement;

    if (type === 'portfolio' && id) {
      setPortfolioItems((prev) => prev.filter((item) => item.id !== id));
      showToast(
        language === 'en' ? 'Tattoo removed from portfolio' : 'Tatuaje eliminado del portafolio',
        'info'
      );
    } else if (type === 'faq' && id) {
      setFaqList((prev) => prev.filter((faq) => faq.id !== id));
      showToast(
        language === 'en' ? 'FAQ question deleted!' : '¡Pregunta FAQ eliminada!',
        'info'
      );
    }

    setEditingElement(null);
  };

  // Artist Logout Action (Clears admin session and returns to public view)
  const handleLogout = () => {
    setIsAdminAuthorized(false);
    setIsAdminMode(false);
    setIsVisualEditMode(false);
    localStorage.removeItem('hans_admin_authorized');
    if (window.location.hash.includes('admin')) {
      window.history.pushState('', document.title, window.location.pathname);
    }
    showToast(
      language === 'en' ? 'Logged out of admin session' : 'Sesión de administrador cerrada',
      'info'
    );
  };

  return (
    <div className="min-h-screen bg-white text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* Sticky Bilingual Navbar */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
        isAdminMode={isAdminMode}
        setIsAdminMode={handleAdminToggle}
        onNavigate={handleNavigate}
        isAdminAuthorized={isAdminAuthorized}
        isVisualEditMode={isVisualEditMode}
        setIsVisualEditMode={setIsVisualEditMode}
        onLogout={handleLogout}
      />

      {/* Admin Auth Gate Modal */}
      <AdminLoginModal
        language={language}
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsAdminAuthorized(true);
          setIsAdminMode(true);
        }}
      />

      {/* Primary Page Layout Switching */}
      {isAdminMode ? (
        /* Artist Workspace Dashboard View (Code-split) */
        <main className="animate-fadeIn">
          <Suspense fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 p-8">
              <Loader2 className="w-8 h-8 text-[#E53E3E] animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
                {language === 'en' ? 'Loading Workspace Dashboard...' : 'Cargando Panel de Control...'}
              </p>
            </div>
          }>
            <Dashboard
              language={language}
              inquiries={inquiries}
              onUpdateStatus={handleUpdateStatus}
              onUpdateNotes={handleUpdateNotes}
              onUpdateMedicalNotes={handleUpdateMedicalNotes}
              onDeleteInquiry={handleDeleteInquiry}
              onLoadDemoData={handleLoadDemoData}
              onClearAllData={handleClearAllTestData}
              showToast={showToast}
              instagramUsername={instagramUsername}
              setInstagramUsername={setInstagramUsername}
              instagramWidgetUrl={instagramWidgetUrl}
              setInstagramWidgetUrl={setInstagramWidgetUrl}
              seoTitle={seoTitle}
              setSeoTitle={setSeoTitle}
              seoDescription={seoDescription}
              setSeoDescription={setSeoDescription}
              seoKeywords={seoKeywords}
              setSeoKeywords={setSeoKeywords}
              subscribers={subscribers}
              onRemoveSubscriber={handleRemoveSubscriber}
              isVisualEditMode={isVisualEditMode}
              setIsVisualEditMode={setIsVisualEditMode}
              setIsAdminMode={setIsAdminMode}
              introPhotos={introPhotos}
              setIntroPhotos={setIntroPhotos}
              portfolioItems={portfolioItems}
              setPortfolioItems={setPortfolioItems}
              customTranslations={customTranslations}
              setCustomTranslations={setCustomTranslations}
              onEditElement={(type, key, label, data) => setEditingElement({ type, key, id: data?.id, data })}
              onLogout={handleLogout}
            />
          </Suspense>
        </main>
      ) : (
        /* Client Facing Landing Page View with Real-time Block Reordering */
        <main className="animate-fadeIn pb-20 md:pb-0">
          {sectionOrder.map((sectionId, index) => {
            const sectionLabels: Record<string, { en: string; es: string }> = {
              hero: { en: 'Header & Intro Photos', es: 'Bloque: Encabezado & Fotos Intro' },
              about: { en: 'About Hans Toribio', es: 'Bloque: Sobre el Artista' },
              instagram: { en: 'Live Instagram Community', es: 'Bloque: Feed de Instagram' },
              booking: { en: 'Tattoo Consultation Form', es: 'Bloque: Formulario de Cotización' },
              portfolio: { en: 'Tattoo Portfolio Gallery', es: 'Bloque: Galería de Portafolio' },
              testimonials: { en: 'Client Reviews', es: 'Bloque: Reseñas de Clientes' },
              faq: { en: 'Frequently Asked Questions', es: 'Bloque: Preguntas Frecuentes' },
              location: { en: 'Studio Map & Live Hours', es: 'Bloque: Ubicación & Horarios en Vivo' }
            };

            return (
              <div 
                key={sectionId} 
                className={`relative transition-all duration-300 ${
                  isVisualEditMode 
                    ? 'my-6 border-2 border-dashed border-amber-400 rounded-3xl p-3 bg-amber-500/5 shadow-lg' 
                    : ''
                }`}
              >
                {/* Visual Editor Block Movement Header */}
                {isVisualEditMode && (
                  <div className="sticky top-24 z-40 flex items-center justify-between bg-stone-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl mx-2 mb-4 shadow-xl border border-white/20">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[11px] font-black tracking-wider uppercase">
                        {language === 'en' ? sectionLabels[sectionId]?.en : sectionLabels[sectionId]?.es}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        disabled={index === 0}
                        onClick={() => moveSection(index, 'up')}
                        className={`px-3 py-1 rounded-xl border border-white/20 text-[11px] font-bold transition-all cursor-pointer ${
                          index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-amber-400 hover:text-black hover:border-amber-400'
                        }`}
                        title="Mover Bloque Arriba"
                      >
                        ▲ Subir Bloque
                      </button>
                      <button
                        disabled={index === sectionOrder.length - 1}
                        onClick={() => moveSection(index, 'down')}
                        className={`px-3 py-1 rounded-xl border border-white/20 text-[11px] font-bold transition-all cursor-pointer ${
                          index === sectionOrder.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-amber-400 hover:text-black hover:border-amber-400'
                        }`}
                        title="Mover Bloque Abajo"
                      >
                        ▼ Bajar Bloque
                      </button>
                    </div>
                  </div>
                )}

                {/* Dynamic Block Component Routing */}
                {sectionId === 'hero' && (
                  <Hero 
                    language={language} 
                    onNavigate={handleNavigate}
                    isVisualEditMode={isVisualEditMode}
                    onEditElement={(type, key, label, data) => setEditingElement({ type, key, data })}
                    introPhotos={introPhotos}
                    customTranslations={customTranslations}
                  />
                )}
                {sectionId === 'about' && (
                  <AboutArtist
                    language={language}
                    onNavigate={handleNavigate}
                    isVisualEditMode={isVisualEditMode}
                    onEditElement={(type, key, label, data) => setEditingElement({ type, key, data })}
                    customTranslations={customTranslations}
                  />
                )}
                {sectionId === 'instagram' && (
                  <InstagramFeed
                    language={language}
                    instagramUsername={instagramUsername}
                    instagramWidgetUrl={instagramWidgetUrl}
                    isVisualEditMode={isVisualEditMode}
                    onEditElement={(type, key, label, data) => setEditingElement({ type, key, data })}
                    customTranslations={customTranslations}
                  />
                )}
                {sectionId === 'booking' && (
                  <InquiryForm
                    language={language}
                    preselectedStyle={preselectedStyle}
                    preselectedDescription={preselectedDescription}
                    onInquirySubmitted={handleInquirySubmitted}
                    isVisualEditMode={isVisualEditMode}
                    onEditElement={(type, key, label, data) => setEditingElement({ type, key, data })}
                    customTranslations={customTranslations}
                  />
                )}
                {sectionId === 'portfolio' && (
                  <Portfolio 
                    language={language} 
                    onInquireSimilar={handleInquireSimilar}
                    portfolioItems={portfolioItems}
                    isVisualEditMode={isVisualEditMode}
                    onEditElement={(type, key, label, data) => setEditingElement({ type, key, id: data?.id, data })}
                    customTranslations={customTranslations}
                  />
                )}
                {sectionId === 'testimonials' && (
                  <Testimonials 
                    language={language} 
                    isVisualEditMode={isVisualEditMode}
                    onEditElement={(type, key, label, data) => setEditingElement({ type, key, data })}
                    customTranslations={customTranslations}
                  />
                )}
                {sectionId === 'faq' && (
                  <FAQ 
                    language={language}
                    faqList={faqList}
                    isVisualEditMode={isVisualEditMode}
                    onEditElement={(type, key, label, data) => setEditingElement({ type, key, id: data?.id, data })}
                    customTranslations={customTranslations}
                  />
                )}
                {sectionId === 'location' && (
                  <InteractiveMap
                    language={language}
                    isVisualEditMode={isVisualEditMode}
                    onEditElement={(type, key, label, data) => setEditingElement({ type, key, data })}
                    customTranslations={customTranslations}
                  />
                )}
              </div>
            );
          })}
        </main>
      )}

      {/* Real-time In-page Visual Editor CMS Modal (Code-split) */}
      {editingElement && (
        <Suspense fallback={null}>
          <VisualElementEditorModal
            language={language}
            isOpen={!!editingElement}
            onClose={() => setEditingElement(null)}
            onSave={handleSaveVisualElement}
            onDelete={handleDeleteVisualElement}
            editConfig={editingElement}
          />
        </Suspense>
      )}

      {/* Toast Notification HUD Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 bg-white/95 backdrop-blur-md ${
                toast.type === 'success'
                  ? 'border-emerald-100 shadow-emerald-900/5'
                  : toast.type === 'error'
                  ? 'border-rose-100 shadow-rose-900/5'
                  : 'border-stone-150 shadow-stone-900/5'
              }`}
            >
              {toast.type === 'success' && (
                <div className="bg-emerald-50 text-emerald-600 rounded-full p-1 border border-emerald-100/50 shrink-0">
                  <Check className="w-4 h-4" />
                </div>
              )}
              {toast.type === 'error' && (
                <div className="bg-rose-50 text-rose-600 rounded-full p-1 border border-rose-100/50 shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="bg-stone-50 text-stone-600 rounded-full p-1 border border-stone-100 shrink-0">
                  <Info className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-0.5">
                  {toast.type === 'success' ? (language === 'en' ? 'SUCCESS' : 'ÉXITO') : toast.type === 'error' ? (language === 'en' ? 'ERROR' : 'ERROR') : (language === 'en' ? 'NOTIFICATION' : 'NOTIFICACIÓN')}
                </p>
                <p className="text-xs font-bold leading-relaxed text-[#1A1A1A]">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-stone-400 hover:text-stone-700 p-0.5 rounded-md hover:bg-stone-50 transition-all cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>


      {/* Mobile Native App Bottom Tab Bar */}
      {!isAdminMode && (
        <MobileBottomNav
          language={language}
          onNavigate={handleNavigate}
          isAdminMode={isAdminMode}
          setIsAdminMode={setIsAdminMode}
        />
      )}
    </div>
  );
}
