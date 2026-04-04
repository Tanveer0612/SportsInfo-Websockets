import { MatchModel } from "../models/match.model.js";
import { getMatchStatus } from "../utils/matchStatus.js";
import { createMatchSchema, listMatchesQuerySchema } from "../validations/matches.schema.js"

export const createMatch = async (req, res) => {
    const validationResult = createMatchSchema.safeParse(req.body);
    if(!validationResult.success) {
        return res.status(400).json({error: "Invalid Payload", details: validationResult.error.issues})
    }

    const {startTime, endTime, homeScore, awayScore} = validationResult.data;
    try {
        const match = await MatchModel.create({
            ...validationResult.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(startTime, endTime) 
        })

        if(res.app.locals.broadcastMatchCreated) {
            res.app.locals.broadcastMatchCreated(match);
        }

        res.status(201).json({match, message: "Match Created Successfully"})
    } catch (error) {
        res.status(500).json({error: "Error while creating match", details: error.message})
    }
}

export const listMatches = async (req, res) => {
    const validationResult = listMatchesQuerySchema.safeParse(req.query);
    if( !validationResult.success ){
        return res.status(400).json({message:"Invalid query", details: validationResult.error.issues})
    }
    const MAX_LIMIT = 100;
    const limit = Math.min(validationResult.data.limit ?? 50, MAX_LIMIT);

    try {
        const matches = await  MatchModel.find().limit(limit).sort({createdAt: -1});
        return res.status(200).json({matches, message: "Matches Fetched successfully"});
    } catch (error) {
        return res.status(500).json({Error:"Error while fetching data", details:error.message})
    }
}