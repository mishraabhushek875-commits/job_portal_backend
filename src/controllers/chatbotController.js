import {processMessage} from '../ai/chatbot/chatbotService.js';

import {ChatSession} from '../models/ChatSession.js';


// src/ai/chatbot/chatbotController.js


// POST /api/ai/chat
export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Validation
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message empty nahi ho sakta' });
    }

    // Is user ki session dhundo — agar nahi hai to banao
    // findOneAndUpdate with upsert = agar nahi mila to create karo
    let session = await ChatSession.findOne({ userId });
    if (!session) {
      session = new ChatSession({ userId, messages: [] });
    }

    // AI service ko call karo — history bhejo context ke liye
    const response = await processMessage(message, session.messages);

    // User ka message save karo
    session.messages.push({
      role:    'user',
      content: message
    });

    // AI ka reply save karo — jobs ke IDs bhi
    session.messages.push({
      role:    'assistant',
      content: response.message,
      jobs:    response.jobs.map(j => j._id)
    });

    await session.save();

    // Frontend ko response bhejo
    res.json({
      success: true,
      reply:   response.message,
      jobs:    response.jobs,   // populated job objects
      intent:  response.intent
    });

  } catch (err) {
    console.error('Chatbot error:', err.message);
    res.status(500).json({
      message: 'Chatbot abhi busy hai, thodi der mein try karo'
    });
  }
};

// GET /api/ai/chat/history
export const getChatHistory = async (req, res) => {
  try {
    const session = await ChatSession.findOne({ userId: req.user._id })
      .populate('messages.jobs', 'title company location salary'); // IDs ki jagah data

    res.json({
      success:  true,
      messages: session ? session.messages : []
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};