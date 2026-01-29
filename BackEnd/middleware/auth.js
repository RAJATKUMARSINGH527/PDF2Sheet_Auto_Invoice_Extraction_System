const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const xAuthToken = req.headers['x-auth-token'];
    const queryToken = req.query.token;

    // 1. Log the incoming attempt with some style
    console.log(`\x1b[35m[AUTH CHECK]\x1b[0m ${req.method} ${req.originalUrl}`);

    // 2. Token Extraction (Check both Authorization and x-auth-token)
    let token = "";
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (xAuthToken) {
      token = xAuthToken;
    }else if (queryToken) {
    token = queryToken;
  }

    if (!token) {
      console.warn('\x1b[33m[Auth Warning]\x1b[0m Access Denied: No token found in headers.');
      return res.status(401).json({ error: 'Unauthorized: Access Denied' });
    }

    // 3. Verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // 4. Payload Normalization
    // Some routes use req.user.id, others use req.user.user.id. This fixes both.
    req.user = decoded.user ? decoded.user : decoded;

    console.log(`\x1b[32m[Auth Success]\x1b[0m User: ${req.user.id || 'Authenticated'}`);
    next();
  } catch (err) {
    console.error(`\x1b[31m[Auth Error]\x1b[0m Verification failed: ${err.message}`);
    
    // Specifically handle expired tokens vs malformed ones
    const errorMessage = err.name === 'TokenExpiredError' 
      ? 'Session expired. Please login again.' 
      : 'Invalid token.';
      
    res.status(401).json({ error: `Unauthorized: ${errorMessage}` });
  }
};