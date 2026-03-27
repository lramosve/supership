import { z } from 'zod';

export const documentTypeSchema = z.enum([
  'wiki',
  'issue',
  'program',
  'project',
  'week',
  'weekly_plan',
  'weekly_retro',
  'person',
  'view',
]);

export const documentStatusSchema = z.enum([
  'draft',
  'active',
  'archived',
]);

export const isoTimestampSchema = z.string().datetime();

export const documentSchema = z.object({
  id: z.string().min(1),
  type: documentTypeSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  content: z.string(),
  status: documentStatusSchema,
  ownerId: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  createdAt: isoTimestampSchema,
  updatedAt: isoTimestampSchema,
});

export const createDocumentInputSchema = documentSchema.pick({
  type: true,
  title: true,
  summary: true,
  content: true,
  status: true,
  ownerId: true,
  tags: true,
});

export const updateDocumentInputSchema = createDocumentInputSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field must be provided when updating a document.',
);

export const documentListResponseSchema = z.object({
  documents: z.array(documentSchema),
  total: z.number().int().nonnegative(),
});

export const documentMetaResponseSchema = z.object({
  documentTypes: z.array(documentTypeSchema),
  documentStatuses: z.array(documentStatusSchema),
});

export type DocumentType = z.infer<typeof documentTypeSchema>;
export type DocumentStatus = z.infer<typeof documentStatusSchema>;
export type Document = z.infer<typeof documentSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentInputSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentInputSchema>;
export type DocumentListResponse = z.infer<typeof documentListResponseSchema>;
export type DocumentMetaResponse = z.infer<typeof documentMetaResponseSchema>;

export const superShipPrinciples = {
  everythingIsADocument: true,
  plansAreTheUnitOfIntent: true,
  serverIsSourceOfTruth: true,
} as const;

export const seededDocuments: Document[] = [
  {
    id: 'doc-program-alpha',
    type: 'program',
    title: 'Program Alpha',
    summary: 'Top-level program document coordinating the rebuild effort.',
    content: 'Program Alpha tracks the phased SuperShip rebuild and keeps delivery aligned.',
    status: 'active',
    ownerId: 'person-ava',
    tags: ['roadmap', 'delivery'],
    createdAt: '2025-01-01T09:00:00.000Z',
    updatedAt: '2025-01-01T09:00:00.000Z',
  },
  {
    id: 'doc-project-doc-model',
    type: 'project',
    title: 'Unified Document Model',
    summary: 'Core project turning every planning object into a first-class document.',
    content: 'The unified document model defines shared behavior for wiki pages, issues, plans, and people.',
    status: 'active',
    ownerId: 'person-maya',
    tags: ['architecture', 'core'],
    createdAt: '2025-01-02T09:00:00.000Z',
    updatedAt: '2025-01-02T09:00:00.000Z',
  },
  {
    id: 'doc-weekly-plan-001',
    type: 'weekly_plan',
    title: 'Week 1 plan',
    summary: 'Initial execution plan for backend and frontend scaffolding.',
    content: 'Week 1 focuses on shared schemas, core API routes, and the first document-oriented web shell.',
    status: 'draft',
    ownerId: 'person-ava',
    tags: ['planning', 'week-1'],
    createdAt: '2025-01-03T09:00:00.000Z',
    updatedAt: '2025-01-03T09:00:00.000Z',
  },
];
