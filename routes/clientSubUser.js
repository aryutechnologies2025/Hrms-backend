import express from "express";
import {
  createClientSubUser,
  deleteClientSubUser,
  getAllClientSubUsers,
  getClientSubUserById,
  updateClientSubUser,
} from "../controllers/clientSubUserController.js";

const clientSubuser = express.Router();

//  Create a new sub-user
clientSubuser.post("/create-subuser", createClientSubUser);

//  Get all sub-users (excluding deleted, with populate)
clientSubuser.get("/all-subusers/:clientId", getAllClientSubUsers);

//  Get a single sub-user by ID (with populate)
clientSubuser.get("/particular-subuser/:id", getClientSubUserById);

//  Update a sub-user by ID
clientSubuser.put("/update-subuser/:id", updateClientSubUser);

//  Soft delete a sub-user by ID
clientSubuser.delete("/delete-subuser/:id", deleteClientSubUser);

export default clientSubuser;
