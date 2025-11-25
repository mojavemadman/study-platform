import express from "express";
import Group from "../models/Group.js";

class GroupController {
    //==========================================================================//
    //============================= Group Functions ============================//
    static async createGroup(req, res) {
        try {
            const userId = req.headers["x-user-id"];
            const { groupName } = req.body;
            const invitePolicy = req.body.invitePolicy || 'admin_only'

            const group = await Group().createGroup(groupName, userId, invitePolicy)
            res.status(201).send(group);
        } catch (error) {
            console.error("Error creating group:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    }

    static async getGroup(req, res) {
        try {
            const { groupId } = req.body;
            const group = await Group.getGroup(groupId);

            if (!group) {
                return res.status(404).send({ error: "Group not found" });
            }

            res.status(200).send(group);
        } catch (error) {
            console.error("Error getting group:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    }

    static async getGroupMembers(req, res) {
        try {
            const groupId = req.body.groupId;
            const groupMembers = await Group.getGroupMembers(groupId);

            if (!groupMembers) {
                return res.status(404).send({ error: "Group members not found" });
            }

            res.status(200).send(groupMembers);
        } catch (error) {
            console.error("Error getting group members:", error);
            res.status(500).send({ error: "Internal server error"});
        }
    }

    static async getGroupsByUserId(req, res) {
        try {
            const userId = req.headers["x-user-id"];

            const userGroups = await Group.getGroupsByUserId(userId);

            if (!userGroups) {
                return res.status(404).send({ error: "Groups not found" });
            }

            res.status(200).send(userGroups);
        } catch (error) {
            console.error("Error getting user's groups:", error);
            return res.status(500).send({ error: "Internal server error" });
        }
    }

    static async updateGroupActivity(req, res) {
        try {
            const { groupId } = req.body;
            const group = await Group.updateActivity(groupId);

            if (!group) {
                return res.status(404).send({ error: "Group not found" });
            }
            
            res.status(200).send(group);
        } catch (error) {
            console.error("Error updating group activity:", error);
            res.status(500).send({ error: "Internal server error" });   
        }
    }

    static async deleteGroup(req, res) {
        try {
            const { userId } = req.headers["x-user-id"];
            const { groupId } = req.body;

            // Check if requesting user is group admin
            const groupMembers = await Group.getGroupMembers(groupId);
            const requesterIsAdmin = groupMembers.filter(member => member.user_id === userId).is_admin;

            if (!requesterIsAdmin) {
                return res.status(401).send({ error: "Action not authorized"})
            }

            const deletedGroup = await Group.deleteGroup(groupId);

            if (!deletedGroup) {
                return res.status(404).send({ error: "Group not found" });
            }

            res.status(200).send(deletedGroup);
        } catch (error) {
            console.error("Error deleting group:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    }

    //============================================================================//
    //=========================== Group Member Functions =========================//
    static async leaveGroup(req, res) {
        try {
            const userId = req.headers["x-user-id"];
            const { groupId } = req.body;

            const groupLeftFrom = await Group.leaveGroup(groupId, userId);

            if (!groupLeftFrom) {
                return res.status(404).send({ error: "Group not found" });
            }

            const remainingMembers = await Group.getGroupMembers(groupId);
            
            if (!remainingMembers) {
                await Group.deleteGroup(groupId);
                return res.status(200).send({ 
                    result: "Group deleted due to no remaining members",
                    group: groupLeftFrom
                });
            }

            res.status(204).send();
        } catch (error) {
            console.error("Error deleting user from group:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    }

    static async removeMember(req, res) {
        try {
            const userId = req.header["x-user-id"];
            const { groupId, targetUserId } = req.body;
            
            //Check if requesting member is admin
            const requester = await Group.getGroupMembers(inviteData.groupId)
                .filter(member => member.user_id === requesterId);
            const isAdmin = requester.is_admin;

            if (!isAdmin) {
                return res.status(401).send({ error: "Action not authorized" });
            }

            const removedUser = await Group.leaveGroup(groupId, targetUserId);

            if (!removedUser) {
                return res.status(404).send({ error: "Group member not found" });
            }

            res.status(200).send(removedUser)
        } catch (error) {
            console.error("Error removing member:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    }

    static async changeAdminStatus(req, res) {
        try {
            const requesterId = req.headers["x-user-id"];
            const { adminStatus, groupId, targetUserId } = req.body;

            // Check if requesting member is admin
            const requester = await Group.getGroupMembers(inviteData.groupId)
                .filter(member => member.user_id === requesterId);
            const isAdmin = requester.is_admin;

            if (!isAdmin) {
                return res.status(401).send({ error: "Action not authorized" });
            }

            const newAdmin = await Group.changeAdminStatus(groupId, targetUserId, adminStatus);

            if (!newAdmin) {
                return res.status(404).send({ error: "User not found" });
            }

            res.status(200).send(newAdmin);
        } catch (error) {
            console.error("Error updating admin status:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    }

    //============================================================================//
    //=========================== Invitation Functions ===========================//
        static async acceptInvite(req, res) {
        try {
            const { invitationId, email } = req.body;
            const acceptedInvite = await Group.acceptInvite(invitationId, email);

            if (!acceptedInvite) {
                return res.status(404).send({ error: "Invite not found" });
            }

            res.status(204).send();
        } catch (error) {
            console.error("Error accepting invite:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    }

    static async sendInvite(req, res) {
        try {
            const userId = req.headers["x-user-id"];
            const { inviteData } = req.body;
            const invitePolicy = await Group.getGroup(inviteData.groupId).invite_policy

            // Check policy; if admin_only, ensure user is admin 
            if (invitePolicy === "admin_only") {
                const user = await Group.getGroupMembers(inviteData.groupId)
                .filter(member => member.user_id === userId);
                const isAdmin = user.is_admin;
                
                if (!isAdmin) {
                    return res.status(401).send({ error: "Action not authorized" });
                }
            }

            const invite = await Group.sendInvite(inviteData);
            return res.status(200).send(invite);
        } catch (error) {
            console.error("Error sending invite:", error);
            res.status(500).send({ error: "Internal server error" })
        }
    }
}

const router = express.Router();