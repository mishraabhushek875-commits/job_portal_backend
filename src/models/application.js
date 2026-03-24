import mongoose from 'mongoose';
/*Rahul ne TCS ki "React Developer" job dekhi
         ↓
Rahul ne Apply kiya
         ↓
Ek Application bani jisme hai:
  - Kaun apply kar raha hai? → Rahul (User ID)
  - Kis job mein? → React Developer (Job ID)
  - Status kya hai? → Pending
  - Cover letter? → "Main React mein 2 saal ka experience..."*/

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
      default: 'pending',
    },

    coverLetter: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ek user ek job mein sirf ek baar apply kar sake
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
//MongoDB mein sirf ID store hoti hai — collections alag alag rehte hain. Relationship optional hai — tumhari marzi kab connect karo.

{/*Job document mein sirf ID hai: "abc123"
    ↓
Populate karo
    ↓
MongoDB ne User collection mein "abc123" dhunda
    ↓
Pura user object mil gaya*/}

const Application = mongoose.model('Application', applicationSchema);

export default Application;

//"MongoDB loosely coupled hai kyunki collections independent rehte hain — sirf reference ID store hoti hai. populate() se runtime par related data fetch karte hain, yeh SQL ke JOIN jaisa hai lekin optional hai. Selective populate use karta hoon taaki sensitive fields jaise password response mein na aayein."