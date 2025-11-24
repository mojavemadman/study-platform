import { Router } from "express";
import UserController from "../controllers/UserController.js";

const usersRouter = Router();

usersRouter.post("/register", UserController.registerUser);
usersRouter.post("/login", UserController.loginUser);
usersRouter.get("/health", (req, res) => res.sendStatus(200));
usersRouter.get("/profile", UserController.getUserProfile);
usersRouter.put("/profile", UserController.updateUserProfile);
usersRouter.delete("/", UserController.deleteUser);

export default usersRouter;