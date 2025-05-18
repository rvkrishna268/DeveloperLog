const mongoose = require('mongoose');

const DailyLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  tasks: String,
  timeSpent: Number,
  mood: String,
  blockers: String,
  tags: [String], // ✅ Add this line
  reviewed: { type: Boolean, default: false },
  feedback: String
});

module.exports = mongoose.model('DailyLog', DailyLogSchema);
