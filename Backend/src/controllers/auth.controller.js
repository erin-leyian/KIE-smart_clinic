const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
  isValidEmail, 
  isValidPassword, 
  isValidPhone, 
  isValidUUID,
  isValidRole,
  isValidGender,
  generateUUID,
  isMinLength,
  sanitizeInput
} = require('../utils/validation');
const { 
  sendSuccess, 
  sendError, 
  sendValidationError,
  formatUserResponse,
  getPaginationParams,
  buildPaginationResponse
} = require('../utils/responseFormatter');

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'patient', phone, dateOfBirth, gender, address, city, state } = req.body;

    // Validation
    const errors = [];

    if (!firstName || !firstName.trim()) errors.push('firstName is required');
    if (!lastName || !lastName.trim()) errors.push('lastName is required');
    if (!email) errors.push('email is required');
    else if (!isValidEmail(email)) errors.push('email format is invalid');
    if (!password) errors.push('password is required');
    else if (!isValidPassword(password)) errors.push('password must be at least 8 characters');
    if (!isValidRole(role)) errors.push(`role must be one of: patient, doctor, admin`);
    if (phone && !isValidPhone(phone)) errors.push('phone format is invalid');
    if (gender && !isValidGender(gender)) errors.push('gender must be: male, female, or other');

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    // Check if email already exists
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingUser.length > 0) {
      return sendError(res, 'Email already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateUUID();

    // Insert user
    await pool.query(
      `INSERT INTO users (id, firstName, lastName, email, password, role, phone, dateOfBirth, gender, address, city, state)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        sanitizeInput(firstName),
        sanitizeInput(lastName),
        email.toLowerCase(),
        hashedPassword,
        role,
        phone || null,
        dateOfBirth || null,
        gender || null,
        address || null,
        city || null,
        state || null
      ]
    );

    // Fetch created user
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = users[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return sendSuccess(
      res,
      {
        user: formatUserResponse(user),
        token,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    return sendError(res, 'Registration failed', 500, error.message);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    const errors = [];
    if (!email) errors.push('email is required');
    if (!password) errors.push('password is required');

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    // Find user by email
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const user = users[0];

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return sendSuccess(
      res,
      {
        user: formatUserResponse(user),
        token,
      },
      'Login successful'
    );
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Login failed', 500, error.message);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, { user: formatUserResponse(users[0]) });
  } catch (error) {
    console.error('Get current user error:', error);
    return sendError(res, 'Failed to fetch user', 500, error.message);
  }
};

// ── GET /api/auth/users ───────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const { offset } = getPaginationParams({ page, limit });

    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    // Apply filters
    if (role) {
      if (!isValidRole(role)) {
        return sendError(res, 'Invalid role filter', 400);
      }
      query += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)';
      const searchPattern = `%${sanitizeInput(search)}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Get paginated results
    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    const [users] = await pool.query(query, [...params, parseInt(limit), offset]);

    const formattedUsers = users.map(formatUserResponse);

    return sendSuccess(
      res,
      buildPaginationResponse(formattedUsers, total, parseInt(page), parseInt(limit))
    );
  } catch (error) {
    console.error('Get all users error:', error);
    return sendError(res, 'Failed to fetch users', 500, error.message);
  }
};

// ── GET /api/auth/users/:id ───────────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID
    if (!isValidUUID(id)) {
      return sendError(res, 'Invalid user ID format', 400);
    }

    // Check authorization - user can only view their own profile or admin can view any
    if (req.user.id !== id && req.user.role !== 'admin') {
      return sendError(res, 'Access denied', 403);
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, { user: formatUserResponse(users[0]) });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return sendError(res, 'Failed to fetch user', 500, error.message);
  }
};

// ── PUT /api/auth/users/:id ───────────────────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, dateOfBirth, gender, address, city, state } = req.body;

    // Validate UUID
    if (!isValidUUID(id)) {
      return sendError(res, 'Invalid user ID format', 400);
    }

    // Check authorization
    if (req.user.id !== id && req.user.role !== 'admin') {
      return sendError(res, 'Access denied', 403);
    }

    // Check user exists
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return sendError(res, 'User not found', 404);
    }

    // Validation
    const errors = [];
    if (firstName && !firstName.trim()) errors.push('firstName cannot be empty');
    if (lastName && !lastName.trim()) errors.push('lastName cannot be empty');
    if (phone && !isValidPhone(phone)) errors.push('phone format is invalid');
    if (gender && !isValidGender(gender)) errors.push('gender must be: male, female, or other');

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    // Build update query dynamically
    const updates = [];
    const updateParams = [];

    if (firstName !== undefined) {
      updates.push('firstName = ?');
      updateParams.push(sanitizeInput(firstName));
    }
    if (lastName !== undefined) {
      updates.push('lastName = ?');
      updateParams.push(sanitizeInput(lastName));
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      updateParams.push(phone || null);
    }
    if (dateOfBirth !== undefined) {
      updates.push('dateOfBirth = ?');
      updateParams.push(dateOfBirth || null);
    }
    if (gender !== undefined) {
      updates.push('gender = ?');
      updateParams.push(gender || null);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      updateParams.push(address || null);
    }
    if (city !== undefined) {
      updates.push('city = ?');
      updateParams.push(city || null);
    }
    if (state !== undefined) {
      updates.push('state = ?');
      updateParams.push(state || null);
    }

    if (updates.length === 0) {
      return sendError(res, 'No fields to update', 400);
    }

    // Execute update
    updates.push('updatedAt = CURRENT_TIMESTAMP');
    const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    updateParams.push(id);

    await pool.query(updateQuery, updateParams);

    // Fetch updated user
    const [updatedUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);

    return sendSuccess(
      res,
      { user: formatUserResponse(updatedUsers[0]) },
      'Profile updated successfully'
    );
  } catch (error) {
    console.error('Update user error:', error);
    return sendError(res, 'Failed to update profile', 500, error.message);
  }
};

// ── DELETE /api/auth/users/:id ────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmation } = req.body;

    // Validate UUID
    if (!isValidUUID(id)) {
      return sendError(res, 'Invalid user ID format', 400);
    }

    // Check authorization - only admin or self
    if (req.user.id !== id && req.user.role !== 'admin') {
      return sendError(res, 'Access denied', 403);
    }

    // Require confirmation
    if (!confirmation) {
      return sendError(res, 'Confirmation required', 400);
    }

    // Check user exists
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return sendError(res, 'User not found', 404);
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    return sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    return sendError(res, 'Failed to delete user', 500, error.message);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};