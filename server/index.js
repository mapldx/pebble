const express = require('express');
const db = require('./data/pool');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/auth/check', (req, res) => {
  const userId = req.query.uid;
  const query = 'SELECT * FROM users WHERE appleUserId = ?';
  db.query(query, [userId], (error, results) => {
      if (error) return res.status(500).json({ error: error.message });
      if (results.length === 0) return res.status(404).json({ error: 'User not found' });
      res.status(200).json({ exists: results.length > 0 });
  });
});

app.post('/api/auth/create', (req, res) => {
  try {
    const data = req.body.credential;
    console.log(data);
    const query = `INSERT INTO users (authorizationCode, email, familyName, givenName, middleName, namePrefix, nameSuffix, nickname, identityToken, realUserStatus, state, appleUserId)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [data.authorizationCode, data.email, data.fullName.familyName, data.fullName.givenName, data.fullName.middleName, data.fullName.namePrefix, data.fullName.nameSuffix, data.fullName.nickname, data.identityToken, data.realUserStatus, data.state, data.user];
    
    db.query(query, values, (error) => { 
        console.log(error);
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ message: 'User created successfully' });
    });
  } catch (e) {
    console.log(e);
  }
});

app.get('/api/auth/get', (req, res) => {
  const userId = req.query.uid;
  const query = 'SELECT email FROM users WHERE appleUserId = ?';
  db.query(query, [userId], (error, results) => {
      if (error) return res.status(500).json({ error: error.message });
      if (results.length === 0) return res.status(404).json({ error: 'User not found' });
      res.status(200).json({ email: results[0].email });
  });
});

app.post('/api/tasks/create', (req, res) => {
  try {
    const { uid, title, description, taskSize, dueDate } = req.body;

    if (!title || !taskSize || !['Pebble', 'Cobble', 'Boulder'].includes(taskSize)) {
      return res.status(400).send('Invalid input');
    }

    const query = `
      INSERT INTO tasks (appleUserId, title, description, taskSize, dueDate)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [uid, title, description, taskSize, dueDate];

    db.query(query, values, (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
      }
      res.json({ taskId: results.insertId });
    });

  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});