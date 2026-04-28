const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (filepath) => {
    try {
        const result = await cloudinary.uploader.upload(filepath, {
            folder: "uploads"
        });

        return {
            url: result.secure_url,
            publicId: result.public_id
        };

    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
};

module.exports = { uploadToCloudinary };