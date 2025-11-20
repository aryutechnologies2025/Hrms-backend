// // import multer from 'multer';


// // const storage=multer.memoryStorage();//sore in memory
// // const xlUpload = multer({storage,
   
// //   fileFilter: (req, file, cb) => {
// //     if (
// //       file.mimetype ===
// //         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
// //       file.mimetype === "application/vnd.ms-excel"
// //     ) {
// //       cb(null, true);
// //     } else {
// //       cb(new Error("Only Excel files are allowed!"), false);
// //     }
// //   },
// // }) ; 

// // export default xlUpload

// import multer from "multer";
// import path from "path";

// // Storage config
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/others"); // store in uploads/others
//   },
//   filename: function (req, file, cb) {
//     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, unique + path.extname(file.originalname));
//   },
// });

// // File filter for Excel
// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype ===
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
//     file.mimetype === "application/vnd.ms-excel"
//   ) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only Excel files allowed"), false);
//   }
// };

// const xlUpload = multer({ storage, fileFilter });

// export default xlUpload;

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
