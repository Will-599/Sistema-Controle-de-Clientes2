import React from 'react';
import { motion } from 'motion/react';
import { Activity, Search, Filter, Download, UserPlus, Edit3, Trash2, Repeat, MessageSquare, Clock } from 'lucide-react';
import { useActivityLog } from '../hooks/useActivityLog';

export function ActivityHistory({ token }: { token: string | null }) {
  const { 
    logs, loading, 
    entityType, setEntityType, 
    action, setAction, 
    days, setDays, 
    searchQuery, setSearchQuery, 
    exportCSV 
  } = useActivityLog(token);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'CRIOU': return <UserPlus size={18} className="text-emerald-500" />;
      case 'EDITOU': return <Edit3 size={18} className="text-blue-500" />;
      case 'APAGOU': return <Trash2 size={18} className="text-red-500" />;
      case 'MUDOU_STATUS': return <Repeat size={18} className="text-amber-500" />;
      case 'COMENTOU': return <MessageSquare size={18} className="text-indigo-500" />;
      default: return <Activity size={18} className="text-slate-500" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'CRIOU': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'EDITOU': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'APAGOU': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'MUDOU_STATUS': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const formatSummary = (log: any) => {
    if (log.action === 'CRIOU') return `Nova entrada registada no sistema.`;
    if (log.action === 'APAGOU') return `Registo removido definitivamente.`;
    if (log.action === 'MUDOU_STATUS') {
       try {
         const oldD = JSON.parse(log.oldValue || '{}');
         const newD = JSON.parse(log.newValue || '{}');
         return `Status alterado de "${oldD.status || 'Pendente'}" para "${newD.status}"`;
       } catch(e) { return 'Status do serviço atualizado.'; }
    }
    return 'Detalhes da entidade foram atualizados.';
  };

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 h-full flex flex-col"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Histórico de Atividades</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Registo completo de todas as alterações feitas no sistema.</p>
        </div>
        <button
          onClick={exportCSV}
          className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Download size={20} />
          Exportar CSV
        </button>
      </header>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar por valores, IDs ou utilizador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-300 font-medium transition-all"
          />
        </div>
        
        <div className="flex gap-4 flex-wrap lg:flex-nowrap">
          <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className="w-full lg:w-40 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-700 dark:text-slate-300">
            <option value="">Todas as Entidades</option>
            <option value="CLIENTE">Clientes</option>
            <option value="SERVIÇO">Serviços</option>
          </select>
          <select value={action} onChange={(e) => setAction(e.target.value)} className="w-full lg:w-40 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-700 dark:text-slate-300">
            <option value="">Todas as Ações</option>
            <option value="CRIOU">Criação</option>
            <option value="EDITOU">Edição</option>
            <option value="MUDOU_STATUS">Mudança de Status</option>
            <option value="APAGOU">Exclusão</option>
          </select>
          <select value={days} onChange={(e) => setDays(e.target.value)} className="w-full lg:w-40 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-700 dark:text-slate-300">
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="all">Todo o histórico</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden flex flex-col relative">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <Activity size={48} className="mb-4 text-slate-300 dark:text-slate-700" />
            <p className="font-medium text-lg">Nenhum registo de atividade encontrado.</p>
            <p className="text-sm">Tente ajustar os seus filtros de pesquisa.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
            {logs.map((log, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                key={log.id} 
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-950 border-4 border-white dark:border-slate-900 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform hover:scale-110">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide ${getActionColor(log.action)}`}>
                      {log.action} {log.entityType}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <Clock size={14} />
                      {new Date(log.timestamp).toLocaleString('pt-PT', { 
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    {formatSummary(log)}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 break-all">
                    Entidade ID: <span className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-xs">{log.entityId}</span>
                  </p>
                  
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                      {log.userEmail ? log.userEmail.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Feito por {log.userEmail || 'Utilizador'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
