import fs from 'fs';

// 1. DashboardMetrics
let dm = fs.readFileSync('src/components/DashboardMetrics.tsx', 'utf8');

dm = dm.replace(
  "onDeleteTask: (id: string) => void \n  }) {",
  "onDeleteTask: (id: string) => void, onUpdateStatus: (id: string, status: string) => void \n  }) {"
);

const oldStatusSpan = \`<span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 uppercase me-2 shadow-sm">
                    {task.status}
                  </span>\`;

const newStatusSelect = \`<select
                    value={task.status}
                    onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                    className="text-[10px] uppercase font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 me-2 shadow-sm appearance-none outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="EmProgresso">Em Progresso</option>
                    <option value="Avaliando">Avaliando</option>
                    <option value="Concluido">Concluído</option>
                  </select>\`;

dm = dm.replace(oldStatusSpan, newStatusSelect);
fs.writeFileSync('src/components/DashboardMetrics.tsx', dm);


// 2. App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');

const targetProps = /onDeleteTask=\{async\s*\(id\)\s*=>\s*\{[\s\S]*?\}\}\s*\/>/;
const match = app.match(targetProps);

if (match) {
  const replacement = match[0].replace(
    "/>",
    "onUpdateStatus={updateTaskStatus}\n                />"
  );
  app = app.replace(match[0], replacement);
  fs.writeFileSync('src/App.tsx', app);
}

console.log('Status Select Patched');
