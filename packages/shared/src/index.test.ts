import { describe, expect, it } from 'vitest';
import {
  chatMessageSchema,
  createChatMessageInputSchema,
  createDocumentInputSchema,
  documentSchema,
  documentTypeSchema,
  findingSchema,
  seededChatMessages,
  seededDocuments,
  seededFindings,
  seededTraceEvents,
  superShipPrinciples,
  traceEventSchema,
  updateDocumentInputSchema,
} from './index';

describe('shared model primitives', () => {
  it('defines the canonical document types', () => {
    expect(documentTypeSchema.options).toContain('wiki');
    expect(documentTypeSchema.options).toContain('weekly_retro');
    expect(documentTypeSchema.options).toHaveLength(9);
  });

  it('preserves the core supership principles', () => {
    expect(superShipPrinciples.everythingIsADocument).toBe(true);
    expect(superShipPrinciples.serverIsSourceOfTruth).toBe(true);
  });

  it('validates seeded documents against the canonical schema', () => {
    expect(seededDocuments).toHaveLength(3);
    expect(() => seededDocuments.forEach((document) => documentSchema.parse(document))).not.toThrow();
  });

  it('accepts complete create payloads and rejects empty updates', () => {
    const createPayload = {
      type: 'wiki',
      title: 'Architecture notes',
      summary: 'Notes captured during implementation.',
      content: 'Everything is a document.',
      status: 'active',
      ownerId: 'person-ava',
      tags: ['notes'],
    };

    expect(createDocumentInputSchema.parse(createPayload).title).toBe('Architecture notes');
    expect(() => updateDocumentInputSchema.parse({})).toThrow();
    expect(updateDocumentInputSchema.parse({ title: 'Updated title' }).title).toBe('Updated title');
  });

  it('validates seeded findings, trace events, and chat messages', () => {
    expect(seededFindings).toHaveLength(3);
    expect(seededTraceEvents.length).toBeGreaterThan(0);
    expect(seededChatMessages.length).toBeGreaterThan(0);
    expect(() => seededFindings.forEach((finding) => findingSchema.parse(finding))).not.toThrow();
    expect(() => seededTraceEvents.forEach((event) => traceEventSchema.parse(event))).not.toThrow();
    expect(() => seededChatMessages.forEach((message) => chatMessageSchema.parse(message))).not.toThrow();
  });

  it('accepts chat prompts for parity assistance', () => {
    expect(createChatMessageInputSchema.parse({ documentId: 'doc-program-alpha', content: 'Summarize the risk.' }).content).toBe('Summarize the risk.');
  });
});
