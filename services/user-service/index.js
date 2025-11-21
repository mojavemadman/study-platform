import dotenv from "dotenv";
dotenv.config();
import pool from "./src/config/db.js";
import express from "express";
import morgan from "morgan";
import usersRouter from "./src/routes/users-routes.js"

const app = express();

app.use(express.json())
app.use(morgan("dev"));
app.use("/users", usersRouter);

const PORT = process.env.PORT;

app.listen(PORT, async () => {
    console.log(`User service running on http://localhost:${PORT}`);

    //Test database connection
    try {
        await pool.query("SELECT NOW()");
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", console.error);
    }
});