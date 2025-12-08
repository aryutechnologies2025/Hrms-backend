import express from "express";
import { createAnnouncement,
     editAnnouncement, 
     deleteAnnouncement,  
     getAllAnnouncements,
     getAnnouncementById,
     getExpiredAnnouncements,
     getUserAnnouncements} from "../controllers/announcementController.js";

const announcementRouter = express.Router();

announcementRouter.post("/create-announcement", createAnnouncement);
announcementRouter.get("/view-announcement", getAllAnnouncements);
// announcementRouter.get("/view-announcement/", getAnnouncementById);
announcementRouter.put("/edit-announcement/:id", editAnnouncement);
announcementRouter.delete("/delete-announcement/:id", deleteAnnouncement);
announcementRouter.delete("/get-expired-announcement", getExpiredAnnouncements);
announcementRouter.get("/announcements/user",getUserAnnouncements);
export default announcementRouter;