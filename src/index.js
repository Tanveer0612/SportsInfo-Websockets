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

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.error("Server error:", error);
        process.exit(1);
    })
    
    const PORT = process.env.PORT || 8080;

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });

})
.catch((error) => {
    console.log("MongoDB Connection failed !!!", error);
})