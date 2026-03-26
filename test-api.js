import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';

const db = new Database('client_control.db');
const user = db.prepare("SELECT * FROM users LIMIT 1").get();
if (!user) {
    console.log("No users in db!");
    process.exit(1);
}

const token = jwt.sign({ id: user.id, email: user.email, role: user.role, tenantId: user.tenantId }, process.env.JWT_SECRET || 'super-secret-key-123', { expiresIn: '1h' });

console.log("Fetching /api/metrics with real user token...");
fetch('http://localhost:5173/api/metrics', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(res => {
     console.log("STATUS:", res.status);
     return res.text();
})
.then(text => {
     console.log("BODY:", text);
})
.catch(err => console.error(err));
