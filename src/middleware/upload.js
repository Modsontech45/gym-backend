const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'yunfit/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' }],
  },
});

const postStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video');
    if (isVideo) {
      return {
        folder: 'yunfit/posts',
        resource_type: 'video',
        allowed_formats: ['mp4', 'webm', 'mov'],
        // Compress on ingest: scale to max 854×480, low quality, h264
        transformation: [
          { width: 854, height: 480, crop: 'limit', quality: 'auto:low', video_codec: 'auto' },
        ],
      };
    }
    return {
      folder: 'yunfit/posts',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      quality: 'auto',
      fetch_format: 'auto',
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (/^(image|video)\//.test(file.mimetype)) cb(null, true);
  else cb(new Error('Type de fichier non supporté'), false);
};

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadPost = multer({
  storage: postStorage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },  // 50 MB — videos max 30s stay well under
});

module.exports = { uploadAvatar, uploadPost, cloudinary };
