const express = require("express");
const db = require("../db");
const { verifyToken, verifyEmployee, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

/* submit report */
router.post("/submit", verifyToken, verifyEmployee, (req, res) => {
  const { employee_id, report } = req.body;

  const checkQuery = `
    SELECT * FROM daily_reports
    WHERE user_id = ?
    AND created_at = CURDATE()
  `;

  db.query(checkQuery, [employee_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      return res.status(400).json({ message: "Report already submitted today" });
    }

    const insertQuery = `
      INSERT INTO daily_reports (user_id, report, created_at)
      VALUES (?, ?, CURDATE())
    `;

    db.query(insertQuery, [employee_id, report], (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Report submitted successfully" });
    });
  });
});

/* get today's reports for admin */

router.get("/admin/today", verifyToken, verifyAdmin, (req, res) => {
  const query = `
    SELECT e.name, e.position, r.report
    FROM daily_reports r
    JOIN users e ON r.user_id = e.id
    WHERE r.created_at = CURDATE()
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

module.exports = router;