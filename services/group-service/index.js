import dotenv from "dotenv";
import pool from "./src/config/db.js";
import express from "express";
import morgan from "morgan";
import groupRouter from "./src/routes/groups-routes.js"

dotenv.config();

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use("/group", groupRouter);

const PORT = process.env.PORT;

app.listen(PORT, async () => {
    console.log(`Group service running on http://localhost:${PORT}`);

    try {
        await pool.query("SELECT NOW()");
        console.log("Database connected succesfully");
    } catch (error) {
        console.error("Error connecting to database:", error)
    }
});