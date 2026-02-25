const express = require("express");
const db = require("../db");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const { verifyToken, verifyAdmin , verifyEmployee } = require("../middleware/authMiddleware");

const router = express.Router();
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ADMIN DASHBOARD STATS */
router.get("/stats", verifyToken, verifyAdmin, (req, res) => {

  const totalEmployeesQuery = "SELECT COUNT(*) AS total FROM users WHERE role='employee'";

  const presentTodayQuery = `
    SELECT COUNT(DISTINCT user_id) AS present
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
router.post("/add", verifyToken, verifyAdmin, upload.single("profile_image"), async (req, res) => {
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
router.put("/edit/:id", verifyToken, verifyAdmin,upload.single("profile_image"), (req, res) => {
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


// for future update  

//  router.put(
//   "/edit/:id",
//   verifyToken,
//   verifyAdmin,
//   upload.single("profile_image"),
//   async (req, res) => {

//     const { name, email, phone, position } = req.body;
//     const id = req.params.id;

//     try {
//       // Hash new phone number as password
//       const hashedPassword = await bcrypt.hash(phone, 10);

//       const imagePath = req.file ? req.file.filename : null;

//       let sql;
//       let values;

//       if (imagePath) {
//         sql = `
//           UPDATE users
//           SET name=?, email=?, phone=?, position=?, password=?, profile_image=?
//           WHERE id=?
//         `;
//         values = [name, email, phone, position, hashedPassword, imagePath, id];
//       } else {
//         sql = `
//           UPDATE users
//           SET name=?, email=?, phone=?, position=?, password=?
//           WHERE id=?
//         `;
//         values = [name, email, phone, position, hashedPassword, id];
//       }

//       db.query(sql, values, (err) => {
//         if (err) return res.status(500).json(err);
//         res.json({ message: "Employee updated successfully" });
//       });

//     } catch (error) {
//       res.status(500).json(error);
//     }
//   }
// );

/* GET ALL EMPLOYEES */
router.get("/", verifyToken, verifyAdmin, (req, res) => {
  const sql = "SELECT id, name, email, phone, position, profile_image FROM users WHERE role='employee'";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);

    res.json(results);
  });
});

/* attendance percentage of EMPLOYEE */
router.get("/profile/:id", (req, res) => {
  const id = req.params.id;

  const employeeQuery = "SELECT * FROM users WHERE id = ?";

  const attendanceQuery = `
    SELECT COUNT(DISTINCT DATE(check_in)) AS present_days
    FROM attendance_sessions
    WHERE user_id = ?
    AND check_in >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  `;

  db.query(employeeQuery, [id], (err, empResult) => {
    if (err) return res.status(500).json(err);
    if (empResult.length === 0) return res.status(404).json({ message: "Not found" });

    db.query(attendanceQuery, [id], (err, attendanceResult) => {
      if (err) return res.status(500).json(err);

      const presentDays = attendanceResult[0].present_days;
      const totalDays = 30; // simplified working period
      const percentage = ((presentDays / totalDays) * 100).toFixed(2);

      res.json({
        employee: empResult[0],
        attendancePercentage: percentage
      });
    });
  });
});

/* DELETE EMPLOYEE */
router.delete("/delete/:id", verifyToken, verifyAdmin, (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM users WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Employee deleted successfully" });
  });
});


// UPDATE PROFILE IMAGE

router.put("/profile-image/:id", verifyToken, upload.single("profile_image"), (req, res) => {
  const id = req.params.id;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const imagePath = req.file.filename;

  const query = `
    UPDATE users
    SET profile_image = ?
    WHERE id = ?
  `;

  db.query(query, [imagePath, id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Profile image updated",
      image: imagePath
    });
  });
});

//change password for employee
router.put("/change-password/:id", verifyToken, verifyEmployee, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const id = req.params.id;

  // 🔒 STEP 1 — Basic validation
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  // 🔒 STEP 2 — Length validation (ADD IT HERE)
  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters"
    });
  }

  try {
    db.query("SELECT password FROM users WHERE id = ?", [id], async (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Current password incorrect" });
      }

      // 🔐 Now safe to hash
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, id],
        (err2) => {
          if (err2) return res.status(500).json(err2);

          res.json({ message: "Password updated successfully" });
        }
      );
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
