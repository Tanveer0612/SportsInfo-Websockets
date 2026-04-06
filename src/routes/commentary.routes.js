import { Router } from "express";
import { commentaryMessage, getCommentary } from "../controllers/commentary.controller.js";

const commentaryRouter = Router({ mergeParams: true });

commentaryRouter.route('/:id').post(commentaryMessage);
commentaryRouter.route('/:id').get(getCommentary);

export default commentaryRouter