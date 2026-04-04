import mongoose from "mongoose";

const commentarySchema = new mongoose.Schema(
    {
        matchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Match",
            required: true,
        },

        minute: {
            type: Number,
        },

        sequence: {
            type: Number,
            required: true,
        },

        period: {
            type: String,
        },

        eventType: {
            type: String,
        },

        actor: {
            type: String,
        },

        team: {
            type: String,
        },

        message: {
            type: String,
            required: true,
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed, // flexible JSON
        },

        tags: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    },
);

export const CommentaryModel = mongoose.model("Commentary", commentarySchema);
