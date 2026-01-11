module.exports = (err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    
    // Default to 500 if the error doesn't specify a code
    const statusCode = err.statusCode || 500;
    
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
};