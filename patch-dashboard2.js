import fs from 'fs';

let dm = fs.readFileSync('src/components/DashboardMetrics.tsx', 'utf8');

if (!dm.includes('Tarefas Adicionadas')) {
  dm = dm.replace(
    "import { BarChart3, CheckCircle2, Clock, Users, ArrowUpRight, Plus } from 'lucide-react';",
    "import { BarChart3, CheckCircle2, Clock, Users, ArrowUpRight, Plus, Edit3, Trash2, Calendar } from 'lucide-react';"
  );

  dm = dm.replace(
    "export function DashboardMetrics({ metrics, isDark }: { metrics: MetricsData, isDark: boolean }) {",
    `export function DashboardMetrics({ 
    metrics, isDark, tasks, onAddTask, onEditTask, onDeleteTask 
  }: { 
    metrics: MetricsData, isDark: boolean, tasks: any[], onAddTask: () => void, onEditTask: (t: any) => void, onDeleteTask: (id: string) => void 
  }) {`
  );

  const tasksBlock = `
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
                  <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 uppercase me-2 shadow-sm">
                    {task.status}
                  </span>
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
`;
  dm = dm.replace("{/* Recentes */}", tasksBlock);
  fs.writeFileSync('src/components/DashboardMetrics.tsx', dm);
}

let app = fs.readFileSync('src/App.tsx', 'utf8');

if (!app.includes("tasks={tasks}")) {
  app = app.replace(
    "<DashboardMetrics metrics={metrics} isDark={isDark} />",
    `<DashboardMetrics 
                  metrics={metrics} 
                  isDark={isDark} 
                  tasks={tasks}
                  onAddTask={() => { setEditingItem(null); setIsEditMode(false); setModalType('task'); setIsModalOpen(true); }}
                  onEditTask={(task) => { setEditingItem(task); setIsEditMode(true); setModalType('task'); setIsModalOpen(true); }}
                  onDeleteTask={async (id) => {
                    if (!window.confirm('Deseja excluir este serviço?')) return;
                    try {
                      const res = await fetch('/api/tasks/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token }});
                      if (res.ok) {
                        fetchData();
                        refetchMetrics();
                      }
                    } catch(e) { console.error('Erro ao excluir tarefa:', e); }
                  }}
                />`
  );
  
  app = app.replace(
    "const { metrics, loading: metricsLoading } = useMetrics(token);",
    "const { metrics, loading: metricsLoading, refetch: refetchMetrics } = useMetrics(token);"
  );

  fs.writeFileSync('src/App.tsx', app);
}

console.log("Dashboard Tasks Patched successfully!");
