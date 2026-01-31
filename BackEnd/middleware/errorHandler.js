const errorHandler = (err, req, res, next) => {
    // Default error status and message
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Log the error for internal debugging
    console.error(`\x1b[31m[ERROR] ${req.method} ${req.url}:\x1b[0m`, err.stack);

    // Mongoose Validation Error (e.g., missing required fields)
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    // Mongoose Duplicate Key Error (e.g., email already exists)
    if (err.code === 11000) {
        statusCode = 400;
        message = `Duplicate field value entered: ${Object.keys(err.keyValue)}`;
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = "Invalid token. Please log in again.";
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = "Session expired. Please log in again.";
    }

    // Send formatted JSON response to Frontend
    res.status(statusCode).json({
        success: false,
        error: message,
        // Include stack trace only in development mode for security
        stack: process.env.NODE_ENV === 'development' ? err.stack : null
    });
};

module.exports = errorHandler;