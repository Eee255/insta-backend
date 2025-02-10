import { db } from '../index.js';
import jwt from "jsonwebtoken";

// 1️⃣ Get Followers for a User
export const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;

        const query = `
            SELECT followerId
            FROM relationships
            WHERE followingId = ?
        `;

        const followers = await db.all(query, [userId]);

        return res.status(200).json(followers);
    } catch (err) {
        console.error("Error fetching followers:", err);
        return res.status(500).json({ message: "Something went wrong!" });
    }
};

// get following
export const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;

        const query = `
            SELECT followingId
            FROM relationships
            WHERE followerId = ?
        `;

        const following = await db.all(query, [userId]);

        return res.status(200).json(following);
    } catch (err) {
        console.error("Error fetching following list:", err);
        return res.status(500).json({ message: "Something went wrong!" });
    }
};



// 2️⃣ Follow a User
export const followUser = async (req, res) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) return res.status(401).json({ message: "Not logged in!" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");

        const { followingId } = req.body;

        if (decoded.id === followingId) {
            return res.status(400).json({ message: "You cannot follow yourself!" });
        }

        const existingRelationship = await db.get(`
            SELECT * FROM relationships
            WHERE followerId = ? AND followingId = ?
        `, [decoded.id, followingId]);

        if (existingRelationship) {
            return res.status(400).json({ message: "Already following this user!" });
        }

        await db.run(`
            INSERT INTO relationships (followerId, followingId)
            VALUES (?, ?)
        `, [decoded.id, followingId]);

        return res.status(200).json({ message: "User followed!" });

    } catch (err) {
        console.error("Error following user:", err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: "Token is invalid!" });
        }
        return res.status(500).json({ message: "Something went wrong!" });
    }
};

// 3️⃣ Unfollow a User
export const unfollowUser = async (req, res) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) return res.status(401).json({ message: "Not logged in!" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");

        const { followingId } = req.params;

        const relationship = await db.get(`
            SELECT * FROM relationships
            WHERE followerId = ? AND followingId = ?
        `, [decoded.id, followingId]);

        if (!relationship) {
            return res.status(404).json({ message: "You are not following this user!" });
        }

        await db.run(`
            DELETE FROM relationships
            WHERE followerId = ? AND followingId = ?
        `, [decoded.id, followingId]);

        return res.status(200).json({ message: "User unfollowed!" });

    } catch (err) {
        console.error("Error unfollowing user:", err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: "Token is invalid!" });
        }
        return res.status(500).json({ message: "Something went wrong!" });
    }
};
