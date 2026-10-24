const { z } = require('zod');
const { objectId } = require('./userValidators');

const visibilityEnum = z.enum(['private', 'restricted', 'organization']);

const createDocumentSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    visibility: visibilityEnum.optional(),
    allowDownload: z
      .union([z.boolean(), z.enum(['true', 'false'])])
      .optional()
      .transform((v) => (typeof v === 'string' ? v === 'true' : v)),
    publisherId: objectId.optional(),
  }),
  params: z.any().optional(),
  query: z.any().optional(),
});

const updateDocumentSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    allowDownload: z.boolean().optional(),
    publisherId: objectId.optional(),
    changeDescription: z.string().max(500).optional(),
  }),
  params: z.object({ id: objectId }),
  query: z.any().optional(),
});

const visibilitySchema = z.object({
  body: z.object({
    visibility: visibilityEnum,
  }),
  params: z.object({ id: objectId }),
  query: z.any().optional(),
});

const permissionSchema = z.object({
  body: z.object({
    permission: z.enum(['editor', 'viewer']),
  }),
  params: z.object({
    id: objectId,
    userId: objectId,
  }),
  query: z.any().optional(),
});

const documentIdSchema = z.object({
  body: z.any().optional(),
  params: z.object({ id: objectId }),
  query: z.any().optional(),
});

module.exports = {
  createDocumentSchema,
  updateDocumentSchema,
  visibilitySchema,
  permissionSchema,
  documentIdSchema,
};
