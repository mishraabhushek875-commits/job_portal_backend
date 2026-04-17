// src/models/ChatSession.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: { type: String, required: true },
  jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  createdAt: { type: Date, default: Date.now }
});

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  messages: [messageSchema]
}, { timestamps: true });

export const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

/*
hatSession Model — Poora Concept
Pehle Socho — Real Life Mein Kya Hota Hai?
Jab tum kisi se WhatsApp pe baat karte ho:
Tum:    "React jobs dikhao"
Friend: "Yeh dekho — 3 jobs hain"
Tum:    "Mumbai mein koi hai?"
Friend: "Haan, yeh wala"
Yeh poori conversation ek chat session hai. Aur har line ek message hai.
MongoDB mein yahi store karna hai — lekin kaise?

Option 1 — Galat Tarika (Seedha Socho)
javascript// Kya hum aisa kar sakte hain?
const chatSchema = new mongoose.Schema({
  userId:   ObjectId,
  message1: String,
  message2: String,
  message3: String,
  // ... kitne messages honge? Pata nahi!
});
Problem — Messages ki count pehle se pata nahi. 10 bhi ho sakte hain, 500 bhi.

Option 2 — Sahi Tarika — Do Alag Schema
Isliye do alag schema banaye. Yeh ek classic pattern hai jisko Embedded Documents kehte hain:
ChatSession (baap)
│
└── messages: [ ← array
      Message 1,   ← baccha
      Message 2,   ← baccha
      Message 3,   ← baccha
      ...kitne bhi
    ]
ChatSession = poori conversation ka dabba
MessageSchema = us dabbe ke andar ek ek patti

Visually Samjho — MongoDB Mein Kaisa Dikhega
javascript// MongoDB mein ek document aisa dikhega:
{
  _id: ObjectId("session123"),
  userId: ObjectId("user456"),    // kaun — Rahul
  messages: [                     // array — badhta rahega
    {
      role: "user",               // Rahul ne bheja
      content: "React jobs dikhao",
      jobs: [],
      createdAt: "10:00 AM"
    },
    {
      role: "assistant",          // AI ne bheja
      content: "3 jobs mili hain!",
      jobs: [ObjectId("job1"), ObjectId("job2")],
      createdAt: "10:00 AM"
    },
    {
      role: "user",
      content: "Mumbai wala dikhao",
      jobs: [],
      createdAt: "10:01 AM"
    }
    // ... aur message push hote rahenge
  ],
  createdAt: "2024-01-15"
}

Do Schema Kyun Banaye — Ek Kyun Nahi?
javascript// messageSchema alag banaya
const messageSchema = new mongoose.Schema({
  role:    String,   // 'user' ya 'assistant'
  content: String,   // actual text
  jobs:    [...],    // agar jobs suggest kiye
  createdAt: Date
});

// chatSessionSchema mein use kiya
const chatSessionSchema = new mongoose.Schema({
  userId:   ObjectId,
  messages: [messageSchema]  // ← yahan embed kiya
});
Fayde:
1. Reusability — messageSchema ek baar define kiya, chatSessionSchema mein use kar liya. Kal ko koi aur jagah bhi use karna ho to ho sakta hai.
2. Validation har message pe — messageSchema mein enum: ['user', 'assistant'] lagaya. Matlab koi bhi galat role — jaise 'robot' ya 'admin' — save hi nahi hoga. Yeh validation har ek message pe automatically lagegi.
javascript// Yeh save HOGA
{ role: 'user', content: 'hello' }

// Yeh NAHI hoga — error aayega
{ role: 'robot', content: 'hello' }
3. Readability — Code padhne wale ko seedha samajh aata hai — ek session ke andar messages hote hain.

unique: true Kyun Lagaya?
javascriptuserId: {
  type: ObjectId,
  unique: true    // ← yeh kyun?
}
Socho — Rahul ke liye 2 alag sessions bana diye:
Session 1: userId = Rahul, messages: [...]
Session 2: userId = Rahul, messages: [...]  ← duplicate!
Ab chatbot history load karo — kaun si session dikhao? Confusion!
unique: true lagane se MongoDB guarantee karta hai — ek user ki sirf ek session hogi. Naya message aayega to usi session mein push hoga, naya document nahi banega.

enum Kyun Lagaya?
javascriptrole: {
  type: String,
  enum: ['user', 'assistant']  // ← sirf yeh do allowed
}
AI ko history bhejte waqt role bahut important hai. Agar galat role gaya:
javascript// Gemini ko history bhejte hain
// Gemini sirf 'user' aur 'model' samajhta hai
// Agar 'admin' ya kuch aur aaya — crash!
enum ek safety net hai — database level pe hi galat data rok deta hai.

Summary — Ek Line Mein

ChatSession ek dabbe ki tarah hai jisme ek user ki poori conversation hoti hai. MessageSchema us dabbe ke andar ki har ek baat ka blueprint hai. Do alag schema isliye banaye taaki har message pe validation ho aur code clean rahe.

  */