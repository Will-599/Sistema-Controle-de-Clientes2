import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Import
code = code.replace(
  "import { DashboardMetrics } from './components/DashboardMetrics';",
  "import { DashboardMetrics } from './components/DashboardMetrics';\nimport { KanbanBoard } from './components/KanbanBoard';"
);

// 2. Add Tab in Sidebar Menu
code = code.replace(
  /\{ id: 'clients', icon: Users, label: 'Clientes' \},/g, 
  "{ id: 'clients', icon: Users, label: 'Clientes' },\n        { id: 'kanban', icon: Calendar, label: 'Quadro Kanban' },"
);

// 3. Add Component Render
code = code.replace(
  ") : activeTab === 'clients' ? (",
  `) : activeTab === 'kanban' ? (
            <motion.div
              key="kanban"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col"
            >
              <header className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Quadro Kanban</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Acompanhe e mova os serviços pelas etapas do processo.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsEditMode(false);
                    setModalType('task');
                    setIsModalOpen(true);
                  }}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                  <Plus size={20} />
                  Nova Tarefa
                </button>
              </header>
              <div className="flex-1 w-full relative min-h-[500px]">
                <KanbanBoard 
                  tasks={tasks} 
                  updateTaskStatus={updateTaskStatus} 
                  onTaskClick={(task) => {
                    setEditingItem(task);
                    setIsEditMode(true);
                    setModalType('task');
                    setIsModalOpen(true);
                  }} 
                />
              </div>
            </motion.div>
          ) : activeTab === 'clients' ? (`
);

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx Kanban patch success!");
