import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
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
  MapPin,
  MessageCircle,
  RefreshCcw,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import type { AdminIdentity } from '../lib/supabase';
import {
  createSignedInquiryMediaUrls,
  fetchAdminInquiries,
  getAdminIdentity,
  isSupabaseConfigured,
  signInAdmin,
  signOutAdmin,
  updateInquiryNotesInSupabase,
  updateInquiryStatusInSupabase,
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
    const [statusSaved, notesSaved] = await Promise.all([
      status === inquiry.status ? Promise.resolve(true) : updateInquiryStatusInSupabase(inquiry.id, status),
      notes.trim() === (inquiry.artistNotes || '').trim()
        ? Promise.resolve(true)
        : updateInquiryNotesInSupabase(inquiry.id, notes),
    ]);
    if (statusSaved && notesSaved) {
      onUpdated({ ...inquiry, status, artistNotes: notes.trim() });
      setMessage('Cambios guardados.');
    } else {
      setMessage('No se pudieron guardar los cambios. Revisa tu sesión y las políticas de acceso.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-stone-950/60 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="lead-title">
      <div className="mx-auto min-h-full max-w-3xl py-3 sm:py-8">
        <div className="rounded-[2rem] bg-white p-5 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${statusMeta(inquiry.status).color}`}>{statusMeta(inquiry.status).label}</span>
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
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | InquiryStatus>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await fetchAdminInquiries();
    setInquiries(result.inquiries);
    if (result.error) setError('No se pudieron cargar los leads. Revisa que Auth y las políticas RLS estén configuradas.');
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return inquiries.filter((inquiry) => {
      if (filter !== 'all' && inquiry.status !== filter) return false;
      if (!query) return true;
      return [inquiry.fullName, inquiry.email, inquiry.phone, inquiry.instagram, inquiry.placement, inquiry.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [filter, inquiries, search]);

  const logout = async () => {
    await signOutAdmin();
    onSignedOut();
  };

  const updateLocalInquiry = (next: Inquiry) => {
    setInquiries((current) => current.map((item) => item.id === next.id ? next : item));
    setSelected(next);
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

        <section aria-label="Resumen de leads" className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-stone-950 p-5 text-white"><UserRound className="h-5 w-5 text-rose-300" aria-hidden="true" /><p className="mt-5 text-3xl font-black">{inquiries.length}</p><p className="text-sm text-stone-400">Total recibido</p></div>
          <div className="rounded-3xl bg-white p-5"><Clock3 className="h-5 w-5 text-amber-600" aria-hidden="true" /><p className="mt-5 text-3xl font-black">{inquiries.filter((item) => item.status === 'pending').length}</p><p className="text-sm text-stone-500">Pendientes</p></div>
          <div className="rounded-3xl bg-white p-5"><CalendarDays className="h-5 w-5 text-emerald-700" aria-hidden="true" /><p className="mt-5 text-3xl font-black">{inquiries.filter((item) => item.status === 'booked').length}</p><p className="text-sm text-stone-500">Reservados</p></div>
        </section>

        <div className="mt-8 grid gap-3 rounded-3xl bg-white p-3 sm:grid-cols-[1fr_auto]">
          <label className="relative" htmlFor="lead-search">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
            <span className="sr-only">Buscar leads</span>
            <input id="lead-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, contacto, zona o idea…" className="min-h-12 w-full rounded-2xl border border-stone-200 pl-11 pr-4 outline-none focus:border-stone-950" />
          </label>
          <select aria-label="Filtrar por estado" value={filter} onChange={(event) => setFilter(event.target.value as 'all' | InquiryStatus)} className="min-h-12 rounded-2xl border border-stone-200 bg-white px-4 font-bold">
            <option value="all">Todos los estados</option>
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        {error ? <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-900">{error}</div> : null}
        {loading ? <div className="mt-10 flex items-center justify-center text-sm font-bold text-stone-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />Cargando consultas…</div> : null}
        {!loading && !visible.length ? <div className="mt-6 rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">No hay consultas que coincidan con este filtro.</div> : null}

        {!loading && visible.length ? (
          <div className="mt-6 grid gap-3">
            {visible.map((inquiry) => {
              const meta = statusMeta(inquiry.status);
              return (
                <button key={inquiry.id} onClick={() => setSelected(inquiry)} className="grid w-full gap-4 rounded-3xl border border-stone-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-stone-400 hover:shadow-lg sm:grid-cols-[1.2fr_0.9fr_0.8fr_auto] sm:items-center">
                  <span><span className="block text-lg font-black">{inquiry.fullName}</span><span className="mt-1 block text-xs text-stone-500">{formatDate(inquiry.createdAt)}</span></span>
                  <span className="text-sm"><span className="block font-bold">{styleLabels[inquiry.style]}</span><span className="mt-1 block text-stone-500">{inquiry.placement}</span></span>
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
