import {
    pgTable,
    serial,
    text,
    integer,
    timestamp,
    pgEnum,
    jsonb,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

/**
 * ENUM: match_status
 */
export const matchStatusEnum = pgEnum("match_status", [
    "scheduled",
    "live",
    "finished",
]);

/**
 * TABLE: matches
 */
export const matches = pgTable("matches", {
    id: serial("id").primaryKey(),

    sport: text("sport").notNull(),

    homeTeam: text("home_team").notNull(),
    awayTeam: text("away_team").notNull(),

    status: matchStatusEnum("status").default("scheduled").notNull(),

    startTime: timestamp("start_time", { withTimezone: true }),
    endTime: timestamp("end_time", { withTimezone: true }),

    homeScore: integer("home_score").default(0).notNull(),
    awayScore: integer("away_score").default(0).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

/**
 * TABLE: commentary
 */
export const commentary = pgTable("commentary", {
    id: serial("id").primaryKey(),

    matchId: integer("match_id")
        .references(() => matches.id, { onDelete: "cascade" })
        .notNull(),

    minute: integer("minute"),
    sequence: integer("sequence").notNull(),

    period: text("period"), // e.g. "1st half", "2nd half", "OT"

    eventType: text("event_type"), // goal, foul, wicket, etc.
    actor: text("actor"), // player name
    team: text("team"), // which team

    message: text("message").notNull(),

    metadata: jsonb("metadata"), // extra structured data

    tags: text("tags").array(), // ["goal", "penalty"]

    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

/**
 * RELATIONS (important if you actually want to scale this)
 */
export const matchesRelations = relations(matches, ({ many }) => ({
    commentary: many(commentary),
}));

export const commentaryRelations = relations(commentary, ({ one }) => ({
    match: one(matches, {
        fields: [commentary.matchId],
        references: [matches.id],
    }),
}));
