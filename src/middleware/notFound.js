export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: "notFound",
      message: `No route for ${req.method} ${req.originalUrl}`,
    },
  });
}
