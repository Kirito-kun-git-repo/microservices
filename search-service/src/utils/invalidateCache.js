const logger = require('../utils/logger');
const redis = require('redis');

// Function to invalidate cache for posts
// This function can be called after creating or updating a post
// to ensure that the cache is cleared and fresh data is fetched next time. 




const invalidateCache = async (redisClient,input) => {
    // const cachedKey=`post:${input}`;
    // await req.redisClient.del(cachedKey);
    const keys=await redisClient.keys("*:*:*");
    if(keys.length > 0) {
        await redisClient.del(keys);
        logger.info(`Cache invalidated for keys: ${keys.join(', ')}`);
    }

}
module.exports = invalidateCache;