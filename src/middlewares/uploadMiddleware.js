import { uploadResume, uploadPhoto } from '../services/uploadServices.js';

// Resume upload middleware
export const resumeUpload = uploadResume.single('resume');

// Photo upload middleware
export const photoUpload = uploadPhoto.single('photo');

// Error handle karo
export const handleUploadError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};