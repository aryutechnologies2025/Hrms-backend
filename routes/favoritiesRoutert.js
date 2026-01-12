// routes/favoritesRoutes.js
// import express from "express";
// import { getFavorites, toggleChannelFavorite, toggleDMFavorite } from "../controllers/favoritiesController.js";

// const favoritesRouter = express.Router();

// favoritesRouter.post("/dm", toggleDMFavorite);
// favoritesRouter.post("/channel", toggleChannelFavorite);
// favoritesRouter.get("/:userId", getFavorites);

// export default favoritesRouter;


import express from "express";
import { getFavorites, toggleChannelFavorite, toggleDMFavorite } from "../controllers/favoritiesController.js";


const favoritesRouter = express.Router();

favoritesRouter.post("/dm", toggleDMFavorite);
favoritesRouter.post("/channel", toggleChannelFavorite);
favoritesRouter.get("/:userId", getFavorites);

export default favoritesRouter;
