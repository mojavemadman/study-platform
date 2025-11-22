import pool from "../config/db.js";
import bcrypt from "bcrypt"

class User {
    static async createUser(userData) {
        const query = `
            INSERT INTO users (email, password, display_name, first_name, last_name)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const result = await pool.query(query, [
            userData.email,
            hashedPassword,
            userData.displayName,
            userData.firstName,
            userData.lastName
        ]);
        return result.rows[0];
    }

    static async findUserByEmail(email) {
        const query = `SELECT * FROM users WHERE email = $1`;
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    static async updateLastLogin(userId) {
        const query = `
            UPDATE users
            SET last_login = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }
}

export default User;