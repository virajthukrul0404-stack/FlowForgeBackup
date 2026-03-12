const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
// Default to 4000 so it doesn't conflict with other dev servers on 3000
const PORT = process.env.PORT || 4000;

// Paths
const ROOT_DIR = path.join(__dirname, "..");
const FRONTEND_DIR = path.join(ROOT_DIR, "frontend");
const DB_PATH = path.join(__dirname, "flowforge.db");

// Middleware
app.use(express.json());
app.use(cors());

// Serve static frontend
app.use(express.static(FRONTEND_DIR));

// --- SQLite setup ---
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`
  );

  // Seed dummy users if table is empty
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err) {
      console.error("Failed to count users", err);
      return;
    }
    if (row.count === 0) {
      const stmt = db.prepare(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
      );
      const seedUsers = [
        ["Aayush", "aayush@example.com", "password123"],
        ["Arnva", "arnva@example.com", "password123"],
        ["Viraj", "viraj@example.com", "password123"],
        ["Aditya", "aditya@example.com", "password123"]
      ];
      seedUsers.forEach((u) => stmt.run(u[0], u[1], u[2]));
      stmt.finalize();
      console.log("Seeded dummy users into SQLite database.");
    }
  });
});

// --- Auth routes ---

// Register
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required." });
  }

  const stmt = db.prepare(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
  );

  stmt.run(name, email, password, function (err) {
    if (err) {
      if (err.code === "SQLITE_CONSTRAINT") {
        return res.status(409).json({ error: "Email already registered." });
      }
      console.error("Register error:", err);
      return res.status(500).json({ error: "Failed to register user." });
    }

    return res.json({
      id: this.lastID,
      name,
      email
    });
  });
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  db.get(
    "SELECT id, name, email, password FROM users WHERE email = ?",
    [email],
    (err, user) => {
      if (err) {
        console.error("Login query error:", err);
        return res.status(500).json({ error: "Login failed." });
      }

      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      return res.json({
        id: user.id,
        name: user.name,
        email: user.email
      });
    }
  );
});

// Simple list endpoint (for debugging in development)
app.get("/api/auth/users", (req, res) => {
  db.all("SELECT id, name, email FROM users", (err, rows) => {
    if (err) {
      console.error("Users query error:", err);
      return res.status(500).json({ error: "Failed to load users." });
    }
    res.json(rows);
  });
});

// Fallback to index.html for root
app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

const server = app.listen(PORT, () => {
  console.log(`FlowForge backend running at http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. You can either stop the other app using that port or run this server on a different port, e.g. 'set PORT=5000 && npm start'.`
    );
  } else {
    console.error("Server error:", err);
  }
});

