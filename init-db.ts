import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "client_control.db");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

async function initDb() {
  console.log("Initializing database...");
  
  const db = new Database(DB_PATH);
  
  // Read and execute schema
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  db.exec(schema);
  console.log("Schema applied successfully.");

  // Initialize Seed Data
  const initSeed = db.transaction(() => {
    // 1. Create Default Tenant if not exists
    const tenant = db.prepare("SELECT * FROM tenants WHERE id = 'legacy-tenant-1'").get();
    if (!tenant) {
      db.prepare("INSERT INTO tenants (id, name, plan, subscriptionStatus) VALUES (?, ?, ?, ?)")
        .run('legacy-tenant-1', 'Legacy Workspace', 'Starter Plan', 'ACTIVE');
      console.log("Default tenant created.");
    }

    // 2. Create Master Admin if not exists
    const admin = db.prepare("SELECT * FROM users WHERE email = 'admin@admin.com'").get();
    if (!admin) {
      const hash = bcrypt.hashSync("admin", 10);
      db.prepare("INSERT INTO users (id, email, passwordHash, role, status, tenantId) VALUES (?, ?, ?, ?, ?, ?)")
        .run("admin-1", "admin@admin.com", hash, 'MasterAdmin', 'ACTIVE', null);
      console.log("Master Admin created (admin@admin.com / admin).");
    } else {
      // Ensure admin has correct role
      db.prepare("UPDATE users SET role = 'MasterAdmin', tenantId = NULL WHERE email = 'admin@admin.com'").run();
    }

    // 3. Migrate any orphaned data to default tenant
    db.prepare("UPDATE clients SET tenantId = 'legacy-tenant-1' WHERE tenantId IS NULL OR tenantId = ''").run();
    db.prepare("UPDATE professionals SET tenantId = 'legacy-tenant-1' WHERE tenantId IS NULL OR tenantId = ''").run();
    db.prepare("UPDATE tasks SET tenantId = 'legacy-tenant-1' WHERE tenantId IS NULL OR tenantId = ''").run();
  });

  initSeed();
  console.log("Seed data initialized.");
  db.close();
}

initDb().catch(err => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
