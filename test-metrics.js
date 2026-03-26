import Database from 'better-sqlite3';
const db = new Database('client_control.db', { verbose: console.log });
try {
      const tid = 'legacy-tenant-1';
      console.log("totalClients");
      const totalClients = db.prepare("SELECT COUNT(*) as count FROM clients WHERE tenantId = ? AND deleted = 0").get(tid);
      console.log("newClientsThisMonth");
      const newClientsThisMonth = db.prepare("SELECT COUNT(*) as count FROM clients WHERE tenantId = ? AND deleted = 0 AND createdAt >= date('now', 'start of month')").get(tid);
      console.log("tasksInProgress");
      const tasksInProgress = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE tenantId = ? AND status != 'Concluido' AND deleted = 0").get(tid);
      console.log("tasksCompleted");
      const tasksCompleted = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE tenantId = ? AND status = 'Concluido' AND deleted = 0").get(tid);
      
      console.log("recentClients");
      const recentClients = db.prepare("SELECT * FROM clients WHERE tenantId = ? AND deleted = 0 ORDER BY createdAt DESC LIMIT 5").all(tid);
      
      console.log("tasksByStatus");
      const tasksByStatus = db.prepare(`
        SELECT status, COUNT(*) as count 
        FROM tasks 
        WHERE tenantId = ? AND deleted = 0
        GROUP BY status
      `).all(tid);

      console.log("clientsGrowth");
      const clientsGrowth = db.prepare(`
        SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count
        FROM clients 
        WHERE tenantId = ? AND deleted = 0 AND createdAt >= date('now', '-6 months')
        GROUP BY month
        ORDER BY month ASC
      `).all(tid);
      console.log("SUCCESS");
} catch(e) {
      console.error("ERROR CAUGHT:");
      console.error(e);
}
