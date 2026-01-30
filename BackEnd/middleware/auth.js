const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const xAuthToken = req.headers['x-auth-token'];
    const queryToken = req.query.token;

    console.log(`\x1b[35m[AUTH CHECK]\x1b[0m ${req.method} ${req.originalUrl}`);

    let token = "";
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (xAuthToken) {
      token = xAuthToken;
    } else if (queryToken) {
      token = queryToken;
    }

    if (!token) {
      console.warn('\x1b[33m[Auth Warning]\x1b[0m No token found in request.');
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // --- DEEP DEBUG LOG ---
    // This will show us if the token has 'id', '_id', or 'user'
    console.log(`\x1b[90m[DEBUG]\x1b[0m Decoded Token: ${JSON.stringify(decoded)}`);

    // Payload Normalization
    // We ensure req.user always has an 'id' property regardless of how it was signed
    const userData = decoded.user ? decoded.user : decoded;
    req.user = {
      ...userData,
      id: userData.id || userData._id // Ensure 'id' exists even if DB used '_id'
    };

    console.log(`\x1b[32m[Auth Success]\x1b[0m Verified User ID: ${req.user.id}`);
    next();
  } catch (err) {
    console.error(`\x1b[31m[Auth Error]\x1b[0m ${err.message}`);
    const errorMessage = err.name === 'TokenExpiredError' 
      ? 'Session expired.' 
      : 'Invalid token.';
    res.status(401).json({ error: errorMessage });
  }
};