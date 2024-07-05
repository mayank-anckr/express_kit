import { verifyToken } from "../utils/jwt";

const jwt = require('jsonwebtoken');

const secretKey = 'your_secret_key';

const authenticateToken = (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    const user = verifyToken(token);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    req.user = user; // Save decoded user info to request object
    next(); // Proceed to the next middleware or route handler
};

export default authenticateToken;