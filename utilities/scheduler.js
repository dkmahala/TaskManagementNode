const { CronJob } = require('cron');
const db = require('../utilities/db');
const taskQueries = require('../queries/taskQueries');
const {sendEmail} = require('../utilities/emailService'); // Adjust if needed

function startTaskNotificationJob() {
  //pending tasks will be check in every 10 minutes
  const job = new CronJob('*/10 * * * *', async () => {
    console.log(`Checking for tasks due in the next hour at ${new Date().toISOString()}`);

    try {
      const result = await db.query(taskQueries.getTasksDueInOneHour);
      const tasks = result.recordset; // ✅ Correct way for SQL Server

      for (const task of tasks) {
        await sendEmail({
          to: task.email,
          subject: `Reminder: "${task.title}" is due soon`,
          text: `Hey! Your task "${task.title}" is due at ${new Date(task.due_date).toLocaleString()}.`,
          html: `<p>Hey! Your task "<strong>${task.title}</strong>" is due at ${new Date(task.due_date).toLocaleString()}.</p>`,
        });

        console.log(`Notification sent for task ID ${task.id} to ${task.email}`);
      }
    } catch (err) {
      console.error('Error during notification job:', err);
    }
  }, null, true, 'Asia/Kolkata');

  job.start();
}




module.exports = { startTaskNotificationJob };
