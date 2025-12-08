import express from "express";
import { createProjectNotes, 
    editProjectNotesDetails,
     getProjectNotesDetails, 
     getProjectNotesDetailsById, 
     projectNotesDelete } from "../controllers/projectNotesController.js";

const projectNotesRouter = express.Router();

projectNotesRouter.get("/projectNotes",getProjectNotesDetails);
projectNotesRouter.get("/projectNotes/:id",getProjectNotesDetailsById);
projectNotesRouter.post("/create-projectNotes",createProjectNotes);
projectNotesRouter.put("/edit-projectNotesdetails/:id",editProjectNotesDetails); 
projectNotesRouter.delete("/delete-projectNotesDelete/:id",projectNotesDelete);

export default projectNotesRouter;
