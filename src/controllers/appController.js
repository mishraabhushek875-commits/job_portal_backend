import Application from '../models/application.js';
import Job from '../models/job.js';
import User from '../models/user.js'; // ← ZAROORI: User import add kiya

import {      
  notifyNewApplication,
  notifyStatusChange,
} from '../services/notificationServices.js';
// Imports mein add karo
import {
  sendApplicationConfirmation,
  sendNewApplicationAlert,
  sendStatusUpdateEmail,
} from '../services/emailServices.js';


// ─── 1. JOB MEIN APPLY KARO ───
// POST /api/applications/:jobId
export const applyJob = async (req, res) => {
  try {
    const { coverLetter } = req.body;
    //req.body tab use krte hai jab hume data jo hai user se lena padta hai frontend se 
    const jobId = req.params.jobId;
    //req.params ka use tab krte hai jab url se koi data lena hota hai jaise id wagera 

    // 1. Job exist karti hai?
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job nahi mili' });
    }

    // 2. Job open hai?
    if (job.status === 'closed') {
      return res.status(400).json({ message: 'Yeh job closed hai' });
    }

    // 3. Recruiter apni job mein apply na kar sake
    if (job.recruiter.toString() === req.user.id) {
      return res.status(400).json({ message: 'Tum apni job mein apply nahi kar sakte' });
    }

    // 4. Pehle se apply kiya hai?
    const alreadyApplied = await Application.findOne({
      job: jobId,
      applicant: req.user.id,
    });
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Tum pehle se apply kar chuke ho' });
    }

    // 5. Application banao
    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
      coverLetter,
    });

    // 6. Populate karke response bhejo
    const populatedApp = await Application.findById(application._id)
      .populate('job', 'title company location')
      .populate('applicant', 'name email');

    // ─── Recruiter ko notify karo ← sockets ─── yha par user apply krega ar uska notification recruiter ko jayega 
    notifyNewApplication(
      job.recruiter.toString(),
      job.title,
      req.user.name
    );

    // ─── Email: Applicant ko confirmation ───
    await sendApplicationConfirmation(
      req.user.email,
      req.user.name,
      job.title,
      job.company
    );

    // ─── Email: Recruiter ko alert ───
    const recruiter = await User.findById(job.recruiter);
    if (recruiter) {
      await sendNewApplicationAlert(
        recruiter.email,
        recruiter.name,
        req.user.name,
        job.title
      );
    }

    res.status(201).json({
      success: true,
      message: 'Successfully apply kar diya!',
      application: populatedApp,
    });

  } catch (error) {
    // Duplicate apply ka error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Tum pehle se apply kar chuke ho' });
    }
    res.status(500).json({ message: error.message });
  }
};

// ─── 2. MERI APPLICATIONS DEKHO ───
// GET /api/applications/my
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company location salary jobType status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── 3. EK JOB KE SAARE APPLICATIONS ───
// GET /api/applications/job/:jobId
// Sirf recruiter dekh sakta hai
export const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    // Job exist karti hai?
    if (!job) {
      return res.status(404).json({ message: 'Job nahi mili' });
    }

    // Sirf us job ka recruiter dekh sake
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Permission nahi hai' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email')
      .populate('job', 'title company')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── 4. APPLICATION STATUS UPDATE KARO ───
// PUT /api/applications/:id
// Sirf recruiter status change kar sakta hai
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Valid status hai?
    const validStatus = ['pending', 'reviewed', 'shortlisted', 'rejected'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id)
      .populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application nahi mili' });
    }

    // Sirf us job ka recruiter status change kar sake
    if (application.job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Permission nahi hai' });
    }

    application.status = status;
    await application.save();

    /*
    // Status update mein save() use kiya kyunki:
    application.status = status;
    await application.save(); // pre save hooks chalenge

    // findByIdAndUpdate mein hooks nahi chalte!
    // Isliye jab bhi hooks chahiye → save() use karo
    */

    // ─── Applicant ko notify karo ← sockets ───
    notifyStatusChange(
      application.applicant.toString(),
      application.job.title,
      status
    );

    // ─── Email: Applicant ko status update email ───
    const applicant = await User.findById(application.applicant);
    if (applicant) {
      await sendStatusUpdateEmail(
        applicant.email,
        applicant.name,
        application.job.title,
        status
      );
    }

    res.status(200).json({
      success: true,
      message: `Status update ho gaya: ${status}`,
      application,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── 5. APPLICATION WITHDRAW KARO ───
// DELETE /api/applications/:id
export const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application nahi mili' });
    }

    // Sirf applicant withdraw kar sake
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Permission nahi hai' });
    }

    // Sirf pending application withdraw ho sake
    if (application.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Sirf pending application withdraw ho sakti hai' 
      });
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Application withdraw ho gayi',
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
### `error.code === 11000` kya hai?
MongoDB ka duplicate error code hai!
Compound index ne block kiya — same user same job mein dobara apply kiya
11000 = Duplicate Key Error
*/