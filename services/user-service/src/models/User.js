import pool from "../config/db.js";

class User {
    static async createUser(userData) {
        const query = `
            INSERT INTO users (email, password, display_name, first_name, last_name)
            values ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await pool.query(query, [
            userData.email,
            userData.hashedPassword,
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
}

export default User;