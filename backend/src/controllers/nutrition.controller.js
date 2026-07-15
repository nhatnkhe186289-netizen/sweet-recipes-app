const User = require('../models/User');
const NutritionLog = require('../models/NutritionLog');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Log a nutrition entry
// @route   POST /api/nutrition
// @access  Private
const logNutrition = async (req, res) => {
  try {
    const { recipeId, recipeTitle, calories, mealType, date, dayString } = req.body;

    if (!recipeTitle || calories === undefined) {
      return sendError(res, 'Vui lòng điền tên món ăn và lượng calo', 400);
    }

    const logDate = date ? new Date(date) : new Date();
    const finalDayString = dayString || logDate.toISOString().split('T')[0];

    const newLog = await NutritionLog.create({
      user: req.user._id,
      recipe: recipeId || undefined,
      recipeTitle,
      calories: Number(calories),
      mealType: mealType || 'Ăn vặt',
      date: logDate,
      dayString: finalDayString,
    });

    return sendSuccess(res, newLog, 'Đã ghi nhận calo thành công', 201);
  } catch (error) {
    console.error('Error logging nutrition:', error);
    return sendError(res, 'Không thể lưu nhật ký dinh dưỡng');
  }
};

// @desc    Get daily nutrition logs
// @route   GET /api/nutrition/daily
// @access  Private
const getDailyNutrition = async (req, res) => {
  try {
    const { date } = req.query; // Expecting YYYY-MM-DD
    const targetDateStr = date || new Date().toISOString().split('T')[0];

    const logs = await NutritionLog.find({
      user: req.user._id,
      dayString: targetDateStr,
    }).sort({ createdAt: -1 });

    const totalCalories = logs.reduce((sum, item) => sum + item.calories, 0);

    return sendSuccess(res, {
      logs,
      totalCalories,
      dailyCalorieGoal: req.user.dailyCalorieGoal || 2000,
    }, 'Đã lấy nhật ký dinh dưỡng ngày thành công');
  } catch (error) {
    console.error('Error getting daily nutrition:', error);
    return sendError(res, 'Không thể lấy dữ liệu dinh dưỡng ngày');
  }
};

// @desc    Get weekly nutrition report (last 7 days)
// @route   GET /api/nutrition/weekly
// @access  Private
const getWeeklyNutrition = async (req, res) => {
  try {
    const { endDate } = req.query; // YYYY-MM-DD
    const end = endDate ? new Date(endDate) : new Date();
    
    // Generate array of last 7 day strings
    const dayStrings = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      dayStrings.push(d.toISOString().split('T')[0]);
    }

    // Fetch all logs in these days for current user
    const logs = await NutritionLog.find({
      user: req.user._id,
      dayString: { $in: dayStrings },
    });

    // Group and aggregate
    const weeklySummary = dayStrings.map(dayStr => {
      const dayLogs = logs.filter(l => l.dayString === dayStr);
      const total = dayLogs.reduce((sum, l) => sum + l.calories, 0);
      return {
        dayString: dayStr,
        totalCalories: total,
      };
    });

    return sendSuccess(res, weeklySummary, 'Đã lấy dữ liệu tuần thành công');
  } catch (error) {
    console.error('Error getting weekly nutrition:', error);
    return sendError(res, 'Không thể lấy báo cáo tuần');
  }
};

// @desc    Delete a nutrition entry
// @route   DELETE /api/nutrition/:id
// @access  Private
const deleteNutritionLog = async (req, res) => {
  try {
    const logId = req.params.id;
    const log = await NutritionLog.findById(logId);

    if (!log) {
      return sendError(res, 'Không tìm thấy nhật ký này', 404);
    }

    if (log.user.toString() !== req.user._id.toString()) {
      return sendError(res, 'Không có quyền xóa nhật ký của người khác', 403);
    }

    await NutritionLog.findByIdAndDelete(logId);

    return sendSuccess(res, null, 'Đã xóa nhật ký ăn uống thành công');
  } catch (error) {
    console.error('Error deleting nutrition log:', error);
    return sendError(res, 'Không thể xóa nhật ký');
  }
};

// @desc    Update user's daily calorie goal
// @route   PUT /api/nutrition/goal
// @access  Private
const updateCalorieGoal = async (req, res) => {
  try {
    const { dailyCalorieGoal } = req.body;

    if (dailyCalorieGoal === undefined || isNaN(Number(dailyCalorieGoal)) || Number(dailyCalorieGoal) <= 0) {
      return sendError(res, 'Mục tiêu Calo không hợp lệ', 400);
    }

    const user = await User.findById(req.user._id);
    user.dailyCalorieGoal = Number(dailyCalorieGoal);
    await user.save();

    return sendSuccess(res, { dailyCalorieGoal: user.dailyCalorieGoal }, 'Cập nhật mục tiêu calo thành công');
  } catch (error) {
    console.error('Error updating calorie goal:', error);
    return sendError(res, 'Không thể cập nhật mục tiêu calo');
  }
};

module.exports = {
  logNutrition,
  getDailyNutrition,
  getWeeklyNutrition,
  deleteNutritionLog,
  updateCalorieGoal,
};
