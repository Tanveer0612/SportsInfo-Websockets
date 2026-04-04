import { Router } from "express";
import { createMatch, listMatches } from "../controllers/match.controller.js";

const matchRouter = Router();

matchRouter.route("/create").post(createMatch);
matchRouter.route("/listMatches").get(listMatches);

export default matchRouter