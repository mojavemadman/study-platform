import pool from "../config/db.js";

class User {
    static async createUser(userData) {
        const query = `
            INSERT INTO users (email, password, display_name, first_name, last_name)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await pool.query(query, [
            userData.email,
            userData.password,
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

    static async findUserById(userId) {
        const query = `SELECT * FROM users WHERE id = $1`;
        const result = await pool.query(query, [userId]);
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

    static async updateUserProfile(updates, userId) {
        const query = `
            UPDATE users
            SET
                email = COALESCE($1, email),
                password = COALESCE($2, password),
                display_name = COALESCE($3, display_name),
                first_name = COALESCE($4, first_name),
                last_name = COALESCE($5, last_name)
            WHERE id = $6
            RETURNING *
        `;
        const result = await pool.query(query, [
            updates.email,
            updates.password,
            updates.displayName,
            updates.firstName,
            updates.lastName,
            userId
        ]);
        return result.rows[0];
    }

    static async deleteUser(userId) {
        const query = `DELETE FROM users WHERE id =$1 RETURNING *`;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }
}

export default User;