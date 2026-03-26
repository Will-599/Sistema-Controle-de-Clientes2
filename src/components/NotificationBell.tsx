import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock, AlertCircle, Briefcase, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification } from '../types';
import { useNotifications } from '../hooks/useNotifications';

function getIcon(type: string) {
  switch (type) {
    case 'PRAZO_ATRASADO': return <AlertCircle size={20} className="text-red-500" />;
    case 'PRAZO_PROXIMO': return <Clock size={20} className="text-amber-500" />;
    case 'NOVO_SERVICO': return <Briefcase size={20} className="text-indigo-500" />;
    default: return <Bell size={20} className="text-slate-500" />;
  }
}

export function NotificationBell({ token, onOpenAll }: { token: string | null, onOpenAll: () => void }) {
  const { notifications, unreadCount, markAsRead } = useNotifications(token);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors relative"
        title="Notificações"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 lg:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Notificações
                {unreadCount > 0 && (
                   <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 px-2 py-0.5 rounded-md text-xs">
                     {unreadCount}
                   </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAsRead('all')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Check size={14} /> Marcar lidas
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                  Sem notificações recentes.
                </div>
              ) : (
                notifications.slice(0, 5).map(n => (
                  <div 
                    key={n.id} 
                    className={`p-3 rounded-xl flex gap-3 items-start transition-colors ${n.read === 0 ? 'bg-indigo-50 dark:bg-slate-800/80 cursor-pointer' : 'opacity-70'}`}
                    onClick={() => {
                      if (n.read === 0) markAsRead(n.id);
                    }}
                  >
                    <div className="mt-1 shrink-0 p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full shadow-sm">
                      {getIcon(n.type)}
                    </div>
                    <div>
                      <h4 className={`text-sm ${n.read === 0 ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                        {n.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">
                        {new Date(n.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
               <button 
                 onClick={() => { setIsOpen(false); onOpenAll(); }}
                 className="w-full py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-1"
               >
                 Ver todas <ChevronRight size={16} />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
