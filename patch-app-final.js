import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Imports
code = code.replace(
  "import { ActivityHistory } from './components/ActivityHistory';",
  "import { ActivityHistory } from './components/ActivityHistory';\nimport { NotificationBell } from './components/NotificationBell';\nimport { NotificationsPage } from './components/NotificationsPage';"
);

// 2. Add Bell to Header
code = code.replace(
  `<ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />`,
  `<NotificationBell token={token} onOpenAll={() => { setActiveTab('notifications'); setSelectedClientId(null); }} />\n          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />`
);

// 3. Add Component Render
code = code.replace(
  ") : activeTab === 'clients' ? (",
  `) : activeTab === 'notifications' ? (
              <NotificationsPage token={token} />
          ) : activeTab === 'clients' ? (`
);

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx Final patch success!");
