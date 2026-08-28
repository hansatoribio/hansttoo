import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpDown,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
  Megaphone,
  Monitor,
  MousePointerClick,
  Percent,
  RefreshCcw,
  Search,
  Tag,
  TrendingUp,
  Users,
  UserRound,
  Zap,
  X,
} from 'lucide-react';
import type { AdminIdentity, AdminVisitMetrics } from '../lib/supabase';
import {
  createSignedInquiryMediaUrls,
  fetchAdminInquiries,
  fetchAdminVisitMetrics,
  getAdminIdentity,
  isSupabaseConfigured,
  markInquiryViewedInSupabase,
  signInAdmin,
  signOutAdmin,
  updateInquiryNotesInSupabase,
  updateInquiryStatusInSupabase,
  updateInquiryTagsInSupabase,
} from '../lib/supabase';
import type { Inquiry, InquiryStatus } from '../types';

const statusOptions: Array<{ value: InquiryStatus; label: string; color: string }> = [
  { value: 'pending', label: 'Pendiente', color: 'bg-amber-100 text-amber-900' },
  { value: 'contacted', label: 'Contactado', color: 'bg-blue-100 text-blue-900' },
  { value: 'replied', label: 'Respondió', color: 'bg-violet-100 text-violet-900' },
  { value: 'booked', label: 'Reservado', color: 'bg-emerald-100 text-emerald-900' },
  { value: 'completed', label: 'Completado', color: 'bg-stone-200 text-stone-800' },
  { value: 'declined', label: 'No aceptado', color: 'bg-rose-100 text-rose-900' },
];

const styleLabels: Record<Inquiry['style'], string> = {
  anime: 'Anime / Manga',
  microrealism: 'Microrrealismo',
  fineline: 'Línea fina',
  other: 'Otro',
};

type AttributionChannel = 'google' | 'meta' | 'direct' | 'referral' | 'other';
type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'status' | 'source';

const suggestedTags = ['Prioridad', 'Responder', 'Seguimiento', 'Cotización enviada', 'Cliente recurrente'];
const statusOrder: InquiryStatus[] = ['pending', 'contacted', 'replied', 'booked', 'completed', 'declined'];

function statusMeta(status: InquiryStatus) {
  return statusOptions.find((option) => option.value === status) || statusOptions[0];
}

function formatDate(value: string) {
  if (!value) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/New_York',
  }).format(new Date(value));
}

function attributionLabel(inquiry: Inquiry) {
  const attribution = inquiry.attribution;
  if (!attribution) return 'Origen no registrado';
  const channel = attributionChannel(inquiry);
  if (channel !== 'other') return sourceOptionLabel(channel);
  return attribution.source || 'Origen no registrado';
}

function attributionChannel(inquiry: Inquiry): AttributionChannel {
  const attribution = inquiry.attribution;
  const source = attribution?.source?.toLowerCase() || '';
  const medium = attribution?.medium?.toLowerCase() || '';
  if (attribution?.gclid || attribution?.gbraid || attribution?.wbraid) return 'google';
  if (attribution?.fbclid) return 'meta';
  if (source === 'direct') return 'direct';
  if (medium === 'referral') return 'referral';
  if (source.includes('google') && ['cpc', 'ppc', 'paid', 'paid_search'].includes(medium)) return 'google';
  if (['meta', 'facebook', 'instagram'].some((value) => source.includes(value)) && ['cpc', 'paid', 'paid_social'].includes(medium)) return 'meta';
  return 'other';
}

function attributionExplanation(inquiry: Inquiry) {
  const channel = attributionChannel(inquiry);
  if (channel === 'direct') return 'Abrió la web directamente o desde un enlace sin parámetros de campaña.';
  if (channel === 'google') return 'Consulta atribuida a Google mediante parámetros UTM o identificador de clic.';
  if (channel === 'meta') return 'Consulta atribuida a Meta mediante parámetros UTM o identificador de clic.';
  if (channel === 'referral') return 'Llegó desde un enlace publicado en otro sitio web.';
  return 'No se recibieron suficientes parámetros para clasificar el origen.';
}

function sourceOptionLabel(channel: AttributionChannel) {
  return ({ google: 'Google Ads', meta: 'Meta', direct: 'Visita directa', referral: 'Referencia', other: 'Otro / sin datos' })[channel];
}

function percentage(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function analyticsSourceLabel(source: string) {
  return ({ google: 'Google', meta: 'Meta / Instagram', direct: 'Directo', referral: 'Referencias', other: 'Otro' } as Record<string, string>)[source] || source;
}

function deviceLabel(device: string) {
  return ({ mobile: 'Móvil', tablet: 'Tableta', desktop: 'Computadora' } as Record<string, string>)[device] || device;
}

function shortMetricDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es-US', { month: 'short', day: 'numeric' }).format(date);
}

function safeDateValue(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function contactLink(inquiry: Inquiry): { href: string; label: string; icon: typeof Mail } | null {
  if (inquiry.preferredContactMethod === 'instagram' && inquiry.instagram) {
    return {
      href: `https://instagram.com/${inquiry.instagram.replace(/^@/, '')}`,
      label: `Abrir ${inquiry.instagram}`,
      icon: ExternalLink,
    };
  }
  if ((inquiry.preferredContactMethod === 'phone' || inquiry.preferredContactMethod === 'whatsapp') && inquiry.phone) {
    return {
      href: `https://wa.me/${inquiry.phone.replace(/\D/g, '')}`,
      label: 'Abrir WhatsApp',
      icon: MessageCircle,
    };
  }
  if (inquiry.email) {
    return { href: `mailto:${inquiry.email}`, label: 'Enviar correo', icon: Mail };
  }
  if (inquiry.instagram) {
    return {
      href: `https://instagram.com/${inquiry.instagram.replace(/^@/, '')}`,
      label: `Abrir ${inquiry.instagram}`,
      icon: ExternalLink,
    };
  }
  if (inquiry.phone) {
    return {
      href: `https://wa.me/${inquiry.phone.replace(/\D/g, '')}`,
      label: 'Abrir WhatsApp',
      icon: MessageCircle,
    };
  }
  return null;
}

function AdminLogin({ onAuthenticated }: { onAuthenticated: (identity: AdminIdentity) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Escribe el correo y la contraseña de tu usuario administrador.');
      return;
    }
    setLoading(true);
    try {
      onAuthenticated(await signInAdmin(email, password));
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : '';
      setError(message === 'not-authorized'
        ? 'Este usuario inició sesión, pero no tiene permiso de administrador.'
        : 'No se pudo iniciar sesión. Revisa el correo y la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F3F0EC] px-4 py-10 text-stone-950 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <a href="/" className="inline-flex items-center text-sm font-bold text-stone-600 hover:text-stone-950">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />Volver al sitio
        </a>
        <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-xl shadow-stone-900/5 sm:p-8">
          <p className="text-xs font-black tracking-[0.2em] text-[#C9362B]">HANSTTOO ADMIN</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.05em]">Panel de consultas</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">Acceso privado para revisar solicitudes recibidas y actualizar su seguimiento.</p>

          {!isSupabaseConfigured ? (
            <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-900">
              El panel no está configurado. Faltan las variables públicas de Supabase.
            </div>
          ) : null}

          {error ? (
            <div role="alert" className="mt-6 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-7 space-y-5">
            <label className="block text-sm font-black" htmlFor="admin-email">
              Correo de administrador
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 min-h-12 w-full rounded-2xl border border-stone-300 px-4 text-base outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/10"
              />
            </label>
            <label className="block text-sm font-black" htmlFor="admin-password">
              Contraseña
              <span className="relative mt-2 block">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-h-12 w-full rounded-2xl border border-stone-300 px-4 pr-12 text-base outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-xl text-stone-500 hover:text-stone-950"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                </button>
              </span>
            </label>
            <button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-stone-950 px-5 text-sm font-black text-white hover:bg-[#C9362B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {loading ? 'Verificando…' : 'INICIAR SESIÓN'}
            </button>
          </form>
          <p className="mt-5 text-xs leading-5 text-stone-500">La contraseña se valida con Supabase Auth y no se guarda en el código del sitio.</p>
        </section>
      </div>
    </main>
  );
}

function LeadDetail({
  inquiry,
  onClose,
  onUpdated,
}: {
  inquiry: Inquiry;
  onClose: () => void;
  onUpdated: (next: Inquiry) => void;
}) {
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status);
  const [notes, setNotes] = useState(inquiry.artistNotes || '');
  const [tags, setTags] = useState<string[]>(inquiry.tags || []);
  const [customTag, setCustomTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [mediaLoading, setMediaLoading] = useState(false);
  const contact = contactLink(inquiry);
  const mediaPaths = useMemo(
    () => [inquiry.placementPhoto || '', ...inquiry.referenceImages].filter(Boolean),
    [inquiry.placementPhoto, inquiry.referenceImages],
  );

  useEffect(() => {
    let active = true;
    if (!mediaPaths.length) return undefined;
    setMediaLoading(true);
    createSignedInquiryMediaUrls(mediaPaths)
      .then((urls) => {
        if (active) setMediaUrls(urls);
      })
      .finally(() => {
        if (active) setMediaLoading(false);
      });
    return () => {
      active = false;
    };
  }, [mediaPaths]);

  const save = async () => {
    setSaving(true);
    setMessage('');
    const [statusSaved, notesSaved, tagsSaved] = await Promise.all([
      status === inquiry.status ? Promise.resolve(true) : updateInquiryStatusInSupabase(inquiry.id, status),
      notes.trim() === (inquiry.artistNotes || '').trim()
        ? Promise.resolve(true)
        : updateInquiryNotesInSupabase(inquiry.id, notes),
      JSON.stringify(tags) === JSON.stringify(inquiry.tags || [])
        ? Promise.resolve(true)
        : updateInquiryTagsInSupabase(inquiry.id, tags),
    ]);
    if (statusSaved && notesSaved && tagsSaved) {
      onUpdated({ ...inquiry, status, artistNotes: notes.trim(), tags });
      setMessage('Cambios guardados.');
    } else {
      setMessage('No se pudieron guardar los cambios. Revisa tu sesión y las políticas de acceso.');
    }
    setSaving(false);
  };

  const toggleTag = (tag: string) => {
    setTags((current) => current.includes(tag)
      ? current.filter((item) => item !== tag)
      : current.length < 8 ? [...current, tag] : current);
  };

  const addCustomTag = () => {
    const normalized = customTag.trim().slice(0, 28);
    if (!normalized || tags.some((tag) => tag.toLowerCase() === normalized.toLowerCase()) || tags.length >= 8) return;
    setTags((current) => [...current, normalized]);
    setCustomTag('');
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-stone-950/60 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="lead-title">
      <div className="mx-auto min-h-full max-w-3xl py-3 sm:py-8">
        <div className="rounded-[2rem] bg-white p-5 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${statusMeta(inquiry.status).color}`}>{statusMeta(inquiry.status).label}</span>
                {!inquiry.viewedAt ? <span className="inline-flex rounded-full bg-[#C9362B] px-3 py-1 text-xs font-black text-white">NUEVO</span> : null}
                {(inquiry.tags || []).map((tag) => <span key={tag} className="inline-flex rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-white">{tag}</span>)}
              </div>
              <h2 id="lead-title" className="mt-3 text-3xl font-black tracking-[-0.04em]">{inquiry.fullName}</h2>
              <p className="mt-1 text-sm text-stone-500">{formatDate(inquiry.createdAt)}</p>
            </div>
            <button onClick={onClose} className="rounded-full p-3 text-stone-500 hover:bg-stone-100 hover:text-stone-950" aria-label="Cerrar detalles">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-stone-100 p-4"><p className="text-xs font-black uppercase tracking-wider text-stone-500">Estilo</p><p className="mt-1 font-bold">{styleLabels[inquiry.style]}</p></div>
            <div className="rounded-2xl bg-stone-100 p-4"><p className="text-xs font-black uppercase tracking-wider text-stone-500">Tamaño</p><p className="mt-1 font-bold">{(inquiry.sizeCm / 2.54).toFixed(1)} in · {inquiry.sizeCm.toFixed(1)} cm</p></div>
            <div className="rounded-2xl bg-stone-100 p-4 sm:col-span-2"><p className="text-xs font-black uppercase tracking-wider text-stone-500">Zona</p><p className="mt-1 font-bold">{inquiry.placement}</p></div>
          </div>

          <div className="mt-6 rounded-2xl border border-stone-200 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-stone-500">Idea</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-800">{inquiry.description}</p>
          </div>

          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <p className="rounded-2xl border border-stone-200 p-4"><Mail className="mb-2 h-4 w-4 text-stone-400" aria-hidden="true" /><span className="break-all">{inquiry.email || 'Sin correo'}</span></p>
            <p className="rounded-2xl border border-stone-200 p-4"><ExternalLink className="mb-2 h-4 w-4 text-stone-400" aria-hidden="true" /><span className="break-all">{inquiry.instagram || 'Sin Instagram'}</span></p>
            <p className="rounded-2xl border border-stone-200 p-4"><MessageCircle className="mb-2 h-4 w-4 text-stone-400" aria-hidden="true" /><span className="break-all">{inquiry.phone || 'Sin teléfono'}</span></p>
          </div>

          {contact ? (
            <a href={contact.href} target={contact.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#C9362B] px-5 text-sm font-black text-white hover:bg-stone-950">
              <contact.icon className="mr-2 h-4 w-4" aria-hidden="true" />{contact.label}
            </a>
          ) : null}

          {inquiry.attribution ? (
            <div className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-stone-500" aria-hidden="true" />
                <p className="text-xs font-black uppercase tracking-wider text-stone-500">Origen de la consulta</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-600">{attributionExplanation(inquiry)}</p>
              <div className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <p><span className="block text-xs text-stone-500">Canal</span><span className="font-bold">{attributionLabel(inquiry)}</span></p>
                <p><span className="block text-xs text-stone-500">Medio</span><span className="font-bold">{inquiry.attribution.medium === 'none' ? 'Sin campaña' : inquiry.attribution.medium || 'No indicado'}</span></p>
                <p><span className="block text-xs text-stone-500">Campaña</span><span className="break-words font-bold">{inquiry.attribution.campaign || (attributionChannel(inquiry) === 'direct' ? 'No aplica' : 'No indicada')}</span></p>
                <p><span className="block text-xs text-stone-500">Anuncio / contenido</span><span className="break-words font-bold">{inquiry.attribution.content || (attributionChannel(inquiry) === 'direct' ? 'No aplica' : 'No indicado')}</span></p>
                <p><span className="block text-xs text-stone-500">Palabra clave</span><span className="break-words font-bold">{inquiry.attribution.term || (attributionChannel(inquiry) === 'direct' ? 'No aplica' : 'No indicada')}</span></p>
                <p><span className="block text-xs text-stone-500">Página de entrada</span><span className="break-words font-bold">{inquiry.attribution.landingPath}</span></p>
                {(inquiry.attribution.gclid || inquiry.attribution.gbraid || inquiry.attribution.wbraid || inquiry.attribution.fbclid) ? (
                  <p className="sm:col-span-2"><span className="block text-xs text-stone-500">Identificador publicitario</span><span className="font-bold">Capturado para atribución; valor oculto en el panel.</span></p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mt-7">
            <p className="text-sm font-black">Imágenes de referencia</p>
            {mediaLoading ? <p className="mt-3 inline-flex items-center text-sm text-stone-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Preparando acceso privado…</p> : null}
            {!mediaPaths.length ? <p className="mt-2 text-sm text-stone-500">Esta consulta no incluye imágenes.</p> : null}
            {Object.keys(mediaUrls).length ? (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {mediaPaths.map((path, index) => mediaUrls[path] ? (
                  <a key={path} href={mediaUrls[path]} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                    <img src={mediaUrls[path]} alt={`Referencia privada ${index + 1} de ${inquiry.fullName}`} className="aspect-square w-full object-cover transition group-hover:scale-[1.02]" />
                  </a>
                ) : null)}
              </div>
            ) : null}
          </div>

          <div className="mt-8 grid gap-5 border-t border-stone-200 pt-7 sm:grid-cols-[0.7fr_1.3fr]">
            <label className="text-sm font-black" htmlFor="lead-status">
              Estado
              <select id="lead-status" value={status} onChange={(event) => setStatus(event.target.value as InquiryStatus)} className="mt-2 min-h-12 w-full rounded-2xl border border-stone-300 bg-white px-4">
                {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="text-sm font-black" htmlFor="lead-notes">
              Notas privadas
              <textarea id="lead-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-stone-300 p-4 font-normal" placeholder="Seguimiento, precio estimado o detalles para recordar." />
            </label>
          </div>

          <fieldset className="mt-6 rounded-2xl border border-stone-200 p-4">
            <legend className="px-2 text-sm font-black">Etiquetas del lead</legend>
            <p className="text-xs leading-5 text-stone-500">Úsalas para priorizar y organizar el seguimiento. Máximo 8.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)} aria-pressed={tags.includes(tag)} className={`rounded-full border px-3 py-2 text-xs font-bold ${tags.includes(tag) ? 'border-stone-950 bg-stone-950 text-white' : 'border-stone-300 bg-white text-stone-700 hover:border-stone-950'}`}>
                  {tag}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <label className="sr-only" htmlFor="custom-lead-tag">Etiqueta personalizada</label>
              <input id="custom-lead-tag" value={customTag} maxLength={28} onChange={(event) => setCustomTag(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCustomTag(); } }} placeholder="Etiqueta personalizada" className="min-h-11 min-w-0 flex-1 rounded-2xl border border-stone-300 px-4 text-sm" />
              <button type="button" onClick={addCustomTag} disabled={!customTag.trim() || tags.length >= 8} className="min-h-11 rounded-full border border-stone-300 px-4 text-sm font-black disabled:opacity-40">Añadir</button>
            </div>
            {tags.filter((tag) => !suggestedTags.includes(tag)).length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.filter((tag) => !suggestedTags.includes(tag)).map((tag) => <button key={tag} type="button" onClick={() => toggleTag(tag)} className="rounded-full bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700" aria-label={`Quitar etiqueta ${tag}`}>{tag} ×</button>)}
              </div>
            ) : null}
          </fieldset>

          {message ? <p role="status" className="mt-4 text-sm font-bold text-stone-700">{message}</p> : null}
          <button onClick={save} disabled={saving} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-stone-950 px-5 text-sm font-black text-white hover:bg-[#C9362B] disabled:opacity-50">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />}
            {saving ? 'Guardando…' : 'GUARDAR SEGUIMIENTO'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ identity, onSignedOut }: { identity: AdminIdentity; onSignedOut: () => void }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [visitMetrics, setVisitMetrics] = useState<AdminVisitMetrics | null>(null);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsError, setAnalyticsError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | InquiryStatus>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | AttributionChannel>('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [newOnly, setNewOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>('newest');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setAnalyticsError('');
    const [inquiryResult, metricResult] = await Promise.all([
      fetchAdminInquiries(),
      fetchAdminVisitMetrics(30),
    ]);
    setInquiries(inquiryResult.inquiries);
    setVisitMetrics(metricResult.metrics);
    if (inquiryResult.error) setError('No se pudieron cargar los leads. Revisa que Auth y las políticas RLS estén configuradas.');
    if (metricResult.error) setAnalyticsError('Las métricas todavía no están disponibles. Revisa que la migración de analítica esté aplicada en Supabase.');
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const allTags = useMemo(() => [...new Set<string>(inquiries.flatMap((inquiry) => inquiry.tags || []))].sort((a, b) => a.localeCompare(b, 'es')), [inquiries]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = inquiries.filter((inquiry) => {
      if (filter !== 'all' && inquiry.status !== filter) return false;
      if (sourceFilter !== 'all' && attributionChannel(inquiry) !== sourceFilter) return false;
      if (tagFilter !== 'all' && !(inquiry.tags || []).includes(tagFilter)) return false;
      if (newOnly && inquiry.viewedAt) return false;
      if (!query) return true;
      return [inquiry.fullName, inquiry.email, inquiry.phone, inquiry.instagram, inquiry.placement, inquiry.description, inquiry.attribution?.source, inquiry.attribution?.campaign, inquiry.attribution?.term, ...(inquiry.tags || [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
    return [...filtered].sort((first, second) => {
      if (sort === 'oldest') return safeDateValue(first.createdAt) - safeDateValue(second.createdAt);
      if (sort === 'name-asc') return first.fullName.localeCompare(second.fullName, 'es', { sensitivity: 'base' });
      if (sort === 'name-desc') return second.fullName.localeCompare(first.fullName, 'es', { sensitivity: 'base' });
      if (sort === 'status') return statusOrder.indexOf(first.status) - statusOrder.indexOf(second.status) || safeDateValue(second.createdAt) - safeDateValue(first.createdAt);
      if (sort === 'source') return attributionLabel(first).localeCompare(attributionLabel(second), 'es') || safeDateValue(second.createdAt) - safeDateValue(first.createdAt);
      return safeDateValue(second.createdAt) - safeDateValue(first.createdAt);
    });
  }, [filter, inquiries, newOnly, search, sort, sourceFilter, tagFilter]);

  const stats = useMemo(() => {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const channelCounts = inquiries.reduce<Record<AttributionChannel, number>>((counts, inquiry) => {
      const channel = attributionChannel(inquiry);
      counts[channel] += 1;
      return counts;
    }, { google: 0, meta: 0, direct: 0, referral: 0, other: 0 });
    const styleCounts = inquiries.reduce<Record<string, number>>((counts, inquiry) => {
      counts[inquiry.style] = (counts[inquiry.style] || 0) + 1;
      return counts;
    }, {});
    return {
      newCount: inquiries.filter((item) => !item.viewedAt).length,
      recentCount: inquiries.filter((item) => safeDateValue(item.createdAt) >= sevenDaysAgo).length,
      pendingCount: inquiries.filter((item) => item.status === 'pending').length,
      bookedCount: inquiries.filter((item) => item.status === 'booked' || item.status === 'completed').length,
      channelCounts,
      styleCounts,
    };
  }, [inquiries]);

  const maxDailyVisitors = useMemo(
    () => Math.max(1, ...(visitMetrics?.daily.map((item) => item.visitors) || [0])),
    [visitMetrics],
  );

  const logout = async () => {
    await signOutAdmin();
    onSignedOut();
  };

  const updateLocalInquiry = (next: Inquiry) => {
    setInquiries((current) => current.map((item) => item.id === next.id ? next : item));
    setSelected(next);
  };

  const openInquiry = (inquiry: Inquiry) => {
    if (inquiry.viewedAt) {
      setSelected(inquiry);
      return;
    }
    const viewedAt = new Date().toISOString();
    setSelected({ ...inquiry, viewedAt });
    setInquiries((current) => current.map((item) => item.id === inquiry.id ? { ...item, viewedAt } : item));
    void markInquiryViewedInSupabase(inquiry.id, viewedAt).then((saved) => {
      if (!saved) {
        setInquiries((current) => current.map((item) => item.id === inquiry.id ? { ...item, viewedAt: undefined } : item));
        setError('El lead se abrió, pero no se pudo guardar como leído. Pulsa Actualizar e inténtalo otra vez.');
      }
    });
  };

  return (
    <main className="min-h-screen bg-[#F3F0EC] pb-16 text-stone-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xl font-black tracking-[-0.05em]">hansttoo<span className="text-[#C9362B]">.</span></p>
            <p className="mt-1 text-xs text-stone-500">Sesión: {identity.email}</p>
          </div>
          <div className="flex gap-2">
            <a href="/" className="inline-flex min-h-11 items-center rounded-full border border-stone-300 px-4 text-sm font-bold hover:bg-stone-100"><ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />Ver sitio</a>
            <button onClick={logout} className="inline-flex min-h-11 items-center rounded-full bg-stone-950 px-4 text-sm font-bold text-white hover:bg-[#C9362B]"><LogOut className="mr-2 h-4 w-4" aria-hidden="true" />Salir</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.2em] text-[#C9362B]">CONSULTAS RECIBIDAS</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">Leads de tatuajes</h1>
            <p className="mt-3 text-sm text-stone-600">Revisa solicitudes, referencias y seguimiento. El editor visual fue eliminado.</p>
          </div>
          <button onClick={load} disabled={loading} className="inline-flex min-h-11 items-center self-start rounded-full border border-stone-300 bg-white px-4 text-sm font-black hover:border-stone-950 disabled:opacity-50">
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />Actualizar
          </button>
        </div>

        <section aria-labelledby="traffic-metrics-title" className="mt-8 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.2em] text-[#C9362B]">TRÁFICO DEL SITIO</p>
              <h2 id="traffic-metrics-title" className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">Visitas y conversión</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">Conteo persistente de navegadores que aceptaron la medición. No se guardan IP, ubicación exacta ni información personal.</p>
            </div>
            <span className="self-start rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">ACTUALIZACIÓN EN VIVO</span>
          </div>

          {analyticsError ? <div role="alert" className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">{analyticsError}</div> : null}

          {!loading && visitMetrics ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
                <div className="rounded-3xl bg-stone-950 p-5 text-white"><Users className="h-5 w-5 text-rose-300" aria-hidden="true" /><p className="mt-5 text-3xl font-black">{visitMetrics.totalVisitors}</p><p className="text-sm text-stone-400">Visitantes totales</p></div>
                <div className="rounded-3xl bg-stone-100 p-5"><MousePointerClick className="h-5 w-5 text-[#C9362B]" aria-hidden="true" /><p className="mt-5 text-3xl font-black">{visitMetrics.visitorsToday}</p><p className="text-sm text-stone-500">Visitantes hoy</p></div>
                <div className="rounded-3xl bg-stone-100 p-5"><CalendarDays className="h-5 w-5 text-blue-700" aria-hidden="true" /><p className="mt-5 text-3xl font-black">{visitMetrics.visitors7Days}</p><p className="text-sm text-stone-500">Últimos 7 días</p></div>
                <div className="rounded-3xl bg-stone-100 p-5"><TrendingUp className="h-5 w-5 text-violet-700" aria-hidden="true" /><p className="mt-5 text-3xl font-black">{visitMetrics.visitors30Days}</p><p className="text-sm text-stone-500">Últimos 30 días</p></div>
                <div className="rounded-3xl bg-stone-100 p-5"><BarChart3 className="h-5 w-5 text-amber-700" aria-hidden="true" /><p className="mt-5 text-3xl font-black">{visitMetrics.periodPageViews}</p><p className="text-sm text-stone-500">Páginas vistas · 30 días</p></div>
                <div className="rounded-3xl bg-emerald-50 p-5"><Percent className="h-5 w-5 text-emerald-700" aria-hidden="true" /><p className="mt-5 text-3xl font-black">{visitMetrics.conversionRate}%</p><p className="text-sm text-emerald-800">Conversión medible</p></div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
                <div className="rounded-3xl border border-stone-200 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4"><div><h3 className="font-black">Actividad de los últimos 30 días</h3><p className="mt-1 text-xs text-stone-500">Visitantes únicos por día</p></div><p className="text-right text-xs text-stone-500"><strong className="block text-lg text-stone-950">{visitMetrics.periodSessions}</strong>sesiones</p></div>
                  <ol className="mt-6 flex h-44 items-end gap-1" aria-label="Visitantes diarios">
                    {visitMetrics.daily.map((point, index) => {
                      const height = point.visitors ? Math.max(8, (point.visitors / maxDailyVisitors) * 100) : 3;
                      return (
                        <li key={point.date} className="group relative flex h-full min-w-0 flex-1 items-end" title={`${shortMetricDate(point.date)}: ${point.visitors} visitantes, ${point.pageViews} páginas vistas`}>
                          <span className="sr-only">{shortMetricDate(point.date)}: {point.visitors} visitantes y {point.pageViews} páginas vistas.</span>
                          <span className="w-full rounded-t-md bg-[#C9362B] transition group-hover:bg-stone-950" style={{ height: `${height}%` }} aria-hidden="true" />
                          {(index === 0 || index === visitMetrics.daily.length - 1) ? <span className="absolute top-full mt-2 text-[10px] text-stone-500 last:right-0">{shortMetricDate(point.date)}</span> : null}
                        </li>
                      );
                    })}
                  </ol>
                  <div className="mt-8 grid grid-cols-3 gap-3 border-t border-stone-200 pt-4 text-center text-sm"><div><strong className="block text-xl">{visitMetrics.periodVisitors}</strong><span className="text-stone-500">visitantes</span></div><div><strong className="block text-xl">{visitMetrics.periodPageViews}</strong><span className="text-stone-500">páginas vistas</span></div><div><strong className="block text-xl">{visitMetrics.periodLeads}</strong><span className="text-stone-500">consultas</span></div></div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-3xl border border-stone-200 p-5">
                    <div className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-[#C9362B]" aria-hidden="true" /><h3 className="font-black">De dónde llegan</h3></div>
                    <div className="mt-4 space-y-3">
                      {['google', 'meta', 'direct', 'referral', 'other'].map((source) => {
                        const views = visitMetrics.sources.find((item) => item.source === source)?.pageViews || 0;
                        const share = percentage(views, visitMetrics.periodPageViews);
                        return <div key={source}><div className="flex justify-between text-sm"><span className="font-bold">{analyticsSourceLabel(source)}</span><span className="text-stone-500">{views} · {share}%</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-[#C9362B]" style={{ width: `${share}%` }} /></div></div>;
                      })}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-stone-200 p-5">
                    <div className="flex items-center gap-2"><Monitor className="h-5 w-5 text-[#C9362B]" aria-hidden="true" /><h3 className="font-black">Dispositivos</h3></div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {['mobile', 'tablet', 'desktop'].map((device) => {
                        const views = visitMetrics.devices.find((item) => item.device === device)?.pageViews || 0;
                        return <div key={device} className="rounded-2xl bg-stone-100 p-3 text-center"><strong className="block text-xl">{views}</strong><span className="text-[11px] text-stone-500">{deviceLabel(device)}</span></div>;
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-stone-200 p-5">
                <h3 className="font-black">Páginas más visitadas</h3>
                {visitMetrics.topPages.length ? <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{visitMetrics.topPages.map((page) => <div key={page.path} className="flex items-center justify-between gap-3 rounded-2xl bg-stone-100 px-4 py-3 text-sm"><span className="min-w-0 truncate font-mono">{page.path}</span><strong>{page.pageViews}</strong></div>)}</div> : <p className="mt-3 text-sm text-stone-500">Las páginas aparecerán cuando comiencen a registrarse visitas con medición aceptada.</p>}
              </div>
            </>
          ) : null}
        </section>

        <section aria-label="Resumen de leads" className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className="col-span-2 rounded-3xl bg-stone-950 p-5 text-white lg:col-span-1"><UserRound className="h-5 w-5 text-rose-300" aria-hidden="true" /><p className="mt-5 text-3xl font-black">{inquiries.length}</p><p className="text-sm text-stone-400">Total recibido</p></div>
          <button type="button" onClick={() => setNewOnly((value) => !value)} aria-pressed={newOnly} className={`rounded-3xl p-5 text-left transition ${newOnly ? 'bg-[#C9362B] text-white' : 'bg-white hover:ring-2 hover:ring-[#C9362B]/20'}`}><Zap className="h-5 w-5" aria-hidden="true" /><p className="mt-5 text-3xl font-black">{stats.newCount}</p><p className={`text-sm ${newOnly ? 'text-white/80' : 'text-stone-500'}`}>Nuevos sin abrir</p></button>
          <div className="rounded-3xl bg-white p-5"><TrendingUp className="h-5 w-5 text-blue-700" aria-hidden="true" /><p className="mt-5 text-3xl font-black">{stats.recentCount}</p><p className="text-sm text-stone-500">Últimos 7 días</p></div>
          <div className="rounded-3xl bg-white p-5"><Clock3 className="h-5 w-5 text-amber-600" aria-hidden="true" /><p className="mt-5 text-3xl font-black">{stats.pendingCount}</p><p className="text-sm text-stone-500">Pendientes</p></div>
          <div className="rounded-3xl bg-white p-5"><Percent className="h-5 w-5 text-emerald-700" aria-hidden="true" /><p className="mt-5 text-3xl font-black">{percentage(stats.bookedCount, inquiries.length)}%</p><p className="text-sm text-stone-500">Reservados / completados</p></div>
        </section>

        <section aria-label="Estadísticas de captación" className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-[#C9362B]" aria-hidden="true" /><h2 className="font-black">Origen de los leads</h2></div>
            <div className="mt-5 space-y-4">
              {(['google', 'meta', 'direct', 'referral', 'other'] as AttributionChannel[]).map((channel) => {
                const count = stats.channelCounts[channel];
                const share = percentage(count, inquiries.length);
                return <div key={channel}><div className="flex justify-between gap-3 text-sm"><span className="font-bold">{sourceOptionLabel(channel)}</span><span className="text-stone-500">{count} · {share}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-[#C9362B]" style={{ width: `${share}%` }} /></div></div>;
              })}
            </div>
          </div>
          <div className="rounded-3xl bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-[#C9362B]" aria-hidden="true" /><h2 className="font-black">Interés por estilo</h2></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(Object.entries(styleLabels) as Array<[Inquiry['style'], string]>).map(([style, label]) => (
                <div key={style} className="rounded-2xl bg-stone-100 p-4"><p className="text-sm font-bold">{label}</p><p className="mt-2 text-2xl font-black">{stats.styleCounts[style] || 0}</p></div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-3 rounded-3xl bg-white p-3 md:grid-cols-2 xl:grid-cols-[1fr_auto_auto_auto_auto]">
          <label className="relative" htmlFor="lead-search">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
            <span className="sr-only">Buscar leads</span>
            <input id="lead-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, contacto, zona o idea…" className="min-h-12 w-full rounded-2xl border border-stone-200 pl-11 pr-4 outline-none focus:border-stone-950" />
          </label>
          <select aria-label="Filtrar por estado" value={filter} onChange={(event) => setFilter(event.target.value as 'all' | InquiryStatus)} className="min-h-12 rounded-2xl border border-stone-200 bg-white px-4 font-bold">
            <option value="all">Todos los estados</option>
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select aria-label="Filtrar por origen" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as 'all' | AttributionChannel)} className="min-h-12 rounded-2xl border border-stone-200 bg-white px-4 font-bold">
            <option value="all">Todos los orígenes</option>
            {(['google', 'meta', 'direct', 'referral', 'other'] as AttributionChannel[]).map((channel) => <option key={channel} value={channel}>{sourceOptionLabel(channel)}</option>)}
          </select>
          <select aria-label="Filtrar por etiqueta" value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} className="min-h-12 rounded-2xl border border-stone-200 bg-white px-4 font-bold">
            <option value="all">Todas las etiquetas</option>
            {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
          </select>
          <label className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
            <span className="sr-only">Ordenar leads</span>
            <select aria-label="Ordenar leads" value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="min-h-12 w-full appearance-none rounded-2xl border border-stone-200 bg-white pl-11 pr-8 font-bold">
              <option value="newest">Más recientes</option><option value="oldest">Más antiguos</option><option value="name-asc">Nombre A–Z</option><option value="name-desc">Nombre Z–A</option><option value="status">Por estado</option><option value="source">Por origen</option>
            </select>
          </label>
        </div>

        {(newOnly || filter !== 'all' || sourceFilter !== 'all' || tagFilter !== 'all' || search) ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm"><span className="font-bold">Mostrando {visible.length} de {inquiries.length}</span><button type="button" onClick={() => { setSearch(''); setFilter('all'); setSourceFilter('all'); setTagFilter('all'); setNewOnly(false); }} className="rounded-full border border-stone-300 bg-white px-3 py-2 font-bold hover:border-stone-950">Limpiar filtros</button></div>
        ) : null}

        {error ? <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-900">{error}</div> : null}
        {loading ? <div className="mt-10 flex items-center justify-center text-sm font-bold text-stone-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />Cargando consultas…</div> : null}
        {!loading && !visible.length ? <div className="mt-6 rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">No hay consultas que coincidan con este filtro.</div> : null}

        {!loading && visible.length ? (
          <div className="mt-6 grid gap-3">
            {visible.map((inquiry) => {
              const meta = statusMeta(inquiry.status);
              return (
                <button key={inquiry.id} onClick={() => openInquiry(inquiry)} className={`relative grid w-full gap-4 overflow-hidden rounded-3xl border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-stone-400 hover:shadow-lg sm:grid-cols-[1.2fr_0.9fr_0.8fr_auto] sm:items-center ${inquiry.viewedAt ? 'border-stone-200' : 'border-[#C9362B]/40 ring-2 ring-[#C9362B]/10'}`}>
                  {!inquiry.viewedAt ? <span className="absolute left-0 top-0 h-full w-1.5 bg-[#C9362B]" aria-hidden="true" /> : null}
                  <span><span className="flex flex-wrap items-center gap-2"><span className="block text-lg font-black">{inquiry.fullName}</span>{!inquiry.viewedAt ? <span className="rounded-full bg-[#C9362B] px-2.5 py-1 text-[10px] font-black tracking-wide text-white">NUEVO</span> : null}</span><span className="mt-1 block text-xs text-stone-500">{formatDate(inquiry.createdAt)}</span>{(inquiry.tags || []).length ? <span className="mt-2 flex flex-wrap gap-1">{(inquiry.tags || []).slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-stone-100 px-2 py-1 text-[10px] font-bold text-stone-700"><Tag className="mr-1 inline h-3 w-3" aria-hidden="true" />{tag}</span>)}</span> : null}</span>
                  <span className="text-sm"><span className="block font-bold">{styleLabels[inquiry.style]}</span><span className="mt-1 block text-stone-500">{inquiry.placement}</span><span className="mt-1 block text-xs font-bold text-[#C9362B]">{attributionLabel(inquiry)}</span></span>
                  <span className="text-sm text-stone-600">{inquiry.email || inquiry.instagram || inquiry.phone || 'Sin contacto'}</span>
                  <span className={`justify-self-start rounded-full px-3 py-1 text-xs font-black sm:justify-self-end ${meta.color}`}>{meta.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {selected ? <LeadDetail inquiry={selected} onClose={() => setSelected(null)} onUpdated={updateLocalInquiry} /> : null}
    </main>
  );
}

export default function AdminPage() {
  const [identity, setIdentity] = useState<AdminIdentity | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getAdminIdentity().then(setIdentity).finally(() => setChecking(false));
  }, []);

  if (checking) {
    return <main className="flex min-h-screen items-center justify-center bg-[#F3F0EC] text-sm font-bold text-stone-600"><Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />Verificando sesión segura…</main>;
  }
  if (!identity) return <AdminLogin onAuthenticated={setIdentity} />;
  return <AdminDashboard identity={identity} onSignedOut={() => setIdentity(null)} />;
}
