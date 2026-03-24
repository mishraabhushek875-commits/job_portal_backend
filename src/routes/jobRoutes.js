import express from 'express';

const router = express.Router();

import { createJob,getAllJobs,getJobById,updateJob,deleteJob,getMyJobs } from '../controllers/jobController.js';
import {protect,authorize} from '../middlewares/authMiddleware.js'

//public routes -bina login ke bhi dekh skte hai 
router.get('/',getAllJobs);
router.get('/:id',getJobById);

//protected routes-login zaroori
router.get('/myjobs', protect, authorize('recruiter'), getMyJobs);
router.post('/',protect,authorize('recruiter'),createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);


export default router;