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
    // console.log(data);
    const query = `INSERT INTO users (authorizationCode, email, familyName, givenName, middleName, namePrefix, nameSuffix, nickname, identityToken, realUserStatus, state, appleUserId)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [data.authorizationCode, data.email, data.fullName.familyName, data.fullName.givenName, data.fullName.middleName, data.fullName.namePrefix, data.fullName.nameSuffix, data.fullName.nickname, data.identityToken, data.realUserStatus, data.state, data.user];
    
    db.query(query, values, (error) => { 
        // console.log(error);
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ message: 'User created successfully' });
    });
  } catch (e) {
    // console.log(e);
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

app.put('/api/auth/update', (req, res) => {
  const userId = req.query.uid;
  const query = 'UPDATE users SET icsFeedUrl = ? WHERE appleUserId = ?';
  db.query(query, [req.body.icsFeedUrl, userId], (error) => {
      if (error) return res.status(500).json({ error: error.message });
      res.status(200).json({ message: 'User updated successfully' });
  });
});

app.post('/api/tasks/create', (req, res) => {
  // console.log(req.body);
  try {
    const { uid, title, description, taskSize, status, assignedDate, dueDate } = req.body;

    if (!title || !taskSize || !['Pebble', 'Cobble', 'Boulder'].includes(taskSize)) {
      return res.status(400).send('Invalid input');
    }

    const query = `
      INSERT INTO tasks (appleUserId, title, description, taskSize, status, assignedDate, dueDate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [uid, title, description, taskSize, status, assignedDate, dueDate];

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

app.get('/api/tasks/get', (req, res) => {
  const userId = req.query.uid;
  let query = 'SELECT * FROM tasks WHERE appleUserId = ?';
  db.query(query, [userId], (error, results) => {
      if (error) return res.status(500).json({ error: error.message });
      query = 'UPDATE users SET lastLoginAt = NOW() WHERE appleUserId = ?';
      db.query(query, [userId], (error) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ tasks: results });
      });
  });
});

app.put('/api/tasks/update', (req, res) => {
  try {
    const { taskId, title, description, taskSize, status, assignedDate, dueDate, icsFeedUrl } = req.body;

    if (!taskId) {
      return res.status(400).send('Invalid input');
    }

    let query = 'UPDATE tasks SET ';
    let values = [];

    if (title) {
      query += 'title = ?, ';
      values.push(title);
    }

    if (description) {
      query += 'description = ?, ';
      values.push(description);
    }

    if (taskSize) {
      query += 'taskSize = ?, ';
      values.push(taskSize);
    }

    if (status) {
      query += 'status = ?, ';
      values.push(status);
    }

    if (assignedDate) {
      query += 'assignedDate = ?, ';
      if (assignedDate === '1970-01-01') {
        query += 'numPostpone = numPostpone + 1, ';
      }
      values.push(assignedDate);
    }

    if (dueDate) {
      query += 'dueDate = ?, ';
      values.push(dueDate);
    }

    query = query.slice(0, -2);
    query += ' WHERE id = ?';
    values.push(taskId);

    db.query(query, values, (error) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
      }
      res.json({ message: 'Task updated successfully' });
    });

  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
});

app.post('/api/tasks/delete', (req, res) => {
  // console.log(req.body);
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).send('Invalid input');
    }

    const query = 'DELETE FROM tasks WHERE id = ?';
    const values = [id];

    db.query(query, values, (error) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
      }
      res.json({ message: 'Task deleted successfully' });
    });

  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
});

app.get('/api/report/completed', (req, res) => {
  const userId = req.query.uid;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const taskSize = req.query.taskSize || '';

  const query = 'CALL GetCompletedTasksCount(?, ?, ?, ?)';
  db.query(query, [userId, startDate, endDate, taskSize], (error, results) => {
      if (error) return res.status(500).json({ error: error.message });
      res.status(200).json({ completedTasksCount: results[0][0].completedTasksCount });
  });
});

app.get('/api/report/postpones', async (req, res) => {
  const userId = req.query.uid;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const taskSize = req.query.taskSize || '';

  const query = 'CALL GetUserPostponesCount(?, ?, ?, ?)';
  db.query(query, [userId, startDate, endDate, taskSize], (error, results) => {
      // console.log(query, [userId, startDate, endDate, taskSize])
      if (error) return res.status(500).json({ error: error.message });
      res.status(200).json({ totalPostpones: results[0][0].totalPostpones });
  });
});

app.get('/api/report/productive', async (req, res) => {
  const userId = req.query.uid;
  const taskSize = req.query.taskSize || '';

  const query = 'CALL GetMostProductiveDay(?, ?)';
  db.query(query, [userId, taskSize], (error, results) => {
      if (error) return res.status(500).json({ error: error.message });
      res.status(200).json({ productiveDays: results[0][0] });
  });
});

app.get('/api/report/weekend', async (req, res) => {
  const userId = req.query.uid;
  const taskSize = req.query.taskSize || '';

  const query = 'CALL GetWeekendCompletionRate(?, ?)';
  db.query(query, [userId, taskSize], (error, results) => {
      if (error) return res.status(500).json({ error: error.message });
      let weekendCompletionRate = results[0][0].weekendCompletionRate;
      res.status(200).json({ weekendCompletionRate: parseInt(weekendCompletionRate) });
  });
});

app.get('/api/report/total', async (req, res) => {
  const userId = req.query.uid;
  const taskSize = req.query.taskSize || '';

  const query = 'CALL GetTotalCompletedTasks(?, ?)';
  db.query(query, [userId, taskSize], (error, results) => {
      if (error) return res.status(500).json({ error: error.message });
      res.status(200).json({ totalTasksCompleted: results[0][0].totalCompleted });
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});