const express= require('express');
const router =express.Router();
const {registration,loginUser, refreshTokenUser,logoutUser}=require('../controllers/identitty-controller');



router.post('/register',registration)
router.post('/login',loginUser)
router.post('/refresh-token',refreshTokenUser);
router.post('/logout',logoutUser);

module.exports = router;