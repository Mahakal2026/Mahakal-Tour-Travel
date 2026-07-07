/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry found",
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // Default server error
  const isProd = process.env.NODE_ENV === "production";
  res.status(err.statusCode || 500).json({
    success: false,
    message: isProd ? "Internal Server Error" : (err.message || "Internal Server Error"),
    ...(isProd ? {} : { stack: err.stack }),
  });
};

module.exports = errorHandler;
