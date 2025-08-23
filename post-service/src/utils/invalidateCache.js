const logger = require('../utils/logger');
const redis = require('redis');

// Function to invalidate cache for posts
// This function can be called after creating or updating a post
// to ensure that the cache is cleared and fresh data is fetched next time. 




const invalidateCache = async (req,input) => {
    const cachedKey=`post:${input}`;
    await req.redisClient.del(cachedKey);
    const keys=await req.redisClient.keys("posts:*");
    if(keys.length > 0) {
        await req.redisClient.del(keys);
        logger.info(`Cache invalidated for keys: ${keys.join(', ')}`);
    }

}
module.exports = invalidateCache;