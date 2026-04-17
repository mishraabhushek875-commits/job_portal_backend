// src/models/SearchHistory.js
import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  keyword:  { type: String, default: '' },
  location: { type: String, default: '' },
  skills:   [String],
  searchedAt: { type: Date, default: Date.now }
});

// Fast query ke liye index
searchHistorySchema.index({ userId: 1, searchedAt: -1 });

export default mongoose.model('SearchHistory', searchHistorySchema);