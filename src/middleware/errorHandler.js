export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err?.isAppError && err.code) {
    const status = mapCodeToStatus(err.code);
    res.status(status).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: {
      code: "internalServerError",
      message: "Internal server error",
    },
  });
}

/**
 * @param {string} code
 */
function mapCodeToStatus(code) {
  if (code === "fitnessGoalNotFound" || code === "exerciseNotFound") {
    return 404;
  }
  if (code === "duplicateFitnessGoalName") {
    return 409;
  }
  return 400;
}
