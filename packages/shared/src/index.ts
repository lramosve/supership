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

export const findingSeveritySchema = z.enum([
  'low',
  'medium',
  'high',
]);

export const findingStatusSchema = z.enum([
  'open',
  'in_review',
  'resolved',
]);

export const traceEventKindSchema = z.enum([
  'document_created',
  'document_updated',
  'finding_detected',
  'chat_generated',
  'status_changed',
]);

export const chatRoleSchema = z.enum([
  'user',
  'assistant',
  'system',
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

export const findingSchema = z.object({
  id: z.string().min(1),
  documentId: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  severity: findingSeveritySchema,
  status: findingStatusSchema,
  createdAt: isoTimestampSchema,
  updatedAt: isoTimestampSchema,
});

export const traceEventSchema = z.object({
  id: z.string().min(1),
  documentId: z.string().min(1),
  kind: traceEventKindSchema,
  actorId: z.string().min(1),
  summary: z.string().min(1),
  createdAt: isoTimestampSchema,
});

export const chatMessageSchema = z.object({
  id: z.string().min(1),
  documentId: z.string().min(1),
  role: chatRoleSchema,
  content: z.string().min(1),
  createdAt: isoTimestampSchema,
});

export const createChatMessageInputSchema = z.object({
  documentId: z.string().min(1),
  content: z.string().min(1),
});

export const documentFindingsResponseSchema = z.object({
  findings: z.array(findingSchema),
  total: z.number().int().nonnegative(),
});

export const documentTraceResponseSchema = z.object({
  events: z.array(traceEventSchema),
  total: z.number().int().nonnegative(),
});

export const documentChatResponseSchema = z.object({
  messages: z.array(chatMessageSchema),
  total: z.number().int().nonnegative(),
});

export type DocumentType = z.infer<typeof documentTypeSchema>;
export type DocumentStatus = z.infer<typeof documentStatusSchema>;
export type FindingSeverity = z.infer<typeof findingSeveritySchema>;
export type FindingStatus = z.infer<typeof findingStatusSchema>;
export type TraceEventKind = z.infer<typeof traceEventKindSchema>;
export type ChatRole = z.infer<typeof chatRoleSchema>;
export type Document = z.infer<typeof documentSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentInputSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentInputSchema>;
export type DocumentListResponse = z.infer<typeof documentListResponseSchema>;
export type DocumentMetaResponse = z.infer<typeof documentMetaResponseSchema>;
export type Finding = z.infer<typeof findingSchema>;
export type TraceEvent = z.infer<typeof traceEventSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type CreateChatMessageInput = z.infer<typeof createChatMessageInputSchema>;
export type DocumentFindingsResponse = z.infer<typeof documentFindingsResponseSchema>;
export type DocumentTraceResponse = z.infer<typeof documentTraceResponseSchema>;
export type DocumentChatResponse = z.infer<typeof documentChatResponseSchema>;

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

export const seededFindings: Finding[] = [
  {
    id: 'finding-program-risk',
    documentId: 'doc-program-alpha',
    title: 'Program coordination risk',
    summary: 'Cross-team dependency tracking is light for the next milestone.',
    severity: 'high',
    status: 'open',
    createdAt: '2025-01-05T09:00:00.000Z',
    updatedAt: '2025-01-05T09:00:00.000Z',
  },
  {
    id: 'finding-project-coverage',
    documentId: 'doc-project-doc-model',
    title: 'Schema coverage gap',
    summary: 'Association and comment models are not yet implemented.',
    severity: 'medium',
    status: 'in_review',
    createdAt: '2025-01-05T10:00:00.000Z',
    updatedAt: '2025-01-05T10:30:00.000Z',
  },
  {
    id: 'finding-week-plan-scope',
    documentId: 'doc-weekly-plan-001',
    title: 'Weekly scope is still broad',
    summary: 'The weekly plan spans multiple execution tracks and needs tighter sequencing.',
    severity: 'medium',
    status: 'open',
    createdAt: '2025-01-05T11:00:00.000Z',
    updatedAt: '2025-01-05T11:00:00.000Z',
  },
];

export const seededTraceEvents: TraceEvent[] = [
  {
    id: 'trace-program-created',
    documentId: 'doc-program-alpha',
    kind: 'document_created',
    actorId: 'person-ava',
    summary: 'Program Alpha was created as the top-level rebuild container.',
    createdAt: '2025-01-01T09:00:00.000Z',
  },
  {
    id: 'trace-program-finding',
    documentId: 'doc-program-alpha',
    kind: 'finding_detected',
    actorId: 'system-fleetgraph',
    summary: 'The findings engine flagged a coordination risk.',
    createdAt: '2025-01-05T09:00:00.000Z',
  },
  {
    id: 'trace-project-updated',
    documentId: 'doc-project-doc-model',
    kind: 'document_updated',
    actorId: 'person-maya',
    summary: 'The shared schema package was expanded with frontend-safe contracts.',
    createdAt: '2025-01-02T11:00:00.000Z',
  },
  {
    id: 'trace-week-status',
    documentId: 'doc-weekly-plan-001',
    kind: 'status_changed',
    actorId: 'person-ava',
    summary: 'The weekly plan remained in draft while sequencing was refined.',
    createdAt: '2025-01-03T12:00:00.000Z',
  },
];

export const seededChatMessages: ChatMessage[] = [
  {
    id: 'chat-program-user',
    documentId: 'doc-program-alpha',
    role: 'user',
    content: 'What should I watch most closely in this program?',
    createdAt: '2025-01-05T09:05:00.000Z',
  },
  {
    id: 'chat-program-assistant',
    documentId: 'doc-program-alpha',
    role: 'assistant',
    content: 'Watch dependency sequencing and ownership clarity across the rebuild milestones.',
    createdAt: '2025-01-05T09:05:10.000Z',
  },
  {
    id: 'chat-project-assistant',
    documentId: 'doc-project-doc-model',
    role: 'assistant',
    content: 'This project is healthy structurally, but associations and history remain the largest parity gaps.',
    createdAt: '2025-01-05T10:35:00.000Z',
  },
];
