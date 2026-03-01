import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pro-connect/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

export const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pro-connect/posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm'],
    resource_type: 'auto', // Support for both images and videos
  },
});

export default cloudinary;

export const deleteFromCloudinary = async (url, fileType) => {
    try {
        if (!url || !url.startsWith('http')) return;
        const parts = url.split('/');
        const lastPart = parts[parts.length - 1];
        const folderIndex = parts.indexOf('upload');
        if (folderIndex === -1) return;

        let folderPathArray = parts.slice(folderIndex + 1, parts.length - 1);
        if (folderPathArray.length > 0 && folderPathArray[0].startsWith('v') && !isNaN(folderPathArray[0].substring(1))) {
            folderPathArray.shift();
        }
        
        const folderPath = folderPathArray.join('/'); 
        const publicId = lastPart.split('.')[0];
        const fullPublicId = folderPath ? `${folderPath}/${publicId}` : publicId;
        
        const resourceType = ['mp4', 'webm', 'mov'].includes(fileType) ? 'video' : 'image';
        
        await cloudinary.uploader.destroy(fullPublicId, { resource_type: resourceType });
    } catch(err) {
        console.error("Cloudinary deletion error:", err);
    }
};
