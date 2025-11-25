import pool from "../config/db.js";

class Group {
    static async createGroup(groupName, creatorId, invitePolicy = 'admin_only') {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            //Create group
            const groupResult = await client.query(`
                INSERT INTO groups (name, created_by)
                VALUES ($1, $2, $3)
                RETURNING *
            `, [groupName, creatorId, invitePolicy]);
            
            const group = groupResult.rows[0];

            //Add creator as admin member
            await client.query(`
                INSERT INTO group_members (group_id, user_id, is_admin)
                VALUES ($1, $2, true)
                `, [group.id, createdBy]);

            await client.query('COMMIT');
            return group;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getGroup(groupId) {
        const query = ` 
            SELECT *
            FROM groups
            WHERE id = $1
        `;
        const result = await pool.query(query, [groupId]);
        return result.rows[0];
    }

    static async getGroupsByUserId(userId) {
        const query = `
            SELECT 
                g.id, 
                g.name, 
                g.invite_policy, 
                g.last_active, 
                gm.is_admin
            FROM groups g
            JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = $1
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    static async getGroupMembers(groupId) {
        const query = `
            SELECT user_id 
            FROM group_members 
            WHERE group_id = $1
        `;
        const result = await pool.query(query, [groupId]);
        return result.rows;
    }

    static async updateActivity(groupId) {
        const query = `
            UPDATE groups 
            SET last_active = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
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

    static async changeAdminStatus(groupId, userId, adminStatus) {
        const query = `
            UPDATE group_members
            SET is_admin = $3
            WHERE group_id = $1 AND user_id = $2
            RETURNING *
        `;
        const result = await pool.query(query, [groupId, userId, adminStatus]);
        return result.rows[0];
    }

    static async sendInvite(invite) {
        const query = `
            INSERT INTO invitations (group_id, invitor, invitee, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await pool.query(query, [
            invite.groupId,
            invite.invitorId,
            invite.email,
            invite.message
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