import DigitalMarketing from "../models/digitalMarketingModel.js";
import Employee from "../models/employeeModel.js";
import Task from "../models/taskModal.js";
import User from "../models/userModel.js";
const createDigitalMarketing = async (req, res) => {
    try {
        const {
            taskId,
            task,
            title,
            projectId,
            description,
            postType,
            postUrl,
            postDate,
            status,
            createdBy
        } = req.body;

        console.log("req.body", req.body);

        const documentArray = [];
        if (Array.isArray(req.files)) {
            req.files.forEach((file) => {
                if (file.fieldname === "digitalMarketingDocuments") {
                    documentArray.push({
                        filepath: file.filename,
                        originalName: file.originalname,
                    });
                }
            });
        }

        // let taskObjectId = null;
        // if (taskId) {
        //     const taskDetails = await Task.findOne({ taskId });
        //     // if (!taskDetails) {
        //     //     return res.status(404).json({
        //     //         success: false,
        //     //         message: "Task not found",
        //     //     });
        //     // }
        //     taskObjectId = taskDetails._id;
        // }

        const newDigitalMarketing = new DigitalMarketing({
            taskId,             
            // task: taskObjectId,  
            task,  
            projectId,
            documents: documentArray,
            title,
            description,
            postType,
            postUrl,
            postDate,
            status,
            createdBy
        });


        const savedDigitalMarketing = await newDigitalMarketing.save();
        console.log("savedDigitalMarketing", savedDigitalMarketing);
        res.status(201).json({
            success: true,
            message: "Created successfully",
            data: savedDigitalMarketing,
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


const getDigitalMarketing = async (req, res) => {
    const {employeeId, type} = req.query;
    try {
        if(employeeId && type === "digitalMarketing"){
            const digitalMarketing =await DigitalMarketing.find({createdBy:employeeId})
            .populate("projectId", "name")
            .sort({createdAt:-1});
              const formattedNotes = await Promise.all(
                        digitalMarketing.map(async (item) => {
                            let createdByDetails = null;
                            let createdByType = null;
            
            
                            const employee = await Employee.findById(item.createdBy).select("employeeName");
                            if (employee) {
                                createdByDetails = employee.employeeName;
                                createdByType = "Employee";
                            } else {
            
                                const admin = await User.findById(item.createdBy).select("name");
                                if (admin) {
                                    createdByDetails = admin.name;
                                    createdByType = "Admin";
                                }
                            }
            
                            return {
                                id:item._id,
                                taskId: item.taskId,
                                task: item.task,
                                projectId:item.projectId?.name,
                                title: item.title,
                                description: item.description,
                                postType: item.postType,
                                postUrl: item.postUrl,
                                postDate: item.postDate,
                                status: item.status,
                                createdBy: createdByDetails || "Admin",
                                // createdBy: {
                                //     id: item.createdBy ? item.createdBy.toString() : null,
                                //     name: createdByDetails || "Admin",
                                //     type: createdByType || "Admin"
                                // }
                            };
                        })
                    );
            
            res.status(200).json({
                success: true,
                message: "retrieved successfully",
                data: formattedNotes,
            });
        }else{
            const digitalMarketing = await DigitalMarketing.find({}).populate("projectId", "name").sort({createdAt:-1});
             const formattedNotes = await Promise.all(
                        digitalMarketing.map(async (item) => {
                            let createdByDetails = null;
                            let createdByType = null;
            
            
                            const employee = await Employee.findById(item.createdBy).select("employeeName");
                            if (employee) {
                                createdByDetails = employee.employeeName;
                                createdByType = "Employee";
                            } else {
            
                                const admin = await User.findById(item.createdBy).select("name");
                                if (admin) {
                                    createdByDetails = admin.name;
                                    createdByType = "Admin";
                                }
                            }
            
                            return {
                                id:item._id,
                                taskId: item.taskId,
                                task: item.task,
                                projectId:item.projectId?.name,
                                title: item.title,
                                description: item.description,
                                postType: item.postType,
                                postUrl: item.postUrl,
                                postDate: item.postDate,
                                documents: item.documents,
                                status: item.status,
                                createdBy: createdByDetails || "Admin",
                                // createdBy: {
                                //     id: item.createdBy ? item.createdBy.toString() : null,
                                //     name: createdByDetails || "Admin",
                                //     type: createdByType || "Admin"
                                // }
                            };
                        })
                    );
            res.status(200).json({
                success: true,
                message: "retrieved successfully",
                data: formattedNotes,
            });
        }
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
const editDigitalMarketing = async (req, res) => {
    const { id } = req.params;
    console.log("Editing Digital Marketing ID:", id);
    const { title, description,postType,postUrl,postDate,status, documents } = req.body;
    let newDocuments = [];
    if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
            if (file.fieldname === "digitalMarketingDocuments") {
                newDocuments.push({
                    filepath: file.filename,
                    originalName: file.originalname,
                });
            }
        });
    }
   

    try {
        const projectDigitalMarketing = await DigitalMarketing.findByIdAndUpdate(
            id,
            {title, description,postType,postUrl,postDate,status, documents:newDocuments },
            { new: true }
        );

        if (!projectDigitalMarketing) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.status(200).json({ success: true, data: projectDigitalMarketing });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const digitalMarketingsDelete = async (req, res) => {
    const { id } = req.params;
    try {
        const digitalMarketingDetails = await DigitalMarketing.findByIdAndDelete(id);
        res.status(200).json({ success: true, data: digitalMarketingDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
export { createDigitalMarketing,getDigitalMarketing,editDigitalMarketing,digitalMarketingsDelete };