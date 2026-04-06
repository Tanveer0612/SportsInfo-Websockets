import mongoose from "mongoose";
import { CommentaryModel } from "../models/commentary.model.js";
import { matchIdParamSchema } from "../validations/matches.schema.js";
import { createCommentarySchema } from "../validations/commentary.schema.js";
import { listCommentaryQuerySchema } from "../validations/commentary.schema.js";

export const commentaryMessage = async (req, res) => {
    // 1. Validate params
    const paramsValidation = matchIdParamSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        return res.status(400).json({
            error: "Invalid matchId",
            details: paramsValidation.error.issues,
        });
    }

    // 2. Validate body
    const bodyValidation = createCommentarySchema.safeParse(req.body);
    if (!bodyValidation.success) {
        return res.status(400).json({
            error: "Invalid payload",
            details: bodyValidation.error.issues,
        });
    }

    const { id: matchId } = paramsValidation.data;

    try {
        // 3. Insert into MongoDB
        const commentary = await CommentaryModel.create({
            matchId: new mongoose.Types.ObjectId(matchId),
            ...bodyValidation.data,
        });

        if (res.app.locals.broadcastCommentary) {
            res.app.locals.broadcastCommentary(
                String(commentary.matchId),
                commentary,
            );
        }

        // 4. Return response
        return res.status(201).json({
            message: "Commentary created successfully",
            commentary,
        });
    } catch (error) {
        console.error("CREATE COMMENTARY ERROR:", error);

        return res.status(500).json({
            error: "Error while creating commentary",
            details: error.message,
        });
    }
};

export const getCommentary = async (req, res) => {
    const DEFAULT_LIMIT = 100;
    const MAX_LIMIT = 100;
    // 1. Validate params
    const paramsValidation = matchIdParamSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        return res.status(400).json({
            error: "Invalid matchId",
            details: paramsValidation.error.issues,
        });
    }

    // 2. Validate query
    const queryValidation = listCommentaryQuerySchema.safeParse(req.query);
    if (!queryValidation.success) {
        return res.status(400).json({
            error: "Invalid query params",
            details: queryValidation.error.issues,
        });
    }

    const { id: matchId } = paramsValidation.data;

    // 3. Handle limit safely
    let limit = queryValidation.data.limit ?? DEFAULT_LIMIT;
    limit = Math.min(limit, MAX_LIMIT);

    try {
        // 4. Fetch commentary
        const commentary = await CommentaryModel.find({
            matchId: new mongoose.Types.ObjectId(matchId),
        })
            .sort({ createdAt: -1 }) // newest first
            .limit(limit)
            .lean(); // faster, no mongoose overhead

        // 5. Response
        return res.status(200).json({
            message: "Commentary fetched successfully",
            count: commentary.length,
            commentary,
        });
    } catch (error) {
        console.error("GET COMMENTARY ERROR:", error);

        return res.status(500).json({
            error: "Failed to fetch commentary",
            details: error.message,
        });
    }
};
