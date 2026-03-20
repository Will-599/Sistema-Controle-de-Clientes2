import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Users, UserCog, Calendar, Plus, Search, Phone, Briefcase, CheckCircle2, Clock, MoreVertical, Trash2, ChevronRight, X, Settings, LogOut, Lock, Mail, AlertCircle, BarChart3, AlertOctagon, Sun, Moon, Building2, ShieldCheck, Receipt, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Client, Professional, Task, User, Tenant, AccessLog } from './types';

// --- Components ---

const Sidebar = ({ user, activeTab, setActiveTab, onLogout, onOpenTrash }: { user: User, activeTab: string, setActiveTab: (tab: string) => void, onLogout: () => void, onOpenTrash: () => void }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getMenuItems = () => {
    if (user.role === 'MasterAdmin') {
      return [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Painel Global' },
        { id: 'clients', icon: Users, label: 'Clientes' },
        { id: 'professionals', icon: UserCog, label: 'Profissionais' },
        { id: 'settings', icon: Settings, label: 'Configurações' },
      ];
    }
    if (user.role === 'TenantAdmin') {
      return [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Painel' },
        { id: 'clients', icon: Users, label: 'Clientes' },
        { id: 'professionals', icon: UserCog, label: 'Profissionais' },
        { id: 'tenant_users', icon: ShieldCheck, label: 'Equipa' },
        { id: 'tenant_billing', icon: Receipt, label: 'Assinatura' },
        { id: 'settings', icon: Settings, label: 'Configurações' },
      ];
    }
    return [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Painel' },
      { id: 'clients', icon: Users, label: 'Clientes' },
      { id: 'professionals', icon: UserCog, label: 'Profissionais' },
      { id: 'settings', icon: Settings, label: 'Configurações' },
    ];
  };

  const menuItems = getMenuItems();

  const handleNav = (id: string) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
          C
        </div>
        <h1 className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">ControleClientes</h1>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === item.id
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <item.icon size={20} className={activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'} />
            <span>{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => { onOpenTrash(); setIsMobileOpen(false); }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={20} className="text-slate-400" />
          <span>Lixo</span>
        </button>
      </nav>

      <div className="mt-auto space-y-4">
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          Terminar Sessão
        </button>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Estado do Sistema</p>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Operacional
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - unchanged, lg and above */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-6 flex-col gap-8 z-20 transition-colors">
        <SidebarContent />
      </aside>

      {/* Mobile: hamburger button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-slate-700 dark:text-slate-300"
        aria-label="Abrir menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile: overlay + drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-72 h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-8 overflow-y-auto shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const StatCard = ({ label, value, icon: Icon, color, delay = 0 }: { label: string, value: number, icon: any, color: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.3 }}
    whileHover={{ y: -4, shadow: "0px 10px 20px rgba(0,0,0,0.05)" }}
    className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between"
  >
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
        className="text-4xl font-bold text-slate-900"
      >
        {value}
      </motion.h3>
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-sm`}>
      <Icon className="text-white" size={28} />
    </div>
  </motion.div>
);


// --- Shared Components ---
const ClockWidget = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-slate-700 dark:text-slate-300 font-medium font-display transition-colors">
      <Clock size={18} className="text-indigo-500" />
      {time.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
    </div>
  );
};

const ThemeToggle = ({ isDark, toggleTheme }: { isDark: boolean, toggleTheme: () => void }) => (
  <button
    onClick={toggleTheme}
    className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors"
    title={isDark ? "Mudar para Claro" : "Mudar para Escuro"}
  >
    {isDark ? <Sun size={20} /> : <Moon size={20} />}
  </button>
);

const FloatingUserMenu = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-16 right-0 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{user.email}</p>
              <p className="text-xs text-slate-500 font-medium">{user.role}</p>
            </div>
            <div className="p-2 space-y-1">
              <button onClick={() => { setIsOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors flex items-center gap-2">
                <UserCog size={16} /> Perfil
              </button>
              <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors flex items-center gap-2">
                <LogOut size={16} /> Sair
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold">
          {user.email.charAt(0).toUpperCase()}
        </div>
      </button>
    </div>
  );
};

function SubscriptionWallScreen({ email, onLogout }: { email: string, onLogout: () => void }) {
  const handlePayPalCheckout = () => {
    alert("Redirecionando para o PayPal (Integração Futura)...");
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Receipt size={40} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Ative o seu Workspace</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Para aceder ao sistema como "{email}", precisa subscrever o plano.</p>

        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-8 text-left">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">System Access Plan</h3>
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">R$49.90 <span className="text-sm text-slate-500 font-medium">/ mês</span></div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium text-sm"><CheckCircle2 size={16} className="text-emerald-500" /> Tenant admin account</li>
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium text-sm"><CheckCircle2 size={16} className="text-emerald-500" /> Private workspace</li>
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium text-sm"><CheckCircle2 size={16} className="text-emerald-500" /> Manage users</li>
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium text-sm"><CheckCircle2 size={16} className="text-emerald-500" /> Clients & Professionals</li>
          </ul>
        </div>

        <button onClick={handlePayPalCheckout} className="w-full mb-4 py-4 bg-[#0070ba] text-white font-bold rounded-2xl hover:bg-[#005ea6] transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20.067 8.478c.492.292.722.767.65 1.348-.12.984-.96 1.6-2.074 1.6h-1.583c-.328 0-.6.23-.666.56l-.88 4.416c-.05.253-.274.428-.528.428h-2.182c-.32 0-.585-.23-.651-.56l-.885-4.436c-.048-.242-.26-.408-.506-.408H8.84c-.322 0-.587.23-.653.56l-1.01 5.06c-.054.272-.29.462-.566.462H4.43c-.318 0-.58-.225-.65-.546l-1.748-8.74a.65.65 0 0 1 .64-.778H7.31c.324 0 .59-.228.657-.557l.144-.72a3.8 3.8 0 0 1 3.733-3.048h4.636c2.446 0 4.09 1.464 3.587 3.882-.164.79-.672 1.488-1.42 1.956z" /></svg>
          Pagar com PayPal
        </button>
        <button onClick={onLogout} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-colors">Voltar ao Login</button>
      </motion.div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'client' | 'professional' | 'task'>('client');
  const [searchQuery, setSearchQuery] = useState('');

  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [trashItems, setTrashItems] = useState<any[]>([]);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // Authentication logic
  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setSelectedClientId(null);
    setActiveTab('dashboard');
  };

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      logout();
      throw new Error('Não autorizado');
    }
    return res;
  };

  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }
      try {
        const res = await apiFetch('/api/auth/check');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          fetchData();
        }
      } catch (err) {
        // Will be logged out explicitly by apiFetch if 401
      } finally {
        setIsCheckingAuth(false);
      }
    };
    initAuth();
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, professionalsRes, tasksRes] = await Promise.all([
        apiFetch('/api/clients'),
        apiFetch('/api/professionals'),
        apiFetch('/api/tasks')
      ]);

      // Safely parse each response — fall back to [] if the API returns an error
      const safeJson = async (res: Response) => {
        if (!res.ok) {
          console.error(`[fetchData] API error ${res.status}: ${res.url}`);
          return [];
        }
        try {
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        } catch {
          return [];
        }
      };

      setClients(await safeJson(clientsRes));
      setProfessionals(await safeJson(professionalsRes));
      setTasks(await safeJson(tasksRes));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrash = async () => {
    try {
      const res = await apiFetch('/api/trash');
      if (!res.ok) {
        console.error('Failed to fetch trash:', res.status);
        setTrashItems([]);
        return;
      }
      const data = await res.json();
      setTrashItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching trash:", error);
      setTrashItems([]);
    }
  };

  useEffect(() => {
    // fetchTrash is only called manually via the onOpenTrash callback now
  }, []);

  // Derived Task Data
  const todayDate = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === todayDate);
  const pendingToday = todayTasks.filter(t => t.status !== 'Concluido').length;
  const completedToday = todayTasks.filter(t => t.status === 'Concluido').length;

  const analyticsData = useMemo(() => {
    let completed = 0;
    let pending = 0;
    let missed = 0;

    tasks.forEach(t => {
      if (t.status === 'Concluido') {
        completed++;
      } else {
        if (new Date(t.date) < new Date(todayDate)) {
          missed++;
        } else {
          pending++;
        }
      }
    });

    return { total: tasks.length, completed, pending, missed };
  }, [tasks, todayDate]);

  const chartData = [
    { name: 'Concluídas', value: analyticsData.completed, color: '#10b981' }, // emerald-500
    { name: 'Pendentes', value: analyticsData.pending, color: '#f59e0b' },    // amber-500
    { name: 'Atrasadas', value: analyticsData.missed, color: '#ef4444' },     // red-500
  ].filter(d => d.value > 0);

  // Handlers
  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    if (isEditMode && editingItem) {
      await apiFetch(`/api/clients/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      await apiFetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
    fetchData();
  };

  const handleCreateProfessional = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (isEditMode && editingItem) {
      await apiFetch(`/api/professionals/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      await apiFetch('/api/professionals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
    fetchData();
  };

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formDataObj = Object.fromEntries(formData.entries());
    const data = {
      ...formDataObj,
      clientId: selectedClientId || formDataObj.clientId
    };

    if (isEditMode && editingItem) {
      await apiFetch(`/api/tasks/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      await apiFetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
    fetchData();
  };

  const updateTaskStatus = async (id: string, status: string) => {
    await apiFetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const deleteTask = async (id: string) => {
    await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const deleteClient = async (id: string) => {
    if (confirm('Tem a certeza? Isto irá apagar todas as tarefas deste cliente.')) {
      await apiFetch(`/api/clients/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const deleteProfessional = async (id: string) => {
    if (confirm('Tem a certeza?')) {
      await apiFetch(`/api/professionals/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const restoreItem = async (type: string, id: string) => {
    await apiFetch(`/api/trash/restore/${type}/${id}`, { method: 'POST' });
    fetchTrash();
    fetchData();
  };

  const permanentDelete = async (type: string, id: string) => {
    if (confirm('AVISO: Esta ação é permanente e não pode ser desfeita. Tem a certeza?')) {
      await apiFetch(`/api/trash/permanent/${type}/${id}`, { method: 'DELETE' });
      fetchTrash();
    }
  };

  // Screens
  if (isCheckingAuth) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!token || !user) {
    return <LoginScreen setToken={setToken} setUser={setUser} />;
  }

  if (user.role === 'TenantAdmin' && (user as any).subscriptionStatus === 'PENDING_PAYMENT') {
    return <SubscriptionWallScreen email={user.email} onLogout={logout} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex font-sans selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900/50 dark:selection:text-indigo-100 transition-colors">
      <Sidebar user={user} activeTab={selectedClientId ? 'clients' : activeTab} setActiveTab={(tab) => {
        setActiveTab(tab);
        setSelectedClientId(null);
      }} onLogout={logout} onOpenTrash={() => { fetchTrash(); setIsTrashOpen(true); }} />

      <main className="flex-1 lg:ml-64 p-4 lg:p-10 max-w-7xl pt-16 lg:pt-10">
        {/* Top Header Controls: Clock and Theme Switcher */}
        <div className="flex justify-end items-center gap-4 mb-8">
          <ClockWidget />
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>

        <AnimatePresence mode="wait">
          {selectedClientId ? (
            <motion.div
              key="client-detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto"
            >
              {(() => {
                const client = clients.find(c => c.id === selectedClientId);
                if (!client) return null;
                const clientTasks = tasks.filter(t => t.clientId === selectedClientId);

                return (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setSelectedClientId(null)}
                        className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 font-medium transition-colors"
                      >
                        <ChevronRight className="rotate-180" size={20} />
                        Voltar aos Clientes
                      </button>
                      <button
                        onClick={() => {
                          setModalType('task');
                          setIsModalOpen(true);
                        }}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                      >
                        <Plus size={20} />
                        Nova Tarefa
                      </button>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-3xl font-display font-bold text-slate-900 mb-3">{client.name}</h2>
                          <div className="flex items-center gap-5 text-slate-600 font-medium">
                            <span className="flex items-center gap-2"><Phone size={18} className="text-indigo-500" /> {client.phone}</span>
                            <span className="flex items-center gap-2"><Briefcase size={18} className="text-indigo-500" /> {client.contractedService}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(client);
                              setIsEditMode(true);
                              setModalType('client');
                              setIsModalOpen(true);
                            }}
                            className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 rounded-xl transition-colors"
                          >
                            <UserCog size={20} />
                          </button>
                          <button onClick={() => deleteClient(client.id)} className="p-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                      {client.notes && (
                        <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-slate-700">
                          {client.notes}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 pt-4">
                      <h3 className="text-2xl font-display font-bold text-slate-900">Histórico de Serviços</h3>
                      <div className="space-y-3">
                        {clientTasks.length === 0 ? (
                          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-100">
                            Nenhuma tarefa agendada para este cliente ainda.
                          </div>
                        ) : (
                          clientTasks.map(task => (
                            <motion.div
                              key={task.id}
                              whileHover={{ scale: 1.01 }}
                              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${task.status === 'Concluido' ? 'bg-emerald-100 text-emerald-600' :
                                  task.status === 'EmProgresso' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                  {task.status === 'Concluido' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg text-slate-900 mb-1">{task.serviceName}</h4>
                                  <p className="text-sm text-slate-500 font-medium">{task.date} {task.time ? `às ${task.time}` : ''} • Responsável: <span className="text-slate-700">{task.professionalName}</span></p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <select
                                  value={task.status}
                                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                  className="text-sm font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
                                >
                                  <option value="Pendente">Pendente</option>
                                  <option value="EmProgresso">Em Progresso</option>
                                  <option value="Concluido">Concluído</option>
                                </select>
                                <button
                                  onClick={() => setViewingTask(task)}
                                  className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                                  title="Ver Detalhes"
                                >
                                  <ChevronRight size={20} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingItem(task);
                                    setIsEditMode(true);
                                    setModalType('task');
                                    setIsModalOpen(true);
                                  }}
                                  className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                                  title="Editar"
                                >
                                  <UserCog size={20} />
                                </button>
                                <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Apagar">
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          ) : activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <header>
                <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Painel Operacional</motion.h2>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-slate-500 dark:text-slate-400 mt-2 font-medium">O seu resumo de atividades para hoje, {new Date().toLocaleDateString('pt-PT', { weekday: 'long', month: 'long', day: 'numeric' })}.</motion.p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard delay={0.1} label="Total de Tarefas" value={analyticsData.total} icon={BarChart3} color="bg-indigo-600" />
                <StatCard delay={0.2} label="Concluídas" value={analyticsData.completed} icon={CheckCircle2} color="bg-emerald-500" />
                <StatCard delay={0.3} label="Pendentes" value={analyticsData.pending} icon={Clock} color="bg-amber-500" />
                <StatCard delay={0.4} label="Atrasadas" value={analyticsData.missed} icon={AlertOctagon} color="bg-red-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Analytics Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col transition-colors"
                >
                  <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-6">Desempenho Global</h3>
                  <div className="flex-1 min-h-[250px] w-full relative">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a' }}
                            itemStyle={{ color: isDark ? '#e2e8f0' : '#475569' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium text-sm">
                        Sem dados suficientes
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Today's Agenda */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="lg:col-span-2 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Agenda de Hoje</h3>
                    <button
                      onClick={() => {
                        setModalType('task');
                        setIsModalOpen(true);
                      }}
                      className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                    >
                      <Plus size={20} />
                      Nova Tarefa
                    </button>
                  </div>

                  <div className="space-y-4">
                    {todayTasks.length === 0 ? (
                      <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                          <Calendar className="text-slate-400 dark:text-slate-500" size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sem tarefas para hoje</h4>
                        <p className="text-slate-500 dark:text-slate-400">Aproveite o seu tempo livre ou agende algo novo.</p>
                      </div>
                    ) : (
                      todayTasks.map((task, idx) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + (idx * 0.1) }}
                          whileHover={{ scale: 1.01 }}
                          key={task.id}
                          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer"
                          onClick={() => setSelectedClientId(task.clientId)}
                        >
                          <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${task.status === 'Concluido' ? 'bg-emerald-500 text-white' :
                              task.status === 'EmProgresso' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
                              }`}>
                              {task.status === 'Concluido' ? <CheckCircle2 size={28} /> :
                                task.status === 'EmProgresso' ? <Clock size={28} /> :
                                  <Calendar size={28} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1.5">
                                <h4 className="font-bold text-lg text-slate-900">{task.serviceName}</h4>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${task.status === 'Concluido' ? 'bg-emerald-100 text-emerald-700' :
                                  task.status === 'EmProgresso' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>
                                  {task.status}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 font-medium">
                                <span className="text-indigo-600 font-bold">{task.clientName}</span> • {task.time || 'Todo o dia'} • <span className="text-slate-700">{task.professionalName}</span>
                              </p>
                            </div>
                          </div>
                          <div className="p-2 text-slate-300 group-hover:text-indigo-600 transition-colors group-hover:translate-x-1 group-hover:bg-indigo-50 rounded-xl">
                            <ChevronRight size={24} />
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : activeTab === 'clients' ? (
            <motion.div
              key="clients"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Clientes</h2>
                  <p className="text-slate-500 mt-2 font-medium">Gerencie o relacionamento com os seus clientes e serviços.</p>
                </div>
                <button
                  onClick={() => {
                    setModalType('client');
                    setIsModalOpen(true);
                  }}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                  <Plus size={20} />
                  Adicionar Cliente
                </button>
              </header>

              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Pesquisar por nome, telefone ou serviço..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none shadow-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients
                  .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.contractedService.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(client => (
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer group transition-colors"
                    >
                      <div className="flex justify-between items-start mb-5">
                        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 transition-colors shadow-sm">
                          {client.name.charAt(0)}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem(client);
                              setIsEditMode(true);
                              setModalType('client');
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-slate-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            <UserCog size={20} />
                          </button>
                          <button className="p-2 text-slate-300 dark:text-slate-600 hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
                            <MoreVertical size={20} />
                          </button>
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">{client.name}</h4>
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-5">
                        <Briefcase size={16} /> {client.contractedService}
                      </p>
                      <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2"><Phone size={16} /> {client.phone}</span>
                        <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all group-hover:translate-x-1" size={20} />
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          ) : activeTab === 'professionals' ? (
            <motion.div
              key="professionals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Profissionais</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Gerencie a sua equipa e prestadores de serviços.</p>
                </div>
                <button
                  onClick={() => {
                    setModalType('professional');
                    setIsModalOpen(true);
                  }}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                  <Plus size={20} />
                  Adicionar Profissional
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map(pro => (
                  <motion.div whileHover={{ scale: 1.02 }} key={pro.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 transition-colors">
                    <div className="w-16 h-16 bg-slate-900 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md cursor-default transition-colors">
                      {pro.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white">{pro.name}</h4>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mt-0.5">{pro.role}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-2"><Phone size={14} /> {pro.phone}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(pro);
                          setIsEditMode(true);
                          setModalType('professional');
                          setIsModalOpen(true);
                        }}
                        className="p-3 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors"
                      >
                        <UserCog size={20} />
                      </button>
                      <button onClick={() => deleteProfessional(pro.id)} className="p-3 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 rounded-xl transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : activeTab === 'tenant_users' ? (
            <TenantUsersScreen key="tenant_users" apiFetch={apiFetch} />
          ) : activeTab === 'tenant_billing' ? (
            <TenantBillingScreen key="tenant_billing" apiFetch={apiFetch} />
          ) : (
            <SettingsScreen key="settings" user={user} apiFetch={apiFetch} />
          )}
        </AnimatePresence>
      </main>

      <FloatingUserMenu user={user} onLogout={logout} />

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl p-8 overflow-hidden transition-colors"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                  {isEditMode
                    ? (modalType === 'client' ? 'Editar Cliente' : modalType === 'professional' ? 'Editar Profissional' : 'Editar Tarefa')
                    : (modalType === 'client' ? 'Novo Cliente' : modalType === 'professional' ? 'Novo Profissional' : 'Nova Tarefa')}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={modalType === 'client' ? handleCreateClient : modalType === 'professional' ? handleCreateProfessional : handleCreateTask} className="space-y-5">
                {modalType === 'client' ? (
                  <>
                    <Input label="Nome Completo" name="name" required defaultValue={editingItem?.name} />
                    <Input label="Número de Telefone" name="phone" required defaultValue={editingItem?.phone} />
                    <Input label="Serviço Contratado" name="contractedService" required defaultValue={editingItem?.contractedService} />
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Notas</label>
                      <textarea name="notes" rows={3} defaultValue={editingItem?.notes} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-all resize-none font-medium" />
                    </div>
                  </>
                ) : modalType === 'professional' ? (
                  <>
                    <Input label="Nome" name="name" required defaultValue={editingItem?.name} />
                    <Input label="Telefone" name="phone" required defaultValue={editingItem?.phone} />
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Cargo</label>
                      <select name="role" required defaultValue={editingItem?.role || "Técnico"} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-all font-medium appearance-none">
                        <option value="Técnico">Técnico</option>
                        <option value="Designer">Designer</option>
                        <option value="Suporte">Suporte</option>
                        <option value="Gestor">Gestor</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <Input label="Nome do Serviço" name="serviceName" required defaultValue={editingItem?.serviceName} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Data" name="date" type="date" required defaultValue={editingItem?.date || todayDate} />
                      <Input label="Hora" name="time" type="time" defaultValue={editingItem?.time} />
                    </div>
                    {!selectedClientId && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Cliente</label>
                        <select name="clientId" required defaultValue={editingItem?.clientId || ""} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-all font-medium appearance-none">
                          <option value="">Selecione um cliente...</option>
                          {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Profissional Responsável</label>
                      <select name="professionalId" required defaultValue={editingItem?.professionalId || ""} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-all font-medium appearance-none">
                        <option value="">Selecione um profissional...</option>
                        {professionals.map(pro => (
                          <option key={pro.id} value={pro.id}>{pro.name} ({pro.role})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Notas</label>
                      <textarea name="notes" rows={2} defaultValue={editingItem?.notes} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-all resize-none font-medium" />
                    </div>
                  </>
                )}
                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-5 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 px-5 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                    {isEditMode ? 'Guardar Alterações' : `Criar ${modalType === 'client' ? 'Cliente' : modalType === 'professional' ? 'Profissional' : 'Tarefa'}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trash Modal */}
      <AnimatePresence>
        {isTrashOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTrashOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.97 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-white dark:bg-slate-900 w-full sm:max-w-2xl rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden transition-colors max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Lixo</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Itens apagados recentemente</p>
                </div>
                <button
                  onClick={() => setIsTrashOpen(false)}
                  className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {trashItems.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trash2 size={28} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 font-medium">O lixo está vazio.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {trashItems.map((item) => (
                      <div key={`${item.type}-${item.id}`} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'client' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'}`}>
                            {item.type === 'client' ? <Users size={18} /> : <Calendar size={18} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                              {item.type === 'client' ? 'Cliente' : 'Tarefa'} • Apagado em {new Date(item.deletedAt).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          <button
                            onClick={() => { restoreItem(item.type, item.id); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold rounded-lg text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                          >
                            <Activity size={14} /> Restaurar
                          </button>
                          <button
                            onClick={() => { permanentDelete(item.type, item.id); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-lg text-xs hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          >
                            <Trash2 size={14} /> Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task View Modal */}
      <AnimatePresence>
        {viewingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingTask(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] shadow-2xl p-8 overflow-hidden transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Detalhes da Tarefa</h3>
                <button onClick={() => setViewingTask(null)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Serviço</label>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{viewingTask.serviceName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data</label>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{viewingTask.date}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hora</label>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{viewingTask.time || 'Não definida'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profissional</label>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{viewingTask.professionalName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</label>
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400">{viewingTask.status}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notas</label>
                  <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 whitespace-pre-wrap min-h-[100px]">
                    {viewingTask.notes || 'Sem notas adicionais.'}
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <button onClick={() => setViewingTask(null)} className="w-full py-4 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold rounded-2xl hover:opacity-90 transition-all">Fechar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Minor Shared Components ---
const Input = ({ label, ...props }: any) => (
  <div>
    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
    <input
      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-all font-medium"
      {...props}
    />
  </div>
);

// --- Login Screen Component ---
function LoginScreen({ setToken, setUser }: { setToken: any, setUser: any }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize Google GIS
    const initGoogle = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: "683501719266-m2oet733fshlv58cbt01ndunh69t20m7.apps.googleusercontent.com", // Example/Mock Client ID
          callback: handleGoogleCallback,
          auto_select: false,
          itp_support: true
        });
      } else {
        setTimeout(initGoogle, 500);
      }
    };
    initGoogle();

    // Initialize Facebook SDK
    (window as any).fbAsyncInit = function () {
      (window as any).FB.init({
        appId: '1074154483868661', // Example/Mock App ID
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };
  }, []);

  const handleGoogleCallback = async (response: any) => {
    setLoading(true);
    try {
      console.log("Google response:", response);
      const res = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'Google', email: 'user@gmail.com', name: 'Google User' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no login Google');
      sessionStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isRegister) {
      if (password !== confirmPassword) {
        return setError('As palavras-passe não coincidem.');
      }
      setLoading(true);
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro no registo');

        setIsRegister(false);
        setSuccess('Your registration has been received. Please wait for administrator approval.');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro no login');

        sessionStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOAuth = async (provider: string) => {
    setError('');
    setSuccess('');

    if (provider === 'Google') {
      if (!(window as any).google?.accounts?.id) {
        return setError('Google Sign-In indispontível no momento.');
      }
      (window as any).google.accounts.id.prompt(); // Shows the account picker
      return;
    }

    if (provider === 'Facebook') {
      if (!(window as any).FB) {
        return setError('Facebook Login indispontível no momento.');
      }
      (window as any).FB.login((response: any) => {
        if (response.authResponse) {
          handleFacebookCallback(response.authResponse);
        } else {
          setError('Login cancelado pelo utilizador.');
        }
      }, { scope: 'public_profile,email' });
      return;
    }
  };

  const handleFacebookCallback = async (authResponse: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'Facebook', email: 'user@facebook.com', name: 'Facebook User' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no login Facebook');
      sessionStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans p-6 selection:bg-indigo-100 selection:text-indigo-900 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px]"
      >
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-10 shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-xl shadow-indigo-200 mb-6">
              C
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{isRegister ? 'Criar Conta' : 'Bem-vindo'}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">{isRegister ? 'Registe-se para aceder à plataforma' : 'Acesse o seu painel de controle'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-medium flex items-center gap-3 text-sm">
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl font-medium flex items-center gap-3 text-sm">
                <CheckCircle2 size={18} />
                {success}
              </motion.div>
            )}

            {isRegister && (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nome</label>
                <div className="relative">
                  <UserCog className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text" required value={name} onChange={e => setName(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-500 transition-all font-medium"
                    placeholder="O seu nome"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-500 transition-all font-medium"
                  placeholder="admin@admin.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-500 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirmar Palavra-passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-500 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full mt-2 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isRegister ? 'Criar Conta' : 'Entrar no Sistema'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium transition-colors">Ou continue com</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => handleOAuth('Google')} disabled={loading} className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all disabled:opacity-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                Google
              </button>
              <button type="button" onClick={() => handleOAuth('Facebook')} disabled={loading} className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all disabled:opacity-50">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                Facebook
              </button>
            </div>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
              {isRegister ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); setName(''); setConfirmPassword(''); }}
                className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline font-bold"
              >
                {isRegister ? 'Entrar' : 'Criar Conta'}
              </button>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// --- Settings Screen Component ---
function SettingsScreen({ user, apiFetch }: { key?: string, user: User | null, apiFetch: any }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newEmail, newPassword })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao atualizar dados');
      }
      setMessage({ text: 'Credenciais atualizadas com sucesso!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const masterTabs = user?.role === 'MasterAdmin' ? [
    { id: 'profile', label: 'Minha Conta' },
    { id: 'user_management', label: 'Novos Acessos' },
    { id: 'full_user_management', label: 'Gestão de Contas' },
    { id: 'traffic', label: 'Tráfego' },
    { id: 'master_billing', label: 'Pagamentos' }
  ] : [];

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <header>
        <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Configurações</h2>
        <p className="text-slate-500 mt-2 font-medium">Gerencie as configurações da sua conta e plataforma.</p>
      </header>

      {user?.role === 'MasterAdmin' && (
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
          {masterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 font-bold text-sm whitespace-nowrap rounded-t-xl transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-900 border text-indigo-700 dark:text-indigo-400 border-slate-200 dark:border-slate-800 border-b-0 translate-y-[1px]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 lg:p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Credenciais de Acesso</h3>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {message.text && (
              <div className={`p-4 rounded-2xl font-medium flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                <AlertCircle size={18} />
                {message.text}
              </div>
            )}
            <Input label="Novo E-mail (Opcional)" type="email" value={newEmail} onChange={(e: any) => setNewEmail(e.target.value)} />
            <Input label="Nova Palavra-passe (Opcional)" type="password" value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} />
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Input label="Palavra-passe Atual" type="password" required value={currentPassword} onChange={(e: any) => setCurrentPassword(e.target.value)} placeholder="Digite a palavra-passe atual para confirmar" />
            </div>
            <button type="submit" disabled={loading} className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 w-full sm:w-auto flex items-center justify-center min-w-[200px]">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Guardar Alterações'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'user_management' && <UserManagementScreen apiFetch={apiFetch} />}
      {activeTab === 'full_user_management' && <FullUserManagementScreen apiFetch={apiFetch} />}
      {activeTab === 'traffic' && <SystemTrafficScreen apiFetch={apiFetch} />}
      {activeTab === 'master_billing' && <MasterBillingScreen apiFetch={apiFetch} />}

    </motion.div>
  );
}

// --- Admin Screens ---
function UserManagementScreen({ apiFetch }: { key?: string, apiFetch: any }) {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setError(null);
      const res = await apiFetch('/api/admin/users/pending');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar utilizadores');

      if (Array.isArray(data)) {
        setPendingUsers(data);
      } else {
        setPendingUsers([]);
      }
    } catch (err: any) {
      console.error("Fetch pending users error:", err);
      setError(err.message);
      setPendingUsers([]);
    }
  };
  const handleApprove = async (userId: string, targetRole: string) => {
    await apiFetch('/api/admin/users/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'APPROVE', role: targetRole })
    });
    fetchUsers();
  };
  const handleReject = async (userId: string) => {
    await apiFetch('/api/admin/users/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'REJECT' })
    });
    fetchUsers();
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-medium flex items-center gap-3 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
        {pendingUsers.length === 0 ? (
          <div className="text-center text-slate-500 py-10 font-medium">{error ? 'Não foi possível carregar.' : 'Não existem pedidos de acesso pendentes.'}</div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map(u => (
              <div key={u.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-2xl gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">{u.email}</h4>
                  <p className="text-sm font-medium text-slate-500">Registado em: {new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => handleApprove(u.id, 'TenantAdmin')} className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl text-sm transition-colors shadow-sm">Aprovar como Admin (Pago)</button>
                  <button onClick={() => handleApprove(u.id, 'StaffUser')} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl text-sm transition-colors">Aprovar como Equipa (Grátis)</button>
                  <button onClick={() => handleReject(u.id)} className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 font-bold rounded-xl text-sm transition-colors">Rejeitar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FullUserManagementScreen({ apiFetch }: { apiFetch: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/user-list/all');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar utilizadores');
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao alterar status');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (confirm(`AVISO CRÍTICO: Tem a certeza que deseja excluir a conta "${email}"? \n\nIsto irá APAGAR PERMANENTEMENTE o workspace associado (clientes, tarefas, profissionais) e libertar espaço no banco de dados.`)) {
      try {
        const res = await apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao excluir');
        alert(data.message);
        fetchUsers();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-medium flex items-center gap-3 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto transition-colors">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="pb-4 px-4">Utilizador / Workspace</th>
              <th className="pb-4 px-4">Cargo</th>
              <th className="pb-4 px-4">Estado</th>
              <th className="pb-4 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {users.map((u) => (
              <tr key={u.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="py-4 px-4">
                  <div className="font-bold text-slate-900 dark:text-white">{u.email}</div>
                  <div className="text-xs text-slate-500 font-medium">{u.tenantName || 'Sem Workspace'}</div>
                </td>
                <td className="py-4 px-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${u.role === 'MasterAdmin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`text-xs font-bold ${u.status === 'ACTIVE' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  {u.role !== 'MasterAdmin' && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(u.id, u.status)}
                        className={`p-2 rounded-lg transition-all ${u.status === 'ACTIVE'
                          ? 'text-amber-500 hover:bg-amber-50'
                          : 'text-emerald-500 hover:bg-emerald-50'}`}
                        title={u.status === 'ACTIVE' ? "Parar Acesso (Suspender)" : "Reativar Acesso"}
                      >
                        {u.status === 'ACTIVE' ? <AlertOctagon size={18} /> : <CheckCircle2 size={18} />}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.email)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Excluir Conta e Workspace"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loading && (
          <div className="text-center py-10 text-slate-500 font-medium">{error ? 'Erro ao carregar.' : 'Nenhum utilizador encontrado.'}</div>
        )}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

function TenantManagementScreen({ apiFetch }: { key?: string, apiFetch: any }) {
  const [tenants, setTenants] = useState<any[]>([]);
  useEffect(() => {
    fetchTenants();
  }, []);
  const fetchTenants = async () => {
    const res = await apiFetch('/api/admin/tenants');
    setTenants(await res.json());
  };
  return (
    <motion.div key="tenants" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
      <header>
        <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white">Workspace Monitor</h2>
        <p className="text-slate-500 mt-2 font-medium">Monitorize a atividade em todos os workspaces da plataforma.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map(t => (
          <div key={t.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t.name}</h4>
            <p className="text-sm font-medium text-slate-500 mb-4">{t.adminEmail || 'Sem email admin'} • <span className="text-indigo-600 dark:text-indigo-400 font-bold">{t.plan}</span></p>
            <div className="flex justify-between items-center text-sm font-medium border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
              <span className="text-slate-600 dark:text-slate-400">Users: <span className="font-bold text-slate-900 dark:text-white">{t.userCount}</span></span>
              <span className="text-indigo-600 dark:text-indigo-400">Clientes: <span className="font-bold text-indigo-700 dark:text-indigo-300">{t.clientCount}</span></span>
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-3 text-right">Último Login: {t.lastLogin ? new Date(t.lastLogin).toLocaleDateString() : 'N/A'}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MasterBillingScreen({ apiFetch }: { key?: string, apiFetch: any }) {
  const [dashboard, setDashboard] = useState<any>({ activeSubscriptions: 0, totalTenants: 0, mrr: 0 });
  const [tenants, setTenants] = useState<any[]>([]);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    const dashRes = await apiFetch('/api/admin/billing/dashboard');
    setDashboard(await dashRes.json());
    const tenantsRes = await apiFetch('/api/admin/tenants');
    setTenants(await tenantsRes.json());
  };
  const updateStatus = async (tenantId: string, status: string, plan: string) => {
    await apiFetch('/api/admin/billing/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, status, plan })
    });
    fetchData();
  };
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
          <p className="text-indigo-100 font-medium">Receita Recorrente Mensal</p>
          <h3 className="text-4xl font-bold mt-2">R${dashboard.mrr}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <p className="text-slate-500 font-medium">Assinaturas Ativas</p>
          <h3 className="text-4xl font-bold mt-2 text-slate-900 dark:text-white">{dashboard.activeSubscriptions}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <p className="text-slate-500 font-medium">Total de Instâncias</p>
          <h3 className="text-4xl font-bold mt-2 text-slate-900 dark:text-white">{dashboard.totalTenants}</h3>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm mt-8">
        <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Gerir Assinaturas dos Workspaces</h3>
        <div className="space-y-4">
          {tenants.map(t => (
            <div key={t.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-2xl gap-4">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{t.adminEmail || t.name}</h4>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{t.plan}</span> • Status:
                  <span className={`ml-1 font-bold ${t.subscriptionStatus === 'ACTIVE' ? 'text-emerald-500' : t.subscriptionStatus === 'SUSPENDED' ? 'text-red-500' : 'text-amber-500'}`}>
                    {t.subscriptionStatus}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {t.subscriptionStatus !== 'ACTIVE' && (
                  <button onClick={() => updateStatus(t.id, 'ACTIVE', t.plan)} className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-sm transition-colors hover:bg-emerald-100">Ativar Conta</button>
                )}
                {t.subscriptionStatus === 'ACTIVE' && (
                  <button onClick={() => updateStatus(t.id, 'SUSPENDED', t.plan)} className="px-4 py-2 bg-amber-50 text-amber-700 font-bold rounded-xl text-sm transition-colors hover:bg-amber-100">Suspender Conta</button>
                )}
                {t.subscriptionStatus !== 'CANCELLED' && (
                  <button onClick={() => updateStatus(t.id, 'CANCELLED', t.plan)} className="px-4 py-2 bg-red-50 text-red-700 font-bold rounded-xl text-sm transition-colors hover:bg-red-100">Cancelar Conta</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Trash Screen Component ---
function TrashScreen({ trashItems, onRestore, onPermanentDelete }: { trashItems: any[], onRestore: any, onPermanentDelete: any }) {
  return (
    <motion.div
      key="trash"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header>
        <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Lixo</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Itens removidos recentemente. Pode restaurá-los ou eliminá-los permanentemente.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {trashItems.length === 0 ? (
          <div className="p-20 text-center text-slate-400 font-medium font-display">
            O seu lixo está vazio.
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {trashItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.type === 'client' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {item.type === 'client' ? <Users size={24} /> : <Calendar size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</h4>
                    <p className="text-sm text-slate-500 font-medium">
                      Tipo: <span className="font-bold text-slate-700 dark:text-slate-300">{item.type === 'client' ? 'Cliente' : 'Tarefa'}</span> • Apagado em: {new Date(item.deletedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onRestore(item.type, item.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                  >
                    <Activity size={16} /> Restaurar
                  </button>
                  <button
                    onClick={() => onPermanentDelete(item.type, item.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <Trash2 size={16} /> Eliminar Permanente
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SystemTrafficScreen({ apiFetch }: { key?: string, apiFetch: any }) {
  const [traffic, setTraffic] = useState<any>({ totalRegistrations: 0, newUsersToday: 0, activeTenants: 0, totalLogins: 0, recentLogins: [] });
  useEffect(() => {
    const fetchLogs = async () => {
      const res = await apiFetch('/api/admin/traffic');
      setTraffic(await res.json());
    };
    fetchLogs();
  }, [apiFetch]);
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Registos Totais</p>
          <h3 className="text-3xl font-display font-bold mt-2 text-slate-900 dark:text-white">{traffic.totalRegistrations}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Novos Hoje</p>
          <h3 className="text-3xl font-display font-bold mt-2 text-indigo-600 dark:text-indigo-400">{traffic.newUsersToday}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Tenants Ativos</p>
          <h3 className="text-3xl font-display font-bold mt-2 text-slate-900 dark:text-white">{traffic.activeTenants}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Acessos Totais</p>
          <h3 className="text-3xl font-display font-bold mt-2 text-slate-900 dark:text-white">{traffic.totalLogins}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto">
        <h3 className="text-lg font-bold mb-4 dark:text-white">Logins Recentes</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 text-sm">
              <th className="pb-4 px-4 font-bold uppercase tracking-wider">Data</th>
              <th className="pb-4 px-4 font-bold uppercase tracking-wider">Utilizador</th>
              <th className="pb-4 px-4 font-bold uppercase tracking-wider">Workspace</th>
              <th className="pb-4 px-4 font-bold uppercase tracking-wider">IP</th>
              <th className="pb-4 px-4 font-bold uppercase tracking-wider">Ação</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {traffic.recentLogins?.map((log: any) => (
              <tr key={log.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="py-4 px-4">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="py-4 px-4 font-bold">{log.userEmail}</td>
                <td className="py-4 px-4">{log.tenantName || log.tenantId || '-'}</td>
                <td className="py-4 px-4 font-mono text-xs">{log.ipAddress}</td>
                <td className={`py-4 px-4 font-bold ${log.loginStatus === 'SUCCESS' ? 'text-emerald-500' : 'text-red-500'}`}>{log.loginStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TenantUsersScreen({ apiFetch }: { key?: string, apiFetch: any }) {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {
    const res = await apiFetch('/api/tenant/users');
    setUsers(await res.json());
  };
  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja apagar este membro da equipa?")) {
      await apiFetch(`/api/tenant/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    }
  };
  return (
    <motion.div key="tenant_users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white">Acessos da Equipa</h2>
          <p className="text-slate-500 mt-2 font-medium">Dê acesso à plataforma aos seus colaboradores.</p>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20" onClick={() => alert("A criar utilizador... [A ser conectado ao modal em futuras iterações]")}>
          <Plus size={20} /> Nova Conta
        </button>
      </header>
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
        {users.map(u => (
          <div key={u.id} className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors rounded-xl">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-lg">{u.email}</h4>
              <p className="text-sm font-medium text-slate-500 mt-1">{u.role} • <span className={u.status === 'ACTIVE' ? 'text-emerald-500' : 'text-amber-500'}>{u.status}</span></p>
            </div>
            {u.role !== 'TenantAdmin' ? (
              <button onClick={() => handleDelete(u.id)} className="p-3 bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"><Trash2 size={20} /></button>
            ) : (
              <span className="text-xs font-bold px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg uppercase tracking-wider">Admin</span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function TenantBillingScreen({ apiFetch }: { key?: string, apiFetch?: any }) {
  return (
    <motion.div key="tenant_billing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
      <header>
        <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white">Assinatura do Workspace</h2>
        <p className="text-slate-500 mt-2 font-medium">Faça o upgrade para desbloquear mais funcionalidades de gestão.</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {['Starter Plan', 'Professional Plan', 'Enterprise Plan'].map((plan, i) => (
          <div key={plan} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 p-8 rounded-3xl transition-all cursor-pointer group hover:shadow-2xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 hover:-translate-y-2 relative overflow-hidden">
            {i === 1 && <div className="absolute top-0 inset-x-0 h-1.5 bg-indigo-600" />}
            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">{plan}</h3>
            <p className="text-sm font-medium text-slate-500 mb-6 h-10">{i === 0 ? 'Essencial para iniciantes e pequenos negócios' : i === 1 ? 'O plano mais recomendado e escolhido por PMEs' : 'Ideal para grandes volumes e franquias'}</p>
            <h4 className="text-5xl font-bold text-slate-900 dark:text-white mb-8">€{i === 0 ? 29 : i === 1 ? 79 : 199}<span className="text-lg text-slate-400 font-medium">/mês</span></h4>
            <ul className="space-y-4 mb-10 text-sm font-medium text-slate-600 dark:text-slate-300">
              <li className="flex gap-3"><CheckCircle2 className="text-indigo-500 shrink-0" size={20} /> Até {i === 0 ? 50 : i === 1 ? 250 : 'Ilimitado'} Clientes</li>
              <li className="flex gap-3"><CheckCircle2 className="text-indigo-500 shrink-0" size={20} /> {i === 0 ? 3 : i === 1 ? 10 : 'Ilimitados'} Utilizadores</li>
              <li className="flex gap-3"><CheckCircle2 className="text-indigo-500 shrink-0" size={20} /> Suporte {i === 2 ? 'Prioritário 24/7' : 'Standard'}</li>
            </ul>
            <button className={`w-full py-4 font-bold rounded-2xl transition-all ${i === 1 ? 'bg-[#0070ba] text-white shadow-lg shadow-blue-200 dark:shadow-none hover:bg-[#005ea6]' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Assinar com PayPal</button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
