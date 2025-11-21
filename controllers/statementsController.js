// import XLSX from "xlsx";
// import Statement from "../models/statementsModel.js";


//  const importExcel = async (req, res) => {

//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "Excel file is required" });
//     }


//     // read file from disk
//     const workbook = XLSX.readFile(req.file.path);

//     // extract the data in sheet
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];

//     // convert the data to json
//     const excelData = XLSX.utils.sheet_to_json(sheet);

//      console.log(excelData);

//     const formattedData = excelData.map((row) => {
//       let amount = 0;
//       let type = "";

//       if (row["Withdrawal Amt."]) {
//         amount = row["Withdrawal Amt."];
//         type = "debit";
//       } else if (row["Deposit Amt."]) {
//         amount = row["Deposit Amt."];
//         type = "credit";
//       }

//       return {
//         date: row.Date || null,
//         narration: row.Narration || "",
//         ledger: row.Ledger || "",
//         reason: row.Reason || "",
//         type: type,
//         // closingAmount: closingAmount,
//         createdBy: "system",
//         dateTime: row.Date ? new Date(row.Date) : null,
//       };
//     });

//     const result = await Statement.insertMany(formattedData);

//     res.status(200).json({
//       message: "Excel Imported Successfully",
//       count: result.length,
//       data: result,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Error importing Excel", error: err });
//   }

// };

// export default importExcel;




// import XLSX from "xlsx";
// import Statement from "../models/statementsModel.js";

// export const importExcel = async (req, res) => {
//   try {
//     console.log("INSIDE CONTROLLER");
//     console.log("FILE:", req.file);

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "File not received. Upload via form-data → file.",
//       });
//     }

//     // Read Excel from buffer
//     const workbook = XLSX.read(req.file.buffer, { type: "buffer", cellDates: true });

//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     console.log("00test   -----",sheet)

//     // Read all rows as array of arrays
//     const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });


// console.log("---- DEBUG: RAW ROWS ----");
// // for (let i = 0; i < rawRows.length; i++) {
// //   console.log(i, rawRows[i]);
// // }
// console.log("---- END RAW ----");



//     // Find header row index dynamically
//     const headerIndex = rawRows.findIndex((row) => {
//   if (!row) return false;
//   const rowText = row.join(" ").toLowerCase();

//   return (
//     rowText.includes("date") &&
//     rowText.includes("narration") &&
//     (rowText.includes("withdraw") || rowText.includes("deposit"))
//   );
// });

//     if (headerIndex === -1) {
//       return res.status(400).json({
//         success: false,
//         message: "Transaction header not found. Check console for exact values.",
//       });
//     }

//     console.log("Header Found At Row:", headerIndex + 1);

//     // Convert using header row
//     const jsonData = XLSX.utils.sheet_to_json(sheet, { range: headerIndex });

//     const finalData = [];

//     for (let row of jsonData) {
//       if (!row["Date"]) continue;

//       const withdrawal = Number(row["Withdrawal Amt."]) || 0;
//       const deposit = Number(row["Deposit Amt."]) || 0;

//       let type = "";
//       if (withdrawal > 0) type = "debit";
//       if (deposit > 0) type = "credit";

//       if (!type) continue;

//       finalData.push({
//         date: new Date(row["Date"]),
//         narration: row["Narration"] || "",
//         ledger: row["Ledger"] || "",
//         reason: row["Reason"] || "",
//         type,
//         withdrawalAmount: withdrawal,
//         depositAmount: deposit,
//         createdBy: "system",
//       });
//     }

//     console.log("Final rows:", finalData.length);

//     return res.status(200).json({
//       success: true,
//       message: "Excel parsed successfully",
//       total: finalData.length,
//       sample: finalData.slice(0, 5),
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


import XLSX from "xlsx";
import Statement from "../models/statementsModel.js";

/* --------- DATE HELPERS ------------ */

// Convert Excel numeric or string date to dd-mm-yyyy
function formatExcelDate(value) {
  if (!value) return null;

  // Numeric Excel date
  if (typeof value === "number") {
    const excelDate = new Date((value - 25569) * 86400 * 1000);
    const d = String(excelDate.getDate()).padStart(2, "0");
    const m = String(excelDate.getMonth() + 1).padStart(2, "0");
    const y = excelDate.getFullYear();
    return `${d}-${m}-${y}`;
  }

  // Already formatted string: "01-04-2025"
  if (typeof value === "string" && value.includes("-")) {
    const parts = value.split("-");
    if (parts.length === 3) return value;
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

const importExcel = async (req, res) => {
  try {
    const { account } = req.body;

    if (!account) {
      return res.status(400).json({ error: "Account ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file not received",
      });
    }

    // Read Excel
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Transform sheet rows → DB Rows
    const parsed = sheetData.map((row) => {
      const withdrawal = row["Withdrawal Amt."] || 0;
      const deposit = row["Deposit Amt."] || 0;

      const type = withdrawal > 0 ? "debit" : "credit";

      return {
        date: formatExcelDate(row["Date"]), // Always dd-mm-yyyy
        narration: row["Narration"],
        ledger: row["Ledger"],
        reason: row["Reason"],
        type,
        withdrawalAmount: withdrawal,
        depositAmount: deposit,
        amount: type === "debit" ? withdrawal : deposit,
        account,
      };
    });

    // Save all rows
    await Statement.insertMany(parsed);

    return res.status(200).json({
      success: true,
      message: "Excel imported successfully",
      total: parsed.length,
    });

  } catch (error) {
    console.error("Import error:", error);
    return res.status(500).json({
      success: false,
      message: "Error importing Excel",
      error: error.message,
    });
  }
};

/* ------- GET ALL STATEMENTS ----------- */

function toSortable(d) {
  const [day, month, year] = d.split("-");
  return `${year}${month}${day}`; // 20250401
}

const getAllStatementDetails = async (req, res) => {
  try {
    const { type, account, startDate, endDate } = req.query;

    let filter = {};
    if (type) filter.type = type;
    if (account) filter.account = account;

    // First get all documents
    let all = await Statement.find(filter);

    // If date filter applied → filter manually
    if (startDate && endDate) {
      const start = toSortable(startDate);
      const end = toSortable(endDate);

      all = all.filter(item => {
        const itemSortable = toSortable(item.date); // item.date = "01-04-2025"
        return itemSortable >= start && itemSortable <= end;
      });
    }

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
      req.body,
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
