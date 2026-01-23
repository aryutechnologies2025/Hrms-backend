import Employee from "../models/employeeModel.js";
import ProjectNotes from "../models/projectNotesModel.js";
import User from "../models/userModel.js";

const createProjectNotes = async (req, res) => {

    try {
        const { title, description, projectId, reporter, createdBy } = req.body;
        console.log("req.body", req.body);
        const documentArray = [];
        if (Array.isArray(req.files)) {
            req.files.forEach((file) => {
                if (file.fieldname === "projectDocuments") {
                    documentArray.push({
                        filepath: file.filename,
                        originalName: file.originalname,
                    });
                }

            });
        }
        const newProjectNotes = new ProjectNotes({
            title,
            description,
            projectId,
            documents: documentArray,
            reporter,
            createdBy
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
    try {
        const projectNotesDetails = await ProjectNotes.find();
        res.status(200).json({ success: true, data: projectNotesDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// const getProjectNotesDetailsById = async (req, res) => {
//     const { id } = req.params;
//     try{
//         const projectNotesDetails = await ProjectNotes.find({projectId:id});

//         res.status(200).json({ success: true, data: projectNotesDetails });
//         }catch(error){
//             res.status(500).json({ success: false, message: "Internal Server Error" });
//         }
// };

const getProjectNotesDetailsById = async (req, res) => {
    const { id, type } = req.query;

    try {
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Project id is required"
            });
        }

        const query = { projectId: id };

        if (type === "employee") {
            // query.createdBy = employeeId;
            query.reporter = "yes";
        }

        const projectNotesDetails = await ProjectNotes.find(query);

        const formattedNotes = await Promise.all(
            projectNotesDetails.map(async (item) => {
                let createdByDetails = "Admin";
                let createdByType = "Admin";

                const employee = await Employee
                    .findById(item.createdBy)
                    .select("employeeName");

                if (employee) {
                    createdByDetails = employee.employeeName;
                    createdByType = "Employee";
                } else {
                    const admin = await User
                        .findById(item.createdBy)
                        .select("name");

                    if (admin) {
                        createdByDetails = admin.name;
                        createdByType = "Admin";
                    }
                }

                return {
                    id: item._id,
                    projectId: item.projectId,
                    documents: item.documents,
                    title: item.title,
                    description: item.description,
                    reporter: item.reporter || "no",
                    createdBy: createdByDetails,

                    // createdBy: {
                    //     id: item.createdBy?.toString() || null,
                    //     name: createdByDetails,
                    //     type: createdByType
                    // }
                };
            })
        );

        return res.status(200).json({
            success: true,
            data: formattedNotes
        });

    } catch (error) {
        console.error("Error fetching project notes:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// const  editProjectNotesDetails = async (req, res) => {
//     const { id } = req.params;
//     const { title, description,documents, reporter  } = req.body;
//     const newDocuments = [];
//     if (req.files && req.files.length > 0) {
//       req.files.forEach((file) => {
//         if (file.fieldname === "projectDocuments") {
//           newDocuments.push({
//             filepath: file.filename,
//             originalName: file.originalname,
//           });
//         }

//       });
//     }
//     try{
//         const projectNotesDetails = await ProjectNotes.findByIdAndUpdate
//         (id, req.body, { new: true });

//         if (!projectNotesDetails) {
//             return res.status(404).json({ success: false, message: "Project Notes not found" });
//         }

//         res.status(200).json({ success: true, data: projectNotesDetails });
//         }catch(error){
//             res.status(500).json({ success: false, message: "Internal Server Error" });
//         }
// };  

const editProjectNotesDetails = async (req, res) => {
    const { id } = req.params;
    const { title, description, documents, reporter } = req.body;
    const newDocuments = [];

    if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
            if (file.fieldname === "projectDocuments") {
                newDocuments.push({
                    filepath: file.filename,
                    originalName: file.originalname,
                });
            }
        });
    }

    try {
        const projectNotesDetails = await ProjectNotes.findByIdAndUpdate(
            id,
            { title, description, documents, reporter, documents: newDocuments },
            { new: true }
        );

        if (!projectNotesDetails) {
            return res.status(404).json({ success: false, message: "Project Notes not found" });
        }

        res.status(200).json({ success: true, data: projectNotesDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const projectNotesDelete = async (req, res) => {
    const { id } = req.params;
    try {
        const projectNotesDetails = await ProjectNotes.findByIdAndDelete(id);
        res.status(200).json({ success: true, data: projectNotesDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export {
    createProjectNotes,
    getProjectNotesDetails,
    getProjectNotesDetailsById,
    editProjectNotesDetails,
    projectNotesDelete
};