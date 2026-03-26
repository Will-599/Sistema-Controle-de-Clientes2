import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const helperCode = `
  // Helper for tenant isolation
  const getTenantId = (req: any) => {
    if (req.user.role === 'MasterAdmin') {
      return req.query.targetTenantId || req.user.tenantId || 'legacy-tenant-1';
    }
    return req.user.tenantId;
  };

  const logActivity = (req: any, entityType: string, entityId: string, action: string, oldValue: any = null, newValue: any = null) => {
    try {
      const tid = getTenantId(req);
      const id = Math.random().toString(36).substring(2, 11);
      db.prepare("INSERT INTO activity_logs (id, tenantId, entityType, entityId, action, oldValue, newValue, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(id, tid, entityType, entityId, action, oldValue ? JSON.stringify(oldValue) : null, newValue ? JSON.stringify(newValue) : null, req.user.id);
    } catch(e) {
      console.error('[LOG ACTIVITY ERROR]', e);
    }
  };
`;

code = code.replace(
  `  // Helper for tenant isolation
  const getTenantId = (req: any) => {
    if (req.user.role === 'MasterAdmin') {
      return req.query.targetTenantId || req.user.tenantId || 'legacy-tenant-1';
    }
    return req.user.tenantId;
  };`,
  helperCode
);

// POST clients (CRIOU)
code = code.replace(
  `res.status(201).json({ id, tenantId: tid, name, phone, contractedService, notes });`,
  `logActivity(req, 'CLIENTE', id, 'CRIOU', null, { name, phone, contractedService, notes });\n    res.status(201).json({ id, tenantId: tid, name, phone, contractedService, notes });`
);

// PUT clients (EDITOU)
code = code.replace(
  `    db.prepare("UPDATE clients SET name = ?, phone = ?, contractedService = ?, notes = ? WHERE id = ?")
      .run(name, phone, contractedService, notes, req.params.id);
    res.json({ id: req.params.id, name, phone, contractedService, notes });`,
  `    const oldClient = db.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id) as any;
    db.prepare("UPDATE clients SET name = ?, phone = ?, contractedService = ?, notes = ? WHERE id = ?")
      .run(name, phone, contractedService, notes, req.params.id);
    logActivity(req, 'CLIENTE', req.params.id, 'EDITOU', oldClient, { name, phone, contractedService, notes });
    res.json({ id: req.params.id, name, phone, contractedService, notes });`
);

// DELETE clients (APAGOU)
code = code.replace(
  `    db.prepare("UPDATE clients SET deleted = 1, deletedAt = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
    // Also soft delete tasks of this client
    db.prepare("UPDATE tasks SET deleted = 1, deletedAt = CURRENT_TIMESTAMP WHERE clientId = ?").run(req.params.id);
    res.status(204).end();`,
  `    const oldClient = db.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id) as any;
    db.prepare("UPDATE clients SET deleted = 1, deletedAt = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
    // Also soft delete tasks of this client
    db.prepare("UPDATE tasks SET deleted = 1, deletedAt = CURRENT_TIMESTAMP WHERE clientId = ?").run(req.params.id);
    logActivity(req, 'CLIENTE', req.params.id, 'APAGOU', oldClient, null);
    res.status(204).end();`
);

// POST tasks (CRIOU)
code = code.replace(
  `res.status(201).json({ id, clientId, professionalId, tenantId: tid, serviceName, date, time, notes, priority, status: 'Aguardando início' });`,
  `logActivity(req, 'SERVIÇO', id, 'CRIOU', null, { serviceName, clientId, professionalId, date, priority });\n    res.status(201).json({ id, clientId, professionalId, tenantId: tid, serviceName, date, time, notes, priority, status: 'Aguardando início' });`
);

// PATCH tasks status (MUDOU_STATUS)
code = code.replace(
  `    const { status } = req.body;
    db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ id: req.params.id, status });`,
  `    const { status } = req.body;
    const oldTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id) as any;
    db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, req.params.id);
    logActivity(req, 'SERVIÇO', req.params.id, 'MUDOU_STATUS', { status: oldTask?.status }, { status });
    res.json({ id: req.params.id, status });`
);

// PUT tasks (EDITOU)
code = code.replace(
  `    db.prepare("UPDATE tasks SET clientId = ?, professionalId = ?, serviceName = ?, date = ?, time = ?, notes = ?, priority = ? WHERE id = ?")
      .run(clientId, professionalId, serviceName, date, time, notes, priority, req.params.id);
    res.json({ id: req.params.id, clientId, professionalId, serviceName, date, time, notes, priority });`,
  `    const oldTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id) as any;
    db.prepare("UPDATE tasks SET clientId = ?, professionalId = ?, serviceName = ?, date = ?, time = ?, notes = ?, priority = ? WHERE id = ?")
      .run(clientId, professionalId, serviceName, date, time, notes, priority, req.params.id);
    logActivity(req, 'SERVIÇO', req.params.id, 'EDITOU', oldTask, { clientId, professionalId, serviceName, date, time, priority });
    res.json({ id: req.params.id, clientId, professionalId, serviceName, date, time, notes, priority });`
);

// DELETE tasks (APAGOU)
code = code.replace(
  `    db.prepare("UPDATE tasks SET deleted = 1, deletedAt = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
    res.status(204).end();`,
  `    const oldTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id) as any;
    db.prepare("UPDATE tasks SET deleted = 1, deletedAt = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
    logActivity(req, 'SERVIÇO', req.params.id, 'APAGOU', oldTask, null);
    res.status(204).end();`
);

// GET /api/activity-log endpoint
const getEndpoint = `
  app.get("/api/activity-log", (req: any, res) => {
    try {
      const tid = getTenantId(req);
      if (!tid) return res.status(400).json({ error: "Tenant required" });
      
      const { entityType, action, days } = req.query;
      let queryStr = "SELECT a.*, u.email as userEmail FROM activity_logs a LEFT JOIN users u ON a.userId = u.id WHERE a.tenantId = ?";
      const params: any[] = [tid];
      
      if (entityType) { queryStr += " AND a.entityType = ?"; params.push(entityType); }
      if (action) { queryStr += " AND a.action = ?"; params.push(action); }
      if (days && days !== 'all') {
         queryStr += " AND a.timestamp >= date('now', ?)";
         params.push('-' + days + ' days');
      }
      
      queryStr += " ORDER BY a.timestamp DESC LIMIT 100";
      
      const logs = db.prepare(queryStr).all(...params);
      res.json(logs);
    } catch(e: any) {
      console.error('[ACTIVITY ERROR]', e);
      res.status(500).json({ error: 'Erro ao carregar histórico' });
    }
  });

  // Trash
`;

code = code.replace(
  `  // Trash`,
  getEndpoint
);

fs.writeFileSync('server.ts', code);
console.log("Activity logs backend patch success!");
