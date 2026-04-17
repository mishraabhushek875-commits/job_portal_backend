import  getGeminiModel from '../../config/ai.js';
import Job from '../../models/job.js';

// ─── Intent Detection ─────────────────────────────────────────
/*
  Intent = user kya chahta hai?
  
  "React jobs Mumbai" → job_search intent
  "Resume tips do"    → general_question intent
  
  Simple keyword matching — fast aur free.
*/

const JOB_SEARCH_KEYWORDS = [

 'job', 'jobs', 'vacancy', 'vacancies', 'opening', 'openings',
  'hiring', 'naukri', 'kaam', 'position', 'role',
  'find', 'show', 'search', 'dikhao', 'dhundo', 'chahiye'
];

const CITIES = [
  'mumbai', 'delhi', 'bangalore', 'bengaluru', 'pune',
  'hyderabad', 'chennai', 'kolkata', 'noida', 'gurgaon',
  'agra', 'jaipur', 'ahmedabad', 'surat', 'lucknow'
];

const JOB_ROLES = [
  'react', 'node', 'node.js', 'python', 'java', 'angular', 'vue',
  'flutter', 'android', 'ios', 'devops', 'data analyst', 'data scientist',
  'machine learning', 'ml', 'ai', 'full stack', 'frontend', 'backend',
  'ui/ux', 'graphic designer', 'php', 'django', 'spring','React'
];


function detectIntent(message) {
  const msg = message.toLowerCase();

  const isJobSearch = JOB_SEARCH_KEYWORDS.some(kw => msg.includes(kw));

  if (!isJobSearch) {
    return { type: 'general_question', keyword: '', location: '' };
  }

  // Job search hai — keyword aur location nikalo
  const keyword  = JOB_ROLES.find(role => msg.includes(role)) || '';
  const location = CITIES.find(city => msg.includes(city)) || '';

  return { type: 'job_search', keyword, location };
}




// ─── Database Search ──────────────────────────────────────────

async function findJobsFromDB(keyword, location) {
  // Query dynamically banao
  const query = { status: 'open' };

  if (keyword) {
    // $or = koi bhi ek condition true ho
    query.$or = [
      { title:       { $regex: keyword, $options: 'i' } },
      { skills:      { $elemMatch: { $regex: keyword, $options: 'i' } } },
      { description: { $regex: keyword, $options: 'i' } }
    ];
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  // Sirf important fields lo — bandwidth save karo
  const jobs = await Job.find(query)
    .select('title company location salary jobType skills')
    .sort({ createdAt: -1 })
    .limit(5); // chatbot mein 5 kaafi hai

  return jobs;
}

// ─── AI Response ──────────────────────────────────────────────

async function getAIReply(userMessage, chatHistory) {
  const model = getGeminiModel();

  /*
    Gemini ko history dete hain taaki context yaad rahe.
    
    Without history:
    User: "Mera resume weak hai"
    AI: "Kya weak hai?"    ← AI ko pata nahi kya poochha
    
    With history:
    AI message yaad rakhta hai → better conversation
  */

  // Last 6 messages lo (3 user + 3 AI) — zyada bheja to slow hoga
  const recentHistory = chatHistory.slice(-6);

  // Gemini format: role 'user' ya 'model' hona chahiye
  const formattedHistory = recentHistory.map(msg => ({
    role:  msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  // System prompt = AI ki personality define karo
  const systemPrompt = `Tu "JobBot" hai — ek friendly job portal assistant.
Tera kaam: job seekers ki madad karna.
- Resume tips, interview prep, career advice do
- Hinglish mein baat karo — friendly aur helpful raho  
- Short aur clear jawab do — 3-4 lines kaafi hain
- Agar koi irrelevant topic aaye to politely career pe wapas lao
- Kabhi rude mat hona`;

  const chat = model.startChat({
    history: [
      { role: 'user',  parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Bilkul! Main JobBot hun. Batao kaise help karun?' }] },
      ...formattedHistory
    ]
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

// ─── Main Function — Controller yahan se call karega ─────────

async function processMessage(userMessage, chatHistory = []) {
  // Step 1: Intent detect karo
  const intent = detectIntent(userMessage);

  let replyText = '';
  let foundJobs  = [];

  if (intent.type === 'job_search') {
    // Step 2a: Database search
    foundJobs = await findJobsFromDB(intent.keyword, intent.location);

    if (foundJobs.length === 0) {
      replyText = `"${intent.keyword || 'is role'}" ke liye ` +
        `${intent.location ? intent.location + ' mein ' : ''}` +
        `abhi koi job nahi hai. Dusra keyword try karo ya ` +
        `location hata ke search karo.`;
    } else {
      replyText = `${foundJobs.length} jobs mili hain` +
        `${intent.keyword ? ' "' + intent.keyword + '"' : ''}` +
        `${intent.location ? ' ' + intent.location + ' mein' : ''}! ` +
        `Yeh dekho:`;
    }

  } else {
    // Step 2b: AI se jawab lo
    replyText = await getAIReply(userMessage, chatHistory);
  }

  return {
    message: replyText,
    jobs:    foundJobs,
    intent:  intent.type
  };
}

//ye named  exports me aise hi eixort krte hai files ko  ddeaflut me defakut keywordsk au se krke tba export krte hai 
export { processMessage };