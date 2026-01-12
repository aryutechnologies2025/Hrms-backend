import express from "express";
import { createCustomer, getCustomerDetails, editCustomerDetails, customerDelete } from "../controllers/customerController.js";

const customerRouter = express.Router();
customerRouter.post("/create-customer", createCustomer);
customerRouter.get("/view-customer", getCustomerDetails);
customerRouter.put("/edit-customer/:id", editCustomerDetails);
customerRouter.post("/delete-customer/:id", customerDelete);

export default customerRouter;