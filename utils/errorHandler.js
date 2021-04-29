class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

const handleError = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message,
    status: 'error',
    data: null,
  });
};

module.exports = {
  ErrorHandler,
  handleError,
};
