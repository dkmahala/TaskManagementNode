const express=require('express')
const app = express();
const config=require('./utilities/config')
app.use(express.json());
const PORT=config.PORT

const { startTaskNotificationJob } = require('./utilities/scheduler');


const userRoute=require('./routes/userRoute')
const taskRoute=require('./routes/taskRoute')


// Health check
app.get('/', (req, res) => res.send('Task Scheduler API is running!'));

// Routes
app.use('/api/user', userRoute);
app.use('/api/tasks', taskRoute);


app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ message: 'Something went wrong.' });
});


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    startTaskNotificationJob();
  });