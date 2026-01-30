import Backup from "../models/backupModel.js";
const createBackup = async (req, res) => {
    const { date, projectList, type, createdBy } = req.body;

    const documentArray = [];
        if (Array.isArray(req.files)) {
            req.files.forEach((file) => {
                if (file.fieldname === "backupFilesDocuments") {
                    documentArray.push({
                        filepath: file.filename,
                        originalName: file.originalname,
                    });
                }

            });
        }
       
    try {
        const backup = new Backup({ date, projectList, type, documents: documentArray, createdBy });
        await backup.save();
        res.status(201).json({ message: "Backup created successfully", backup });
    } catch (error) {
        if (error.name === "ValidationError") {
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ errors });
        } else {
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
}

const getBackup= async (req, res) => {
  try {
    const BackupDetails = await Backup.find().populate("createdBy", "name")
    .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: BackupDetails });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getBackupById = async(req,res)=>{
    const {id} = req.query;
    try{
        const backupDetails = await Backup.find({createdBy:id}).sort({createdAt:-1});
        res.status(200).json({success:true,data:backupDetails});
    }catch(error){
        res.status(500).json({success:false,error:error.message});
    }
}

const editBackupById = async (req, res) => {
  const { id } = req.params;
  const { date, projectList, type } = req.body;
  const newDocuments = [];

    if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
            if (file.fieldname === "backupFilesDocuments") {
                newDocuments.push({
                    filepath: file.filename,
                    originalName: file.originalname,
                });
            }
        });
    }
  try {
    const updated = await Backup.findByIdAndUpdate(  id,
            {date, projectList, type,documents : newDocuments,},
            { new: true }
        );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Backup not found" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteBackup = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Backup.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Backup not found" });
    }
    res.status(200).json({ success: true, message: "Backup deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export { createBackup,getBackup,getBackupById,editBackupById,deleteBackup };