import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',//ref me hum model dete hai jisme se hum data koi ya id le rhe hai hain
      required: true,
    },

    type: {
      type: String,
      enum: ['NEW_APPLICATION', 'STATUS_CHANGED'],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

/*Yeh SAHI tarika hai
recruiter: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',    // ← yahan ref use kiya
}
```
```
Database mein sirf save hoga:
  recruiter: "64f8a2b1c3d4e5f6a7b8c9d0"  ← sirf ID

Rahul ne email change kiya?
  → Sirf User collection mein ek jagah update hua
  → Saari jobs automatically correct ho gayi ✅
```

---

## Kab ref use karte hain — Rule
```
Jab bhi do cheezein alag alag exist karti hain
aur ek doosre se related hain

Tab sirf ID store karo — poora object nahi*/


/*Sirf ID store ki hai, toh data kaise laayenge?
javascript// Bina populate ke
const job = await Job.findById(id);
console.log(job.recruiter);
// Output: "64f8a2b1c3d4e5f6a7b8c9d0"  ← sirf ID 😕

// populate ke saath
const job = await Job.findById(id).populate('recruiter', 'name email');
console.log(job.recruiter);
// Output: { name: "Rahul", email: "rahul@gmail.com" } ✅
```

**populate() kaise kaam karta hai:**
```
Job mein recruiter ID hai: "64f8a2b1..."
              ↓
populate() ne ref dekha: 'User'
              ↓
User collection mein "64f8a2b1..." dhunda
              ↓
Woh user object return kar diya
```

**ref nahi hota toh populate() ko pata hi nahi chalta
ki ID kis collection mein dhundni hai!**

---

## Simple Rule yaad rakho
```
Ek cheez kai jagah use hoti hai?
        ↓
Alag collection banao + sirf ID store karo + ref do

Example:
  User → kai jobs mein recruiter ho sakta hai
  User → kai applications mein applicant ho sakta hai
  Job  → kai applications mein refer ho sakti hai
```
```
Ek cheez sirf ek jagah use hoti hai?
        ↓
Seedha us schema mein likho — ref ki zaroorat nahi

Example:
  Job ka title → sirf us job mein hoga
  User ka name → sirf us user ka hoga

*/