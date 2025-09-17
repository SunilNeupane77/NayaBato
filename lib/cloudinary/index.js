import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadImage(imageData, folder = 'nayabato/issues') {
  if (!imageData) return null;
  
  try {
    console.log('Uploading to Cloudinary...');
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
      
      if (Buffer.isBuffer(imageData)) {
        cloudinary.uploader.upload_stream(uploadOptions, uploadCallback).end(imageData);
      } else {
        cloudinary.uploader.upload(imageData, uploadOptions, uploadCallback);
      }
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Image upload failed: ' + error.message);
  }
}
// Delete an image by its public ID
export async function deleteImage(publicId) {
  if (!publicId) return null;

  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Image deletion failed');
  }
}
// Generate a URL for an image with optional transformations
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
