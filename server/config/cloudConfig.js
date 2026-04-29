const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key:    process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Store files in memory, then stream to Cloudinary
const storage = multer.memoryStorage();

/**
 * Uploads a buffer to Cloudinary and returns the result.
 * @param {Buffer} buffer  - File buffer from multer memoryStorage
 * @param {string} folder  - Cloudinary folder name
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, folder = 'RentHub_MERN') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        allowed_formats: ['jpeg', 'png', 'jpg', 'webp'],
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

module.exports = { cloudinary, storage, uploadToCloudinary };
