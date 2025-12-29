import express from "express";
import {
  addNotesInvoice,
  createInvoice,
  getInvoiceDetails,
  editInvoiceDetails,
  deleteInvoiceDetails,
  getProjectName,
  getProjectDetails,
  getProjectNameWithClient,
  uploadClientInvoice,
  clientInvoiceById,
  clientDashboard,
  selectInvoiceDocument,
  clientInvoiceByProjectWise
} from "../controllers/invoiceController.js";
import upload from "../middlewares/upload.js";

const invoiceRouter = express.Router();

invoiceRouter.post("/create-invoice", createInvoice);
invoiceRouter.get("/view-invoice", getInvoiceDetails);
invoiceRouter.put("/edit-invoice/:id", editInvoiceDetails);
invoiceRouter.post("/delete-invoice/:id", deleteInvoiceDetails);
invoiceRouter.post("/add-notes/:id", addNotesInvoice);
invoiceRouter.get("/get-project-name", getProjectName);
invoiceRouter.get("/get-project-details/:type", getProjectDetails);
invoiceRouter.get("/get-project-name-with-client", getProjectNameWithClient);
invoiceRouter.post(
  "/upload-client-invoice",upload.single("clientInvoice"),
  // upload.fields([{ name: "clientInvoice", maxCount: 10 }]),
  uploadClientInvoice
);
invoiceRouter.get("/client-invoice", clientInvoiceById);
invoiceRouter.get("/client-invoice-dashboard", clientDashboard);
invoiceRouter.post("/select-invoice-document", selectInvoiceDocument);
invoiceRouter.get("/client-invoice-by-project-wise", clientInvoiceByProjectWise);
export default invoiceRouter;
