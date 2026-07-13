const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username avatar')
      .populate('recipe', 'title image')
      .sort({ createdAt: -1 });

    return sendSuccess(res, notifications, 'Notifications retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized', 403);
    }

    notification.isRead = true;
    await notification.save();

    return sendSuccess(res, notification, 'Notification marked as read');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
