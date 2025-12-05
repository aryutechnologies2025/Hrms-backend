import Announcements from "../models/announcementModel.js";


const  createAnnouncement = async (req, res) => {
        try {
            const {date,expiryDate, message,visible,status } = req.body;
            const newAnnouncement = new Announcements({
                date,expiryDate,visible,status, message
            })
            const savedAnnouncement = await newAnnouncement.save();
            
            res.status(201).json({
                success: true,
                data: savedAnnouncement,
                message: "Announcement created successfully"
            });
        } catch (error) {
            console.log("error", error);
            res.status(400).json({ 
                success: false,
                message: "Internal server error",
                error: error.message });
        }
    };

    const getAllAnnouncements = async (req, res) => {
        try {
            const announcements = await Announcements.find();
            res.status(200).json({
                success: true,
                data: announcements,
                message: "Announcements fetched successfully"
            });
        } catch (error) {
            console.log("error", error);
            res.status(400).json({ 
                success: false,
                message: "Internal server error",
                error: error.message });
        }
    };

    const getAnnouncementById = async (req, res) => {
        try {
            const { id } = req.params;
            const announcement = await Announcements.findById(id);
            if (!announcement) {
                return res.status(404).json({ message: "Announcement not found" });
            }
            res.status(200).json({ message: "Announcement fetched successfully", announcement });
        } catch (error) {
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    };

    const editAnnouncement = async (req, res) => {
        try {
            const { id } = req.params;
            const updatedAnnouncement = await Announcements.findByIdAndUpdate(
                id, req.body, { new: true });
            if (!updatedAnnouncement) {
                return res.status(404).json({ message: "Announcement not found" });
            }
            res.status(200).json({ message: "Announcement updated successfully", updatedAnnouncement });
        } catch (error) {
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    };

    const deleteAnnouncement = async (req, res) => {
        try {
            const { id } = req.params;
            const deletedAnnouncement = await Announcements.findByIdAndDelete(id);
            if (!deletedAnnouncement) {
                return res.status(404).json({ message: "Announcement not found" });
            }
            res.status(200)
            .json({ message: "Announcement deleted successfully", deletedAnnouncement });
        } catch (error) {
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    };

    export {createAnnouncement,
        getAllAnnouncements,
        getAnnouncementById,
        editAnnouncement,
        deleteAnnouncement};