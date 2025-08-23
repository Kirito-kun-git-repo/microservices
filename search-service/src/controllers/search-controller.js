const logger = require("../utils/logger");
const Search=require('../models/Search');
require("dotenv").config();


// added redis caching here , so any search result that is searched by user will be stored in redis cache and it can be used again without hitting database.
const searchPostController = async (req, res) => {
    logger.info("Search endpoint called");
    try{
        //pagination setup 
        const page= parseInt(req.query.page) || 1;
        const limit=parseInt(req.query.limit)||10;
        const startIndex=(page-1)*limit;
        const {query}=req.query;

        const cachedKey=`${query}:${page}:${limit}}`;
        logger.info("Trying to get data from Redis Cache");
        let cachedSearch= await req.redisClient.get(cachedKey);
        if(cachedSearch){
            logger.info('Cache hit');
            return res.json(JSON.parse(cachedSearch));
        }
       logger.info('Cache miss');
       const searchResult=await Search.find({
               $text:{
                   $search: query
               } 
            },
            {
                score : {$meta:"textScore"}
            }
        ).sort({score:{ $meta :"textScore"}}).skip(startIndex).limit(10);
        logger.info("Getting the posts acco. to search query");
       const result ={
            searchResult,
            currentPage: page,
            // totalPages: Math.ceil(totalNoOfPosts / limit),
            // totalPosts: totalNoOfPosts

        }
        //save your posts in redis cache
        await req.redisClient.set(cachedKey, JSON.stringify(result), {
            EX: 3600 // expiry in seconds
        });



        // const {query} = req.query;
        // const results=await Search.find(
        //     {
        //        $text:{
        //            $search: query
        //        } 
        //     },
        //     {
        //         score : {$meta:"textScore"}
        //     }
        // ).sort({score:{ $meta :"textScore"}}).limit(10);
        res.json(result);

    }
    catch(err){
        logger.error(`Error while searching for post`,err);
        return res.status(500).json({message: err.message});
    }
};

module.exports={
    searchPostController,
}