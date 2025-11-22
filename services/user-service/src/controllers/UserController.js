import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { validateEmail, validatePassword, validateRequiredFields } from "../utils/validation";

class UserController {
    static async registerUser(req, res) {
        try {
            const { email, password, firstName, lastName, displayName } = req.body;
            const userData = { email, password, firstName, lastName, displayName };
            
            //Validation
            const missing = validateRequiredFields(Object.values(req.body), Object.keys(req.body));
            
            if (missing) {
                return res.status(400).send({ error: `Missing required fields: ${missing.join(", ")}` });
            }

            if (!validateEmail(email)) {
                return res.status(400).send("Invalid email address");
            }

            if (!validatePassword(password)) {
                return res.status(400).send("Password did not meet security requirements")
            }

            if (await User.findUserByEmail(email).length > 0) {
                return res.status(400).send("Email already registered");
            }

            if (userData.displayName === undefined) userData.displayName = `firstName + lastName`; 

            const newUser = await User.createUser(userData);
            delete newUser.password;

            res.status(201).send(newUser)
        } catch (error) {
            console.error("Error creating user:", error);
            res.status(500).send({ error: "Internal server error" })
        }
    }
}