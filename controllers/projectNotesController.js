import ProjectNotes from "../models/projectNotesModel.js";

const createProjectNotes = async (req, res) => {
    try {
        const{title,description,projectId}=req.body;

         const newProjectNotes = new ProjectNotes({
            title,
            description,
            projectId
        });
        const savedNotes = await newProjectNotes.save();

        res.status(201).json({
            success: true,
            message: "Project Notes created successfully",
            data: savedNotes,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    } 
};

const getProjectNotesDetails = async (req, res) => {
    try{
        const projectNotesDetails = await ProjectNotes.find();
        res.status(200).json({ success: true, data: projectNotesDetails });
        }catch(error){
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
};

const getProjectNotesDetailsById = async (req, res) => {
    const { id } = req.params;
    try{
        const projectNotesDetails = await ProjectNotes.find({projectId:id});
        res.status(200).json({ success: true, data: projectNotesDetails });
        }catch(error){
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
};

const  editProjectNotesDetails = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    try{
        const projectNotesDetails = await ProjectNotes.findByIdAndUpdate
        (id, req.body, { new: true });

        if (!projectNotesDetails) {
            return res.status(404).json({ success: false, message: "Project Notes not found" });
        }

        res.status(200).json({ success: true, data: projectNotesDetails });
        }catch(error){
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
};  

const projectNotesDelete = async (req, res) => {
    const { id } = req.params;
    try{
        const projectNotesDetails = await ProjectNotes.findByIdAndDelete(id);
        res.status(200).json({ success: true, data: projectNotesDetails });
        }catch(error){
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
};

export { createProjectNotes,
     getProjectNotesDetails,
      getProjectNotesDetailsById, 
      editProjectNotesDetails,
       projectNotesDelete };