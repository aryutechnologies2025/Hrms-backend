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