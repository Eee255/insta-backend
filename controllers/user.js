import { db } from '../index.js';

export const getUser = async (req, res) => {
    const userId = req.params.id;
    const q = "SELECT * FROM users WHERE userId = ?";

    try {
        const user = await db.get(q, [userId]);

        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        
        const { password, ...userInfo } = user;

        return res.status(200).json(userInfo);
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: 'Something went wrong!' });
    }
};
