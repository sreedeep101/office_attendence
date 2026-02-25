const express = require("express");
const db = require("../db");
const { verifyToken, verifyEmployee, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

/* submit report */
router.post("/submit", verifyToken, verifyEmployee, (req, res) => {
  const { employee_id, report, report_date } = req.body;

  const checkQuery = `
    SELECT id FROM daily_reports 
    WHERE user_id = ? AND report_date = ?
  `;

  db.query(checkQuery, [employee_id, report_date], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length > 0) {
      // Update existing report
      db.query(
        "UPDATE daily_reports SET report = ? WHERE user_id = ? AND report_date = ?",
        [report, employee_id, report_date],
        (err2) => {
          if (err2) return res.status(500).json(err2);
          res.json({ message: "Report updated successfully" });
        }
      );
    } else {
      // Insert new report
      db.query(
        "INSERT INTO daily_reports (user_id, report, report_date) VALUES (?, ?, ?)",
        [employee_id, report, report_date],
        (err3) => {
          if (err3) return res.status(500).json(err3);
          res.json({ message: "Report submitted successfully" });
        }
      );
    }
  });
});
/* get today's reports for admin */

router.get("/admin/by-date", verifyToken, verifyAdmin, (req, res) => {
  const { date } = req.query;

  const selectedDate = date || new Date().toISOString().split("T")[0];

  const query = `
    SELECT r.*, u.name, u.position, u.profile_image
    FROM daily_reports r
    JOIN users u ON r.user_id = u.id
    WHERE r.report_date = ?
    ORDER BY r.created_at DESC
  `;

  db.query(query, [selectedDate], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

router.get("/my/:id", verifyToken, verifyEmployee, (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT * FROM daily_reports WHERE user_id = ? ORDER BY report_date DESC",
    [id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});
module.exports = router;