const error = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    error: err.message,
    stack: process.env.NODE_ENV === "dev" ? err.stack : null,
  });
};
module.exports = error;
