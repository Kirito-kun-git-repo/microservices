const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
require('dotenv').config();



const validateToken = (req,res,next) => {
    const authHeader = req.headers['authorization'];
    const token= authHeader && authHeader.split(' ')[1];
    if (!token) {
        logger.warn('Access attempted without valid token');
        return res.status(401).json({ message: 'Authentication required ! Please Login to continue' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            logger.error('Token validation failed:', err);
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user; 
        next();
    });

};
module.exports = { validateToken };