import React from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentApp } from './main';

const originalFetch = global.fetch;

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>';
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

async function renderApp() {
  const container = document.getElementById('root')!;
  await act(async () => {
    ReactDOM.createRoot(container).render(<DocumentApp />);
  });
}

async function clickByText(text: string) {
  const button = Array.from(document.querySelectorAll('button')).find((element) => element.textContent === text);
  if (!button) {
    throw new Error(`Button not found: ${text}`);
  }

  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

async function setInputValue(selector: string, value: string) {
  const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }

  await act(async () => {
    const descriptor = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value');
    descriptor?.set?.call(element, value);
    element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
}

describe('web core frontend', () => {
  it('renders the dashboard shell when the api is unavailable', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline')) as typeof fetch;

    await renderApp();

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('SuperShip core frontend');
      expect(document.body.textContent).toContain('Portfolio mix');
      expect(document.body.textContent).toContain('API unavailable');
    });
  });

  it('filters document explorer content by type and search term', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline')) as typeof fetch;

    await renderApp();
    await clickByText('Documents');

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('Document list');
      expect(document.body.textContent).toContain('3 matching documents');
    });

    await setInputValue('select[aria-label="Filter by document type"]', 'weekly_plan');

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('1 matching documents');
      expect(document.body.textContent).toContain('Week 1 plan');
    });

    await setInputValue('input[aria-label="Search documents"]', 'week 1');

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('1 matching documents');
    });
  });

  it('creates and updates documents through the editor using local fallback behavior', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline')) as typeof fetch;

    await renderApp();
    await clickByText('Draft a document');

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('Create document');
    });

    await setInputValue('input[aria-label="Document title"]', 'Frontend-authored note');
    await setInputValue('input[aria-label="Document summary"]', 'Created from the editor.');
    await setInputValue('textarea[aria-label="Document content"]', 'Editor content body');
    await clickByText('Save new document');

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('Frontend-authored note');
      expect(document.body.textContent).toContain('Added local draft document');
    });

    await clickByText('Edit selected document');

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('Edit Frontend-authored note');
    });

    await setInputValue('input[aria-label="Document title"]', 'Frontend-edited note');
    await clickByText('Save document changes');

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('Frontend-edited note');
      expect(document.body.textContent).toContain('Saved local edits');
    });
  });
});
