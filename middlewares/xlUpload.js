import multer from "multer";
import fs from "fs";
import path from "path";
import AccountBidder from "../models/accountBidderModel.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(
      process.cwd(),
      "uploads",
      "bidding",
      "bidding-transaction"
    );

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const accountId = req.query.account;

    if (!accountId) {
      return cb(new Error("Account ID is required"));
    }

    AccountBidder.findById(accountId)
      .then(accountDetails => {
        const accountName = accountDetails?.name || "unknown";

        const uniqueNumber = Date.now();
        const date = new Date().toISOString().split("T")[0];
        const ext = path.extname(file.originalname);

        const fileName = `${accountName}_${uniqueNumber}_${date}${ext}`;
        cb(null, fileName);
      })
      .catch(err => {
        cb(err);
      });
  }
});

const xlUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv",
      "text/plain"
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel or CSV files are allowed"));
    }
  }
});

export default xlUpload;



// import multer from "multer";

// const storage = multer.memoryStorage();

// const xlUpload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     const allowed =
//       file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
//       file.mimetype === "application/vnd.ms-excel" ||
//       file.mimetype === "text/csv" ||
//       file.mimetype === "application/csv";

//     cb(null, allowed);
//   },
// });

// export default xlUpload;



// xlUpload.js
// import multer from "multer";

// const storage = multer.memoryStorage();

// const xlUpload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     const allowedMimeTypes = [
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
//       "application/vnd.ms-excel", // .xls
//       "text/csv", // CSV files
//       "application/csv", // Alternative CSV mime type
//       "text/plain" // Sometimes CSV files are sent as text/plain
//     ];
    
//     const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    
//     const isMimeTypeAllowed = allowedMimeTypes.includes(file.mimetype);
//     const isExtensionAllowed = allowedExtensions.some(ext => 
//       file.originalname.toLowerCase().endsWith(ext)
//     );
    
//     if (isMimeTypeAllowed || isExtensionAllowed) {
//       cb(null, true);
//     } else {
//       cb(new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`));
//     }
//   },
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB limit
//   }
// });

// export default xlUpload;