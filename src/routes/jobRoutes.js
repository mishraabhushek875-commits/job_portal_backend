import express from 'express';

const router = express.Router();

import { createJob,getAllJobs,getJobById,updateJob,deleteJob,getMyJobs } from '../controllers/jobController.js';
import {protect,authorize} from '../middlewares/authMiddleware.js'

// NEW — recommendations ke liye import
import { getRecommendations } from '../ai/recommendations/jobRecommender.js';

//public routes -bina login ke bhi dekh skte hai 
router.get('/',getAllJobs);
router.get('/:id',getJobById);

//protected routes-login zaroori
router.get('/myjobs', protect, authorize('recruiter'), getMyJobs);
router.post('/',protect,authorize('recruiter'),createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);


// AI Recommendations — login zaroori
router.get('/ai/recommendations', protect, async (req, res) => {
  try {
    const recommendations = await getRecommendations(req.user.id);

    if (recommendations.length === 0) {
      return res.json({
        success: true,
        message: 'Pehle kuch jobs search karo — phir recommendations aayengi!',
        recommendations: []
      });
    }

    res.json({ success: true, recommendations });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}); 

export default router;