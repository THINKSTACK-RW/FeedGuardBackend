const jwt = require('jsonwebtoken');

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based Authorization Middleware
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Admin only middleware
const adminOnly = authorizeRole('ADMIN');

// Admin or Ministry middleware
const adminOrMinistryOnly = authorizeRole('ADMIN', 'MINISTRY');

// All authenticated users middleware
const authenticatedOnly = authenticateToken;

module.exports = {
  authenticateToken,
  authorizeRole,
  adminOnly,
  adminOrMinistryOnly,
  authenticatedOnly
};
