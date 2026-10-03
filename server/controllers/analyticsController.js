const { memoryStore } = require('../models/dataStore');
const { Notice } = require('../models/Notice');
const Reminder = require('../models/Reminder');
const { getIsConnected } = require('../config/db');

// @desc Get comprehensive Dashboard Analytics (FR8)
// @route GET /api/analytics/dashboard
const getDashboardMetrics = async (req, res) => {
  try {
    if (getIsConnected()) {
      const notices = await Notice.find();
      let totalActions = 0;
      let completedActions = 0;
      let pendingActions = 0;
      let overdueActions = 0;
      let highPriorityCount = 0;
      const todayStr = new Date().toISOString().split('T')[0];

      const upcomingDeadlines = [];
      const priorityCounts = { High: 0, Medium: 0, Low: 0 };
      const statusCounts = { Pending: 0, 'In Progress': 0, Completed: 0, Overdue: 0 };

      notices.forEach(notice => {
        if (priorityCounts[notice.priority] !== undefined) priorityCounts[notice.priority]++;
        if (statusCounts[notice.status] !== undefined) statusCounts[notice.status]++;
        if (notice.priority === 'High') highPriorityCount++;

        (notice.deadlines || []).forEach(d => {
          upcomingDeadlines.push({
            noticeId: notice._id,
            noticeTitle: notice.title,
            title: d.title,
            date: d.date,
            time: d.time,
            isUrgent: d.isUrgent
          });
        });

        (notice.actions || []).forEach(a => {
          totalActions++;
          if (a.status === 'Completed') {
            completedActions++;
          } else {
            pendingActions++;
            if (a.deadline && a.deadline < todayStr) {
              overdueActions++;
            }
          }
        });
      });

      const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

      return res.status(200).json({
        success: true,
        data: {
          totalNotices: notices.length,
          totalActions,
          completedActions,
          pendingActions,
          overdueActions,
          highPriorityCount,
          completionRate,
          priorityCounts,
          statusCounts,
          upcomingDeadlines: upcomingDeadlines.slice(0, 6)
        }
      });
    }

    // In-memory fallback
    const metrics = memoryStore.getAnalytics();
    const notices = memoryStore.getAllNotices();
    const upcomingDeadlines = [];
    const priorityCounts = { High: 0, Medium: 0, Low: 0 };
    const statusCounts = { Pending: 0, 'In Progress': 0, Completed: 0, Overdue: 0 };

    notices.forEach(n => {
      priorityCounts[n.priority] = (priorityCounts[n.priority] || 0) + 1;
      statusCounts[n.status] = (statusCounts[n.status] || 0) + 1;
      (n.deadlines || []).forEach(d => {
        upcomingDeadlines.push({
          noticeId: n._id,
          noticeTitle: n.title,
          title: d.title,
          date: d.date,
          time: d.time,
          isUrgent: d.isUrgent
        });
      });
    });

    res.status(200).json({
      success: true,
      data: {
        ...metrics,
        priorityCounts,
        statusCounts,
        upcomingDeadlines: upcomingDeadlines.slice(0, 6),
        reminders: memoryStore.getReminders()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Reminders list (FR6)
// @route GET /api/analytics/reminders
const getReminders = async (req, res) => {
  try {
    if (getIsConnected()) {
      const reminders = await Reminder.find().sort({ reminderDate: 1 });
      return res.status(200).json({ success: true, count: reminders.length, data: reminders });
    }

    const reminders = memoryStore.getReminders();
    res.status(200).json({ success: true, count: reminders.length, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Snooze or Dismiss Reminder (FR6)
// @route PATCH /api/analytics/reminders/:id
const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, snoozeMinutes } = req.body; // 'snoozed' or 'dismissed'

    if (getIsConnected()) {
      const reminder = await Reminder.findById(id);
      if (!reminder) return res.status(404).json({ success: false, message: 'Reminder not found.' });

      reminder.status = status;
      if (status === 'snoozed') {
        reminder.snoozedCount = (reminder.snoozedCount || 0) + 1;
        reminder.reminderDate = new Date(Date.now() + (snoozeMinutes || 60) * 60000);
      }
      await reminder.save();
      return res.status(200).json({ success: true, message: `Reminder ${status}`, data: reminder });
    }

    const updated = memoryStore.updateReminderStatus(id, status, snoozeMinutes);
    if (!updated) return res.status(404).json({ success: false, message: 'Reminder not found.' });

    res.status(200).json({ success: true, message: `Reminder ${status}`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardMetrics,
  getReminders,
  updateReminder
};
