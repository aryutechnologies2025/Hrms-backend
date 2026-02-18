import { Router } from "express";
import {
  markAttendance,
  deleteAttendance,
  getAttendanceList,
  getAttendanceReport,
  getparticularemployeeMonthlyAttendance,
  dashboardAttendanceAndBirthday,
  updateAttendanceEntry,
  getparticularemployeeMonthlyAttendanceDetails,
  getparticularemployeeMonthlyAttendanceWithTop5,
  payroll,
  addAttendance,
  getODAttendanceList
} from "../controllers/attendanceController.js";
import useAuth from "../middlewares/userAuth.js";

const attendanceRouter = Router();

attendanceRouter.post("/mark", markAttendance);
attendanceRouter.delete("/delete-attendance", deleteAttendance);
attendanceRouter.post("/mark-by-admin", addAttendance);
attendanceRouter.get("/view-mark-by-admin", getODAttendanceList);
attendanceRouter.get("/attendancelist", getAttendanceList);
attendanceRouter.put("/update-entry", updateAttendanceEntry);
attendanceRouter.get("/report", getAttendanceReport);
// Add any additional routes related to attendance here
attendanceRouter.get("/particular-month-attendancelist",getparticularemployeeMonthlyAttendance);
attendanceRouter.get("/particular-month-attendancelist-top5",getparticularemployeeMonthlyAttendanceWithTop5);
attendanceRouter.get("/particular-month-attendancelist-details",getparticularemployeeMonthlyAttendanceDetails);
attendanceRouter.get("/dashboard-attendance-birthday",dashboardAttendanceAndBirthday); // Assuming this is the correct route for dashboard attendance and birthday
attendanceRouter.get("/payroll",payroll);
export default attendanceRouter;

