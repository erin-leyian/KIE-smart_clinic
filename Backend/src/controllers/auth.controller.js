const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password, role, clinicId } = req.body;

  if (!firstName || !lastName || !email || !password || !role || !clinicId) {
    return res.status(400).json({ error: 'firstName, lastName, email, password, role and clinicId are required' });
  }

  const validRoles = ['Receptionist', 'Nurse', 'Doctor', 'Admin', 'Other'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `role must be one of: ${validRoles.join(', ')}` });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO ClinicStaff (ClinicID, FirstName, LastName, Email, PhoneNumber, Role, PasswordHash) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [clinicId, firstName, lastName, email, phoneNumber || null, role, hashedPassword]
    );
    res.status(201).json({ message: 'Staff registered successfully', staffId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email or phone number already exists' });
    }
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM ClinicStaff WHERE Email = ? AND IsActive = 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const staff = rows[0];
    const match = await bcrypt.compare(password, staff.PasswordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        staffId: staff.StaffID,
        email: staff.Email,
        role: staff.Role,
        clinicId: staff.ClinicID,
        name: `${staff.FirstName} ${staff.LastName}`
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      role: staff.Role,
      name: `${staff.FirstName} ${staff.LastName}`
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};

module.exports = { register, login };