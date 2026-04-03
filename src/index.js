import express from "express";

const app = express();
const port = 8000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello From express server!");
})

app.listen(port, () =>{
    console.log(`App is running at http://localhost:${port}`);
})