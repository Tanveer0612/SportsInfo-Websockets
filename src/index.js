import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./db/db.js";
import http from 'http'
import { attachWebsocketServer } from "./ws/server.js";

const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.get('/', (req, res) => {
    res.send("Hello From express server!");
})

import matchRouter from "./routes/match.routes.js";
app.use("/api/v1/match", matchRouter);


const {broadcastMatchCreated} =  attachWebsocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

connectDB()
.then(() => {
    
    const PORT = process.env.PORT || 8080;
    const HOST = process.env.HOST || '0.0.0.0';

    server.listen(PORT, HOST, () => {
        const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://:${HOST}:${PORT}`
        console.log(`Server running at ${baseUrl}`);
        console.log(`Websocket server is running on ${baseUrl.replace('http', 'ws')}/ws`)
    });
    
    server.on("error", (error) => {
        console.error("Server error:", error);
        process.exit(1);
    })
})
.catch((error) => {
    console.log("MongoDB Connection failed !!!", error);
})
