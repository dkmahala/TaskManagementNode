const db = require("../utilities/db");
const taskQueries = require("../queries/taskQueries");

function addIntervalToDate(date, recurrenceType, interval) {
  const d = new Date(date);
  switch (recurrenceType) {
    case "daily":
      d.setDate(d.getDate() + interval);
      break;
    case "weekly":
      d.setDate(d.getDate() + interval * 7);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + interval);
      break;
    default:
      return date;
  }
  return d.toISOString();
}

module.exports.createTask = async (req, res) => {
  const {
    title,
    description,
    due_date,
    priority,
    recurrence_type,
    recurrence_interval,
  } = req.body;
  const userId = req.user.id;

  if (!title || !due_date || !priority) {
    return res
      .status(400)
      .json({ message: "title, due_date & priority are required." });
  }

  const validRecurrence = ["none", "daily", "weekly", "monthly"];
  if (!validRecurrence.includes(recurrence_type)) {
    return res.status(400).json({ message: "Invalid recurrence_type." });
  }

  const intervalVal = recurrence_type === "none" ? 0 : recurrence_interval || 1;

  try {
    const result = await db.query(taskQueries.createTask, [
      { name: "user_id", type: db.sql.Int, value: userId },
      { name: "title", type: db.sql.VarChar, value: title },
      { name: "description", type: db.sql.VarChar, value: description || "" },
      { name: "due_date", type: db.sql.DateTime, value: due_date },
      { name: "priority", type: db.sql.VarChar, value: priority },
      { name: "status", type: db.sql.VarChar, value: "pending" },
      { name: "recurrence_type", type: db.sql.VarChar, value: recurrence_type },
      { name: "recurrence_interval", type: db.sql.Int, value: intervalVal },
      {
        name: "task_history",
        type: db.sql.NVarChar,
        value: JSON.stringify([]),
      },
    ]);

    return res.status(201).json({
      message: "Task created successfully",
      data: result.recordset[0],
    });
  } catch (err) {
    console.error("createTask error:", err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

module.exports.getAllTasks = async (req, res) => {
    const userId = req.user.id;
    try {
      const result = await db.query(taskQueries.getTasksByUser, [
        { name: "user_id", type: db.sql.Int, value: userId },
      ]);
  
      const tasks = result.recordset.map((task) => {
        if (task.task_history) {
          try {
            task.task_history = JSON.parse(task.task_history);
          } catch (e) {
            console.warn(`Failed to parse task_history for task ${task.id}:`, e.message);
            task.task_history = [];
          }
        } else {
          task.task_history = [];
        }
        return task;
      }) .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  
      return res.status(200).json({
        message: "Data fetched successfully",
        data: tasks,
      });
    } catch (err) {
      console.error("getAllTasks error:", err);
      return res.status(500).json({ message: "Internal Server Error." });
    }
  };

module.exports.getTaskById = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  try {
    const result = await db.query(taskQueries.getTaskById, [
      { name: "id", type: db.sql.Int, value: taskId },
      { name: "user_id", type: db.sql.Int, value: userId },
    ]);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    const task = result.recordset[0];

    // Parse task_history if it exists
    if (task.task_history) {
      try {
        task.task_history = JSON.parse(task.task_history);
      } catch (e) {
        console.warn("Failed to parse task_history:", e.message);
        task.task_history = [];
      }
    } else {
      task.task_history = [];
    }

    return res.status(200).json({
      message: "Task fetched successfully.",
      data: task,
    });
  } catch (err) {
    console.error("getTaskById error:", err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

module.exports.markTaskCompleted = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  try {
    const getRes = await db.query(taskQueries.getTaskById, [
      { name: "id", type: db.sql.Int, value: taskId },
      { name: "user_id", type: db.sql.Int, value: userId },
    ]);

    if (getRes.recordset.length === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    const task = getRes.recordset[0];
    if (task.status === "completed") {
      return res.status(400).json({ message: "Task already completed." });
    }

    const currentHistory = task.task_history
      ? JSON.parse(task.task_history)
      : [];
    currentHistory.push({
      old_status: task.status,
      new_status: "completed",
      changed_at: new Date().toISOString(),
    });

    // Update to completed and append history
    await db.query(taskQueries.updateTaskStatusAndHistory, [
      { name: "status", type: db.sql.VarChar, value: "completed" },
      {
        name: "task_history",
        type: db.sql.NVarChar,
        value: JSON.stringify(currentHistory),
      },
      { name: "id", type: db.sql.Int, value: taskId },
      { name: "user_id", type: db.sql.Int, value: userId },
    ]);

    // Handle recurrence
    if (task.recurrence_type !== "none") {
      const nextDue = addIntervalToDate(
        task.due_date,
        task.recurrence_type,
        task.recurrence_interval
      );

      // Update due date and reset status
      await db.query(taskQueries.updateTaskDueDate, [
        { name: "due_date", type: db.sql.DateTime, value: nextDue },
        { name: "id", type: db.sql.Int, value: taskId },
      ]);

      await db.query(taskQueries.updateTaskStatusAndHistory, [
        { name: "status", type: db.sql.VarChar, value: "pending" },
        {
          name: "task_history",
          type: db.sql.NVarChar,
          value: JSON.stringify(currentHistory),
        },
        { name: "id", type: db.sql.Int, value: taskId },
        { name: "user_id", type: db.sql.Int, value: userId },
      ]);
    }

    return res.status(200).json({ message: "Task marked completed." });
  } catch (err) {
    console.error("markTaskCompleted error:", err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

module.exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  try {
    await db.query(taskQueries.deleteTask, [
      { name: "id", type: db.sql.Int, value: taskId },
      { name: "user_id", type: db.sql.Int, value: userId },
    ]);
    return res.json({ message: "Task deleted." });
  } catch (err) {
    console.error("deleteTask error:", err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};
