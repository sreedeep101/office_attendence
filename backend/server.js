require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employee");
const attendanceRoutes = require("./routes/attendance");
const reportRoutes = require("./routes/report");
const leaveRoutes = require("./routes/leave");


app.use("/api/leave", leaveRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/uploads", express.static("uploads"));


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
