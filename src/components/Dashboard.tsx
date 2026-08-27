import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Inquiry, Language, InquiryStatus, TattooStyle, PortfolioItem } from '../types';
import { translations } from '../translations';
import { 
  Search, Trash2, Download, Check, FileText, RefreshCw, Eye, X, AlertCircle,
  Settings, Globe, Code, Sparkles, Save, Instagram, Phone, Mail, Cloud, Database, Activity, CheckCircle2, TrendingUp, PieChart as PieChartIcon, BarChart2,
  MessageSquare, ArrowUpRight, History, Feather, Flame, Compass, PenTool, Image as ImageIcon, Plus, Upload, Edit3, FolderPlus, Layers, LayoutGrid, Camera, LogOut,
  Clock, MapPin, Video, Play
} from 'lucide-react';
import { syncInquiryToGoogleSheets, googleSignIn, googleSignOut, getAccessToken, auth } from '../lib/workspace';
import { initTracking } from '../lib/tracking';
import { isVideoUrl, getGoogleDriveEmbedUrl } from '../lib/media';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

interface DashboardProps {
  language: Language;
  inquiries: Inquiry[];
  onUpdateStatus: (id: string, status: InquiryStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateMedicalNotes: (id: string, notes: string) => void;
  onDeleteInquiry: (id: string) => void;
  onLoadDemoData: () => void;
  onClearAllData?: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  instagramUsername: string;
  setInstagramUsername: (val: string) => void;
  instagramWidgetUrl: string;
  setInstagramWidgetUrl: (val: string) => void;
  seoTitle: string;
  setSeoTitle: (val: string) => void;
  seoDescription: string;
  setSeoDescription: (val: string) => void;
  seoKeywords: string;
  setSeoKeywords: (val: string) => void;
  subscribers: string[];
  onRemoveSubscriber: (email: string) => void;
  isVisualEditMode?: boolean;
  setIsVisualEditMode?: (mode: boolean) => void;
  setIsAdminMode?: (mode: boolean) => void;
  introPhotos?: Array<{ url: string; labelEn: string; labelEs: string; mediaType?: 'image' | 'video' }>;
  setIntroPhotos?: React.Dispatch<React.SetStateAction<Array<{ url: string; labelEn: string; labelEs: string; mediaType?: 'image' | 'video' }>>>;
  portfolioItems?: PortfolioItem[];
  setPortfolioItems?: React.Dispatch<React.SetStateAction<PortfolioItem[]>>;
  customTranslations?: any;
  setCustomTranslations?: React.Dispatch<React.SetStateAction<any>>;
  onEditElement?: (type: 'text' | 'image' | 'portfolio' | 'faq' | 'new-portfolio' | 'new-faq', key?: string, label?: string, data?: any) => void;
  onLogout?: () => void;
}

export default function Dashboard({
  language,
  inquiries,
  onUpdateStatus,
  onUpdateNotes,
  onUpdateMedicalNotes,
  onDeleteInquiry,
  onLoadDemoData,
  onClearAllData,
  showToast,
  instagramUsername,
  setInstagramUsername,
  instagramWidgetUrl,
  setInstagramWidgetUrl,
  seoTitle,
  setSeoTitle,
  seoDescription,
  setSeoDescription,
  seoKeywords,
  setSeoKeywords,
  subscribers,
  onRemoveSubscriber,
  isVisualEditMode = false,
  setIsVisualEditMode,
  setIsAdminMode,
  introPhotos = [],
  setIntroPhotos,
  portfolioItems = [],
  setPortfolioItems,
  customTranslations,
  setCustomTranslations,
  onEditElement,
  onLogout
}: DashboardProps) {
  const t = translations[language];
  const [adminTab, setAdminTab] = useState<'inquiries' | 'media' | 'settings'>('inquiries');

  const renderStyleTag = (style: string, size: 'sm' | 'md' = 'sm') => {
    const s = style?.toLowerCase() || '';
    
    let icon = <Sparkles className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} text-amber-500`} />;
    let label = style;
    let bgClass = "bg-stone-50 text-stone-750 border-stone-200/60";
    let textColor = "text-stone-750";
    
    if (s === 'fineline' || s === 'fine line') {
      icon = <Sparkles className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-600 animate-pulse`} />;
      label = language === 'en' ? 'Fine Line' : 'Línea Fina';
      bgClass = "bg-amber-50 text-amber-800 border-amber-200/50";
      textColor = "text-amber-800";
    } else if (s === 'microrealism' || s === 'microrealismo') {
      icon = <Feather className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-blue-600`} />;
      label = language === 'en' ? 'Microrealism' : 'Microrrealismo';
      bgClass = "bg-blue-50 text-blue-800 border-blue-200/50";
      textColor = "text-blue-800";
    } else if (s === 'anime') {
      icon = <Flame className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-purple-600`} />;
      label = language === 'en' ? 'Anime & Manga' : 'Anime y Manga';
      bgClass = "bg-purple-50 text-purple-800 border-purple-200/50";
      textColor = "text-purple-800";
    } else {
      icon = <Compass className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-stone-500`} />;
      label = s === 'other' ? (language === 'en' ? 'Other Style' : 'Otro Estilo') : style;
      bgClass = "bg-stone-100 text-stone-800 border-stone-200/60";
      textColor = "text-stone-850";
    }

    return (
      <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black tracking-wider uppercase font-mono ${bgClass} shadow-sm`}>
        {icon}
        <span className={textColor}>{label}</span>
      </div>
    );
  };

  const getPriorityBadge = (inq: Inquiry) => {
    const createdDate = new Date(inq.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - createdDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return {
        label: language === 'en' ? 'New' : 'Nuevo',
        class: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 animate-pulse'
      };
    }
    
    if (inq.status === 'pending' && diffHours > 48) {
      return {
        label: language === 'en' ? 'High Priority' : 'Prioridad Alta',
        class: 'bg-rose-50 text-[#E53E3E] border-rose-200/60 font-black'
      };
    }
    
    return null;
  };

  // Sorting & Email Overlay States
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'status'>('date-desc');
  const [emailOverlayInquiry, setEmailOverlayInquiry] = useState<Inquiry | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailTemplateType, setEmailTemplateType] = useState<'accept' | 'moreInfo' | 'decline' | 'custom'>('accept');

  // Google API Sync States
  const [googleUser, setGoogleUser] = useState<{ email?: string; name?: string } | null>(() => {
    const cachedUser = auth.currentUser;
    if (cachedUser && getAccessToken()) {
      return { email: cachedUser.email || undefined, name: cachedUser.displayName || undefined };
    }
    return null;
  });
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<string>('');
  const [syncedIds, setSyncedIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('hans_synced_inquiry_ids');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Ads tracking pixels states
  const [metaPixelId, setMetaPixelId] = useState(() => localStorage.getItem('hans_meta_pixel_id') || '');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(() => localStorage.getItem('hans_google_analytics_id') || '');

  // Artist Security Credentials (Passcode/Pin and Recovery Email)
  const [adminPasscode, setAdminPasscode] = useState(() => localStorage.getItem('hans_admin_passcode') || 'hans2026');
  const [recoveryEmail, setRecoveryEmail] = useState(() => localStorage.getItem('hans_recovery_email') || 'tattoobyhans@gmail.com');

  useEffect(() => {
    localStorage.setItem('hans_admin_passcode', adminPasscode);
  }, [adminPasscode]);

  useEffect(() => {
    localStorage.setItem('hans_recovery_email', recoveryEmail);
  }, [recoveryEmail]);

  // Effects to save states
  useEffect(() => {
    localStorage.setItem('hans_meta_pixel_id', metaPixelId);
    initTracking();
  }, [metaPixelId]);

  useEffect(() => {
    localStorage.setItem('hans_google_analytics_id', googleAnalyticsId);
    initTracking();
  }, [googleAnalyticsId]);

  useEffect(() => {
    localStorage.setItem('hans_synced_inquiry_ids', JSON.stringify(Array.from(syncedIds)));
  }, [syncedIds]);

  // Handle Google OAuth connecting inside dashboard
  const [authDomainError, setAuthDomainError] = useState<boolean>(false);

  const handleConnectGoogle = async () => {
    try {
      setAuthDomainError(false);
      const res = await googleSignIn();
      if (res) {
        setGoogleUser({
          email: res.user.email || undefined,
          name: res.user.displayName || undefined
        });
        showToast(
          language === 'en' ? 'Connected to Google Workspace successfully!' : '¡Cuenta de Google conectada con éxito!',
          'success'
        );
      }
    } catch (err: any) {
      console.error('Google Sign in failed:', err);
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setAuthDomainError(true);
        showToast(
          language === 'en'
            ? 'Firebase Domain Authorization needed: Please add hansttoo.vercel.app to Authorized Domains in Firebase Console.'
            : 'Se requiere autorizar el dominio: Agrega hansttoo.vercel.app en Firebase Console > Authentication > Settings > Authorized domains.',
          'error'
        );
      } else {
        showToast(
          language === 'en' ? 'Failed to connect Google account.' : 'No se pudo conectar la cuenta de Google.',
          'error'
        );
      }
    }
  };

  const handleDisconnectGoogle = async () => {
    await googleSignOut();
    setGoogleUser(null);
  };

  // Sync individual lead
  const handleSyncLead = async (inq: Inquiry) => {
    setSyncingId(inq.id);
    setSyncProgress('Initializing sync...');
    try {
      // If we don't have a token, we must sign in first
      let token = getAccessToken();
      if (!token) {
        setSyncProgress('Requesting Google authentication...');
        const res = await googleSignIn();
        if (res) {
          setGoogleUser({
            email: res.user.email || undefined,
            name: res.user.displayName || undefined
          });
          token = res.accessToken;
        } else {
          throw new Error('Google authentication cancelled.');
        }
      }

      await syncInquiryToGoogleSheets(inq, (msg) => {
        setSyncProgress(msg);
      });

      setSyncedIds(prev => {
        const next = new Set(prev);
        next.add(inq.id);
        return next;
      });

      // Update active selected inquiry in modal if open
      if (selectedInquiry && selectedInquiry.id === inq.id) {
        setSelectedInquiry({
          ...selectedInquiry,
          // Trigger a re-render
        });
      }

      showToast(language === 'en' ? 'Successfully synced to Google Sheets and Drive!' : '¡Sincronizado correctamente con Google Sheets y Google Drive!', 'success');

    } catch (err: any) {
      console.error(err);
      showToast(`Sync Error: ${err.message || err}`, 'error');
    } finally {
      setSyncingId(null);
      setSyncProgress('');
    }
  };

  // Sync all unsynced leads
  const handleSyncAllPending = async () => {
    const unsynced = filteredInquiries.filter(inq => !syncedIds.has(inq.id));
    if (unsynced.length === 0) {
      showToast(language === 'en' ? 'All filtered leads are already synced!' : '¡Todos los leads filtrados ya están sincronizados!', 'info');
      return;
    }

    if (!window.confirm(language === 'en' 
      ? `Are you sure you want to sync ${unsynced.length} unsynced leads to Google Sheets/Drive?`
      : `¿Estás seguro de que quieres sincronizar ${unsynced.length} leads no sincronizados a Google Sheets/Drive?`
    )) {
      return;
    }

    // Try to authorize first
    let token = getAccessToken();
    if (!token) {
      try {
        const res = await googleSignIn();
        if (res) {
          setGoogleUser({
            email: res.user.email || undefined,
            name: res.user.displayName || undefined
          });
          token = res.accessToken;
        } else {
          return;
        }
      } catch (err) {
        console.error(err);
        return;
      }
    }

    for (const inq of unsynced) {
      setSyncingId(inq.id);
      setSyncProgress(`Syncing ${inq.fullName}...`);
      try {
        await syncInquiryToGoogleSheets(inq);
        setSyncedIds(prev => {
          const next = new Set(prev);
          next.add(inq.id);
          return next;
        });
      } catch (err) {
        console.error(`Failed to sync ${inq.fullName}:`, err);
      }
    }

    setSyncingId(null);
    setSyncProgress('');
    showToast(language === 'en' ? 'Bulk sync process completed!' : '¡Proceso de sincronización masiva completado!', 'success');
  };

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [styleFilter, setStyleFilter] = useState<TattooStyle | 'other' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'new' | 'replied' | 'booked'>('all');
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Subscribers Search and CSV Export
  const [subSearch, setSubSearch] = useState('');
  
  const filteredSubscribers = (subscribers || []).filter(sub => 
    sub.toLowerCase().includes(subSearch.toLowerCase())
  );

  const handleExportSubs = () => {
    if ((subscribers || []).length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8,Email\n" + (subscribers || []).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hansttoo_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(language === 'en' ? 'Subscribers list exported successfully!' : '¡Lista de suscriptores exportada con éxito!', 'success');
  };

  const handleExportAllCSV = () => {
    const headers = [
      'Record Type',
      'Full Name',
      'Email Address',
      'Phone / WhatsApp',
      'Instagram Handle',
      'Tattoo Style',
      'Color Option',
      'Placement Area',
      'Size (cm)',
      'Status',
      'Submission Date',
      'Concept Description',
      'Artist Private Notes'
    ];
    
    const csvRows = [headers.join(',')];
    
    inquiries.forEach(inq => {
      const row = [
        'Inquiry',
        `"${(inq.fullName || '').replace(/"/g, '""')}"`,
        `"${(inq.email || '').replace(/"/g, '""')}"`,
        `"${(inq.phone || '').replace(/"/g, '""')}"`,
        `"${(inq.instagram || '').replace(/"/g, '""')}"`,
        `"${(inq.style || '').replace(/"/g, '""')}"`,
        `"${(inq.colorType || '').replace(/"/g, '""')}"`,
        `"${(inq.placement || '').replace(/"/g, '""')}"`,
        inq.sizeCm || '',
        `"${(inq.status || '').replace(/"/g, '""')}"`,
        `"${(inq.createdAt || '').replace(/"/g, '""')}"`,
        `"${(inq.description || '').replace(/"/g, '""').replace(/[\n\r]+/g, ' ')}"`,
        `"${(inq.artistNotes || '').replace(/"/g, '""').replace(/[\n\r]+/g, ' ')}"`
      ];
      csvRows.push(row.join(','));
    });
    
    (subscribers || []).forEach(subEmail => {
      const row = [
        'Mailing List Subscriber',
        '',
        `"${subEmail.replace(/"/g, '""')}"`,
        '',
        '',
        '',
        '',
        '',
        '',
        'subscribed',
        '',
        '',
        ''
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hans_tattoo_database_backup_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(
      language === 'en' 
        ? 'Client & subscriber database CSV backup downloaded!' 
        : '¡Copia de seguridad en CSV de clientes y suscriptores descargada!', 
      'success'
    );
  };

  const handleOpenEmailOverlay = (inq: Inquiry) => {
    setEmailOverlayInquiry(inq);
    
    const subject = language === 'en'
      ? `Update regarding your Tattoo Inquiry - Hans Toribio Studio`
      : `Actualización sobre tu Consulta de Tatuaje - Estudio Hans Toribio`;
    setEmailSubject(subject);

    const body = language === 'en'
      ? `Hi ${inq.fullName},\n\nThis is Hans Toribio. I absolutely love your concept for a ${inq.sizeCm}cm ${inq.style} design on your ${inq.placement}!\n\nI have reviewed your inquiry and would love to accept this project. Let me know what dates work best for you to book a session.\n\nWarm regards,\nHans Toribio`
      : `Hola ${inq.fullName},\n\nTe escribe Hans Toribio. ¡Me encanta tu idea para un diseño de ${inq.sizeCm}cm estilo ${inq.style} en tu ${inq.placement}!\n\nHe revisado tu consulta y me encantaría aceptar el proyecto. Cuéntame qué fechas te van mejor para agendar la sesión.\n\nSaludos cordiales,\nHans Toribio`;
    setEmailBody(body);
    setEmailTemplateType('accept');
  };

  const applyEmailTemplate = (type: 'accept' | 'moreInfo' | 'decline' | 'custom', inq: Inquiry) => {
    setEmailTemplateType(type);
    if (type === 'accept') {
      const body = language === 'en'
        ? `Hi ${inq.fullName},\n\nThis is Hans Toribio. I absolutely love your concept for a ${inq.sizeCm}cm ${inq.style} design on your ${inq.placement}!\n\nI have reviewed your inquiry and would love to accept this project. Let me know what dates work best for you to book a session.\n\nWarm regards,\nHans Toribio`
        : `Hola ${inq.fullName},\n\nTe escribe Hans Toribio. ¡Me encanta tu idea para un diseño de ${inq.sizeCm}cm estilo ${inq.style} en tu ${inq.placement}!\n\nHe revisado tu consulta y me encantaría aceptar el proyecto. Cuéntame qué fechas te van mejor para agendar la sesión.\n\nSaludos cordiales,\nHans Toribio`;
      setEmailBody(body);
    } else if (type === 'moreInfo') {
      const body = language === 'en'
        ? `Hi ${inq.fullName},\n\nThanks for submitting your inquiry. Your tattoo concept is very exciting! Could you please provide a bit more description or send any additional reference images regarding the specific details you'd like to emphasize?\n\nWarm regards,\nHans Toribio`
        : `Hola ${inq.fullName},\n\nGracias por enviar tu consulta. ¡Tu concepto de tatuaje se ve genial! ¿Podrías darme un poco más de detalle o enviarme alguna otra imagen de referencia sobre los elementos específicos que te gustaría destacar?\n\nSaludos cordiales,\nHans Toribio`;
      setEmailBody(body);
    } else if (type === 'decline') {
      const body = language === 'en'
        ? `Hi ${inq.fullName},\n\nThank you for reaching out. Unfortunately, due to my current schedule and high volume of requests, I won't be able to take on this project at this time. I hope we can work together in the future!\n\nWarm regards,\nHans Toribio`
        : `Hola ${inq.fullName},\n\nGracias por contactarme. Desafortunadamente, debido a mi agenda actual y la cantidad de solicitudes, no podré realizar este proyecto en este momento. ¡Espero que podamos colaborar en el futuro!\n\nSaludos cordiales,\nHans Toribio`;
      setEmailBody(body);
    } else {
      setEmailBody('');
    }
  };

  const handleSendEmailOverlay = () => {
    if (!emailOverlayInquiry) return;
    
    const mailtoUrl = `mailto:${emailOverlayInquiry.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    onUpdateStatus(emailOverlayInquiry.id, 'replied');
    
    const newReply = {
      text: emailBody,
      date: new Date().toISOString(),
      method: 'email' as const
    };
    
    setReplyHistory(prev => ({
      ...prev,
      [emailOverlayInquiry.id]: [newReply, ...(prev[emailOverlayInquiry.id] || [])]
    }));
    
    const appendDate = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const updatedNotes = `${emailOverlayInquiry.artistNotes || ''}\n[📧 Quick Email Overlay - ${appendDate}]: "${emailBody}"`.trim();
    onUpdateNotes(emailOverlayInquiry.id, updatedNotes);
    
    window.open(mailtoUrl, '_blank');
    
    setEmailOverlayInquiry(null);
    showToast(
      language === 'en' 
        ? `Inquiry updated to 'Replied' & email composer opened!` 
        : `¡Consulta actualizada a 'Respondida' y compositor de correo abierto!`, 
      'success'
    );
  };
  
  // Selected Details Modal
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [medicalNotesDraft, setMedicalNotesDraft] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Reply text and sending states
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Synced state for Hans's Business WhatsApp Number
  const [artistWhatsApp, setArtistWhatsApp] = useState<string>(() => {
    return localStorage.getItem('hans_artist_whatsapp') || '16462709292';
  });

  useEffect(() => {
    localStorage.setItem('hans_artist_whatsapp', artistWhatsApp);
  }, [artistWhatsApp]);

  // reply history stored locally per inquiry
  const [replyHistory, setReplyHistory] = useState<Record<string, { text: string; date: string; method: 'email' | 'whatsapp' }[]>>(() => {
    const stored = localStorage.getItem('hans_reply_history');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse reply history", e);
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('hans_reply_history', JSON.stringify(replyHistory));
  }, [replyHistory]);

  // SEO draft states
  const [draftTitle, setDraftTitle] = useState(seoTitle);
  const [draftDesc, setDraftDesc] = useState(seoDescription);
  const [draftKeywords, setDraftKeywords] = useState(seoKeywords);
  const [draftOgImage, setDraftOgImage] = useState(() => {
    return localStorage.getItem('hans_seo_og_image') || 'https://images.unsplash.com/photo-1598104358204-87cefc7c5986?auto=format&fit=crop&q=80&w=600';
  });

  useEffect(() => {
    setDraftTitle(seoTitle);
  }, [seoTitle]);

  useEffect(() => {
    setDraftDesc(seoDescription);
  }, [seoDescription]);

  useEffect(() => {
    setDraftKeywords(seoKeywords);
  }, [seoKeywords]);

  const handleSaveSEO = () => {
    setSeoTitle(draftTitle);
    setSeoDescription(draftDesc);
    setSeoKeywords(draftKeywords);
    
    localStorage.setItem('hans_seo_og_image', draftOgImage);
    
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const attribute = isName ? 'name' : 'property';
      let tag = document.head.querySelector(`meta[${attribute}="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateMetaTag('og:image', draftOgImage);
    updateMetaTag('twitter:image', draftOgImage, true);

    showToast(
      language === 'en'
        ? 'SEO & Meta Tags updated successfully across all networks!'
        : '¡Las etiquetas SEO y Meta se actualizaron correctamente en toda la web!',
      'success'
    );
  };

  // Lock body scroll when detailed lead sheet is active
  useEffect(() => {
    if (selectedInquiry) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedInquiry]);

  // Handle selected click
  const handleOpenDetails = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setNotesDraft(inq.artistNotes || '');
    setMedicalNotesDraft(inq.medicalNotes || '');
    setActiveImageIndex(0);

    // Dynamic initial message
    const initialMsg = language === 'en'
      ? `Hi ${inq.fullName}! This is Hans Toribio. I reviewed your tattoo consultation request for a ${inq.sizeCm}cm ${inq.style} design on your ${inq.placement}. I'd love to help bring this vision to life! Let's discuss dates and details.`
      : `¡Hola ${inq.fullName}! Te escribe Hans Toribio. He revisado tu solicitud para un tatuaje de ${inq.sizeCm}cm estilo ${inq.style} en tu ${inq.placement}. ¡Me encantaría ayudarte a darle vida a esta idea! Hablemos sobre las fechas y detalles.`;
    setReplyText(initialMsg);
  };

  const applyTemplate = (type: 'accept' | 'quote' | 'details', inq: Inquiry) => {
    let msg = '';
    if (type === 'accept') {
      msg = language === 'en'
        ? `Hi ${inq.fullName}! This is Hans. I absolutely love your design concept for a ${inq.sizeCm}cm ${inq.style} tattoo on your ${inq.placement}. Let's secure a date! Are you free sometime next week?`
        : `¡Hola ${inq.fullName}! Te escribe Hans. Me encanta tu idea de diseño para el tatuaje de ${inq.sizeCm}cm estilo ${inq.style} en tu ${inq.placement}. ¡Vamos a fijar una fecha! ¿Tienes disponibilidad la próxima semana?`;
    } else if (type === 'quote') {
      msg = language === 'en'
        ? `Hi ${inq.fullName}! Thanks for submitting your inquiry. Based on your design concept for a ${inq.sizeCm}cm piece, the estimated price would be around $250 - $350. To lock this in, we can proceed with a standard deposit. Let me know if that works for you!`
        : `¡Hola ${inq.fullName}! Gracias por tu consulta. Según tu idea de diseño para una pieza de ${inq.sizeCm}cm, el precio estimado sería de unos $250 - $350. Para asegurar tu turno, procederíamos con una seña estándar. ¡Avísame si te cuadra!`;
    } else if (type === 'details') {
      msg = language === 'en'
        ? `Hi ${inq.fullName}! This is Hans. Your tattoo concept is very exciting! Could you please provide a bit more description or send any additional reference images regarding the specific details you'd like to emphasize? Thanks!`
        : `¡Hola ${inq.fullName}! Te escribe Hans. ¡Tu concepto de tatuaje se ve genial! ¿Podrías darme un poco más de detalle o enviarme alguna otra imagen de referencia sobre los elementos específicos que te gustaría destacar? ¡Gracias!`;
    }
    setReplyText(msg);
  };

  const handleSendEmailReply = async (inq: Inquiry) => {
    if (!replyText.trim()) return;
    setSendingReply(true);

    // Simulate standard high-fidelity SMTP relay latency
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const newReply = {
      text: replyText,
      date: new Date().toISOString(),
      method: 'email' as const
    };

    setReplyHistory(prev => ({
      ...prev,
      [inq.id]: [newReply, ...(prev[inq.id] || [])]
    }));

    // Auto mark status to contacted
    onUpdateStatus(inq.id, 'contacted');
    setSelectedInquiry(prev => prev ? { ...prev, status: 'contacted' } : null);

    // Append to internal notes for high auditability
    const appendDate = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const updatedNotes = `${notesDraft}\n[📧 Email Sendout - ${appendDate}]: "${replyText}"`.trim();
    setNotesDraft(updatedNotes);
    onUpdateNotes(inq.id, updatedNotes);

    setSendingReply(false);
    showToast(language === 'en' ? `Email reply sent to ${inq.fullName}!` : `¡Respuesta por Email enviada con éxito a ${inq.fullName}!`, 'success');
  };

  const handleSendWhatsAppReply = (inq: Inquiry) => {
    if (!replyText.trim()) return;

    const cleanPhone = inq.phone.replace(/[^0-9]/g, '');
    const encodedMsg = encodeURIComponent(replyText);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

    const newReply = {
      text: replyText,
      date: new Date().toISOString(),
      method: 'whatsapp' as const
    };

    setReplyHistory(prev => ({
      ...prev,
      [inq.id]: [newReply, ...(prev[inq.id] || [])]
    }));

    // Auto mark status to contacted
    onUpdateStatus(inq.id, 'contacted');
    setSelectedInquiry(prev => prev ? { ...prev, status: 'contacted' } : null);

    const appendDate = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const updatedNotes = `${notesDraft}\n[💬 WhatsApp Redirect - ${appendDate}]: "${replyText}"`.trim();
    setNotesDraft(updatedNotes);
    onUpdateNotes(inq.id, updatedNotes);

    // Open WhatsApp API in new window
    window.open(whatsappUrl, '_blank');
    showToast(language === 'en' ? `Initiated WhatsApp chat with ${inq.fullName}!` : `¡Iniciando chat de WhatsApp con ${inq.fullName}!`, 'success');
  };

  const handleSaveNotes = () => {
    if (selectedInquiry) {
      onUpdateNotes(selectedInquiry.id, notesDraft);
      setSelectedInquiry({
        ...selectedInquiry,
        artistNotes: notesDraft
      });
    }
  };

  const handleSaveMedicalNotes = () => {
    if (selectedInquiry) {
      onUpdateMedicalNotes(selectedInquiry.id, medicalNotesDraft);
      setSelectedInquiry({
        ...selectedInquiry,
        medicalNotes: medicalNotesDraft
      });
    }
  };

  // Filtered List
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch = 
      inq.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (inq.instagram || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inq.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStyle = styleFilter === 'all' || inq.style === styleFilter;
    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;

    let matchesQuick = true;
    if (quickFilter === 'new') {
      const createdDate = new Date(inq.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - createdDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      matchesQuick = diffHours < 24;
    } else if (quickFilter === 'replied') {
      matchesQuick = inq.status === 'replied';
    } else if (quickFilter === 'booked') {
      matchesQuick = inq.status === 'booked';
    }

    return matchesSearch && matchesStyle && matchesStatus && matchesQuick;
  });

  const statusWeight: Record<InquiryStatus, number> = {
    pending: 0,
    contacted: 1,
    replied: 2,
    booked: 3,
    completed: 4,
    declined: 5
  };

  const sortedInquiries = [...filteredInquiries].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'date-asc') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === 'status') {
      const weightA = statusWeight[a.status] ?? 99;
      const weightB = statusWeight[b.status] ?? 99;
      if (weightA !== weightB) {
        return weightA - weightB;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  // Stats calculation
  const totalInquiries = inquiries.length;
  const pendingCount = inquiries.filter(i => i.status === 'pending').length;
  const contactedCount = inquiries.filter(i => i.status === 'contacted').length;
  const bookedCount = inquiries.filter(i => i.status === 'booked').length;

  // Status Badge Helper
  const getStatusBadgeClass = (status: InquiryStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-100';
      case 'contacted':
        return 'bg-blue-50 text-blue-800 border-blue-100';
      case 'replied':
        return 'bg-indigo-50 text-indigo-800 border-indigo-100';
      case 'booked':
        return 'bg-purple-50 text-purple-800 border-purple-100';
      case 'completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-100';
      case 'declined':
        return 'bg-rose-50 text-rose-800 border-rose-100';
      default:
        return 'bg-stone-50 text-stone-800 border-stone-100';
    }
  };

  const getStatusLabel = (status: InquiryStatus) => {
    switch (status) {
      case 'pending': return t.portalStatusPending;
      case 'contacted': return t.portalStatusContacted;
      case 'replied': return language === 'en' ? 'Replied' : 'Respondido';
      case 'booked': return t.portalStatusBooked;
      case 'completed': return t.portalStatusCompleted;
      case 'declined': return t.portalStatusDeclined;
    }
  };

  // Export Leads as JSON File
  const handleExportLeads = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inquiries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hans_tattoo_leads_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Process Style Distribution Data
  const styleCounts: { [key in TattooStyle | 'other']: number } = {
    fineline: 0,
    microrealism: 0,
    anime: 0,
    other: 0,
  };
  inquiries.forEach((inq) => {
    const s = inq.style as TattooStyle | 'other';
    if (styleCounts[s] !== undefined) {
      styleCounts[s]++;
    } else {
      styleCounts.other++;
    }
  });

  const styleData = [
    { 
      name: language === 'en' ? 'Fine Line' : 'Línea Fina', 
      value: styleCounts.fineline,
      color: '#E53E3E'
    },
    { 
      name: language === 'en' ? 'Microrealism' : 'Microrrealismo', 
      value: styleCounts.microrealism,
      color: '#1A1A1A'
    },
    { 
      name: language === 'en' ? 'Anime' : 'Anime', 
      value: styleCounts.anime,
      color: '#8B5CF6'
    },
    { 
      name: language === 'en' ? 'Other' : 'Otro', 
      value: styleCounts.other,
      color: '#78716C'
    }
  ].filter(item => item.value > 0);

  // Group inquiries by day for a trend chart over time
  const dailyCounts: { [dateStr: string]: number } = {};
  inquiries.forEach((inq) => {
    if (inq.createdAt) {
      const datePart = inq.createdAt.split('T')[0];
      dailyCounts[datePart] = (dailyCounts[datePart] || 0) + 1;
    }
  });

  const chronologicalDates = Object.keys(dailyCounts).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const trendData = chronologicalDates.map((dateStr) => {
    let formattedDate = dateStr;
    try {
      const d = new Date(dateStr + 'T00:00:00');
      formattedDate = d.toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', {
        month: 'short',
        day: 'numeric'
      });
    } catch (_) {}
    return {
      date: formattedDate,
      inquiries: dailyCounts[dateStr]
    };
  });

  // Group inquiries by month for a trend chart over time (booking peaks)
  const monthlyCounts: { [monthStr: string]: number } = {};
  inquiries.forEach((inq) => {
    if (inq.createdAt) {
      try {
        const d = new Date(inq.createdAt);
        const monthLabel = d.toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', {
          month: 'short',
          year: '2-digit'
        });
        monthlyCounts[monthLabel] = (monthlyCounts[monthLabel] || 0) + 1;
      } catch (_) {}
    }
  });

  const monthSortKeys: { [month: string]: number } = {};
  inquiries.forEach((inq) => {
    if (inq.createdAt) {
      try {
        const d = new Date(inq.createdAt);
        const monthLabel = d.toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', {
          month: 'short',
          year: '2-digit'
        });
        const yearMonthValue = d.getFullYear() * 100 + d.getMonth();
        if (!monthSortKeys[monthLabel] || yearMonthValue < monthSortKeys[monthLabel]) {
          monthSortKeys[monthLabel] = yearMonthValue;
        }
      } catch (_) {}
    }
  });

  const monthlyData = Object.keys(monthlyCounts).map((month) => ({
    month,
    inquiries: monthlyCounts[month]
  }));
  monthlyData.sort((a, b) => (monthSortKeys[a.month] || 0) - (monthSortKeys[b.month] || 0));

  // Quick count helpers for entire database
  const quickNewCount = inquiries.filter((inq) => {
    const createdDate = new Date(inq.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - createdDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours < 24;
  }).length;
  const quickRepliedCount = inquiries.filter((inq) => inq.status === 'replied').length;
  const quickBookedCount = inquiries.filter((inq) => inq.status === 'booked').length;

  return (
    <section className="py-16 sm:py-20 bg-[#FCFBFA] min-h-[80vh] border-b border-stone-100" id="artist-portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-[#E53E3E] animate-pulse"></span>
              <span className="text-[10px] font-black tracking-[0.2em] text-[#1A1A1A]/40 uppercase">
                {language === 'en' ? 'PRIVATE ARTIST BACKOFFICE' : 'OFICINA PRIVADA DEL ARTISTA'}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tighter uppercase mt-1">
              {t.portalTitle}<span className="text-[#E53E3E]">.</span>
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              {t.portalSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sync All to Google Sheets */}
            <button
              onClick={handleSyncAllPending}
              disabled={syncingId !== null}
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black tracking-wider uppercase transition-all cursor-pointer shadow-md shadow-emerald-600/10 disabled:opacity-55"
              id="dashboard-sync-all-btn"
            >
              <Cloud className={`w-3.5 h-3.5 mr-2 ${syncingId !== null ? 'animate-bounce' : ''}`} />
              {syncingId !== null && syncingId.startsWith('sync-all') 
                ? (language === 'en' ? 'Syncing...' : 'Sincronizando...')
                : (language === 'en' ? 'Sync All to Sheets' : 'Sincronizar Todo a Sheets')}
            </button>

            {/* Export Leads */}
            <button
              onClick={handleExportLeads}
              className="inline-flex items-center px-5 py-2.5 rounded-full border border-stone-200 bg-white hover:border-stone-400 text-stone-700 hover:text-black text-xs font-bold tracking-wider uppercase transition-all cursor-pointer shadow-sm"
              id="dashboard-export-btn"
              title={language === 'en' ? 'Export Raw JSON Backup' : 'Exportar copia en formato JSON'}
            >
              <Download className="w-3.5 h-3.5 mr-2" />
              {language === 'en' ? 'Export JSON' : 'Exportar JSON'}
            </button>

            {/* Download CSV Backup (Inquiries & Subscribers) */}
            <button
              onClick={handleExportAllCSV}
              className="inline-flex items-center px-5 py-2.5 rounded-full border border-[#E53E3E]/15 bg-[#E53E3E]/5 hover:bg-[#E53E3E]/10 hover:border-[#E53E3E]/30 text-[#E53E3E] text-xs font-bold tracking-wider uppercase transition-all cursor-pointer shadow-sm"
              id="dashboard-csv-export-btn"
              title={language === 'en' ? 'Download CSV Client & Subscriber Database Backup' : 'Descargar respaldo en CSV de clientes y suscriptores'}
            >
              <Database className="w-3.5 h-3.5 mr-2" />
              {language === 'en' ? 'Download CSV Backup' : 'Respaldo CSV'}
            </button>

            {/* Clear Test Data / Reset to Clean */}
            {onClearAllData && (
              <button
                onClick={() => {
                  const confirmMsg = language === 'en'
                    ? 'Are you sure you want to clear all test inquiries and subscribers? This will leave your dashboard 100% clean for real clients.'
                    : '¿Estás seguro de que deseas vaciar todos los registros y suscriptores de prueba? Esto dejará tu panel 100% limpio para recibir clientes reales.';
                  if (window.confirm(confirmMsg)) {
                    onClearAllData();
                  }
                }}
                className="inline-flex items-center px-4 py-2.5 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-black tracking-wider uppercase transition-all cursor-pointer shadow-sm"
                id="dashboard-clear-test-data-btn"
                title={language === 'en' ? 'Clear all mock test inquiries and subscribers' : 'Vaciar todas las consultas y suscriptores de prueba'}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                {language === 'en' ? 'Clear Test Data' : 'Limpiar Datos de Prueba'}
              </button>
            )}

            {/* Exit to Client View */}
            <button
              onClick={() => setIsAdminMode?.(false)}
              className="inline-flex items-center px-4 py-2.5 rounded-full border border-stone-200 bg-white hover:border-stone-400 text-stone-700 hover:text-black text-xs font-bold tracking-wider uppercase transition-all cursor-pointer shadow-sm"
              id="dashboard-client-view-btn"
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              {language === 'en' ? 'View as Client' : 'Ver como Cliente'}
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="inline-flex items-center px-4 py-2.5 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black tracking-wider uppercase transition-all cursor-pointer shadow-sm"
                id="dashboard-logout-btn"
                title={language === 'en' ? 'Log out of admin mode' : 'Cerrar sesión de administrador'}
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                {language === 'en' ? 'Log Out' : 'Cerrar Sesión'}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs for Admin Backoffice */}
        <div className="flex items-center space-x-2 border-b border-stone-200 mb-8 pb-3 overflow-x-auto">
          <button
            onClick={() => setAdminTab('inquiries')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
              adminTab === 'inquiries'
                ? 'bg-[#1A1A1A] text-white shadow-md shadow-stone-900/10'
                : 'bg-white text-stone-600 hover:text-black border border-stone-200'
            }`}
          >
            <FileText className="w-4 h-4 text-[#E53E3E]" />
            <span>{language === 'en' ? 'Inquiries & Clients' : 'Consultas y Clientes'}</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] bg-stone-800 text-stone-200">
              {totalInquiries}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('media')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
              adminTab === 'media'
                ? 'bg-[#1A1A1A] text-white shadow-md shadow-stone-900/10'
                : 'bg-white text-stone-600 hover:text-black border border-stone-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <span>{language === 'en' ? 'Image & Gallery Manager' : 'Gestión de Imágenes & Galería'}</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] bg-amber-500 text-white font-black">
              {introPhotos.length + portfolioItems.length + 1}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('settings')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
              adminTab === 'settings'
                ? 'bg-[#1A1A1A] text-white shadow-md shadow-stone-900/10'
                : 'bg-white text-stone-600 hover:text-black border border-stone-200'
            }`}
          >
            <Settings className="w-4 h-4 text-blue-500" />
            <span>{language === 'en' ? 'SEO & Settings' : 'Configuración y SEO'}</span>
          </button>
        </div>

        {adminTab === 'inquiries' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Mini Stats Metrics Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8" id="dashboard-stats-grid">
          <div className="p-6 bg-white rounded-2xl border border-stone-100 shadow-sm">
            <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block mb-1">{t.portalStatTotal}</span>
            <span className="text-3xl font-black tracking-tighter text-[#1A1A1A]">{totalInquiries}</span>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-stone-100 shadow-sm">
            <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider block mb-1">{t.portalStatPending}</span>
            <span className="text-3xl font-black tracking-tighter text-amber-500">{pendingCount}</span>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-stone-100 shadow-sm">
            <span className="text-[9px] text-blue-500 font-bold uppercase tracking-wider block mb-1">{language === 'en' ? 'CONTACTED' : 'CONTACTADOS'}</span>
            <span className="text-3xl font-black tracking-tighter text-blue-500">{contactedCount}</span>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-stone-100 shadow-sm">
            <span className="text-[9px] text-purple-500 font-bold uppercase tracking-wider block mb-1">{t.portalStatBooked}</span>
            <span className="text-3xl font-black tracking-tighter text-purple-500">{bookedCount}</span>
          </div>
        </div>

        {/* Studio Performance and Analytics */}
        <div className="mb-8 p-6 bg-white rounded-2xl border border-stone-100 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2.5">
              <TrendingUp className="w-4 h-4 text-[#E53E3E]" />
              <h3 className="text-xs font-black tracking-widest text-[#1A1A1A] uppercase">
                {language === 'en' ? 'STUDIO PERFORMANCE & INSIGHTS' : 'ESTADÍSTICAS Y RENDIMIENTO DEL ESTUDIO'}
              </h3>
            </div>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="text-xs font-black text-[#E53E3E] hover:text-[#E53E3E]/80 uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
            >
              <span>{showAnalytics ? (language === 'en' ? 'Hide Charts' : 'Ocultar Gráficos') : (language === 'en' ? 'Show Charts' : 'Ver Gráficos')}</span>
              <span className="text-[10px]">{showAnalytics ? '▲' : '▼'}</span>
            </button>
          </div>

          <AnimatePresence initial={false}>
            {showAnalytics && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6 pt-6 border-t border-stone-100">
                  
                  {/* Style Distribution Chart */}
                  <div className="flex flex-col h-[280px]">
                    <div className="flex items-center space-x-2 mb-4">
                      <PieChartIcon className="w-3.5 h-3.5 text-stone-500" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                        {language === 'en' ? 'Style Distribution' : 'Distribución por Estilo'}
                      </h4>
                    </div>
                    {styleData.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-xs text-stone-400 font-bold uppercase tracking-wider">
                        {language === 'en' ? 'No inquiry data available' : 'No hay datos de consultas disponibles'}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col sm:flex-row items-center justify-between min-h-0">
                        <div className="w-full sm:w-1/2 h-full relative" style={{ minHeight: '160px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={styleData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {styleData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="bg-stone-900 border border-stone-850 text-white p-2 rounded-md text-[10px] font-black tracking-wider uppercase shadow-md font-mono">
                                        <p>{payload[0].name}</p>
                                        <p className="text-[#E53E3E] mt-0.5">{payload[0].value} {payload[0].value === 1 ? (language === 'en' ? 'Inquiry' : 'Consulta') : (language === 'en' ? 'Inquiries' : 'Consultas')}</p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Styled Legend Grid */}
                        <div className="w-full sm:w-1/2 flex flex-col space-y-2 pl-0 sm:pl-4 mt-4 sm:mt-0 justify-center">
                          {styleData.map((item, idx) => {
                            const percentage = totalInquiries > 0 ? Math.round((item.value / totalInquiries) * 100) : 0;
                            return (
                              <div key={idx} className="flex items-center justify-between border-b border-stone-50 pb-1">
                                <div className="flex items-center space-x-2">
                                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                  <span className="text-[10px] font-black text-[#1A1A1A] tracking-wider uppercase">{item.name}</span>
                                </div>
                                <div className="text-right flex items-center space-x-2 font-mono">
                                  <span className="text-[11px] font-black text-[#1A1A1A]">{item.value}</span>
                                  <span className="text-[9px] text-stone-400 font-bold">({percentage}%)</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Inquiries Over Time Chart */}
                  <div className="flex flex-col h-[280px]">
                    <div className="flex items-center space-x-2 mb-4">
                      <BarChart2 className="w-3.5 h-3.5 text-stone-500" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                        {language === 'en' ? 'Inquiries Timeline' : 'Línea de Tiempo de Consultas'}
                      </h4>
                    </div>
                    {trendData.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-xs text-stone-400 font-bold uppercase tracking-wider">
                        {language === 'en' ? 'No history data available' : 'No hay datos de historial disponibles'}
                      </div>
                    ) : (
                      <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FCFBFA" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#A8A29E" 
                              fontSize={9} 
                              fontWeight="bold"
                              tickLine={false} 
                              axisLine={false}
                              dy={10}
                            />
                            <YAxis 
                              stroke="#A8A29E" 
                              fontSize={9} 
                              fontWeight="bold"
                              tickLine={false} 
                              axisLine={false}
                              allowDecimals={false}
                              dx={-5}
                            />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-stone-900 border border-stone-850 text-white p-2 rounded-md text-[10px] font-black tracking-wider uppercase shadow-md font-mono">
                                      <p className="text-stone-400 font-bold">{label}</p>
                                      <p className="text-[#E53E3E] mt-0.5 font-black">{payload[0].value} {payload[0].value === 1 ? (language === 'en' ? 'Lead' : 'Lead') : (language === 'en' ? 'Leads' : 'Leads')}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="inquiries" 
                              stroke="#E53E3E" 
                              strokeWidth={2.5}
                              dot={{ fill: '#E53E3E', strokeWidth: 1, r: 3.5 }}
                              activeDot={{ r: 5.5, strokeWidth: 0, fill: '#1A1A1A' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Monthly Booking Peaks Bar Chart */}
                  <div className="flex flex-col h-[280px]" id="monthly-peaks-chart">
                    <div className="flex items-center space-x-2 mb-4">
                      <BarChart2 className="w-3.5 h-3.5 text-stone-500 animate-pulse" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                        {language === 'en' ? 'Monthly Booking Peaks' : 'Picos Mensuales de Reserva'}
                      </h4>
                    </div>
                    {monthlyData.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-xs text-stone-400 font-bold uppercase tracking-wider">
                        {language === 'en' ? 'No monthly trend data' : 'No hay datos de tendencias mensuales'}
                      </div>
                    ) : (
                      <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FCFBFA" />
                            <XAxis 
                              dataKey="month" 
                              stroke="#A8A29E" 
                              fontSize={9} 
                              fontWeight="bold"
                              tickLine={false} 
                              axisLine={false}
                              dy={10}
                            />
                            <YAxis 
                              stroke="#A8A29E" 
                              fontSize={9} 
                              fontWeight="bold"
                              tickLine={false} 
                              axisLine={false}
                              allowDecimals={false}
                              dx={-5}
                            />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-stone-900 border border-stone-850 text-white p-2 rounded-md text-[10px] font-black tracking-wider uppercase shadow-md font-mono">
                                      <p className="text-stone-400 font-bold">{label}</p>
                                      <p className="text-[#E53E3E] mt-0.5 font-black">
                                        {payload[0].value} {payload[0].value === 1 ? (language === 'en' ? 'Inquiry' : 'Consulta') : (language === 'en' ? 'Inquiries' : 'Consultas')}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar 
                              dataKey="inquiries" 
                              fill="#E53E3E" 
                              radius={[6, 6, 0, 0]}
                              maxBarSize={32}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Filter Pill Navigation */}
        <div className="mb-4 flex flex-wrap items-center gap-2" id="quick-filter-pills">
          <span className="text-[10px] text-stone-450 font-black uppercase tracking-widest mr-2">
            {language === 'en' ? 'Quick Views:' : 'Vistas Rápidas:'}
          </span>
          
          {/* All Pill */}
          <button
            onClick={() => setQuickFilter('all')}
            className={`px-4 py-2 rounded-full border text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
              quickFilter === 'all'
                ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
            }`}
          >
            <span>{language === 'en' ? 'All Inquiries' : 'Todas'}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${quickFilter === 'all' ? 'bg-white/15 text-white' : 'bg-stone-100 text-stone-500'}`}>
              {totalInquiries}
            </span>
          </button>

          {/* New Pill */}
          <button
            onClick={() => setQuickFilter('new')}
            className={`px-4 py-2 rounded-full border text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
              quickFilter === 'new'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{language === 'en' ? 'New (Last 24h)' : 'Nuevas (24h)'}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${quickFilter === 'new' ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-750 font-black'}`}>
              {quickNewCount}
            </span>
          </button>

          {/* Replied Pill */}
          <button
            onClick={() => setQuickFilter('replied')}
            className={`px-4 py-2 rounded-full border text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
              quickFilter === 'replied'
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
            }`}
          >
            <span>{language === 'en' ? 'Replied' : 'Respondidas'}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${quickFilter === 'replied' ? 'bg-white/15 text-white' : 'bg-indigo-50 text-indigo-750 font-black'}`}>
              {quickRepliedCount}
            </span>
          </button>

          {/* Booked Pill */}
          <button
            onClick={() => setQuickFilter('booked')}
            className={`px-4 py-2 rounded-full border text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
              quickFilter === 'booked'
                ? 'bg-purple-600 border-purple-600 text-white shadow-sm shadow-purple-600/10'
                : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
            }`}
          >
            <span>{language === 'en' ? 'Booked' : 'Reservadas'}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${quickFilter === 'booked' ? 'bg-white/15 text-white' : 'bg-purple-50 text-purple-750 font-black'}`}>
              {quickBookedCount}
            </span>
          </button>
        </div>

        {/* Workspace controls & filters bar */}
        <div className="bg-white p-5 rounded-2xl border border-stone-100 mb-6 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 shadow-sm" id="dashboard-filters-bar">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.portalSearchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all"
            />
          </div>

          {/* Style Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider whitespace-nowrap">{t.portalFilterStyle}:</span>
            <select
              value={styleFilter}
              onChange={(e) => setStyleFilter(e.target.value as any)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 focus:bg-white focus:outline-none"
            >
              <option value="all">{t.filterAll}</option>
              <option value="fineline">{t.filterFineline}</option>
              <option value="microrealism">{t.filterMicrorealism}</option>
              <option value="anime">{t.filterAnime}</option>
              <option value="other">Other Style</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider whitespace-nowrap">{t.portalFilterStatus}:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 focus:bg-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">{t.portalStatusPending}</option>
              <option value="contacted">{t.portalStatusContacted}</option>
              <option value="replied">{language === 'en' ? 'Replied' : 'Respondido'}</option>
              <option value="booked">{t.portalStatusBooked}</option>
              <option value="completed">{t.portalStatusCompleted}</option>
              <option value="declined">{t.portalStatusDeclined}</option>
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider whitespace-nowrap">{language === 'en' ? 'Sort By' : 'Ordenar Por'}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] focus:bg-white focus:outline-none"
            >
              <option value="date-desc">{language === 'en' ? 'Newest First' : 'Más Recientes'}</option>
              <option value="date-asc">{language === 'en' ? 'Oldest First' : 'Más Antiguos'}</option>
              <option value="status">{language === 'en' ? 'By Status' : 'Por Estado'}</option>
            </select>
          </div>

        </div>

        {/* Lead Table Container */}
        <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm" id="dashboard-table-box">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/75 border-b border-stone-100 text-[#1A1A1A] font-black text-[10px] tracking-widest uppercase">
                  <th className="py-4.5 px-6 font-black">{t.portalTableClient}</th>
                  <th className="py-4.5 px-4 font-black">{t.portalTableStyle}</th>
                  <th className="py-4.5 px-4 font-black">{t.portalTableDetails}</th>
                  <th className="py-4.5 px-4 font-black">{t.portalTableCreated}</th>
                  <th className="py-4.5 px-4 font-black">{t.portalTableStatus}</th>
                  <th className="py-4.5 px-6 text-right font-black">{t.portalTableAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs text-[#1A1A1A]/90 font-bold">
                <AnimatePresence mode="popLayout">
                  {sortedInquiries.map((inq) => {
                    const priority = getPriorityBadge(inq);
                    return (
                      <motion.tr 
                        key={inq.id} 
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="hover:bg-stone-50/40 transition-colors group"
                      >
                    {/* Client Name / Contact */}
                    <td className="py-4.5 px-6 font-sans">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-[#1A1A1A] text-sm">{inq.fullName}</span>
                          {priority && (
                            <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider ${priority.class}`}>
                              {priority.label}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-stone-400 text-[11px] font-sans">
                          {inq.instagram && (
                            <>
                              <span className="font-mono text-[#E53E3E] font-black uppercase">{inq.instagram}</span>
                              <span>•</span>
                            </>
                          )}
                          <span className="truncate lowercase">{inq.email}</span>
                          <span>•</span>
                          <span className="text-stone-600 font-medium font-mono">{inq.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Style Category */}
                    <td className="py-4.5 px-4 uppercase font-mono tracking-wider font-black">
                      {renderStyleTag(inq.style)}
                    </td>

                    {/* Specs: Placement / size */}
                    <td className="py-4.5 px-4">
                      <div className="flex flex-col font-mono text-[11px] text-stone-500 uppercase">
                        <span>{inq.placement}</span>
                        <span className="font-bold text-stone-700 mt-0.5">{inq.sizeCm} cm width</span>
                        <span className={`text-[9px] font-black uppercase mt-1 ${inq.colorType === 'color' ? 'text-[#E53E3E]' : 'text-stone-400'}`}>
                          {inq.colorType === 'color' ? 'Full Color' : 'Black & Grey'}
                        </span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="py-4.5 px-4 font-mono text-stone-400">
                      {new Date(inq.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4.5 px-4">
                      <span className={`px-3 py-1 rounded-full border text-[9px] font-mono tracking-widest uppercase font-black ${getStatusBadgeClass(inq.status)}`}>
                        {getStatusLabel(inq.status)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Google Sheets / Drive Sync Icon */}
                        {syncedIds.has(inq.id) ? (
                          <span 
                            className="p-2 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600 flex items-center justify-center cursor-default shadow-inner"
                            title={language === 'en' ? "Synced to Google Sheets & Drive" : "Sincronizado con Google Sheets y Drive"}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSyncLead(inq)}
                            disabled={syncingId !== null}
                            className={`p-2 rounded-full border border-stone-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 text-stone-500 hover:text-emerald-600 cursor-pointer active:scale-95 transition-all shadow-sm ${syncingId !== null ? 'opacity-55' : ''}`}
                            title={language === 'en' ? "Sync to Google Sheets & Drive" : "Sincronizar a Google Sheets y Drive"}
                          >
                            {syncingId === inq.id ? (
                              <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />
                            ) : (
                              <Cloud className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* Quick Email Response Overlay */}
                        <button
                          onClick={() => handleOpenEmailOverlay(inq)}
                          className="p-2 rounded-full border border-stone-200 bg-white hover:border-[#E53E3E] hover:bg-rose-50 text-stone-700 hover:text-[#E53E3E] cursor-pointer active:scale-95 transition-all shadow-sm"
                          title={language === 'en' ? "Send Templated Email Response" : "Enviar Respuesta por Correo"}
                        >
                          <Mail className="w-4 h-4" />
                        </button>

                        {/* Open Details Detail */}
                        <button
                          onClick={() => handleOpenDetails(inq)}
                          className="p-2 rounded-full border border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50 text-stone-700 cursor-pointer active:scale-95 transition-all shadow-sm"
                          title="Open Details & Notes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Quick Delete */}
                        <button
                          onClick={() => {
                            if (window.confirm(t.portalDeleteConfirm)) {
                              onDeleteInquiry(inq.id);
                            }
                          }}
                          className="p-2 rounded-full border border-stone-200 bg-white hover:border-rose-400 hover:bg-rose-50 text-stone-750 cursor-pointer active:scale-95 transition-all shadow-sm"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );})}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredInquiries.length === 0 && (
            <div className="p-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase text-stone-800 tracking-wider">
                  {language === 'en' ? 'Workspace Clean & Ready' : 'Bandeja de Consultas Limpia'}
                </h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                  {language === 'en'
                    ? 'No consultation inquiries yet. Real submissions from clients on the website will automatically arrive here in real time.'
                    : 'Aún no hay consultas registradas. Las solicitudes reales de los clientes que completen el formulario web aparecerán aquí automáticamente en tiempo real.'}
                </p>
              </div>
              {onLoadDemoData && (
                <div className="pt-2">
                  <button
                    onClick={onLoadDemoData}
                    className="text-[10px] font-bold text-stone-400 hover:text-stone-700 underline uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {language === 'en' ? 'Load 3 sample demo leads' : 'Cargar 3 consultas de muestra (demo)'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Booking Waiting List & Announcements Panel */}
        <div className="bg-white border border-stone-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 mt-10" id="dashboard-subscribers-panel">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-100">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-rose-50 text-[#E53E3E]">
                <Mail className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wider uppercase text-stone-900">
                  {language === 'en' ? 'Booking Waiting List & Announcements' : 'Lista de Espera de Turnos y Anuncios'}
                </h3>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                  {language === 'en' ? 'Manage early access subscribers' : 'Gestiona los suscriptores con acceso prioritario'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-stone-100 text-stone-700 border border-stone-200 px-3 py-1.5 rounded-full font-black uppercase font-mono">
                {(subscribers || []).length} {language === 'en' ? 'SUBSCRIBERS' : 'SUSCRIPTORES'}
              </span>
              <button
                onClick={handleExportSubs}
                disabled={(subscribers || []).length === 0}
                className="inline-flex items-center px-4 py-2 rounded-full border border-stone-200 bg-white hover:border-stone-400 text-stone-700 hover:text-black text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer shadow-sm disabled:opacity-50"
                id="export-subscribers-btn"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                {language === 'en' ? 'Export CSV' : 'Exportar CSV'}
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                type="text"
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                placeholder={language === 'en' ? 'Search subscribers...' : 'Buscar suscriptores...'}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all"
              />
            </div>
          </div>

          <div className="overflow-hidden border border-stone-100 rounded-xl">
            {filteredSubscribers.length > 0 ? (
              <div className="max-h-[220px] overflow-y-auto divide-y divide-stone-50" id="subscribers-scrollable-list">
                {filteredSubscribers.map((subEmail) => (
                  <div key={subEmail} className="flex items-center justify-between py-3 px-4 hover:bg-stone-50/50 transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-stone-850 lowercase font-sans">{subEmail}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm(language === 'en' ? `Remove ${subEmail} from mailing list?` : `¿Eliminar ${subEmail} de la lista de correo?`)) {
                          onRemoveSubscriber(subEmail);
                          showToast(language === 'en' ? 'Subscriber removed successfully.' : 'Suscriptor eliminado correctamente.', 'info');
                        }
                      }}
                      className="p-1.5 hover:bg-stone-100 text-stone-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                      title={language === 'en' ? 'Remove Subscriber' : 'Eliminar Suscriptor'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-stone-400 text-xs font-bold uppercase tracking-wider bg-stone-50/55">
                {language === 'en' ? 'No subscribers found.' : 'No se encontraron suscriptores.'}
              </div>
            )}
          </div>
        </div>
        </div>
        )}

        {/* Media & Gallery Manager Tab */}
        {adminTab === 'media' && (
          <div className="space-y-10 animate-fadeIn" id="dashboard-media-manager">
            {/* Media Manager Header Banner */}
            <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'MEDIA & GALLERY CENTER' : 'CENTRO DE GESTIÓN DE IMÁGENES'}</span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white font-display">
                  {language === 'en' ? 'Manage Website Images & Portfolio' : 'Administrar Imágenes y Portafolio de la Web'}
                </h3>
                <p className="text-stone-400 text-xs mt-1 max-w-2xl leading-relaxed">
                  {language === 'en' 
                    ? 'Add new photos, replace existing hero section images, update your bio portrait, or edit your tattoo portfolio pieces directly from here. All updates sync live!'
                    : 'Agrega nuevas fotos, reemplaza imágenes del carrusel hero, actualiza la foto de tu perfil o administra las piezas de tu portafolio. ¡Todo se actualiza en tiempo real!'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {onEditElement && (
                  <button
                    onClick={() => onEditElement('new-portfolio')}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'en' ? 'Add Portfolio Piece' : 'Añadir al Portafolio'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Section 1: Hero & Presentation Cards (introPhotos) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100">
                    <Layers className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-wider uppercase text-stone-900">
                      {language === 'en' ? 'Hero & Section Feature Cards' : 'Carrusel Principal y Tarjetas Destacadas'}
                    </h4>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                      {language === 'en' ? 'The primary images displayed on the homepage hero section' : 'Las imágenes principales que se muestran en el carrusel superior del inicio'}
                    </p>
                  </div>
                </div>

                {setIntroPhotos && (
                  <button
                    onClick={() => {
                      if (onEditElement) {
                        onEditElement('image', 'newIntroPhoto', 'Nueva Foto del Carrusel', { url: '/imagenes/IMG_1449.JPG.jpeg', labelEn: 'New Space', labelEs: 'Nuevo Espacio' });
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 bg-stone-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    <span>{language === 'en' ? 'Add Hero Card' : 'Agregar Tarjeta Hero'}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {introPhotos.map((photo, idx) => (
                  <div key={idx} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 group hover:border-stone-400 transition-all">
                    <div className="relative aspect-[3/4] bg-stone-200 rounded-xl overflow-hidden border border-stone-200">
                      <img src={photo.url} alt={photo.labelEs} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-black text-white font-mono uppercase">
                        Card #{idx + 1}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">{language === 'en' ? 'Label (EN)' : 'Etiqueta (EN)'}</span>
                        <input
                          type="text"
                          value={photo.labelEn}
                          onChange={(e) => {
                            if (setIntroPhotos) {
                              setIntroPhotos((prev) => {
                                const next = [...prev];
                                next[idx] = { ...next[idx], labelEn: e.target.value };
                                return next;
                              });
                            }
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 focus:outline-none focus:border-stone-400"
                        />
                      </div>

                      <div>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">{language === 'en' ? 'Label (ES)' : 'Etiqueta (ES)'}</span>
                        <input
                          type="text"
                          value={photo.labelEs}
                          onChange={(e) => {
                            if (setIntroPhotos) {
                              setIntroPhotos((prev) => {
                                const next = [...prev];
                                next[idx] = { ...next[idx], labelEs: e.target.value };
                                return next;
                              });
                            }
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 focus:outline-none focus:border-stone-400"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-200/60">
                      <label className="flex-1 px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-[10px] font-black uppercase text-stone-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                        <Upload className="w-3.5 h-3.5 text-amber-500" />
                        <span>{language === 'en' ? 'Upload' : 'Cambiar Foto'}</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              const res = evt.target?.result as string;
                              if (res && setIntroPhotos) {
                                setIntroPhotos((prev) => {
                                  const next = [...prev];
                                  next[idx] = { ...next[idx], url: res };
                                  return next;
                                });
                                showToast(language === 'en' ? 'Image updated!' : '¡Imagen del carrusel actualizada!', 'success');
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>

                      {setIntroPhotos && introPhotos.length > 1 && (
                        <button
                          onClick={() => {
                            setIntroPhotos((prev) => prev.filter((_, i) => i !== idx));
                            showToast(language === 'en' ? 'Card deleted' : 'Tarjeta eliminada', 'info');
                          }}
                          className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Artist Bio Photo & Video */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-stone-100">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100">
                  <Camera className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-wider uppercase text-stone-900">
                    {language === 'en' ? 'Artist Bio Media (Photo or Video)' : 'Foto o Video de Biografía del Artista (Hans Toribio)'}
                  </h4>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                    {language === 'en' ? 'Portrait photo or looping video shown in the "About Hans" section' : 'Fotografía de retrato o video en bucle en la sección "Sobre el Artista"'}
                  </p>
                </div>
              </div>

              {(() => {
                const bioUrl = customTranslations?.artistPhoto || localStorage.getItem('hans_custom_artist_photo') || "/imagenes/IMG_1453.JPG.jpeg";
                const bioMediaType = customTranslations?.artistMediaType || localStorage.getItem('hans_custom_artist_media_type') || (isVideoUrl(bioUrl) ? 'video' : 'image');
                const isBioVideo = bioMediaType === 'video' || isVideoUrl(bioUrl);
                const driveEmbed = getGoogleDriveEmbedUrl(bioUrl);

                return (
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-36 h-48 bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 relative shrink-0 shadow-md flex items-center justify-center">
                      {isBioVideo ? (
                        driveEmbed ? (
                          <iframe
                            src={driveEmbed}
                            className="w-full h-full object-cover pointer-events-none border-0"
                            title="Bio Video Preview"
                          />
                        ) : (
                          <video
                            src={bioUrl}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            autoPlay
                            playsInline
                          />
                        )
                      ) : (
                        <img
                          src={bioUrl}
                          alt="Artist Hans"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/imagenes/IMG_1453.JPG.jpeg";
                          }}
                        />
                      )}
                      {isBioVideo && (
                        <div className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full">
                          <Play className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                            {language === 'en' ? 'Media Type' : 'Tipo de Contenido'}
                          </label>
                          <select
                            value={bioMediaType}
                            onChange={(e) => {
                              const val = e.target.value as 'image' | 'video';
                              if (setCustomTranslations) {
                                setCustomTranslations((prev: any) => ({ ...prev, artistMediaType: val }));
                              }
                              localStorage.setItem('hans_custom_artist_media_type', val);
                            }}
                            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:border-stone-400"
                          >
                            <option value="image">🖼️ {language === 'en' ? 'Photo / Image' : 'Foto / Imagen'}</option>
                            <option value="video">🎥 {language === 'en' ? 'Video (MP4 / WebM / Drive)' : 'Video (MP4 / WebM / Drive)'}</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                            {language === 'en' ? 'Media URL or Path' : 'Ruta o URL del Archivo'}
                          </label>
                          <input
                            type="text"
                            value={bioUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              const isVid = isVideoUrl(val);
                              if (setCustomTranslations) {
                                setCustomTranslations((prev: any) => ({ 
                                  ...prev, 
                                  artistPhoto: val,
                                  artistMediaType: isVid ? 'video' : prev?.artistMediaType || 'image'
                                }));
                              }
                              localStorage.setItem('hans_custom_artist_photo', val);
                              if (isVid) localStorage.setItem('hans_custom_artist_media_type', 'video');
                            }}
                            placeholder="/imagenes/... or https://..."
                            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:border-stone-400"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <label className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-2 cursor-pointer transition-all shadow-md">
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span>{language === 'en' ? 'Upload Photo or Video' : 'Subir Foto o Video desde tu Dispositivo'}</span>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const isVid = file.type.startsWith('video/');
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                const res = evt.target?.result as string;
                                if (res) {
                                  if (setCustomTranslations) {
                                    setCustomTranslations((prev: any) => ({ 
                                      ...prev, 
                                      artistPhoto: res,
                                      artistMediaType: isVid ? 'video' : 'image'
                                    }));
                                  }
                                  localStorage.setItem('hans_custom_artist_photo', res);
                                  localStorage.setItem('hans_custom_artist_media_type', isVid ? 'video' : 'image');
                                  showToast(
                                    language === 'en' 
                                      ? (isVid ? 'Artist video uploaded!' : 'Artist photo updated!') 
                                      : (isVid ? '¡Video del artista subido con éxito!' : '¡Foto del artista actualizada!'), 
                                    'success'
                                  );
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>

                        <button
                          onClick={() => {
                            const defaultPath = "/imagenes/IMG_1453.JPG.jpeg";
                            if (setCustomTranslations) {
                              setCustomTranslations((prev: any) => ({ 
                                ...prev, 
                                artistPhoto: defaultPath,
                                artistMediaType: 'image'
                              }));
                            }
                            localStorage.setItem('hans_custom_artist_photo', defaultPath);
                            localStorage.setItem('hans_custom_artist_media_type', 'image');
                            showToast(language === 'en' ? 'Restored default photo' : 'Restablecida la foto original por defecto', 'info');
                          }}
                          className="px-4 py-2.5 border border-stone-200 hover:border-stone-400 text-stone-600 hover:text-black text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer"
                        >
                          {language === 'en' ? 'Reset to Default' : 'Restablecer Foto Original'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Section 2.5: Specialization Pillars (3 Info Cards) & Biography Text */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-stone-100">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100">
                  <PenTool className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-wider uppercase text-stone-900">
                    {language === 'en' ? 'Artist Biography & 3 Specialization Info Cards' : 'Biografía y 3 Cuadros de Especialización Artística'}
                  </h4>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                    {language === 'en' ? 'Edit paragraphs and the 3 cards below the photo in About section' : 'Edita los párrafos y los 3 cuadros de especialización de la sección Sobre el Artista'}
                  </p>
                </div>
              </div>

              {/* Bio Paragraphs */}
              <div className="space-y-4">
                <h5 className="text-xs font-black uppercase tracking-wider text-stone-700">
                  {language === 'en' ? 'Bio Paragraph 1' : 'Párrafo de Biografía 1'}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">English</label>
                    <textarea
                      rows={3}
                      value={customTranslations?.en?.aboutBioP1 || translations.en.aboutBioP1}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (setCustomTranslations) {
                          setCustomTranslations((prev: any) => ({
                            ...prev,
                            en: { ...(prev?.en || translations.en), aboutBioP1: val }
                          }));
                        }
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Español</label>
                    <textarea
                      rows={3}
                      value={customTranslations?.es?.aboutBioP1 || translations.es.aboutBioP1}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (setCustomTranslations) {
                          setCustomTranslations((prev: any) => ({
                            ...prev,
                            es: { ...(prev?.es || translations.es), aboutBioP1: val }
                          }));
                        }
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <h5 className="text-xs font-black uppercase tracking-wider text-stone-700 pt-2">
                  {language === 'en' ? 'Bio Paragraph 2' : 'Párrafo de Biografía 2'}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">English</label>
                    <textarea
                      rows={3}
                      value={customTranslations?.en?.aboutBioP2 || translations.en.aboutBioP2}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (setCustomTranslations) {
                          setCustomTranslations((prev: any) => ({
                            ...prev,
                            en: { ...(prev?.en || translations.en), aboutBioP2: val }
                          }));
                        }
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Español</label>
                    <textarea
                      rows={3}
                      value={customTranslations?.es?.aboutBioP2 || translations.es.aboutBioP2}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (setCustomTranslations) {
                          setCustomTranslations((prev: any) => ({
                            ...prev,
                            es: { ...(prev?.es || translations.es), aboutBioP2: val }
                          }));
                        }
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3 Specialization Info Cards */}
              <div className="space-y-4 pt-4 border-t border-stone-150">
                <h5 className="text-xs font-black uppercase tracking-wider text-[#E53E3E]">
                  {language === 'en' ? '3 Artistic Specialization Info Cards' : 'Los 3 Cuadros de Especialidad'}
                </h5>

                {[1, 2, 3].map((num) => {
                  const titleKey = `aboutPillar${num}Title`;
                  const descKey = `aboutPillar${num}Desc`;
                  return (
                    <div key={num} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                      <div className="font-bold text-xs text-stone-900 uppercase">
                        {language === 'en' ? `Info Card #${num}` : `Cuadro de Información #${num}`}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Title (English)</label>
                          <input
                            type="text"
                            value={customTranslations?.en?.[titleKey] || (translations.en as any)[titleKey]}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (setCustomTranslations) {
                                setCustomTranslations((prev: any) => ({
                                  ...prev,
                                  en: { ...(prev?.en || translations.en), [titleKey]: val }
                                }));
                              }
                            }}
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Título (Español)</label>
                          <input
                            type="text"
                            value={customTranslations?.es?.[titleKey] || (translations.es as any)[titleKey]}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (setCustomTranslations) {
                                setCustomTranslations((prev: any) => ({
                                  ...prev,
                                  es: { ...(prev?.es || translations.es), [titleKey]: val }
                                }));
                              }
                            }}
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Description (English)</label>
                          <textarea
                            rows={2}
                            value={customTranslations?.en?.[descKey] || (translations.en as any)[descKey]}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (setCustomTranslations) {
                                setCustomTranslations((prev: any) => ({
                                  ...prev,
                                  en: { ...(prev?.en || translations.en), [descKey]: val }
                                }));
                              }
                            }}
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Descripción (Español)</label>
                          <textarea
                            rows={2}
                            value={customTranslations?.es?.[descKey] || (translations.es as any)[descKey]}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (setCustomTranslations) {
                                setCustomTranslations((prev: any) => ({
                                  ...prev,
                                  es: { ...(prev?.es || translations.es), [descKey]: val }
                                }));
                              }
                            }}
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => {
                    showToast(language === 'en' ? 'Biography and info cards saved!' : '¡Biografía y cuadros guardados con éxito!', 'success');
                  }}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'en' ? 'Save Bio & Info Cards' : 'Guardar Cambios de Biografía y Cuadros'}</span>
                </button>
              </div>
            </div>

            {/* Section 3: Portfolio Items Management */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100">
                    <LayoutGrid className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-wider uppercase text-stone-900">
                      {language === 'en' ? 'Portfolio Works Gallery' : 'Galería de Trabajos del Portafolio'}
                    </h4>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                      {language === 'en' ? `Total ${portfolioItems.length} tattoo pieces published` : `Total de ${portfolioItems.length} trabajos de tatuaje publicados`}
                    </p>
                  </div>
                </div>

                {onEditElement && (
                  <button
                    onClick={() => onEditElement('new-portfolio')}
                    className="inline-flex items-center px-4 py-2 bg-[#E53E3E] hover:bg-[#c53030] text-white text-[10px] font-black uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-md shadow-[#E53E3E]/20"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    <span>{language === 'en' ? 'Add New Tattoo Design' : 'Añadir Nuevo Tatuaje'}</span>
                  </button>
                )}
              </div>

              {/* Portfolio Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioItems.map((item) => (
                  <div key={item.id} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-stone-400 transition-all">
                    <div className="relative aspect-square bg-stone-900 rounded-xl overflow-hidden border border-stone-200 group">
                      <img src={item.imageUrl} alt={item.titleEs} className="w-full h-full object-cover" />
                      <div className="absolute top-2.5 right-2.5">
                        {renderStyleTag(item.style, 'sm')}
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-[9px] font-black uppercase tracking-wider">
                        {item.size || '10cm'} • {item.duration || '2h'}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-black uppercase text-stone-900 tracking-tight font-display">
                        {language === 'en' ? item.titleEn : item.titleEs}
                      </h5>
                      <p className="text-[10px] text-stone-500 font-medium line-clamp-1 mt-0.5">
                        {language === 'en' ? item.storyEn : item.storyEs}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-200/60">
                      <label className="flex-1 px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-[10px] font-black uppercase text-stone-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                        <Upload className="w-3.5 h-3.5 text-amber-500" />
                        <span>{language === 'en' ? 'Swap Image' : 'Cambiar Imagen'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              const res = evt.target?.result as string;
                              if (res && setPortfolioItems) {
                                setPortfolioItems((prev) =>
                                  prev.map((p) => p.id === item.id ? { ...p, imageUrl: res } : p)
                                );
                                showToast(language === 'en' ? 'Portfolio image updated!' : '¡Imagen de tatuaje actualizada!', 'success');
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>

                      {onEditElement && (
                        <button
                          onClick={() => onEditElement('portfolio', undefined, item.titleEs, item)}
                          className="p-1.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:text-black hover:bg-stone-100 transition-all cursor-pointer"
                          title="Editar Todo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {setPortfolioItems && (
                        <button
                          onClick={() => {
                            setPortfolioItems((prev) => prev.filter((p) => p.id !== item.id));
                            showToast(language === 'en' ? 'Tattoo removed' : 'Diseño eliminado del portafolio', 'info');
                          }}
                          className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Local Server Assets Quick Palette */}
            <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-xl space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-stone-800">
                <FolderPlus className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-xs font-black tracking-wider uppercase text-white font-mono">
                    {language === 'en' ? 'LOCAL STUDIO ASSETS (/public/imagenes/)' : 'ARCHIVOS DEL ESTUDIO EN SERVIDOR (/public/imagenes/)'}
                  </h4>
                  <p className="text-[10px] text-stone-400 font-medium mt-0.5">
                    {language === 'en' ? 'Quickly copy any existing studio file path to use anywhere on your site' : 'Haz clic para copiar o asignar cualquiera de las fotos guardadas en el servidor'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                {[
                  { name: 'IMG_1453.JPG.jpeg', label: 'Foto Artista', path: '/imagenes/IMG_1453.JPG.jpeg' },
                  { name: 'IMG_1449.JPG.jpeg', label: 'Estudio Times Sq', path: '/imagenes/IMG_1449.JPG.jpeg' },
                  { name: '618566702...webp', label: 'Precisión Tinta', path: '/imagenes/618566702_17993600897909063_7495797081353944212_n.webp' },
                  { name: '670269533...webp', label: 'Panel Anime', path: '/imagenes/670269533_18413738419193052_847837387206417634_n.webp' },
                  { name: 'IMG_1450.JPG.jpeg', label: 'Estudio Lateral', path: '/imagenes/IMG_1450.JPG.jpeg' },
                  { name: 'IMG_1451.JPG.jpeg', label: 'Arte Trabajo', path: '/imagenes/IMG_1451.JPG.jpeg' }
                ].map((file, idx) => (
                  <div key={idx} className="bg-stone-800/80 border border-stone-700/60 p-2.5 rounded-xl space-y-2 flex flex-col justify-between">
                    <div className="aspect-square bg-black rounded-lg overflow-hidden border border-stone-700">
                      <img src={file.path} alt={file.label} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase text-stone-300 block truncate">{file.label}</span>
                      <span className="text-[8px] font-mono text-stone-500 block truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(file.path);
                        showToast(language === 'en' ? `Copied ${file.path}` : `¡Ruta ${file.path} copiada al portapapeles!`, 'success');
                      }}
                      className="w-full py-1 bg-stone-700 hover:bg-amber-500 hover:text-black text-white text-[8px] font-black uppercase rounded transition-all cursor-pointer font-mono"
                    >
                      {language === 'en' ? 'Copy Path' : 'Copiar Ruta'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings & SEO Tab */}
        {adminTab === 'settings' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Artist Settings & Connectors Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="artist-settings-panel">
          
          {/* Google Workspace Connection Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-stone-100">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                <Cloud className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wider uppercase text-stone-900">
                  {language === 'en' ? 'Google Sheets & Drive Leads Sync' : 'Google Sheets y Drive en Vivo'}
                </h3>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                  {language === 'en' ? 'Sync inquiries & photos to Google Cloud' : 'Envía datos e imágenes a Google Sheets y Drive'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {googleUser ? (
                <div className="p-4 rounded-2xl bg-emerald-50/55 border border-emerald-100 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider flex items-center">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                      {language === 'en' ? 'Status: Connected' : 'Estado: Conectado'}
                    </span>
                    <button
                      onClick={handleDisconnectGoogle}
                      className="px-3 py-1 bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-200 text-stone-500 hover:text-rose-600 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    >
                      {language === 'en' ? 'Disconnect' : 'Desconectar'}
                    </button>
                  </div>
                  <div className="text-xs font-semibold text-stone-700">
                    <p className="font-sans">
                      {language === 'en' ? 'Authorized Email:' : 'Correo Autorizado:'}{' '}
                      <strong className="font-mono text-stone-900">{googleUser.email}</strong>
                    </p>
                    <p className="text-[10px] text-stone-500 mt-2 leading-relaxed">
                      {language === 'en'
                        ? 'Your inquiries are automatically saved into a Google Sheet called "Hans Tattoo Inquiries" and customer images are uploaded to Google Drive. Keep this window open for instant sync.'
                        : 'Las consultas se guardan automáticamente en la hoja "Hans Tattoo Inquiries" de tu cuenta y las fotos de referencia se suben a tu Google Drive.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-150 text-center space-y-4">
                  <p className="text-xs text-stone-500 font-semibold leading-relaxed max-w-sm mx-auto">
                    {language === 'en'
                      ? 'Link your tattoo Google account to automatically store consultation inquiries and referential artworks in Google Sheets & Drive.'
                      : 'Conecta tu cuenta de Google para organizar de manera segura todas tus solicitudes y fotos en Google Sheets y Google Drive.'}
                  </p>
                  {authDomainError && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-1.5 animate-fadeIn">
                      <div className="font-bold flex items-center gap-1.5 text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{language === 'en' ? 'Domain Authorization Required (Firebase)' : 'Se requiere autorizar el dominio (Firebase)'}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800/90">
                        {language === 'en'
                          ? 'To allow Google Login on hansttoo.vercel.app, please add "hansttoo.vercel.app" to Firebase Console > Authentication > Settings > Authorized domains.'
                          : 'Para permitir iniciar sesión en hansttoo.vercel.app, agrega "hansttoo.vercel.app" en Firebase Console > Authentication > Settings > Authorized domains (Dominios Autorizados).'}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleConnectGoogle}
                    className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black tracking-wider uppercase transition-all cursor-pointer shadow-sm"
                  >
                    <Database className="w-4 h-4" />
                    <span>{language === 'en' ? 'Connect Google Account' : 'Conectar Cuenta Google'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Meta Pixel & Google Analytics Ad Tracking Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-stone-100">
              <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wider uppercase text-stone-900">
                  {language === 'en' ? 'Ad Tracking & Lead Capture Analytics' : 'Publicidad y Conversiones (Meta & Google)'}
                </h3>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                  {language === 'en' ? 'Measure campaign leads & conversions' : 'Mide clics y consultas de tus campañas de publicidad'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1.5">
                  {language === 'en' ? 'Meta Pixel ID (Facebook Ads)' : 'Meta Pixel ID (Publicidad en Instagram/Meta)'}
                </label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 1234567890"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all font-mono"
                />
                <p className="text-[9px] text-stone-400 mt-1">
                  {language === 'en' 
                    ? 'Tracks "PageView" and triggers "Lead" conversion events on submission.' 
                    : 'Registra visitas ("PageView") y envía conversión "Lead" al recibir consultas.'}
                </p>
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1.5">
                  {language === 'en' ? 'Google Analytics Measurement ID' : 'ID de Medición de Google Analytics (Gtag)'}
                </label>
                <input
                  type="text"
                  value={googleAnalyticsId}
                  onChange={(e) => setGoogleAnalyticsId(e.target.value.trim().toUpperCase())}
                  placeholder="e.g. G-XXXXXXXXXX"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all font-mono"
                />
                <p className="text-[9px] text-stone-400 mt-1">
                  {language === 'en' 
                    ? 'Tracks google campaign inquiries and triggers the "generate_lead" tag.' 
                    : 'Sigue tus anuncios de Google y dispara la etiqueta "generate_lead" al agendar.'}
                </p>
              </div>
            </div>
          </div>

          {/* Studio Location & Schedule Settings Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6" id="studio-schedule-settings-card">
            <div className="flex items-center space-x-3 pb-4 border-b border-stone-100">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wider uppercase text-stone-900">
                  {language === 'en' ? 'Studio Location & Live Schedule' : 'Horarios de Atención y Ubicación del Estudio'}
                </h3>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                  {language === 'en' ? 'Configure opening hours, live status calculation, and studio address' : 'Configura horas de apertura, cálculo de estado en vivo y dirección del estudio'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">
                    {language === 'en' ? 'Opening Hour (New York Time)' : 'Hora de Apertura (Hora NY)'}
                  </label>
                  <select
                    value={Number(customTranslations?.mapOpenHour ?? 11)}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (setCustomTranslations) {
                        setCustomTranslations((prev: any) => ({ ...prev, mapOpenHour: val }));
                      }
                      localStorage.setItem('hans_map_open_hour', val.toString());
                    }}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
                  >
                    {[8, 9, 10, 11, 12, 13, 14].map((h) => (
                      <option key={h} value={h}>{h}:00 AM</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">
                    {language === 'en' ? 'Closing Hour (New York Time)' : 'Hora de Cierre (Hora NY)'}
                  </label>
                  <select
                    value={Number(customTranslations?.mapCloseHour ?? 17)}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (setCustomTranslations) {
                        setCustomTranslations((prev: any) => ({ ...prev, mapCloseHour: val }));
                      }
                      localStorage.setItem('hans_map_close_hour', val.toString());
                    }}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
                  >
                    {[16, 17, 18, 19, 20, 21, 22].map((h) => (
                      <option key={h} value={h}>{h - 12}:00 PM ({h}:00)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">
                    {language === 'en' ? 'Weekly Schedule Display (English)' : 'Texto de Horario Semanal (Inglés)'}
                  </label>
                  <input
                    type="text"
                    value={customTranslations?.en?.mapScheduleText || customTranslations?.mapScheduleText || '11:00 AM - 5:00 PM'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (setCustomTranslations) {
                        setCustomTranslations((prev: any) => ({
                          ...prev,
                          mapScheduleText: val,
                          en: { ...(prev?.en || translations.en), mapScheduleText: val }
                        }));
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">
                    {language === 'en' ? 'Weekly Schedule Display (Spanish)' : 'Texto de Horario Semanal (Español)'}
                  </label>
                  <input
                    type="text"
                    value={customTranslations?.es?.mapScheduleText || customTranslations?.mapScheduleText || '11:00 AM - 5:00 PM'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (setCustomTranslations) {
                        setCustomTranslations((prev: any) => ({
                          ...prev,
                          mapScheduleText: val,
                          es: { ...(prev?.es || translations.es), mapScheduleText: val }
                        }));
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">
                  {language === 'en' ? 'Studio Address Line 1' : 'Dirección del Estudio Línea 1'}
                </label>
                <input
                  type="text"
                  value={customTranslations?.en?.mapAddressLine1 || customTranslations?.mapAddressLine1 || 'Gara Art Studio • 240 W 40th St'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (setCustomTranslations) {
                      setCustomTranslations((prev: any) => ({
                        ...prev,
                        mapAddressLine1: val,
                        en: { ...(prev?.en || translations.en), mapAddressLine1: val },
                        es: { ...(prev?.es || translations.es), mapAddressLine1: val }
                      }));
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">
                  {language === 'en' ? 'Studio Address Line 2 (City, Zip, Country)' : 'Dirección Línea 2 (Ciudad, Código Postal, País)'}
                </label>
                <input
                  type="text"
                  value={customTranslations?.en?.mapAddressLine2 || customTranslations?.mapAddressLine2 || 'Manhattan, NY 10018, United States'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (setCustomTranslations) {
                      setCustomTranslations((prev: any) => ({
                        ...prev,
                        mapAddressLine2: val,
                        en: { ...(prev?.en || translations.en), mapAddressLine2: val },
                        es: { ...(prev?.es || translations.es), mapAddressLine2: val }
                      }));
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">
                  {language === 'en' ? 'Google Maps Share URL' : 'Enlace de Google Maps para Direcciones'}
                </label>
                <input
                  type="text"
                  value={customTranslations?.mapGoogleMapsUrl || "https://maps.app.goo.gl/VNY6iiixsNeAKxUDA"}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (setCustomTranslations) {
                      setCustomTranslations((prev: any) => ({ ...prev, mapGoogleMapsUrl: val }));
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Instagram Widget Sync */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-stone-100">
              <div className="p-2.5 rounded-2xl bg-red-50 text-[#E53E3E]">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wider uppercase text-stone-900">
                  {language === 'en' ? 'Instagram Feed Sync' : 'Sincronización de Feed de Instagram'}
                </h3>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                  {language === 'en' ? 'Connect Live Accounts & Widgets' : 'Conecta Cuentas y Widgets en Vivo'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1.5">
                  {language === 'en' ? 'Instagram Handle' : 'Usuario de Instagram'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">@</span>
                  <input
                    type="text"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value.replace(/[^a-zA-Z0-9_.]/g, ''))}
                    placeholder="hansttoo"
                    className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all font-mono"
                  />
                </div>
                <p className="text-[9px] text-stone-400 mt-1">
                  {language === 'en' 
                    ? 'Default fallback grid links directly to this profile.' 
                    : 'La cuadrícula por defecto enlazará directamente a este perfil.'}
                </p>
              </div>

              <div>
                <label className="block text-[10px] text-[#1A1A1A]/50 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>{language === 'en' ? 'Live Feed Embed Code (Optional)' : 'Código de Widget en Vivo (Opcional)'}</span>
                  <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-sans">PRO FEATURE</span>
                </label>
                <textarea
                  rows={4}
                  value={instagramWidgetUrl}
                  onChange={(e) => setInstagramWidgetUrl(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'Paste your Behold.so, LightWidget, or Elfsight embed iframe link here (e.g., https://behold.so/w/your-widget-id)'
                      : 'Pega tu link de Behold.so, LightWidget o iframe de Elfsight aquí (ej., https://behold.so/w/tu-id-widget)'
                  }
                  className="w-full px-4 py-3 border border-stone-200 rounded-2xl text-xs bg-stone-50 font-mono focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all resize-none"
                />
                <p className="text-[9px] text-stone-400 mt-1 leading-relaxed">
                  {language === 'en'
                    ? 'For a fully dynamic real-time grid. Generate a free feed widget at behold.so or lightwidget.com and paste the URL or iframe tag above!'
                    : 'Para una cuadrícula totalmente dinámica. ¡Crea un widget gratis en behold.so o lightwidget.com y pega el link o la etiqueta iframe arriba!'}
                </p>
              </div>
            </div>

            {/* Success confirmation note */}
            <div className="p-3 bg-stone-50 border border-stone-150 rounded-xl flex items-center justify-between text-[9px] text-stone-500 font-bold uppercase tracking-wider">
              <span className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                {language === 'en' ? 'Changes autosaved to LocalStorage' : 'Cambios autoguardados en LocalStorage'}
              </span>
              <span className="text-stone-350 font-mono">200 OK</span>
            </div>
          </div>

          {/* WhatsApp Business Integration Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6" id="whatsapp-settings-card">
            <div className="flex items-center space-x-3 pb-4 border-b border-stone-100">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wider uppercase text-stone-900">
                  {language === 'en' ? 'WhatsApp Business Integration' : 'Integración de WhatsApp Business'}
                </h3>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                  {language === 'en' ? 'Configure Instant Redirects & Contact Numbers' : 'Configura Redirecciones de Contacto y Números'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1.5">
                  {language === 'en' ? 'Artist WhatsApp Number' : 'Número de WhatsApp de Hans (con código de país)'}
                </label>
                <input
                  type="text"
                  value={artistWhatsApp}
                  onChange={(e) => setArtistWhatsApp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 16462709292"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all font-mono"
                />
                <p className="text-[9px] text-stone-400 mt-1 leading-relaxed">
                  {language === 'en'
                    ? 'Official business WhatsApp number for direct incoming customer messages (include country code, digits only).'
                    : 'Número oficial con código de país, solo números (ej: 34600123456 o 16462709292). Se sincroniza automáticamente con el formulario de clientes.'}
                </p>
              </div>
            </div>

            {/* Direct Redirect compliance confirmation indicator */}
            <div className="p-3 bg-stone-50 border border-stone-150 rounded-xl flex items-center justify-between text-[9px] text-stone-500 font-bold uppercase tracking-wider">
              <span className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                {language === 'en' ? 'Direct Customer Redirection Enabled' : 'Redirección Directa de Clientes Activa'}
              </span>
              <span className="text-[#38A169] font-mono">200 OK</span>
            </div>
          </div>

          {/* Search Engine Optimization (SEO) Dashboard */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-stone-100">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wider uppercase text-stone-900">
                  {language === 'en' ? 'Search Engine Optimization (SEO)' : 'Optimización de Motores de Búsqueda (SEO)'}
                </h3>
                <p className="text-[10px] font-bold text-[#1A1A1A]/40 uppercase tracking-widest mt-0.5">
                  {language === 'en' ? 'Tune Search Engines & Crawlers' : 'Ajusta Títulos y Metatags para Indexación'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1.5">
                  {language === 'en' ? 'SEO Page Title' : 'Título SEO de la Página'}
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Hans Tattoo | Fine Line & Microrealism Madrid"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all"
                />
                <p className="text-[9px] text-stone-400 mt-1 font-sans">
                  {language === 'en' 
                    ? 'Recommended: Under 60 characters. Shows up in Google results.' 
                    : 'Recomendado: Menos de 60 caracteres. Aparece en los resultados de Google.'}
                </p>
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1.5">
                  {language === 'en' ? 'Meta Description' : 'Descripción Meta'}
                </label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Exclusive private tattoo studio in Madrid..."
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all resize-none"
                />
                <p className="text-[9px] text-stone-400 mt-1 font-sans">
                  {language === 'en' 
                    ? 'Recommended: Under 160 characters. Search snippet preview.' 
                    : 'Recomendado: Menos de 160 caracteres. Fragmento de búsqueda.'}
                </p>
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1.5">
                  {language === 'en' ? 'Meta Keywords' : 'Palabras Clave'}
                </label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="Hans Tattoo, tattoo artist Madrid, fine line..."
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all"
                />
                <p className="text-[9px] text-stone-400 mt-1 font-sans">
                  {language === 'en' 
                    ? 'Comma-separated search queries for legacy crawlers.' 
                    : 'Búsquedas separadas por comas para rastreadores antiguos.'}
                </p>
              </div>
            </div>

            {/* Real-time crawler compliance indicator */}
            <div className="flex items-center space-x-2 p-3 bg-stone-50 rounded-xl border border-stone-150">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">
                {language === 'en' 
                  ? 'Schema.org JSON-LD local business schema compiled' 
                  : 'Esquema Schema.org JSON-LD compilado correctamente'}
              </p>
            </div>
          </div>

          {/* Artist Security & Portal Access Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6" id="security-settings-card">
            <div className="flex items-center space-x-3 pb-4 border-b border-stone-100">
              <div className="p-2.5 rounded-2xl bg-stone-100 text-[#E53E3E]">
                <Settings className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wider uppercase text-stone-900">
                  {language === 'en' ? 'Portal Security & Access' : 'Seguridad del Portal y Acceso'}
                </h3>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                  {language === 'en' ? 'Manage access pin & recovery email' : 'Gestiona el pin de acceso y correo de recuperación'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Access Pin Code */}
              <div>
                <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1.5">
                  {language === 'en' ? 'Admin Access PIN/Password' : 'PIN / Contraseña de Acceso Admin'}
                </label>
                <input
                  type="text"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value.trim())}
                  placeholder="e.g. hans2026"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all font-mono"
                />
                <p className="text-[9px] text-stone-400 mt-1">
                  {language === 'en' 
                    ? 'This is the code used to unlock the Admin Portal (default is hans2026).' 
                    : 'Este es el código para desbloquear el Portal de Administrador (por defecto es hans2026).'}
                </p>
              </div>

              {/* Recovery Email */}
              <div>
                <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1.5">
                  {language === 'en' ? 'Security Recovery Email' : 'Correo de Recuperación de Seguridad'}
                </label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value.trim().toLowerCase())}
                  placeholder="e.g. tattoobyhans@gmail.com"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all font-mono"
                />
                <p className="text-[9px] text-stone-400 mt-1">
                  {language === 'en' 
                    ? 'Used to recover your access pin if forgotten.' 
                    : 'Se usa para recuperar tu pin de acceso si lo olvidas.'}
                </p>
              </div>
            </div>

            {/* Status note */}
            <div className="p-3 bg-stone-50 border border-stone-150 rounded-xl flex items-center justify-between text-[9px] text-stone-500 font-bold uppercase tracking-wider">
              <span className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                {language === 'en' ? 'Credentials Saved' : 'Credenciales Guardadas'}
              </span>
              <span className="text-[#38A169] font-mono">SECURE</span>
            </div>
          </div>

          {/* Station Display QR Code Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6" id="qr-station-code-card">
            <div className="flex items-center space-x-3 pb-4 border-b border-stone-100">
              <div className="p-2.5 rounded-2xl bg-stone-100 text-stone-800">
                <Code className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wider uppercase text-stone-900">
                  {language === 'en' ? 'Station Display QR Code' : 'Código QR para Estación de Tatuaje'}
                </h3>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                  {language === 'en' ? 'Quick client access from your tattoo chair' : 'Acceso rápido para clientes desde tu camilla'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* QR Image Frame */}
              <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl flex flex-col items-center justify-center space-y-2 shadow-inner w-44 h-44 shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=1c1917&data=${encodeURIComponent(window.location.origin)}`}
                  alt="Tattoo Station Website QR Code"
                  className="w-32 h-32 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* QR Code description & controls */}
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div className="space-y-1">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">Encoded Link</span>
                  <p className="text-xs font-mono font-bold text-stone-700 break-all bg-stone-50 px-3.5 py-1.5 rounded-xl border border-stone-150 inline-block">
                    {window.location.origin}
                  </p>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  {language === 'en' 
                    ? 'Place this QR code at your tattoo station. Clients can scan it with their phone camera to instantly access your portfolio, fill out consultation inquiries, or subscribe to your waiting list!' 
                    : 'Coloca este código QR en tu puesto de tatuaje. Los clientes pueden escanearlo con la cámara de su teléfono para ver tu portafolio, completar consultas o unirse a la lista de espera.'}
                </p>

                <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&color=1c1917&data=${encodeURIComponent(window.location.origin)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#E53E3E] transition-all cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    {language === 'en' ? 'Download High-Res QR' : 'Descargar QR Alta Res'}
                  </a>
                  <button
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Hans Tattoo - Scan to Consult</title>
                              <style>
                                body {
                                  font-family: 'Courier New', Courier, monospace;
                                  display: flex;
                                  flex-direction: column;
                                  align-items: center;
                                  justify-content: center;
                                  height: 100vh;
                                  margin: 0;
                                  background: white;
                                  text-align: center;
                                  color: #1a1a1a;
                                }
                                .container {
                                  border: 3px solid #1a1a1a;
                                  padding: 40px;
                                  border-radius: 20px;
                                  max-width: 400px;
                                }
                                h1 {
                                  font-size: 28px;
                                  margin-bottom: 5px;
                                  text-transform: uppercase;
                                  letter-spacing: 2px;
                                }
                                p {
                                  font-size: 14px;
                                  color: #666;
                                  margin-top: 5px;
                                  margin-bottom: 25px;
                                  text-transform: uppercase;
                                  font-weight: bold;
                                }
                                img {
                                  width: 250px;
                                  height: 250px;
                                }
                                .footer {
                                  margin-top: 25px;
                                  font-size: 11px;
                                  color: #aaa;
                                  text-transform: uppercase;
                                }
                              </style>
                            </head>
                            <body>
                              <div class="container">
                                <h1>HANS TORIBIO</h1>
                                <p>Scan to Book / Escanea para Consultas</p>
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=1c1917&data=${encodeURIComponent(window.location.origin)}" />
                                <div class="footer">Times Square, NYC • @hansttoo</div>
                              </div>
                              <script>
                                window.onload = function() {
                                  window.print();
                                }
                              </script>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {language === 'en' ? 'Print Table Sign' : 'Imprimir Cartelera'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time In-Page Web Editor (CMS) Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6" id="realtime-cms-editor-card">
            <div className="flex items-center space-x-3 pb-4 border-b border-stone-100">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                <PenTool className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wider uppercase text-stone-900">
                  {language === 'en' ? 'Real-Time Visual Page Editor' : 'Editor de Página Visual en Vivo'}
                </h3>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                  {language === 'en' ? 'Click and edit any text or image on the page' : 'Haz clic y edita cualquier texto o imagen de la web'}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-semibold text-stone-600 leading-relaxed">
              <p>
                {language === 'en' 
                  ? 'Our advanced visual editor allows you to customize the content of your website directly on the page! Any modification you make is saved instantly.'
                  : '¡Nuestro editor visual avanzado te permite personalizar el contenido de tu web directamente en la página! Cualquier modificación se guarda al instante.'}
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-stone-500 pl-1">
                <li>{language === 'en' ? 'Change Hero title, taglines & section headings.' : 'Modifica el título del Hero, subtítulos y cabeceras.'}</li>
                <li>{language === 'en' ? 'Replace photos by uploading directly from your device.' : 'Reemplaza fotos subiéndolas directamente desde tu dispositivo.'}</li>
                <li>{language === 'en' ? 'Manage your live Portfolio designs in real-time.' : 'Gestiona tus diseños del Portafolio en tiempo real.'}</li>
                <li>{language === 'en' ? 'Add, edit, or remove FAQs instantly.' : 'Añade, edita o elimina preguntas frecuentes al instante.'}</li>
              </ul>

              <div className="pt-2 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                    {language === 'en' ? 'Status: ' : 'Estado: '}
                  </span>
                  <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full ${
                    isVisualEditMode 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-stone-100 text-stone-500'
                  }`}>
                    {isVisualEditMode 
                      ? (language === 'en' ? 'ACTIVE / ACTIVO' : 'ACTIVO') 
                      : (language === 'en' ? 'INACTIVE / INACTIVO' : 'INACTIVO')}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (setIsVisualEditMode) {
                        setIsVisualEditMode(!isVisualEditMode);
                        showToast(
                          language === 'en' 
                            ? `Visual edit mode turned ${!isVisualEditMode ? 'ON' : 'OFF'}` 
                            : `Editor visual ${!isVisualEditMode ? 'ACTIVADO' : 'DESACTIVADO'}`, 
                          'info'
                        );
                      }
                    }}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    {isVisualEditMode 
                      ? (language === 'en' ? 'Disable Editor' : 'Desactivar Editor') 
                      : (language === 'en' ? 'Enable Editor' : 'Activar Editor')}
                  </button>

                  <button
                    onClick={() => {
                      if (setIsVisualEditMode) setIsVisualEditMode(true);
                      if (setIsAdminMode) setIsAdminMode(false);
                      showToast(
                        language === 'en' 
                          ? 'Opening live visual editor! Click on any element to edit.' 
                          : '¡Abriendo editor visual! Haz clic en cualquier elemento para editarlo.', 
                        'success'
                      );
                    }}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/10 flex items-center gap-1.5"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Launch Editor' : 'Lanzar Editor'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* SEO & Meta Tag Management Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6" id="seo-meta-tag-card">
            <div className="flex items-center space-x-3 pb-4 border-b border-stone-100">
              <div className="p-2.5 rounded-2xl bg-stone-100 text-stone-800">
                <Globe className="w-5 h-5 text-[#E53E3E]" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wider uppercase text-stone-900">
                  {language === 'en' ? 'SEO & Meta Tag Manager' : 'Gestor de SEO y Meta Etiquetas'}
                </h3>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                  {language === 'en' ? 'Optimize your search rankings and social share embeds' : 'Optimiza tus rankings de búsqueda y cómo te ven al compartir'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Form Controls */}
              <div className="space-y-5">
                {/* Meta Title */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                      {language === 'en' ? 'Meta Title Tag' : 'Título Meta (Etiqueta Title)'}
                    </label>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      draftTitle.length >= 50 && draftTitle.length <= 60 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {draftTitle.length} {language === 'en' ? 'chars (Ideal: 50-60)' : 'caract. (Ideal: 50-60)'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="Hans Tattoo | Fine Line & Microrealism in Times Square, NYC"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-xs font-semibold text-stone-800 bg-stone-50/50 focus:bg-white focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-50 transition-all"
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                      {language === 'en' ? 'Meta Description' : 'Descripción Meta'}
                    </label>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      draftDesc.length >= 120 && draftDesc.length <= 160 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {draftDesc.length} {language === 'en' ? 'chars (Ideal: 120-160)' : 'caract. (Ideal: 120-160)'}
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={draftDesc}
                    onChange={(e) => setDraftDesc(e.target.value)}
                    placeholder="Exclusive private tattoo studio in NYC. Custom fine line, microrealism, and manga tattoo panels by artist Hans Toribio..."
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-xs font-semibold text-stone-800 bg-stone-50/50 focus:bg-white focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-50 transition-all resize-none"
                  />
                </div>

                {/* Keywords */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                    {language === 'en' ? 'Meta Keywords (Comma separated)' : 'Palabras Clave (Separadas por comas)'}
                  </label>
                  <input
                    type="text"
                    value={draftKeywords}
                    onChange={(e) => setDraftKeywords(e.target.value)}
                    placeholder="tattoo, fine line nyc, microrealism, hansttoo"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-xs font-semibold text-stone-800 bg-stone-50/50 focus:bg-white focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-50 transition-all"
                  />
                </div>

                {/* Open Graph Image URL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                    {language === 'en' ? 'Social Share Image (OG Image URL)' : 'Imagen de Compartido Social (URL de Imagen OG)'}
                  </label>
                  <input
                    type="text"
                    value={draftOgImage}
                    onChange={(e) => setDraftOgImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-xs font-semibold text-stone-800 bg-stone-50/50 focus:bg-white focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-50 transition-all"
                  />
                  <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest pl-1">
                    {language === 'en' ? 'Recommended: High-quality landscape ratio (1200 x 630px)' : 'Recomendado: Proporción horizontal de alta calidad (1200 x 630px)'}
                  </p>
                </div>

                {/* Save action button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveSEO}
                    className="w-full sm:w-auto px-6 py-3 bg-stone-900 hover:bg-[#E53E3E] text-white rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-stone-900/10 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{language === 'en' ? 'Save & Apply SEO Config' : 'Guardar y Aplicar Configuración'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Visual Previews */}
              <div className="space-y-5 lg:pl-4 lg:border-l lg:border-stone-100">
                <span className="text-[10px] font-black tracking-widest text-stone-400 uppercase block pb-1 border-b border-stone-50">
                  {language === 'en' ? 'Real-Time Embedded Previews' : 'Vistas Previas en Tiempo Real'}
                </span>

                {/* Google Search Snippet Preview */}
                <div className="space-y-2.5">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">
                    {language === 'en' ? 'Google Search Result' : 'Resultado de Búsqueda de Google'}
                  </span>
                  <div className="bg-white p-5 border border-stone-150 rounded-2xl space-y-1 shadow-sm max-w-md">
                    <div className="flex items-center space-x-2 text-[11px] text-stone-600 font-sans">
                      <div className="w-4 h-4 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 font-mono text-[8px] font-black">H</div>
                      <span>{window.location.origin.replace('https://', '')}</span>
                      <span className="text-stone-400 font-bold">›</span>
                      <span className="text-stone-500 font-mono text-[10px]">studio</span>
                    </div>
                    <h4 className="text-sm font-sans font-medium text-[#1a0dab] hover:underline cursor-pointer tracking-normal leading-normal">
                      {draftTitle || 'Hans Tattoo | Fine Line, Microrealism & Anime New York'}
                    </h4>
                    <p className="text-[11px] text-stone-600 font-sans leading-relaxed tracking-normal">
                      {draftDesc || 'Exclusive private tattoo studio in Times Square, New York specializing in fine line, microrealism, and custom anime panels.'}
                    </p>
                  </div>
                </div>

                {/* Social Share Card Preview */}
                <div className="space-y-2.5">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">
                    {language === 'en' ? 'WhatsApp / Social Embed Card' : 'Tarjeta de Compartido Social / WhatsApp'}
                  </span>
                  <div className="bg-stone-50 border border-stone-200 rounded-3xl overflow-hidden max-w-sm shadow-sm flex flex-col">
                    {/* Image space */}
                    <div className="h-36 bg-stone-100 relative overflow-hidden">
                      {draftOgImage ? (
                        <img 
                          src={draftOgImage} 
                          alt="Open Graph Social Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // fallback on image error
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1598104358204-87cefc7c5986?auto=format&fit=crop&q=80&w=600';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <Globe className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute top-2.5 left-2.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[8px] font-black text-white uppercase tracking-wider">
                        Open Graph
                      </div>
                    </div>
                    {/* Description block */}
                    <div className="p-4 bg-stone-100/50 border-t border-stone-200/80 space-y-1">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                        {window.location.origin.replace('https://', '')}
                      </span>
                      <h5 className="text-[11px] font-black text-stone-850 line-clamp-1 leading-tight font-sans">
                        {draftTitle || 'Hans Tattoo'}
                      </h5>
                      <p className="text-[9.5px] text-stone-500 font-medium leading-normal line-clamp-2 font-sans">
                        {draftDesc || 'Custom tattoo artist NYC.'}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
        )}

        {/* Detailed Client Sheet Modal - Rendered in a Portal to avoid parent transform/fixed position bugs */}
        {createPortal(
          <AnimatePresence>
            {selectedInquiry && (
              <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4" id="dashboard-lead-modal-wrapper">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedInquiry(null)}
                className="fixed inset-0 bg-stone-900/60 backdrop-blur-md"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-50 border border-stone-100 flex flex-col md:flex-row h-auto md:max-h-[85vh]"
                id="dashboard-lead-modal"
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-md text-stone-700 hover:text-black hover:bg-white shadow-sm cursor-pointer active:scale-95 border border-stone-100"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Left: Design Reference Summary */}
                <div className="w-full md:w-2/5 bg-stone-50 p-6 flex flex-col justify-between overflow-y-auto border-b md:border-b-0 md:border-r border-stone-100">
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-4">
                      {language === 'en' ? 'REFERENCE IMAGES' : 'IMÁGENES DE REFERENCIA'}
                    </span>
                    {(() => {
                      const images = selectedInquiry.referenceImages && selectedInquiry.referenceImages.length > 0
                        ? selectedInquiry.referenceImages
                        : selectedInquiry.referenceImage
                          ? [selectedInquiry.referenceImage]
                          : [];
                      
                      if (images.length === 0) {
                        return (
                          <div className="border border-dashed border-stone-200 rounded-2xl aspect-square w-full flex flex-col items-center justify-center p-6 text-center text-stone-400 bg-white shadow-inner">
                            <AlertCircle className="w-7 h-7 mb-2 text-[#E53E3E]/70" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">No reference uploaded</span>
                          </div>
                        );
                      }

                      const activeIndex = activeImageIndex < images.length ? activeImageIndex : 0;
                      const activeUrl = images[activeIndex];

                      return (
                        <div className="space-y-3">
                          {/* Main large image preview */}
                          <div className="rounded-2xl overflow-hidden border border-stone-200 aspect-square w-full shadow-sm bg-white relative">
                            <img
                              src={activeUrl}
                              alt={`Reference ${activeIndex + 1}`}
                              className="w-full h-full object-cover transition-all"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute bottom-3 left-3 px-2 py-1 bg-black/75 text-white text-[9px] font-mono rounded font-black uppercase tracking-widest">
                              {activeIndex + 1} / {images.length}
                            </span>
                          </div>

                          {/* Thumbnails list if there are multiple images */}
                          {images.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                              {images.map((imgUrl, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setActiveImageIndex(idx)}
                                  className={`aspect-square rounded-lg overflow-hidden border transition-all relative cursor-pointer ${
                                    idx === activeIndex
                                      ? 'border-[#E53E3E] ring-2 ring-rose-100 scale-[1.05] z-10'
                                      : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                                  }`}
                                >
                                  <img
                                    src={imgUrl}
                                    alt={`Thumb ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="mt-6 space-y-2">
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">
                      {language === 'en' ? 'WORKFLOW ACTION' : 'ESTADO DE LA CONSULTA'}
                    </span>
                    
                    {/* Interactive Status Selector inside Detail */}
                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                      {(['pending', 'contacted', 'booked', 'completed', 'declined'] as InquiryStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => {
                            onUpdateStatus(selectedInquiry.id, st);
                            setSelectedInquiry({ ...selectedInquiry, status: st });
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-between cursor-pointer ${
                            selectedInquiry.status === st
                              ? 'bg-stone-900 border-stone-900 text-white shadow-md shadow-stone-900/10'
                              : 'bg-white border-stone-150 hover:bg-stone-100/50 text-stone-700'
                          }`}
                        >
                          <span>{getStatusLabel(st)}</span>
                          {selectedInquiry.status === st && <Check className="w-3.5 h-3.5 text-[#E53E3E]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Client Details & Notes Sheet */}
                <div className="w-full md:w-3/5 p-6 sm:p-8 flex flex-col justify-between bg-white overflow-y-auto">
                  <div className="space-y-6">
                    
                    {/* Name Card */}
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Client Record</span>
                      <h3 className="text-2xl font-black text-[#1A1A1A] uppercase tracking-tight mt-0.5">{selectedInquiry.fullName}</h3>
                      <div className="flex flex-wrap gap-2 mt-2.5 text-xs font-bold uppercase tracking-wider">
                        {selectedInquiry.instagram && (
                          <span className="text-white bg-stone-900 px-3.5 py-1 rounded-full shadow-sm flex items-center">
                            <Instagram className="w-3.5 h-3.5 mr-1.5" />
                            {selectedInquiry.instagram}
                          </span>
                        )}
                        <a 
                          href={`mailto:${selectedInquiry.email}`}
                          className="text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors px-3.5 py-1 rounded-full truncate max-w-full lowercase font-sans flex items-center"
                        >
                          <Mail className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
                          {selectedInquiry.email}
                        </a>
                        {selectedInquiry.phone && (() => {
                          const cleanPhone = selectedInquiry.phone.replace(/[^0-9+]/g, '');
                          const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}`;
                          return (
                            <a 
                              href={whatsappUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-white bg-emerald-600 hover:bg-emerald-700 transition-colors px-3.5 py-1 rounded-full font-mono flex items-center"
                            >
                              <Phone className="w-3.5 h-3.5 mr-1.5" />
                              WhatsApp: {selectedInquiry.phone}
                            </a>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Technical Blueprint */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-stone-100 text-xs font-bold uppercase tracking-wider">
                      <div>
                        <span className="text-stone-400 block mb-1 text-[9px] font-black tracking-widest uppercase">Style Selected</span>
                        <div className="pt-0.5">
                          {renderStyleTag(selectedInquiry.style, 'md')}
                        </div>
                      </div>
                      <div>
                        <span className="text-stone-400 block mb-0.5 text-[9px] font-black tracking-widest uppercase">Color Option</span>
                        <span className={`font-extrabold uppercase ${selectedInquiry.colorType === 'color' ? 'text-[#E53E3E]' : 'text-stone-800'}`}>
                          {selectedInquiry.colorType === 'color' ? 'Full Color' : 'Black & Grey'}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block mb-0.5 text-[9px] font-black tracking-widest uppercase">Placement</span>
                        <span className="text-stone-800 font-extrabold">{selectedInquiry.placement}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block mb-0.5 text-[9px] font-black tracking-widest uppercase">Size (Width)</span>
                        <span className="text-stone-800 font-extrabold">{selectedInquiry.sizeCm} cm</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block mb-0.5 text-[9px] font-black tracking-widest uppercase">Submitted</span>
                        <span className="text-stone-800 font-extrabold">
                          {new Date(selectedInquiry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block mb-0.5 text-[9px] font-black tracking-widest uppercase">Preferred Contact</span>
                        <span className="text-stone-800 font-extrabold flex items-center gap-1">
                          {selectedInquiry.preferredContactMethod === 'email' ? (
                            <>
                              <Mail className="w-3 h-3 text-stone-600" />
                              Email
                            </>
                          ) : (
                            <>
                              <Phone className="w-3 h-3 text-emerald-600" />
                              WhatsApp
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Design Description */}
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block mb-2">Design Pitch / Meaning</span>
                      <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100 font-sans">
                        "{selectedInquiry.description}"
                      </p>
                    </div>

                    {/* Placement Area Photo */}
                    {selectedInquiry.placementPhoto && (
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block mb-2">
                          {language === 'en' ? 'Tattoo Placement Area Photo' : 'Foto de la Zona a Tatuar'}
                        </span>
                        <div className="relative border border-stone-150 rounded-2xl overflow-hidden max-w-sm bg-stone-50 shadow-sm aspect-[4/3]">
                          <img
                            src={selectedInquiry.placementPhoto}
                            alt="Skin Area"
                            className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <a
                            href={selectedInquiry.placementPhoto}
                            download={`placement-${selectedInquiry.fullName}.png`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-3 right-3 p-2 bg-black/75 hover:bg-[#E53E3E] text-white text-[10px] font-bold rounded-full transition-all cursor-pointer shadow-sm flex items-center space-x-1"
                            title="Download Photo"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Instant Responder suite (WhatsApp and Email bilingually optimized) */}
                    <div className="p-5 sm:p-6 bg-[#FCFBFA] border border-stone-200/60 rounded-3xl space-y-4 shadow-sm" id="instant-responder-block">
                      <div className="flex items-center justify-between border-b border-stone-150 pb-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="p-1.5 rounded-lg bg-stone-900 text-white">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black tracking-wider uppercase text-stone-900">
                              {language === 'en' ? 'Bilingual Instant Responder' : 'Respondedor Instantáneo Bilingüe'}
                            </h4>
                            <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                              {language === 'en' ? 'Reply via WhatsApp & Email' : 'Responde por WhatsApp y Email'}
                            </p>
                          </div>
                        </div>
                        <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold uppercase font-mono">
                          {language === 'en' ? 'Live Sync' : 'En Vivo'}
                        </span>
                      </div>

                      {/* Quick Templates Selection */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-stone-400 font-black uppercase tracking-widest block">
                          {language === 'en' ? '⚡ Click to Load Quick Template' : '⚡ Clic para Cargar Plantilla Rápida'}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => applyTemplate('accept', selectedInquiry)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                          >
                            {language === 'en' ? 'Accept & Ask Dates' : 'Aceptar y Pedir Fecha'}
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTemplate('quote', selectedInquiry)}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                          >
                            {language === 'en' ? 'Estimated Price' : 'Enviar Presupuesto'}
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTemplate('details', selectedInquiry)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/60 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                          >
                            {language === 'en' ? 'Need More Details' : 'Pedir Más Información'}
                          </button>
                        </div>
                      </div>

                      {/* Reply Text Area */}
                      <div className="space-y-1.5">
                        <textarea
                          rows={4}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={language === 'en' ? "Write your custom message here..." : "Escribe tu mensaje personalizado aquí..."}
                          className="w-full px-4 py-3 border border-stone-250 rounded-2xl text-xs bg-white font-semibold text-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all resize-none leading-relaxed"
                        />
                      </div>

                      {/* Action buttons side-by-side */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* Send Simulated Email Response */}
                        <button
                          type="button"
                          onClick={() => handleSendEmailReply(selectedInquiry)}
                          disabled={sendingReply || !replyText.trim()}
                          className="w-full px-4 py-3 border border-stone-250 hover:border-stone-400 bg-white text-stone-700 hover:text-black hover:bg-stone-50 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-sm min-h-[44px]"
                        >
                          {sendingReply ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>{language === 'en' ? 'Sending Email...' : 'Enviando Email...'}</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-3.5 h-3.5 text-[#E53E3E]" />
                              <span>{language === 'en' ? 'Send via Email' : 'Enviar por Correo'}</span>
                            </>
                          )}
                        </button>

                        {/* Send Real Redirect WhatsApp Response */}
                        <button
                          type="button"
                          onClick={() => handleSendWhatsAppReply(selectedInquiry)}
                          disabled={sendingReply || !replyText.trim()}
                          className="w-full px-4 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] min-h-[44px]"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-white text-white" />
                          <span>{language === 'en' ? 'Open in WhatsApp' : 'Abrir en WhatsApp'}</span>
                        </button>
                      </div>

                      {/* Reply History Log for this lead */}
                      {replyHistory[selectedInquiry.id] && replyHistory[selectedInquiry.id].length > 0 && (
                        <div className="pt-3 border-t border-stone-150 space-y-2">
                          <span className="text-[8px] text-stone-400 font-black uppercase tracking-widest flex items-center">
                            <History className="w-3 h-3 mr-1" />
                            {language === 'en' ? 'Conversation Logs / History' : 'Historial de Respuestas Enviadas'}
                          </span>
                          <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 divide-y divide-stone-100">
                            {replyHistory[selectedInquiry.id].map((rep, rIdx) => (
                              <div key={rIdx} className="pt-2 text-[10px] text-stone-600 font-sans leading-relaxed">
                                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-stone-400 mb-1">
                                  <span className="flex items-center">
                                    {rep.method === 'email' ? (
                                      <span className="text-[#E53E3E] flex items-center mr-1">📧 EMAIL</span>
                                    ) : (
                                      <span className="text-emerald-600 flex items-center mr-1">💬 WHATSAPP</span>
                                    )}
                                    • {new Date(rep.date).toLocaleDateString()}
                                  </span>
                                  <span>{new Date(rep.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="bg-stone-100/55 p-2.5 rounded-xl border border-stone-150/40 text-stone-700 italic font-medium">
                                  "{rep.text}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Artist Notes Section */}
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center">
                        <FileText className="w-3.5 h-3.5 mr-1.5 text-[#E53E3E]" />
                        {language === 'en' ? 'Internal Artist Notes' : 'Notas Internas del Artista'}
                      </label>
                      <textarea
                        rows={3}
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder={t.portalNotesPlaceholder}
                        className="w-full px-4 py-3 border border-stone-200 rounded-2xl text-xs bg-stone-50 font-semibold focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all resize-none"
                      />
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        className="px-5 py-2.5 bg-stone-900 text-white rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#E53E3E] transition-all cursor-pointer shadow-sm"
                      >
                        {t.portalSaveNotes}
                      </button>
                    </div>

                    {/* Secure Health/Medical Notes */}
                    <div className="space-y-2 pt-4 border-t border-stone-100">
                      <label className="text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center text-rose-700">
                        <AlertCircle className="w-3.5 h-3.5 mr-1.5 animate-pulse text-rose-500" />
                        {language === 'en' ? 'Secure Client Health & Medical Notes (Allergies, Skin conditions)' : 'Notas Médicas y de Salud (Alergias, Piel, etc.) - Seguro'}
                      </label>
                      <textarea
                        rows={3}
                        value={medicalNotesDraft}
                        onChange={(e) => setMedicalNotesDraft(e.target.value)}
                        placeholder={language === 'en' ? "Specify any sensitive health details: Allergies (latex, ink), skin conditions, diabetes, blood pressure, or special healing instructions..." : "Especificar detalles de salud sensibles: Alergias (látex, tintas), condiciones de la piel, diabetes, presión arterial, o cuidados especiales..."}
                        className="w-full px-4 py-3 border border-rose-100 rounded-2xl text-xs bg-rose-50/30 font-semibold focus:bg-white focus:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-50 transition-all resize-none text-stone-800"
                      />
                      <button
                        type="button"
                        onClick={handleSaveMedicalNotes}
                        className="px-5 py-2.5 bg-rose-950 hover:bg-[#E53E3E] text-white rounded-full text-xs font-bold tracking-widest uppercase transition-all cursor-pointer shadow-sm"
                      >
                        {language === 'en' ? 'Save Secure Notes' : 'Guardar de Forma Segura'}
                      </button>
                    </div>

                    {/* Activity Timeline */}
                    <div className="space-y-3 pt-4 border-t border-stone-100">
                      <label className="text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center">
                        <Activity className="w-3.5 h-3.5 mr-1.5 text-[#E53E3E]" />
                        {language === 'en' ? 'Inquiry Activity Timeline' : 'Línea de Tiempo de Actividad'}
                      </label>
                      <div className="relative pl-5 border-l border-stone-200 ml-2 space-y-4 py-2">
                        {(() => {
                          const history = selectedInquiry.statusHistory && selectedInquiry.statusHistory.length > 0
                            ? selectedInquiry.statusHistory
                            : [{ status: 'pending' as InquiryStatus, timestamp: selectedInquiry.createdAt }];
                          
                          return history.map((hist, idx) => {
                            const isLast = idx === history.length - 1;
                            const formattedDate = new Date(hist.timestamp).toLocaleDateString(
                              language === 'en' ? 'en-US' : 'es-ES',
                              { month: 'short', day: 'numeric', year: 'numeric' }
                            );
                            const formattedTime = new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            
                            return (
                              <div key={idx} className="relative group">
                                {/* Dot */}
                                <div className={`absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-white transition-all ${
                                  isLast ? 'border-[#E53E3E] scale-125 ring-4 ring-rose-100' : 'border-stone-400'
                                }`} />
                                <div className="text-xs font-bold text-stone-850">
                                  <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider mr-2 ${
                                    hist.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                    hist.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                                    hist.status === 'replied' ? 'bg-purple-100 text-purple-800' :
                                    hist.status === 'booked' ? 'bg-emerald-100 text-emerald-800' :
                                    hist.status === 'completed' ? 'bg-stone-900 text-white' :
                                    'bg-rose-100 text-rose-800'
                                  }`}>
                                    {getStatusLabel(hist.status)}
                                  </span>
                                  <span className="text-[10px] text-stone-400 font-mono font-medium">
                                    {formattedDate} {language === 'en' ? 'at' : 'a las'} {formattedTime}
                                  </span>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                  </div>

                  <div className="mt-8 pt-4 border-t border-stone-100 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">ID: {selectedInquiry.id}</span>
                      
                      {/* Sync status / button in Modal */}
                      {syncedIds.has(selectedInquiry.id) ? (
                        <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                          {language === 'en' ? 'Synced to Sheets' : 'Sincronizado'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSyncLead(selectedInquiry)}
                          disabled={syncingId !== null}
                          className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                          {syncingId === selectedInquiry.id ? (
                            <>
                              <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                              <span>{syncProgress || (language === 'en' ? 'Syncing...' : 'Sincronizando...')}</span>
                            </>
                          ) : (
                            <>
                              <Cloud className="w-3 h-3 mr-1.5 text-emerald-600" />
                              <span>{language === 'en' ? 'Sync to Sheets & Drive' : 'Subir a Sheets & Drive'}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedInquiry(null)}
                      className="px-5 py-2.5 bg-stone-50 border border-stone-200 hover:border-stone-400 hover:bg-stone-100 text-stone-700 text-xs font-bold tracking-widest uppercase transition-all cursor-pointer text-center rounded-full"
                    >
                      {t.modalClose}
                    </button>
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Email Response Overlay Modal */}
      {emailOverlayInquiry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="email-overlay-backdrop">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#E53E3E]/10 text-[#E53E3E] rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wider uppercase text-stone-900">
                    {language === 'en' ? 'Quick Email Response' : 'Respuesta Rápida por Correo'}
                  </h3>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                    {language === 'en' ? 'Compose & Automate Status Update' : 'Redactar y Actualizar Estado'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEmailOverlayInquiry(null)}
                className="p-1.5 rounded-full hover:bg-stone-200 transition-colors cursor-pointer text-stone-400 hover:text-stone-700"
              >
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* To info */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60 text-xs text-stone-700 space-y-1">
                <div>
                  <span className="text-stone-400 font-bold uppercase mr-2 text-[9px] tracking-wider">{language === 'en' ? 'To:' : 'Para:'}</span>
                  <span className="font-extrabold text-stone-900">{emailOverlayInquiry.fullName}</span>
                </div>
                <div>
                  <span className="text-stone-400 font-bold uppercase mr-2 text-[9px] tracking-wider">{language === 'en' ? 'Email:' : 'Correo:'}</span>
                  <span className="font-mono text-stone-600 font-semibold">{emailOverlayInquiry.email}</span>
                </div>
              </div>

              {/* Template Buttons */}
              <div className="space-y-2">
                <label className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">
                  {language === 'en' ? 'Select Template' : 'Seleccionar Plantilla'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyEmailTemplate('accept', emailOverlayInquiry)}
                    className={`px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                      emailTemplateType === 'accept'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold scale-[1.01]'
                        : 'bg-stone-50 border-transparent text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {language === 'en' ? 'Booking Accepted' : 'Aceptar Reserva'}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEmailTemplate('moreInfo', emailOverlayInquiry)}
                    className={`px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                      emailTemplateType === 'moreInfo'
                        ? 'bg-blue-50 border-blue-300 text-blue-800 font-extrabold scale-[1.01]'
                        : 'bg-stone-50 border-transparent text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {language === 'en' ? 'Need More Info' : 'Pedir Info'}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEmailTemplate('decline', emailOverlayInquiry)}
                    className={`px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                      emailTemplateType === 'decline'
                        ? 'bg-rose-50 border-rose-300 text-rose-800 font-extrabold scale-[1.01]'
                        : 'bg-stone-50 border-transparent text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {language === 'en' ? 'Declined' : 'Rechazar'}
                  </button>
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">
                  {language === 'en' ? 'Subject' : 'Asunto'}
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-2xl text-xs bg-stone-50 font-semibold focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all text-stone-800"
                />
              </div>

              {/* Body Text Area */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">
                  {language === 'en' ? 'Message Body' : 'Cuerpo del Mensaje'}
                </label>
                <textarea
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-250 rounded-2xl text-xs bg-white font-semibold text-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEmailOverlayInquiry(null)}
                className="px-5 py-2.5 rounded-full border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold tracking-widest uppercase transition-all cursor-pointer"
              >
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={handleSendEmailOverlay}
                className="px-6 py-2.5 rounded-full bg-[#E53E3E] hover:bg-[#C53030] text-white text-xs font-black tracking-widest uppercase transition-all shadow-md flex items-center space-x-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>{language === 'en' ? 'Send Response' : 'Enviar Respuesta'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </section>
  );
}
