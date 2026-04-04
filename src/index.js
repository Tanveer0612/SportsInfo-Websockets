import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./db/db.js";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.get('/', (req, res) => {
    res.send("Hello From express server!");
})

import matchRouter from "./routes/match.routes.js";

app.use("/api/v1/match", matchRouter);

connectDB()
.then(() => {
    
    const PORT = process.env.PORT || 8080;
    
    const server = app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
    
    server.on("error", (error) => {
        console.error("Server error:", error);
        process.exit(1);
    })
})
.catch((error) => {
    console.log("MongoDB Connection failed !!!", error);
})
