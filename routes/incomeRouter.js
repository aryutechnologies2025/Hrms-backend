import express from "express";
import {
  createIncome,
  getincomeDetails,
  IncomeDelete,
  editIncomeDetails,
  getMonthlyTotalCredit,
  getYearlyTotalCredit,

  //finance company
  createFinanceCompany,
  getFinanceCompany,
  editFinanceCompany,
  deleteFinanceCompany,
  getFinanceName,

   createFinanceLender,
      getFinanceLender,
      editFinanceLender,
      deleteFinanceLender,
      getFinanceLenderName
} from "../controllers/incomeController.js";
const incomeRouter = express.Router();

incomeRouter.post("/create-income", createIncome);
incomeRouter.put("/edit-income/:id", editIncomeDetails);
incomeRouter.get("/get-monthly-total-credit", getMonthlyTotalCredit);
incomeRouter.get("/get-yearly-total-credit", getYearlyTotalCredit);
incomeRouter.get("/view-income", getincomeDetails);
incomeRouter.delete("/delete-income/:id", IncomeDelete);

//finance Company

incomeRouter.post("/create-financecompany", createFinanceCompany);
incomeRouter.get("/view-financecompany", getFinanceCompany);
incomeRouter.put("/edit-financecompany/:id", editFinanceCompany);
incomeRouter.delete("/delete-financecompany/:id", deleteFinanceCompany);
incomeRouter.get("/finance-name", getFinanceName);
//finance Lender

incomeRouter.post("/create-financelender", createFinanceLender);
incomeRouter.get("/view-financelender", getFinanceLender);
incomeRouter.put("/edit-financelender/:id", editFinanceLender);
incomeRouter.delete("/delete-financelender/:id", deleteFinanceLender);
incomeRouter.get("/finance-lender-name", getFinanceLenderName);
export default incomeRouter;
