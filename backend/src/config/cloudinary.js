import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { ENV } from '../lib/env.js';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

// Configure Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine file type (image, video, or raw/document)
    let resource_type = 'raw';
    let folder = 'intervux_uploads/others';

    if (file.mimetype.startsWith('image/')) {
      resource_type = 'image';
      folder = 'intervux_uploads/images';
    } else if (file.mimetype.startsWith('video/')) {
      resource_type = 'video';
      folder = 'intervux_uploads/videos';
    } else if (file.mimetype === 'application/pdf') {
      resource_type = 'raw';
      folder = 'intervux_uploads/documents';
    }

    // Generate a unique filename using timestamp
    const cleanFileName = file.originalname
      .split('.')[0]
      .replace(/[^a-zA-Z0-9]/g, '_');
    const publicId = `${Date.now()}-${cleanFileName}`;

    return {
      folder: folder,
      resource_type: resource_type,
      public_id: publicId,
    };
  },
});

// Create Multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max limit (adjust as needed for videos)
  },
});

export { cloudinary, storage, upload };
