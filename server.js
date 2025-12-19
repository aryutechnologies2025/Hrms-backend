import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// import other file
// import HolidayRouter from "./routes/upcomingHolidayRouter.js";
import connectDB from "./config/database.js";
import userRoutes from "./routes/userRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRouter.js";
import leaveRoutes from "./routes/leaveRouter.js";
import roleRouter from "./routes/roleRouter.js";
import DepartmentRouter from "./routes/departmentRouter.js";
import projectRouter from "./routes/projectRouter.js";
import taskRouter from "./routes/taskRouter.js";
import ClientRouter from "./routes/clientRouter.js";
import invoiceRouter from "./routes/invoiceRouter.js";
import upcomingHolidayRouter from "./routes/upcomingHolidayRouter.js";
import autoLogoutJob from "./cron/autoLogout.js";
import incomeRouter from "./routes/incomeRouter.js";
import expenseRouter from "./routes/expenseRouter.js";
import categoryRouter from "./routes/categoryRouter.js";
import linkRouter from "./routes/linkRouter.js";
import revisionRouter from "./routes/revisionRouter.js";
import leaveTypeRouter from "./routes/leaveTypeRouter.js";
import communicationRouter from "./routes/communicationRouter.js";
import employeeRequestRouter from "./routes/EmployeeRequestRouter.js";
import payrollRouter from "./routes/payrollRouter.js";
import autoEmailSendJob from "./cron/newTaskSendEmail.js";
import joiningRouter from "./routes/joiningRouter.js";
import joiningVerifyRouter from "./routes/joiningVerifyRouter.js";
import relivingRouter from "./routes/RelivingRouter.js";
import relivingVerifyRouter from "./routes/RelivingVerifyRouter.js";
import hrPermissionRouter from "./routes/hrPermissionRouter.js";
import declarationRouter from "./routes/declarationRouter.js";
import letterRouter from "./routes/letterRouter.js";
import paymentTypeRouter from "./routes/paymentTypeRouter.js";
import settingRouter from "./routes/settingRouter.js";
import bidder from "./routes/bidderRouter.js";
import jobTypeRouter from "./routes/jobTypeRouter.js";
import socialMediaRouter from "./routes/socialMediaRouter.js";
import subtaskRouter from "./routes/subTaskRouter.js";

import clientSubuser from "./routes/clientSubUser.js";


import momRouter from "./routes/momRouter.js";
import assetRouter from "./routes/assetRouter.js";
import assetCategoryRouter from "./routes/assetCategoryRouter.js";
import statementsRouter from "./routes/statementsRouter.js";
import announcementRouter from "./routes/announcementRouter.js";
import subCategoryRouter from "./routes/subCategoryRouter.js";
import projectNotesRouter from "./routes/projectNotesRouter.js";
import useAuth from "./middlewares/userAuth.js";
import  startSocketServer  from "./socket.js";
import channelRouter from "./routes/channelRouter.js";
import messageRouter from "./routes/messageRouter.js";

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

app.use(morgan("dev"));

app.use(
  cors({
    origin: true, // allow all origins
    credentials: true, // allow cookies/auth headers
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const startApp = async () => {
  // start cron
  await connectDB();
  autoEmailSendJob();
  autoLogoutJob();
  // Ensure uploads directory exists
  app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  app.use("/api/auth", userRoutes);
  app.use("/api/roles", roleRouter);
  app.use("/api/employees", employeeRoutes);

  app.use("/api/attendance", attendanceRoutes);
  app.use("/api/leave", leaveRoutes);
  app.use("/api/department", DepartmentRouter);
  app.use("/api/project", projectRouter);
  app.use("/api/task", taskRouter);
  app.use("/api/client", ClientRouter);
  app.use("/api/clientsubuser",clientSubuser);
  app.use("/api/invoice", invoiceRouter);
  app.use("/api/upcomingholiday", upcomingHolidayRouter);
  app.use("/api/income", incomeRouter);
  app.use("/api/category", categoryRouter);
  app.use("/api/link", linkRouter);
  app.use("/api/revision", revisionRouter);
  app.use("/api/leaveType", leaveTypeRouter);
  app.use("/api/expense", expenseRouter);
  app.use("/api/employeeRequest", employeeRequestRouter);
  app.use("/api/communication", communicationRouter);
  app.use("/api/payroll", payrollRouter);
  app.use("/api/joining", joiningRouter);
  app.use("/api/joining-verify", joiningVerifyRouter);
  app.use("/api/reliving", relivingRouter);
  app.use("/api/reliving-verify", relivingVerifyRouter);
  app.use("/api/hr-permission", hrPermissionRouter);
  app.use("/api/declaration", declarationRouter);
  app.use("/api/letter", letterRouter);
  app.use("/api/payment-type", paymentTypeRouter);
  app.use("/api/setting", settingRouter);
  app.use("/api/bidder", bidder);
  app.use("/api/job-type", jobTypeRouter);
  app.use("/api/social-media", socialMediaRouter);
  app.use("/api/subtasks",subtaskRouter);
  app.use("/api/mom", momRouter);
  app.use("/api/asset-mannagement", assetRouter);
  app.use("/api/asset-mannagement-category", assetCategoryRouter);
  app.use("/api/sub-asset-category", subCategoryRouter);
  app.use("/api/statement",statementsRouter);
  app.use("/api/announcement", announcementRouter);
  app.use("/api/projectNotes", projectNotesRouter);

  app.use("/api/channel",channelRouter);
  app.use("/api/messages",messageRouter);
  
  // socket sever
  const server = http.createServer(app);
   startSocketServer(server);

//   app.use("/api/attendance",useAuth, attendanceRoutes);
//   app.use("/api/leave",useAuth, leaveRoutes);
//   app.use("/api/department",useAuth, DepartmentRouter);
//   app.use("/api/project",useAuth, projectRouter);
//   app.use("/api/task",useAuth, taskRouter);
//   app.use("/api/client",useAuth, ClientRouter);
//   app.use("/api/clientsubuser",useAuth,clientSubuser);
//   app.use("/api/invoice",useAuth, invoiceRouter);
//   app.use("/api/upcomingholiday",useAuth, upcomingHolidayRouter);
//   app.use("/api/income",useAuth, incomeRouter);
//   // app.use("/api/category",useAuth, categoryRouter);
//   app.use("/api/category", categoryRouter);
//   app.use("/api/link",useAuth, linkRouter);
//   app.use("/api/revision",useAuth, revisionRouter);
//   app.use("/api/leaveType",useAuth, leaveTypeRouter);
//   app.use("/api/expense",useAuth, expenseRouter);
//   app.use("/api/employeeRequest",useAuth, employeeRequestRouter);
//   app.use("/api/communication",useAuth, communicationRouter);
//   app.use("/api/payroll",useAuth, payrollRouter);
//   app.use("/api/joining",useAuth, joiningRouter);
//   app.use("/api/joining-verify",useAuth, joiningVerifyRouter);
//   app.use("/api/reliving",useAuth, relivingRouter);
//   app.use("/api/reliving-verify",useAuth, relivingVerifyRouter);
//   app.use("/api/hr-permission",useAuth, hrPermissionRouter);
//   app.use("/api/declaration",useAuth, declarationRouter);
//   app.use("/api/letter",useAuth, letterRouter);
//   app.use("/api/payment-type",useAuth, paymentTypeRouter);
//   app.use("/api/setting",useAuth, settingRouter);
//   app.use("/api/bidder",useAuth, bidder);
//   app.use("/api/job-type",useAuth, jobTypeRouter);
//   app.use("/api/social-media",useAuth, socialMediaRouter);
//   app.use("/api/subtasks",useAuth,subtaskRouter);
//   app.use("/api/mom",useAuth, momRouter);
//   app.use("/api/asset-mannagement",useAuth, assetRouter);
//   app.use("/api/asset-mannagement-category",useAuth, assetCategoryRouter);
//   app.use("/api/sub-asset-category",useAuth, subCategoryRouter);
//   app.use("/api/statement", useAuth,statementsRouter);
//   app.use("/api/announcement",useAuth, announcementRouter);
//   app.use("/api/projectNotes",useAuth, projectNotesRouter);



  // Base route
  app.get('/api', (req, res) => res.send('API is running... coming'));
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startApp(); 


