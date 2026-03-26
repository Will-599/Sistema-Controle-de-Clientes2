import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, CheckCircle2, Clock, Users, ArrowUpRight, Plus, Edit3, Trash2, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { MetricsData } from '../types';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const StatCard = ({ label, value, icon: Icon, color, delay = 0, variation }: { label: string, value: number, icon: any, color: string, delay?: number, variation?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.3 }}
    whileHover={{ y: -4, shadow: "0px 10px 20px rgba(0,0,0,0.05)" }}
    className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between"
  >
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <div className="flex items-center gap-3">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="text-4xl font-bold text-slate-900 dark:text-white"
        >
          {value}
        </motion.h3>
        {variation && (
          <span className="flex items-center text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-lg">
            <ArrowUpRight size={14} className="mr-0.5" />
            {variation}
          </span>
        )}
      </div>
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-sm`}>
      <Icon className="text-white" size={28} />
    </div>
  </motion.div>
);

export function DashboardMetrics({ 
    metrics, isDark, tasks, onAddTask, onEditTask, onDeleteTask, onUpdateStatus
  }: { 
    metrics: MetricsData, isDark: boolean, tasks: any[], onAddTask: () => void, onEditTask: (t: any) => void, onDeleteTask: (id: string) => void, onUpdateStatus: (id: string, status: string) => void
  }) {
  const chartData = metrics.tasksByStatus.map(t => ({
    name: t.status,
    value: t.count,
    color: t.status === 'Concluido' ? '#10b981' : t.status === 'EmProgresso' ? '#f59e0b' : '#3b82f6'
  }));

  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipColor = isDark ? '#f8fafc' : '#0f172a';

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard delay={0.1} label="Total de Clientes" value={metrics.totalClients} icon={Users} color="bg-indigo-600" />
        <StatCard delay={0.2} label="Serviços Pendentes" value={metrics.tasksPending || 0} icon={Clock} color="bg-rose-500" />
        <StatCard delay={0.3} label="Serviços em Progresso" value={metrics.tasksInProgress} icon={Clock} color="bg-amber-500" />
        <StatCard delay={0.4} label="Serviços Concluídos" value={metrics.tasksCompleted} icon={CheckCircle2} color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors"
        >
          <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-6">Crescimento de Clientes</h3>
          <div className="h-[300px] w-full">
            {metrics.clientsGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.clientsGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#64748b'} tickLine={false} axisLine={false} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tooltipColor }} 
                  />
                  <Area type="monotone" dataKey="count" name="Clientes" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">Sem dados suficientes</div>
            )}
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors flex flex-col"
        >
          <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-6">Status dos Serviços</h3>
          <div className="flex-1 w-full relative min-h-[250px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: tooltipBg, color: tooltipColor }} 
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
      </div>

      
      {/* Tarefas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Tarefas Adicionadas</h3>
          <button 
            onClick={onAddTask}
            className="flex items-center gap-1.5 text-sm font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <Plus size={16} /> Nova Tarefa
          </button>
        </div>
        
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 gap-4">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => onEditTask(task)}>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{task.serviceName}</h4>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{task.clientName || 'Cliente'} • {task.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <select
                    value={task.status}
                    onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                    className="text-[10px] uppercase font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 me-2 shadow-sm appearance-none outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Aguardando início">Aguardando início</option>
                    <option value="EmProgresso">Em progresso</option>
                    <option value="Avaliando">Avaliando</option>
                    <option value="Concluido">Concluído</option>
                  </select>
                  <button onClick={() => onEditTask(task)} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm" title="Editar">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => onDeleteTask(task.id)} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-sm" title="Excluir">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">Nenhuma tarefa encontrada.</div>
        )}
      </motion.div>

      {/* Recentes */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors"
      >
        <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-6">Clientes Recentes</h3>
        {metrics.recentClients.length > 0 ? (
          <div className="space-y-4">
            {metrics.recentClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{client.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{client.phone}</p>
                  </div>
                </div>
                <div className="text-sm font-medium px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 shadow-sm">
                  {client.contractedService || 'Sem Serviço'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">Nenhum cliente cadastrado ainda.</div>
        )}
      </motion.div>
    </div>
  );
}
