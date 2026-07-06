const { z } = require("zod");

/**
 * Middleware to validate request data against a Zod schema.
 * @param {z.AnyZodObject | z.ZodOptional<z.AnyZodObject>} schema Zod schema
 * @param {'body' | 'query' | 'params'} source the property of req to validate (default: 'body')
 */
const validate = (schema, source = "body") => {
  return async (req, res, next) => {
    try {
      req[source] = await schema.parseAsync(req[source]);
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      next(error);
    }
  };
};

module.exports = validate;
