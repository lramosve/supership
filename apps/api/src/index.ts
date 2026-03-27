import express, { type Express } from 'express';
import cors from 'cors';
import {
  chatMessageSchema,
  createChatMessageInputSchema,
  createDocumentInputSchema,
  documentChatResponseSchema,
  documentFindingsResponseSchema,
  documentListResponseSchema,
  documentMetaResponseSchema,
  documentSchema,
  documentStatusSchema,
  documentTraceResponseSchema,
  documentTypeSchema,
  seededChatMessages,
  seededDocuments,
  seededFindings,
  seededTraceEvents,
  traceEventSchema,
  type ChatMessage,
  type CreateChatMessageInput,
  type CreateDocumentInput,
  type Document,
  type Finding,
  type TraceEvent,
  type UpdateDocumentInput,
  updateDocumentInputSchema,
} from '@supership/shared';

type DocumentRepository = {
  list: () => Document[];
  getById: (id: string) => Document | undefined;
  create: (input: CreateDocumentInput) => Document;
  update: (id: string, input: UpdateDocumentInput) => Document | undefined;
};

type ParityRepository = {
  listFindings: (documentId: string) => Finding[];
  listTraceEvents: (documentId: string) => TraceEvent[];
  listChatMessages: (documentId: string) => ChatMessage[];
  createChatMessage: (input: CreateChatMessageInput) => ChatMessage[];
};

class InMemoryDocumentRepository implements DocumentRepository {
  private documents: Document[];

  constructor(initialDocuments: Document[]) {
    this.documents = [...initialDocuments];
  }

  list(): Document[] {
    return [...this.documents].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  getById(id: string): Document | undefined {
    return this.documents.find((document) => document.id === id);
  }

  create(input: CreateDocumentInput): Document {
    const timestamp = new Date().toISOString();
    const document: Document = documentSchema.parse({
      id: `doc-${Math.random().toString(36).slice(2, 10)}`,
      ...input,
      tags: input.tags ?? [],
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    this.documents = [document, ...this.documents];
    return document;
  }

  update(id: string, input: UpdateDocumentInput): Document | undefined {
    const current = this.getById(id);
    if (!current) {
      return undefined;
    }

    const updated = documentSchema.parse({
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
    });

    this.documents = this.documents.map((document) => (document.id === id ? updated : document));
    return updated;
  }
}

class InMemoryParityRepository implements ParityRepository {
  private findings: Finding[];
  private traceEvents: TraceEvent[];
  private chatMessages: ChatMessage[];

  constructor(initialFindings: Finding[], initialTraceEvents: TraceEvent[], initialChatMessages: ChatMessage[]) {
    this.findings = [...initialFindings];
    this.traceEvents = [...initialTraceEvents];
    this.chatMessages = [...initialChatMessages];
  }

  listFindings(documentId: string): Finding[] {
    return this.findings.filter((finding) => finding.documentId === documentId);
  }

  listTraceEvents(documentId: string): TraceEvent[] {
    return this.traceEvents
      .filter((event) => event.documentId === documentId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  listChatMessages(documentId: string): ChatMessage[] {
    return this.chatMessages
      .filter((message) => message.documentId === documentId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  createChatMessage(input: CreateChatMessageInput): ChatMessage[] {
    const timestamp = new Date().toISOString();
    const userMessage = chatMessageSchema.parse({
      id: `chat-user-${Math.random().toString(36).slice(2, 10)}`,
      documentId: input.documentId,
      role: 'user',
      content: input.content,
      createdAt: timestamp,
    });

    const assistantMessage = chatMessageSchema.parse({
      id: `chat-assistant-${Math.random().toString(36).slice(2, 10)}`,
      documentId: input.documentId,
      role: 'assistant',
      content: `SuperShip assistant: focus on the next highest-risk action for ${input.documentId} and trace it back to the document history and open findings.`,
      createdAt: new Date(Date.now() + 1000).toISOString(),
    });

    const chatTrace = traceEventSchema.parse({
      id: `trace-chat-${Math.random().toString(36).slice(2, 10)}`,
      documentId: input.documentId,
      kind: 'chat_generated',
      actorId: 'system-fleetgraph',
      summary: 'A parity chat response was generated for the selected document.',
      createdAt: assistantMessage.createdAt,
    });

    this.chatMessages = [...this.chatMessages, userMessage, assistantMessage];
    this.traceEvents = [...this.traceEvents, chatTrace];
    return [userMessage, assistantMessage];
  }
}

export const documentRepository = new InMemoryDocumentRepository(seededDocuments);
export const parityRepository = new InMemoryParityRepository(seededFindings, seededTraceEvents, seededChatMessages);

export function createApp(
  repository: DocumentRepository = documentRepository,
  parity: ParityRepository = parityRepository,
): Express {
  const app: Express = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      app: 'supership-api',
      concept: 'everything-is-a-document',
      repository: 'in-memory-documents',
      parity: 'findings-trace-chat',
    });
  });

  app.get('/api/meta/document-types', (_req, res) => {
    res.json(
      documentMetaResponseSchema.parse({
        documentTypes: documentTypeSchema.options,
        documentStatuses: documentStatusSchema.options,
      }),
    );
  });

  app.get('/api/documents', (_req, res) => {
    const documents = repository.list();
    res.json(
      documentListResponseSchema.parse({
        documents,
        total: documents.length,
      }),
    );
  });

  app.get('/api/documents/:id', (req, res) => {
    const document = repository.getById(req.params.id);
    if (!document) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }

    res.json(documentSchema.parse(document));
  });

  app.post('/api/documents', (req, res) => {
    const parsed = createDocumentInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const document = repository.create(parsed.data);
    res.status(201).json(documentSchema.parse(document));
  });

  app.patch('/api/documents/:id', (req, res) => {
    const parsed = updateDocumentInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const document = repository.update(req.params.id, parsed.data);
    if (!document) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }

    res.json(documentSchema.parse(document));
  });

  app.get('/api/documents/:id/findings', (req, res) => {
    const findings = parity.listFindings(req.params.id);
    res.json(documentFindingsResponseSchema.parse({ findings, total: findings.length }));
  });

  app.get('/api/documents/:id/trace', (req, res) => {
    const events = parity.listTraceEvents(req.params.id);
    res.json(documentTraceResponseSchema.parse({ events, total: events.length }));
  });

  app.get('/api/documents/:id/chat', (req, res) => {
    const messages = parity.listChatMessages(req.params.id);
    res.json(documentChatResponseSchema.parse({ messages, total: messages.length }));
  });

  app.post('/api/documents/:id/chat', (req, res) => {
    const parsed = createChatMessageInputSchema.safeParse({
      documentId: req.params.id,
      content: req.body?.content,
    });

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const messages = parity.createChatMessage(parsed.data);
    res.status(201).json(documentChatResponseSchema.parse({ messages, total: messages.length }));
  });

  return app;
}

const app = createApp();
const port = Number(process.env.PORT || 3000);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`SuperShip API listening on http://localhost:${port}`);
  });
}

export { app };
