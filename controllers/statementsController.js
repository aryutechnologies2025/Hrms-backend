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

const importExcel = async (req, res) => {
  try {

    const { projectId } = req.body;
    // console.log("INSIDE CONTROLLER");
    // console.log("FILE:", req.file);

    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File not received",
      });
    }

  // Read Excel
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

 // Convert rows to format your Schema needs
    const parsed = sheetData.map((row) => ({
      date: new Date(row["Date"]),
      narration: row["Narration"],
      ledger: row["Ledger"],
      reason: row["Reason"],
      type: row["Withdrawal Amt."] > 0 ? "debit" : "credit",
      withdrawalAmount: row["Withdrawal Amt."] || 0,
      depositAmount: row["Deposit Amt."] || 0,
       projectId, //  attach project id
      createdBy: req.admin?._id || "Admin",
    }));

    //  IMPORTANT: Save all rows properly using Promise.all
    await Promise.all(parsed.map((entry) => Statement.create(entry)));

   

    return res.status(200).json({
      success: true,
      message: "Excel parsed successfully",
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

export default importExcel;