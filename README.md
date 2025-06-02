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
1. Create user and task table
2. Add environment variable