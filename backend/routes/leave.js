const express = require("express");
const db = require("../db");
const { verifyToken, verifyEmployee, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();
 

/* leave stats for admin dashboard */
router.get("/admin/stats", verifyToken, verifyAdmin, (req, res) => {

  const query = `
    SELECT status, COUNT(*) as count
    FROM leave_requests
    GROUP BY status
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json(err);

    res.json(results);
  });
});


/* apply for leave */
router.post("/apply", verifyToken, verifyEmployee, (req, res) => {
  const { employee_id, from_date, to_date, reason } = req.body;

  const query = `
    INSERT INTO leave_requests (user_id, from_date, to_date, reason)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [employee_id, from_date, to_date, reason], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Leave applied successfully" });
  });
});

/* view for employee there leaves */
router.get("/my/:employee_id", verifyToken, verifyEmployee, (req, res) => {
  const id = req.params.employee_id;

  db.query(
    "SELECT * FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC",
    [id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

/* view all leaves for admin */
router.get("/admin/all", verifyToken, verifyAdmin, (req, res) => {
  const query = `
    SELECT l.*, e.name, e.position
    FROM leave_requests l
    JOIN users e ON l.user_id = e.id
    ORDER BY l.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* approve or reject leave */
router.put("/admin/update/:id", verifyToken, verifyAdmin, (req, res) => {
  const { status } = req.body;
  const id = req.params.id;

  db.query(
    "UPDATE leave_requests SET status = ? WHERE id = ?",
    [status, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Leave status updated" });
    }
  );
});


module.exports = router;


