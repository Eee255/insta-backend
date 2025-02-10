import { db } from '../index.js';
import jwt from "jsonwebtoken";
import moment from "moment";

export const getComments = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT c.*, u.userId, u.name, u.profilePic
            FROM comments AS c
            JOIN users AS u ON u.userId = c.commentUserId
            WHERE c.commentPostId = ?
            ORDER BY c.createdAt DESC
        `;

        const comments = await db.all(query, [id]);

        return res.status(200).json(comments);
    } catch (err) {
       
        return res.status(500).json({ message: "Something went wrong!" });
    }
};


export const addComment = async (req, res) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) return res.status(401).json({ message: "Not logged in!" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");

        const query = `
            INSERT INTO comments (commentDesc, createdAt, commentUserId, commentPostId)
            VALUES (?, ?, ?, ?)
        `;

        const values = [
            req.body.commentDesc,
            moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            decoded.id,
            req.body.commentPostId
        ];

        await db.run(query, values);

        return res.status(200).json({ message: "Comment has been added!" });

    } catch (err) {
       
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: "Token is invalid!" });
        }
        return res.status(500).json({ message: "Something went wrong!" });
    }
};

// 3️⃣ Delete Comment
export const deleteComment = async (req, res) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) return res.status(401).json({ message: "Not logged in!" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
        const loggedInUserId = decoded.id;
        const commentId = req.params.id;

        const comment = await db.get(`
            SELECT * FROM comments
            WHERE commentId = ? AND commentUserId = ?
        `, [commentId, loggedInUserId]);

        if (!comment) {
            return res.status(403).json({ message: "You can only delete your own comments!" });
        }

        await db.run("DELETE FROM comments WHERE commentId = ?", [commentId]);

        return res.status(200).json({ message: "Comment has been deleted!" });
    } catch (err) {
      
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: "Token is invalid!" });
        }
        return res.status(500).json({ message: "Something went wrong!" });
    }
};
