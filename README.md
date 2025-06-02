This is a simple task scheduling backend project built using Node.js. It supports user registration, login, task management, recurring tasks, and task notifications via email. Data is stored in a Azure SQL database using raw SQL queries.

Features:

- JWT-based authentication
- User registration & login
- Task creation with title, description, due date, priority, and status
- Support for recurring tasks (daily, weekly, monthly)
- Task history tracking stored in a JSON column inside the tasks table
- Email notifications (1 hour before task is due) using Nodemailer and gmail based app password
- Cron job to check for upcoming tasks in every 10 minutes

Note: 
1. Create user and task table using 

    CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
    );



    CREATE TABLE tasks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATETIME NOT NULL,
    priority VARCHAR(20) NOT NULL, 
    status VARCHAR(20) NOT NULL DEFAULT 'pending', 
    recurrence_type VARCHAR(20) NOT NULL DEFAULT 'none',
    recurrence_interval INTEGER DEFAULT 1,
    task_history TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
    );

2. Add environment variable