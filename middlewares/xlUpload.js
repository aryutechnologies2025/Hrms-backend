

import multer from "multer";

const storage = multer.memoryStorage();

const xlUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed =
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel";
    cb(null, allowed);
  },
});

export default xlUpload;


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