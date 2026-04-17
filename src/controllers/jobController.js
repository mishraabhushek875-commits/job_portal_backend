import Job from '../models/job.js';
import SearchHistory from '../models/SearchHistory.js';

// ─── 1. JOB POST KARO ───
// POST /api/jobs
export const createJob = async (req, res) => {
  try {
    const { title, description, company, location, salary, jobType, skills } = req.body;

    const job = await Job.create({
      title,
      description,
      company,
      location,
      salary,
      jobType,
      //ye hum yha isliye kr rhe taki frotend se jo dsta aye vo clean aye shi format me convdrt hokr 
      skills: req.body.skills
  .split(',')
  .map(s => s.trim().toLowerCase()),
      recruiter: req.user.id, // logged in recruiter ka id
    });

    res.status(201).json({
      success: true,
      job,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── 2. SAARI JOBS DEKHO ───
// GET /api/jobs
export const getAllJobs = async (req, res) => {
  try {
    // Query params se filter lo
    const { keyword, location, jobType, skills } = req.query;

    // Filter object banao
    let filter = { status: 'open' };

    // Keyword search — title ya company mein
    if (keyword) {
// Title MEIN keyword hai YA company mein — dono check karo
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { company: { $regex: keyword, $options: 'i' } },
      ];
      // 'i' = case insensitive
// "React", "REACT", "react" — sab match karega
    }

    // Location filter
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // JobType filter
    if (jobType) {
      filter.jobType = jobType;
    }

    // Skills filter
    if (skills) {
  const skillArray = skills
    .split(',')
    .map(s => s.trim().toLowerCase());

  filter.skills = {
    $elemMatch: {
      $regex: skillArray.join('|'),
      $options: 'i'
    }
  };
}

    // Yeh block add karo getAllJobs mein
// Login hai aur keyword search kiya hai to history save karo
if (req.user && keyword) {
  SearchHistory.create({
    userId:   req.user.id,
    keyword:  keyword  || '',
    location: location || '',
    skills:   skills ? skills.split(',') : []
  })
  // .catch(() => {}) — agar save fail ho
  // to main search rukni nahi chahiye
}

    const jobs = await Job.find(filter)
      .populate('recruiter', 'name email') // recruiter ka naam aur email
      .sort({ createdAt: -1 }); // nayi jobs pehle

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── 3. EK JOB KI DETAIL ───
// GET /api/jobs/:id
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter', 'name email');


// job.recruiter = {
//   _id: "64f8a2b1...",
//   name: "Rahul Kumar",      ← aa gaya!
//   email: "rahul@gmail.com"  ← aa gaya!
// jab hum normal req.body krte hai tab  job.recruiter = "64f8a2b1c3d4e5f6a7b8c9d0" Sirf ID hai — naam kahan se laayein?

    if (!job) {
      return res.status(404).json({ message: 'Job nahi mili' });
    }

    res.status(200).json({
      success: true,
      job,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── 4. JOB UPDATE KARO ───
// PUT /api/jobs/:id
export const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job nahi mili' });
    }

    // Check karo — sirf us recruiter ne update karo jo job ka owner hai
    // MongoDB mein recruiter ObjectId hai
// req.user.id String hai
// Compare karne ke liye same type chahiye!
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Tumhe yeh job update karne ki permission nahi' });
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,         // updated document return karo
        runValidators: true, // schema validation chalao
      }
    );

    res.status(200).json({
      success: true,
      job,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── 5. JOB DELETE KARO ───
// DELETE /api/jobs/:id
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job nahi mili' });
    }

    // Check karo — sirf owner delete kar sake
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Tumhe yeh job delete karne ki permission nahi' });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job delete ho gayi',
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── 6. RECRUITER KI APNI JOBS ───
// GET /api/jobs/myjobs
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


