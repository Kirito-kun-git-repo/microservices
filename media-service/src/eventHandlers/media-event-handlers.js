const { deleteMediaFromCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");
const Media = require("../models/Media");





const handlePostDeleted = async (event) => {
    console.log('Post deleted event received:', event);
    const { postId, mediaIds } = event;
    try{
        const mediaToDelete= await Media.find({_id: { $in: mediaIds } });
        for(const media of mediaToDelete){
            await deleteMediaFromCloudinary(media.publicId);
            await Media.deleteOne({ _id: media._id });
            logger.info(`Media with ID ${media._id} deleted successfully associated with post ID ${postId}`);

        }
        logger.info(`All media associated with post ID ${postId} deleted successfully`);


    }catch(error){
        logger.error('Error while deleting media', error);

    }

}
module.exports = {
    handlePostDeleted
};