const logger =require('../utils/logger');
const Post = require('../models/Post'); // Assuming you have a Post model defined
const { validatePost } = require('../utils/validation');
const invalidateCache = require('../utils/invalidateCache');
const { publishEvent } = require('../utils/rabbitmq'); // Import the RabbitMQ utility 
//function to create a new post
const createPost= async( req, res) => {
    logger.info('Received request to create a post');
    try{
        // logger.info('Create post request received:', req.body);

        // Validate the request body
        const { error } = validatePost(req.body);
        if (error) {
            logger.warn('Validation error:', error.details[0].message);
            return res.status(400).json({ message: error.details[0].message });
        }
        const {content, mediaIds } = req.body;
        const newPost = new   Post({
            user : req.user.userId, // Assuming user ID is stored in req.user
            content,
            mediaIds : mediaIds || []
        });
        await newPost.save();
        await publishEvent('post.created',{
            postId:newPost._id.toString(),
            userId:req.user.userId.toString(), // Assuming user ID is stored in req.user
            content:newPost.content,
            createdAt:newPost.createdAt,
        })
        await invalidateCache(req,newPost._id.toString()); // Invalidate cache after creating a post
        logger.info('Post created successfully:', newPost);
        res.status(201).json({ message: 'Post created successfully', post: newPost });

    }
    catch(error) {
        logger.error('Error creating post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Function to get all posts
const getAllPosts= async( req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;  

        const cacheKey = `posts:${page}:${limit}`;
        const cachedPosts=await req.redisClient.get(cacheKey);

        if(cachedPosts) {
            logger.info('Posts fetched from cache');
            return res.status(200).json(JSON.parse(cachedPosts));
        }
        const posts= await Post.find({})
                                .sort({createdAt: -1})
                                .skip(startIndex)
                                .limit(limit);

        const totalNoOfPosts = await Post.countDocuments();
        const result ={
            posts,
            currentPage: page,
            totalPages: Math.ceil(totalNoOfPosts / limit),
            totalPosts: totalNoOfPosts

        }
        //save your posts in redis cache
        await req.redisClient.set(cacheKey, JSON.stringify(posts), {
            EX: 3600 // expiry in seconds
        });

        logger.info('Posts fetched from database');
        res.status(200).json(result);




    }
    catch(error) {
        logger.error('Error getting All posts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Function to get a post by ID
const getPost =  async (req,res)=>{
    logger.info('Received request to get a post by ID:', req.params.id);
    try{
        const postId = req.params.id;
        // const page= parseInt(req.query.page) || 1;
        // const limit = parseInt(req.query.limit) || 10;
        // const startIndex = (page - 1) * limit;

        const cacheKey=`post:${postId}`;
        const cachedPost = await req.redisClient.get(cacheKey);
        if(cachedPost) {
            logger.info('Post fetched from cache');
            return res.status(200).json(JSON.parse(cachedPost));
        }
        const post = await  Post.findById(postId);
        if(!post) {
            logger.warn('Post not found:', postId);
            return res.status(404).json({ message: 'Post not found' });
        }
        //save your post in redis cache
        await req.redisClient.set(cacheKey, JSON.stringify(post), {
            EX: 3600 // expiry in seconds
        });
        logger.info('Post fetched from database:', postId);
        res.status(200).json(post); 

    }
    catch(error) {
        logger.error('Error getting post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

//function to delete a post
const deletePost = async (req, res) => {
    logger.info('Received request to delete a post:', req.params.id);
    try{
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if(!post) {
            logger.warn('Post not found:', postId);
            return res.status(404).json({ message: 'Post not found' });
        }
        await Post.findByIdAndDelete(postId);
         


        //publish post delete method->

        await publishEvent('post.deleted',{
            postId: post._id.toString(),
            userId: req.user.userId, // Assuming user ID is stored in req.user
            mediaIds: post.mediaIds || [] 
        })

        await invalidateCache(req, postId);
        res.status(200).json({ message: 'Post deleted successfully' });
        logger.info('Post deleted successfully:', postId);
    }
    catch(error) {
        logger.error('Error deleting post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    createPost,
    getAllPosts,
    getPost,
    deletePost
}