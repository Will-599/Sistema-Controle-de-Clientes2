import React from 'react';
import { motion } from 'motion/react';
import { Bell, Check, Clock, AlertCircle, Briefcase, Trash2 } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { Notification } from '../types';

function getIcon(type: string) {
  switch (type) {
    case 'PRAZO_ATRASADO': return <AlertCircle size={24} className="text-red-500" />;
    case 'PRAZO_PROXIMO': return <Clock size={24} className="text-amber-500" />;
    case 'NOVO_SERVICO': return <Briefcase size={24} className="text-indigo-500" />;
    default: return <Bell size={24} className="text-slate-500" />;
  }
}

export function NotificationsPage({ token }: { token: string | null }) {
  const { notifications, unreadCount, markAsRead } = useNotifications(token);

  return (
    <motion.div
      key="notifications"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
           <div className="flex items-center gap-3">
             <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Notificações</h2>
             {unreadCount > 0 && (
               <span className="bg-indigo-600 text-white font-bold px-3 py-1 text-sm rounded-full shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 animate-pulse">
                 {unreadCount} novas
               </span>
             )}
           </div>
           <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Acompanhe avisos, prazos e alertas do sistema.</p>
         </div>
         {unreadCount > 0 && (
           <button
             onClick={() => markAsRead('all')}
             className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
           >
             <Check size={20} className="text-emerald-500" />
             Marcar todas como lidas
           </button>
         )}
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Bell size={40} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2">Tudo tranquilo por aqui.</h3>
            <p className="max-w-sm">Você não possui notificações no momento. Quando algo importante precisar da sua atenção, avisaremos.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
             {notifications.map(n => (
               <div 
                 key={n.id}
                 className={`p-6 flex items-start gap-5 transition-colors ${n.read === 0 ? 'bg-indigo-50/50 dark:bg-slate-800/50' : 'hover:bg-slate-50 border-transparent dark:hover:bg-slate-800/30'}`}
               >
                 <div className="shrink-0 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full shadow-sm">
                   {getIcon(n.type)}
                 </div>
                 <div className="flex-1">
                   <div className="flex items-center justify-between mb-1">
                     <h4 className={`text-lg ${n.read === 0 ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                       {n.title}
                     </h4>
                     <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                       {new Date(n.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                     </span>
                   </div>
                   <p className="text-slate-600 dark:text-slate-400">{n.message}</p>
                   
                   {n.read === 0 && (
                     <button 
                       onClick={() => markAsRead(n.id)}
                       className="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
                     >
                       <Check size={16} /> Confirmar leitura
                     </button>
                   )}
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
