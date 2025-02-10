import { db } from '../index.js';
import jwt from "jsonwebtoken";
import moment from "moment";

export const getPosts = async (req, res) => {
    try {
        const postUserId  = req.body.profileId; 
        

        const token = req.cookies.accessToken;
        if (!token) return res.status(401).json({ message: "Not logged in!" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
        const loggedInUserId = decoded.id;

        let query;
        let values;

        if (postUserId) {
            query = `
                SELECT p.*, u.userId, u.name, u.profilePic 
                FROM posts AS p 
                JOIN users AS u ON u.userId = p.postUserId 
                WHERE p.postUserId = ? 
                ORDER BY p.createdAt DESC
            `;
            values = [postUserId];
        } else {
            query = `
                SELECT p.*, u.userId, u.name, u.profilePic
                FROM posts AS p
                JOIN users AS u ON u.userId = p.postUserId
                LEFT JOIN (
                    SELECT followingId
                    FROM relationships
                    WHERE followerId = ?
                    GROUP BY followingId
                ) AS r ON p.postUserId = r.followingId
                WHERE r.followingId IS NOT NULL OR p.postUserId = ?
                ORDER BY p.createdAt DESC;
            `;
            values = [loggedInUserId, loggedInUserId];
        }

        const posts = await db.all(query, values);

        return res.status(200).json(posts);

    } catch (err) {
        console.error("Error fetching posts:", err);

        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: "Token is invalid!" });
        }

        return res.status(500).json({ message: "Something went wrong!" });
    }
};



export const addPost = async (req, res) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) return res.status(401).json({ message: "Not logged in!" });

        const decoded = jwt.verify(token, "your_secret_key");

        const query = "INSERT INTO posts (`postDesc`, `postImg`, `createdAt`, `postUserId`) VALUES (?, ?, ?, ?)";

        const values = [
            req.body.postDesc,
            req.body.postImg,
            moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            decoded.id
        ];

        await db.run(query, values);

        return res.status(200).json({ message: "Post has been created!" });

    } catch (err) {
        console.error("Error adding post:", err);

        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: "Token is invalid!" });
        }
        
        return res.status(500).json({ message: "Something went wrong!" });
    }
};


export const deletePost = async (req, res) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) return res.status(401).json({ message: "Not logged in!" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
        const loggedInUserId = decoded.id;
        const postId = req.params.id;

        const post = await db.get("SELECT * FROM posts WHERE postId = ? AND postUserId = ?", [postId, loggedInUserId]);

        if (!post) {
            return res.status(403).json({ message: "You can only delete your own posts!" });
        }

        await db.run("DELETE FROM posts WHERE postId = ?", [postId]);

        return res.status(200).json({ message: "Post has been deleted!" });
    } catch (err) {
        console.error("Error deleting post:", err);

        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: "Token is invalid!" });
        }

        return res.status(500).json({ message: "Something went wrong!" });
    }
};