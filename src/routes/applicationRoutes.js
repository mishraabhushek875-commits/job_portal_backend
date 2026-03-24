import express from 'express';
import {
  applyJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/appController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Jobseeker routes
router.post('/:jobId', protect, authorize('jobseeker'), applyJob);
router.get('/my', protect, authorize('jobseeker'), getMyApplications);
router.delete('/:id', protect, authorize('jobseeker'), withdrawApplication);

// Recruiter routes
router.get('/job/:jobId', protect, authorize('recruiter'), getJobApplications);
router.put('/:id', protect, authorize('recruiter'), updateApplicationStatus);

export default router