import jwt from 'jsonwebtoken';

export const checkAuth = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ isAuthenticated: false });

    jwt.verify(token, "your_secret_key", (err, user) => {
        if (err) return res.status(403).json({ isAuthenticated: false });
        return res.status(200).json({ isAuthenticated: true });
    });

}