const express = require('express');
const router = express.Router();
const DailyLog = require('../models/DailyLog');
const authMiddleware = require('../middleware/auth');

// Developer: Submit log
router.post('/', authMiddleware, async (req, res) => {
  const log = new DailyLog({ ...req.body, user: req.user.id });
  await log.save();
  res.json(log);
});

// Developer: Get personal logs
router.get('/me', authMiddleware, async (req, res) => {
  const logs = await DailyLog.find({ user: req.user.id }).sort({ date: -1 });
  res.json(logs);
});

// Manager: View team logs with filters
// GET /api/logs
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).send('Forbidden');

  const filters = {};
  if (req.query.date) {
    const day = new Date(req.query.date);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    filters.date = { $gte: day, $lt: nextDay };
  }
  if (req.query.blockers) {
    filters.blockers = { $regex: req.query.blockers, $options: 'i' };
  }

  const allLogs = await DailyLog.find(filters).populate('user', 'name email');
  let logs = allLogs;

  // 🔍 Developer name filter
  if (req.query.devName) {
    const devName = req.query.devName.toLowerCase();
    logs = logs.filter(log =>
      log.user?.name?.toLowerCase().includes(devName)
    );
  }

  // 🔍 Task tags filter
  if (req.query.tags) {
    const tagsToMatch = req.query.tags.toLowerCase().split(',').map(t => t.trim());
    logs = logs.filter(log =>
      (log.tags || []).some(tag =>
        tagsToMatch.includes(tag.toLowerCase())
      )
    );
  }

  res.json(logs);


  // Apply developer name filtering after population
  const filtered = req.query.devName
    ? allLogs.filter(log =>
      log.user?.name?.toLowerCase().includes(req.query.devName.toLowerCase())
    )
    : allLogs;

  res.json(filtered);
});


// Manager: Mark as reviewed
router.patch('/:id/review', authMiddleware, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).send('Forbidden');
  const log = await DailyLog.findByIdAndUpdate(req.params.id, { reviewed: true, feedback: req.body.feedback }, { new: true });
  res.json(log);
});

// Update a log (developer only and only if not reviewed)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const log = await DailyLog.findById(req.params.id);

    // Check if log exists and belongs to the logged-in user
    if (!log || log.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to edit this log' });
    }

    // Prevent update if already reviewed
    if (log.reviewed) {
      return res.status(400).json({ message: 'Cannot edit reviewed log' });
    }

    // Apply updates
    const { tasks, timeSpent, mood, blockers } = req.body;
    log.tasks = tasks;
    log.timeSpent = timeSpent;
    log.mood = mood;
    log.blockers = blockers;
    await log.save();

    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating log' });
  }
});

// DELETE /api/logs/:id
// DELETE /api/logs/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const log = await DailyLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!log) {
      return res.status(404).json({ msg: "Log not found" });
    }

    res.json({ msg: "Log deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});



module.exports = router;
