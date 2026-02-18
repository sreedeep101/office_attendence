const express = require("express");
const db = require("../db");
const geolib = require("geolib");
const { verifyToken, verifyEmployee, verifyAdmin } = require("../middleware/authMiddleware");
const router = express.Router();


/* attnendance stats */
router.get("/status/:employee_id", verifyToken, verifyEmployee, (req, res) => {
    const employee_id = req.params.employee_id;

    const query = `
    SELECT * FROM attendance_sessions
    WHERE user_id = ?
    AND check_out IS NULL
    ORDER BY check_in DESC
    LIMIT 1
  `;

    db.query(query, [employee_id], (err, result) => {
        if (err) return res.status(500).json(err);

        res.json({
            working: result.length > 0
        });
    });
});


/* CHECK-IN */
router.post("/checkin", verifyToken, verifyEmployee, (req, res) => {
    const { employee_id, lat, lng } = req.body;

    if (!lat || !lng) {
        return res.status(400).json({ message: "Location required" });
    }

    const officeLocation = {
        latitude: parseFloat(process.env.OFFICE_LAT),
        longitude: parseFloat(process.env.OFFICE_LNG),
    };

    const employeeLocation = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
    };

    const distance = geolib.getDistance(officeLocation, employeeLocation);

    if (distance > process.env.MAX_DISTANCE) {
        return res.status(403).json({
            message: "You are outside office area",
            distance: distance
        });
    }

    const checkOpenSession = `
    SELECT * FROM attendance_sessions
    WHERE user_id = ? AND check_out IS NULL
  `;

    db.query(checkOpenSession, [employee_id], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length > 0) {
            return res.status(400).json({ message: "Already checked in" });
        }

        const insertQuery = `
      INSERT INTO attendance_sessions 
      (user_id, check_in, location_lat, location_lng)
      VALUES (?, NOW(), ?, ?)
    `;

        db.query(insertQuery, [employee_id, lat, lng], (err) => {
            if (err) return res.status(500).json(err);

            res.json({ message: "Checked in successfully", distance });
        });
    });
});


/* CHECK-OUT */
router.post("/checkout", verifyToken, verifyEmployee, (req, res) => {
    const { employee_id } = req.body;

    const findOpenSession = `
    SELECT * FROM attendance_sessions
    WHERE user_id = ? AND check_out IS NULL
    ORDER BY check_in DESC LIMIT 1
  `;

    db.query(findOpenSession, [employee_id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0)
            return res.status(400).json({ message: "No active session" });

        const updateQuery = `
      UPDATE attendance_sessions
      SET check_out = NOW()
      WHERE id = ?
    `;

        db.query(updateQuery, [result[0].id], (err) => {
            if (err) return res.status(500).json(err);

            res.json({ message: "Checked out successfully" });
        });
    });
});


/*work time calculation*/
router.get("/today/:employee_id", verifyToken, verifyEmployee, (req, res) => {
    const employee_id = req.params.employee_id;

    const query = `
    SELECT 
      SUM(TIMESTAMPDIFF(MINUTE, check_in, check_out)) AS total_minutes
    FROM attendance_sessions
    WHERE user_id = ?
    AND DATE(check_in) = CURDATE()
    AND check_out IS NOT NULL
  `;

    db.query(query, [employee_id], (err, result) => {
        if (err) return res.status(500).json(err);

        const minutes = result[0].total_minutes || 0;

        res.json({
            totalWorkMinutes: minutes,
            totalWorkHours: (minutes / 60).toFixed(2),
        });
    });
});

router.get("/admin/today", verifyToken, verifyAdmin, (req, res) => {

    const query = `
    SELECT 
      e.id,
      e.name,
      e.position,
      MIN(a.check_in) AS first_checkin,
      MAX(a.check_out) AS last_checkout,
      COUNT(DISTINCT DATE(a.check_in)) AS present,
      SUM(TIMESTAMPDIFF(MINUTE, a.check_in, a.check_out)) AS total_work_minutes
    FROM users e
    LEFT JOIN attendance_sessions a 
      ON e.id = a.user_id 
      AND DATE(a.check_in) = CURDATE()
      AND a.check_out IS NOT NULL
    WHERE e.role = 'employee'
    GROUP BY e.id
  `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);

        results.forEach(emp => {
            if (emp.first_checkin && emp.last_checkout) {
                const totalWindow =
                    (new Date(emp.last_checkout) - new Date(emp.first_checkin)) / 60000;

                emp.break_minutes = totalWindow - (emp.total_work_minutes || 0);
            } else {
                emp.break_minutes = 0;
            }
        });

        res.json(results);
    });
});

/* Monthly Attendance Trend */
router.get("/admin/monthly-trend", verifyToken, verifyAdmin, (req, res) => {

  const offset = parseInt(req.query.offset) || 0;

  const query = `
    SELECT 
      DATE(check_in) as date,
      COUNT(DISTINCT user_id) as present_count
    FROM attendance_sessions
    WHERE MONTH(check_in) = MONTH(DATE_SUB(CURDATE(), INTERVAL ? MONTH))
    AND YEAR(check_in) = YEAR(DATE_SUB(CURDATE(), INTERVAL ? MONTH))
    GROUP BY DATE(check_in)
    ORDER BY DATE(check_in)
  `;

  db.query(query, [offset, offset], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

router.get("/admin/monthly-hours", verifyToken, verifyAdmin, (req, res) => {

  const offset = parseInt(req.query.offset) || 0;

  const query = `
    SELECT 
      e.name,
      SUM(TIMESTAMPDIFF(MINUTE, a.check_in, a.check_out)) as total_minutes
    FROM attendance_sessions a
    JOIN users e ON a.user_id = e.id
    WHERE MONTH(a.check_in) = MONTH(DATE_SUB(CURDATE(), INTERVAL ? MONTH))
    AND YEAR(a.check_in) = YEAR(DATE_SUB(CURDATE(), INTERVAL ? MONTH))
    AND a.check_out IS NOT NULL
    GROUP BY e.id
  `;

  db.query(query, [offset, offset], (err, results) => {
    if (err) return res.status(500).json(err);

    const formatted = results.map(r => ({
      name: r.name,
      hours: (r.total_minutes || 0) / 60
    }));

    res.json(formatted);
  });
});




module.exports = router;