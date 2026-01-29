const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('[Auth] Authorization header:', authHeader);

    const token = authHeader?.split(' ')[1];
    if (!token) {
      console.warn('[Auth] Token missing in Authorization header');
      return res.status(401).json({ error: 'Unauthorized: Token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('[Auth] Token verified successfully, decoded payload:', decoded);

    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    console.error('[Auth] Token verification failed:', err.message);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};


