
const logger=  require('../utils/logger');
const User = require('../models/User');
// const RefreshToken = require('../models/RefreshToken');
const {validateRegistration, validateLogin}=require('../utils/validation');
const generateToken = require('../utils/generateToken');
const RefreshToken = require('../models/RefreshToken');
const { log } = require('winston');

//user registration

const registration=async(req, res) => {
    logger.info('User registration started');
    try{
        const {error} = validateRegistration(req.body);
        if (error) {
            logger.warn('Validation error:', error.details[0].message);
            return res.status(400).json({ message: error.details[0].message });
        }

        const {email , password, username} = req.body;
        let user = await User.findOne({ $or: [{ email },{username}]});
        if(user){
             logger.warn('User Already Exist');
             return res.status(400).json({ message: "User Already Exist" });

        }
        user = new User({ email, password, username });
        await user.save();
        logger.warn('User Saved Successfully', user._id);
        const { accesstoken, refreshtoken}= await generateToken(user);
        res.status(201).json({
            message: "User Registered Successfully",
            accesstoken,
            refreshtoken,
        });




    }catch(err){
        logger.error('Error during registration:', err);
        res.status(500).json({ message: "Internal Server Error" });
       
       


    }
}

//user login
const loginUser =async (req,res) => {
    logger.info('User Login started');
    try{
        const {error} = validateLogin(req.body);
        if( error) {
            logger.warn('Validation error:', error.details[0].message);
            return res.status(400).json({ message: error.details[0].message });
        }
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            logger.warn('User Not Found');
            return res.status(404).json({ message: "User Not Found" });
        }
        //valid User checking password
        const isValidPassword = await user.comparePassword(password);
         if(!isValidPassword){
            logger.warn('Password is not valid');
            return res.status(404).json({ message: "Invalid Password" });
        }

        const {accesstoken,refreshtoken}=await generateToken(user);
        res.json({
            accesstoken,
            refreshtoken,
            user : user._id,
            message: "User Logged In Successfully"
        })


    }catch(err){
        logger.error('Error during login:', err);
        res.status(500).json({ message: "Internal Server Error" });

    }
}


//Refresh Token
const refreshTokenUser = async (req, res) => {
    logger.info('Refresh Token started');
    try { 
        const { refreshtoken } = req.body;
        if(!refreshtoken) {
            logger.warn('Refresh token is missing');
            return res.status(400).json({ message: "Refresh token is missing" });
        }

        const storedToken = await RefreshToken.findOne({  token :refreshtoken});
        if(!storedToken || storedToken.expiresAt <new Date()) {
            logger.warn('Invalid or expired refresh token');
            return res.status(400).json({ message: "Invalid or expired refresh token" });
        }
        const user= await User.findOne(storedToken.user);
        if(!user){
            logger.warn('User not found for the refresh token');
            return res.status(404).json({ message: "User not found" });
        }
        const { accesstoken :newAccesstoken, refreshtoken : newRefreshToken } = await generateToken(user);
         //delete the old token
        await RefreshToken.deleteOne({ _id: storedToken._id });

        res.json({
            accesstoken: newAccesstoken,
            refreshtoken: newRefreshToken,
            message: "Tokens refreshed successfully"
        })


    }catch (err) {
        logger.error('Error during refresh token:', err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}



//logout
const logoutUser=async (req,res)=>{
    logger.info('User logout Endpoint hit');
    try{

        const { refreshtoken } = req.body;
        if(!refreshtoken) {
            logger.warn('Refresh token is missing');
            return res.status(400).json({ message: "Refresh token is missing" });
        }
        await RefreshToken.deleteOne({ token: refreshtoken });
        logger.info('User logged out successfully');
        res.status(200).json({ message: "User logged out successfully" });

    }catch(err){
        logger.error('Error during logout:', err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


module.exports = {
    registration,
    loginUser,
    refreshTokenUser,
    logoutUser
};
