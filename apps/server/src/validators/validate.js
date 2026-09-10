export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.validated = parsed;
    next();
  } catch (error) {
    if (error.name === "ZodError") {
      const fieldErrors = error.errors.reduce((acc, curr) => {
        const path = curr.path.length > 1 ? curr.path.slice(1).join(".") : curr.path[0];
        acc[path] = curr.message;
        return acc;
      }, {});

      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: fieldErrors,
      });
    }
    next(error);
  }
};
