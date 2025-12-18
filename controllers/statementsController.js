




import XLSX from "xlsx";
// import csv from 'csv-parser'
import { Readable } from 'stream';
import Statement from "../models/statementsModel.js";
import mongoose from "mongoose";

/* --------- DATE HELPERS ------------ */

// Convert Excel numeric or string date to dd-mm-yyyy
// function formatExcelDate(value) {
//   if (!value) return null;

//   // Numeric Excel date
//   if (typeof value === "number") {
//     const excelDate = new Date((value - 25569) * 86400 * 1000);
//     const d = String(excelDate.getDate()).padStart(2, "0");
//     const m = String(excelDate.getMonth() + 1).padStart(2, "0");
//     const y = excelDate.getFullYear();
//     return `${d}-${m}-${y}`;
//   }

//   // Already formatted string: "01-04-2025"
//   if (typeof value === "string" && value.includes("-")) {
//     const parts = value.split("-");
//     if (parts.length === 3) return value;
//   }

//   return null;
// }


/*...........if use date as date type in model ........*/

 function formatExcelDate(value) {
  if (value == null || value === "") return null;

  // If Excel gives a number (Excel serial date)
  if (typeof value === "number") {
    const excelDate = new Date((value - 25569) * 86400 * 1000);
    return isNaN(excelDate) ? null : excelDate;
  }

  // If "dd-mm-yyyy"
  if (typeof value === "string") {
    const [day, month, year] = value.split("-");
    return new Date(`${year}-${month}-${day}`);
  }

  return null;
}


// Convert date from query: yyyy-mm-dd → dd-mm-yyyy
// function convertToDMY(value) {
//   const d = new Date(value);
//   const day = String(d.getDate()).padStart(2, "0");
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const year = d.getFullYear();
//   return `${day}-${month}-${year}`;
// }

/* ----IMPORT EXCEL ----- */

// Header alias map for Excel
const headerMap = {
  date: 
  ["date", "txn date", "transaction date", 
    "value dt", "value date", "value date.", "value dt",
   "dt"],
  narration: ["narration", "description", "particulars", "remarks","remark", "narration.",
     "transaction details",   
    "transaction detail",
    "details", "detail", "txn details", "txn detail"
  ],
  ledger: ["ledger", "account", "ledger name", "account name"],
  reason: ["reason", "remarks", "comment", "narration remark"],
  withdrawal: ["withdrawal amt.", "withdrawal", "debit", "dr amount", "withdrawal amount", "withdrawal_amt", "withdrawal amt"],
  deposit: ["deposit amt.", "deposit", "credit", "cr amount", "deposit amount", "deposit_amt", "deposit amt"]
};

// helper: normalize header string
 function normalizeHeader(h) {
  if (h == null) return "";
  return String(h).trim().toLowerCase().replace(/\s+/g, " ");
}


// build reverse lookup from sheet headers
 function mapSheetHeaders(sheetHeaders) {
  const normalizedHeaders = sheetHeaders.map(h => ({ raw: h, norm: normalizeHeader(h) }));
  const found = {};

  for (const [key, aliasList] of Object.entries(headerMap)) {
    const normAliases = aliasList.map(a => normalizeHeader(a));
    // find raw header whose normalized form matches any alias or contains alias token
    const match = normalizedHeaders.find(h =>
      normAliases.includes(h.norm) ||
      normAliases.some(a => h.norm.includes(a)) // allow partial matches
    );
    if (match) found[key] = match.raw;
    else found[key] = null;
  }

  return found;
}
const importExcel = async (req, res) => {
  try {
    const { account,date } = req.body;

    if (!account) {
      return res.status(400).json({ error: "Account is required" });
    }

      // Accept account name also
    if (!mongoose.Types.ObjectId.isValid(account)) {
      const company = await FinanceCompany.findOne({ name: account });

      if (!company) {
        return res.status(400).json({ error: "Invalid account name" });
      }

      account = company._id; // replace with ID
    }
  console.log("file",req.file)
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file not received",
      });
    }

    // Read Excel
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });

     if (!sheetData || sheetData.length === 0) {
        return res.status(400).json({ success: false, message: "Empty Excel sheet" });
      }

       // Get header keys from first row
      const sheetHeaders = Object.keys(sheetData[0]);

      // Map sheet headers to DB fields
      const headerLookup = mapSheetHeaders(sheetHeaders);

      // Check for minimum required column detection: date, narration, and (withdrawal|deposit)
      const missingRequiredColumns = [];
      if (!headerLookup.date) missingRequiredColumns.push("Date");
      if (!headerLookup.narration) missingRequiredColumns.push("Narration");
      if (!headerLookup.withdrawal && !headerLookup.deposit) missingRequiredColumns.push("Withdrawal or Deposit");

      if (missingRequiredColumns.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Incorrect Excel format",
          error: `Missing required columns: ${missingRequiredColumns.join(", ")}`,
          foundHeaders: sheetHeaders,
          expectedAliases: headerMap
        });
      }

 // Validate rows
      const rowErrors = [];
      const documents = [];

      sheetData.forEach((row, idx) => {
        const rowNum = idx + 2; // Excel row (assuming header is row 1). Adjust if needed.
        const get = (key) => {
          const rawKey = headerLookup[key];
          return rawKey ? row[rawKey] : null;
        };

        const dateVal = formatExcelDate(get("date"));
        const narrationVal = get("narration") ? String(get("narration")).trim() : null;

        let withdrawalRaw = get("withdrawal");
        let depositRaw = get("deposit");

        // Normalize numbers: remove commas, parentheses, and parse to number
        const toNumber = (v) => {
          if (v == null || v === "") return 0;
          const s = String(v).replace(/[, ]+/g, "").replace(/\((.*)\)/, "-$1");
          const n = Number(s);
          return isNaN(n) ? null : n;
        };

          const withdrawal = toNumber(withdrawalRaw);
        const deposit = toNumber(depositRaw);

         // Compute amount and type
        let amount = null || 0;
        let type = null;
        if (withdrawal && withdrawal !== 0) {
          amount = withdrawal;
          type = "debit";
        } else if (deposit && deposit !== 0) {
          amount = deposit;
          type = "credit";
        } else {
          // Some statements may have a single 'Amount' column - optional to detect
          const maybeAmount = toNumber(get("amount"));
          if (maybeAmount !== null && maybeAmount !== 0) {
            amount = maybeAmount;
            type = maybeAmount < 0 ? "debit" : "credit";
          }
        }

        // ledger & reason (optional)
        const ledgerVal = get("ledger") ? String(get("ledger")).trim() : null;
        const reasonVal = get("reason") ? String(get("reason")).trim() : null;

        // Row-level validations
        const localErrors = [];
        if (!dateVal) localErrors.push("Invalid or missing Date");
        if (!narrationVal) localErrors.push("Missing Narration");
        if (amount === null || amount === 0) localErrors.push("Missing amount (withdrawal/deposit)");

        if (localErrors.length) {
          rowErrors.push({ row: rowNum, errors: localErrors, raw: row });
          return; // skip constructing doc for this row
        }

         // Build doc for insert
        documents.push({
          date: dateVal,
          narration: narrationVal,
          ledger: ledgerVal || undefined,
          reason: reasonVal || undefined,
          amount: amount,
          type: type,
          account,
        
        });
      });

         if (rowErrors.length) {
        return res.status(400).json({
          success: false,
          message: "Validation failed for some rows",
          rowErrors,
          totalRows: sheetData.length
        });
      }

      // Insert into DB
      const inserted = await Statement.insertMany(documents, { ordered: false });

      return res.status(200).json({
        success: true,
        message: "Excel imported successfully",
        total: inserted.length
      });
    } catch (error) {
      console.error("Import error:", error);
      return res.status(500).json({
        success: false,
        message: "Error importing Excel",
        error: error.message
      });
    }
  }

      
//     // Transform sheet rows → DB Rows
//     const parsed = sheetData.map((row) => {
//       const withdrawal = row["Withdrawal Amt."] || 0;
//       const deposit = row["Deposit Amt."] || 0;

//       const type = withdrawal > 0 ? "debit" : "credit";

//       return {
//         date: formatExcelDate(row["Date"]), // Always dd-mm-yyyy
//         narration: row["Narration"],
//         ledger: row["Ledger"],
//         reason: row["Reason"],
//         type,
//         withdrawalAmount: withdrawal,
//         depositAmount: deposit,
//         amount: type === "debit" ? withdrawal : deposit,
//         account,
//       };
//     });

//     // Save all rows
//     await Statement.insertMany(parsed);

//     return res.status(200).json({
//       success: true,
//       message: "Excel imported successfully",
//       total: parsed.length,
//     });

//   } catch (error) {
//     console.error("Import error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error importing Excel",
//       error: error.message,
//     });
//   }
// };



// Helper function to parse CSV
function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

/* ------- GET ALL STATEMENTS ----------- */

function toSortable(d) {
  const [day, month, year] = d.split("-");
  return `${year}${month}${day}`; // 20250401
}

/* ...........if using date type as string in model ............ */ 
// const getAllStatementDetails = async (req, res) => {
//   try {
//     const { type, account, startDate, endDate } = req.query;

//     let filter = {};
//     if (type) filter.type = type;
//     if (account) filter.account = account;

//     // First get all documents
//     let all = await Statement.find(filter).populate("account","name");

//     console.log("filter",filter);
// console.log("startDate : ",startDate)
// console.log("endDate : ",endDate)
//     // If date filter applied → filter manually
//     if (startDate && endDate) {
//       const start = toSortable(startDate);
//       const end = toSortable(endDate);

//       console.log("start : ",start)
//       console.log("end : ",end)

//       all = all.filter(item => {
//         const itemSortable = toSortable(item.date); // item.date = "01-04-2025"
//         // console.log("itemSortable : ",itemSortable)
//         // console.log("item.date : ",item.date)
        
//         return itemSortable >= start && itemSortable <= end;
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "All Statement Details",
//       count: all.length,
//       allStatementDetails: all,
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };


/*.............if using date as date in model means no need to sortable  ...............*/
const getAllStatementDetails = async (req, res) => {
  try {
    const { type, account, startDate, endDate } = req.query;

    let filter = {};
    if (type) filter.type = type;
    if (account) filter.account = account;

console.log("filter",filter);
console.log("startDate : ",startDate)
console.log("endDate : ",endDate)
    if (startDate && endDate) {
      console.log("filter.date",filter.date);
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const all = await Statement.find(filter).populate("account", "name").sort({createdAt:-1});

    return res.status(200).json({
      success: true,
      message: "All Statement Details",
      count: all.length,
      allStatementDetails: all,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


/* ------- GET ONE STATEMENT -------- */

const getStatementDetailsById = async (req, res) => {
  try {
    const one = await Statement.findById(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Single Statement Details",
      singleStatementDetails: one,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/* ----------- EDIT ------------ */

const editStatementDetails = async (req, res) => {
  try {
    const updated = await Statement.findByIdAndUpdate(
      req.params.id,
       { notes: req.body.notes },   // Only update notes
      // req.body,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Statement Updated",
      updatedStatementDetails: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/* ---------- DELETE -------------- */

const deleteStatementDetails = async (req, res) => {
  try {
    const deleted = await Statement.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Statement Deleted",
      deletedStatementDetails: deleted,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export {
  importExcel,
  getAllStatementDetails,
  getStatementDetailsById,
  editStatementDetails,
  deleteStatementDetails,
};
