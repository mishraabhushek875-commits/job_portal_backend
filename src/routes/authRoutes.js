import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import {resumeUpload, photoUpload, handleUploadError } from '../middlewares/uploadMiddleware.js'
import User from '../models/user.js';


const router = express.Router();

//resume upload krne ke liye routes
router.post('/upload/resume',protect,resumeUpload,handleUploadError,
  async(req,res)=>{
    try{
const user=await User.findByIdAndUpdate(
  req.user.id,{
    resume:{
      url:req.file.path,
      publicId:req.file.filename
    },
  },
  {new:true}
).select('-password');

res.status(200).json({
        success: true,
        message: 'Resume upload ho gaya!',
        resume: user.resume,
      });

    }catch(error){
 res.status(500).json({ message: error.message });
    }
  }
);

//post or upload photo 
router.post('/upload/photo',protect,photoUpload,handleUploadError,
  async(req,res)=>{
    try{
const user=await User.findByIdAndUpdate(
  req.user.id,{
    photo:{
      url:req.file.path,
      publicId:req.file.filename,
    },
  },
  {new:true}
).select('-password');

 res.status(200).json({
        success: true,
        message: 'Photo upload ho gayi!',
        photo: user.photo,
      });
    }catch(error){
 res.status(500).json({ message: error.message });
    }
  }
);


router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

export default router;