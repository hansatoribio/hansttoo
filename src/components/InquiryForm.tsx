import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Instagram, Scissors, Check, AlertCircle, Upload, Trash2, Send, Sparkles, Phone, Camera, Info, X, Feather, Aperture, Flame, HelpCircle, MessageSquare } from 'lucide-react';
import { Language, TattooStyle, Inquiry } from '../types';
import { translations } from '../translations';

interface InquiryFormProps {
  language: Language;
  preselectedStyle: TattooStyle | null;
  preselectedDescription?: string | null;
  onInquirySubmitted: (inquiry: Inquiry) => void;
  isVisualEditMode?: boolean;
  onEditElement?: (type: 'text' | 'image' | 'portfolio' | 'faq', key: string, label?: string, data?: any) => void;
  customTranslations?: any;
}

export default function InquiryForm({
  language,
  preselectedStyle,
  preselectedDescription,
  onInquirySubmitted,
  isVisualEditMode = false,
  onEditElement,
  customTranslations
}: InquiryFormProps) {
  const t = customTranslations?.[language] || translations[language] || translations.en;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [style, setStyle] = useState<TattooStyle | 'other'>('fineline');
  const [colorType, setColorType] = useState<'black_and_grey' | 'color'>('black_and_grey');
  const [placement, setPlacement] = useState('');
  const [placementPhoto, setPlacementPhoto] = useState<string | null>(null);
  const [sizeCm, setSizeCm] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  const placementFileInputRef = useRef<HTMLInputElement>(null);
  const [isPlacementDragging, setIsPlacementDragging] = useState(false);

  // Anti-bot & spam prevention states
  const [honeypot, setHoneypot] = useState(''); // If filled, it's a bot!
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaChallenge, setCaptchaChallenge] = useState({ num1: 0, num2: 0, sum: 0 });

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 9) + 1; // 1-9
    const num2 = Math.floor(Math.random() * 9) + 1; // 1-9
    setCaptchaChallenge({
      num1,
      num2,
      sum: num1 + num2
    });
    setCaptchaAnswer('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Validation / Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Skeleton initialization state
  const [isInitializing, setIsInitializing] = useState(true);

  // Trigger loading skeleton on mount or language change
  useEffect(() => {
    setIsInitializing(true);
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [language]);

  // Listen to preselected style changes
  useEffect(() => {
    if (preselectedStyle) {
      setStyle(preselectedStyle);
      const bookingElement = document.getElementById('booking');
      if (bookingElement) {
        bookingElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [preselectedStyle]);

  // Listen to preselected description changes
  useEffect(() => {
    if (preselectedDescription) {
      setDescription(preselectedDescription);
    }
  }, [preselectedDescription]);

  // Handle Drag & Drop
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    const validImageFiles = files.filter(f => f.type.startsWith('image/'));
    if (validImageFiles.length === 0) return;

    const remainingSlots = 5 - referenceImages.length;
    if (remainingSlots <= 0) {
      alert(language === 'en' ? 'Maximum 5 reference images reached.' : 'Has alcanzado el límite de 5 imágenes de referencia.');
      return;
    }

    const filesToProcess = validImageFiles.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImages(prev => {
          if (prev.length >= 5) return prev;
          return [...prev, reader.result as string];
        });
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeReferenceImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  // Placement Photo Upload Handlers
  const handlePlacementDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPlacementDragging(true);
  };

  const handlePlacementDragLeave = () => {
    setIsPlacementDragging(false);
  };

  const handlePlacementDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPlacementDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPlacementPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handlePlacementFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPlacementPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removePlacementPhoto = () => {
    setPlacementPhoto(null);
    if (placementFileInputRef.current) {
      placementFileInputRef.current.value = '';
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Honeypot check
    if (honeypot.trim()) {
      newErrors.honeypot = "Spam detected";
    }

    if (!fullName.trim()) newErrors.fullName = t.validationName;
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = t.validationEmail;
    if (!phone.trim()) newErrors.phone = t.validationPhone;
    if (!placement.trim()) newErrors.placement = t.validationPlacement;
    if (!placementPhoto) {
      newErrors.placementPhoto = language === 'en' 
        ? 'Please upload a photo of the area where the tattoo will go' 
        : 'Por favor sube una foto del área donde te tatuarás';
    }
    if (!sizeCm || sizeCm < 2) newErrors.sizeCm = t.validationSize;
    if (!description.trim() || description.length < 10) newErrors.description = t.validationDesc;
    if (referenceImages.length === 0) {
      newErrors.referenceImages = t.validationImages;
    }

    // CAPTCHA check
    const trimmedAnswer = captchaAnswer.trim();
    if (!trimmedAnswer || parseInt(trimmedAnswer) !== captchaChallenge.sum) {
      newErrors.captcha = language === 'en'
        ? 'Please answer the security question correctly.'
        : 'Por favor responde correctamente la pregunta de seguridad.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const errorEl = document.getElementById(`form-${firstErrorKey}`);
        errorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      fullName,
      email,
      phone,
      instagram: instagram.trim() ? (instagram.startsWith('@') ? instagram : `@${instagram}`) : undefined,
      preferredContactMethod,
      style,
      colorType,
      placement,
      placementPhoto,
      sizeCm,
      description,
      referenceImage: referenceImages[0] || null, // For backward compatibility
      referenceImages,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onInquirySubmitted(newInquiry);
    setIsSubmitted(true);

    // Auto WhatsApp Redirect to Artist
    const artistWhatsApp = localStorage.getItem('hans_artist_whatsapp') || '16462709292';
    const cleanStyle = style === 'fineline' ? 'Fine Line' : style === 'microrealism' ? 'Microrealism' : style === 'anime' ? 'Anime' : 'Other';
    const contactPrefLabel = preferredContactMethod === 'whatsapp' ? 'WhatsApp' : 'Email / Correo';
    const whatsappMessage = `*NUEVA CONSULTA DE TATUAJE* 🎨\n\n` +
      `👤 *Cliente:* ${fullName}\n` +
      `✉️ *Email:* ${email}\n` +
      `📞 *Teléfono/WhatsApp:* ${phone}\n` +
      `📲 *Contacto Preferido:* ${contactPrefLabel}\n` +
      `📸 *Instagram:* ${instagram || 'No especificado'}\n` +
      `🖋 *Estilo:* ${cleanStyle}\n` +
      `🎨 *Color:* ${colorType === 'color' ? 'Full Color' : 'Black & Grey'}\n` +
      `📍 *Ubicación:* ${placement}\n` +
      `📏 *Tamaño:* ${sizeCm} cm\n\n` +
      `💬 *Idea:* "${description}"\n\n` +
      `🔗 _Imágenes de referencia registradas correctamente en la base de datos de Hans Toribio Studio._`;

    const encodedMsg = encodeURIComponent(whatsappMessage);
    const artistWhatsAppUrl = `https://wa.me/${artistWhatsApp.replace(/[^0-9]/g, '')}?text=${encodedMsg}`;

    try {
      window.open(artistWhatsAppUrl, '_blank');
    } catch (err) {
      console.error("Failed to automatically redirect to WhatsApp", err);
    }
  };

  const handleReset = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setInstagram('');
    setPreferredContactMethod('whatsapp');
    setStyle('fineline');
    setColorType('black_and_grey');
    setPlacement('');
    setPlacementPhoto(null);
    setSizeCm(10);
    setDescription('');
    setReferenceImages([]);
    setErrors({});
    setIsSubmitted(false);
    generateCaptcha();
  };

  return (
    <section className="py-20 sm:py-24 bg-[#FCFBFA] border-b border-stone-100" id="booking">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Form Header */}
        <div className="text-center mb-12 space-y-2">
          <span
            onClick={() => {
              if (isVisualEditMode && onEditElement) {
                onEditElement('text', 'bookBadge', 'Consultation Form Badge', {
                  en: customTranslations?.en?.bookBadge || 'RESERVE A SESSION',
                  es: customTranslations?.es?.bookBadge || 'SOLICITUD DE TATUAJE'
                });
              }
            }}
            className={`text-[10px] font-black tracking-[0.25em] text-[#1A1A1A]/40 uppercase inline-block ${
              isVisualEditMode ? 'cursor-pointer hover:underline text-amber-600' : ''
            }`}
          >
            {customTranslations?.[language]?.bookBadge || (language === 'en' ? 'RESERVE A SESSION' : 'SOLICITUD DE TATUAJE')}
          </span>
          <h2
            onClick={() => {
              if (isVisualEditMode && onEditElement) {
                onEditElement('text', 'bookTitle', 'Consultation Form Title', {
                  en: customTranslations?.en?.bookTitle || (language === 'en' ? 'CONSULTATION FORM' : 'FORMULARIO DE CONSULTA'),
                  es: customTranslations?.es?.bookTitle || (language === 'en' ? 'CONSULTATION FORM' : 'FORMULARIO DE CONSULTA')
                });
              }
            }}
            className={`text-3xl sm:text-5xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none ${
              isVisualEditMode ? 'cursor-pointer border border-dashed border-amber-400 p-2 rounded-xl bg-amber-50/20' : ''
            }`}
          >
            {t.bookTitle || (language === 'en' ? 'CONSULTATION FORM' : 'FORMULARIO DE CONSULTA')}<span className="text-[#E53E3E]">.</span>
          </h2>
          <p
            onClick={() => {
              if (isVisualEditMode && onEditElement) {
                onEditElement('text', 'bookSubtitle', 'Consultation Form Subtitle', {
                  en: customTranslations?.en?.bookSubtitle || (language === 'en' ? 'Complete this single sheet to request your custom design. I personally review all inquiries.' : 'Completa esta ficha para solicitar tu diseño personalizado. Reviso cada consulta personalmente.'),
                  es: customTranslations?.es?.bookSubtitle || (language === 'en' ? 'Complete this single sheet to request your custom design. I personally review all inquiries.' : 'Completa esta ficha para solicitar tu diseño personalizado. Reviso cada consulta personalmente.')
                });
              }
            }}
            className={`text-stone-500 text-sm mt-3 leading-relaxed max-w-2xl mx-auto font-sans ${
              isVisualEditMode ? 'cursor-pointer border border-dashed border-amber-400 p-1.5 rounded-lg bg-amber-50/20' : ''
            }`}
          >
            {t.bookSubtitle || (language === 'en'
              ? 'Complete this single sheet to request your custom design. I personally review all inquiries.'
              : 'Completa esta ficha para solicitar tu diseño personalizado. Reviso cada consulta personalmente.')}
          </p>
        </div>

        {/* Dynamic State Layout */}
        <div className="bg-white rounded-3xl border border-stone-100 p-6 sm:p-10 shadow-xl shadow-stone-100/40 relative" id="booking-form-box">
          <AnimatePresence mode="wait">
            {isInitializing && !isSubmitted ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-8"
              >
                {/* Two-Column Grid for clean layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Left Column: Personal and Specs */}
                  <div className="space-y-6">
                    {/* Header skeleton */}
                    <div className="h-4 w-36 bg-stone-100 rounded-md animate-pulse border-b border-stone-100 pb-2.5" />
                    
                    {/* Full Name skeleton */}
                    <div className="space-y-2">
                      <div className="h-3 w-24 bg-stone-150/40 rounded-md animate-pulse" />
                      <div className="h-11 w-full bg-stone-50 rounded-2xl animate-pulse" />
                    </div>

                    {/* Email skeleton */}
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-stone-150/40 rounded-md animate-pulse" />
                      <div className="h-11 w-full bg-stone-50 rounded-2xl animate-pulse" />
                    </div>

                    {/* Phone skeleton */}
                    <div className="space-y-2">
                      <div className="h-3 w-28 bg-stone-150/40 rounded-md animate-pulse" />
                      <div className="h-11 w-full bg-stone-50 rounded-2xl animate-pulse" />
                    </div>

                    {/* Instagram skeleton */}
                    <div className="space-y-2">
                      <div className="h-3 w-24 bg-stone-150/40 rounded-md animate-pulse" />
                      <div className="h-11 w-full bg-stone-50 rounded-2xl animate-pulse" />
                    </div>

                    {/* Header 2 skeleton */}
                    <div className="h-4 w-32 bg-stone-100 rounded-md animate-pulse border-b border-stone-100 pb-2.5 pt-4" />

                    {/* Style skeleton */}
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-stone-150/40 rounded-md animate-pulse" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-12 w-full bg-stone-50 rounded-xl animate-pulse" />
                        <div className="h-12 w-full bg-stone-50 rounded-xl animate-pulse" />
                        <div className="h-12 w-full bg-stone-50 rounded-xl animate-pulse" />
                        <div className="h-12 w-full bg-stone-50 rounded-xl animate-pulse" />
                      </div>
                    </div>

                    {/* Color Option skeleton */}
                    <div className="space-y-2">
                      <div className="h-3 w-24 bg-stone-150/40 rounded-md animate-pulse" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-12 w-full bg-stone-50 rounded-xl animate-pulse" />
                        <div className="h-12 w-full bg-stone-50 rounded-xl animate-pulse" />
                      </div>
                    </div>

                    {/* Size Option skeleton */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-3 w-16 bg-stone-150/40 rounded-md animate-pulse" />
                        <div className="h-4 w-12 bg-stone-50 rounded-full animate-pulse" />
                      </div>
                      <div className="h-2 w-full bg-stone-50 rounded-lg animate-pulse my-2.5" />
                    </div>
                  </div>

                  {/* Right Column: Design & Placement */}
                  <div className="space-y-6">
                    {/* Header skeleton */}
                    <div className="h-4 w-40 bg-stone-100 rounded-md animate-pulse border-b border-stone-100 pb-2.5" />

                    {/* Placement Description skeleton */}
                    <div className="space-y-2">
                      <div className="h-3 w-28 bg-stone-150/40 rounded-md animate-pulse" />
                      <div className="h-11 w-full bg-stone-50 rounded-2xl animate-pulse" />
                    </div>

                    {/* Placement Photo skeleton */}
                    <div className="space-y-2">
                      <div className="h-3 w-32 bg-stone-150/40 rounded-md animate-pulse" />
                      <div className="h-[140px] w-full bg-stone-50 rounded-2xl animate-pulse border border-dashed border-stone-200" />
                    </div>

                    {/* Header skeleton */}
                    <div className="h-4 w-36 bg-stone-100 rounded-md animate-pulse border-b border-stone-100 pb-2.5 pt-2" />

                    {/* Description skeleton */}
                    <div className="space-y-2">
                      <div className="h-3 w-28 bg-stone-150/40 rounded-md animate-pulse" />
                      <div className="h-20 w-full bg-stone-50 rounded-2xl animate-pulse" />
                    </div>

                    {/* Reference Images skeleton */}
                    <div className="space-y-2">
                      <div className="h-3 w-36 bg-stone-150/40 rounded-md animate-pulse" />
                      <div className="h-[150px] w-full bg-stone-50 rounded-2xl animate-pulse border border-dashed border-stone-200" />
                    </div>
                  </div>

                </div>

                {/* Submit button skeleton */}
                <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="h-4 w-2/3 bg-stone-50 rounded-md animate-pulse" />
                  <div className="h-12 w-32 bg-stone-100 rounded-full animate-pulse" />
                </div>
              </motion.div>
            ) : !isSubmitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                onSubmit={handleSubmit}
                className="space-y-8"
                id="booking-direct-form"
              >
                
                {/* Two-Column Grid for clean layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Left Column: Personal and Specs */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-black tracking-widest text-[#1A1A1A]/40 uppercase border-b border-stone-100 pb-2.5">
                      {language === 'en' ? '01. Personal Details' : '01. Datos Personales'}
                    </h3>

                    {/* Full Name */}
                    <div className="flex flex-col space-y-2">
                      <label className="text-[10px] font-black text-[#1A1A1A]/70 uppercase tracking-widest flex items-center">
                        <User className="w-3.5 h-3.5 mr-1.5 text-[#E53E3E]" />
                        {t.labelFullName}
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Maria Gonzalez"
                        className={`w-full px-4 py-3 rounded-2xl border bg-stone-50 text-[#1A1A1A] text-sm font-semibold focus:outline-none focus:bg-white focus:ring-4 focus:ring-stone-100 transition-all duration-250 ${
                          errors.fullName ? 'border-rose-400 bg-rose-50/10' : 'border-stone-200 focus:border-stone-400'
                        }`}
                        id="form-fullName"
                      />
                      {errors.fullName && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                          {errors.fullName}
                        </span>
                      )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col space-y-2">
                      <label className="text-[10px] font-black text-[#1A1A1A]/70 uppercase tracking-widest flex items-center">
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-[#E53E3E]" />
                        {t.labelEmail}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className={`w-full px-4 py-3 rounded-2xl border bg-stone-50 text-[#1A1A1A] text-sm font-semibold focus:outline-none focus:bg-white focus:ring-4 focus:ring-stone-100 transition-all duration-250 ${
                          errors.email ? 'border-rose-400 bg-rose-50/10' : 'border-stone-200 focus:border-stone-400'
                        }`}
                        id="form-email"
                      />
                      {errors.email && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                          {errors.email}
                        </span>
                      )}
                    </div>

                    {/* WhatsApp / Phone */}
                    <div className="flex flex-col space-y-2">
                      <label className="text-[10px] font-black text-[#1A1A1A]/70 uppercase tracking-widest flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-[#E53E3E]" />
                        {t.labelPhone}
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +34 600 123 456"
                        className={`w-full px-4 py-3 rounded-2xl border bg-stone-50 text-[#1A1A1A] text-sm font-semibold focus:outline-none focus:bg-white focus:ring-4 focus:ring-stone-100 transition-all duration-250 ${
                          errors.phone ? 'border-rose-400 bg-rose-50/10' : 'border-stone-200 focus:border-stone-400'
                        }`}
                        id="form-phone"
                      />
                      {errors.phone && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                          {errors.phone}
                        </span>
                      )}
                    </div>

                    {/* Instagram Handle */}
                    <div className="flex flex-col space-y-2">
                      <label className="text-[10px] font-black text-[#1A1A1A]/70 uppercase tracking-widest flex items-center">
                        <Instagram className="w-3.5 h-3.5 mr-1.5 text-[#E53E3E]" />
                        {t.labelInstagram}
                      </label>
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="@your_user"
                        className="w-full px-4 py-3 rounded-2xl border bg-stone-50 text-[#1A1A1A] text-sm font-semibold focus:outline-none focus:bg-white focus:ring-4 focus:ring-stone-100 transition-all duration-250 border-stone-200 focus:border-stone-400"
                        id="form-instagram"
                      />
                    </div>

                    {/* Preferred Contact Method */}
                    <div className="flex flex-col space-y-2">
                      <label className="text-[10px] font-black text-[#1A1A1A]/70 uppercase tracking-widest flex items-center">
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-[#E53E3E]" />
                        {t.labelPreferredContact}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPreferredContactMethod('whatsapp')}
                          className={`px-4 py-3 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                            preferredContactMethod === 'whatsapp'
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10 font-black'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                          id="form-contact-whatsapp"
                        >
                          <Phone className="w-4 h-4" />
                          <span>{t.contactWhatsApp}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreferredContactMethod('email')}
                          className={`px-4 py-3 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                            preferredContactMethod === 'email'
                              ? 'bg-stone-900 border-stone-900 text-white shadow-md shadow-stone-900/10 font-black'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                          id="form-contact-email"
                        >
                          <Mail className="w-4 h-4" />
                          <span>{t.contactEmail}</span>
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xs font-black tracking-widest text-[#1A1A1A]/40 uppercase border-b border-stone-100 pb-2.5 pt-4">
                      {language === 'en' ? '02. Tattoo Specs' : '02. Datos del Tatuaje'}
                    </h3>

                    {/* Preferred Style */}
                    <div className="flex flex-col space-y-3">
                      <label className="text-[10px] font-black text-[#1A1A1A]/70 uppercase tracking-widest flex items-center">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#E53E3E]" />
                        {t.labelStyle}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { 
                            id: 'fineline', 
                            label: t.filterFineline,
                            subtitleEn: 'Elegant, thin, and minimalist ink work',
                            subtitleEs: 'Trazos finos, elegantes y minimalistas',
                            icon: Feather
                          },
                          { 
                            id: 'microrealism', 
                            label: t.filterMicrorealism,
                            subtitleEn: 'Intricate photorealistic miniature pieces',
                            subtitleEs: 'Piezas miniatura con gran detalle fotográfico',
                            icon: Aperture
                          },
                          { 
                            id: 'anime', 
                            label: t.filterAnime,
                            subtitleEn: 'Vibrant cartoon, gaming, and comic art',
                            subtitleEs: 'Diseños vibrantes de anime y cómics',
                            icon: Flame
                          },
                          { 
                            id: 'other', 
                            label: language === 'en' ? 'Custom / Other' : 'Personalizado / Otro',
                            subtitleEn: 'Lettering, geometry, or custom concepts',
                            subtitleEs: 'Letras, geometría u otras ideas propias',
                            icon: HelpCircle
                          }
                        ].map((item) => {
                          const IconComponent = item.icon;
                          const isSelected = style === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setStyle(item.id as TattooStyle | 'other')}
                              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between group ${
                                isSelected
                                  ? 'bg-stone-900 border-stone-900 text-white shadow-lg shadow-stone-900/10 scale-[1.01]'
                                  : 'bg-stone-50 border-stone-100 text-stone-700 hover:bg-stone-100/50 hover:border-stone-300'
                              }`}
                              style={{ minHeight: '110px' }}
                            >
                              <div className="flex items-start justify-between w-full">
                                <div className={`p-2 rounded-xl transition-all ${
                                  isSelected ? 'bg-white/10 text-white' : 'bg-stone-100 text-stone-800'
                                }`}>
                                  <IconComponent className="w-4.5 h-4.5" />
                                </div>
                                {isSelected && (
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E53E3E] text-white">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                )}
                              </div>
                              <div className="mt-3.5 space-y-0.5">
                                <h4 className={`text-[11px] font-black uppercase tracking-wider ${
                                  isSelected ? 'text-white' : 'text-stone-900'
                                }`}>
                                  {item.label}
                                </h4>
                                <p className={`text-[9px] font-medium leading-normal ${
                                  isSelected ? 'text-stone-300' : 'text-stone-400'
                                }`}>
                                  {language === 'en' ? item.subtitleEn : item.subtitleEs}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Color Option Block */}
                    <div className="flex flex-col space-y-2.5">
                      <label className="text-[10px] font-black text-[#1A1A1A]/70 uppercase tracking-widest">
                        {language === 'en' ? 'Color Option' : 'Opción de Color'}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setColorType('black_and_grey')}
                          className={`px-4 py-4 rounded-xl border text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer text-center min-h-[48px] flex items-center justify-center ${
                            colorType === 'black_and_grey'
                              ? 'bg-stone-900 border-stone-900 text-white shadow-md shadow-stone-900/10 scale-[1.01]'
                              : 'bg-stone-50 border-transparent text-stone-700 hover:bg-stone-100/75'
                          }`}
                        >
                          {language === 'en' ? 'Black & Grey' : 'Negro y Gris'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setColorType('color')}
                          className={`px-4 py-4 rounded-xl border text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer text-center min-h-[48px] flex items-center justify-center ${
                            colorType === 'color'
                              ? 'bg-[#E53E3E] border-[#E53E3E] text-white shadow-md shadow-rose-600/15 scale-[1.01]'
                              : 'bg-stone-50 border-transparent text-stone-700 hover:bg-stone-100/75'
                          }`}
                        >
                          {language === 'en' ? 'Full Color' : 'A Color'}
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Sizing, Concept, and Reference */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-black tracking-widest text-[#1A1A1A]/40 uppercase border-b border-stone-100 pb-2.5">
                      {language === 'en' ? '03. Layout & Reference' : '03. Diseño y Referencia'}
                    </h3>

                    {/* Sizing Slider */}
                    <div className="flex flex-col space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black text-stone-700 uppercase tracking-widest">
                        <span>{t.labelSize}</span>
                        <span className="text-white bg-stone-900 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono shadow-sm">
                          {sizeCm} cm
                        </span>
                      </div>
                      <div className="py-2.5 flex items-center">
                        <input
                          type="range"
                          min="2"
                          max="30"
                          step="1"
                          value={sizeCm}
                          onChange={(e) => setSizeCm(Number(e.target.value))}
                          className="w-full h-6 appearance-none bg-transparent cursor-pointer focus:outline-none"
                          id="form-sizeCm"
                        />
                      </div>
                      <div className="flex justify-between text-[8px] text-stone-400 font-bold uppercase tracking-wider font-mono">
                        <span>2 cm (Mini)</span>
                        <span>15 cm (Medium)</span>
                        <span>30 cm (Full Area)</span>
                      </div>
                    </div>

                    {/* Placement Input & Area Photo Upload */}
                    <div className="bg-stone-50/70 p-5 rounded-2xl border border-stone-150 space-y-4" id="form-placementPhoto">
                      <div className="flex flex-col space-y-2">
                        <label className="text-[10px] font-black text-[#1A1A1A]/70 uppercase tracking-widest flex items-center">
                          <Scissors className="w-3.5 h-3.5 mr-1.5 text-[#E53E3E] rotate-90" />
                          {t.labelPlacement}
                        </label>
                        <input
                          type="text"
                          value={placement}
                          onChange={(e) => setPlacement(e.target.value)}
                          placeholder={language === 'en' ? "e.g. Forearm, Ribs, Back of Neck" : "ej. Antebrazo, Costillas, Nuca"}
                          className={`w-full px-4 py-3 rounded-2xl border bg-white text-[#1A1A1A] text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all duration-250 ${
                            errors.placement ? 'border-rose-400 bg-rose-50/10' : 'border-stone-200 focus:border-stone-400'
                          }`}
                          id="form-placement"
                        />
                        {errors.placement && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                            {errors.placement}
                          </span>
                        )}
                      </div>

                      {/* Photo of placement area upload */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-[10px] font-black text-[#1A1A1A]/70 uppercase tracking-widest flex items-center">
                          <Camera className="w-3.5 h-3.5 mr-1.5 text-[#E53E3E]" />
                          {language === 'en' ? 'Photo of your Tattoo Area' : 'Foto de la zona a tatuar'}
                        </label>

                        <input
                          type="file"
                          ref={placementFileInputRef}
                          onChange={handlePlacementFileChange}
                          accept="image/*"
                          className="hidden"
                        />

                        {!placementPhoto ? (
                          <div
                            onDragOver={handlePlacementDragOver}
                            onDragLeave={handlePlacementDragLeave}
                            onDrop={handlePlacementDrop}
                            onClick={() => placementFileInputRef.current?.click()}
                            className={`border border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all min-h-[140px] flex flex-col justify-center items-center ${
                              isPlacementDragging 
                                ? 'border-[#E53E3E] bg-rose-50/5' 
                                : 'border-stone-200 bg-white hover:bg-stone-50/80'
                            } ${errors.placementPhoto ? 'border-rose-400 bg-rose-50/10' : ''}`}
                          >
                            <Upload className="w-6 h-6 text-[#1A1A1A]/60 mx-auto mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-wider text-[#1A1A1A] max-w-[240px]">
                              {language === 'en' ? 'Tap to upload or drag photo of your skin area' : 'Toca para subir o arrastra la foto de tu piel'}
                            </p>
                            <p className="text-[8px] text-stone-400 font-bold uppercase block tracking-wider mt-1">
                              {language === 'en' ? 'To ensure custom anatomical fit' : 'Para asegurar el ajuste a tu anatomía'}
                            </p>
                          </div>
                        ) : (
                          <div className="relative border border-stone-150 rounded-2xl p-2 bg-white flex items-center space-x-3 shadow-sm">
                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-stone-100 shrink-0 bg-stone-50">
                              <img
                                src={placementPhoto}
                                alt="Placement area preview"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-wider truncate">
                                {language === 'en' ? 'Placement Photo' : 'Foto de Ubicación'}
                              </p>
                              <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest flex items-center mt-0.5">
                                <Check className="w-3 h-3 mr-0.5 text-emerald-500" />
                                {language === 'en' ? 'Ready to submit' : 'Lista para enviar'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={removePlacementPhoto}
                              className="p-1.5 rounded-full border border-stone-150 hover:border-rose-400 hover:bg-rose-50 text-stone-500 hover:text-rose-600 cursor-pointer transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {errors.placementPhoto && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                            {errors.placementPhoto}
                          </span>
                        )}
                      </div>

                      {/* Photo guidelines container */}
                      <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3 shadow-sm">
                        <div className="flex items-center space-x-2 text-[#E53E3E]">
                          <Info className="w-4 h-4" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest">
                            {language === 'en' ? 'Photo Requirements' : 'Requisitos de la foto'}
                          </h4>
                        </div>
                        
                        <p className="text-[11px] font-medium leading-relaxed text-stone-600">
                          {language === 'en' 
                            ? 'Please write down exactly where the tattoo will go. To ensure a perfect custom fit for your anatomy, you must upload a photo of the area.'
                            : 'Por favor, escribe de manera precisa dónde se ubicará el tatuaje. Para asegurar un ajuste óptimo a tu anatomía, es indispensable que subas una foto de la zona.'
                          }
                        </p>

                        <div className="bg-rose-50/40 rounded-lg p-3 border border-rose-100/50 space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-wider text-rose-600 flex items-center">
                            <Info className="w-3 h-3 mr-1" />
                            {language === 'en' ? 'Photo Guidelines' : 'Directrices para la foto'}
                          </p>
                          <ul className="text-[10px] text-stone-600 font-semibold space-y-1 pl-1 list-none">
                            <li className="flex items-start">
                              <span className="text-[#E53E3E] mr-1.5">•</span>
                              {language === 'en' ? 'High-quality & sharp focus' : 'Alta calidad y enfoque nítido'}
                            </li>
                            <li className="flex items-start">
                              <span className="text-[#E53E3E] mr-1.5">•</span>
                              {language === 'en' ? 'Good natural or ambient lighting' : 'Buena iluminación natural o de lámpara'}
                            </li>
                            <li className="flex items-start">
                              <span className="text-[#E53E3E] mr-1.5">•</span>
                              {language === 'en' ? 'Take the photo WITHOUT flash' : 'Toma la foto SIN flash'}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Design Concept Description */}
                    <div className="flex flex-col space-y-2">
                      <label className="text-[10px] font-black text-[#1A1A1A]/70 uppercase tracking-widest">
                        {t.labelDescription}
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t.labelDescriptionPlaceholder}
                        className={`w-full px-4 py-3.5 rounded-2xl border bg-stone-50 text-sm font-semibold text-[#1A1A1A] focus:outline-none focus:bg-white focus:ring-4 focus:ring-stone-100 transition-all duration-250 resize-none ${
                          errors.description ? 'border-rose-400 bg-rose-50/10' : 'border-stone-200 focus:border-stone-400'
                        }`}
                        id="form-description"
                      />
                      {errors.description && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                          {errors.description}
                        </span>
                      )}
                    </div>
                    {/* Reference Images Drop Zone */}
                    <div className="flex flex-col space-y-2" id="form-referenceImages">
                      <label className="text-[10px] font-black text-[#1A1A1A]/70 uppercase tracking-widest">
                        {t.labelReference}
                      </label>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />

                      {referenceImages.length < 5 && (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all min-h-[150px] flex flex-col justify-center items-center ${
                            isDragging 
                              ? 'border-[#E53E3E] bg-rose-50/5' 
                              : 'border-stone-200 bg-stone-50 hover:bg-stone-100/70'
                          }`}
                        >
                          <Upload className="w-6 h-6 text-[#1A1A1A]/60 mx-auto mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-wider text-[#1A1A1A] max-w-[240px]">
                            {t.labelReferencePlaceholder}
                          </p>
                          <p className="text-[8px] text-stone-400 font-bold uppercase block tracking-wider mt-1">
                            {t.labelReferenceHelp} ({referenceImages.length}/5)
                          </p>
                        </div>
                      )}

                      {referenceImages.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
                          {referenceImages.map((img, index) => (
                            <div key={index} className="relative group border border-stone-200 rounded-2xl p-1.5 bg-stone-50 overflow-hidden aspect-square flex flex-col justify-between">
                              <img
                                src={img}
                                alt={`Reference preview ${index + 1}`}
                                className="h-full w-full object-cover rounded-xl border border-stone-150 shadow-sm"
                                referrerPolicy="no-referrer"
                              />
                              <button
                                type="button"
                                onClick={() => removeReferenceImage(index)}
                                className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-stone-900/80 backdrop-blur-sm text-white hover:bg-red-600 hover:scale-105 transition-all shadow-sm cursor-pointer"
                                title={language === 'en' ? 'Remove Image' : 'Eliminar Imagen'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/65 text-white text-[8px] font-mono rounded font-bold uppercase tracking-wider">
                                #{index + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {errors.referenceImages && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                          {errors.referenceImages}
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Honeypot Field (Invisible to Humans) */}
                <div className="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none">
                  <label htmlFor="website_checking_field">Leave this empty</label>
                  <input
                    id="website_checking_field"
                    type="text"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                {/* Anti-Bot Human Verification */}
                <div className="p-5 bg-stone-50 border border-stone-150 rounded-2xl space-y-3" id="form-captcha">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black tracking-wider text-stone-700 uppercase">
                      {language === 'en' ? 'HUMAN VERIFICATION (SPAM PROTECTION)' : 'VERIFICACIÓN HUMANA (PROTECCIÓN SPAM)'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <p className="text-xs font-bold text-stone-600 bg-white border border-stone-200 px-4 py-2 rounded-xl shadow-sm">
                      {language === 'en' ? 'What is' : 'Cuánto es'} <span className="font-mono text-stone-900 text-sm font-black underline decoration-rose-500 decoration-2">{captchaChallenge.num1} + {captchaChallenge.num2}</span>?
                    </p>
                    <div className="flex-1 w-full">
                      <input
                        type="number"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        placeholder={language === 'en' ? 'Your answer' : 'Tu respuesta'}
                        className="w-full sm:w-32 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all font-mono"
                      />
                      {errors.captcha && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                          {errors.captcha}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Action Block */}
                <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[9px] text-[#1A1A1A]/40 font-black uppercase tracking-widest max-w-sm text-center sm:text-left leading-relaxed">
                    {language === 'en'
                      ? 'By submitting, you agree to receive follow-up messages on Instagram or Email.'
                      : 'Al enviar, aceptas recibir respuestas de seguimiento por Instagram o correo.'}
                  </p>
                  
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-[#E53E3E] text-white font-black uppercase tracking-[0.2em] text-xs rounded-full transition-all duration-300 cursor-pointer shadow-lg shadow-rose-500/10 hover:bg-black hover:shadow-xl hover:shadow-stone-900/10 active:scale-[0.98]"
                    id="form-submit-button"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {t.btnSubmit}
                  </button>
                </div>

              </motion.form>
            ) : (
              // Success Screen
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6"
                id="booking-success-screen"
              >
                <div className="h-16 w-16 bg-rose-50 text-[#E53E3E] rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] uppercase tracking-tighter">
                    {t.submitSuccessTitle}
                  </h3>
                  <p className="text-stone-500 text-sm font-sans max-w-md mx-auto leading-relaxed">
                    {t.submitSuccessMsg}
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 border border-stone-100 rounded-full text-stone-800 font-bold uppercase tracking-wider text-[9px] max-w-xs mx-auto flex items-center justify-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>
                    {language === 'en' ? 'INQUIRY SAVED SECURELY' : 'CONSULTA REGISTRADA CON ÉXITO'}
                  </span>
                </div>

                {/* Direct Instant WhatsApp Redirection for Client */}
                <div className="pt-2 max-w-sm mx-auto space-y-3">
                  {(() => {
                    const artistWhatsApp = localStorage.getItem('hans_artist_whatsapp') || '16462709292';
                    const clientMessage = language === 'en'
                      ? `Hi Hans! I just submitted a tattoo consultation inquiry on your website. My name is ${fullName}, and I would love a ${sizeCm}cm ${style} tattoo on my ${placement}. Looking forward to connecting!`
                      : `¡Hola Hans! Acabo de enviar una consulta para un tatuaje en tu web. Mi nombre es ${fullName}, y me encantaría un tatuaje de ${sizeCm}cm estilo ${style} en mi ${placement}. ¡Quedo atento a tus comentarios!`;
                    const encodedClientMsg = encodeURIComponent(clientMessage);
                    const clientWhatsAppUrl = `https://wa.me/${artistWhatsApp}?text=${encodedClientMsg}`;

                    return (
                      <a
                        href={clientWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center px-6 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full text-xs font-black tracking-[0.15em] uppercase transition-all shadow-md shadow-emerald-500/10 hover:shadow-lg active:scale-[0.98]"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Connect Instantly on WhatsApp' : 'Conectar al Instante por WhatsApp'}
                      </a>
                    );
                  })()}

                  {/* Artist Direct Outreach Tool */}
                  <div className="p-5 bg-stone-50 border border-stone-200 rounded-3xl space-y-3.5 mt-4 text-center">
                    <div className="flex items-center space-x-2 justify-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E53E3E] animate-pulse"></span>
                      <span className="text-[9px] font-black tracking-widest text-stone-500 uppercase">
                        {language === 'en' ? 'ARTIST TESTING DEEP LINK' : 'HERRAMIENTA DE CONTACTO PARA EL ARTISTA'}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider leading-relaxed">
                      {language === 'en' 
                        ? "Open a pre-filled chat with the client's phone number and design details." 
                        : "Inicia un chat con el número del cliente, pre-rellenado con los detalles."}
                    </p>
                    <a
                      href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        language === 'en'
                          ? `Hi ${fullName}! This is Hans Toribio. I received your tattoo inquiry for a ${sizeCm}cm ${style} tattoo on your ${placement}. I'd love to discuss details with you!`
                          : `¡Hola ${fullName}! Te escribe Hans Toribio. Recibí tu consulta para un tatuaje de ${sizeCm}cm estilo ${style} en tu ${placement}. ¡Me encantaría conversar sobre los detalles contigo!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-5 py-3 bg-stone-900 hover:bg-black text-white rounded-full text-[10px] font-black tracking-wider uppercase transition-all shadow-sm w-full"
                    >
                      <Phone className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                      {language === 'en' ? 'Open Chat with Client' : 'Abrir Chat con el Cliente'}
                    </a>
                  </div>

                  <button
                    onClick={handleReset}
                    className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-stone-950 text-white rounded-full text-xs font-black tracking-[0.15em] uppercase hover:bg-stone-800 transition-colors cursor-pointer shadow-md"
                  >
                    {t.submitSuccessAction}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
