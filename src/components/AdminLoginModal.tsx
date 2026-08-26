import React, { useState, useEffect } from 'react';
import { X, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  language: 'en' | 'es';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLoginModal({
  language,
  isOpen,
  onClose,
  onSuccess
}: AdminLoginModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Lock body scroll when admin login modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanPass = passcode.trim();
    const storedPasscode = localStorage.getItem('hans_admin_passcode') || 'hans2026';
    
    // Accepted master passcodes
    const validCodes = [
      storedPasscode.toLowerCase(),
      'hans2026',
      'hansadmin',
      'hansttoo',
      'hans',
      'm7bi+ihm/f/vya#'
    ];

    if (validCodes.includes(cleanPass.toLowerCase()) || cleanPass === 'M7Bi+ihM/F/vya#') {
      onSuccess();
      onClose();
    } else {
      setError(
        language === 'en'
          ? 'Incorrect passcode. Please try again.'
          : 'Código incorrecto. Por favor, inténtalo de nuevo.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fadeIn" id="admin-login-modal">
      
      {/* Outer Click Close Guard */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#FCFBFA] rounded-3xl border border-stone-200/80 shadow-2xl overflow-hidden z-10 p-6 sm:p-8 animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full border border-stone-100 hover:border-stone-200 text-stone-400 hover:text-black hover:bg-stone-50 transition-all cursor-pointer"
          title={language === 'en' ? 'Close' : 'Cerrar'}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Icon / Header */}
        <div className="text-center mt-2 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 border border-stone-200 text-[#E53E3E] mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#1A1A1A] uppercase tracking-tight font-display">
            {language === 'en' ? 'ADMIN ACCESS' : 'ACCESO ADMINISTRADOR'}
          </h3>
          <p className="text-xs text-stone-500 font-medium max-w-[280px] mx-auto mt-1 leading-relaxed">
            {language === 'en'
              ? 'This area is restricted to site administrators. Please enter your access code.'
              : 'Esta área está restringida a administradores del sitio. Por favor, ingresa tu código de acceso.'}
          </p>
        </div>

        {/* Error Messaging Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start space-x-3 text-rose-800 text-xs font-semibold animate-pulse">
            <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePasscodeLogin} className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <label className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">
              {language === 'en' ? 'Access Passcode' : 'Código de Acceso'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder={language === 'en' ? 'Enter admin code' : 'Ingresa código de admin'}
                className="w-full px-4 py-3 pr-11 rounded-2xl border border-stone-200 focus:border-stone-400 bg-white text-stone-900 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all text-center"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-stone-200 text-stone-500 hover:text-black text-[11px] font-bold uppercase tracking-wider cursor-pointer bg-transparent"
            >
              {language === 'en' ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 rounded-xl bg-stone-900 hover:bg-[#E53E3E] text-white text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              {language === 'en' ? 'Validate' : 'Validar'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
