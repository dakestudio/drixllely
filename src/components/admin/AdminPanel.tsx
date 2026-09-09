import React, { useState, useEffect, useMemo } from 'react';
import { Invitado } from '@/types';
import { getAllInvitados, createInvitado, deleteInvitado, updateInvitadoAdmin } from '@/lib/firebase';
import { 
  Users, UserCheck, UserX, Clock, Plus, Trash2, Copy, 
  Loader2, LogIn, Download, Search, RefreshCw, Eye, Heart, X, CheckCircle, Filter, ChevronUp, ChevronDown, MessageSquare, AlertTriangle, ChevronLeft, ChevronRight, Pencil
} from 'lucide-react';


/*
 * ⚠️ Esto es un portón, no una cerradura.
 *
 * Cualquier contraseña que viva en el frontend termina en el bundle que el
 * navegador descarga: se lee abriendo las DevTools. Sacarla a una variable de
 * entorno evita que quede escrita en el repositorio de GitHub, pero NO impide
 * que alguien la extraiga del JavaScript ya desplegado.
 *
 * La protección real de la lista de invitados son las reglas de Firestore.
 * Mientras la colección `invitados` acepte escrituras anónimas, este panel es
 * solo comodidad — ver las notas de seguridad en README.md.
 */
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'boda2026';

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

// ─── Stat Card ─────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, accent, className }: { 
  icon: React.ElementType; label: string; value: number; accent: string; className?: string;
}) => (
  <div className={`bg-white border border-stone-200 rounded-lg p-5 hover:shadow-md transition-all duration-300 group ${className || ''}`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-9 h-9 rounded-lg ${accent} flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-[10px] uppercase tracking-widest text-stone-400">{label}</span>
    </div>
    <p className="text-3xl font-display text-stone-800 group-hover:text-stone-900 transition-colors">{value}</p>
  </div>
);

// ─── Toast Notification ────────────────────────────────
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed top-6 right-6 z-50 bg-stone-800 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-2 text-sm">
      <CheckCircle className="w-4 h-4 text-amber-400" /> {message}
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('admin_auth') === 'true');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'declined' | 'pending' | 'attention'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingInvitadoId, setEditingInvitadoId] = useState<string | null>(null);
  const [decreaseWarning, setDecreaseWarning] = useState<{ isOpen: boolean; invToEdit: Invitado; newMax: number } | null>(null);
  const [newNombre, setNewNombre] = useState('');
  const [newExtras, setNewExtras] = useState<number>(-1);
  const [creating, setCreating] = useState(false);
  const [selectedInvitado, setSelectedInvitado] = useState<Invitado | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  type SortField = 'nombre' | 'pases' | 'estado' | null;
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
    } else {
      setPasswordError(true);
    }
  };

  const fetchInvitados = async () => {
    setLoading(true);
    const data = await getAllInvitados();
    setInvitados(data);
    setLoading(false);
  };

  useEffect(() => { if (authenticated) fetchInvitados(); }, [authenticated]);

  const handleCreateOrUpdate = async () => {
    if (!newNombre.trim()) return;
    if (newExtras === -1) {
      setToast('⚠️ Por favor selecciona los pases extras');
      return;
    }
    setCreating(true);

    let success = false;
    
    if (editingInvitadoId) {
      const invToEdit = invitados.find(i => i.id === editingInvitadoId);
      const newMax = newExtras + 1;
      const updates: Partial<Invitado> = {
        nombre: newNombre.trim(),
        maxInvitados: newMax,
      };

      // Si le estamos reduciendo los pases a alguien que ya había confirmado a más personas de las que le dejamos,
      // su RSVP se invalida y regresa a estado pendiente para que vuelva a llenar el formulario.
      // Opcional: También si lo cambiamos mientras estaba confirmado para asistir a menos, pero esto es más seguro para evitar descuadres.
      if (invToEdit && invToEdit.confirmado && invToEdit.asistira === 'yes' && (invToEdit.numInvitados || 0) > newMax) {
        
        setDecreaseWarning({ isOpen: true, invToEdit, newMax });
        setCreating(false);
        return;
      }
      success = await updateInvitadoAdmin(editingInvitadoId, updates);
    } else {
      const code = generateCode();
      success = await createInvitado(code, {
        nombre: newNombre.trim(),
        maxInvitados: newExtras + 1,
        confirmado: false,
        asistira: null,
        telefono: '',
        numInvitados: 0,
        nombresAcompanantes: [],
        tieneRestricciones: null,
        restricciones: '',
        mensaje: '',
      });
      if (success) setToast('Invitado creado exitosamente');
    }

    if (success) {
      setNewNombre('');
      setNewExtras(-1);
      setShowForm(false);
      setEditingInvitadoId(null);
      await fetchInvitados();
    }
    setCreating(false);
  };

  const confirmDecreaseAndSave = async () => {
    if (!decreaseWarning) return;
    setCreating(true);
    const { invToEdit, newMax } = decreaseWarning;
    const updates: Partial<Invitado> = {
      nombre: newNombre.trim(),
      maxInvitados: newMax,
      confirmado: false,
      asistira: null,
      numInvitados: 0,
      nombresAcompanantes: [],
      tieneRestricciones: null,
      restricciones: '',
      mensaje: ''
    };
    
    setToast('Se redujeron los pases: El invitado regresó a estado Pendiente');
    const success = await updateInvitadoAdmin(invToEdit.id, updates);
    if (success) {
      setNewNombre('');
      setNewExtras(-1);
      setShowForm(false);
      setEditingInvitadoId(null);
      await fetchInvitados();
    }
    setDecreaseWarning(null);
    setCreating(false);
  };

  const handleEditInit = (inv: Invitado) => {
    setNewNombre(inv.nombre);
    setNewExtras(Math.max(0, inv.maxInvitados - 1));
    setEditingInvitadoId(inv.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (code: string) => {
    if (!confirm('¿Estás seguro de eliminar este invitado?')) return;
    await deleteInvitado(code);
    setToast('Invitado eliminado');
    await fetchInvitados();
  };

  const copyLink = (code: string) => {
    const baseUrl = window.location.origin;
    navigator.clipboard.writeText(`${baseUrl}/?invite=${code}`);
    setToast('Link copiado al portapapeles');
  };

  const exportCSV = () => {
    const headers = ['Código','Nombre','Confirmado','Asistirá','Nº Invitados','Acompañantes','Teléfono','Restricciones','Mensaje'];
    const rows = invitados.map(i => [
      i.id, i.nombre, i.confirmado ? 'Sí' : 'No',
      i.asistira === 'yes' ? 'Sí' : i.asistira === 'no' ? 'No' : 'Pendiente',
      i.numInvitados, (i.nombresAcompanantes || []).join('; '),
      i.telefono, i.restricciones || '', i.mensaje || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invitados_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const total = invitados.length;
    const confirmados = invitados.filter(i => i.asistira === 'yes');
    const noAsisten = invitados.filter(i => i.asistira === 'no');
    const pendientes = invitados.filter(i => !i.confirmado);
    const totalPersonas = confirmados.reduce((acc, i) => acc + (i.numInvitados || 0), 0);
    return { total, confirmados: confirmados.length, noAsisten: noAsisten.length, pendientes: pendientes.length, totalPersonas };
  }, [invitados]);

  const filteredInvitados = useMemo(() => {
    let result = [...invitados];
    
    if (statusFilter === 'confirmed') result = result.filter(i => i.asistira === 'yes');
    else if (statusFilter === 'declined') result = result.filter(i => i.asistira === 'no');
    else if (statusFilter === 'pending') result = result.filter(i => !i.confirmado);
    else if (statusFilter === 'attention') result = result.filter(i => i.mensaje || i.restricciones);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => i.nombre.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
    }
    
    if (sortField) {
      result.sort((a, b) => {
        let valA: string | number, valB: string | number;
        
        if (sortField === 'nombre') {
          valA = a.nombre.toLowerCase();
          valB = b.nombre.toLowerCase();
        } else if (sortField === 'pases') {
          valA = a.maxInvitados;
          valB = b.maxInvitados;
        } else if (sortField === 'estado') {
          const rank = { 'yes': 1, 'no': 3, null: 2 };
          valA = rank[a.asistira as keyof typeof rank] || 2;
          valB = rank[b.asistira as keyof typeof rank] || 2;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [invitados, searchQuery, statusFilter, sortField, sortDirection]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredInvitados.length / ITEMS_PER_PAGE);
  const paginatedInvitados = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInvitados.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInvitados, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />;
  };

  // ─── Login Screen ──────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 border border-amber-200 mb-6">
              <Heart className="w-7 h-7 text-amber-600" />
            </div>
            <h1 className="text-3xl font-display text-stone-800 mb-2">Panel de Bodas</h1>
            <p className="text-stone-400 text-sm">Administración de invitados</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white border border-stone-200 rounded-xl p-8 shadow-sm">
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest text-stone-400 mb-3">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
                className={`w-full border-b-2 ${passwordError ? 'border-red-300' : 'border-stone-200'} py-3 text-stone-800 placeholder-stone-300 focus:outline-none focus:border-amber-500 transition-colors text-lg`}
                placeholder="••••••••"
                autoFocus
              />
              {passwordError && <p className="text-red-400 text-xs mt-2">Contraseña incorrecta</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-stone-800 text-white py-3 rounded-lg text-sm uppercase tracking-widest hover:bg-stone-700 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Dashboard ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Heart className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h1 className="text-lg font-display text-stone-800">Panel de Invitados</h1>
              <p className="text-stone-400 text-[10px] uppercase tracking-widest">Administración de boda</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchInvitados} className="p-2.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-all" title="Refrescar">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 rounded-lg text-xs text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-all">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <a href="/" className="text-xs text-stone-400 hover:text-stone-600 transition-colors ml-2">← Invitación</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          <StatCard icon={Users} label="Total" value={stats.total} accent="bg-stone-500" />
          <StatCard icon={UserCheck} label="Confirmados" value={stats.confirmados} accent="bg-emerald-500" />
          <StatCard icon={UserX} label="No Asisten" value={stats.noAsisten} accent="bg-red-400" />
          <StatCard icon={Clock} label="Pendientes" value={stats.pendientes} accent="bg-amber-500" />
          <StatCard className="col-span-2 sm:col-span-1" icon={Users} label="Personas" value={stats.totalPersonas} accent="bg-blue-400" />
        </div>

        {/* Progress Bar */}
        {stats.total > 0 && (
          <div className="bg-white border border-stone-200 rounded-lg p-5 mb-8 shadow-sm">
            <div className="flex justify-between text-xs font-medium text-stone-500 mb-2">
              <span>Progreso de Confirmaciones</span>
              <span>{Math.round((stats.confirmados / stats.total) * 100)}% Confirmado</span>
            </div>
            <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
              <div 
                style={{ width: `${(stats.confirmados / stats.total) * 100}%` }} 
                className="bg-emerald-500 h-full transition-all duration-500" 
                title={`${stats.confirmados} Confirmados`}
              />
              <div 
                style={{ width: `${(stats.noAsisten / stats.total) * 100}%` }} 
                className="bg-red-400 h-full transition-all duration-500" 
                title={`${stats.noAsisten} No Asisten`}
              />
              <div 
                style={{ width: `${(stats.pendientes / stats.total) * 100}%` }} 
                className="bg-amber-400 h-full transition-all duration-500" 
                title={`${stats.pendientes} Pendientes`}
              />
            </div>
            <div className="flex gap-4 mt-3 text-[10px] uppercase tracking-widest text-stone-400 justify-center">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Confirman</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> No asistirán</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Pendientes</div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
          <button
            onClick={() => {
              setNewNombre('');
              setNewExtras(-1);
              setEditingInvitadoId(null);
              setShowForm(!showForm);
            }}
            className="flex items-center justify-center gap-2 bg-stone-800 text-white px-6 py-3 rounded-lg text-xs uppercase tracking-wider hover:bg-stone-700 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Nuevo Invitado
          </button>
          <div className="relative shrink-0">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'confirmed' | 'declined' | 'pending' | 'attention')}
              className="w-full sm:w-auto pl-11 pr-10 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a8a29e' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              <option value="all">Todos los estados</option>
              <option value="confirmed">Confirmados</option>
              <option value="pending">Pendientes</option>
              <option value="declined">No asisten</option>
              <option value="attention">⚠️💬 Atención requerida</option>
            </select>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white border border-stone-200 rounded-lg p-6 mb-6 flex flex-col sm:flex-row gap-4 items-end shadow-sm">
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-widest text-stone-400 mb-2">Nombre del invitado</label>
              <input
                type="text"
                value={newNombre}
                onChange={(e) => setNewNombre(e.target.value)}
                className="w-full border-b-2 border-stone-200 py-2.5 text-stone-800 placeholder-stone-300 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Nombre completo"
                autoFocus
              />
            </div>
            <div className="w-full sm:w-36">
              <label className="block text-xs uppercase tracking-widest text-stone-400 mb-2">Pases extras</label>
              <select
                value={newExtras}
                onChange={(e) => setNewExtras(Number(e.target.value))}
                className="w-full border-b-2 border-stone-200 py-2.5 text-stone-800 focus:outline-none focus:border-amber-500 bg-transparent"
              >
                <option value={-1} disabled>Selecciona...</option>
                {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
              {editingInvitadoId && (
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingInvitadoId(null);
                    setNewNombre('');
                    setNewExtras(-1);
                  }}
                  className="px-6 py-2.5 rounded-lg text-sm bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors w-full sm:w-auto"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleCreateOrUpdate}
                disabled={creating || !newNombre.trim()}
                className="bg-amber-600 text-white px-8 py-2.5 rounded-lg text-sm hover:bg-amber-700 transition-colors disabled:opacity-40 w-full sm:w-auto flex justify-center"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : editingInvitadoId ? 'Guardar Cambios' : 'Crear Invitado'}
              </button>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedInvitado && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setSelectedInvitado(null)}>
            <div className="bg-white border border-stone-200 rounded-xl max-w-md w-full p-8 shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-display text-stone-800">{selectedInvitado.nombre}</h3>
                <button onClick={() => setSelectedInvitado(null)} className="p-1 text-stone-400 hover:text-stone-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-stone-100 pb-3"><span className="text-stone-400">Código</span><span className="font-mono text-stone-600">{selectedInvitado.id}</span></div>
                <div className="flex justify-between border-b border-stone-100 pb-3"><span className="text-stone-400">Estado</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedInvitado.asistira === 'yes' ? 'bg-emerald-50 text-emerald-700' : selectedInvitado.asistira === 'no' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                    {selectedInvitado.asistira === 'yes' ? 'Confirmado' : selectedInvitado.asistira === 'no' ? 'No asiste' : 'Pendiente'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-3"><span className="text-stone-400">Teléfono</span><span className="text-stone-700">{selectedInvitado.telefono || '—'}</span></div>
                <div className="flex justify-between border-b border-stone-100 pb-3"><span className="text-stone-400">Nº Personas</span><span className="text-stone-700">{selectedInvitado.numInvitados || '—'}</span></div>
                {selectedInvitado.nombresAcompanantes?.length > 0 && (
                  <div className="border-b border-stone-100 pb-3"><span className="text-stone-400 block mb-2">Acompañantes</span>
                    <ul className="space-y-1">{selectedInvitado.nombresAcompanantes.map((n, i) => <li key={i} className="text-stone-700 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{n}</li>)}</ul>
                  </div>
                )}
                {selectedInvitado.restricciones && (
                  <div className="border-b border-stone-100 pb-3"><span className="text-stone-400 block mb-1">Restricciones</span><p className="text-stone-700">{selectedInvitado.restricciones}</p></div>
                )}
                {selectedInvitado.mensaje && (
                  <div className="border-b border-stone-100 pb-3"><span className="text-stone-400 block mb-1">Mensaje</span><p className="text-stone-600 italic">"{selectedInvitado.mensaje}"</p></div>
                )}
                {selectedInvitado.fechaConfirmacion && (
                  <div className="flex justify-between"><span className="text-stone-400">Confirmación</span><span className="text-stone-500 text-xs">{new Date(selectedInvitado.fechaConfirmacion).toLocaleString('es-MX')}</span></div>
                )}
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    const baseUrl = window.location.origin;
                    const url = `${baseUrl}/?invite=${selectedInvitado.id}`;
                    const rawText = `¡Hola ${selectedInvitado.nombre}! ✨\n\nCon mucha emoción y cariño, queremos compartir contigo uno de los días más especiales de nuestras vidas. Nos encantaría que nos acompañaras a celebrar nuestra boda. 💍🤍\n\nHemos reservado ${selectedInvitado.maxInvitados} pase${selectedInvitado.maxInvitados !== 1 ? 's' : ''} especialmente para ti.\n\nPor favor, abre tu invitación en el siguiente enlace y confírmanos tu asistencia:\n${url}\n\n¡Esperamos contar contigo!`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(rawText)}`, '_blank');
                  }}
                  className="flex-1 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.299-.018-.461.13-.611.134-.135.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> WhatsApp
                </button>
                <button
                  onClick={() => copyLink(selectedInvitado.id)}
                  className="flex-1 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-all flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Copiar Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-stone-300 mx-auto" />
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm overflow-x-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d6d3d1 transparent' }}>
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  <th className="text-center px-4 py-4 text-[10px] uppercase tracking-widest text-stone-400 font-medium w-12">#</th>
                  <th 
                    className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-stone-400 font-medium cursor-pointer hover:bg-stone-100 transition-colors group select-none"
                    onClick={() => handleSort('nombre')}
                  >
                    Nombre <SortIcon field="nombre" />
                  </th>
                  <th className="text-left px-5 py-4 text-[10px] uppercase tracking-widest text-stone-400 font-medium">Código</th>
                  <th 
                    className="text-center px-5 py-4 text-[10px] uppercase tracking-widest text-stone-400 font-medium cursor-pointer hover:bg-stone-100 transition-colors group select-none"
                    onClick={() => handleSort('pases')}
                  >
                    Pases Totales <SortIcon field="pases" />
                  </th>
                  <th 
                    className="text-center px-5 py-4 text-[10px] uppercase tracking-widest text-stone-400 font-medium cursor-pointer hover:bg-stone-100 transition-colors group select-none"
                    onClick={() => handleSort('estado')}
                  >
                    Estado <SortIcon field="estado" />
                  </th>
                  <th className="text-center px-5 py-4 text-[10px] uppercase tracking-widest text-stone-400 font-medium">Personas</th>
                  <th className="text-right px-5 py-4 text-[10px] uppercase tracking-widest text-stone-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvitados.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-stone-400">
                    {invitados.length === 0 ? (
                      <div>
                        <Users className="w-10 h-10 mx-auto mb-3 text-stone-300" />
                        <p>No hay invitados aún</p>
                        <p className="text-xs mt-1 text-stone-300">Usa el botón "Nuevo Invitado" para agregar</p>
                      </div>
                    ) : 'Sin resultados para tu búsqueda'}
                  </td></tr>
                ) : (
                  paginatedInvitados.map((inv, index) => (
                    <tr key={inv.id} className="border-b border-stone-50 last:border-b-0 hover:bg-amber-50/30 transition-colors">
                      <td className="px-4 py-4 text-center text-stone-400 text-xs font-mono">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-stone-800 font-medium">{inv.nombre}</span>
                          {inv.restricciones && (
                            <span title="Tiene restricciones alimenticias" className="inline-flex">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" aria-label="Tiene restricciones alimenticias" />
                            </span>
                          )}
                          {inv.mensaje && (
                            <span title="Dejó un mensaje" className="inline-flex">
                              <MessageSquare className="w-3.5 h-3.5 text-blue-400" aria-label="Dejó un mensaje" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-stone-400">{inv.id}</td>
                      <td className="px-5 py-4 text-center text-stone-500">{inv.maxInvitados}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium ${
                          inv.asistira === 'yes'
                            ? 'bg-emerald-50 text-emerald-700'
                            : inv.asistira === 'no'
                            ? 'bg-red-50 text-red-500'
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          {inv.asistira === 'yes' ? 'Confirmado' : inv.asistira === 'no' ? 'No asiste' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center text-stone-500">{inv.asistira === 'yes' ? inv.numInvitados : '—'}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <button onClick={() => setSelectedInvitado(inv)} className="p-2 text-stone-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-all" title="Ver detalle">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => {
                            const baseUrl = window.location.origin;
                            const url = `${baseUrl}/?invite=${inv.id}`;
                            const rawText = `¡Hola ${inv.nombre}! ✨\n\nCon mucha emoción y cariño, queremos compartir contigo uno de los días más especiales de nuestras vidas. Nos encantaría que nos acompañaras a celebrar nuestra boda. 💍🤍\n\nHemos reservado ${inv.maxInvitados} pase${inv.maxInvitados !== 1 ? 's' : ''} especialmente para ti.\n\nPor favor, abre tu invitación en el siguiente enlace y confírmanos tu asistencia:\n${url}\n\n¡Esperamos contar contigo!`;
                            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(rawText)}`, '_blank');
                          }} className="p-2 text-stone-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all" title="Enviar por WhatsApp">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.299-.018-.461.13-.611.134-.135.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                           </button>
                           <button onClick={() => copyLink(inv.id)} className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-all" title="Copiar link">
                             <Copy className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleEditInit(inv)} className="p-2 text-stone-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-all" title="Editar invitado">
                             <Pencil className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleDelete(inv.id)} className="p-2 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-stone-500 text-center sm:text-left">
                  Mostrando del {(currentPage - 1) * ITEMS_PER_PAGE + 1} al {Math.min(currentPage * ITEMS_PER_PAGE, filteredInvitados.length)} de {filteredInvitados.length} invitados
                </p>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-medium text-stone-600 px-3">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Advertencia Reducción Pases */}
      {decreaseWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setDecreaseWarning(null)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-center animate-fade-in-up">
            <div className="bg-amber-50 p-6 flex justify-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-serif text-stone-800 mb-2">Actualización de Pases</h3>
              <p className="text-stone-600 mb-4">
                Parece que estás reduciendo los pases de <strong>{decreaseWarning.invToEdit.nombre}</strong> de {decreaseWarning.invToEdit.maxInvitados} a {decreaseWarning.newMax}.<br/><br/>
                Como esta persona <strong className="text-amber-600 font-medium">ya había confirmado asistencia</strong> para {decreaseWarning.invToEdit.numInvitados} invitados,
              </p>
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-stone-600">Al guardar, su confirmación pasará a <strong>"Pendiente"</strong> para que pueda entrar nuevamente a su link y actualizar sus acompañantes.</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setDecreaseWarning(null)}
                  className="flex-1 px-4 py-3 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors font-medium"
                >
                  Regresar
                </button>
                <button 
                  onClick={confirmDecreaseAndSave}
                  disabled={creating}
                  className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium flex justify-center"
                >
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entendido, guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
