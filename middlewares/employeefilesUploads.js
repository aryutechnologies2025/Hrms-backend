
import multer from "multer";
import path from "path";
import fs from "fs";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};


// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("file",file)
    let destPath;
    // console.log("file.fieldname", file.fieldname);
    // console.log("Incoming fields:", file);

    if (file.fieldname === "photo") {
      destPath = path.join(__dirname, "../uploads/employeesImages");
    }

    // else if (file.fieldname === "fileUpload") {
    //   destPath = path.join(__dirname, "../uploads/assets");
    // }
    // else if(file.fieldname === 'clientInvoice'){
    //   destPath =path.join(__dirname,'../uploads/clientInvoices');
    // }else if (file.fieldname === "originalDocument") {
    //   destPath = path.join(__dirname, "../uploads/originalDocuments");
    // }
    // else if (file.fieldname === 'files'){
    //   console.log("download 123");
    //   destPath =path.join(__dirname,'../uploads/documents');
    // }
    else if (
      /^document\[\d+\]\[files\]\[\d+\]\[selectedfile\]$/.test(file.fieldname)
    ) {
      console.log("Matched file upload field");
      destPath = path.join(__dirname, "../uploads/employeesDocuments");
    } else {
      destPath = path.join(__dirname, "../uploads/EmployeesOthers");
    }
    ensureDirExists(destPath);
    cb(null, destPath);
  },
//   filename: (req, file, cb) => {
//     const uniqueName =
//       Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
//     cb(null, uniqueName);
//   },
filename: (req, file, cb) => {
  const now = new Date();

  // Helper function to add leading zeros to single-digit numbers
  const pad = (num) => num.toString().padStart(2, '0');

  // Format the date and time as YYYY-MM-DD_HH-MM-SS
  // Colons (:) are illegal in Windows filenames, so hyphens or underscores are safer
  const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  const dateTimeStamp = `${datePart}_${timePart}`;

  // Get original extension and clean original name
  const originalname = file.originalname;
  const extension = originalname.substring(originalname.lastIndexOf('.'));
  const baseName = originalname.substring(0, originalname.lastIndexOf('.')).replace(/\s+/g, "_");

  // Combine to create the unique name
  const uniqueName = `${baseName}_${dateTimeStamp}${extension}`;

  cb(null, uniqueName);
},

});
// Multer instance
const employeefilesUpload = multer({
  storage,
  // limits: {
  //   fileSize: 5 * 1024 * 1024, // 5MB limit per file
  // },


  // Optional: Validate allowed file types
  // fileFilter: (req, file, cb) => {  
  //   const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  //   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  //   const mimetype = allowedTypes.test(file.mimetype);

  //   if (extname && mimetype) {
  //     cb(null, true);
  //   } else {
  //     cb(new Error("Only image and PDF files are allowed"));
  //   }
  // }
});
export default  employeefilesUpload;
