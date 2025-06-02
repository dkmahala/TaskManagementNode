module.exports = {
    createTask: `
      INSERT INTO tasks (
        user_id, title, description,
        due_date, priority, status,
        recurrence_type, recurrence_interval,
        task_history, created_at, updated_at
      )
      OUTPUT inserted.*
      VALUES (
        @user_id, @title, @description,
        @due_date, @priority, @status,
        @recurrence_type, @recurrence_interval,
        @task_history, GETDATE(), GETDATE()
      );
    `,
  
    getTasksByUser: `
      SELECT *
      FROM tasks
      WHERE user_id = @user_id
      ORDER BY due_date;
    `,
  
    getTaskById: `
      SELECT *
      FROM tasks
      WHERE id = @id AND user_id = @user_id;
    `,
  
    updateTaskStatus: `
      UPDATE tasks
      SET status = @status,
          updated_at = GETDATE()
      OUTPUT inserted.*
      WHERE id = @id AND user_id = @user_id;
    `,
  
    updateTaskDueDate: `
      UPDATE tasks
      SET due_date = @due_date,
          updated_at = GETDATE()
      WHERE id = @id;
    `,
  
    deleteTask: `
      DELETE FROM tasks
      WHERE id = @id AND user_id = @user_id;
    `,
  
    getTasksDueInOneHour: `
      SELECT t.*, u.email
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      WHERE t.status = 'pending'
        AND t.due_date BETWEEN GETDATE() AND DATEADD(HOUR, 1, GETDATE());
    `,
  
    updateTaskStatusAndHistory: `
      UPDATE tasks
      SET status = @status,
          task_history = @task_history,
          updated_at = GETDATE()
      WHERE id = @id AND user_id = @user_id;
    `,
  };
  