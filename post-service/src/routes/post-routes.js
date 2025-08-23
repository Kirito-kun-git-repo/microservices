const express = require('express');
const router = express.Router();
const postController = require('../controllers/post-controller');
const {authenticateRequest} = require('../middleware/authMiddleware');

// middlleware  ->this will tell if user is authenticated or not
router.use(authenticateRequest);

// Route to create a new post
router.post('/create-posts', postController.createPost);

router.get('/all-posts', postController.getAllPosts);

router.get('/:id', postController.getPost);

router.delete('/:id', postController.deletePost);



module.exports = router;


