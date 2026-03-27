import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './index';
import {
  seededChatMessages,
  seededDocuments,
  seededFindings,
  seededTraceEvents,
  type ChatMessage,
  type Document,
  type Finding,
  type TraceEvent,
} from '@supership/shared';

function cloneSeededDocuments(): Document[] {
  return seededDocuments.map((document) => ({ ...document, tags: [...document.tags] }));
}

function cloneSeededFindings(): Finding[] {
  return seededFindings.map((finding) => ({ ...finding }));
}

function cloneSeededTraceEvents(): TraceEvent[] {
  return seededTraceEvents.map((event) => ({ ...event }));
}

function cloneSeededChatMessages(): ChatMessage[] {
  return seededChatMessages.map((message) => ({ ...message }));
}

describe('api document service', () => {
  it('reports health', async () => {
    const app = createApp();
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.concept).toBe('everything-is-a-document');
    expect(response.body.repository).toBe('in-memory-documents');
    expect(response.body.parity).toBe('findings-trace-chat');
  });

  it('lists seeded documents and metadata', async () => {
    const app = createApp();

    const documentsResponse = await request(app).get('/api/documents');
    expect(documentsResponse.status).toBe(200);
    expect(documentsResponse.body.total).toBe(3);
    expect(documentsResponse.body.documents[0].id).toBeDefined();

    const metaResponse = await request(app).get('/api/meta/document-types');
    expect(metaResponse.status).toBe(200);
    expect(metaResponse.body.documentTypes).toContain('program');
    expect(metaResponse.body.documentStatuses).toContain('draft');
  });

  it('creates, fetches, and updates a document', async () => {
    const app = createApp({
      list: () => cloneSeededDocuments(),
      getById: (id: string) => cloneSeededDocuments().find((document) => document.id === id),
      create: (input) => ({
        id: 'doc-created',
        ...input,
        tags: input.tags ?? [],
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z',
      }),
      update: (id, input) => {
        const existing = cloneSeededDocuments().find((document) => document.id === id);
        return existing
          ? {
              ...existing,
              ...input,
              updatedAt: '2025-01-11T10:00:00.000Z',
            }
          : undefined;
      },
    }, {
      listFindings: () => cloneSeededFindings(),
      listTraceEvents: () => cloneSeededTraceEvents(),
      listChatMessages: () => cloneSeededChatMessages(),
      createChatMessage: () => cloneSeededChatMessages().slice(0, 2),
    });

    const createResponse = await request(app).post('/api/documents').send({
      type: 'wiki',
      title: 'API-created document',
      summary: 'Created from a test.',
      content: 'Document body',
      status: 'active',
      ownerId: 'person-test',
      tags: ['api'],
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.id).toBe('doc-created');

    const fetchResponse = await request(app).get('/api/documents/doc-program-alpha');
    expect(fetchResponse.status).toBe(200);
    expect(fetchResponse.body.title).toBe('Program Alpha');

    const updateResponse = await request(app)
      .patch('/api/documents/doc-program-alpha')
      .send({ status: 'archived' });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.status).toBe('archived');
  });

  it('serves findings, trace events, and chat exchanges for a document', async () => {
    const app = createApp();

    const findingsResponse = await request(app).get('/api/documents/doc-program-alpha/findings');
    expect(findingsResponse.status).toBe(200);
    expect(findingsResponse.body.total).toBeGreaterThan(0);
    expect(findingsResponse.body.findings[0].severity).toBe('high');

    const traceResponse = await request(app).get('/api/documents/doc-program-alpha/trace');
    expect(traceResponse.status).toBe(200);
    expect(traceResponse.body.total).toBeGreaterThan(0);
    expect(traceResponse.body.events[0].documentId).toBe('doc-program-alpha');

    const chatResponse = await request(app).get('/api/documents/doc-program-alpha/chat');
    expect(chatResponse.status).toBe(200);
    expect(chatResponse.body.total).toBeGreaterThan(0);
    expect(chatResponse.body.messages[0].documentId).toBe('doc-program-alpha');
  });

  it('creates parity chat messages and rejects invalid payloads', async () => {
    const app = createApp();

    const createChatResponse = await request(app)
      .post('/api/documents/doc-program-alpha/chat')
      .send({ content: 'What is the next risk to address?' });
    expect(createChatResponse.status).toBe(201);
    expect(createChatResponse.body.total).toBe(2);
    expect(createChatResponse.body.messages[1].role).toBe('assistant');

    const invalidCreate = await request(app).post('/api/documents').send({ title: 'Incomplete' });
    expect(invalidCreate.status).toBe(400);

    const missingFetch = await request(app).get('/api/documents/missing-id');
    expect(missingFetch.status).toBe(404);

    const invalidPatch = await request(app).patch('/api/documents/doc-program-alpha').send({});
    expect(invalidPatch.status).toBe(400);

    const invalidChat = await request(app).post('/api/documents/doc-program-alpha/chat').send({ content: '' });
    expect(invalidChat.status).toBe(400);
  });
});
