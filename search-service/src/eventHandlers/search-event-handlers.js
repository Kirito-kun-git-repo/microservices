const logger = require("../utils/logger");
const Search=require('../models/Search');
const invalidateCache=require('../utils/invalidateCache');
const { createClient } = require('redis');

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect();



async function handlePostCreated(event){
    try{
        const newSearchPost=new Search({
            postId: event.postId,
            userId: event.userId,
            content: event.content,
            createdAt: event.createdAt


        })
        await newSearchPost.save();
        await invalidateCache(redisClient);
        logger.info(`New search post ${newSearchPost._id.toString()} created for Post ${newSearchPost.postId}`);



    }
    catch(err){
        logger.error("Error in handling post created event", err);
    }
}
async function handlePostDeleted(event){
    try{
        
        await Search.findOneAndDelete({postId:event.postId});
        await invalidateCache(redisClient);
        logger.info(`Search post with postId ${event.postId} deleted`);




    }
    catch(err){
        logger.error("Error in handling post deleted event", err);
    }
}

module.exports={handlePostCreated,handlePostDeleted};
    