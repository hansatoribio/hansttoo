import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Upload, Trash2, HelpCircle, Check, Loader2 } from 'lucide-react';
import { PortfolioItem, TattooStyle } from '../types';
import { uploadImageToDrive, getAccessToken } from '../lib/workspace';
import { uploadImageToSupabase, isSupabaseConfigured } from '../lib/supabase';
import { isVideoUrl, getGoogleDriveEmbedUrl } from '../lib/media';

interface VisualElementEditorModalProps {
  language: 'en' | 'es';
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  onDelete?: () => void;
  editConfig: {
    type: 'text' | 'image' | 'portfolio' | 'faq' | 'new-portfolio' | 'new-faq';
    key?: string; // For static translations key
    id?: string; // For dynamic objects ID
    data?: any; // Prefilled current state data
  } | null;
}

export default function VisualElementEditorModal({
  language,
  isOpen,
  onClose,
  onSave,
  onDelete,
  editConfig
}: VisualElementEditorModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const isGoogleConnected = !!getAccessToken();

  // Unified Form States
  const [textEn, setTextEn] = useState('');
  const [textEs, setTextEs] = useState('');
  
  // Image & Label Specific Form States
  const [imageUrl, setImageUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [labelEn, setLabelEn] = useState('');
  const [labelEs, setLabelEs] = useState('');

  // Portfolio Specific Form States
  const [portfolioStyle, setPortfolioStyle] = useState<TattooStyle>('fineline');
  const [portfolioSize, setPortfolioSize] = useState('');
  const [portfolioDuration, setPortfolioDuration] = useState('');
  const [portfolioRecovery, setPortfolioRecovery] = useState(10);
  const [portfolioStoryEn, setPortfolioStoryEn] = useState('');
  const [portfolioStoryEs, setPortfolioStoryEs] = useState('');
  const [portfolioPlacementEn, setPortfolioPlacementEn] = useState('');
  const [portfolioPlacementEs, setPortfolioPlacementEs] = useState('');

  // FAQ Specific Form States
  const [faqQEn, setFaqQEn] = useState('');
  const [faqQEs, setFaqQEs] = useState('');
  const [faqAEn, setFaqAEn] = useState('');
  const [faqAEs, setFaqAEs] = useState('');

  // Hydrate form fields when editConfig changes
  useEffect(() => {
    if (!editConfig) return;

    const { type, data } = editConfig;

    if (type === 'text' && data) {
      setTextEn(data.en || '');
      setTextEs(data.es || '');
    } else if (type === 'image' && data) {
      setImageUrl(data.url || '');
      setMediaType(data.mediaType || (isVideoUrl(data.url) ? 'video' : 'image'));
      setLabelEn(data.labelEn || '');
      setLabelEs(data.labelEs || '');
    } else if ((type === 'portfolio' || type === 'new-portfolio') && data) {
      setTextEn(data.titleEn || '');
      setTextEs(data.titleEs || '');
      setImageUrl(data.imageUrl || '');
      setMediaType(data.mediaType || (isVideoUrl(data.imageUrl) ? 'video' : 'image'));
      setPortfolioStyle(data.style || 'fineline');
      setPortfolioSize(data.size || '10 cm x 10 cm');
      setPortfolioDuration(data.duration || '2 hrs');
      setPortfolioRecovery(data.recoveryDays || 10);
      setPortfolioPlacementEn(data.placementEn || '');
      setPortfolioPlacementEs(data.placementEs || '');
      setPortfolioStoryEn(data.storyEn || '');
      setPortfolioStoryEs(data.storyEs || '');
    } else if (type === 'new-portfolio') {
      setTextEn('');
      setTextEs('');
      setImageUrl('');
      setMediaType('image');
      setPortfolioStyle('fineline');
      setPortfolioSize('10 cm x 10 cm');
      setPortfolioDuration('2 hrs');
      setPortfolioRecovery(10);
      setPortfolioPlacementEn('');
      setPortfolioPlacementEs('');
      setPortfolioStoryEn('');
      setPortfolioStoryEs('');
    } else if ((type === 'faq' || type === 'new-faq') && data) {
      setFaqQEn(data.qEn || '');
      setFaqQEs(data.qEs || '');
      setFaqAEn(data.aEn || '');
      setFaqAEs(data.aEs || '');
    } else if (type === 'new-faq') {
      setFaqQEn('');
      setFaqQEs('');
      setFaqAEn('');
      setFaqAEs('');
    }
  }, [editConfig]);

  if (!isOpen || !editConfig) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    setLoading(true);
    setUploadProgress(
      language === 'en' 
        ? (isVideo ? 'Reading video file...' : 'Reading image file...') 
        : (isVideo ? 'Leyendo archivo de video...' : 'Leyendo archivo de imagen...')
    );

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Str = event.target?.result as string;
        if (!base64Str) {
          setLoading(false);
          setUploadProgress(null);
          return;
        }

        if (isSupabaseConfigured) {
          setUploadProgress(language === 'en' ? 'Uploading to Supabase Storage...' : 'Subiendo a Supabase Storage...');
          try {
            const publicUrl = await uploadImageToSupabase(base64Str, `cms-${Date.now()}`);
            setImageUrl(publicUrl);
            setMediaType(isVideo ? 'video' : 'image');
            setUploadProgress(language === 'en' ? 'Success! Image saved to Supabase' : '¡Éxito! Imagen guardada en Supabase');
          } catch (err: any) {
            console.error('Supabase upload failed', err);
            setImageUrl(base64Str);
            setMediaType(isVideo ? 'video' : 'image');
            setUploadProgress(language === 'en' ? 'Saved as local preview' : 'Guardado como vista previa');
          }
        } else if (isGoogleConnected) {
          setUploadProgress(language === 'en' ? 'Uploading to Google Drive...' : 'Subiendo a Google Drive...');
          try {
            const driveUrl = await uploadImageToDrive(base64Str, `hansttoo_${Date.now()}_${file.name}`);
            setImageUrl(driveUrl);
            setMediaType(isVideo ? 'video' : 'image');
            setUploadProgress(language === 'en' ? 'Success! Saved to Drive' : '¡Éxito! Guardado en Drive');
          } catch (err: any) {
            console.error('Drive upload failed', err);
            setImageUrl(base64Str);
            setMediaType(isVideo ? 'video' : 'image');
            setUploadProgress(language === 'en' ? 'Upload failed. Kept as offline base64' : 'Fallo de subida. Guardado como base64 local');
          }
        } else {
          setImageUrl(base64Str);
          setMediaType(isVideo ? 'video' : 'image');
          setUploadProgress(language === 'en' ? 'Saved as local base64' : 'Guardado como base64 local');
        }
        setLoading(false);
        setTimeout(() => setUploadProgress(null), 3000);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setUploadProgress(language === 'en' ? 'Error processing file' : 'Error al procesar archivo');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { type, key, id } = editConfig;

    if (type === 'text') {
      onSave({ key, en: textEn, es: textEs });
    } else if (type === 'image') {
      onSave({ key, url: imageUrl, labelEn, labelEs, mediaType });
    } else if (type === 'portfolio' || type === 'new-portfolio') {
      const portfolioData: Partial<PortfolioItem> = {
        id: id || `p-${Date.now()}`,
        titleEn: textEn,
        titleEs: textEs,
        imageUrl,
        mediaType,
        style: portfolioStyle,
        size: portfolioSize,
        duration: portfolioDuration,
        recoveryDays: Number(portfolioRecovery) || 10,
        placementEn: portfolioPlacementEn,
        placementEs: portfolioPlacementEs,
        storyEn: portfolioStoryEn,
        storyEs: portfolioStoryEs
      };
      onSave(portfolioData);
    } else if (type === 'faq' || type === 'new-faq') {
      onSave({
        id: id || `faq-${Date.now()}`,
        qEn: faqQEn,
        qEs: faqQEs,
        aEn: faqAEn,
        aEs: faqAEs
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fadeIn" id="visual-editor-modal">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#FCFBFA] rounded-3xl border border-stone-200 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col animate-scaleUp">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-150 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[9px] font-black tracking-widest text-[#E53E3E] uppercase block mb-1">
              {language === 'en' ? 'LIVE VISUAL CMS EDITOR' : 'EDITOR VISUAL EN TIEMPO REAL'}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[#1A1A1A] uppercase tracking-tight font-display">
              {editConfig.type === 'text' && (language === 'en' ? 'Edit Website Text' : 'Editar Texto de la Web')}
              {editConfig.type === 'image' && (language === 'en' ? 'Edit Section Image' : 'Editar Imagen de Sección')}
              {editConfig.type === 'portfolio' && (language === 'en' ? 'Edit Portfolio Piece' : 'Editar Pieza de Portafolio')}
              {editConfig.type === 'new-portfolio' && (language === 'en' ? 'Add New Portfolio Design' : 'Añadir Diseño de Portafolio')}
              {editConfig.type === 'faq' && (language === 'en' ? 'Edit FAQ Accordion' : 'Editar Pregunta FAQ')}
              {editConfig.type === 'new-faq' && (language === 'en' ? 'Add New FAQ Item' : 'Añadir Nueva Pregunta FAQ')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full border border-stone-150 text-stone-400 hover:text-black hover:bg-stone-50 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Drive status message */}
          {(editConfig.type === 'image' || editConfig.type === 'portfolio' || editConfig.type === 'new-portfolio') && (
            <div className={`p-3 rounded-2xl border text-[11px] font-medium leading-normal flex items-center gap-2.5 ${
              isGoogleConnected 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-850' 
                : 'bg-stone-100 border-stone-200 text-stone-600'
            }`}>
              <span className={`h-2 w-2 rounded-full shrink-0 ${isGoogleConnected ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
              <span>
                {isGoogleConnected ? (
                  language === 'en'
                    ? 'Cloud Integrated: Files uploaded here will save directly to your Google Drive folder and sync to the cloud!'
                    : 'Integración en la Nube: Los archivos se subirán directamente a tu Google Drive para máxima estabilidad.'
                ) : (
                  language === 'en'
                    ? 'Offline Mode: Files are saved in browser state. For persistent cloud storage, login with Google on the Artist Portal.'
                    : 'Modo Offline: Archivos guardados en el navegador. Para almacenamiento persistente en la nube, entra con Google en el Portal.'
                )}
              </span>
            </div>
          )}

          {/* Render Text Fields (English and Spanish) */}
          {editConfig.type === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                  English Text Content
                </label>
                <textarea
                  value={textEn}
                  onChange={(e) => setTextEn(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-xs sm:text-sm text-stone-850 outline-none transition-all resize-y font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                  Contenido de Texto en Español
                </label>
                <textarea
                  value={textEs}
                  onChange={(e) => setTextEs(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-xs sm:text-sm text-stone-850 outline-none transition-all resize-y font-medium"
                />
              </div>
            </div>
          )}

          {/* Render Image/Intro Photo Fields */}
          {editConfig.type === 'image' && (
            <div className="space-y-5">
              {/* Image Preview & Upload Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                    {language === 'en' ? 'Upload Image or Video File' : 'Subir archivo de Imagen o Video'}
                  </label>
                  <div className="relative border border-dashed border-stone-250 rounded-2xl p-4 flex flex-col items-center justify-center bg-white hover:bg-stone-50/40 transition-colors cursor-pointer group min-h-[140px]">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-6 h-6 text-[#E53E3E] group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-700">
                      {language === 'en' ? 'Select File' : 'Seleccionar Archivo'}
                    </span>
                    <span className="text-[9px] text-stone-400 font-medium mt-1">
                      {language === 'en' ? 'Images or MP4/WebM Videos' : 'Imágenes o Videos MP4/WebM'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                    {language === 'en' ? 'Media Preview' : 'Vista Previa'}
                  </span>
                  <div className="aspect-[3/4] max-h-[140px] rounded-2xl border border-stone-200 overflow-hidden bg-stone-50 flex items-center justify-center relative">
                    {imageUrl ? (
                      mediaType === 'video' || isVideoUrl(imageUrl) ? (
                        getGoogleDriveEmbedUrl(imageUrl) ? (
                          <iframe
                            src={getGoogleDriveEmbedUrl(imageUrl)!}
                            className="w-full h-full border-0 pointer-events-none"
                            title="Google Drive Video Preview"
                          />
                        ) : (
                          <video
                            src={imageUrl}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            autoPlay
                          />
                        )
                      ) : (
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <ImageIcon className="w-8 h-8 text-stone-300" />
                    )}
                  </div>
                </div>
              </div>

              {/* Status helper text for uploads */}
              {uploadProgress && (
                <div className="text-[10px] font-bold text-[#E53E3E] flex items-center gap-1.5 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{uploadProgress}</span>
                </div>
              )}

              {/* Manual Media Type Toggler */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                  Media Type / Tipo de Contenido
                </label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-bold text-[#E53E3E] outline-none"
                >
                  <option value="image">🖼️ {language === 'en' ? 'Image' : 'Imagen'}</option>
                  <option value="video">🎥 {language === 'en' ? 'Video' : 'Video'}</option>
                </select>
              </div>

              {/* Direct URL input fallback */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                  Direct Media URL (Image, Video, or Google Drive)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setImageUrl(val);
                    if (isVideoUrl(val)) {
                      setMediaType('video');
                    } else if (val && !val.includes('drive.google.com')) {
                      setMediaType('image');
                    }
                  }}
                  placeholder="https://images.unsplash.com/... or Google Drive video link"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-xs text-stone-850 outline-none transition-all"
                />
              </div>

              {/* Labels for images (En/Es) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                    English Label / Subtitle
                  </label>
                  <input
                    type="text"
                    value={labelEn}
                    onChange={(e) => setLabelEn(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-xs sm:text-sm text-stone-850 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                    Etiqueta / Subtítulo en Español
                  </label>
                  <input
                    type="text"
                    value={labelEs}
                    onChange={(e) => setLabelEs(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-xs sm:text-sm text-stone-850 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Render Portfolio / New Portfolio Form */}
          {(editConfig.type === 'portfolio' || editConfig.type === 'new-portfolio') && (
            <div className="space-y-5 text-left">
              
              {/* Title Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                    Design Title (English)
                  </label>
                  <input
                    type="text"
                    value={textEn}
                    onChange={(e) => setTextEn(e.target.value)}
                    required
                    placeholder="E.g. Lunar Rose"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-xs sm:text-sm text-stone-850 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                    Título del Diseño (Español)
                  </label>
                  <input
                    type="text"
                    value={textEs}
                    onChange={(e) => setTextEs(e.target.value)}
                    required
                    placeholder="Ej. Rosa Lunar"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-xs sm:text-sm text-stone-850 outline-none"
                  />
                </div>
              </div>

              {/* Upload & Image/Video URLs for Portfolio Design */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                    {language === 'en' ? 'Upload Design Artwork or Video' : 'Subir Arte o Video de Diseño'}
                  </label>
                  <div className="relative border border-dashed border-stone-250 rounded-2xl p-4 flex flex-col items-center justify-center bg-white hover:bg-stone-50/40 transition-colors cursor-pointer group min-h-[140px]">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-6 h-6 text-[#E53E3E] group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-700">
                      {language === 'en' ? 'Select File' : 'Seleccionar Archivo'}
                    </span>
                    <span className="text-[9px] text-stone-400 font-medium mt-1">
                      {language === 'en' ? 'JPG, PNG, WEBP, MP4, etc.' : 'JPG, PNG, WEBP, MP4, etc.'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                    {language === 'en' ? 'Design Preview' : 'Vista Previa del Diseño'}
                  </span>
                  <div className="aspect-square max-h-[140px] rounded-2xl border border-stone-200 overflow-hidden bg-stone-50 flex items-center justify-center relative">
                    {imageUrl ? (
                      mediaType === 'video' || isVideoUrl(imageUrl) ? (
                        getGoogleDriveEmbedUrl(imageUrl) ? (
                          <iframe
                            src={getGoogleDriveEmbedUrl(imageUrl)!}
                            className="w-full h-full border-0 pointer-events-none"
                            title="Google Drive Portfolio Video Preview"
                          />
                        ) : (
                          <video
                            src={imageUrl}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            autoPlay
                          />
                        )
                      ) : (
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <ImageIcon className="w-8 h-8 text-stone-300" />
                    )}
                  </div>
                </div>
              </div>

              {uploadProgress && (
                <div className="text-[10px] font-bold text-[#E53E3E] flex items-center gap-1.5 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{uploadProgress}</span>
                </div>
              )}

              {/* Media Type Dropdown for Portfolio */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                  Media Type / Tipo de Contenido
                </label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-bold text-[#E53E3E] outline-none"
                >
                  <option value="image">🖼️ {language === 'en' ? 'Image' : 'Imagen'}</option>
                  <option value="video">🎥 {language === 'en' ? 'Video' : 'Video'}</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                  Direct Artwork or Video URL (Image/Video or Google Drive link)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setImageUrl(val);
                    if (isVideoUrl(val)) {
                      setMediaType('video');
                    } else if (val && !val.includes('drive.google.com')) {
                      setMediaType('image');
                    }
                  }}
                  placeholder="https://images.unsplash.com/... or Google Drive video link"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-xs text-stone-850 outline-none"
                />
              </div>

              {/* Style, Size, Duration, Healing Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                    Tattoo Style
                  </label>
                  <select
                    value={portfolioStyle}
                    onChange={(e) => setPortfolioStyle(e.target.value as TattooStyle)}
                    className="w-full px-3 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs text-stone-850 outline-none font-bold"
                  >
                    <option value="fineline">Fine Line</option>
                    <option value="microrealism">Microrealism</option>
                    <option value="anime">Anime</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                    Size (cm)
                  </label>
                  <input
                    type="text"
                    value={portfolioSize}
                    onChange={(e) => setPortfolioSize(e.target.value)}
                    required
                    placeholder="E.g. 10cm x 5cm"
                    className="w-full px-3 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs text-stone-850 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                    Time / Duration
                  </label>
                  <input
                    type="text"
                    value={portfolioDuration}
                    onChange={(e) => setPortfolioDuration(e.target.value)}
                    required
                    placeholder="E.g. 2.5 hrs"
                    className="w-full px-3 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs text-stone-850 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                    Healing Days
                  </label>
                  <input
                    type="number"
                    value={portfolioRecovery}
                    onChange={(e) => setPortfolioRecovery(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs text-stone-850 outline-none font-bold"
                  />
                </div>
              </div>

              {/* Placement Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                    Recommended Placement (English)
                  </label>
                  <input
                    type="text"
                    value={portfolioPlacementEn}
                    onChange={(e) => setPortfolioPlacementEn(e.target.value)}
                    required
                    placeholder="E.g. Forearm / Ribs"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-xs text-stone-850 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                    Zona de Colocación (Español)
                  </label>
                  <input
                    type="text"
                    value={portfolioPlacementEs}
                    onChange={(e) => setPortfolioPlacementEs(e.target.value)}
                    required
                    placeholder="Ej. Antebrazo / Costillas"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-xs text-stone-850 outline-none"
                  />
                </div>
              </div>

              {/* Story / Description Inputs */}
              <div className="space-y-4 pt-1">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                    Design Story & Concept Details (English)
                  </label>
                  <textarea
                    value={portfolioStoryEn}
                    onChange={(e) => setPortfolioStoryEn(e.target.value)}
                    required
                    rows={3}
                    placeholder="Tell clients the artistic story or technical needle choices..."
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-xs text-stone-850 outline-none resize-y"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1.5">
                    Historia del Diseño y Concepto (Español)
                  </label>
                  <textarea
                    value={portfolioStoryEs}
                    onChange={(e) => setPortfolioStoryEs(e.target.value)}
                    required
                    rows={3}
                    placeholder="Cuenta a los clientes la historia o las agujas usadas en esta pieza..."
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-xs text-stone-850 outline-none resize-y"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Render FAQ Form */}
          {(editConfig.type === 'faq' || editConfig.type === 'new-faq') && (
            <div className="space-y-5">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black tracking-widest text-stone-400 uppercase border-b pb-1">
                  ENGLISH VERSION
                </h4>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
                    Question En
                  </label>
                  <input
                    type="text"
                    value={faqQEn}
                    onChange={(e) => setFaqQEn(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-xs text-stone-850 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
                    Answer En
                  </label>
                  <textarea
                    value={faqAEn}
                    onChange={(e) => setFaqAEn(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-xs text-stone-850 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-3">
                <h4 className="text-[10px] font-black tracking-widest text-stone-400 uppercase border-b pb-1">
                  VERSIÓN EN ESPAÑOL
                </h4>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
                    Pregunta Es
                  </label>
                  <input
                    type="text"
                    value={faqQEs}
                    onChange={(e) => setFaqQEs(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-xs text-stone-850 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
                    Respuesta Es
                  </label>
                  <textarea
                    value={faqAEs}
                    onChange={(e) => setFaqAEs(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-xs text-stone-850 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Footer actions */}
        <div className="p-6 border-t border-stone-150 bg-stone-50 flex items-center justify-between shrink-0">
          <div>
            {onDelete && editConfig.id && (editConfig.type === 'portfolio' || editConfig.type === 'faq') && (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center space-x-1 px-4 py-2.5 rounded-full border border-rose-200 hover:border-rose-400 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Delete Item' : 'Eliminar'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-stone-200 hover:border-stone-400 hover:bg-stone-100 text-stone-600 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              {language === 'en' ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center space-x-1 px-6 py-2.5 rounded-full bg-stone-900 hover:bg-[#E53E3E] text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Save Changes' : 'Guardar'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
