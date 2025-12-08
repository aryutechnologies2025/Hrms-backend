import Announcements from "../models/announcementModel.js";

// Create announcement
const createAnnouncement = async (req, res) => {
  try {
    const { date, expiryDate, message, status, visible } = req.body;
    const newAnnouncement = new Announcements({
      date,
      expiryDate,
      message,
      visible,
      status,
    });
    const savedAnnouncement = await newAnnouncement.save();


    res.status(201).json({
      success: true,
      data: savedAnnouncement,
      message: "Announcement created successfully",
    });
  } catch (error) {
    console.log("error", error);
    res.status(400).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all announcements (with optional visibility filter)
const getAllAnnouncements = async (req, res) => {
  try {
    const { type } = req.query;

    const baseFilter = {};

    if (type !== undefined) {
      baseFilter.visible = type === "true";
    }

    const announcements = await Announcements.find(baseFilter);

    res.status(200).json({
      success: true,
      data: announcements,
      message: "Announcements fetched successfully",
    });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get announcement by ID
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcements.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res
      .status(200)
      .json({ message: "Announcement fetched successfully", announcement });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Edit announcement
const editAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAnnouncement = await Announcements.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res
      .status(200)
      .json({
        message: "Announcement updated successfully",
        updatedAnnouncement,
      });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAnnouncement = await Announcements.findByIdAndDelete(id);
    if (!deletedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res
      .status(200)
      .json({
        message: "Announcement deleted successfully",
        deletedAnnouncement,
      });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

//  New function: Get expired announcements
const getExpiredAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcements.find();

    // Filter announcements that are expired
    const expired = announcements.filter(a => new Date(a.expiryDate) < new Date());

    res.status(200).json({
      success: true,
      data: expired,
      message: "Expired announcements fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const getUserAnnouncements = async (req, res) => {
    console.log("req ",req.query);
  try {
    const userRole = req.query.role; // e.g., "admin" or "employee"
    const announcements = await Announcements.find({
      visible: { $in: [userRole, "Both"] },
      expiryDate: { $gte: new Date() }, // not expired
      status:"1"
    });

    res.status(200).json({
      success: true,
      data: announcements,
      message: "Announcements fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  editAnnouncement,
  deleteAnnouncement,
  getExpiredAnnouncements, // <-- exported
  getUserAnnouncements
};

