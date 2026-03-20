import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || "client_control.db";
const db = new Database(dbPath);
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-123";
const PORT = Number(process.env.PORT) || 5173;

console.log(`[BOOT] Database initialized. Target PORT: ${PORT}`);

// Simple Master Admin Elevation Check
const ensureAdmin = db.transaction(() => {
  db.prepare("UPDATE users SET role = 'MasterAdmin', tenantId = NULL WHERE email = 'admin@admin.com'").run();
});
ensureAdmin();

async function startServer() {
  const app = express();
  // Use the top-level PORT variable (5173 or process.env.PORT) from line 14

  app.use(express.json());
  
  // Request logger for debugging
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // --- API Routes ---
  // Auth Routes
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(400).json({ error: "Email já registado" });
    }

    const id = Math.random().toString(36).substring(2, 11);
    const hash = bcrypt.hashSync(password, 10);
    
    db.prepare("INSERT INTO users (id, email, passwordHash, status, role, tenantId) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, email, hash, 'PENDING_APPROVAL', 'StaffUser', null); // Default staff user, needs admin review to change role or tenant

    res.status(201).json({ success: true, message: "O seu registo foi recebido. Por favor, aguarde aprovação do administrador." });
  });

  app.post("/api/auth/oauth", (req, res) => {
    const { provider, email, name } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress || 'Unknown';

    const logAccess = (status: string, userId: string = 'N/A', tenantId: string = 'N/A') => {
      const logId = Math.random().toString(36).substring(2, 11);
      db.prepare("INSERT INTO access_logs (id, userId, userEmail, ipAddress, tenantId, loginStatus) VALUES (?, ?, ?, ?, ?, ?)").run(
        logId, userId, email, ipAddress, tenantId, status
      );
    };

    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    
    // Safety check: force admin@admin.com to MasterAdmin role at login
    if (user && email === 'admin@admin.com') {
      user.role = 'MasterAdmin';
      user.tenantId = null;
    }

    if (!user) {
      // Create new user explicitly set to PENDING_APPROVAL
      const id = Math.random().toString(36).substring(2, 11);
      // Generate a random password hash since they use OAuth
      const hash = bcrypt.hashSync(Math.random().toString(36), 10);
      
      db.prepare("INSERT INTO users (id, email, passwordHash, status, role, tenantId) VALUES (?, ?, ?, ?, ?, ?)")
        .run(id, email, hash, 'PENDING_APPROVAL', 'StaffUser', null);
      
      return res.status(201).json({ success: true, message: "O seu registo foi recebido. Por favor, aguarde aprovação do administrador." });
    }

    if (user.status === 'PENDING_APPROVAL') {
      logAccess('FAILED_PENDING_APPROVAL', user.id, user.tenantId || 'N/A');
      return res.status(403).json({ error: "A sua conta ainda está a aguardar aprovação pelo administrador." });
    }
    
    if (user.status === 'REJECTED') {
      logAccess('FAILED_REJECTED', user.id, user.tenantId || 'N/A');
      return res.status(403).json({ error: "A sua conta foi rejeitada ou suspensa." });
    }

    logAccess('SUCCESS', user.id, user.tenantId || 'N/A');

    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      tenantId: user.tenantId 
    }, JWT_SECRET, { expiresIn: '7d' });

    let subscriptionStatus = 'ACTIVE';
    if (user.tenantId) {
      const tenant = db.prepare("SELECT subscriptionStatus FROM tenants WHERE id = ?").get(user.tenantId) as any;
      if (tenant) subscriptionStatus = tenant.subscriptionStatus;
    }

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        tenantId: user.tenantId,
        status: user.status,
        subscriptionStatus
      } 
    });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress || 'Unknown';

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    
    // Safety check: force admin@admin.com to MasterAdmin role at login
    if (user && email === 'admin@admin.com') {
      user.role = 'MasterAdmin';
      user.tenantId = null;
    }

    const logAccess = (status: string, userId: string = 'N/A', tenantId: string = 'N/A') => {
      const logId = Math.random().toString(36).substring(2, 11);
      db.prepare("INSERT INTO access_logs (id, userId, userEmail, ipAddress, tenantId, loginStatus) VALUES (?, ?, ?, ?, ?, ?)").run(
        logId, userId, email, ipAddress, tenantId, status
      );
    };

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      logAccess('FAILED_CREDENTIALS');
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    if (user.status === 'PENDING_APPROVAL') {
      logAccess('FAILED_PENDING_APPROVAL', user.id, user.tenantId || 'N/A');
      return res.status(403).json({ error: "A sua conta ainda está a aguardar aprovação pelo administrador." });
    }
    
    if (user.status === 'REJECTED' || user.status === 'INACTIVE') {
      logAccess('FAILED_SUSPENDED', user.id, user.tenantId || 'N/A');
      return res.status(403).json({ error: "A sua conta foi desativada ou suspensa." });
    }

    logAccess('SUCCESS', user.id, user.tenantId || 'N/A');

    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      tenantId: user.tenantId 
    }, JWT_SECRET, { expiresIn: '7d' });

    let subscriptionStatus = 'ACTIVE';
    if (user.tenantId) {
      const tenant = db.prepare("SELECT subscriptionStatus FROM tenants WHERE id = ?").get(user.tenantId) as any;
      if (tenant) subscriptionStatus = tenant.subscriptionStatus;
    }

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        tenantId: user.tenantId,
        status: user.status,
        subscriptionStatus
      } 
    });
  });

  app.get("/api/auth/check", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Não autorizado" });
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Fetch fresh user data just in case roles/status changed
      const freshUser = db.prepare("SELECT id, email, role, tenantId, status FROM users WHERE id = ?").get(decoded.id) as any;
      
      if (!freshUser) {
        return res.status(401).json({ error: "Utilizador não encontrado" });
      }

      // Safety check for MasterAdmin
      if (freshUser.email === 'admin@admin.com') {
        freshUser.role = 'MasterAdmin';
      }

      if (freshUser.status === 'PENDING_APPROVAL' || freshUser.status === 'REJECTED') {
        return res.status(403).json({ error: "Acesso bloqueado" });
      }

      let subscriptionStatus = 'ACTIVE';
      if (freshUser.tenantId) {
        const tenant = db.prepare("SELECT subscriptionStatus FROM tenants WHERE id = ?").get(freshUser.tenantId) as any;
        if (tenant) subscriptionStatus = tenant.subscriptionStatus;
      }

      res.json({ user: { ...freshUser, subscriptionStatus } });
    } catch (e) {
      res.status(401).json({ error: "Token inválido" });
    }
  });

  // Auth Middleware for protected routes
  const requireAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Não autorizado" });
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      // Fetch fresh user data to avoid stale roles/status in token
      const user = db.prepare("SELECT id, email, role, status, tenantId FROM users WHERE id = ?").get(decoded.id) as any;
      if (!user) return res.status(401).json({ error: "Utilizador inválido" });
      
      // Safety check for MasterAdmin
      if (user.email === 'admin@admin.com') {
        user.role = 'MasterAdmin';
      }

      req.user = user;
      next();
    } catch (e) {
      res.status(401).json({ error: "Token inválido" });
    }
  };

  const requireMasterAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== 'MasterAdmin') {
      return res.status(403).json({ error: "Acesso negado. Requer privilégios de Master Admin." });
    }
    next();
  };

  const requireTenantAdmin = (req: any, res: any, next: any) => {
    if (!req.user || (req.user.role !== 'MasterAdmin' && req.user.role !== 'TenantAdmin')) {
      return res.status(403).json({ error: "Acesso negado. Requer privilégios de Admin." });
    }
    next();
  };

  app.put("/api/auth/update", requireAuth, (req: any, res: any) => {
    const { currentPassword, newEmail, newPassword } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id) as any;
    if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
      return res.status(401).json({ error: "Palavra-passe atual incorreta" });
    }
    const hash = newPassword ? bcrypt.hashSync(newPassword, 10) : user.passwordHash;
    const email = newEmail || user.email;
    try {
      db.prepare("UPDATE users SET email = ?, passwordHash = ? WHERE id = ?").run(email, hash, req.user.id);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Erro ao atualizar dados. O email pode já estar em uso." });
    }
  });

  // Protect all API routes below this line
  app.use("/api/clients", requireAuth);
  app.use("/api/professionals", requireAuth);
  app.use("/api/tasks", requireAuth);
  app.use("/api/trash", requireAuth);
  app.use("/api/admin", requireAuth);
  app.use("/api/tenant", requireAuth);

  // Helper for tenant isolation
  const getTenantId = (req: any) => {
    if (req.user.role === 'MasterAdmin') {
      return req.query.targetTenantId || req.user.tenantId || 'legacy-tenant-1';
    }
    return req.user.tenantId;
  };

  // Clients
  app.get("/api/clients", (req: any, res) => {
    let clients = [];
    if (req.user.role === 'MasterAdmin' && !req.query.targetTenantId) {
      clients = db.prepare("SELECT * FROM clients WHERE deleted = 0 ORDER BY createdAt DESC").all();
    } else {
      const tid = getTenantId(req);
      clients = db.prepare("SELECT * FROM clients WHERE tenantId = ? AND deleted = 0 ORDER BY createdAt DESC").all(tid);
    }
    res.json(clients);
  });

  app.get("/api/clients/:id", (req: any, res) => {
    const client = db.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id) as any;
    if (!client) return res.status(404).json({ error: "Client not found" });
    if (req.user.role !== 'MasterAdmin' && client.tenantId !== req.user.tenantId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.json(client);
  });

  app.post("/api/clients", (req: any, res) => {
    const { name, phone, contractedService, notes } = req.body;
    const tid = getTenantId(req);
    if (!tid) return res.status(400).json({ error: "Tenant required" });
    const id = Math.random().toString(36).substring(2, 11);
    db.prepare("INSERT INTO clients (id, tenantId, name, phone, contractedService, notes) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, tid, name, phone, contractedService, notes);
    res.status(201).json({ id, tenantId: tid, name, phone, contractedService, notes });
  });

  app.put("/api/clients/:id", (req: any, res) => {
    const { name, phone, contractedService, notes } = req.body;
    const client = db.prepare("SELECT tenantId FROM clients WHERE id = ?").get(req.params.id) as any;
    if (req.user.role !== 'MasterAdmin' && client.tenantId !== req.user.tenantId) return res.status(403).json({ error: "Forbidden" });
    
    db.prepare("UPDATE clients SET name = ?, phone = ?, contractedService = ?, notes = ? WHERE id = ?")
      .run(name, phone, contractedService, notes, req.params.id);
    res.json({ id: req.params.id, name, phone, contractedService, notes });
  });

  app.delete("/api/clients/:id", (req: any, res) => {
    const client = db.prepare("SELECT tenantId FROM clients WHERE id = ?").get(req.params.id) as any;
    if (req.user.role !== 'MasterAdmin' && client?.tenantId !== req.user.tenantId) return res.status(403).json({ error: "Forbidden" });

    db.prepare("UPDATE clients SET deleted = 1, deletedAt = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
    // Also soft delete tasks of this client
    db.prepare("UPDATE tasks SET deleted = 1, deletedAt = CURRENT_TIMESTAMP WHERE clientId = ?").run(req.params.id);
    res.status(204).end();
  });

  // Professionals
  app.get("/api/professionals", (req: any, res) => {
    let professionals = [];
    if (req.user.role === 'MasterAdmin' && !req.query.targetTenantId) {
      professionals = db.prepare("SELECT * FROM professionals ORDER BY createdAt DESC").all();
    } else {
      const tid = getTenantId(req);
      professionals = db.prepare("SELECT * FROM professionals WHERE tenantId = ? ORDER BY createdAt DESC").all(tid);
    }
    res.json(professionals);
  });

  app.post("/api/professionals", (req: any, res) => {
    const { name, phone, role } = req.body;
    const tid = getTenantId(req);
    if (!tid) return res.status(400).json({ error: "Tenant required" });
    const id = Math.random().toString(36).substring(2, 11);
    db.prepare("INSERT INTO professionals (id, tenantId, name, phone, role) VALUES (?, ?, ?, ?, ?)")
      .run(id, tid, name, phone, role);
    res.status(201).json({ id, tenantId: tid, name, phone, role });
  });

  app.put("/api/professionals/:id", (req: any, res) => {
    const { name, phone, role } = req.body;
    const pro = db.prepare("SELECT tenantId FROM professionals WHERE id = ?").get(req.params.id) as any;
    if (req.user.role !== 'MasterAdmin' && pro?.tenantId !== req.user.tenantId) return res.status(403).json({ error: "Forbidden" });

    db.prepare("UPDATE professionals SET name = ?, phone = ?, role = ? WHERE id = ?")
      .run(name, phone, role, req.params.id);
    res.json({ id: req.params.id, name, phone, role });
  });

  app.delete("/api/professionals/:id", (req: any, res) => {
    const pro = db.prepare("SELECT tenantId FROM professionals WHERE id = ?").get(req.params.id) as any;
    if (req.user.role !== 'MasterAdmin' && pro?.tenantId !== req.user.tenantId) return res.status(403).json({ error: "Forbidden" });

    db.prepare("DELETE FROM professionals WHERE id = ?").run(req.params.id);
    res.status(204).end();
  });

  // Tasks
  app.get("/api/tasks", (req: any, res) => {
    const { date, clientId, targetTenantId } = req.query;
    let query = `
      SELECT tasks.*, clients.name as clientName, professionals.name as professionalName 
      FROM tasks 
      JOIN clients ON tasks.clientId = clients.id 
      JOIN professionals ON tasks.professionalId = professionals.id
      WHERE tasks.deleted = 0
    `;
    const params = [];

    query += "";

    if (req.user.role !== 'MasterAdmin') {
      query += " AND tasks.tenantId = ?";
      params.push(req.user.tenantId);
    } else if (targetTenantId) {
      query += " AND tasks.tenantId = ?";
      params.push(targetTenantId);
    }

    if (date) {
      query += " AND tasks.date = ?";
      params.push(date);
    }
    if (clientId) {
      query += " AND tasks.clientId = ?";
      params.push(clientId);
    }

    query += " ORDER BY tasks.date ASC, tasks.time ASC";
    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  });

  app.post("/api/tasks", (req: any, res) => {
    const { clientId, professionalId, serviceName, date, time, notes } = req.body;
    const tid = getTenantId(req);
    if (!tid) return res.status(400).json({ error: "Tenant required" });
    const id = Math.random().toString(36).substring(2, 11);
    db.prepare("INSERT INTO tasks (id, clientId, professionalId, tenantId, serviceName, date, time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, clientId, professionalId, tid, serviceName, date, time, notes);
    res.status(201).json({ id, clientId, professionalId, tenantId: tid, serviceName, date, time, notes, status: 'Pendente' });
  });

  app.patch("/api/tasks/:id", (req: any, res) => {
    const task = db.prepare("SELECT tenantId FROM tasks WHERE id = ?").get(req.params.id) as any;
    if (req.user.role !== 'MasterAdmin' && task?.tenantId !== req.user.tenantId) return res.status(403).json({ error: "Forbidden" });

    const { status } = req.body;
    db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ id: req.params.id, status });
  });

  app.put("/api/tasks/:id", (req: any, res) => {
    const { clientId, professionalId, serviceName, date, time, notes } = req.body;
    const task = db.prepare("SELECT tenantId FROM tasks WHERE id = ?").get(req.params.id) as any;
    if (req.user.role !== 'MasterAdmin' && task?.tenantId !== req.user.tenantId) return res.status(403).json({ error: "Forbidden" });

    db.prepare("UPDATE tasks SET clientId = ?, professionalId = ?, serviceName = ?, date = ?, time = ?, notes = ? WHERE id = ?")
      .run(clientId, professionalId, serviceName, date, time, notes, req.params.id);
    res.json({ id: req.params.id, clientId, professionalId, serviceName, date, time, notes });
  });

  app.delete("/api/tasks/:id", (req: any, res) => {
    const task = db.prepare("SELECT tenantId FROM tasks WHERE id = ?").get(req.params.id) as any;
    if (req.user.role !== 'MasterAdmin' && task?.tenantId !== req.user.tenantId) return res.status(403).json({ error: "Forbidden" });

    db.prepare("UPDATE tasks SET deleted = 1, deletedAt = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
    res.status(204).end();
  });

  // Trash
  app.get("/api/trash", (req: any, res) => {
    try {
      let clients: any[] = [];
      let tasks: any[] = [];
      if (req.user.role === 'MasterAdmin') {
        clients = db.prepare("SELECT 'client' as type, id, name as title, deletedAt FROM clients WHERE deleted = 1").all();
        tasks = db.prepare("SELECT 'task' as type, id, serviceName as title, deletedAt FROM tasks WHERE deleted = 1").all();
      } else {
        const tid = req.user.tenantId;
        if (!tid) return res.json([]);
        clients = db.prepare("SELECT 'client' as type, id, name as title, deletedAt FROM clients WHERE tenantId = ? AND deleted = 1").all(tid);
        tasks = db.prepare("SELECT 'task' as type, id, serviceName as title, deletedAt FROM tasks WHERE tenantId = ? AND deleted = 1").all(tid);
      }
      res.json([...clients, ...tasks].sort((a: any, b: any) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()));
    } catch (e: any) {
      console.error('[TRASH ERROR]', e);
      res.status(500).json({ error: 'Erro ao carregar lixo', details: e.message });
    }
  });

  app.post("/api/trash/restore/:type/:id", (req: any, res) => {
    const { type, id } = req.params;
    const table = type === 'client' ? 'clients' : 'tasks';
    const item = db.prepare(`SELECT tenantId FROM ${table} WHERE id = ?`).get(id) as any;
    if (req.user.role !== 'MasterAdmin' && item?.tenantId !== req.user.tenantId) return res.status(403).json({ error: "Forbidden" });

    db.prepare(`UPDATE ${table} SET deleted = 0, deletedAt = NULL WHERE id = ?`).run(id);
    
    // If restoring a client, also restore its tasks that were deleted at the same time (optional but good)
    if (type === 'client') {
        db.prepare("UPDATE tasks SET deleted = 0, deletedAt = NULL WHERE clientId = ? AND deleted = 1").run(id);
    }
    
    res.json({ success: true });
  });

  app.delete("/api/trash/permanent/:type/:id", (req: any, res) => {
    const { type, id } = req.params;
    const table = type === 'client' ? 'clients' : 'tasks';
    const item = db.prepare(`SELECT tenantId FROM ${table} WHERE id = ?`).get(id) as any;
    if (req.user.role !== 'MasterAdmin' && item?.tenantId !== req.user.tenantId) return res.status(403).json({ error: "Forbidden" });

    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    res.status(204).end();
  });

  // Master Admin Routes
  app.get("/api/admin/users/pending", requireMasterAdmin, (req: any, res) => {
    const users = db.prepare("SELECT id, email, createdAt, status FROM users WHERE status = 'PENDING_APPROVAL' ORDER BY createdAt DESC").all();
    console.log(`[ADMIN] Fetching pending users for ${req.user.email}. Found: ${users.length}`);
    res.json(users);
  });
  
  app.get("/api/admin/user-list/all", requireMasterAdmin, (req: any, res) => {
    console.log(`[ADMIN] Fetching user-list/all for ${req.user.email}`);
    const users = db.prepare(`
      SELECT u.id, u.email, u.role, u.status, u.createdAt, t.name as tenantName 
      FROM users u 
      LEFT JOIN tenants t ON u.tenantId = t.id 
      ORDER BY u.createdAt DESC
    `).all();
    res.json(users);
  });
  
  app.patch("/api/admin/users/:id/status", requireMasterAdmin, (req: any, res) => {
    const userId = req.params.id;
    const { status } = req.body; // 'ACTIVE' or 'INACTIVE'
    
    if (userId === req.user.id) return res.status(400).json({ error: "Não pode alterar o seu próprio status mestre." });
    
    try {
      db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, userId);
      res.json({ success: true, message: `Status alterado para ${status}` });
    } catch (e: any) {
      res.status(500).json({ error: "Erro ao alterar status" });
    }
  });

  app.delete("/api/admin/users/:id", requireMasterAdmin, (req: any, res) => {
    const userId = req.params.id;
    if (userId === req.user.id) return res.status(400).json({ error: "Não pode excluir a sua própria conta mestre." });
    
    // Check if user exists
    const userToExclude = db.prepare("SELECT tenantId, role FROM users WHERE id = ?").get(userId) as any;
    if (!userToExclude) return res.status(404).json({ error: "Utilizador não encontrado" });

    try {
      db.transaction(() => {
        // If it's a TenantAdmin, delete the whole tenant (cascades to clients, tasks, etc.)
        if (userToExclude.role === 'TenantAdmin' && userToExclude.tenantId) {
          // Delete all users belonging to this tenant first
          db.prepare("DELETE FROM users WHERE tenantId = ?").run(userToExclude.tenantId);
          // Then delete the tenant (cascades to other tables)
          db.prepare("DELETE FROM tenants WHERE id = ?").run(userToExclude.tenantId);
        } else {
          // Just delete the specific user
          db.prepare("DELETE FROM users WHERE id = ?").run(userId);
        }
      })();
      res.json({ success: true, message: "Utilizador e dados associados excluídos com sucesso." });
    } catch (e: any) {
      console.error("[ADMIN DELETE ERROR]:", e);
      res.status(500).json({ error: "Erro ao excluir utilizador", details: e.message });
    }
  });

  app.post("/api/admin/users/approve", requireMasterAdmin, (req: any, res) => {
    const { userId, action, role } = req.body; // action: 'APPROVE' | 'REJECT'
    
    if (action === 'REJECT') {
      db.prepare("UPDATE users SET status = 'REJECTED' WHERE id = ?").run(userId);
      return res.json({ success: true });
    }

    if (action === 'APPROVE') {
      let tenantId = null;
      if (role === 'TenantAdmin') {
        tenantId = Math.random().toString(36).substring(2, 11);
        const userEmailRow = db.prepare("SELECT email FROM users WHERE id = ?").get(userId) as any;
        const tenantName = `Workspace - ${userEmailRow ? userEmailRow.email.split('@')[0] : userId.substring(0, 5)}`;
        db.prepare("INSERT INTO tenants (id, name, plan, subscriptionStatus) VALUES (?, ?, 'System Access Plan', 'PENDING_PAYMENT')").run(tenantId, tenantName);
      }
      db.prepare("UPDATE users SET status = 'ACTIVE', role = ?, tenantId = ? WHERE id = ?").run(role, tenantId, userId);
      return res.json({ success: true, tenantId });
    }
    res.status(400).json({ error: "Ação inválida" });
  });

  app.get("/api/admin/traffic", requireMasterAdmin, (req: any, res) => {
    const totalRegistrations = db.prepare("SELECT COUNT(*) as c FROM users").get() as any;
    const today = new Date().toISOString().split('T')[0];
    const newUsersToday = db.prepare("SELECT COUNT(*) as c FROM users WHERE date(createdAt) = ?").get(today) as any;
    const activeTenants = db.prepare("SELECT COUNT(*) as c FROM tenants WHERE subscriptionStatus = 'ACTIVE'").get() as any;
    const totalLogins = db.prepare("SELECT COUNT(*) as c FROM access_logs WHERE loginStatus = 'SUCCESS'").get() as any;
    
    const recentLogins = db.prepare(`
      SELECT l.*, t.name as tenantName 
      FROM access_logs l 
      LEFT JOIN tenants t ON l.tenantId = t.id 
      ORDER BY l.createdAt DESC LIMIT 20
    `).all();

    res.json({
      totalRegistrations: totalRegistrations.c || 0,
      newUsersToday: newUsersToday.c || 0,
      activeTenants: activeTenants.c || 0,
      totalLogins: totalLogins.c || 0,
      recentLogins
    });
  });

  app.get("/api/admin/logs", requireMasterAdmin, (req: any, res) => {
    const logs = db.prepare(`
      SELECT l.*, t.name as tenantName 
      FROM access_logs l 
      LEFT JOIN tenants t ON l.tenantId = t.id 
      ORDER BY l.createdAt DESC LIMIT 100
    `).all();
    res.json(logs);
  });

  app.get("/api/admin/tenants", requireMasterAdmin, (req: any, res) => {
    const tenants = db.prepare(`
      SELECT t.*, 
        (SELECT email FROM users WHERE tenantId = t.id AND role = 'TenantAdmin' LIMIT 1) as adminEmail,
        (SELECT COUNT(*) FROM users WHERE tenantId = t.id) as userCount,
        (SELECT COUNT(*) FROM clients WHERE tenantId = t.id) as clientCount,
        (SELECT createdAt FROM access_logs WHERE tenantId = t.id ORDER BY createdAt DESC LIMIT 1) as lastLogin
      FROM tenants t
    `).all();
    res.json(tenants);
  });

  // Master Admin Billing specific operations
  app.post("/api/admin/billing/status", requireMasterAdmin, (req: any, res) => {
    const { tenantId, status, plan } = req.body;
    db.prepare("UPDATE tenants SET subscriptionStatus = ?, plan = ? WHERE id = ?").run(status, plan, tenantId);
    res.json({ success: true });
  });

  app.get("/api/admin/billing/dashboard", requireMasterAdmin, (req: any, res) => {
    const activeSubs = db.prepare("SELECT COUNT(*) as count FROM tenants WHERE subscriptionStatus = 'ACTIVE'").get() as any;
    const totalTenants = db.prepare("SELECT COUNT(*) as count FROM tenants").get() as any;
    // mock revenue for now based on plans
    const mrr = db.prepare("SELECT SUM(CASE WHEN plan='Starter Plan' THEN 29 WHEN plan='Professional Plan' THEN 79 WHEN plan='Enterprise Plan' THEN 199 ELSE 0 END) as total FROM tenants WHERE subscriptionStatus = 'ACTIVE'").get() as any;
    res.json({
      activeSubscriptions: activeSubs.count,
      totalTenants: totalTenants.count,
      mrr: mrr.total || 0,
    });
  });

  // Tenant Admin Routes
  app.get("/api/tenant/users", requireTenantAdmin, (req: any, res) => {
    const users = db.prepare("SELECT id, email, role, status FROM users WHERE tenantId = ?").all(req.user.tenantId);
    res.json(users);
  });

  app.post("/api/tenant/users", requireTenantAdmin, (req: any, res) => {
    const { email, password, role } = req.body; 
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) return res.status(400).json({ error: "Email já registado" });
    
    const id = Math.random().toString(36).substring(2, 11);
    const hash = bcrypt.hashSync(password, 10);
    
    db.prepare("INSERT INTO users (id, email, passwordHash, status, role, tenantId) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, email, hash, 'ACTIVE', role, req.user.tenantId);
    res.status(201).json({ success: true });
  });

  app.delete("/api/tenant/users/:id", requireTenantAdmin, (req: any, res) => {
    db.prepare("DELETE FROM users WHERE id = ? AND tenantId = ? AND role != 'TenantAdmin'").run(req.params.id, req.user.tenantId);
    res.json({ success: true });
  });

  // --- API Error Handlers ---
  
  // 404 for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: `Rota da API não encontrada: ${req.originalUrl}` });
  });

  // Global Error Handler for API
  app.use((err: any, req: any, res: any, next: any) => {
    if (req.path.startsWith('/api')) {
      console.error("[API Error]:", err);
      return res.status(500).json({ error: "Erro interno do servidor", details: err.message });
    }
    next(err);
  });

  // --- Vite / Static Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { port: 24679 } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
