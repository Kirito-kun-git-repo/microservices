

const jwt=require('jsonwebtoken');
const crypro =require('crypto');
const RefreshToken = require('../models/RefreshToken');



const generateToken = async (user) => {
    const accesstoken=jwt.sign({
        userId: user._id,
        username: user.username,
    }, process.env.JWT_SECRET, {
        expiresIn: '15m',
    })
    const refreshtoken=crypro.randomBytes(64).toString('hex');
    const expiresAt=new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); 

    await RefreshToken.create({
        token: refreshtoken,
        user: user._id,
        expiresAt,
    });
    return {accesstoken , refreshtoken};


}
module.exports=generateToken;