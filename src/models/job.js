import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title zaroori hai'],
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'Job description zaroori hai'],
    },

    company: {
      type: String,
      required: [true, 'Company naam zaroori hai'],
      trim: true,
    },

    location: {
      type: String,
      required: [true, 'Location zaroori hai'],
      trim: true,
    },

    salary: {
      type: Number,
      default: 0,
    },

    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'remote', 'internship'],
      default: 'full-time',
    },

    skills: [
      {
        type: String,
        trim: true,
      }
    ],

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',//ref: 'User' batata hai ki yeh ID User collection se hai — baad mein populate se pura user data la sakte hain.
      required: true,
    },

    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model('Job', jobSchema);

export default Job;