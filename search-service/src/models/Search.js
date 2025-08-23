const mongoose = require('mongoose');

const searchPostSchema = new mongoose.Schema({
    postId: {
        type :String,
        required: true,
        unique: true    
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now   
    },

},{
    timestamps: true
}); 
searchPostSchema.index({ content: 'text' }); // Create a text index on the content field
searchPostSchema.index({ createdAt: -1 }); // Index for sorting by createdAt in descending order


const Search = mongoose.model('Search', searchPostSchema);
module.exports = Search;