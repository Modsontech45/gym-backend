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
    folder: 'gympro/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' }],
  },
});

const postStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'gympro/posts',
    resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov'],
    quality: 'auto',
    fetch_format: file.mimetype.startsWith('video') ? undefined : 'auto',
  }),
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
  limits: { fileSize: 100 * 1024 * 1024 },
});

module.exports = { uploadAvatar, uploadPost, cloudinary };
