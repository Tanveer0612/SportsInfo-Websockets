import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
    {
        sport: {
            type: String,
            required: true,
        },

        homeTeam: {
            type: String,
            required: true,
        },

        awayTeam: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["scheduled", "live", "finished"],
            default: "scheduled",
        },

        startTime: {
            type: Date,
        },

        endTime: {
            type: Date,
        },

        homeScore: {
            type: Number,
            default: 0,
        },

        awayScore: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true, // creates createdAt automatically
    },
);

export const MatchModel = mongoose.model("Match", matchSchema);
