const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Initialize SQLite Database
const db = new sqlite3.Database("./transactions.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the transactions database.");
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      transaction_type TEXT CHECK(transaction_type IN ('DEPOSIT', 'WITHDRAWAL')) NOT NULL,
      user INTEGER NOT NULL,
      status TEXT CHECK(status IN ('PENDING', 'COMPLETED', 'FAILED')) DEFAULT 'PENDING',
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
});

// Endpoints

// Create a New Transaction
app.post("/api/transactions", (req, res) => {
  const { amount, transaction_type, user } = req.body;

  if (!amount || !transaction_type || !user) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const query = `
    INSERT INTO transactions (amount, transaction_type, user)
    VALUES (?, ?, ?)
  `;

  db.run(query, [amount, transaction_type, user], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    db.get(
      "SELECT * FROM transactions WHERE transaction_id = ?",
      [this.lastID],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json(row);
      }
    );
  });
});



// Get Transactions by User
app.get("/api/transactions", (req, res) => {
  const { user_id } = req.query;

  if (!user_id) return res.status(400).json({ error: "User ID is required." });

  const query = "SELECT * FROM transactions WHERE user = ?";
  db.all(query, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ transactions: rows });
  });
});

// Update Transaction Status
app.put("/api/transactions/:transaction_id", (req, res) => {
  const { transaction_id } = req.params;
  const { status } = req.body;

  if (!["COMPLETED", "FAILED"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  const query = `
    UPDATE transactions
    SET status = ?
    WHERE transaction_id = ?
  `;

  db.run(query, [status, transaction_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    db.get(
      "SELECT * FROM transactions WHERE transaction_id = ?",
      [transaction_id],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      }
    );
  });
});

// Get Transaction by ID
app.get("/api/transactions/:transaction_id", (req, res) => {
  const { transaction_id } = req.params;

  const query = "SELECT * FROM transactions WHERE transaction_id = ?";
  db.get(query, [transaction_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Transaction not found." });
    res.json(row);
  });
});


// Start the Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
