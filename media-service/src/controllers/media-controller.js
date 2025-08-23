const Media = require('../models/Media');
const logger= require('../utils/logger');
const { uploadMediaToCloudinary } = require('../utils/cloudinary');




const uploadMedia =async (req, res) => {
    logger.info('Upload media request received');
    try {
        const mediaFile = req.file; // Assuming file is uploaded using multer
        if (!mediaFile) {
            logger.warn('No media file uploaded');
            return res.status(400).json({ message: 'No media file uploaded' });
        }
        const {originalname, mimetype, buffer} = mediaFile;
        const userId = req.user.userId; // Get user ID from request object
        logger.info(`User ID: ${userId}, Original File Name: ${originalname}, MIME Type: ${mimetype}`);
        logger.info('Uploading media to Cloudinary...');
        const cloudinaryUploadResult = await uploadMediaToCloudinary(mediaFile);
        logger.info(`Media uploaded successfully to Cloudinary: ${cloudinaryUploadResult.public_Id}`);
        console.log(req.file);
        const newlyCreatedMedia= new Media({
            publicId: cloudinaryUploadResult.public_id,
            url: cloudinaryUploadResult.secure_url,
            originalName: originalname,
            userId: userId,
            mimeType: mimetype

        })
        await newlyCreatedMedia.save();
        logger.info('Media saved to database successfully');
        return res.status(201).json({
            message: 'Media uploaded successfully',
            mediaId: newlyCreatedMedia._id,
            url : newlyCreatedMedia.url
        });




    }
    catch (error) {
        logger.error('Error uploading media:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}


const getAllMedia = async (req, res) => {
    try{  
        const Result=await Media.find({});
        res.json({
            Result
        });


    }
    catch(error) {
        logger.error('Error fetching media:', error);
        return res.status(500).json({ message: 'Internal Server Error' });

    }
}
module.exports = { uploadMedia, getAllMedia };