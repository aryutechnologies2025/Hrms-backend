import express from "express";
import { createAnnouncement,
     editAnnouncement, 
     deleteAnnouncement,  
     getAllAnnouncements,
     getAnnouncementById} from "../controllers/announcementController.js";

const announcementRouter = express.Router();

announcementRouter.post("/create-announcement", createAnnouncement);
announcementRouter.get("/view-announcement", getAllAnnouncements);
// announcementRouter.get("/view-announcement/", getAnnouncementById);
announcementRouter.put("/edit-announcement/:id", editAnnouncement);
announcementRouter.delete("/delete-announcement/:id", deleteAnnouncement);

export default announcementRouter;