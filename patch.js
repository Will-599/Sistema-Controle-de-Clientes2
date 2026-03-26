import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { Client, Professional, Task, User, Tenant, AccessLog } from './types';",
  "import { Client, Professional, Task, User, Tenant, AccessLog } from './types';\nimport { useMetrics } from './hooks/useMetrics';\nimport { DashboardMetrics } from './components/DashboardMetrics';"
);

code = code.replace(
  "const [loading, setLoading] = useState(false);",
  "const [loading, setLoading] = useState(false);\n  const { metrics, loading: metricsLoading } = useMetrics(token);"
);

code = code.replace(
  ") : activeTab === 'dashboard' ? (",
  `) : activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <header>
                <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Painel Operacional</motion.h2>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-slate-500 dark:text-slate-400 mt-2 font-medium">O seu resumo de métricas de negócios em tempo real.</motion.p>
              </header>

              {metricsLoading || !metrics ? (
                <div className="flex items-center justify-center p-20">
                   <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : (
                <DashboardMetrics metrics={metrics} isDark={isDark} />
              )}
            </motion.div>
          ) : activeTab === 'dashboard-legacy' ? (`
);

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx patched successfully!");
