const express = require("express");
const db = require("../db");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");

const router = express.Router();
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ADMIN DASHBOARD STATS */
router.get("/stats", (req, res) => {

  const totalEmployeesQuery = "SELECT COUNT(*) AS total FROM users WHERE role='employee'";

  const presentTodayQuery = `
    SELECT COUNT(DISTINCT employee_id) AS present
    FROM attendance_sessions
    WHERE DATE(check_in) = CURDATE()
  `;

  db.query(totalEmployeesQuery, (err, totalResult) => {
    if (err) return res.status(500).json(err);

    db.query(presentTodayQuery, (err, presentResult) => {
      if (err) return res.status(500).json(err);

      const total = totalResult[0].total;
      const present = presentResult[0].present;
      const absent = total - present;

      res.json({
        totalEmployees: total,
        presentToday: present,
        absentToday: absent
      });
    });
  });
});

/* ADD EMPLOYEE */
router.post("/add", upload.single("profile_image"), async (req, res) => {
  const { name, email, phone, position } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(phone, 10);

    const imagePath = req.file ? req.file.filename : null;

    const sql = `
      INSERT INTO users (name, email, phone, password, position, role, profile_image)
      VALUES (?, ?, ?, ?, ?, 'employee', ?)
    `;

    db.query(
      sql,
      [name, email, phone, hashedPassword, position, imagePath],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Employee added successfully" });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
});


/* edit EMPLOYEE */
router.put("/edit/:id", upload.single("profile_image"), (req, res) => {
  const { name, email, phone, position } = req.body;
  const id = req.params.id;

  const imagePath = req.file ? req.file.filename : null;

  let sql;
  let values;

  if (imagePath) {
    sql = `
      UPDATE users
      SET name=?, email=?, phone=?, position=?, profile_image=? 
      WHERE id=?
    `;
    values = [name, email, phone, position, imagePath, id];
  } else {
    sql = `
      UPDATE users 
      SET name=?, email=?, phone=?, position=? 
      WHERE id=?
    `;
    values = [name, email, phone, position, id];
  }

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Employee updated successfully" });
  });
});


/* GET ALL EMPLOYEES */
router.get("/", (req, res) => {
  const sql = "SELECT id, name, email, phone, position FROM users WHERE role='employee'";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);

    res.json(results);
  });
});


module.exports = router;
