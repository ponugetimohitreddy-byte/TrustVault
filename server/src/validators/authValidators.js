const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email().transform((v) => v.toLowerCase().trim()),
    password: z.string().min(8).max(128),
  }),
  params: z.any().optional(),
  query: z.any().optional(),
});

module.exports = { loginSchema };
