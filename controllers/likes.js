import { db } from '../index.js';
import jwt from "jsonwebtoken";

// 1️⃣ Get Likes for a Post
export const getLikes = async (req, res) => {
    try {
        const { postId } = req.params;

    

        const query = `
            SELECT likeUserId
            FROM likes
            WHERE likePostId = ?
        `;

        const likes = await db.all(query, [postId]);

        return res.status(200).json(likes);
    } catch (err) {
        console.error("Error fetching likes:", err);
        return res.status(500).json({ message: "Something went wrong!" });
    }
};

// 2️⃣ Like a Post
export const likePost = async (req, res) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) return res.status(401).json({ message: "Not logged in!" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");

        const { postId } = req.body;

        const checkLike = await db.get(`
            SELECT * FROM likes
            WHERE likeUserId = ? AND likePostId = ?
        `, [decoded.id, postId]);

        if (checkLike) {
            return res.status(400).json({ message: "You have already liked this post!" });
        }

        await db.run(`
            INSERT INTO likes (likeUserId, likePostId)
            VALUES (?, ?)
        `, [decoded.id, postId]);

        return res.status(200).json({ message: "Post liked!" });

    } catch (err) {
        console.error("Error liking post:", err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: "Token is invalid!" });
        }
        return res.status(500).json({ message: "Something went wrong!" });
    }
};

// 3️⃣ Unlike a Post
export const unlikePost = async (req, res) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) return res.status(401).json({ message: "Not logged in!" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");

        const { postId } = req.params;

        const like = await db.get(`
            SELECT * FROM likes
            WHERE likeUserId = ? AND likePostId = ?
        `, [decoded.id, postId]);

        if (!like) {
            return res.status(404).json({ message: "Like not found!" });
        }

        await db.run(`
            DELETE FROM likes
            WHERE likeUserId = ? AND likePostId = ?
        `, [decoded.id, postId]);

        return res.status(200).json({ message: "Post unliked!" });

    } catch (err) {
        console.error("Error unliking post:", err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: "Token is invalid!" });
        }
        return res.status(500).json({ message: "Something went wrong!" });
    }
};
