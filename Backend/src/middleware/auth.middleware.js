const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
};

// Optional authentication - doesn't fail if no token, but verifies if one is provided
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
    } catch (err) {
      // Token is invalid but that's okay, we proceed without auth
      console.log('Invalid token provided, proceeding without auth');
    }
  }
  // Always proceed, with or without auth
  next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: `Access denied: requires one of these roles: ${roles.join(', ')}` });
    }
    next();
  };
};

module.exports = { authenticate, optionalAuth, requireRole };