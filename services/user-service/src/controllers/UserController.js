import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validateEmail, validatePassword, validateRequiredFields } from "../utils/validation.js";

class UserController {
    static async registerUser(req, res) {
        try {
            const { email, password, firstName, lastName, displayName } = req.body;
            const userData = { email, password, firstName, lastName, displayName };
            
            //Validation
            const requiredFields = ["email", "password", "firstName", "lastName", "displayName"];
            const missing = validateRequiredFields(req.body, requiredFields);
            
            if (missing) {
                return res.status(400).send({ error: `Missing required fields: ${missing.join(", ")}` });
            }

            if (!validateEmail(email)) {
                return res.status(400).send("Invalid email address");
            }

            if (!validatePassword(password)) {
                return res.status(400).send("Password did not meet security requirements")
            }

            const existingUser = await User.findUserByEmail(email)
            if (existingUser) {
                return res.status(400).send("Email already registered");
            }

            userData.password = await bcrypt.hash(password, 10);
            const newUser = await User.createUser(userData);
            delete newUser.password;

            res.status(201).send(newUser)
        } catch (error) {
            console.error("Error creating user:", error);
            res.status(500).send({ error: "Internal server error" })
        }
    }

    static async loginUser(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findUserByEmail(email);
            
            //Check login credentials
            const isMatch = await bcrypt.compare(password, user.password);
            if (!user || !isMatch) {
                return res.status(401).send({ error: "Incorrect login credentials" });
            }

            //If credentials match, update last_login and issue JWT
            await User.updateLastLogin(user.id);

            const payload = {
                userId: user.id,
                email: user.email,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
                expiresIn: process.env.JWT_EXPIRY
            });
            delete user.password;
            res.status(200).send({ user, token });
        } catch (error) {
            console.error("Error logging in:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    }

    static async getUserProfile(req, res) {
        try {
            const user = await User.findUserById(req.headers["x-user-id"]);

            if (!user) {
                return res.status(404).send({ error: "User not found" });
            }

            delete user.password;
            res.status(200).send(user);
        } catch (error) {
            console.error("Error retrieving user profile:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    }

    static async updateUserProfile(req, res) {
        try {
            const userId = req.headers["x-user-id"];
            const { updates } = req.body;

            if (updates.password) {
                updates.password = await bcrypt.hash(updates.password, 10);
            }

            const user = await User.updateUserProfile(updates, userId);

            if (!user) {
                return res.status(404).send({ error: "User not found" })
            }

            delete user.password;
            res.status(200).send(user);
        } catch (error) {
            console.error("Error updating user profile:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    }

    static async deleteUser(req, res) {
        try {
            const userId = req.headers["x-user-id"];
            const { password } = req.body;

            const user = await User.findUserById(userId);
            if (!user) {
                return res.status(404).send({ error: "User not found" })
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).send({ error: "Request unauthorized" })
            }

            await User.deleteUser(userId);
            res.status(204).send()
        } catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    }
}

export default UserController;