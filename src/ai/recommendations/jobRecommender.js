// src/ai/recommendations/jobRecommender.js

import Job from '../../models/job.js';
import SearchHistory from '../../models/SearchHistory.js';
import User from '../../models/user.js';

// FUNCTION 1: User ka context banao
async function buildUserContext(userId) {
  const [user, searches] = await Promise.all([
    User.findById(userId).select('skills location'),
    SearchHistory
      .find({ userId })
      .sort({ searchedAt: -1 })
      .limit(10)
  ]);

  const keywords  = new Set();
  const locations = new Set();

  searches.forEach(search => {
    if (search.keyword)  keywords.add(search.keyword.toLowerCase());
    if (search.location) locations.add(search.location.toLowerCase());
    search.skills.forEach(sk => keywords.add(sk.toLowerCase()));
  });

  if (user?.skills) {
    user.skills.forEach(sk => keywords.add(sk.toLowerCase()));
  }
  if (user?.location) {
    locations.add(user.location.toLowerCase());
  }

  return {
    keywords:   [...keywords],
    locations:  [...locations],
    userSkills: user?.skills || []
  };
}

// FUNCTION 2: Ek job ko score do (0-100)
function scoreJob(job, context) {
  let score = 0;

  // Keyword match — max 40 points
  const jobText = [
    job.title       || '',
    job.description || '',
    ...(job.skills  || [])
  ].join(' ').toLowerCase();

  let keywordHits = 0;
  context.keywords.forEach(kw => {
    if (jobText.includes(kw)) keywordHits++;
  });

  if (context.keywords.length > 0) {
    score += Math.min(
      (keywordHits / context.keywords.length) * 40, 40
    );
  }

  // Skills match — max 30 points
  const jobSkills = (job.skills || []).map(s => s.toLowerCase());
  let skillHits = 0;
  context.userSkills.forEach(sk => {
    if (jobSkills.includes(sk.toLowerCase())) skillHits++;
  });

  if (context.userSkills.length > 0) {
    score += Math.min(
      (skillHits / context.userSkills.length) * 30, 30
    );
  }

  // Location match — max 20 points
  const jobLocation = (job.location || '').toLowerCase();
  const locationMatched = context.locations.some(loc =>
    jobLocation.includes(loc)
  );
  if (locationMatched) score += 20;

  // Recency boost — max 10 points
  const ageInDays =
    (Date.now() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24);

  if      (ageInDays < 2)  score += 10;
  else if (ageInDays < 7)  score += 7;
  else if (ageInDays < 14) score += 4;
  else if (ageInDays < 30) score += 1;

  return Math.round(score);
}

// FUNCTION 3: Main function — route yahan se call karega
export async function getRecommendations(userId, limit = 10) {
  const context = await buildUserContext(userId);

  if (context.keywords.length === 0 && context.locations.length === 0) {
    return [];
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const allJobs = await Job.find({
    status:    'open',          // tumhare Job model mein 'open' hai, 'active' nahi
    createdAt: { $gte: thirtyDaysAgo }
  })
  .select('title company location skills salary jobType createdAt')
  .limit(300);

  const results = allJobs
    .map(job => ({ job, score: scoreJob(job, context) }))
    .filter(item => item.score > 15)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return results.map(item => ({
    ...item.job.toObject(),
    recommendationScore: item.score
  }));
}