import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// ─── Cloudinary Configure Karo ───
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Resume Storage ───
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'job-portal/resumes',  // Cloudinary mein folder
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw',          // PDF ke liye raw type
  },
});

// ─── Profile Photo Storage ───
const photoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'job-portal/photos',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }],
  },
});

// ─── File Size Check ───
const fileFilter = (req, file, cb) => {
  // Resume ke liye
  if (file.fieldname === 'resume') {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Sirf PDF ya DOC files allowed hain!'), false);
    }
  }

  // Photo ke liye
  if (file.fieldname === 'photo') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sirf image files allowed hain!'), false);
    }
  }
};

// ─── Multer Upload Objects ───
export const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter,
});

export const uploadPhoto = multer({
  storage: photoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter,
});

// ─── Cloudinary Se File Delete Karo ───
export const deleteFile = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`File deleted: ${publicId}`);
  } catch (error) {
    console.error(`Delete error: ${error.message}`);
  }
};