const logger = require('../utils/logger');



const authenticateRequest = async (req, res, next) => {
   

    try{
            const userId= req.headers['x-user-id']; // Assuming user ID is sent in headers
            if (!userId) {
                logger.warn(`Acces attempted without user ID`);
                return res.status(401).json({ message: 'Authentication required ! Please Login to continue' });
            }

            req.user = { userId }; // Attach user ID to request object
            logger.info(`User authenticated with ID: ${userId}`);
            next();

    }
    catch(error) {
        logger.error('Authentication error:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};
module.exports = {authenticateRequest};