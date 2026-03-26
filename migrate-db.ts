import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "client_control.db");

function migrate() {
  console.log("Starting migration for client_control.db...");
  const db = new Database(DB_PATH);

  try {
    db.prepare("ALTER TABLE clients ADD COLUMN deleted INTEGER DEFAULT 0").run();
    console.log("Added 'deleted' column to 'clients' table.");
  } catch (err: any) {
    if (err.message.includes("duplicate column name")) {
      console.log("'deleted' column already exists in 'clients' table.");
    } else {
      console.error("Error adding 'deleted' to 'clients':", err.message);
    }
  }

  try {
    db.prepare("ALTER TABLE clients ADD COLUMN deletedAt DATETIME").run();
    console.log("Added 'deletedAt' column to 'clients' table.");
  } catch (err: any) {
    if (err.message.includes("duplicate column name")) {
      console.log("'deletedAt' column already exists in 'clients' table.");
    } else {
      console.error("Error adding 'deletedAt' to 'clients':", err.message);
    }
  }

  try {
    db.prepare("ALTER TABLE tasks ADD COLUMN deleted INTEGER DEFAULT 0").run();
    console.log("Added 'deleted' column to 'tasks' table.");
  } catch (err: any) {
    if (err.message.includes("duplicate column name")) {
      console.log("'deleted' column already exists in 'tasks' table.");
    } else {
      console.error("Error adding 'deleted' to 'tasks':", err.message);
    }
  }

  try {
    db.prepare("ALTER TABLE tasks ADD COLUMN deletedAt DATETIME").run();
    console.log("Added 'deletedAt' column to 'tasks' table.");
  } catch (err: any) {
    if (err.message.includes("duplicate column name")) {
      console.log("'deletedAt' column already exists in 'tasks' table.");
    } else {
      console.error("Error adding 'deletedAt' to 'tasks':", err.message);
    }
  }

  db.close();
  console.log("Migration finished.");
}

migrate();
