import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Import
code = code.replace(
  "import { KanbanBoard } from './components/KanbanBoard';",
  "import { KanbanBoard } from './components/KanbanBoard';\nimport { ActivityHistory } from './components/ActivityHistory';"
);

// 2. Add Tab in Sidebar Menu
code = code.replace(
  /\{ id: 'kanban', icon: Calendar, label: 'Quadro Kanban' \},/g, 
  "{ id: 'kanban', icon: Calendar, label: 'Quadro Kanban' },\n        { id: 'history', icon: Activity, label: 'Histórico' },"
);

// 3. Add Component Render
code = code.replace(
  ") : activeTab === 'clients' ? (",
  `) : activeTab === 'history' ? (
             <div className="h-full">
               <ActivityHistory token={token} />
             </div>
          ) : activeTab === 'clients' ? (`
);

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx Activity log patch success!");
