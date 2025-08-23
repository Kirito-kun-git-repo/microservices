const mongoose = require('mongoose');
const argon2 = require('argon2');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
   
    


},
{
    timestamps: true,

}
);
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        try {
            this.password = await argon2.hash(this.password);
        } catch (err) {
            return next(err);
        }
    }
    next();
});
userSchema.methods.comparePassword = async function(password) {
    try {
        return await argon2.verify(this.password, password);
    } catch (err) {
        throw new Error('Password comparison failed');
    }   
};
userSchema.index({username: 'text'});

const User = mongoose.model('User', userSchema);
module.exports = User;