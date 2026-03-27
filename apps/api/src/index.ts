import express, { type Express } from 'express';
import cors from 'cors';
import {
  createDocumentInputSchema,
  documentMetaResponseSchema,
  documentStatusSchema,
  documentTypeSchema,
  documentListResponseSchema,
  documentSchema,
  seededDocuments,
  type CreateDocumentInput,
  type Document,
  type UpdateDocumentInput,
  updateDocumentInputSchema,
} from '@supership/shared';

type DocumentRepository = {
  list: () => Document[];
  getById: (id: string) => Document | undefined;
  create: (input: CreateDocumentInput) => Document;
  update: (id: string, input: UpdateDocumentInput) => Document | undefined;
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

export const documentRepository = new InMemoryDocumentRepository(seededDocuments);

export function createApp(repository: DocumentRepository = documentRepository): Express {
  const app: Express = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      app: 'supership-api',
      concept: 'everything-is-a-document',
      repository: 'in-memory-documents',
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
    res.json(
      documentListResponseSchema.parse({
        documents: repository.list(),
        total: repository.list().length,
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
