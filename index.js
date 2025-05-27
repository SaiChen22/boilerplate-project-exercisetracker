const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let users = [];
let exercises = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// POST /api/users - create a new user
app.post('/api/users', (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  if (!username) return res.status(400).json({ error: 'Username required' });
  const _id = uuidv4();
  const user = { username, _id };
  users.push(user);
  res.json(user);
});

// GET /api/users - get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// POST /api/users/:_id/exercises - add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  console.log(req.body);
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.status(400).json({ error: 'User not found' });
  const exerciseDate = date ? new Date(date) : new Date();
  const exercise = {
    username: user.username,
    description,
    duration: Number(duration),
    date: exerciseDate.toDateString(),
    _id: user._id
  };
  exercises.push({ ...exercise, date: exerciseDate }); // store raw date for filtering
  res.json(exercise);
});

// GET /api/users/:_id/logs - get exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.status(400).json({ error: 'User not found' });
  let log = exercises.filter(e => e._id === user._id);
  // Filtering
  if (req.query.from) {
    const from = new Date(req.query.from);
    log = log.filter(e => e.date >= from);
  }
  if (req.query.to) {
    const to = new Date(req.query.to);
    log = log.filter(e => e.date <= to);
  }
  if (req.query.limit) {
    log = log.slice(0, Number(req.query.limit));
  }
  // Format log
  const formattedLog = log.map(e => ({
    description: e.description,
    duration: e.duration,
    date: e.date.toDateString()
  }));
  res.json({
    username: user.username,
    count: formattedLog.length,
    _id: user._id,
    log: formattedLog
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
