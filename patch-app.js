import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

// The goal is to find `<DashboardMetrics metrics={metrics} isDark={isDark} />` 
// Since it might have newlines or spaces, we use RegEx

const targetComponent = /<DashboardMetrics\s+metrics=\{metrics\}\s+isDark=\{isDark\}\s*\/>/g;
app = app.replace(targetComponent, \`<DashboardMetrics 
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
        if (typeof refetchMetrics === 'function') refetchMetrics();
      }
    } catch(e) { console.error('Erro ao excluir tarefa:', e); }
  }}
/>\`);

const targetHook = /const\s*\{\s*metrics,\s*loading:\s*metricsLoading\s*\}\s*=\s*useMetrics\(token\);/g;
app = app.replace(targetHook, "const { metrics, loading: metricsLoading, refetch: refetchMetrics } = useMetrics(token);");

fs.writeFileSync('src/App.tsx', app);
console.log("App.tsx fixed!!");
