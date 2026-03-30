const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');
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

// Supabase REST API helper - bypasses schema cache issues
async function supabaseQuery(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${process.env.SUPABASE_URL}/rest/v1${endpoint}`);
    const headers = {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation',
    };

    const req = https.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ data: result, status: res.statusCode, error: null });
        } catch (e) {
          resolve({ data: null, status: res.statusCode, error: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

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
    const { data: existing } = await supabaseQuery('GET', `/users?email=eq.${encodeURIComponent(email.toLowerCase())}`);
    
    if (Array.isArray(existing) && existing.length > 0) {
      return sendError(res, 'Email already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateUUID();

    // Insert user via REST API - use snake_case for column names
    const { data: insertedUsers, status } = await supabaseQuery('POST', '/users', {
      id: userId,
      first_name: sanitizeInput(firstName),
      last_name: sanitizeInput(lastName),
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    if (status !== 201 && status !== 200) {
      throw new Error(`Failed to create user: ${JSON.stringify(insertedUsers)}`);
    }

    const user = Array.isArray(insertedUsers) ? insertedUsers[0] : insertedUsers;

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
    const { data: users } = await supabaseQuery('GET', `/users?email=eq.${encodeURIComponent(email.toLowerCase())}`);

    if (!Array.isArray(users) || users.length === 0) {
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

    const { data: users } = await supabaseQuery('GET', `/users?id=eq.${userId}`);

    if (!Array.isArray(users) || users.length === 0) {
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

    // Validation
    if (role && !isValidRole(role)) {
      return sendError(res, 'Invalid role filter', 400);
    }

    // Build query params
    let endpoint = '/users?select=*';
    
    if (role) {
      endpoint += `&role=eq.${role}`;
    }

    // Apply pagination
    endpoint += `&order=createdAt.desc&offset=${offset}&limit=${limit}`;

    // Get data
    const { data: users } = await supabaseQuery('GET', endpoint);
    const userList = Array.isArray(users) ? users : [];

    // Filter by search if provided
    let filtered = userList;
    if (search) {
      const searchLower = sanitizeInput(search).toLowerCase();
      filtered = userList.filter(u =>
        u.firstName?.toLowerCase().includes(searchLower) ||
        u.lastName?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower)
      );
    }

    const formattedUsers = filtered.map(formatUserResponse);

    return sendSuccess(
      res,
      buildPaginationResponse(formattedUsers, filtered.length, parseInt(page), parseInt(limit))
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

    const { data: users } = await supabaseQuery('GET', `/users?id=eq.${id}`);

    if (!Array.isArray(users) || users.length === 0) {
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
    const { data: users } = await supabaseQuery('GET', `/users?id=eq.${id}`);
    if (!Array.isArray(users) || users.length === 0) {
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

    // Build update object
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = sanitizeInput(firstName);
    if (lastName !== undefined) updateData.lastName = sanitizeInput(lastName);
    if (phone !== undefined) updateData.phone = phone || null;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth || null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (address !== undefined) updateData.address = address || null;
    if (city !== undefined) updateData.city = city || null;
    if (state !== undefined) updateData.state = state || null;

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 'No fields to update', 400);
    }

    // Execute update
    const { data: updatedUsers } = await supabaseQuery('PATCH', `/users?id=eq.${id}`, updateData);

    const user = Array.isArray(updatedUsers) ? updatedUsers[0] : updatedUsers;

    return sendSuccess(
      res,
      { user: formatUserResponse(user) },
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
    const { data: users } = await supabaseQuery('GET', `/users?id=eq.${id}`);
    if (!Array.isArray(users) || users.length === 0) {
      return sendError(res, 'User not found', 404);
    }

    // Delete user
    await supabaseQuery('DELETE', `/users?id=eq.${id}`);

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