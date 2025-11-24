import pool from "../config/db.js";

class Group {
    static async createGroup(groupName, creatorId) {
        const query = `
            INSERT INTO groups (name, created_by)
            VALUES ($1, $2)
            RETURNING *
        `;
        const result = await pool.query(query, [ groupName, creatorId]);
        return result.rows[0];
    }

    static async updateActivity(groupId) {
        const query= `
            UPDATE groups 
            SET last_active = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *1
        `;
        const result = await pool.query(query, [groupId]);
        return result.rows[0];
    }

    static async deleteGroup(groupId) {
        const query = `DELETE FROM groups WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [groupId]);
        return result.rows[0]
    }

    static async leaveGroup(groupId, userId) {
        const query = `
            DELETE FROM group_members
            WHERE group_id = $1 AND user_id = $2
            RETURNING *
        `;
        const result = await pool.query(query, [groupId, userId]);
        return result.rows[0];
    }

    static async assignAdmin(groupId, userId) {
        const query = `
            UPDATE group_members
            SET is_admin = true
            WHERE group_id = $1 AND user_id = $2
            RETURNING *
        `;
        const result = await pool.query(query, [groupId, userId]);
        return result.rows[0];
    }

    static async sendInvite(invitationData) {
        const query = `
            INSERT INTO invitations (group_id, invitor, invitee, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await pool.query(query, [
            invitationData.groupId,
            invitationData.invitorId,
            invitationData.email,
            invitationData.message
        ]);
        return result.rows[0];
    } 

    static async acceptInvite(invitationId, email) {
        const query = `
            UPDATE invitations
            SET status = 'accepted'
            WHERE id = $1 AND invitee = $2
            RETURNING *
        `;
        const result = await pool.query(query, [invitationId, email]);
        return result.rows[0];
    }
}

export default Group;