import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const cronImport = `import cron from 'node-cron';\n`;
if (!code.includes("import cron")) {
  code = code.replace("import jwt from \"jsonwebtoken\";", "import jwt from \"jsonwebtoken\";\n" + cronImport);
}

const notificationApi = `
  // --- Notifications API ---
  app.get("/api/notifications", requireAuth, (req: any, res) => {
    try {
      const logs = db.prepare("SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 50").all(req.user.id);
      res.json(logs);
    } catch(e) {
      res.status(500).json({ error: "Erro" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, (req: any, res) => {
    try {
      if (req.params.id === 'all') {
         db.prepare("UPDATE notifications SET read = 1 WHERE userId = ?").run(req.user.id);
      } else {
         db.prepare("UPDATE notifications SET read = 1 WHERE id = ? AND userId = ?").run(req.params.id, req.user.id);
      }
      res.json({ success: true });
    } catch(e) {
      res.status(500).json({ error: "Erro" });
    }
  });

  // --- Cron Job ---
  if (process.env.NODE_ENV !== 'test') {
    cron.schedule('0 0 * * *', () => {
      console.log('[CRON] Checking for late and upcoming tasks...');
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const tasks = db.prepare("SELECT * FROM tasks WHERE status != 'Concluido' AND status != 'Concluído' AND deleted = 0").all() as any[];
      for (const t of tasks) {
         if (t.date < today) {
            // Atrasado
            const nid = Math.random().toString(36).substring(2, 11);
            db.prepare("INSERT INTO notifications (id, userId, tenantId, type, title, message, entityType, entityId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
               nid, t.professionalId, t.tenantId, 'PRAZO_ATRASADO', 'Serviço Atrasado', \`A tarefa "\${t.serviceName}" está atrasada.\`, 'SERVIÇO', t.id
            );
         } else if (t.date === tomorrow) {
            const nid = Math.random().toString(36).substring(2, 11);
            db.prepare("INSERT INTO notifications (id, userId, tenantId, type, title, message, entityType, entityId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
               nid, t.professionalId, t.tenantId, 'PRAZO_PROXIMO', 'Prazo a terminar', \`A tarefa "\${t.serviceName}" vence amanhã.\`, 'SERVIÇO', t.id
            );
         }
      }
    });
  }

  // --- Vite / Static Middleware ---
`;

code = code.replace("  // --- Vite / Static Middleware ---", notificationApi);

// Handle Novo servico push
code = code.replace(
  `logActivity(req, 'SERVIÇO', id, 'CRIOU', null, { serviceName, clientId, professionalId, date, priority });`,
  `logActivity(req, 'SERVIÇO', id, 'CRIOU', null, { serviceName, clientId, professionalId, date, priority });
    
    // Notify Professional
    try {
      const nid = Math.random().toString(36).substring(2, 11);
      db.prepare("INSERT INTO notifications (id, userId, tenantId, type, title, message, entityType, entityId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
        nid, professionalId, tid, 'NOVO_SERVICO', 'Novo Serviço Atribuído', \`Você foi designado para a tarefa: \${serviceName}\`, 'SERVIÇO', id
      );
    } catch(err) { console.error('[NOTIFY ERR]', err); }
`
);

fs.writeFileSync('server.ts', code);
console.log("Notifications backend patch success!");
