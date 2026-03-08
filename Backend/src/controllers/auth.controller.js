const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Fake users — remove when DB is connected
const fakeUsers = [
  { user_id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { user_id: 2, username: 'receptionist', password: 'recep123', role: 'receptionist' },
];

const register = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'username, password, and role are required' });
  }

  // TODO: replace with real DB insert when connected
  // const hashedPassword = await bcrypt.hash(password, 10);
  // const [result] = await pool.query('INSERT INTO users ...', [...]);

  const exists = fakeUsers.find(u => u.username === username);
  if (exists) return res.status(409).json({ error: 'Username already exists' });

  const newUser = { user_id: fakeUsers.length + 1, username, password, role };
  fakeUsers.push(newUser);
  res.status(201).json({ message: 'User registered', user_id: newUser.user_id });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  // TODO: replace with real DB query when connected
  // const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

  const user = fakeUsers.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { user_id: user.user_id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ message: 'Login successful', token, role: user.role });
};

module.exports = { register, login };