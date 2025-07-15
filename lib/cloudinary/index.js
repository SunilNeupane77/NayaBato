import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload an image to Cloudinary
 * @param {Buffer|String} imageData - The image data as buffer or base64 string
 * @param {String} folder - The folder to upload to (optional)
 * @returns {Promise} - Cloudinary upload response
 */
export async function uploadImage(imageData, folder = 'nayabato/issues') {
  if (!imageData) return null;
  
  try {
    console.log('Uploading to Cloudinary...');
    
    // Use the dataURI method which accepts buffers
    return await new Promise((resolve, reject) => {
      const uploadOptions = {
        folder,
        resource_type: 'auto',
      };
      
      const uploadCallback = (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Image upload failed: ' + error.message));
        } else {
          resolve(result);
        }
      };
      
      // Check if imageData is a Buffer and handle accordingly
      if (Buffer.isBuffer(imageData)) {
        cloudinary.uploader.upload_stream(uploadOptions, uploadCallback).end(imageData);
      } else {
        // Handle string paths or data URIs
        cloudinary.uploader.upload(imageData, uploadOptions, uploadCallback);
      }
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Image upload failed: ' + error.message);
  }
}

/**
 * Delete an image from Cloudinary
 * @param {String} publicId - The public ID of the image
 * @returns {Promise} - Cloudinary delete response
 */
export async function deleteImage(publicId) {
  if (!publicId) return null;

  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Image deletion failed');
  }
}

/**
 * Get an optimized image URL using Cloudinary URL Gen
 * @param {String} publicId - The public ID of the image
 * @param {Object} options - Transformation options
 */
export function getImageUrl(publicId, options = {}) {
  if (!publicId) return '';
  
  const { width = 800, height, quality = 'auto', format = 'auto' } = options;
  
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality,
    format
  });
}

export default cloudinary;
