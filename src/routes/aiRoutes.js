import express from 'express';

import {protect} from '../middlewares/authMiddleware.js';

const router = express.Router()

import { chat, getChatHistory } from '../controllers/chatbotController.js';

router.post('/chat',protect,chat);

router.get('/chat/history',protect,getChatHistory);

export default router;